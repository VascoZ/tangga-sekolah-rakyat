"""
Bahan Ajar Router - API endpoints for generating differentiated materials
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json

from app.database import get_db
from app.models import BahanAjar, Guru, Kelas
from app.schemas import BahanAjarGenerate, BahanAjarResponse, BahanPerTingkat
from app.tangga.definisi import TANGGA_LITERASI

router = APIRouter()

# Template bahan ajar fallback (tanpa AI)
TEMPLATE_BAHAN = {
    0: {
        "instruksi_guru": "Tunjukkan kartu huruf satu per satu. Minta siswa menyebutkan nama huruf.",
        "kartu": ["A", "B", "C", "D", "I"],
        "latihan": "Gunakan kartu huruf besar dengan gambar benda yang diawali huruf tersebut.",
    },
    1: {
        "instruksi_guru": "Minta siswa menebalkan huruf di lembar kerja.",
        "lembar_kerja": ["A", "B", "C", "D", "E"],
        "latihan": "Tebalkan huruf dengan pensil, lalu warnai.",
    },
    2: {
        "instruksi_guru": "Bacakan suku kata, minta siswa mengulangi.",
        "kartu": ["BA", "BI", "BU", "BE", "BO", "CA", "CI", "CU", "CE", "CO"],
        "latihan": "Gunting dan tempel suku kata untuk membentuk kata.",
    },
    3: {
        "instruksi_guru": "Tunjukkan kartu kata satu per satu. Minta siswa membaca dengan lantang.",
        "kartu": ["RUMAH", "JALAN", "POHON", "SUNGAI", "SAWAH"],
        "latihan": "Jika siswa kesulitan, kembali ke suku kata: ru-mah, ja-lan.",
    },
    4: {
        "instruksi_guru": "Tunjukkan kalimat. Minta siswa membaca dengan lantang.",
        "kalimat": [
            "Ibu pergi ke pasar",
            "Adik bermain bola",
            "Ayah membaca koran",
            "Kakak menyapu halaman",
            "Nenek duduk di kursi",
        ],
        "latihan": "Baca kalimat dengan intonasi yang tepat.",
    },
    5: {
        "instruksi_guru": "Minta siswa membaca paragraf dengan lancar.",
        "teks": "Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.",
        "latihan": "Baca paragraf dengan lancar dan intonasi yang tepat.",
    },
    6: {
        "instruksi_guru": "Setelah membaca paragraf, tanyakan pertanyaan berikut.",
        "teks": "Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.",
        "pertanyaan": [
            {"tanya": "Siapa yang pergi ke sekolah?", "jawaban": "Budi"},
            {"tanya": "Apa yang mereka lihat di jalan?", "jawaban": "pohon dan bunga"},
            {"tanya": "Mengapa Budi senang?", "jawaban": "karena hari cerah"},
        ],
    },
}


def generate_bahan_ai(tema: str, tingkat: int) -> dict:
    """
    Generate bahan ajar menggunakan AI (placeholder - implement with OpenAI).
    Untuk MVP, gunakan template.
    """
    # TODO: Implement actual AI generation with OpenAI
    # For now, return template with theme context
    
    template = TEMPLATE_BAHAN.get(tingkat, {})

    # Priority matters: tingkat 6 has both "teks" (the passage) and "pertanyaan"
    # (the actual comprehension questions to ask) - falling through to "teks"
    # first silently dropped the questions and showed the passage twice.
    if "pertanyaan" in template:
        konten_isi = template["pertanyaan"]
    elif "kartu" in template:
        konten_isi = template["kartu"]
    elif "kalimat" in template:
        konten_isi = template["kalimat"]
    else:
        konten_isi = template.get("teks", "")

    # Customize with theme
    konten = {
        "tingkat": tingkat,
        "label": TANGGA_LITERASI[tingkat]["label"] if tingkat < len(TANGGA_LITERASI) else "",
        "tema": tema,
        "instruksi_guru": template.get("instruksi_guru", ""),
        "konten": konten_isi,
        "latihan": template.get("latihan", ""),
    }

    return konten


@router.post("/generate", response_model=BahanPerTingkat)
async def generate_bahan(
    data: BahanAjarGenerate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate bahan ajar untuk satu tema, semua tingkat - dan simpan (upsert per
    tema+tingkat+kelas) supaya /list dan /{id} benar-benar mengembalikannya nanti.
    """
    tingkat_list = data.tingkat if data.tingkat else list(range(7))

    bahan = {}
    for tingkat in tingkat_list:
        konten = generate_bahan_ai(data.tema, tingkat)
        bahan[f"tingkat_{tingkat}"] = konten

        result = await db.execute(
            select(BahanAjar).where(
                BahanAjar.tema == data.tema,
                BahanAjar.tingkat == tingkat,
                BahanAjar.kelas_id == data.kelas_id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.konten_json = konten
        else:
            db.add(BahanAjar(tema=data.tema, tingkat=tingkat, konten_json=konten, kelas_id=data.kelas_id))

    await db.commit()

    return BahanPerTingkat(
        tema=data.tema,
        bahan=bahan,
    )


@router.get("/temas", response_model=List[str])
async def list_temas(
    kelas_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Daftar nama tema unik yang sudah pernah dibuat, untuk selector tema."""
    query = select(BahanAjar.tema).distinct()
    if kelas_id:
        query = query.where(BahanAjar.kelas_id == kelas_id)
    result = await db.execute(query.order_by(BahanAjar.tema))
    return list(result.scalars().all())


@router.get("/list", response_model=List[BahanAjarResponse])
async def list_bahan(
    guru_id: Optional[int] = None,
    kelas_id: Optional[int] = None,
    tema: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan daftar bahan ajar yang sudah dibuat.
    """
    query = select(BahanAjar)

    if guru_id:
        query = query.where(BahanAjar.dibuat_oleh == guru_id)
    if kelas_id:
        query = query.where(BahanAjar.kelas_id == kelas_id)
    if tema:
        query = query.where(BahanAjar.tema.ilike(f"%{tema}%"))

    result = await db.execute(query.order_by(BahanAjar.tingkat))
    bahan_list = result.scalars().all()

    return bahan_list


@router.get("/{bahan_id}", response_model=BahanAjarResponse)
async def get_bahan(
    bahan_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan detail satu bahan ajar.
    """
    result = await db.execute(select(BahanAjar).where(BahanAjar.id == bahan_id))
    bahan = result.scalar_one_or_none()
    
    if not bahan:
        raise HTTPException(status_code=404, detail="Bahan ajar tidak ditemukan")
    
    return bahan