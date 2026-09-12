"""
Asesmen Router - API endpoints for assessment
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import time

from app.database import get_db
from app.models import AsesmenSiswa, JawabanItem, Siswa, PosisiTangga, RiwayatTangga
from app.schemas import (
    AsesmenMulai,
    AsesmenJawab,
    AsesmenResponse,
    AsesmenHasil,
)
from app.tangga.definisi import get_tangga_label, get_max_tangga
from app.tangga.penempatan import AsesmenAdaptif, tentukan_kelompok
from app.tangga.butir_asesmen import generate_asesmen_items, get_items_for_tingkat

router = APIRouter()

# In-memory storage for ongoing assessments (in production, use Redis)
asesmen_sessions: dict = {}


@router.post("/mulai", response_model=dict)
async def mulai_asesmen(
    data: AsesmenMulai,
    db: AsyncSession = Depends(get_db),
):
    """
    Memulai sesi asesmen baru.
    Mengembalikan asesmen_id dan item-item pertama.
    """
    # Cek apakah siswa ada
    result = await db.execute(select(Siswa).where(Siswa.id == data.siswa_id))
    siswa = result.scalar_one_or_none()
    
    if not siswa:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan")
    
    # Cek apakah ada asesmen yang sedang berlangsung
    if data.siswa_id in asesmen_sessions:
        existing = asesmen_sessions[data.siswa_id]
        if not existing.get("selesai", False):
            return {
                "asesmen_id": existing["asesmen_id"],
                "tingkat_awal": existing["tingkat_saat_ini"],
                "items": existing["items"],
                "item_ke": existing["item_ke"],
                "status": "melanjutkan",
            }
    
    # Ambil posisi tangga terakhir
    result = await db.execute(
        select(PosisiTangga).where(PosisiTangga.siswa_id == data.siswa_id)
    )
    posisi = result.scalar_one_or_none()
    
    tingkat_terakhir = None
    if data.jenis.value == "LITERASI":
        tingkat_terakhir = posisi.tangga_literasi if posisi else None
    else:
        tingkat_terakhir = posisi.tangga_numerasi if posisi else None
    
    # Inisialisasi asesmen adaptif
    asesmen = AsesmenAdaptif(jenis=data.jenis.value, tingkat_awal=tingkat_terakhir or 0)
    tingkat_awal = asesmen.mulai_dari_tingkat(tingkat_terakhir or 0)
    
    # Generate items untuk tingkat awal
    items = generate_asesmen_items(data.jenis.value, tingkat_awal, jumlah=5)
    
    # Buat asesmen_id sementara (dalam produksi, simpan ke database)
    asesmen_id = int(time.time() * 1000)  # timestamp as ID
    
    # Simpan sesi
    asesmen_sessions[data.siswa_id] = {
        "asesmen_id": asesmen_id,
        "siswa_id": data.siswa_id,
        "jenis": data.jenis.value,
        "tingkat_awal": tingkat_awal,
        "tingkat_saat_ini": tingkat_awal,
        "items": items,
        "item_ke": 0,
        "jawaban": [],
        "start_time": time.time(),
        "selesai": False,
        "asesmen_obj": asesmen,
    }
    
    return {
        "asesmen_id": asesmen_id,
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
    """
    Merekam jawaban untuk satu item dan menentukan langkah selanjutnya.
    """
    # Cari sesi asesmen
    sesi = None
    for sid, s in asesmen_sessions.items():
        if s["asesmen_id"] == data.asesmen_id:
            sesi = s
            break
    
    if not sesi:
        raise HTTPException(status_code=404, detail="Sesi asesmen tidak ditemukan")
    
    if sesi["selesai"]:
        raise HTTPException(status_code=400, detail="Asesmen sudah selesai")
    
    # Catat jawaban
    item_ke = sesi["item_ke"]
    tingkat_saat_ini = sesi["tingkat_saat_ini"]
    
    sesi["jawaban"].append({
        "item_ke": item_ke,
        "tingkatan": tingkat_saat_ini,
        "jawaban": data.jawaban,
    })
    
    # Update asesmen adaptif
    asesmen_obj = sesi["asesmen_obj"]
    asesmen_obj.catat_jawaban(item_ke + 1, tingkat_saat_ini, data.jawaban)
    
    # Cek apakah sudah 5 item di tingkat ini
    jawaban_di_tingkat = [j for j in sesi["jawaban"] if j["tingkatan"] == tingkat_saat_ini]
    
    if len(jawaban_di_tingkat) >= 5:
        # Evaluasi dan tentukan langkah selanjutnya
        langkah = asesmen_obj.tentukan_langkah_selanjutnya()
        
        if langkah["aksi"] == "selesai":
            # Asesmen selesai
            sesi["selesai"] = True
            sesi["hasil_tingkat"] = langkah["hasil"]
            
            # Simpan ke database
            # (Dalam implementasi penuh, simpan AsesmenSiswa dan JawabanItem)
            
            return {
                "status": "selesai",
                "hasil": {
                    "tingkat_hasil": langkah["hasil"],
                    "tingkat_label": get_tangga_label(sesi["jenis"], langkah["hasil"]),
                    "naik_tingkat": langkah["hasil"] - sesi["tingkat_awal"],
                    "pesan": langkah["pesan"],
                },
            }
        
        elif langkah["aksi"] in ["naik", "turun"]:
            # Pindah ke tingkat berikutnya
            tingkat_baru = langkah["tingkat_berikutnya"]
            items_baru = generate_asesmen_items(sesi["jenis"], tingkat_baru, jumlah=5)
            
            sesi["tingkat_saat_ini"] = tingkat_baru
            sesi["items"] = items_baru
            sesi["item_ke"] = 0
            
            return {
                "status": "lanjut_tingkat",
                "tingkat_baru": tingkat_baru,
                "tingkat_label": get_tangga_label(sesi["jenis"], tingkat_baru),
                "items": items_baru,
                "pesan": langkah["pesan"],
            }
    
    else:
        # Lanjut item berikutnya di tingkat yang sama
        sesi["item_ke"] = item_ke + 1
        next_item = sesi["items"][item_ke + 1] if item_ke + 1 < len(sesi["items"]) else None
        
        return {
            "status": "lanjut",
            "item_ke": item_ke + 1,
            "next_item": next_item,
            "progress": f"{item_ke + 2}/{len(sesi['items'])}",
        }


@router.get("/{asesmen_id}", response_model=dict)
async def get_asesmen(
    asesmen_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan detail asesmen.
    """
    # Cari sesi
    sesi = None
    for sid, s in asesmen_sessions.items():
        if s["asesmen_id"] == asesmen_id:
            sesi = s
            break
    
    if not sesi:
        raise HTTPException(status_code=404, detail="Asesmen tidak ditemukan")
    
    return {
        "asesmen_id": sesi["asesmen_id"],
        "siswa_id": sesi["siswa_id"],
        "jenis": sesi["jenis"],
        "tingkat_awal": sesi["tingkat_awal"],
        "tingkat_saat_ini": sesi["tingkat_saat_ini"],
        "item_ke": sesi["item_ke"],
        "selesai": sesi["selesai"],
        "hasil_tingkat": sesi.get("hasil_tingkat"),
        "durasi_detik": int(time.time() - sesi["start_time"]) if sesi["selesai"] else None,
    }


@router.get("/siswa/{siswa_id}", response_model=dict)
async def get_asesmen_siswa(
    siswa_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Mendapatkan riwayat asesmen seorang siswa.
    """
    # Dalam implementasi penuh, query dari database
    # Untuk MVP, return data dari sesi jika ada
    
    sesi = asesmen_sessions.get(siswa_id)
    
    if sesi and sesi["selesai"]:
        return {
            "siswa_id": siswa_id,
            "asesmen_terakhir": {
                "jenis": sesi["jenis"],
                "tingkat_hasil": sesi["hasil_tingkat"],
                "tingkat_label": get_tangga_label(sesi["jenis"], sesi["hasil_tingkat"]),
                "durasi_detik": int(time.time() - sesi["start_time"]),
            },
        }
    
    return {
        "siswa_id": siswa_id,
        "asesmen_terakhir": None,
    }