"""
One-off backfill: populate riwayat_tangga (literasi) for students who don't
already have any - i.e. everyone except the handful touched by real
assessment runs during testing. Safe to run once; skips students who already
have rows so it never duplicates real history.
"""
import asyncio
import random
from sqlalchemy import select, func

from app.database import engine, async_session_maker
from app.models import Siswa, PosisiTangga, RiwayatTangga
from seed_db import generate_riwayat_literasi

POLA_PERGERAKAN = (
    ["stagnan_bawah"] * 10 + ["naik_pelan"] * 25 + ["naik_sedang"] * 30
    + ["naik_cepat"] * 15 + ["fluktuatif"] * 10
)


async def main():
    async with async_session_maker() as session:
        result = await session.execute(
            select(Siswa.id, PosisiTangga.tangga_literasi, PosisiTangga.tgl_terakhir_literasi)
            .join(PosisiTangga, PosisiTangga.siswa_id == Siswa.id)
            .where(PosisiTangga.tangga_literasi.isnot(None))
        )
        candidates = result.all()

        result = await session.execute(
            select(RiwayatTangga.siswa_id).where(RiwayatTangga.jenis == "LITERASI").distinct()
        )
        already_has = set(result.scalars().all())

        pola_pool = list(POLA_PERGERAKAN)
        random.shuffle(pola_pool)

        count = 0
        for siswa_id, tingkat, tgl_terakhir in candidates:
            if siswa_id in already_has:
                continue
            pola = pola_pool[count % len(pola_pool)]
            for awal, akhir, tanggal in generate_riwayat_literasi(tingkat, tgl_terakhir, pola):
                session.add(RiwayatTangga(
                    siswa_id=siswa_id, jenis="LITERASI",
                    tangga_awal=awal, tangga_akhir=akhir,
                    tgl_perubahan=tanggal, lama_hari=7,
                ))
            count += 1

        await session.commit()
        print(f"Backfilled riwayat_tangga for {count} students (skipped {len(already_has)} with existing real history)")


asyncio.run(main())
