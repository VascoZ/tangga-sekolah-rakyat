"""
Chat Router - API endpoints for RAG assistant
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas import ChatTanya, ChatResponse, SumberRujukan

router = APIRouter()

# Knowledge base for RAG (simplified for MVP)
KNOWLEDGE_BASE = [
    {
        "id": 1,
        "judul": "Metode Suku Kata",
        "konten": "Metode suku kata adalah pendekatan membaca dengan memecah kata menjadi suku kata. Contoh: ba-tu, ru-mah, i-kan. Aktivitas motorik seperti menggunting dan menyusun suku kata membantu retensi.",
        "kategori": "literasi_dasar",
    },
    {
        "id": 2,
        "judul": "Strategi Anak Stagnan di Pengenalan Huruf",
        "konten": "Jika anak stagnan di pengenalan huruf, coba: 1) Gunakan huruf berpasangan dengan gambar (A-ayam), 2) Ajak menyanyi lagu alfabet, 3) Gunakan pasir atau pasir kinetik untuk menulis huruf, 4) Kembali ke aktivitas motorik kasar.",
        "kategori": "remedial",
    },
    {
        "id": 3,
        "judul": "Mengajar Anak yang Belum Bisa Membaca di Usia SMA",
        "konten": "Anak SMA yang belum bisa membaca membutuhkan pendekatan yang tidak mengintimidasi. Gunakan: 1) Materi yang relevan dengan minat mereka, 2) Tidak menunjukkan perbandingan dengan teman sebaya, 3) Fokus pada kemajuan kecil, 4) Gunakan bahan bacaan sederhana tapi konten menarik.",
        "kategori": "remedial",
    },
    {
        "id": 4,
        "judul": "Mengelola Kelas Multi-Tingkat",
        "konten": "Dalam satu kelas dengan 6 tingkat kemampuan berbeda: 1) Bagi kelas menjadi 3-4 kelompok berdasarkan kemampuan, 2) Berikan tugas mandiri untuk kelompok yang lebih tinggi saat membimbing kelompok rendah, 3) Gunakan bahan ajar berdiferensiasi dari satu tema.",
        "kategori": "strategi_guru",
    },
    {
        "id": 5,
        "judul": "Panduan Tiga Bulan Pertama di Sekolah Rakyat",
        "konten": "Tiga bulan pertama adalah fase paling kritis. Fokus pada: 1) Membangun kepercayaan dan rasa aman, 2) Mengetahui titik pijak setiap siswa, 3) Mengelompokkan berdasarkan kemampuan, 4) Memberi pendampingan intensif untuk siswa yang tertinggal.",
        "kategori": "strategi_guru",
    },
]


def simple_rag_search(pertanyaan: str) -> List[dict]:
    """
    Simple RAG search using keyword matching (placeholder for vector search).
    In production, use pgvector for semantic search.
    """
    keywords = pertanyaan.lower().split()
    results = []
    
    for doc in KNOWLEDGE_BASE:
        score = 0
        konten_lower = doc["konten"].lower()
        judul_lower = doc["judul"].lower()
        
        for keyword in keywords:
            if keyword in konten_lower or keyword in judul_lower:
                score += 1
        
        if score > 0:
            results.append({
                "id": doc["id"],
                "judul": doc["judul"],
                "kutipan": doc["konten"][:200] + "...",
                "skor": score / len(keywords),
            })
    
    # Sort by score
    results.sort(key=lambda x: x["skor"], reverse=True)
    
    return results[:3]


def generate_answer(pertanyaan: str, sources: List[dict]) -> str:
    """
    Generate answer based on sources (placeholder for LLM).
    """
    if not sources:
        return "Maaf, saya tidak menemukan informasi yang relevan. Silakan tanyakan hal lain atau hubungi administrator."
    
    # Simple template answer
    answer = "Berdasarkan panduan:\n\n"
    
    for i, src in enumerate(sources[:2], 1):
        answer += f"{i}. {src['kutipan']}\n\n"
    
    answer += "Semoga membantu! Jika masih ada pertanyaan, silakan tanyakan lebih lanjut."
    
    return answer


@router.post("/tanya", response_model=ChatResponse)
async def tanya(
    data: ChatTanya,
    db: AsyncSession = Depends(get_db),
):
    """
    Bertanya ke asisten RAG.
    """
    # Search knowledge base
    sources = simple_rag_search(data.pertanyaan)
    
    # Generate answer
    jawaban = generate_answer(data.pertanyaan, sources)
    
    # Format sources
    sumber = [
        SumberRujukan(
            judul=s["judul"],
            kutipan=s["kutipan"],
            skor=s["skor"],
        )
        for s in sources
    ]
    
    return ChatResponse(
        jawaban=jawaban,
        sumber=sumber,
        keyakinan=0.85 if sources else 0.3,
    )


@router.get("/suggested", response_model=List[str])
async def get_suggested_questions():
    """
    Mendapatkan pertanyaan yang sering ditanyakan.
    """
    return [
        "Bagaimana mengajar anak yang belum kenal huruf di usia SMA?",
        "Siswa saya 3 minggu di tangga 2 tidak naik. Apa yang harus dilakukan?",
        "Metode bermain untuk belajar penjumlahan dasar",
        "Bagaimana mengelola kelas dengan 6 tingkat kemampuan berbeda?",
        "Tips untuk tiga bulan pertama di Sekolah Rakyat",
    ]