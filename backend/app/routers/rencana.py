"""
Rencana Pendampingan Router - API endpoints for individual learning plans
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.database import get_db
from app.models import RencanaPendampingan, Siswa, PosisiTangga
from app.schemas import RencanaGenerate, RencanaPendampinganResponse, KegiatanHarian
from app.tangga.definisi import get_tangga_label

router = APIRouter()


class RencanaUpdate(BaseModel):
    checklist: Optional[List[int]] = None
    catatan_guru: Optional[str] = None


def generate_rencana_ai(siswa_kode: str, tangga: int, target: int) -> dict:
    """
    Generate rencana pendampingan menggunakan AI (placeholder).
    Untuk MVP, gunakan template.
    """
    kegiatan = [
        {
            "hari": 1,
            "kegiatan": f"Latihan {get_tangga_label('LITERASI', tangga)}",
            "durasi_menit": 15,
            "instruksi_guru": "Gunakan bahan ajar yang sudah disiapkan.",
            "selesai": False,
        },
        {
            "hari": 2,
            "kegiatan": f"Latihan lanjutan {get_tangga_label('LITERASI', tangga)}",
            "durasi_menit": 15,
            "instruksi_guru": "Ulangi latihan dengan variasi.",
            "selesai": False,
        },
        {
            "hari": 3,
            "kegiatan": "Latihan dengan variasi",
            "durasi_menit": 15,
            "instruksi_guru": "Gunakan kartu atau benda konkret.",
            "selesai": False,
        },
        {
            "hari": 4,
            "kegiatan": "Latihan mandiri",
            "durasi_menit": 20,
            "instruksi_guru": "Biarkan siswa mencoba sendiri.",
            "selesai": False,
        },
        {
            "hari": 5,
            "kegiatan": "Evaluasi mingguan",
            "durasi_menit": 15,
            "instruksi_guru": "Cek apakah indikator tercapai.",
            "selesai": False,
        },
    ]

    indikator = f"Siswa dapat {get_tangga_label('LITERASI', target).lower()} tanpa bantuan."

    return {
        "kegiatan": kegiatan,
        "target_tangga": target,
        "indikator": indikator,
    }


def _to_response(rencana: RencanaPendampingan, siswa_kode: str) -> RencanaPendampinganResponse:
    checklist = set(rencana.checklist_json or [])
    kegiatan = [
        KegiatanHarian(**{**k, "selesai": idx in checklist})
        for idx, k in enumerate(rencana.kegiatan_json)
    ]
    return RencanaPendampinganResponse(
        id=rencana.id,
        siswa_id=rencana.siswa_id,
        siswa_kode=siswa_kode,
        minggu_ke=rencana.minggu_ke,
        tgl_mulai=rencana.tgl_mulai,
        tgl_selesai=rencana.tgl_selesai,
        kegiatan=kegiatan,
        target_tangga=rencana.target_tangga,
        indikator=rencana.indikator,
        catatan_guru=rencana.catatan_guru,
    )


@router.post("/generate", response_model=RencanaPendampinganResponse)
async def generate_rencana(
    data: RencanaGenerate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate rencana pendampingan individual untuk siswa, dan simpan ke database.
    """
    result = await db.execute(select(Siswa).where(Siswa.id == data.siswa_id))
    siswa = result.scalar_one_or_none()
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")

    result = await db.execute(
        select(PosisiTangga).where(PosisiTangga.siswa_id == data.siswa_id)
    )
    posisi = result.scalar_one_or_none()

    tangga_saat_ini = posisi.tangga_literasi if posisi and posisi.tangga_literasi is not None else 0
    target_tangga = min(tangga_saat_ini + 1, 6)

    rencana_data = generate_rencana_ai(siswa.kode, tangga_saat_ini, target_tangga)

    result = await db.execute(
        select(func.max(RencanaPendampingan.minggu_ke)).where(RencanaPendampingan.siswa_id == data.siswa_id)
    )
    minggu_ke = (result.scalar() or 0) + 1

    today = datetime.utcnow()
    rencana = RencanaPendampingan(
        siswa_id=data.siswa_id,
        minggu_ke=minggu_ke,
        tgl_mulai=today,
        tgl_selesai=today + timedelta(days=6),
        kegiatan_json=rencana_data["kegiatan"],
        target_tangga=rencana_data["target_tangga"],
        indikator=rencana_data["indikator"],
        checklist_json=[],
    )
    db.add(rencana)
    await db.commit()
    await db.refresh(rencana)

    return _to_response(rencana, siswa.kode)


@router.patch("/{rencana_id}", response_model=RencanaPendampinganResponse)
async def update_rencana(
    rencana_id: int,
    data: RencanaUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Memperbarui checklist kegiatan dan/atau catatan guru untuk satu rencana."""
    result = await db.execute(select(RencanaPendampingan).where(RencanaPendampingan.id == rencana_id))
    rencana = result.scalar_one_or_none()
    if not rencana:
        raise HTTPException(status_code=404, detail="Rencana tidak ditemukan")

    if data.checklist is not None:
        rencana.checklist_json = data.checklist
    if data.catatan_guru is not None:
        rencana.catatan_guru = data.catatan_guru

    await db.commit()
    await db.refresh(rencana)

    result = await db.execute(select(Siswa).where(Siswa.id == rencana.siswa_id))
    siswa = result.scalar_one_or_none()

    return _to_response(rencana, siswa.kode if siswa else "")


@router.get("/siswa/{siswa_id}", response_model=List[RencanaPendampinganResponse])
async def get_rencana_siswa(
    siswa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan riwayat rencana pendampingan untuk siswa.
    """
    result = await db.execute(select(Siswa).where(Siswa.id == siswa_id))
    siswa = result.scalar_one_or_none()
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")

    result = await db.execute(
        select(RencanaPendampingan)
        .where(RencanaPendampingan.siswa_id == siswa_id)
        .order_by(RencanaPendampingan.minggu_ke.desc())
    )
    return [_to_response(r, siswa.kode) for r in result.scalars().all()]


@router.get("/kelas/{kelas_id}", response_model=List[RencanaPendampinganResponse])
async def get_rencana_kelas(
    kelas_id: int,
    minggu_ke: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan semua rencana pendampingan aktif di satu kelas.
    """
    query = (
        select(RencanaPendampingan, Siswa)
        .join(Siswa, Siswa.id == RencanaPendampingan.siswa_id)
        .where(Siswa.kelas_id == kelas_id)
    )
    if minggu_ke:
        query = query.where(RencanaPendampingan.minggu_ke == minggu_ke)

    result = await db.execute(query.order_by(RencanaPendampingan.minggu_ke.desc()))
    return [_to_response(rencana, siswa.kode) for rencana, siswa in result.all()]
