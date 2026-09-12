"""
TANGGA - Pemetaan Titik Pijak Belajar untuk Kurikulum Persiapan Sekolah Rakyat
Backend API with FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import asesmen, tangga, bahan, rencana, chat, statistik

app = FastAPI(
    title="TANGGA API",
    description="Pemetaan Titik Pijak Belajar untuk Kurikulum Persiapan Sekolah Rakyat",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asesmen.router, prefix="/api/asesmen", tags=["asesmen"])
app.include_router(tangga.router, prefix="/api/tangga", tags=["tangga"])
app.include_router(bahan.router, prefix="/api/bahan", tags=["bahan"])
app.include_router(rencana.router, prefix="/api/rencana", tags=["rencana"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(statistik.router, prefix="/api/statistik", tags=["statistik"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/info")
async def info():
    return {
        "nama": "TANGGA",
        "deskripsi": "Pemetaan Titik Pijak Belajar untuk Kurikulum Persiapan Sekolah Rakyat",
        "versi": "1.0.0",
    }