"""
Vercel serverless entrypoint. Vercel's Python runtime looks for an ASGI/WSGI
app object in files under api/ - this just re-exports the real FastAPI app
so backend/app stays the single source of truth (and `uvicorn app.main:app`
still works unchanged for local dev / docker-compose).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402
