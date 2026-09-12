"""
Database models for TANGGA
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Sekolah(Base):
    __tablename__ = "sekolah"
    
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(200))
    provinsi = Column(String(100))
    kabupaten = Column(String(100))
    kecamatan = Column(String(100))
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    tipe = Column(String(50), default="sekolah_rakyat")
    created_at = Column(DateTime, server_default=func.now())
    
    kelas_list = relationship("Kelas", back_populates="sekolah")


class Guru(Base):
    __tablename__ = "guru"
    
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(200))
    nip = Column(String(30), unique=True, nullable=True)
    peran = Column(String(20))  # wali_kelas, kepala_sekolah, pengelola
    sekolah_id = Column(Integer, ForeignKey("sekolah.id"))
    created_at = Column(DateTime, server_default=func.now())


class Kelas(Base):
    __tablename__ = "kelas"
    
    id = Column(Integer, primary_key=True, index=True)
    sekolah_id = Column(Integer, ForeignKey("sekolah.id"))
    nama = Column(String(50))  # "Kelas A - SMA"
    jenjang = Column(String(10))  # SD, SMP, SMA
    tahun_ajaran = Column(String(20))
    guru_id = Column(Integer, ForeignKey("guru.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    sekolah = relationship("Sekolah", back_populates="kelas_list")
    siswa_list = relationship("Siswa", back_populates="kelas")


class Siswa(Base):
    __tablename__ = "siswa"
    
    id = Column(Integer, primary_key=True, index=True)
    kode = Column(String(20), unique=True, index=True)  # SR-001-0001
    nama = Column(String(100), nullable=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"))
    jenjang = Column(String(10))
    tgl_masuk = Column(DateTime, server_default=func.now())
    status_aktif = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    kelas = relationship("Kelas", back_populates="siswa_list")
    posisi_tangga = relationship("PosisiTangga", back_populates="siswa", uselist=False)


class PosisiTangga(Base):
    """Posisi TERKINI seorang siswa di tangga literasi/numerasi"""
    __tablename__ = "posisi_tangga"
    
    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"), unique=True)
    tangga_literasi = Column(Integer, nullable=True)  # 0-6, None = belum asesmen
    tangga_numerasi = Column(Integer, nullable=True)  # 0-5
    tgl_terakhir_literasi = Column(DateTime, nullable=True)
    tgl_terakhir_numerasi = Column(DateTime, nullable=True)
    pekan_ke_literasi = Column(Integer, default=0)
    pekan_ke_numerasi = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    siswa = relationship("Siswa", back_populates="posisi_tangga")


class AsesmenSiswa(Base):
    """Satu sesi asesmen lengkap per jenis"""
    __tablename__ = "asesmen_siswa"
    
    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    guru_id = Column(Integer, ForeignKey("guru.id"), nullable=True)
    tgl_asesmen = Column(DateTime, server_default=func.now())
    jenis = Column(String(10))  # LITERASI, NUMERASI
    tangga_awal = Column(Integer, nullable=True)
    tangga_hasil = Column(Integer)
    durasi_detik = Column(Integer)
    status = Column(String(20), default="selesai")  # berlangsung, selesai, terputus
    
    jawaban_items = relationship("JawabanItem", back_populates="asesmen")


class JawabanItem(Base):
    """Satu butir pertanyaan dalam satu asesmen"""
    __tablename__ = "jawaban_item"
    
    id = Column(Integer, primary_key=True, index=True)
    asesmen_id = Column(Integer, ForeignKey("asesmen_siswa.id"))
    item_ke = Column(Integer)  # urutan 1-7 (literasi) atau 1-6 (numerasi)
    tingkatan = Column(Integer)  # anak tangga yang diuji
    jenis_kemampuan = Column(String(100))  # "mengenal_huruf", "membaca_kata", dll
    jawaban = Column(Boolean)  # True=benar, False=salah
    jawaban_siswa = Column(Text, nullable=True)  # apa yang dijawab siswa (opsional)
    catatan = Column(Text, nullable=True)

    asesmen = relationship("AsesmenSiswa", back_populates="jawaban_items")


class RiwayatTangga(Base):
    """Log setiap kali seorang siswa naik/turun tangga"""
    __tablename__ = "riwayat_tangga"
    
    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    jenis = Column(String(10))  # LITERASI, NUMERASI
    tangga_awal = Column(Integer)
    tangga_akhir = Column(Integer)
    tgl_perubahan = Column(DateTime, server_default=func.now())
    asesmen_id = Column(Integer, ForeignKey("asesmen_siswa.id"), nullable=True)
    lama_hari = Column(Integer)  # berapa hari sejak perubahan terakhir


class BahanAjar(Base):
    """Bahan ajar yang dihasilkan AI untuk satu tema/tingkat"""
    __tablename__ = "bahan_ajar"
    
    id = Column(Integer, primary_key=True, index=True)
    tema = Column(String(200))
    tingkat = Column(Integer)  # 0-6
    konten_json = Column(JSON)
    dibuat_oleh = Column(Integer, ForeignKey("guru.id"), nullable=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class RencanaPendampingan(Base):
    """Rencana belajar individual per siswa per minggu"""
    __tablename__ = "rencana_pendampingan"
    
    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    minggu_ke = Column(Integer)
    tgl_mulai = Column(DateTime)
    tgl_selesai = Column(DateTime)
    kegiatan_json = Column(JSON)  # list of activities
    target_tangga = Column(Integer)
    indikator = Column(Text)
    checklist_json = Column(JSON, default=list)
    catatan_guru = Column(Text, nullable=True)
    dibuat_oleh = Column(Integer, ForeignKey("guru.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class PenandaStagnasi(Base):
    """Siswa yang ditandai tidak naik dalam 3+ minggu"""
    __tablename__ = "penanda_stagnasi"
    
    id = Column(Integer, primary_key=True, index=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    jenis = Column(String(10))  # LITERASI, NUMERASI
    tgl_ditandai = Column(DateTime, server_default=func.now())
    pekan_stagnan = Column(Integer)
    level = Column(String(10))  # BERAT, SEDANG
    status = Column(String(20), default="aktif")  # aktif, ditangani, selesai
    catatan_guru = Column(Text, nullable=True)