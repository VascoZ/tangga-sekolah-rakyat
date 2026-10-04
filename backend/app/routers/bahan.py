"""
Bahan Ajar Router - API endpoints for generating differentiated materials
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, List, Optional
import json
import httpx

from app.database import get_db
from app.config import settings
from app.models import BahanAjar
from app.schemas import BahanAjarGenerate, BahanAjarResponse, BahanPerTingkat
from app.tangga.definisi import TANGGA_LITERASI, TANGGA_NUMERASI

router = APIRouter()

JENIS_VALID = ("LITERASI", "NUMERASI")

# Template bahan ajar fallback (tanpa AI)
TEMPLATE_LITERASI = {
    0: {
        "instruksi_guru": "Tunjukkan kartu huruf satu per satu. Minta siswa menyebutkan nama huruf.",
        "konten": ["A", "B", "C", "D", "I"],
        "latihan": "Gunakan kartu huruf besar dengan gambar benda yang diawali huruf tersebut.",
    },
    1: {
        "instruksi_guru": "Minta siswa menebalkan huruf di lembar kerja.",
        "konten": ["A", "B", "C", "D", "E"],
        "latihan": "Tebalkan huruf dengan pensil, lalu warnai.",
    },
    2: {
        "instruksi_guru": "Bacakan suku kata, minta siswa mengulangi.",
        "konten": ["BA", "BI", "BU", "BE", "BO", "CA", "CI", "CU", "CE", "CO"],
        "latihan": "Gunting dan tempel suku kata untuk membentuk kata.",
    },
    3: {
        "instruksi_guru": "Tunjukkan kartu kata satu per satu. Minta siswa membaca dengan lantang.",
        "konten": ["RUMAH", "JALAN", "POHON", "SUNGAI", "SAWAH"],
        "latihan": "Jika siswa kesulitan, kembali ke suku kata: ru-mah, ja-lan.",
    },
    4: {
        "instruksi_guru": "Tunjukkan kalimat. Minta siswa membaca dengan lantang.",
        "konten": [
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
        "konten": "Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.",
        "latihan": "Baca paragraf dengan lancar dan intonasi yang tepat.",
    },
    6: {
        "instruksi_guru": "Setelah membaca paragraf, tanyakan pertanyaan berikut.",
        "konten": [
            {"tanya": "Siapa yang pergi ke sekolah?", "jawaban": "Budi"},
            {"tanya": "Apa yang mereka lihat di jalan?", "jawaban": "pohon dan bunga"},
            {"tanya": "Mengapa Budi senang?", "jawaban": "karena hari cerah"},
        ],
        "latihan": "",
    },
}

TEMPLATE_NUMERASI = {
    0: {
        "instruksi_guru": "Tunjukkan kartu bilangan 1-5 satu per satu, minta siswa menyebutkan bilangannya.",
        "konten": ["1", "2", "3", "4", "5"],
        "latihan": "Ajak siswa menghitung benda di sekitar kelas sambil menunjuk satu per satu.",
    },
    1: {
        "instruksi_guru": "Minta siswa menunjuk kartu bilangan yang disebut guru.",
        "konten": ["6", "2", "9", "4", "7"],
        "latihan": "Susun kartu bilangan dari yang terkecil ke yang terbesar.",
    },
    2: {
        "instruksi_guru": "Minta siswa membilang puluhan lalu membandingkan dua bilangan, mana yang lebih besar.",
        "konten": ["12", "25", "38", "47", "60"],
        "latihan": "Gunakan batang lidi: 1 ikat berisi 10 batang.",
    },
    3: {
        "instruksi_guru": "Bacakan soal penjumlahan dan pengurangan, minta siswa menjawab sambil menghitung.",
        "konten": ["5 + 3 = ?", "9 - 4 = ?", "7 + 6 = ?", "12 - 5 = ?", "8 + 8 = ?"],
        "latihan": "Gunakan benda konkret (kancing, batu) untuk memperagakan penjumlahan.",
    },
    4: {
        "instruksi_guru": "Bacakan soal perkalian dan pembagian, minta siswa menjawab dengan kelompok benda.",
        "konten": ["3 × 4 = ?", "2 × 5 = ?", "12 : 3 = ?", "20 : 4 = ?", "6 × 3 = ?"],
        "latihan": "Susun benda dalam kelompok yang sama banyak untuk memperagakan perkalian.",
    },
    5: {
        "instruksi_guru": "Bacakan soal cerita, minta siswa menentukan operasi yang tepat sebelum menghitung.",
        "konten": [
            {"tanya": "Ani punya 8 permen. Ia memberi 3 permen kepada adiknya. Berapa permen Ani sekarang?", "jawaban": "5"},
            {"tanya": "Ada 4 kotak, tiap kotak berisi 5 pensil. Berapa jumlah pensil?", "jawaban": "20"},
            {"tanya": "Budi membeli 2 buku seharga 6.000 rupiah per buku. Berapa uang yang dibayar?", "jawaban": "12.000"},
        ],
        "latihan": "Minta siswa menggambar cerita dulu, lalu tentukan operasi yang dipakai.",
    },
}


def _template_for(jenis: str) -> dict:
    return TEMPLATE_NUMERASI if jenis == "NUMERASI" else TEMPLATE_LITERASI


def _tangga_for(jenis: str) -> list:
    return TANGGA_NUMERASI if jenis == "NUMERASI" else TANGGA_LITERASI


def generate_bahan_ai(tema: str, tingkat: int, jenis: str = "LITERASI") -> dict:
    """Template fallback bahan ajar untuk satu tingkat (dipakai bila Gemini tidak tersedia)."""
    tangga = _tangga_for(jenis)
    template = _template_for(jenis).get(tingkat, {})
    return {
        "tingkat": tingkat,
        "label": tangga[tingkat]["label"] if tingkat < len(tangga) else "",
        "tema": tema,
        "instruksi_guru": template.get("instruksi_guru", ""),
        "konten": template.get("konten", ""),
        "latihan": template.get("latihan", ""),
    }


def _konten_shape_valid(jenis: str, tingkat: int, entry: dict) -> bool:
    """Sanity-check one tingkat's Gemini output before trusting it, so a
    malformed entry falls back to the template instead of breaking the page."""
    if not isinstance(entry, dict):
        return False
    if not all(k in entry for k in ("instruksi_guru", "konten", "latihan")):
        return False
    konten = entry["konten"]

    qa_list = lambda: (
        isinstance(konten, list) and len(konten) > 0
        and all(isinstance(q, dict) and q.get("tanya") and q.get("jawaban") for q in konten)
    )
    str_list = lambda: isinstance(konten, list) and len(konten) > 0 and all(isinstance(x, str) for x in konten)

    if jenis == "NUMERASI":
        return qa_list() if tingkat == 5 else str_list()
    if tingkat == 5:
        return isinstance(konten, str) and bool(konten.strip())
    if tingkat == 6:
        return qa_list()
    return str_list()


def _prompt_bahan(tema: str, jenis: str, tingkat_list: List[int]) -> str:
    tangga = _tangga_for(jenis)
    tingkat_info = "\n".join(
        f"- {t}: {tangga[t]['label']} — {tangga[t]['deskripsi']}" for t in tingkat_list
    )
    tingkat_list_str = ", ".join(str(t) for t in tingkat_list)

    if jenis == "NUMERASI":
        aturan = """\
