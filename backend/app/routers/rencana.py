"""
Rencana Pendampingan Router - API endpoints for individual learning plans
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import RencanaPendampingan, Siswa, PosisiTangga
from app.schemas import RencanaGenerate, RencanaPendampinganResponse
from app.tangga.definisi import get_tangga_label

router = APIRouter()


def generate_rencana_ai(siswa_kode: str, tangga: int, target: int) -> dict:
    """
    Generate rencana pendampingan menggunakan AI (placeholder).
    Untuk MVP, gunakan template.
    """
    # Template rencana mingguan
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


@router.post("/generate", response_model=RencanaPendampinganResponse)
async def generate_rencana(
    data: RencanaGenerate,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate rencana pendampingan individual untuk siswa.
    """
    # Get siswa
    result = await db.execute(select(Siswa).where(Siswa.id == data.siswa_id))
    siswa = result.scalar_one_or_none()
    
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")
    
    # Get posisi tangga
    result = await db.execute(
        select(PosisiTangga).where(PosisiTangga.siswa_id == data.siswa_id)
    )
    posisi = result.scalar_one_or_none()
    
    tangga_saat_ini = posisi.tangga_literasi if posisi else 0
    target_tangga = min(tangga_saat_ini + 1, 6)  # Target naik 1 tingkat
    
    # Generate rencana
    rencana_data = generate_rencana_ai(siswa.kode, tangga_saat_ini, target_tangga)
    
    # Calculate dates
    today = datetime.now()
    tgl_mulai = today
    tgl_selesai = today + timedelta(days=6)
    
    return RencanaPendampinganResponse(
        id=0,  # Placeholder - in production, save to DB
        siswa_id=data.siswa_id,
        siswa_kode=siswa.kode,
        minggu_ke=1,  # TODO: calculate from tgl_masuk
        tgl_mulai=tgl_mulai,
        tgl_selesai=tgl_selesai,
        kegiatan=rencana_data["kegiatan"],
        target_tangga=rencana_data["target_tangga"],
        indikator=rencana_data["indikator"],
        catatan_guru=None,
    )


@router.get("/siswa/{siswa_id}", response_model=List[RencanaPendampinganResponse])
async def get_rencana_siswa(
    siswa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan riwayat rencana pendampingan untuk siswa.
    """
    result = await db.execute(
        select(RencanaPendampingan)
        .where(RencanaPendampingan.siswa_id == siswa_id)
        .order_by(RencanaPendampingan.minggu_ke.desc())
    )
    rencana_list = result.scalars().all()
    
    return rencana_list


@router.get("/kelas/{kelas_id}", response_model=List[RencanaPendampinganResponse])
async def get_rencana_kelas(
    kelas_id: int,
    minggu_ke: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan semua rencana pendampingan di satu kelas.
    """
    # TODO: Implement proper query
    return []