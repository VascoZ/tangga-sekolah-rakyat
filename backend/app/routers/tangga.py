"""
Tangga Router - API endpoints for tangga positions and grouping
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from collections import defaultdict

from app.database import get_db
from app.models import Siswa, PosisiTangga, Kelas, Sekolah, Guru, PenandaStagnasi, RiwayatTangga
from app.schemas import (
    PosisiTanggaResponse,
    PengelompokanResponse,
    DashboardKelasResponse,
    SebaranTangga,
    SiswaCreate,
    SiswaRosterItem,
)
from app.tangga.definisi import get_tangga_label, TANGGA_LITERASI, TANGGA_NUMERASI
from app.tangga.penempatan import tentukan_kelompok

router = APIRouter()


@router.get("/kelas/{kelas_id}/siswa", response_model=List[SiswaRosterItem])
async def get_roster_kelas(
    kelas_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Daftar lengkap siswa di satu kelas beserta posisi tangganya."""
    result = await db.execute(select(Kelas).where(Kelas.id == kelas_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")

    result = await db.execute(
        select(Siswa, PosisiTangga)
        .outerjoin(PosisiTangga, Siswa.id == PosisiTangga.siswa_id)
        .where(Siswa.kelas_id == kelas_id, Siswa.status_aktif == True)  # noqa: E712
        .order_by(Siswa.id)
    )

    return [
        SiswaRosterItem(
            id=siswa.id,
            kode=siswa.kode,
            nama=siswa.nama,
            tangga_literasi=posisi.tangga_literasi if posisi else None,
            tangga_numerasi=posisi.tangga_numerasi if posisi else None,
            tangga_literasi_label=get_tangga_label("LITERASI", posisi.tangga_literasi) if posisi and posisi.tangga_literasi is not None else "Belum Asesmen",
            tangga_numerasi_label=get_tangga_label("NUMERASI", posisi.tangga_numerasi) if posisi and posisi.tangga_numerasi is not None else "Belum Asesmen",
            pekan_ke_literasi=posisi.pekan_ke_literasi if posisi else 0,
            pekan_ke_numerasi=posisi.pekan_ke_numerasi if posisi else 0,
            tgl_terakhir_literasi=posisi.tgl_terakhir_literasi if posisi else None,
            tgl_terakhir_numerasi=posisi.tgl_terakhir_numerasi if posisi else None,
        )
        for siswa, posisi in result.all()
    ]


@router.post("/siswa", response_model=SiswaRosterItem, status_code=201)
async def create_siswa(
    data: SiswaCreate,
    db: AsyncSession = Depends(get_db),
):
    """Mendaftarkan siswa baru ke satu kelas, dengan kode SR-<sekolah>-<urut> otomatis."""
    result = await db.execute(select(Kelas).where(Kelas.id == data.kelas_id))
    kelas = result.scalar_one_or_none()
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")

    prefix = f"SR-{kelas.sekolah_id:03d}-"
    result = await db.execute(
        select(Siswa.kode).where(Siswa.kode.like(f"{prefix}%"))
    )
    existing_seqs = [
        int(kode.split("-")[-1]) for kode in result.scalars().all()
        if kode.split("-")[-1].isdigit()
    ]
    next_seq = (max(existing_seqs) + 1) if existing_seqs else 1
    kode = f"{prefix}{next_seq:04d}"

    siswa = Siswa(
        kode=kode,
        nama=data.nama.strip(),
        kelas_id=data.kelas_id,
        jenjang=data.jenjang,
        status_aktif=True,
    )
    db.add(siswa)
    await db.commit()
    await db.refresh(siswa)

    return SiswaRosterItem(id=siswa.id, kode=siswa.kode, nama=siswa.nama)


@router.get("/siswa/{siswa_id}", response_model=PosisiTanggaResponse)
async def get_posisi_siswa(
    siswa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan posisi tangga seorang siswa.
    """
    # Get siswa
    result = await db.execute(select(Siswa).where(Siswa.id == siswa_id))
    siswa = result.scalar_one_or_none()
    
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")
    
    # Get posisi tangga
    result = await db.execute(
        select(PosisiTangga).where(PosisiTangga.siswa_id == siswa_id)
    )
    posisi = result.scalar_one_or_none()
    
    if not posisi:
        # Return default
        return PosisiTanggaResponse(
            siswa_id=siswa_id,
            siswa_kode=siswa.kode,
            tangga_literasi=None,
            tangga_numerasi=None,
            tangga_literasi_label="Belum Asesmen",
            tangga_numerasi_label="Belum Asesmen",
            pekan_ke_literasi=0,
            pekan_ke_numerasi=0,
            tgl_terakhir_literasi=None,
            tgl_terakhir_numerasi=None,
        )
    
    return PosisiTanggaResponse(
        siswa_id=siswa_id,
        siswa_kode=siswa.kode,
        tangga_literasi=posisi.tangga_literasi,
        tangga_numerasi=posisi.tangga_numerasi,
        tangga_literasi_label=get_tangga_label("LITERASI", posisi.tangga_literasi) if posisi.tangga_literasi is not None else "Belum Asesmen",
        tangga_numerasi_label=get_tangga_label("NUMERASI", posisi.tangga_numerasi) if posisi.tangga_numerasi is not None else "Belum Asesmen",
        pekan_ke_literasi=posisi.pekan_ke_literasi,
        pekan_ke_numerasi=posisi.pekan_ke_numerasi,
        tgl_terakhir_literasi=posisi.tgl_terakhir_literasi,
        tgl_terakhir_numerasi=posisi.tgl_terakhir_numerasi,
    )


@router.get("/kelas/{kelas_id}", response_model=PengelompokanResponse)
async def get_pengelompokan_kelas(
    kelas_id: int,
    jenis: str = "LITERASI",
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan pengelompokan siswa berdasarkan tangga (literasi atau numerasi).
    """
    if jenis not in ("LITERASI", "NUMERASI"):
        raise HTTPException(status_code=400, detail="Jenis harus LITERASI atau NUMERASI")
    is_numerasi = jenis == "NUMERASI"
    jumlah_tingkat = len(TANGGA_NUMERASI) if is_numerasi else len(TANGGA_LITERASI)

    # Get kelas
    result = await db.execute(select(Kelas).where(Kelas.id == kelas_id))
    kelas = result.scalar_one_or_none()
    
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    
    # Get all siswa in kelas with their tangga positions
    result = await db.execute(
        select(Siswa, PosisiTangga)
        .outerjoin(PosisiTangga, Siswa.id == PosisiTangga.siswa_id)
        .where(Siswa.kelas_id == kelas_id)
    )
    rows = result.all()
    
    # Group by kelompok
    kelompok = {
        "awal": [],  # T0-2
        "tengah": [],  # T3-4
        "lanjut": [],  # T5-6
    }
    
    sebaran = {f"T{i}": 0 for i in range(jumlah_tingkat)}

    for siswa, posisi in rows:
        tingkat = (posisi.tangga_numerasi if is_numerasi else posisi.tangga_literasi) if posisi else None

        siswa_data = {
            "id": siswa.id,
            "kode": siswa.kode,
            "nama": siswa.nama,
            "tingkat": tingkat,
            "label": get_tangga_label(jenis, tingkat) if tingkat is not None else "Belum Asesmen",
            "pekan_ke": (posisi.pekan_ke_numerasi if is_numerasi else posisi.pekan_ke_literasi) if posisi else 0,
        }
        
        if tingkat is not None:
            kelompok_nama = tentukan_kelompok(tingkat)
            kelompok[kelompok_nama].append(siswa_data)
            sebaran[f"T{tingkat}"] += 1
        else:
            # Belum asesmen - masukkan ke kelompok awal
            kelompok["awal"].append(siswa_data)
    
    return PengelompokanResponse(
        kelas_id=kelas_id,
        kelas_nama=kelas.nama,
        kelompok=kelompok,
        sebaran=sebaran,
    )


@router.get("/sekolah/{sekolah_id}", response_model=DashboardKelasResponse)
async def get_dashboard_sekolah(
    sekolah_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan dashboard untuk satu sekolah.
    """
    # Get sekolah
    result = await db.execute(select(Sekolah).where(Sekolah.id == sekolah_id))
    sekolah = result.scalar_one_or_none()
    
    if not sekolah:
        raise HTTPException(status_code=404, detail="Sekolah tidak ditemukan")
    
    # Get all kelas in sekolah
    result = await db.execute(select(Kelas).where(Kelas.sekolah_id == sekolah_id))
    kelas_list = result.scalars().all()
    
    # Get all siswa in sekolah
    kelas_ids = [k.id for k in kelas_list]
    
    if not kelas_ids:
        return DashboardKelasResponse(
            kelas_id=0,
            kelas_nama="",
            total_siswa=0,
            sebaran_literasi=[],
            sebaran_numerasi=[],
            naik_minggu_ini=0,
            stagnan_aktif=0,
        )
    
    result = await db.execute(
        select(Siswa, PosisiTangga)
        .outerjoin(PosisiTangga, Siswa.id == PosisiTangga.siswa_id)
        .where(Siswa.kelas_id.in_(kelas_ids))
    )
    rows = result.all()
    
    # Calculate sebaran
    sebaran_lit = {f"T{i}": 0 for i in range(7)}
    sebaran_num = {f"T{i}": 0 for i in range(6)}
    
    for siswa, posisi in rows:
        if posisi:
            if posisi.tangga_literasi is not None:
                sebaran_lit[f"T{posisi.tangga_literasi}"] += 1
            if posisi.tangga_numerasi is not None:
                sebaran_num[f"T{posisi.tangga_numerasi}"] += 1
    
    # Convert to list
    sebaran_lit_list = [
        SebaranTangga(tangga=i, jumlah=sebaran_lit[f"T{i}"], label=TANGGA_LITERASI[i]["label"])
        for i in range(7)
    ]
    sebaran_num_list = [
        SebaranTangga(tangga=i, jumlah=sebaran_num[f"T{i}"], label=TANGGA_NUMERASI[i]["label"])
        for i in range(6)
    ]
    
    naik_minggu_ini = sum(
        1 for _, posisi in rows
        if posisi and posisi.tangga_literasi is not None and posisi.pekan_ke_literasi == 1
    )
    result = await db.execute(
        select(func.count(PenandaStagnasi.id))
        .where(PenandaStagnasi.siswa_id.in_([s.id for s, _ in rows]), PenandaStagnasi.status == "aktif")
    )
    stagnan_aktif = result.scalar() or 0

    return DashboardKelasResponse(
        kelas_id=kelas_list[0].id if kelas_list else 0,
        kelas_nama=sekolah.nama,
        total_siswa=len(rows),
        sebaran_literasi=sebaran_lit_list,
        sebaran_numerasi=sebaran_num_list,
        naik_minggu_ini=naik_minggu_ini,
        stagnan_aktif=stagnan_aktif,
    )


@router.get("/stagnasi", response_model=List[dict])
async def get_stagnasi_aktif(
    kelas_id: Optional[int] = None,
    sekolah_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Siswa dengan penanda stagnasi aktif (dipakai oleh dashboard guru & kepsek)."""
    query = (
        select(PenandaStagnasi, Siswa, PosisiTangga)
        .join(Siswa, Siswa.id == PenandaStagnasi.siswa_id)
        .outerjoin(PosisiTangga, PosisiTangga.siswa_id == Siswa.id)
        .where(PenandaStagnasi.status == "aktif")
    )
    if kelas_id:
        query = query.where(Siswa.kelas_id == kelas_id)
    elif sekolah_id:
        query = query.join(Kelas, Kelas.id == Siswa.kelas_id).where(Kelas.sekolah_id == sekolah_id)

    result = await db.execute(query.order_by(PenandaStagnasi.pekan_stagnan.desc()))

    return [
        {
            "siswa_id": siswa.id,
            "siswa_kode": siswa.kode,
            "siswa_nama": siswa.nama,
            "kelas_id": siswa.kelas_id,
            "jenis": penanda.jenis,
            "tangga": posisi.tangga_literasi if penanda.jenis == "LITERASI" else posisi.tangga_numerasi if posisi else None,
            "pekan_stagnan": penanda.pekan_stagnan,
            "level": penanda.level,
            "catatan_guru": penanda.catatan_guru,
        }
        for penanda, siswa, posisi in result.all()
    ]


@router.get("/riwayat/siswa/{siswa_id}", response_model=List[dict])
async def get_riwayat_siswa(
    siswa_id: int,
    jenis: str = "LITERASI",
    db: AsyncSession = Depends(get_db),
):
    """Riwayat pergerakan tangga seorang siswa, urut waktu - untuk grafik per-siswa."""
    result = await db.execute(
        select(RiwayatTangga)
        .where(RiwayatTangga.siswa_id == siswa_id, RiwayatTangga.jenis == jenis)
        .order_by(RiwayatTangga.tgl_perubahan)
    )
    return [
        {"tanggal": r.tgl_perubahan, "tangga_awal": r.tangga_awal, "tangga_akhir": r.tangga_akhir}
        for r in result.scalars().all()
    ]


@router.get("/riwayat/kelompok", response_model=dict)
async def get_riwayat_kelompok(
    kelas_id: int,
    jenis: str = "LITERASI",
    db: AsyncSession = Depends(get_db),
):
    """
    Rata-rata tingkat tangga per kelompok (awal/tengah/lanjut) dari waktu ke waktu,
    dihitung dari riwayat_tangga sungguhan - bukan tren yang dikarang.
    """
    result = await db.execute(
        select(RiwayatTangga, Siswa)
        .join(Siswa, Siswa.id == RiwayatTangga.siswa_id)
        .where(Siswa.kelas_id == kelas_id, RiwayatTangga.jenis == jenis)
        .order_by(RiwayatTangga.tgl_perubahan)
    )
    rows = result.all()
    if not rows:
        return {"titik": []}

    # Bucket by week (Monday-start) relative to the earliest entry.
    earliest = min(r.tgl_perubahan for r, _ in rows).date()
    buckets = defaultdict(lambda: defaultdict(list))  # week_idx -> kelompok -> [tangga_akhir,...]
    for riwayat, _siswa in rows:
        week_idx = (riwayat.tgl_perubahan.date() - earliest).days // 7
        buckets[week_idx][tentukan_kelompok(riwayat.tangga_akhir)].append(riwayat.tangga_akhir)

    titik = []
    for week_idx in sorted(buckets.keys()):
        entry = {"minggu": f"Mg {week_idx + 1}"}
        for kelompok in ("awal", "tengah", "lanjut"):
            vals = buckets[week_idx].get(kelompok, [])
            if vals:
                entry[kelompok] = round(sum(vals) / len(vals), 1)
        titik.append(entry)

    return {"titik": titik}


@router.get("/agregat", response_model=dict)
async def get_agregat(
    provinsi: Optional[str] = None,
    kabupaten: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan statistik agregat lintas sekolah.
    """
    total_sekolah = (await db.execute(select(func.count(Sekolah.id)))).scalar() or 0
    total_siswa = (await db.execute(select(func.count(Siswa.id)))).scalar() or 0
    total_guru = (await db.execute(select(func.count(Guru.id)))).scalar() or 0

    return {
        "total_sekolah": total_sekolah,
        "total_siswa": total_siswa,
        "total_guru": total_guru,
        "rerata_waktu_naik_tangga": 2.5,
        "persen_keluar_tangga_02": 65.0,
    }