"""
Pydantic schemas for TANGGA API
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class JenisAsesmen(str, Enum):
    LITERASI = "LITERASI"
    NUMERASI = "NUMERASI"


class StatusAsesmen(str, Enum):
    BERLANGSUNG = "berlangsung"
    SELESAI = "selesai"
    TERPUTUS = "terputus"


class LevelStagnasi(str, Enum):
    BERAT = "BERAT"
    SEDANG = "SEDANG"


class StatusStagnasi(str, Enum):
    AKTIF = "aktif"
    DITANGANI = "ditangani"
    SELESAI = "selesai"


# === SISWA ===
class SiswaBase(BaseModel):
    kode: str
    nama: Optional[str] = None
    jenjang: str


class SiswaCreate(BaseModel):
    nama: str
    kelas_id: int
    jenjang: str


class SiswaResponse(SiswaBase):
    id: int
    kelas_id: int
    status_aktif: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SiswaWithTangga(SiswaResponse):
    tangga_literasi: Optional[int] = None
    tangga_numerasi: Optional[int] = None
    pekan_ke_literasi: int = 0
    pekan_ke_numerasi: int = 0


class SiswaRosterItem(BaseModel):
    id: int
    kode: str
    nama: Optional[str] = None
    tangga_literasi: Optional[int] = None
    tangga_numerasi: Optional[int] = None
    tangga_literasi_label: str = "Belum Asesmen"
    tangga_numerasi_label: str = "Belum Asesmen"
    pekan_ke_literasi: int = 0
    pekan_ke_numerasi: int = 0
    tgl_terakhir_literasi: Optional[datetime] = None
    tgl_terakhir_numerasi: Optional[datetime] = None


# === ASESMEN ===
class JawabanItemBase(BaseModel):
    item_ke: int
    tingkatan: int
    jenis_kemampuan: str
    jawaban: bool
    jawaban_siswa: Optional[str] = None
    catatan: Optional[str] = None


class JawabanItemCreate(JawabanItemBase):
    pass


class JawabanItemResponse(JawabanItemBase):
    id: int
    asesmen_id: int

    class Config:
        from_attributes = True


class AsesmenMulai(BaseModel):
    siswa_id: int
    jenis: JenisAsesmen


class AsesmenJawab(BaseModel):
    asesmen_id: int
    item_ke: int
    jawaban: bool
    jawaban_siswa: Optional[str] = None


class AsesmenResponse(BaseModel):
    id: int
    siswa_id: int
    guru_id: Optional[int]
    tgl_asesmen: datetime
    jenis: str
    tangga_awal: Optional[int]
    tangga_hasil: int
    durasi_detik: int
    status: str
    jawaban_items: List[JawabanItemResponse] = []

    class Config:
        from_attributes = True


class AsesmenHasil(BaseModel):
    asesmen_id: int
    siswa_kode: str
    jenis: str
    tangga_hasil: int
    tangga_label: str
    detail_jawaban: List[dict]
    durasi: str
    naik_tingkat: int  # berapa tingkat naik


# === TANGGA ===
class PosisiTanggaResponse(BaseModel):
    siswa_id: int
    siswa_kode: str
    tangga_literasi: Optional[int]
    tangga_numerasi: Optional[int]
    tangga_literasi_label: Optional[str]
    tangga_numerasi_label: Optional[str]
    pekan_ke_literasi: int
    pekan_ke_numerasi: int
    tgl_terakhir_literasi: Optional[datetime]
    tgl_terakhir_numerasi: Optional[datetime]


class PengelompokanResponse(BaseModel):
    kelas_id: int
    kelas_nama: str
    kelompok: dict  # { "awal": [...], "tengah": [...], "lanjut": [...] }
    sebaran: dict  # { "T0": 2, "T1": 4, ... }


class SebaranTangga(BaseModel):
    tangga: int
    jumlah: int
    label: str


class DashboardKelasResponse(BaseModel):
    kelas_id: int
    kelas_nama: str
    total_siswa: int
    sebaran_literasi: List[SebaranTangga]
    sebaran_numerasi: List[SebaranTangga]
    naik_minggu_ini: int
    stagnan_aktif: int


# === BAHAN AJAR ===
class BahanAjarGenerate(BaseModel):
    tema: str
    kelas_id: int
    tingkat: Optional[List[int]] = None  # jika None, generate semua


class BahanAjarResponse(BaseModel):
    id: int
    tema: str
    tingkat: int
    konten_json: dict
    created_at: datetime

    class Config:
        from_attributes = True


class BahanPerTingkat(BaseModel):
    tema: str
    bahan: dict  # { "tingkat_0": {...}, "tingkat_1": {...}, ... }


# === RENCANA PENDAMPINGAN ===
class RencanaGenerate(BaseModel):
    siswa_id: int


class KegiatanHarian(BaseModel):
    hari: int  # 1-5 (Senin-Jumat)
    kegiatan: str
    durasi_menit: int
    instruksi_guru: str
    selesai: bool = False


class RencanaPendampinganResponse(BaseModel):
    id: int
    siswa_id: int
    siswa_kode: str
    minggu_ke: int
    tgl_mulai: datetime
    tgl_selesai: datetime
    kegiatan: List[KegiatanHarian]
    target_tangga: int
    indikator: str
    catatan_guru: Optional[str]

    class Config:
        from_attributes = True


# === CHAT ===
class ChatTanya(BaseModel):
    pertanyaan: str


class SumberRujukan(BaseModel):
    judul: str
    kutipan: str
    skor: float


class ChatResponse(BaseModel):
    jawaban: str
    sumber: List[SumberRujukan]
    keyakinan: float


# === STATISTIK ===
class StatistikSekolah(BaseModel):
    total_siswa: int
    total_asesmen: int
    naik_tingkat_minggu_ini: int
    stagnan_aktif: int
    sebaran_literasi: List[SebaranTangga]
    sebaran_numerasi: List[SebaranTangga]


class StatistikAgregat(BaseModel):
    total_sekolah: int
    total_siswa: int
    total_guru: int
    rerata_waktu_naik_tangga: float  # dalam minggu
    persen_keluar_tangga_02: float  # dalam 3 bulan pertama


# === STAGNASI ===
class SiswaStagnan(BaseModel):
    siswa_id: int
    siswa_kode: str
    kelas_nama: str
    jenis: str
    tangga: int
    pekan_stagnan: int
    level: str


class StagnasiTangani(BaseModel):
    siswa_id: int
    catatan: Optional[str] = None