- Tingkat 0: daftar 5 lambang bilangan 1-5 (bentuk: ["1", "2", "3", "4", "5"]). \
instruksi_guru boleh menyinggung tema untuk benda yang dihitung.
- Tingkat 1: daftar 5 lambang bilangan 1-9 (bentuk: ["6", "2", "9", "4", "7"]).
- Tingkat 2: daftar 5 bilangan dua digit (10-99) yang bisa dibandingkan, terkait tema bila relevan.
- Tingkat 3: daftar 5 soal penjumlahan/pengurangan berbentuk string, misal "5 + 3 = ?".
- Tingkat 4: daftar 5 soal perkalian/pembagian berbentuk string, misal "3 × 4 = ?".
- Tingkat 5: daftar 3 objek {"tanya": "...", "jawaban": "..."}, masing-masing soal cerita \
sederhana yang BENAR-BENAR terjadi dalam konteks tema, dengan jawaban angka."""
        konsep = "numerasi berdiferensiasi"
    else:
        aturan = """\
- Tingkat 0-1: daftar 5 huruf tunggal, contoh bentuk: ["A", "B", "C", "D", "E"]. \
instruksi_guru boleh menyinggung tema untuk kata contoh, tapi konten tetap huruf.
- Tingkat 2: daftar 5-8 suku kata pendek terkait tema.
- Tingkat 3: daftar 5 kata utuh terkait tema.
- Tingkat 4: daftar 5 kalimat pendek (4-6 kata) terkait tema.
- Tingkat 5: SATU string berisi 1 paragraf pendek (3-5 kalimat) terkait tema, \
bahasa sederhana.
- Tingkat 6: daftar 3 objek {"tanya": "...", "jawaban": "..."}, pertanyaan \
pemahaman atas sebuah bacaan singkat tentang tema tersebut."""
        konsep = "literasi berdiferensiasi"

    return f"""\
