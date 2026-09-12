"""
Statistik Router - API endpoints for dashboard statistics
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Siswa, PosisiTangga, Kelas, Sekolah, Guru
from app.schemas import StatistikSekolah, StatistikAgregat, SebaranTangga
from app.tangga.definisi import TANGGA_LITERASI, TANGGA_NUMERASI

router = APIRouter()


@router.get("/sekolah/{sekolah_id}", response_model=StatistikSekolah)
async def get_statistik_sekolah(
    sekolah_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan statistik untuk satu sekolah.
    """
    # Get all kelas in sekolah
    result = await db.execute(
        select(Kelas.id).where(Kelas.sekolah_id == sekolah_id)
    )
    kelas_ids = [k for k in result.scalars().all()]
    
    if not kelas_ids:
        return StatistikSekolah(
            total_siswa=0,
            total_asesmen=0,
            naik_tingkat_minggu_ini=0,
            stagnan_aktif=0,
            sebaran_literasi=[],
            sebaran_numerasi=[],
        )
    
    # Get all siswa with posisi
    result = await db.execute(
        select(Siswa.id, PosisiTangga)
        .outerjoin(PosisiTangga, Siswa.id == PosisiTangga.siswa_id)
        .where(Siswa.kelas_id.in_(kelas_ids))
    )
    rows = result.all()
    
    # Calculate sebaran
    sebaran_lit = {i: 0 for i in range(7)}
    sebaran_num = {i: 0 for i in range(6)}
    
    for siswa_id, posisi in rows:
        if posisi:
            # Clamp defensively: tangga_literasi/numerasi are only ever meant
            # to hold 0-6 / 0-5, but don't let a bad row 500 this endpoint.
            if posisi.tangga_literasi is not None:
                sebaran_lit[max(0, min(6, posisi.tangga_literasi))] += 1
            if posisi.tangga_numerasi is not None:
                sebaran_num[max(0, min(5, posisi.tangga_numerasi))] += 1
    
    # Convert to list
    sebaran_lit_list = [
        SebaranTangga(tangga=i, jumlah=sebaran_lit[i], label=TANGGA_LITERASI[i]["label"])
        for i in range(7)
    ]
    sebaran_num_list = [
        SebaranTangga(tangga=i, jumlah=sebaran_num[i], label=TANGGA_NUMERASI[i]["label"])
        for i in range(6)
    ]
    
    return StatistikSekolah(
        total_siswa=len(rows),
        total_asesmen=0,  # TODO: count from asesmen_siswa
        naik_tingkat_minggu_ini=0,  # TODO: calculate
        stagnan_aktif=0,  # TODO: calculate
        sebaran_literasi=sebaran_lit_list,
        sebaran_numerasi=sebaran_num_list,
    )


@router.get("/agregat", response_model=StatistikAgregat)
async def get_statistik_agregat(
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan statistik agregat lintas sekolah.
    """
    # Count total sekolah
    result = await db.execute(select(func.count(Sekolah.id)))
    total_sekolah = result.scalar() or 0
    
    # Count total siswa
    result = await db.execute(select(func.count(Siswa.id)))
    total_siswa = result.scalar() or 0

    # Count total guru
    result = await db.execute(select(func.count(Guru.id)))
    total_guru = result.scalar() or 0

    return StatistikAgregat(
        total_sekolah=total_sekolah,
        total_siswa=total_siswa,
        total_guru=total_guru,
        rerata_waktu_naik_tangga=2.5,  # Placeholder
        persen_keluar_tangga_02=65.0,  # Placeholder
    )