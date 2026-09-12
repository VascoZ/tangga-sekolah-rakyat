"""
Seed database with synthetic data for TANGGA MVP
90 students, 3 classes, 1 school
"""

import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.database import engine
from app.models import (
    Base, Sekolah, Guru, Kelas, Siswa, PosisiTangga,
    AsesmenSiswa, JawabanItem, RiwayatTangga, BahanAjar,
    RencanaPendampingan, PenandaStagnasi
)
from app.tangga.definisi import TANGGA_LITERASI, TANGGA_NUMERASI


# Seed data configuration
NUM_SISWA_PER_KELAS = 30
NUM_KELAS = 3
NUM_SEKOLAH = 1

# Distribution patterns for tangga
POLA_PERGERAKAN = [
    "stagnan_bawah",  # 10 siswa: 0→0→0→0 (stagnan di tangga rendah)
    "naik_pelan",    # 25 siswa: naik 1 tingkat tiap 3-4 minggu
    "naik_sedang",   # 30 siswa: naik 1 tingkat tiap 2 minggu
    "naik_cepat",    # 15 siswa: naik cepat ke tingkat tinggi
    "fluktuatif",    # 10 siswa: naik-turun
]

# Initial distribution of tangga literasi
DISTRIBUSI_AWAL_LITERASI = {
    0: 12,  # 13% - termasuk siswa SMA yang belum bisa baca
    1: 15,  # 17%
    2: 18,  # 20%
    3: 20,  # 22% - puncak distribusi
    4: 15,  # 17%
    5: 7,   # 8%
    6: 3,   # 3%
}


async def seed_database():
    """Seed database with synthetic data"""
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        # Create sekolah
        sekolah = Sekolah(
            nama="Sekolah Rakyat Harapan Bangsa",
            provinsi="Jawa Barat",
            kabupaten="Bekasi",
            kecamatan="Bekasi Barat",
            tipe="sekolah_rakyat",
        )
        session.add(sekolah)
        await session.commit()
        print(f"Created sekolah: {sekolah.nama}")
        
        # Create guru
        guru_list = []
        for i, peran in enumerate(["wali_kelas", "wali_kelas", "wali_kelas", "kepala_sekolah"]):
            guru = Guru(
                nama=f"Bu {'Santi' if i == 0 else 'Rina' if i == 1 else 'Dewi' if i == 2 else 'Sri'}",
                nip=f"1985010{i+1}20100{i+1}",
                peran=peran,
                sekolah_id=sekolah.id,
            )
            session.add(guru)
            guru_list.append(guru)
        await session.commit()
        print(f"Created {len(guru_list)} guru")
        
        # Create kelas
        kelas_list = []
        jenjang_list = ["SMA", "SMP", "SD"]
        for i, jenjang in enumerate(jenjang_list):
            kelas = Kelas(
                sekolah_id=sekolah.id,
                nama=f"Kelas {chr(65+i)} - {jenjang}",
                jenjang=jenjang,
                tahun_ajaran="2026/2027",
                guru_id=guru_list[i].id,
            )
            session.add(kelas)
            kelas_list.append(kelas)
        await session.commit()
        print(f"Created {len(kelas_list)} kelas")
        
        # Create siswa with posisi tangga
        siswa_list = []
        posisi_list = []
        
        siswa_counter = 0
        for kelas_idx, kelas in enumerate(kelas_list):
            for i in range(NUM_SISWA_PER_KELAS):
                siswa_counter += 1
                kode = f"SR-{sekolah.id:03d}-{siswa_counter:04d}"
                
                siswa = Siswa(
                    kode=kode,
                    kelas_id=kelas.id,
                    jenjang=kelas.jenjang,
                    tgl_masuk=datetime(2026, 7, 14),
                    status_aktif=True,
                )
                session.add(siswa)
                siswa_list.append(siswa)
        
        await session.commit()
        print(f"Created {len(siswa_list)} siswa")
        
        # Assign initial tangga positions based on distribution
        tangga_assignments = []
        for tingkat, count in DISTRIBUSI_AWAL_LITERASI.items():
            tangga_assignments.extend([tingkat] * count)
        
        # Adjust to match total
        while len(tangga_assignments) < len(siswa_list):
            tangga_assignments.append(random.randint(0, 6))
        
        random.shuffle(tangga_assignments)
        
        # Create posisi tangga
        for idx, siswa in enumerate(siswa_list):
            tangga_lit = tangga_assignments[idx]
            tangga_num = max(0, min(5, tangga_lit - random.randint(0, 2)))  # Numerasi: 0-5, biasanya lebih rendah
            
            posisi = PosisiTangga(
                siswa_id=siswa.id,
                tangga_literasi=tangga_lit,
                tangga_numerasi=tangga_num,
                tgl_terakhir_literasi=datetime(2026, 8, 1) - timedelta(days=random.randint(1, 14)),
                tgl_terakhir_numerasi=datetime(2026, 8, 1) - timedelta(days=random.randint(1, 14)),
                pekan_ke_literasi=random.randint(0, 4),
                pekan_ke_numerasi=random.randint(0, 4),
            )
            session.add(posisi)
            posisi_list.append(posisi)
        
        await session.commit()
        print(f"Created {len(posisi_list)} posisi tangga")
        
        # Create some stagnasi markers
        stagnasi_count = 0
        for idx, siswa in enumerate(siswa_list[:10]):  # First 10 students
            if random.random() < 0.3:  # 30% chance of stagnasi
                posisi = posisi_list[idx]
                stagnasi = PenandaStagnasi(
                    siswa_id=siswa.id,
                    jenis="LITERASI",
                    pekan_stagnan=random.randint(3, 5),
                    level="BERAT" if random.random() < 0.3 else "SEDANG",
                    status="aktif",
                )
                session.add(stagnasi)
                stagnasi_count += 1
        
        await session.commit()
        print(f"Created {stagnasi_count} stagnasi markers")
        
        # Create sample bahan ajar
        tema_contoh = "Lingkungan Sekitarku"
        for tingkat in range(7):
            bahan = BahanAjar(
                tema=tema_contoh,
                tingkat=tingkat,
                konten_json={
                    "instruksi_guru": f"Instruksi untuk tingkat {tingkat}",
                    "konten": f"Konten bahan ajar untuk {TANGGA_LITERASI[tingkat]['label']}",
                },
                kelas_id=kelas_list[0].id,
            )
            session.add(bahan)
        
        await session.commit()
        print(f"Created 7 bahan ajar for tema '{tema_contoh}'")
        
        print("\n=== Seed completed ===")
        print(f"Sekolah: {sekolah.nama}")
        print(f"Kelas: {len(kelas_list)}")
        print(f"Siswa: {len(siswa_list)}")
        print(f"Guru: {len(guru_list)}")


if __name__ == "__main__":
    asyncio.run(seed_database())