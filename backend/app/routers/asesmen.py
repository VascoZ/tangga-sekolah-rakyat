"""
Asesmen Router - API endpoints for assessment

State lives entirely in Postgres (AsesmenSiswa + JawabanItem), not in an
in-memory dict: a serverless deployment may run each request on a fresh
process, so anything held only in a Python dict is invisible to the next
request. To evaluate "has this level's 5 questions passed or failed", the
adaptive algorithm's state is replayed from the JawabanItem rows recorded
so far for this asesmen_id - cheap (at most ~35 rows for a full run) and
makes every request self-contained.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime

from app.database import get_db
from app.models import AsesmenSiswa, JawabanItem, Siswa, PosisiTangga, RiwayatTangga, PenandaStagnasi
from app.schemas import AsesmenMulai, AsesmenJawab
from app.tangga.definisi import get_tangga_label
from app.tangga.penempatan import AsesmenAdaptif
from app.tangga.butir_asesmen import generate_asesmen_items, get_items_for_tingkat

router = APIRouter()


async def _replay_adaptif(db: AsyncSession, asesmen: AsesmenSiswa) -> AsesmenAdaptif:
    """Reconstruct adaptive-assessment state from the JawabanItem rows recorded so far."""
    adaptif = AsesmenAdaptif(jenis=asesmen.jenis, tingkat_awal=asesmen.tangga_awal or 0)
    adaptif.mulai_dari_tingkat(asesmen.tangga_awal or 0)

    result = await db.execute(
        select(JawabanItem)
        .where(JawabanItem.asesmen_id == asesmen.id)
        .order_by(JawabanItem.id)
    )
    for row in result.scalars().all():
        adaptif.catat_jawaban(row.item_ke, row.tingkatan, row.jawaban)
        if len(adaptif.jawaban_per_tingkat.get(row.tingkatan, [])) >= 5 and row.tingkatan == adaptif.tingkat_saat_ini:
            adaptif.tentukan_langkah_selanjutnya()

    return adaptif


async def _terapkan_hasil_asesmen(
    db: AsyncSession,
    asesmen: AsesmenSiswa,
    hasil_tingkat: int,
):
    """Persist the outcome of a completed assessment: position, history, stagnation."""
    field_tangga = "tangga_literasi" if asesmen.jenis == "LITERASI" else "tangga_numerasi"
    field_tgl = "tgl_terakhir_literasi" if asesmen.jenis == "LITERASI" else "tgl_terakhir_numerasi"
    field_pekan = "pekan_ke_literasi" if asesmen.jenis == "LITERASI" else "pekan_ke_numerasi"

    result = await db.execute(select(PosisiTangga).where(PosisiTangga.siswa_id == asesmen.siswa_id))
    posisi = result.scalar_one_or_none()

    tangga_sebelumnya = getattr(posisi, field_tangga) if posisi else None
    tgl_sebelumnya = getattr(posisi, field_tgl) if posisi else None
    lama_hari = (datetime.utcnow() - tgl_sebelumnya).days if tgl_sebelumnya else 0

    if tangga_sebelumnya is not None and tangga_sebelumnya == hasil_tingkat:
        pekan_baru = (getattr(posisi, field_pekan) or 0) + 1
    else:
        pekan_baru = 1

    if posisi is None:
        posisi = PosisiTangga(siswa_id=asesmen.siswa_id)
        db.add(posisi)

    setattr(posisi, field_tangga, hasil_tingkat)
    setattr(posisi, field_tgl, datetime.utcnow())
    setattr(posisi, field_pekan, pekan_baru)

    db.add(RiwayatTangga(
        siswa_id=asesmen.siswa_id,
        jenis=asesmen.jenis,
        tangga_awal=tangga_sebelumnya if tangga_sebelumnya is not None else (asesmen.tangga_awal or 0),
        tangga_akhir=hasil_tingkat,
        asesmen_id=asesmen.id,
        lama_hari=lama_hari,
    ))

    # Stagnation: no movement for 3+ "weeks" (assessment rounds) -> flag; movement -> resolve.
    result = await db.execute(
        select(PenandaStagnasi).where(
            PenandaStagnasi.siswa_id == asesmen.siswa_id,
            PenandaStagnasi.jenis == asesmen.jenis,
            PenandaStagnasi.status == "aktif",
        )
    )
    penanda_aktif = result.scalar_one_or_none()

    if tangga_sebelumnya is not None and tangga_sebelumnya == hasil_tingkat and pekan_baru >= 3:
        level = "BERAT" if pekan_baru >= 5 else "SEDANG"
        if penanda_aktif:
            penanda_aktif.pekan_stagnan = pekan_baru
            penanda_aktif.level = level
        else:
            db.add(PenandaStagnasi(
                siswa_id=asesmen.siswa_id,
                jenis=asesmen.jenis,
                pekan_stagnan=pekan_baru,
                level=level,
                status="aktif",
            ))
    elif penanda_aktif:
        penanda_aktif.status = "selesai"


@router.post("/mulai", response_model=dict)
async def mulai_asesmen(
    data: AsesmenMulai,
    db: AsyncSession = Depends(get_db),
):
    """Memulai sesi asesmen baru. Mengembalikan asesmen_id dan item-item pertama."""
    result = await db.execute(select(Siswa).where(Siswa.id == data.siswa_id))
    siswa = result.scalar_one_or_none()
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")

    # Abandon any assessment of this type still marked in-progress for this student.
    await db.execute(
        update(AsesmenSiswa)
        .where(
            AsesmenSiswa.siswa_id == data.siswa_id,
            AsesmenSiswa.jenis == data.jenis.value,
            AsesmenSiswa.status == "berlangsung",
        )
        .values(status="terputus")
    )

    result = await db.execute(select(PosisiTangga).where(PosisiTangga.siswa_id == data.siswa_id))
    posisi = result.scalar_one_or_none()
    tingkat_terakhir = None
    if posisi:
        tingkat_terakhir = posisi.tangga_literasi if data.jenis.value == "LITERASI" else posisi.tangga_numerasi

    adaptif = AsesmenAdaptif(jenis=data.jenis.value, tingkat_awal=tingkat_terakhir or 0)
    tingkat_awal = adaptif.mulai_dari_tingkat(tingkat_terakhir or 0)

    items = generate_asesmen_items(data.jenis.value, tingkat_awal, jumlah=5)

    asesmen = AsesmenSiswa(
        siswa_id=data.siswa_id,
        jenis=data.jenis.value,
        tangga_awal=tingkat_awal,
        status="berlangsung",
    )
    db.add(asesmen)
    await db.commit()
    await db.refresh(asesmen)

    return {
        "asesmen_id": asesmen.id,
        "siswa_id": data.siswa_id,
        "jenis": data.jenis.value,
        "tingkat_awal": tingkat_awal,
        "tingkat_label": get_tangga_label(data.jenis.value, tingkat_awal),
        "items": items,
        "item_ke": 0,
        "total_items": len(items),
        "instruksi_guru": get_items_for_tingkat(data.jenis.value, tingkat_awal).get("instruksi_guru", ""),
    }


@router.post("/jawab", response_model=dict)
async def jawab_item(
    data: AsesmenJawab,
    db: AsyncSession = Depends(get_db),
):
    """Merekam jawaban untuk satu item dan menentukan langkah selanjutnya."""
    result = await db.execute(select(AsesmenSiswa).where(AsesmenSiswa.id == data.asesmen_id))
    asesmen = result.scalar_one_or_none()
    if not asesmen:
        raise HTTPException(status_code=404, detail="Sesi asesmen tidak ditemukan")
    if asesmen.status != "berlangsung":
        raise HTTPException(status_code=400, detail="Asesmen sudah selesai")

    adaptif = await _replay_adaptif(db, asesmen)
    tingkat_saat_ini = adaptif.tingkat_saat_ini

    db.add(JawabanItem(
        asesmen_id=asesmen.id,
        item_ke=data.item_ke,
        tingkatan=tingkat_saat_ini,
        jenis_kemampuan=get_tangga_label(asesmen.jenis, tingkat_saat_ini),
        jawaban=data.jawaban,
        jawaban_siswa=data.jawaban_siswa,
    ))
    adaptif.catat_jawaban(data.item_ke, tingkat_saat_ini, data.jawaban)

    jawaban_di_tingkat = adaptif.jawaban_per_tingkat.get(tingkat_saat_ini, [])

    if len(jawaban_di_tingkat) >= 5:
        langkah = adaptif.tentukan_langkah_selanjutnya()

        if langkah["aksi"] == "selesai":
            asesmen.status = "selesai"
            asesmen.tangga_hasil = langkah["hasil"]
            asesmen.durasi_detik = int((datetime.utcnow() - asesmen.tgl_asesmen.replace(tzinfo=None)).total_seconds())

            await _terapkan_hasil_asesmen(db, asesmen, langkah["hasil"])
            await db.commit()

            return {
                "status": "selesai",
                "hasil": {
                    "tingkat_hasil": langkah["hasil"],
                    "tingkat_label": get_tangga_label(asesmen.jenis, langkah["hasil"]),
                    "naik_tingkat": langkah["hasil"] - asesmen.tangga_awal,
                    "durasi_detik": asesmen.durasi_detik,
                    "pesan": langkah["pesan"],
                },
            }

        elif langkah["aksi"] in ("naik", "turun"):
            tingkat_baru = langkah["tingkat_berikutnya"]
            items_baru = generate_asesmen_items(asesmen.jenis, tingkat_baru, jumlah=5)
            await db.commit()

            return {
                "status": "lanjut_tingkat",
                "tingkat_baru": tingkat_baru,
                "tingkat_label": get_tangga_label(asesmen.jenis, tingkat_baru),
                "items": items_baru,
                "instruksi_guru": get_items_for_tingkat(asesmen.jenis, tingkat_baru).get("instruksi_guru", ""),
                "pesan": langkah["pesan"],
            }

    await db.commit()
    return {
        "status": "lanjut",
        "item_ke": data.item_ke + 1,
        "progress": f"{data.item_ke + 2}/5",
    }


@router.get("/{asesmen_id}", response_model=dict)
async def get_asesmen(
    asesmen_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Mendapatkan detail asesmen, termasuk rincian jawaban per tingkat."""
    result = await db.execute(select(AsesmenSiswa).where(AsesmenSiswa.id == asesmen_id))
    asesmen = result.scalar_one_or_none()
    if not asesmen:
        raise HTTPException(status_code=404, detail="Asesmen tidak ditemukan")

    result = await db.execute(
        select(JawabanItem)
        .where(JawabanItem.asesmen_id == asesmen_id)
        .order_by(JawabanItem.id)
    )
    detail = [
        {"tingkat": row.tingkatan, "item_ke": row.item_ke, "benar": row.jawaban}
        for row in result.scalars().all()
    ]

    return {
        "asesmen_id": asesmen.id,
        "siswa_id": asesmen.siswa_id,
        "jenis": asesmen.jenis,
        "tangga_awal": asesmen.tangga_awal,
        "tangga_hasil": asesmen.tangga_hasil,
        "status": asesmen.status,
        "durasi_detik": asesmen.durasi_detik,
        "detail": detail,
    }


@router.get("/siswa/{siswa_id}", response_model=dict)
async def get_asesmen_siswa(
    siswa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Mendapatkan riwayat asesmen terakhir seorang siswa."""
    result = await db.execute(
        select(AsesmenSiswa)
        .where(AsesmenSiswa.siswa_id == siswa_id, AsesmenSiswa.status == "selesai")
        .order_by(AsesmenSiswa.tgl_asesmen.desc())
    )
    terakhir = result.scalars().first()

    if terakhir:
        return {
            "siswa_id": siswa_id,
            "asesmen_terakhir": {
                "jenis": terakhir.jenis,
                "tingkat_hasil": terakhir.tangga_hasil,
                "tingkat_label": get_tangga_label(terakhir.jenis, terakhir.tangga_hasil),
                "durasi_detik": terakhir.durasi_detik,
            },
        }

    return {"siswa_id": siswa_id, "asesmen_terakhir": None}
