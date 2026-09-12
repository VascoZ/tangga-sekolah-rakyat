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


def generate_riwayat_literasi(final_tingkat: int, tgl_akhir: datetime, pola: str):
    """
    Weekly literasi history ending exactly at final_tingkat on tgl_akhir, shaped
    by pola (see POLA_PERGERAKAN). Returns a list of (awal, akhir, tanggal) weekly
    transitions, oldest first.
    """
    n = 4  # weeks of history
    if pola == "stagnan_bawah":
        levels = [final_tingkat] * (n + 1)
    elif pola == "fluktuatif":
        levels = [final_tingkat]
        cur = final_tingkat
        for _ in range(n):
            cur = max(0, min(6, cur + random.choice([-1, 0, 1])))
            levels.append(cur)
        levels.reverse()
        levels[-1] = final_tingkat
    else:
        step = {"naik_pelan": 1, "naik_sedang": 1, "naik_cepat": 2}.get(pola, 1)
        levels = [final_tingkat]
        cur = final_tingkat
        for _ in range(n):
            cur = max(0, cur - step)
            levels.append(cur)
        levels.reverse()

    total = len(levels) - 1
    rows = []
    for i in range(1, len(levels)):
        weeks_ago = total - i + 1
        tanggal = tgl_akhir - timedelta(weeks=weeks_ago)
        rows.append((levels[i - 1], levels[i], tanggal))
    return rows


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

        # Named only for Kelas A (matches the frontend's demo data, kode-for-kode);
        # Kelas B/C stay nama=None - nothing in the app names them today.
        NAMA_KELAS_A = [
            'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Irma', 'Joko',
            'Galih', 'Lina', 'Maman', 'Nia', 'Oman', 'Putri', 'Qori', 'Indah', 'Sari', 'Tono',
            'Umar', 'Rudi', 'Wati', 'Anton', 'Roni', 'Susi', 'Tomi', 'Tini', 'Bayu', 'Yusuf',
        ]

        siswa_counter = 0
        for kelas_idx, kelas in enumerate(kelas_list):
            for i in range(NUM_SISWA_PER_KELAS):
                siswa_counter += 1
                kode = f"SR-{sekolah.id:03d}-{siswa_counter:04d}"

                siswa = Siswa(
                    kode=kode,
                    nama=NAMA_KELAS_A[i] if kelas_idx == 0 else None,
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

        # Riwayat pergerakan (literasi): POLA_PERGERAKAN was defined above but never
        # actually used anywhere - PergerakanTangga had nothing real to draw from.
        # Generate a plausible weekly history per student, shaped by an assigned
        # pola, ending exactly at their current seeded position.
        pola_assignments = (
            ["stagnan_bawah"] * 10 + ["naik_pelan"] * 25 + ["naik_sedang"] * 30
            + ["naik_cepat"] * 15 + ["fluktuatif"] * 10
        )
        random.shuffle(pola_assignments)

        riwayat_count = 0
        for idx, siswa in enumerate(siswa_list):
            posisi = posisi_list[idx]
            pola = pola_assignments[idx % len(pola_assignments)]
            for awal, akhir, tanggal in generate_riwayat_literasi(
                posisi.tangga_literasi, posisi.tgl_terakhir_literasi, pola
            ):
                session.add(RiwayatTangga(
                    siswa_id=siswa.id, jenis="LITERASI",
                    tangga_awal=awal, tangga_akhir=akhir,
                    tgl_perubahan=tanggal, lama_hari=7,
                ))
                riwayat_count += 1

        await session.commit()
        print(f"Created {riwayat_count} riwayat tangga entries")

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