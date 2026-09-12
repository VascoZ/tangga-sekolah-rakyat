# Rencana Implementasi TANGGA

> **Pemetaan Titik Pijak Belajar untuk Kurikulum Persiapan Sekolah Rakyat**
> Sprint: 2–13 September 2026 | Tim: 3 orang (opsi solo)

---

## DAFTAR ISI

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Tech Stack](#2-tech-stack)
3. [Desain Database](#3-desain-database)
4. [Desain API](#4-desain-api)
5. [Struktur Proyek](#5-struktur-proyek)
6. [Komponen AI](#6-komponen-ai)
7. [Alur Data & Asesmen](#7-alur-data--asesmen)
8. [Rencana Sprint Harian](#8-rencana-sprint-harian)
9. [Pembagian Tugas Tim](#9-pembagian-tugas-tim)
10. [Desain Komponen Frontend](#10-desain-komponen-frontend)
11. [Strategi Data Sintetis](#11-strategi-data-sintetis)
12. [Checklist MVP](#12-checklist-mvp)

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│       FRONTEND (PWA)        │     │        BACKEND (FastAPI)      │
│                             │     │                              │
│  ┌───────────────────────┐  │     │  ┌────────────────────────┐  │
│  │   Halaman Guru        │  │     │  │  Router: Asesmen       │  │
│  │  - Asesmen lisan      │──┼─────┼─▶│  POST /asesmen/mulai   │  │
│  │  - Daftar siswa       │  │     │  │  POST /asesmen/jawab   │  │
│  │  - Pengelompokan      │  │     │  │  GET  /asesmen/hasil   │  │
│  │  - Rencana pendampingan│  │     │  └────────────────────────┘  │
│  └───────────────────────┘  │     │                              │
│                             │     │  ┌────────────────────────┐  │
│  ┌───────────────────────┐  │     │  │  Router: Tangga        │  │
│  │  Halaman Kepsek       │  │     │  │  GET  /tangga/siswa    │  │
│  │  - Sebaran titik pijak│──┼─────┼─▶│  GET  /tangga/kelompok │  │
│  │  - Kemajuan kelompok  │  │     │  │  GET  /tangga/sekolah  │  │
│  │  - Siswa prioritas    │  │     │  └────────────────────────┘  │
│  └───────────────────────┘  │     │                              │
│                             │     │  ┌────────────────────────┐  │
│  ┌───────────────────────┐  │     │  │  Router: Bahan Ajar    │  │
│  │  Halaman Pengelola    │  │     │  │  POST /bahan/generate  │  │
│  │  - Agregat lintas     │──┼─────┼─▶│  GET  /bahan/rencana   │  │
│  │    sekolah             │  │     │  └────────────────────────┘  │
│  │  - Analitik kemajuan  │  │     │                              │
│  └───────────────────────┘  │     │  ┌────────────────────────┐  │
│                             │     │  │  Router: Chat (RAG)    │  │
│  IndexedDB (offline queue)  │     │  │  POST /chat/tanya      │  │
└─────────────────────────────┘     │  │  GET  /chat/suggested  │  │
                                    │  └────────────────────────┘  │
                                    │                              │
                                    │  ┌────────────────────────┐  │
                                    │  │  Mesin: Scoring         │  │
                                    │  │  - Penempatan tangga    │  │
                                    │  │  - Deteksi stagnasi     │  │
                                    │  │  - Kecepatan pergerakan │  │
                                    │  └────────────────────────┘  │
                                    │                              │
                                    │  ┌────────────────────────┐  │
                                    │  │  AI Layer (OpenAI SDK)  │  │
                                    │  │  - Pembangkit bahan     │  │
                                    │  │  - Rencana individual   │  │
                                    │  │  - RAG asisten guru    │  │
                                    │  └────────────────────────┘  │
                                    │                              │
                                    │  PostgreSQL + pgvector       │
                                    └──────────────────────────────┘
```

### Prinsip Arsitektur

- **PWA mobile-first** untuk tablet guru — asesmen harus bisa dilakukan sambil berjalan
- **Deterministic core, AI enhancement** — penempatan tangga SELALU hasil asesmen guru (bisa diaudit). AI hanya pembangkit bahan + asisten.
- **Offline-capable** — daerah 3T mungkin tidak selalu terkoneksi
- **Data sintetis dulu** — tidak ada data siswa nyata di MVP

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| **Frontend** | React 18 + Vite | Sama dengan SIGAP — familiar, cepat, PWA-ready |
| **Styling** | Tailwind CSS 3 | Konsisten dengan proyek yang ada |
| **Routing** | React Router DOM 6 | SPA routing, protected routes per role |
| **PWA** | vite-plugin-pwa | Service worker, offline cache, install prompt |
| **Chart** | Recharts | Grafik pergerakan tangga (line chart, bar chart) |
| **Offline** | idb (IndexedDB) | Queue asesmen offline, sinkronisasi nanti |
| **Backend** | FastAPI (Python 3.12) | Async, Pydantic validasi, sama dengan SIGAP |
| **Database** | PostgreSQL + pgvector | Untuk RAG embedding pencarian artikel panduan |
| **ORM** | SQLAlchemy 2.0 (async) | Async queries, sama dengan SIGAP |
| **AI/LLM** | OpenAI SDK (gpt-4o-mini) | Pembangkit bahan + RAG + rencana individual |
| **RAG** | pgvector + OpenAI embeddings | Pencarian semantik panduan literasi |
| **Deploy** | Docker Compose | 3 service: db, backend, frontend (Nginx) |

### Mengapa PostgreSQL (bukan SQLite)?

- `pgvector` dibutuhkan untuk RAG (pencarian semantik panduan guru)
- Data agregat lintas sekolah akan besar (target 500 sekolah)
- Production-ready. SQLite tidak cocok untuk banyak concurrent user

---

## 3. Desain Database

### 3.1 Entity Relationship

```
┌──────────────┐       ┌──────────────────┐       ┌───────────────────┐
│   SEKOLAH    │       │     KELAS        │       │      SISWA        │
│──────────────│       │──────────────────│       │───────────────────│
│ id (PK)      │──1:N──│ id (PK)          │──1:N──│ id (PK)           │
│ nama         │       │ sekolah_id (FK)  │       │ kelas_id (FK)     │
│ provinsi     │       │ nama             │       │ kode (anonim)     │
│ kabupaten    │       │ jenjang          │       │ jenjang           │
│ kecamatan    │       │ tahun_ajaran     │       │ tgl_masuk         │
│ titik_koordinat      │ guru_id (FK)     │       │ status_aktif      │
└──────────────┘       └──────────────────┘       └───────────────────┘
                                                              │
                                                              │ 1:N
                                                              │
                                              ┌───────────────┴──────────────────┐
                                              │                                  │
                                    ┌──────────────────┐              ┌──────────────────┐
                                    │  ASESMEN_SISWA   │              │  RIWAYAT_TANGGA  │
                                    │──────────────────│              │──────────────────│
                                    │ id (PK)          │              │ id (PK)          │
                                    │ siswa_id (FK)    │              │ siswa_id (FK)    │
                                    │ guru_id (FK)     │              │ jenis (LIT/NUM)  │
                                    │ tgl_asesmen      │              │ tangga_awal      │
                                    │ jenis (LIT/NUM)  │              │ tangga_akhir     │
                                    │ tangga_awal      │              │ tgl_perubahan    │
                                    │ tangga_hasil     │              │ asesmen_id (FK)  │
                                    │ detail_jawaban   │──1:N──       │ lama_hari        │
                                    │ durasi_detik     │──▶   ┌───────┴──────┐          │
                                    │ status           │      │ JAWABAN_ITEM │          │
                                    └──────────────────┘      │──────────────│          │
                                                               │ id (PK)      │          │
                                                               │ asesmen_id   │          │
                                                               │ item_ke      │          │
                                                               │ tingkatan    │          │
                                                               │ jenis_kemampuan│        │
                                                               │ jawaban (B/S)│          │
                                                               │ catatan      │          │
                                                               └──────────────┘          │
                                                                                        │
┌──────────────┐       ┌──────────────────┐       ┌───────────────────┐                │
│    GURU      │       │   BAHAN_AJAR     │       │ RENCANA_PENDAMPING│                │
│──────────────│       │──────────────────│       │───────────────────│ ←───────────────┘
│ id (PK)      │──1:N──│ id (PK)          │       │ id (PK)           │
│ nama         │       │ tema             │       │ siswa_id (FK)     │
│ nip          │       │ tanggal          │       │ minggu_ke         │
│ peran        │       │ tingkat          │       │ tgl_mulai         │
└──────────────┘       │ konten_json      │       │ tgl_selesai       │
                       │ dibuat_oleh (FK) │       │ kegiatan_json     │
                       └──────────────────┘       │ target_tangga     │
                                                  │ dibuat_oleh (FK)  │
                                                  └───────────────────┘
```

### 3.2 Model SQLAlchemy

```python
# backend/app/models.py

class Sekolah(Base):
    __tablename__ = "sekolah"
    id = Column(Integer, primary_key=True)
    nama = Column(String(200))
    provinsi = Column(String(100))
    kabupaten = Column(String(100))
    kecamatan = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    tipe = Column(String(50), default="sekolah_rakyat")
    # relasi
    kelas_list = relationship("Kelas", back_populates="sekolah")


class Guru(Base):
    __tablename__ = "guru"
    id = Column(Integer, primary_key=True)
    nama = Column(String(200))
    nip = Column(String(30), unique=True)
    peran = Column(String(20))  # "wali_kelas", "kepala_sekolah", "pengelola"
    sekolah_id = Column(Integer, ForeignKey("sekolah.id"))


class Kelas(Base):
    __tablename__ = "kelas"
    id = Column(Integer, primary_key=True)
    sekolah_id = Column(Integer, ForeignKey("sekolah.id"))
    nama = Column(String(50))  # "Kelas A - SMP"
    jenjang = Column(String(10))  # "SD", "SMP", "SMA"
    tahun_ajaran = Column(String(20))
    guru_id = Column(Integer, ForeignKey("guru.id"))
    # relasi
    siswa_list = relationship("Siswa", back_populates="kelas")


class Siswa(Base):
    __tablename__ = "siswa"
    id = Column(Integer, primary_key=True)
    kode = Column(String(20), unique=True)  # anonim: "SR-001-0001"
    kelas_id = Column(Integer, ForeignKey("kelas.id"))
    jenjang = Column(String(10))
    tgl_masuk = Column(DateTime)
    status_aktif = Column(Boolean, default=True)
    # relasi
    posisi_tangga = relationship("PosisiTangga", back_populates="siswa")


class PosisiTangga(Base):
    """Posisi TERKINI seorang siswa di tangga literasi/numerasi"""
    __tablename__ = "posisi_tangga"
    id = Column(Integer, primary_key=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"), unique=True)
    tangga_literasi = Column(Integer, default=None, nullable=True)  # 0-6, None=belum asesmen
    tangga_numerasi = Column(Integer, default=None, nullable=True)  # 0-5
    tgl_terakhir_asesmen_literasi = Column(DateTime)
    tgl_terakhir_asesmen_numerasi = Column(DateTime)
    pekan_ke_di_tangga = Column(Integer, default=0)  # berapa pekan di tangga ini


class AsesmenSiswa(Base):
    """Satu sesi asesmen lengkap per jenis"""
    __tablename__ = "asesmen_siswa"
    id = Column(Integer, primary_key=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    guru_id = Column(Integer, ForeignKey("guru.id"))
    tgl_asesmen = Column(DateTime)
    jenis = Column(String(10))  # "LITERASI" / "NUMERASI"
    tangga_awal = Column(Integer, nullable=True)
    tangga_hasil = Column(Integer)
    durasi_detik = Column(Integer)
    status = Column(String(20), default="selesai")  # "berlangsung", "selesai", "terputus"
    # relasi
    jawaban_items = relationship("JawabanItem", back_populates="asesmen")


class JawabanItem(Base):
    """Satu butir pertanyaan dalam satu asesmen"""
    __tablename__ = "jawaban_item"
    id = Column(Integer, primary_key=True)
    asesmen_id = Column(Integer, ForeignKey("asesmen_siswa.id"))
    item_ke = Column(Integer)  # urutan 1-7 (literasi) / 1-6 (numerasi)
    tingkatan = Column(Integer)  # anak tangga 0-6 yang diuji
    jenis_kemampuan = Column(String(100))  # "mengenal_huruf", "membaca_kata", dll
    jawaban = Column(Boolean)  # True=benar, False=salah
    catatan = Column(Text)
    jawaban_siswa = Column(Text)  # apa yang dijawab siswa (opsional)


class RiwayatTangga(Base):
    """Log setiap kali seorang siswa naik/turun tangga"""
    __tablename__ = "riwayat_tangga"
    id = Column(Integer, primary_key=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    jenis = Column(String(10))  # "LITERASI" / "NUMERASI"
    tangga_awal = Column(Integer)
    tangga_akhir = Column(Integer)
    tgl_perubahan = Column(DateTime)
    asesmen_id = Column(Integer, ForeignKey("asesmen_siswa.id"))
    lama_hari = Column(Integer)  # berapa hari sejak perubahan terakhir


class BahanAjar(Base):
    """Bahan ajar yang dihasilkan AI untuk satu tema/tingkat"""
    __tablename__ = "bahan_ajar"
    id = Column(Integer, primary_key=True)
    tema = Column(String(200))  # "Lingkungan Sekitarku", "Buah dan Sayur", dll
    tanggal = Column(DateTime)
    tingkat = Column(Integer)  # anak tangga 0-6
    konten_json = Column(JSON)  # {"judul": "...", "instruksi": "...", "teks": "...", "soal": [...]}
    dibuat_oleh = Column(Integer, ForeignKey("guru.id"))


class RencanaPendampingan(Base):
    """Rencana belajar individual per siswa per minggu"""
    __tablename__ = "rencana_pendampingan"
    id = Column(Integer, primary_key=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    minggu_ke = Column(Integer)
    tgl_mulai = Column(DateTime)
    tgl_selesai = Column(DateTime)
    kegiatan_json = Column(JSON)  # [{"kegiatan": "...", "durasi_menit": 15, "target": "..."}, ...]
    target_tangga = Column(Integer)  # target naik ke tangga berapa
    indikator = Column(Text)  # "mampu membaca 5 kata sederhana tanpa bantuan"
    dibuat_oleh = Column(Integer, ForeignKey("guru.id"))


class PenandaStagnasi(Base):
    """Siswa yang ditandai tidak naik dalam 3+ minggu"""
    __tablename__ = "penanda_stagnasi"
    id = Column(Integer, primary_key=True)
    siswa_id = Column(Integer, ForeignKey("siswa.id"))
    jenis = Column(String(10))
    tgl_ditandai = Column(DateTime)
    pekan_stagnan = Column(Integer)
    status = Column(String(20))  # "aktif", "ditangani", "selesai"
    catatan_guru = Column(Text)
```

### 3.3 Tabel untuk RAG (pgvector extension)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE panduan_docs (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(300),
    konten TEXT,
    kategori VARCHAR(100),  -- "literasi_dasar", "numerasi_dasar", "remedial", "motivasi"
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
    tgl_dibuat TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_panduan_embedding ON panduan_docs
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
```

### 3.4 Korpus RAG (16+ dokumen)

| # | Judul | Kategori |
|---|---|---|
| 1 | Pengenalan huruf untuk anak yang belum mengenal alfabet | literasi_dasar |
| 2 | Metode suku kata: tahapan dari mengenal ke membaca | literasi_dasar |
| 3 | Membaca kata utuh: strategi untuk transisi dari suku kata | literasi_dasar |
| 4 | Membaca kalimat sederhana: dari 3 kata ke paragraf | literasi_dasar |
| 5 | Membaca pemahaman: bagaimana menguji pemahaman bacaan | literasi_dasar |
| 6 | Mengatasi anak yang stagnan di pengenalan huruf | remedial |
| 7 | Strategi untuk anak yang sudah 4 minggu tidak naik tangga | remedial |
| 8 | Membaca sambil bermain: aktivitas literasi non-formal | motivasi |
| 9 | Mengenal bilangan 1-9 dengan benda sekitar | numerasi_dasar |
| 10 | Bilangan 10-99 dan perbandingan | numerasi_dasar |
| 11 | Penjumlahan dan pengurangan dasar: metode konkret | numerasi_dasar |
| 12 | Perkalian dan pembagian: dari konkret ke abstrak | numerasi_dasar |
| 13 | Soal cerita sederhana: menghubungkan matematika dengan kehidupan | numerasi_dasar |
| 14 | Mengelola kelas multi-tingkat dalam satu ruangan | strategi_guru |
| 15 | Panduan tiga bulan pertama di Sekolah Rakyat | strategi_guru |
| 16 | Membangun kepercayaan diri siswa yang pernah putus sekolah | motivasi |

---

## 4. Desain API

### 4.1 Asesmen

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/asesmen/mulai` | `{siswa_id, jenis: "LITERASI\|NUMERASI"}` | `{asesmen_id, tangga_awal, urutan_item}` | Mulai sesi asesmen baru. System menentukan mulai dari tangga berapa berdasarkan posisi terakhir |
| `POST` | `/api/asesmen/jawab` | `{asesmen_id, item_ke, jawaban: true\|false, jawaban_siswa}` | `{next_item \| hasil_akhir}` | Merekam jawaban dan menentukan langkah berikutnya (adaptif) |
| `GET` | `/api/asesmen/{id}` | — | `{...asesmen, jawaban_items, hasil}` | Detail satu sesi asesmen |
| `GET` | `/api/asesmen/siswa/{siswa_id}` | — | `[...riwayat_asesmen]` | Riwayat asesmen seorang siswa |

### 4.2 Tangga & Pengelompokan

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/tangga/siswa/{id}` | — | `{siswa, posisi_tangga, riwayat_pergerakan, pekan_stagnan}` | Detail titik pijak seorang siswa |
| `GET` | `/api/tangga/kelas/{kelas_id}` | — | `{kelas, daftar_siswa_dengan_tangga, pengelompokan}` | Pengelompokan otomatis per tangga |
| `GET` | `/api/tangga/sekolah/{id}` | — | `{sebaran_literasi, sebaran_numerasi, rerata_pergerakan}` | Dashboard kepala sekolah |
| `GET` | `/api/tangga/agregat` | — | `{per_provinsi, per_kabupaten, tren_bulanan}` | Dashboard pengelola program |

### 4.3 Bahan Ajar

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/bahan/generate` | `{tema, kelas_id}` | `{bahan_per_tingkat: [{tingkat, konten}]}` | AI menghasilkan bahan untuk 6 tingkat dari 1 tema |
| `GET` | `/api/bahan/list` | `?guru_id=&tema=` | `[...bahan_ajar]` | Daftar bahan yang sudah dibuat |
| `GET` | `/api/bahan/{id}` | — | `{bahan_ajar}` | Detail satu bahan ajar |

### 4.4 Rencana Pendampingan

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/rencana/generate` | `{siswa_id}` | `{rencana_pendampingan}` | AI menghasilkan rencana mingguan individual |
| `GET` | `/api/rencana/siswa/{id}` | — | `[...rencana]` | Riwayat rencana untuk satu siswa |
| `GET` | `/api/rencana/kelas/{kelas_id}` | `?minggu_ke=` | `[...rencana]` | Semua rencana di satu kelas minggu ini |

### 4.5 Asisten RAG (Peregang)

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `POST` | `/api/chat/tanya` | `{pertanyaan}` | `{jawaban, sumber: [{judul, kutipan, skor}], keyakinan}` | Tanya asisten dengan RAG dari panduan literasi |
| `GET` | `/api/chat/suggested` | — | `[...pertanyaan_saran]` | Pertanyaan yang sering ditanyakan |

### 4.6 Stagnasi (Peregang)

| Method | Endpoint | Request | Response | Deskripsi |
|---|---|---|---|---|
| `GET` | `/api/stagnasi/cek` | `?kelas_id=` | `[...siswa_stagnan]` | Daftar siswa yang >3 minggu tidak naik |
| `POST` | `/api/stagnasi/tangani` | `{siswa_id, catatan}` | `{penanda}` | Guru menandai sudah ditangani |

### 4.7 Utility

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/api/health` | `{status: "ok"}` |
| `GET` | `/api/stats` | `{total_sekolah, total_siswa, total_asesmen, distribusi_tangga}` |

---

## 5. Struktur Proyek

```
tangga-sekolah-rakyat/
├── .env                            # OPENAI_API_KEY, DATABASE_URL, VECTOR_DB_URL
├── docker-compose.yml              # 4 services: db, backend, frontend, seed
├── README.md
│
├── backend/
│   ├── Dockerfile                  # Python 3.12-slim + uvicorn
│   ├── requirements.txt
│   │   ├── fastapi==0.115.6
│   │   ├── uvicorn[standard]==0.34.0
│   │   ├── sqlalchemy[asyncio]==2.0.36
│   │   ├── asyncpg==0.30.0          # PostgreSQL async driver
│   │   ├── pgvector==0.3.6          # pgvector SQLAlchemy extension
│   │   ├── pydantic==2.10.3
│   │   ├── openai==1.58.1
│   │   ├── numpy==2.2.1
│   │   ├── python-dotenv==1.0.1
│   │   └── httpx==0.28.1
│   │
│   ├── seed_db.py                  # Generator data sintetis 90 siswa
│   ├── seed_rag.py                 # Populasi dokumen RAG ke pgvector
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # FastAPI entry, CORS, routers
│       ├── config.py               # ENV vars
│       ├── database.py             # Async engine + session
│       ├── models.py               # 9 SQLAlchemy models (§3.2)
│       ├── schemas.py              # Pydantic request/response schemas
│       │
│       ├── tangga/                 # 🆕 Core: tangga kemampuan
│       │   ├── __init__.py
│       │   ├── definisi.py         # Definisi 7+6 anak tangga (§4 brief)
│       │   ├── butir_asesmen.py    # Soal-soal per tangga (hardcoded + templat AI)
│       │   └── penempatan.py       # Logika adaptif: "lulus tingkat ini? lanjut ke atas/bawah"
│       │
│       ├── ai/                     # 🆕 AI components
│       │   ├── __init__.py
│       │   ├── pembangkit_bahan.py # LLM prompt untuk menghasilkan 6 tingkat bahan
│       │   ├── rencana_individual.py  # LLM prompt untuk rencana mingguan
│       │   ├── asisten_guru.py     # RAG query + conversation
│       │   └── deteksi_stagnasi.py # Perbandingan peer-group + rules
│       │
│       ├── rag/                    # 🆕 RAG system
│       │   ├── __init__.py
│       │   ├── engine.py           # Embedding + query pgvector
│       │   └── korpus.py           # 16+ dokumen panduan hardcoded
│       │
│       └── routers/
│           ├── __init__.py
│           ├── asesmen.py          # POST /mulai, POST /jawab
│           ├── tangga.py           # GET /siswa, /kelas, /sekolah, /agregat
│           ├── bahan.py            # POST /generate, GET /list, /{id}
│           ├── rencana.py          # POST /generate, GET /siswa, /kelas
│           ├── chat.py             # POST /tanya, GET /suggested
│           └── stagnasi.py         # GET /cek, POST /tangani
│
├── frontend/
│   ├── Dockerfile                  # Multi-stage: Node build + Nginx serve
│   ├── nginx.conf
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js          # Warna tema Sekolah Rakyat (beda dari SIGAP)
│   ├── postcss.config.js
│   ├── package.json
│   │
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   └── icon-192.png
│   │
│   └── src/
│       ├── main.jsx                # ReactDOM + BrowserRouter
│       ├── App.jsx                 # Route definitions
│       ├── index.css               # Tailwind + custom
│       │
│       ├── lib/
│       │   ├── api.js              # Fetch wrapper (~15 endpoints)
│       │   ├── auth.js             # Role-based session (simplified)
│       │   └── db.js               # IndexedDB untuk offline asesmen
│       │
│       ├── components/             # Shared components
│       │   ├── TanggaBadge.jsx     # Badge "Tangga 3 - Membaca Kata"
│       │   ├── PergerakanChart.jsx # Recharts line chart gerakan tangga
│       │   ├── PengelompokanCard.jsx # Card per kelompok
│       │   ├── StatusStagnasi.jsx  # Indikator siswa stagnan
│       │   └── DiffBahanCard.jsx   # Kartu bahan ajar per tingkat
│       │
│       ├── pages/
│       │   ├── Landing.jsx         # Landing page (opsional untuk demo)
│       │   └── Login.jsx           # Pilih peran: Guru / Kepsek / Pengelola
│       │
│       ├── guru/                   # 🆕 UI Guru (mobile-first)
│       │   ├── LayoutGuru.jsx      # Bottom nav: Asesmen, Kelas, Bahan, Chat
│       │   ├── AsesmenLisan.jsx    # ⭐ HALAMAN INTI: panduan asesmen lisan
│       │   ├── DaftarSiswa.jsx     # Daftar siswa + titik pijak
│       │   ├── Pengelompokan.jsx   # Kelompok otomatis + drag antar kelompok
│       │   ├── BahanDiferensiasi.jsx  # Generate & lihat bahan per tingkat
│       │   ├── RencanaIndividu.jsx # Rencana pendampingan per siswa
│       │   └── ChatGuru.jsx        # Asisten RAG
│       │
│       ├── kepsek/                 # 🆕 UI Kepala Sekolah (desktop/tablet)
│       │   ├── LayoutKepsek.jsx    # Sidebar: Dashboard, Per Kelas, Prioritas
│       │   ├── DashboardKepsek.jsx # Sebaran titik pijak + kemajuan
│       │   ├── PerKelas.jsx        # Detail per kelas
│       │   └── SiswaPrioritas.jsx  # Siswa flag stagnasi
│       │
│       └── pengelola/              # 🆕 UI Pengelola Program
│           ├── LayoutPengelola.jsx # Sidebar: Agregat, Peta, Analitik
│           ├── DashboardAgregat.jsx # Lintas sekolah
│           └── AnalitikPergerakan.jsx # Tren, sekolah paling lambat
│
└── scripts/
    └── validate_tangga.py          # Validasi logika penempatan tangga
```

---

## 6. Komponen AI

### 6.1 Pembangkit Bahan Ajar Berdiferensiasi

**Input:** `{tema, daftar_tingkat: [0,1,2,3,4,5,6]}`

**Prompt template:**
```
Kamu adalah penyusun bahan ajar untuk program literasi di Sekolah Rakyat Indonesia.
Buatkan bahan ajar untuk tema "{tema}" untuk 7 tingkat kemampuan:

Tingkat 0 (Belum mengenal huruf): Kartu huruf, 5 huruf besar dengan gambar benda yang diawali huruf tersebut
Tingkat 1 (Mengenal huruf): Lembar kerja menebalkan huruf, 5 huruf
Tingkat 2 (Membaca suku kata): Kartu suku kata (ba-, ca-, da-) dengan gambar
Tingkat 3 (Membaca kata utuh): Lembar baca 5 kata sederhana bertema {tema}
Tingkat 4 (Membaca kalimat): 3 kalimat pendek (4-6 kata) bertema {tema}
Tingkat 5 (Membaca paragraf lancar): Paragraf 4-5 kalimat bertema {tema}
Tingkat 6 (Memahami bacaan): Paragraf + 3 pertanyaan pemahaman (2 tersurat, 1 tersirat)

Gunakan bahasa Indonesia sederhana. Konteks: pedesaan/lokal.

Output dalam JSON:
{
  "tingkat_0": {"instruksi_guru": "...", "kartu": [{"huruf": "A", "gambar": "ayam"}, ...]},
  "tingkat_1": {...},
  ...
}
```

**Output:** JSON terstruktur yang di-render sebagai kartu interaktif di frontend.

### 6.2 Rencana Pendampingan Individual

**Input:** `{siswa: {kode, jenjang, tangga_literasi, tangga_numerasi}, riwayat: [...pergerakan], pekan_stagnan}`

**Prompt template:**
```
Seorang siswa Sekolah Rakyat (jenjang {jenjang}, kode {kode}) berada di:
- Tangga Literasi: {tangga_literasi} dari 6
- Tangga Numerasi: {tangga_numerasi} dari 5
- Sudah {n} pekan di tangga ini

Buatkan rencana pendampingan individual untuk 1 minggu ke depan.
Target: naik dari tangga {tangga_sekarang} ke tangga {tangga_target} untuk literasi.

Rencana harus mencakup:
1. 3-5 kegiatan harian (15-20 menit per kegiatan)
2. Indikator keberhasilan yang bisa diamati guru
3. Saran untuk guru jika siswa masih kesulitan

Gunakan bahasa yang memberdayakan, tidak melabeli.

Output JSON:
{
  "minggu_ke": ...,
  "target_tangga": ...,
  "indikator": "...",
  "kegiatan": [
    {"hari": 1, "kegiatan": "...", "durasi_menit": 15, "instruksi_guru": "..."},
    ...
  ]
}
```

### 6.3 Asisten Guru (RAG)

**Flow:**
1. User bertanya: "anak saya sudah 3 minggu di tangga 2 tidak naik, apa yang harus saya lakukan?"
2. Embedding pertanyaan → cari di pgvector (top-3 dokumen)
3. Prompt LLM dengan konteks dokumen sebagai system prompt
4. Jawaban dengan sumber rujukan

**Prompt template:**
```
Kamu adalah asisten guru di Sekolah Rakyat. Jawab pertanyaan berikut dengan merujuk pada dokumen panduan yang diberikan.

DOKUMEN RUJUKAN:
{dokumen_1}
{dokumen_2}
{dokumen_3}

PERTANYAAN GURU: {pertanyaan}

Jawablah dengan:
1. Jawaban praktis dan konkret
2. Sebutkan sumber rujukan
3. Jangan melabeli siswa dengan istilah negatif
4. Gunakan bahasa Indonesia yang sederhana dan memberdayakan
```

### 6.4 Deteksi Stagnasi (Rules-based + AI enrichment)

**Rules-based (deterministic):**
```python
def deteksi_stagnasi(siswa_id, kelas_id):
    posisi = get_posisi_tangga(siswa_id)
    if posisi.pekan_ke_di_tangga >= 3:
        # Bandingkan dengan peer group (siswa di tangga yang sama, kelas yang sama)
        peers = get_peers_sama_tangga(kelas_id, posisi.tangga_literasi)
        rerata_pekan_peer = mean([p.pekan_ke_di_tangga for p in peers])
        
        if posisi.pekan_ke_di_tangga > rerata_pekan_peer * 1.5:
            return {
                "status": "stagnan",
                "pekan": posisi.pekan_ke_di_tangga,
                "rerata_peer": rerata_pekan_peer,
                "severity": "BERAT" if posisi.pekan_ke_di_tangga >= 5 else "SEDANG"
            }
    return {"status": "normal"}
```

---

## 7. Alur Data & Asesmen

### 7.1 Alur Asesmen Adaptif (Algorithm Detail)

```
MULAI ASESMEN LITERASI untuk Siswa X
│
├─ Cek posisi tangga terakhir (misal: tangga 2 - membaca suku kata)
│
├─ MULAI DARI TANGGA TERAKHIR
│   │
│   ├─ UJI TINGKAT 2: "Baca 'ba-tu'"
│   │   ├─ BENAR (>= 3/5 item) → lanjut ke tingkat 3
│   │   └─ SALAH (< 3/5) → mundur ke tingkat 1
│   │
│   ├─ UJI TINGKAT 3 (jika naik): "Baca kata 'batu'"
│   │   ├─ BENAR → lanjut ke tingkat 4
│   │   └─ SALAH → TANGGA HASIL = 2 (ini titik pijaknya)
│   │
│   └─ ... (lanjut sampai gagal 2 tingkat di atas level terakhir yang lulus)
│
├─ SIMPAN HASIL
│   ├─ posisi_tangga.tangga_literasi = HASIL
│   ├─ riwayat_tangga: INSERT log perubahan
│   └─ asesmen_siswa + jawaban_items: INSERT detail
│
└─ TRIGGER
    ├─ Update pengelompokan kelas (recompute otomatis)
    └─ Cek stagnasi (bandingkan dengan peer)
```

### 7.2 Alur Pembangkit Bahan Ajar

```
GURU input: tema = "Lingkungan Sekitarku"
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  BACKEND: POST /api/bahan/generate          │
│                                             │
│  1. Ambil daftar tingkat dari pengelompokan │
│     kelas (misal: butuh tingkat 1,2,3,4,6)  │
│                                             │
│  2. Cek cache: apa sudah ada bahan tema ini │
│     untuk tingkat-tingkat yang dibutuhkan?   │
│     ├─ Ada + < 7 hari → return cached       │
│     └─ Tidak → generate via LLM              │
│                                             │
│  3. LLM generate (gpt-4o-mini):             │
│     - 1 API call untuk semua tingkat        │
│     - Prompt structured JSON output         │
│     - Fallback: templat hardcoded jika API  │
│       gagal atau key tidak ada               │
│                                             │
│  4. Simpan ke tabel bahan_ajar              │
│  5. Return JSON ke frontend                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  FRONTEND: BahanDiferensiasi.jsx            │
│                                             │
│  Render 6 kartu (atau sesuai tingkat)       │
│  Setiap kartu: judul, instruksi guru,       │
│  konten, soal. Guru bisa edit inline.       │
│  Tombol "Cetak" / "Bagikan".                │
└─────────────────────────────────────────────┘
```

### 7.3 Alur Sinkronisasi Offline

```
TABLET GURU (offline)
│
├─ Guru melakukan asesmen, jawaban disimpan di IndexedDB
├─ Queue tersimpan dengan status "pending_sync"
│
└─ KONEKSI KEMBALI
    │
    ├─ Service Worker mendeteksi online
    ├─ Sinkronisasi queue ke backend
    │   ├─ POST /api/asesmen/jawab untuk setiap item
    │   └─ Hapus dari queue setelah sukses
    │
    └─ Backend menjalankan ulang logika penempatan tangga
```

---

## 8. Rencana Sprint Harian

### Minggu 1: Pondasi + Asesmen (2–6 September)

| Hari | Backend | Frontend | AI |
|---|---|---|---|
| **H1 (Selasa)** | Setup proyek, Docker Compose, models.py, database.py | Setup Vite + Tailwind + Router, halaman Login | — |
| **H2 (Rabu)** | tangga/definisi.py + butir_asesmen.py (hardcode 7+6 tingkat item) | LayoutGuru.jsx + bottom nav | — |
| **H3 (Kamis)** | tangga/penempatan.py (logika adaptif), router asesmen.py (POST /mulai, /jawab) | AsesmenLisan.jsx (UI inti: tampilkan item, tombol benar/salah) | — |
| **H4 (Jumat)** | router tangga.py (GET /siswa, /kelas), test endpoint asesmen | DaftarSiswa.jsx + Pengelompokan.jsx | — |
| **H5 (Sabtu)** | seed_db.py (90 siswa + 3 kelas + 1 sekolah), test flow end-to-end | Integrasi asesmen + pengelompokan + test manual flow | — |

**Milestone Minggu 1:** Guru bisa login → buka sesi asesmen → asesmen adaptif berjalan → siswa ditempatkan di tangga → terlihat di pengelompokan kelas.

### Minggu 2: AI + Dashboard + Polish (9–13 September)

| Hari | Backend | Frontend | AI |
|---|---|---|---|
| **H6 (Selasa)** | ai/pembangkit_bahan.py (prompt + LLM call + fallback templat) | BahanDiferensiasi.jsx (generate + display 6 kartu) | Prompt engineering bahan ajar, testing output |
| **H7 (Rabu)** | ai/rencana_individual.py, router rencana.py | RencanaIndividu.jsx, PergerakanChart.jsx (Recharts) | Prompt engineering rencana individual, format JSON |
| **H8 (Kamis)** | rag/korpus.py (16 dokumen), rag/engine.py (embed + index ke pgvector), seed_rag.py | DashboardKepsek.jsx (sebaran, kemajuan) | Embedding 16 dokumen, test RAG retrieval |
| **H9 (Jumat)** | ai/asisten_guru.py (RAG query + LLM), router chat.py | ChatGuru.jsx (tampilan chat + sumber) | RAG integration testing, relevance tuning |
| **H10 (Sabtu)** | Router stagnasi.py, ai/deteksi_stagnasi.py | SiswaPrioritas.jsx, StatusStagnasi.jsx, LayoutKepsek.jsx | — |
| **H11 (Minggu)** | Testing end-to-end, bug fixing | Polish UI, responsive, error handling | Fallback behavior (no API key), error handling |
| **H12 (Senin)** | Seed data lengkap (pergerakan beragam) + validasi | DashboardPengelola.jsx, AnalitikPergerakan.jsx | — |

**Milestone Minggu 2:** Guru generate bahan ajar berdiferensiasi → dapat rencana individual → tanya asisten → kepala sekolah lihat dashboard → pengelola lihat agregat.

---

## 9. Pembagian Tugas Tim

### Opsi 3 Orang (Ideal)

| Hari | Ketua / Pedagogis | Pengembang Aplikasi | Pengembang AI & Data |
|---|---|---|---|
| H1-3 | Desain tangga + butir asesmen + validasi | Setup proyek + model + Login + layout | Setup DB + seed data |
| H4-5 | Testing item asesmen + proposal | AsesmenLisan.jsx + DaftarSiswa.jsx | Penempatan tangga logika |
| H6-7 | Validasi bahan ajar + rencana | BahanDiferensiasi.jsx + RencanaIndividu.jsx | Pembangkit bahan + rencana individual LLM |
| H8-9 | Tulis dokumen RAG + panduan | DashboardKepsek.jsx + PergerakanChart.jsx | RAG system + embedding |
| H10-11 | Presentasi + proposal final | Polish UI + bug fix + responsive | Stagnasi detection + RAG tuning |
| H12 | Rehearse Demo Day | Deployment | Final seed + testing |

### Opsi Solo (Minimal)

Jika sendirian, **buang:**
- RAG asisten guru (ChatGuru.jsx + asisten_guru.py + rag/)
- Deteksi stagnasi (stagnasi.py + SiswaPrioritas.jsx + StatusStagnasi.jsx)
- Dashboard Pengelola (agregat lintas sekolah)
- 16 dokumen RAG → ganti jadi FAQ statis 5 item

**Yang WAJIB dipertahankan (nilai minimum):**
1. Asesmen lisan adaptif (AsesmenLisan.jsx) ⭐
2. Penempatan tangga otomatis (penempatan.py) ⭐
3. Daftar siswa + titik pijak (DaftarSiswa.jsx)
4. Pengelompokan otomatis (Pengelompokan.jsx)
5. Pembangkit bahan berdiferensiasi (BahanDiferensiasi.jsx + pembangkit_bahan.py) ⭐
6. Rencana pendampingan individual (RencanaIndividu.jsx + rencana_individual.py)
7. Grafik pergerakan (PergerakanChart.jsx)
8. Dashboard kepala sekolah simpel (DashboardKepsek.jsx)

**Untuk solo, kurangi jadi 7 hari:** H1-3 backend core + asesmen, H4-5 AI + frontend integrasi, H6-7 polish + deploy.

---

## 10. Desain Komponen Frontend

### 10.1 AsesmenLisan.jsx — Halaman Paling Kritis

```
┌──────────────────────────────────────┐
│  ◀ ASESMEN LITERASI             00:45│  ← Timer
│──────────────────────────────────────│
│  Siswa: SR-001-0001 (SMA Kelas A)   │
│  Tangga Sebelumnya: 2 (Suku Kata)   │
│──────────────────────────────────────│
│                                      │
│       ╔══════════════════════╗       │
│       ║   TINGKAT 3         ║       │
│       ║   Membaca Kata Utuh ║       │
│       ╚══════════════════════╝       │
│                                      │
│  Instruksi untuk Guru:              │
│  "Tunjuk kata di bawah. Tanyakan:   │
│   'Ini kata apa?'"                  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │        B A T U               │   │  ← Huruf besar, high contrast
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  Item 3/5 dalam tingkat ini         │
│  ●●●○○                              │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │  ✗ SALAH │  │  ✓ BENAR │        │  ← Tombol besar, mudah ditekan
│  └──────────┘  └──────────┘        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  ▶ LEWATI ITEM INI          │   │  ← Opsional untuk item terlalu sulit
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### 10.2 DaftarSiswa.jsx + Pengelompokan.jsx

```
┌────────────────────────────────────────────────────────┐
│  KELAS A - SMA │ Minggu ke-3 │ Tema: Lingkungan Sekitar│
│────────────────────────────────────────────────────────│
│                                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐│
│  │ ▲ TANGGA 0-2   │ │ █ TANGGA 3-4   │ │ ◆ TANGGA  ││
│  │ Belum Baca Kata│ │ Membaca Kata -  │ │ 5-6       ││
│  │ 12 siswa       │ │ Kalimat         │ │ Baca      ││
│  │                │ │ 10 siswa        │ │ Paragraf  ││
│  │ • SR-001 [T0] │ │ • SR-005 [T3]  │ │ 8 siswa   ││
│  │ • SR-002 [T0] │ │ • SR-008 [T4]  │ │            ││
│  │ • SR-003 [T1] │ │ • SR-012 [T3]  │ │ • SR-020   ││
│  │ • SR-004 [T2] │ │ ...             │ │ [T5]       ││
│  │ ...            │ │                 │ │ • SR-021   ││
│  │ [Stagnasi: 2] │ │ [Stagnasi: 0]   │ │ [T6]       ││
│  │                │ │                 │ │ ...        ││
│  │ [BUKA BAHAN]   │ │ [BUKA BAHAN]   │ │ [BUKA BAHAN││
│  └─────────────────┘ └─────────────────┘ └───────────┘│
│                                                        │
│  [Atur Ulang Kelompok]  [Generate Bahan Baru]         │
└────────────────────────────────────────────────────────┘
```

### 10.3 BahanDiferensiasi.jsx

```
┌────────────────────────────────────────────────────────┐
│  BAHAN AJAR: "Lingkungan Sekitarku"                    │
│  Dihasilkan: 10 Agustus 2026                           │
│────────────────────────────────────────────────────────│
│                                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │Ting 0│ │Ting 1│ │Ting 2│ │Ting 3│ │Ting 4│ │Ting 5││
│  │Huruf │ │Huruf │ │Suku  │ │Kata  │ │Kalimat│ │Parag ││
│  │      │ │      │ │Kata  │ │      │ │       │ │      ││
│  │ ⬇    │ │ ⬇    │ │ ⬇    │ │ ⬇    │ │ ⬇    │ │ ⬇    ││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│                                                        │
│  ╔════════════════════════════════════════════════════╗│
│  ║ TINGKAT 3 — Membaca Kata Utuh                    ║│
│  ║                                                  ║│
│  ║ Instruksi Guru:                                  ║│
│  ║ "Tunjukkan kartu kata satu per satu. Minta siswa ║│
│  ║  membaca kata tersebut dengan lantang. Jika      ║│
│  ║  siswa kesulitan, bantu dengan mengeja per suku  ║│
│  ║  kata."                                          ║│
│  ║                                                  ║│
│  ║ Kata-kata:                                       ║│
│  ║ 1. RUMAH     2. JALAN      3. POHON             ║│
│  ║ 4. SUNGAI    5. SAWAH                            ║│
│  ║                                                  ║│
│  ║ [✎ Edit]  [🖨 Cetak Kartu]  [💾 Simpan]        ║│
│  ╚════════════════════════════════════════════════════╝│
└────────────────────────────────────────────────────────┘
```

### 10.4 Component Tree

```
App.jsx
├── Login.jsx
│   └── Landing.jsx (opsional)
│
├── LayoutGuru.jsx                           [role: "guru"]
│   ├── AsesmenLisan.jsx                     ⭐ HALAMAN INTI
│   │   ├── TanggaBadge.jsx (tingkat saat ini)
│   │   ├── ItemAsesmen.jsx (satu butir soal)
│   │   └── TimerAsesmen.jsx
│   ├── DaftarSiswa.jsx
│   │   ├── TanggaBadge.jsx (per siswa)
│   │   ├── StatusStagnasi.jsx (per siswa)
│   │   └── PergerakanChart.jsx (mini sparkline)
│   ├── Pengelompokan.jsx
│   │   ├── PengelompokanCard.jsx (satu kolom tingkat)
│   │   └── TanggaBadge.jsx
│   ├── BahanDiferensiasi.jsx
│   │   ├── DiffBahanCard.jsx (satu kartu per tingkat)
│   │   └── GenerateBahanButton.jsx
│   ├── RencanaIndividu.jsx
│   │   └── PergerakanChart.jsx
│   └── ChatGuru.jsx (peregang)
│       └── ChatSaranPertanyaan.jsx
│
├── LayoutKepsek.jsx                         [role: "kepala_sekolah"]
│   ├── DashboardKepsek.jsx
│   │   ├── StatCard.jsx (total, sebaran, rerata)
│   │   ├── PergerakanChart.jsx (per kelompok)
│   │   └── PengelompokanCard.jsx
│   ├── PerKelas.jsx
│   └── SiswaPrioritas.jsx
│       └── StatusStagnasi.jsx
│
└── LayoutPengelola.jsx                      [role: "pengelola"]
    ├── DashboardAgregat.jsx
    │   └── PergerakanChart.jsx (lintas sekolah)
    └── AnalitikPergerakan.jsx
```

---

## 11. Strategi Data Sintetis

### 11.1 Profil 1 Sekolah Demo

- **1 Sekolah:** "Sekolah Rakyat Harapan Bangsa" (Kabupaten Bekasi)
- **3 Kelas:** Kelas A (SMA), Kelas B (SMP), Kelas C (SD)
- **90 Siswa** (30 per kelas) dengan distribusi tangga yang realistis
- **16 minggu data** (Week 1–16) dengan pola pergerakan

### 11.2 Distribusi Tangga Awal (Week 1)

| Tangga Literasi | Jumlah | Proporsi | Deskripsi |
|---|---|---|---|
| 0 (Belum kenal huruf) | 12 | 13% | Target utama — termasuk siswa SMA yang belum bisa baca |
| 1 (Mengenal huruf) | 15 | 17% | |
| 2 (Membaca suku kata) | 18 | 20% | |
| 3 (Membaca kata) | 20 | 22% | Puncak distribusi |
| 4 (Membaca kalimat) | 15 | 17% | |
| 5 (Membaca paragraf) | 7 | 8% | |
| 6 (Memahami bacaan) | 3 | 3% | Paling sedikit |

### 11.3 Pola Pergerakan (16 minggu)

```python
POLA_PERGERAKAN = [
    "stagnan_bawah",      # 10 siswa: 0→0→0→0 (tetap di tangga 0-1, butuh intervensi)
    "naik_pelan",         # 25 siswa: 0→0→1→1→1→2→2→2→2→3 (naik 1 tangga tiap 3-4 minggu)
    "naik_sedang",        # 30 siswa: 2→2→3→3→4→4→5 (naik tiap 2 minggu)
    "naik_cepat",         # 15 siswa: 4→5→5→6→6→6 (sudah tinggi, naik cepat ke tangga 6)
    "fluktuatif",         # 10 siswa: 2→3→2→2→3→4→3→4 (kadang mundur, perlu pendampingan)
]
```

### 11.4 Stagnasi Buatan

- 5 siswa stagnan >= 3 minggu di tangga 0–2 (untuk testing deteksi stagnasi)
- 3 siswa stagnan >= 5 minggu (kasus "BERAT")

### 11.5 Kode Anonim

Format: `SR-{sekolah_id:03d}-{siswa_id:04d}`
Contoh: `SR-001-0001`, `SR-001-0090`

---

## 12. Checklist MVP

### Wajib Selesai (Minggu 1 + 2)

- [ ] **Asesmen Lisan Berpandu**
  - [ ] 7 tingkat literasi (Butir soal per tingkat: 5 item)
  - [ ] 6 tingkat numerasi (Butir soal per tingkat: 5 item)
  - [ ] Logika adaptif (naik jika lulus 3/5, mundur jika gagal)
  - [ ] UI mobile-first (tablet guru)
  - [ ] Timer per sesi
  - [ ] Status "berlangsung" → resume jika terputus
  - [ ] IndexedDB offline fallback

- [ ] **Mesin Penempatan Tangga**
  - [ ] Hasil asesmen → update posisi_tangga
  - [ ] Riwayat pergerakan (riwayat_tangga)
  - [ ] Pencatatan detail jawaban (jawaban_items)

- [ ] **Layar Guru: Daftar Siswa + Pengelompokan**
  - [ ] Daftar semua siswa dengan badge tangga
  - [ ] Stagnasi indicator
  - [ ] Pengelompokan otomatis 3-4 level

- [ ] **Pembangkit Bahan Ajar Berdiferensiasi (AI)**
  - [ ] Generate dari 1 tema → 6 tingkat bahan
  - [ ] JSON terstruktur
  - [ ] Fallback templat hardcoded (jika API tidak tersedia)
  - [ ] Cache hasil (hindari regenerate)

- [ ] **Rencana Pendampingan Individual (AI)**
  - [ ] Generate per siswa dari data tangga + riwayat
  - [ ] Kegiatan harian 3-5 item
  - [ ] Indikator keberhasilan terukur

- [ ] **Grafik Pergerakan Tangga**
  - [ ] Line chart per siswa (waktu vs tangga)
  - [ ] Bar chart distribusi per kelas
  - [ ] Rerata waktu naik 1 tangga

- [ ] **Data Sintetis**
  - [ ] 1 sekolah, 3 kelas, 90 siswa
  - [ ] 16 minggu data pergerakan
  - [ ] 5 pola pergerakan berbeda
  - [ ] 8 siswa stagnan buatan
  - [ ] 16 dokumen RAG embedded di pgvector

### Peregang (Dikerjakan jika waktu)

- [ ] **Asisten Guru RAG**
  - [ ] Chat interface
  - [ ] 16+ dokumen panduan
  - [ ] Pencarian semantik pgvector
  - [ ] Sumber rujukan + keyakinan

- [ ] **Deteksi Stagnasi**
  - [ ] Perbandingan peer-group
  - [ ] Penanda otomatis (BERAT/SEDANG)
  - [ ] Halaman Siswa Prioritas

- [ ] **Dashboard Kepala Sekolah**
  - [ ] Sebaran titik pijak
  - [ ] Kemajuan per kelompok
  - [ ] Siswa perlu perhatian

- [ ] **Dashboard Pengelola**
  - [ ] Agregat lintas sekolah
  - [ ] Tren bulanan
  - [ ] Sekolah paling lambat

- [ ] **Mode Luring Penuh**
  - [ ] Asesmen offline + sync
  - [ ] Bahan ajar cached di IndexedDB
  - [ ] Service Worker untuk static assets

### Tidak Dikerjakan

- [ ] LMS / Sistem pembelajaran penuh
- [ ] Modul absensi
- [ ] Rapor formal / transkrip
- [ ] Manajemen pengguna berlapis (admin super-admin)
- [ ] Aplikasi native (Android/iOS) — PWA sudah cukup
- [ ] Integrasi eksternal sungguhan (SIBI, E-Learning Sekolahku, Talent DNA)
- [ ] Autentikasi production-grade (OAuth/SAML)

---

## Lampiran A: Warna Tema (Tailwind Config)

```javascript
// tailwind.config.js - Tema TANGGA (beda dari SIGAP)
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primer — warna Sekolah Rakyat
        'sr-biru': '#1B3A5C',       // Biru tua (header)
        'sr-krem': '#FDF6E3',       // Krem (background)
        'sr-hijau': '#2D6A4F',      // Hijau (aksi, sukses)

        // Tangga — per level
        'tangga-0': '#D4A373',      // Coklat muda
        'tangga-1': '#E9C46A',      // Kuning
        'tangga-2': '#F4A261',      // Orange muda
        'tangga-3': '#E76F51',      // Orange
        'tangga-4': '#9B5DE5',      // Ungu
        'tangga-5': '#00B4D8',      // Cyan
        'tangga-6': '#2D6A4F',      // Hijau

        // Status
        'stagnasi-sedang': '#F4A261',
        'stagnasi-berat': '#E63946',
      },
      fontFamily: {
        'display': ['Plus Jakarta Sans', 'sans-serif'],
        'body': ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
}
```

---

## Lampiran B: Prompt LLM Fallback (jika tidak ada API Key)

```python
# backend/app/ai/pembangkit_bahan.py

TEMPLAT_BAHAN_FALLBACK = {
    "tingkat_0": {
        "instruksi_guru": "Tunjukkan kartu huruf satu per satu. Sebutkan nama bendanya.",
        "kartu": [
            {"huruf": "A", "gambar": "ayam"},
            {"huruf": "B", "gambar": "buku"},
            {"huruf": "C", "gambar": "cangkul"},
            {"huruf": "D", "gambar": "daun"},
            {"huruf": "I", "gambar": "ikan"},
        ]
    },
    "tingkat_1": {
        "instruksi_guru": "Minta siswa menebalkan huruf di lembar kerja.",
        "lembar_kerja": {"huruf": ["A", "B", "C", "D", "E"]}
    },
    "tingkat_2": {
        "instruksi_guru": "Bacakan suku kata, minta siswa mengulangi.",
        "suku_kata": ["BA", "BI", "BU", "BE", "BO", "CA", "CI", "CU", "CE", "CO"]
    },
    # ... tingkat 3-6 dengan konten generik
}
```

---

## Lampiran C: Perbandingan dengan SIGAP Kopdes (Reuse Plan)

| Komponen | SIGAP Kopdes | TANGGA | Bisa Dipakai Ulang |
|---|---|---|---|
| Setup proyek | React+Vite+FastAPI+Docker | React+Vite+FastAPI+Docker | 100% reuse struktur |
| Auth | localStorage role-based | localStorage role-based | 100% copy |
| API wrapper | lib/api.js | lib/api.js | 80% copy, ganti endpoint |
| Offline queue | IndexedDB (idb) | IndexedDB (idb) | 90% copy |
| RAG | TF-IDF + cosine | pgvector + embedding | 30% (ubah engine) |
| LLM integration | OpenAI SDK gpt-4o-mini | OpenAI SDK gpt-4o-mini | 80% copy pattern |
| Docker Compose | 3 services | 4 services (+ db) | 70% copy |
| Tailwind config | Warna koperasi | Warna Sekolah Rakyat | 60% copy (ganti palette) |
| Route pattern | Layout + nested routes | Layout + nested routes | 100% copy pattern |
| Chart | Custom (GarisNadi.jsx) | Recharts | 0% (ganti library, lebih siap) |
| Model pattern | SQLAlchemy async | SQLAlchemy async | 90% copy structure |
| Status badge | StatusBadge.jsx (AMAN/PERHATIAN) | TanggaBadge.jsx (Tangga 0-6) | 60% adapt |
| Sinyal list | SinyalList.jsx | StatusStagnasi.jsx | 40% adapt |
| Dashboard card | PapanTanda.jsx cards | DashboardKepsek.jsx cards | 50% adapt |

**Estimasi reuse: ~40-50% boilerplate bisa dicopy dari SIGAP, sisanya komponen baru.**

---

**Dokumen ini adalah rencana implementasi rinci untuk proposal LAN Datathon 2026.**
**Versi: 1.0 | Tanggal: 10 Agustus 2026**