Anda membuat bahan ajar {konsep} dengan tema "{tema}" untuk program Sekolah Rakyat \
(siswa SMA yang masih belajar dari nol). Tingkat yang diminta:
{tingkat_info}

Semua konten HARUS terkait nyata dengan tema "{tema}" (bukan tema lain), \
dalam Bahasa Indonesia, dan mengikuti aturan bentuk per tingkat:
{aturan}

Balas HANYA dengan JSON valid (tanpa markdown, tanpa code fence), formatnya:
{{
  "<tingkat>": {{"instruksi_guru": "1 kalimat instruksi untuk guru", "konten": <sesuai aturan di atas>, "latihan": "1 kalimat ide latihan tambahan"}}
}}

Sertakan HANYA tingkat berikut: {tingkat_list_str}.\
"""


async def generate_bahan_ai_gemini(tema: str, jenis: str, tingkat_list: List[int]) -> Optional[Dict[int, dict]]:
    """
    Real generation via Gemini so content actually reflects the theme a
    teacher types in. Returns None (whole batch) on any failure so the caller
    falls back to the template; individual malformed entries fall back per tingkat.
    """
    if not settings.GEMINI_API_KEY:
        return None

    prompt = _prompt_bahan(tema, jenis, tingkat_list)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent",
                headers={"x-goog-api-key": settings.GEMINI_API_KEY},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"thinkingConfig": {"thinkingBudget": 512}},
                },
            )
        if resp.status_code != 200:
            print(f"[gemini] bahan/generate failed: {resp.status_code} {resp.text[:500]}")
            return None
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        parsed = json.loads(text)
    except Exception as e:
        print(f"[gemini] bahan/generate exception: {e!r}")
        return None

    tangga = _tangga_for(jenis)
    hasil: Dict[int, dict] = {}
    for tingkat in tingkat_list:
        entry = parsed.get(str(tingkat))
        if _konten_shape_valid(jenis, tingkat, entry):
            hasil[tingkat] = {
                "tingkat": tingkat,
                "label": tangga[tingkat]["label"] if tingkat < len(tangga) else "",
                "tema": tema,
                "instruksi_guru": entry["instruksi_guru"],
                "konten": entry["konten"],
                "latihan": entry["latihan"],
            }
    return hasil


@router.post("/generate", response_model=BahanPerTingkat)
async def generate_bahan(
    data: BahanAjarGenerate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate bahan ajar untuk satu tema dan satu jenis (literasi/numerasi), semua
    tingkat - dan simpan (upsert per tema+jenis+tingkat+kelas) supaya /list dan
    /{id} benar-benar mengembalikannya nanti.
    """
    if data.jenis not in JENIS_VALID:
        raise HTTPException(status_code=400, detail="Jenis harus LITERASI atau NUMERASI")

    max_tingkat = len(_tangga_for(data.jenis)) - 1
    tingkat_list = data.tingkat if data.tingkat else list(range(max_tingkat + 1))
    tingkat_list = [t for t in tingkat_list if 0 <= t <= max_tingkat]

    gemini_hasil = await generate_bahan_ai_gemini(data.tema, data.jenis, tingkat_list) or {}

    bahan = {}
    for tingkat in tingkat_list:
        konten = gemini_hasil.get(tingkat) or generate_bahan_ai(data.tema, tingkat, data.jenis)
        bahan[f"tingkat_{tingkat}"] = konten

        result = await db.execute(
            select(BahanAjar).where(
                BahanAjar.tema == data.tema,
                BahanAjar.jenis == data.jenis,
                BahanAjar.tingkat == tingkat,
                BahanAjar.kelas_id == data.kelas_id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.konten_json = konten
        else:
            db.add(BahanAjar(tema=data.tema, jenis=data.jenis, tingkat=tingkat, konten_json=konten, kelas_id=data.kelas_id))

    await db.commit()

    return BahanPerTingkat(
        tema=data.tema,
        bahan=bahan,
    )


@router.get("/temas", response_model=List[str])
async def list_temas(
    kelas_id: Optional[int] = None,
    jenis: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Daftar nama tema unik yang sudah pernah dibuat, untuk selector tema."""
    query = select(BahanAjar.tema).distinct()
    if kelas_id:
        query = query.where(BahanAjar.kelas_id == kelas_id)
    if jenis:
        query = query.where(BahanAjar.jenis == jenis)
    result = await db.execute(query.order_by(BahanAjar.tema))
    return list(result.scalars().all())


@router.get("/list", response_model=List[BahanAjarResponse])
async def list_bahan(
    guru_id: Optional[int] = None,
    kelas_id: Optional[int] = None,
    tema: Optional[str] = None,
    jenis: Optional[str] = None,
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
    if jenis:
        query = query.where(BahanAjar.jenis == jenis)

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
