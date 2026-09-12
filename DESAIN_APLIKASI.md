# Desain Aplikasi TANGGA — Full Stack

> **Pemetaan Titik Pijak Belajar — Sekolah Rakyat**
> Spesifikasi Full-Stack v2.0 | Target: Tablet (768×1024) & Desktop (1440×900)

---

## DAFTAR ISI

1. [Arsitektur Full-Stack](#1-arsitektur-full-stack)
2. [Design System](#2-design-system)
3. [Screen Inventory](#3-screen-inventory)
4. [Halaman Utama — Landing Page](#4-halaman-utama--landing-page)
5. [Screen Designs — Guru](#5-screen-designs--guru-tablet-first)
6. [Dashboard — Kepala Sekolah](#6-dashboard--kepala-sekolah-desktop)
7. [Dashboard — Pengelola Program](#7-dashboard--pengelola-program-desktop)
8. [Backend API Design](#8-backend-api-design)
9. [Database Schema](#9-database-schema)
10. [State Management & Data Flow](#10-state-management--data-flow)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Reusable Components](#12-reusable-components)
13. [Interaction Patterns](#13-interaction-patterns)
14. [Animations — Konteks Sekolah](#14-animations--konteks-sekolah)
15. [Accessibility & Etika](#15-accessibility--etika)
16. [Komponen Prioritas MVP](#16-komponen-prioritas-mvp)

---

## 1. Arsitektur Full-Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   React 18 + Vite   │  │   Service Worker    │               │
│  │   (SPA / PWA)       │  │   (Workbox)         │               │
│  │                     │  │                     │               │
│  │  State: Zustand     │  │  Cache:             │               │
│  │  Router: React      │  │  - Static assets    │               │
│  │    Router DOM v6    │  │  - API responses    │               │
│  │  Charts: Recharts   │  │  - Bahan ajar       │               │
│  │  Maps: Leaflet      │  │                     │               │
│  │  Icons: Lucide      │  │  Offline Queue:     │               │
│  │  Confetti: canvas-  │  │  IndexedDB (idb)    │               │
│  │    confetti         │  │                     │               │
│  └─────────┬───────────┘  └──────────┬──────────┘               │
│            │                         │                          │
└────────────┼─────────────────────────┼──────────────────────────┘
             │                         │
             ▼                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FastAPI (Python 3.12, async)                 │   │
│  │                                                          │   │
│  │  Routers:                                                │   │
│  │  /api/auth/*       Authentication (demo)                 │   │
│  │  /api/asesmen/*    Asesmen lisan CRUD + adaptif          │   │
│  │  /api/tangga/*     Posisi tangga + pengelompokan         │   │
│  │  /api/bahan/*      Generate + cache bahan ajar           │   │
│  │  /api/rencana/*    Rencana pendampingan individual       │   │
│  │  /api/chat/*       RAG Asisten Guru                      │   │
│  │  /api/stagnasi/*   Deteksi + penanganan stagnasi         │   │
│  │  /api/statistik/*  Agregat dashboard kepsek/pengelola    │   │
│  │                                                          │   │
│  │  Middleware: CORS, request-ID, error handler             │   │
│  │  Validation: Pydantic v2 schemas                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  PostgreSQL 15       │  │  pgvector Extension  │            │
│  │                      │  │                      │            │
│  │  Tables (9):         │  │  Table: panduan_docs │            │
│  │  - sekolah           │  │  - 16+ dokumen       │            │
│  │  - guru              │  │  - embedding 1536d   │            │
│  │  - kelas             │  │  - IVFFlat index     │            │
│  │  - siswa             │  │                      │            │
│  │  - posisi_tangga     │  │  Query:              │            │
│  │  - asesmen_siswa     │  │  cosine similarity   │            │
│  │  - jawaban_item      │  │  top_k = 3           │            │
│  │  - riwayat_tangga    │  │                      │            │
│  │  - bahan_ajar        │  │                      │            │
│  │  - rencana_pendamping│  │                      │            │
│  │  - penanda_stagnasi  │  │                      │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ORM: SQLAlchemy 2.0 (async) + asyncpg driver                   │
│  Migrations: Alembic                                            │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       AI LAYER                                   │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  OpenAI API          │  │  Fallback Layer      │            │
│  │  - gpt-4o-mini       │  │  - Bahan ajar templat│            │
│  │  - text-embedding-   │  │  - Rencana generik   │            │
│  │    3-small           │  │  - FAQ statis        │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  Prompt Templates (4):                                          │
│  1. Pembangkit bahan ajar (1 tema → 6 tingkat)                  │
│  2. Rencana pendampingan (profil siswa → rencana mingguan)      │
│  3. Asisten RAG   (pertanyaan + dokumen → jawaban)              │
│  4. Validasi JSON (pastikan output terstruktur)                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT (Docker Compose)                    │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ frontend │  │ backend  │  │   db     │  │  seed    │        │
│  │ :3000    │  │ :8000    │  │ :5432    │  │ (run-once│        │
│  │ nginx    │  │ uvicorn  │  │ postgres │  │  then    │        │
│  │ (build)  │  │          │  │ +pvector │  │  exit)   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  Network: tangga-net (bridge)                                    │
│  Volumes: pgdata, (mounted SQLite for dev)                       │
│  Health checks: backend → /api/health, frontend depends on       │
│                 backend, seed depends on db                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Design System

### 2.1 Color Palette — Tema Sekolah Rakyat

```
┌──────────────────────────────────────────────────────────────────┐
│  PRIMER (Biru lembaga — formal, terpercaya)                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │#0F2B│ │#1B3A│ │#234B│ │#4A7F│ │#D6E4│                  │
│  │ 46  │ │ 5C  │ │ 73  │ │ B5  │ │ F0  │                  │
│  │ 950 │ │ 700 │ │ 500 │ │ 300 │ │ 100 │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                                  │
│  SEKUNDER (Hangat — ramah, memberdayakan)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │#FDF6│ │#FFF1│ │#FFE0│ │#F5EC│ │#6B4C│                  │
│  │ E3  │ │ D6  │ │ B2  │ │ D7  │ │ 3B  │                  │
│  │Krem │ │Kuning│ │Oranye│ │Tanah│ │Coklat│                  │
│  │  BG │ │Muda │ │Muda │ │Muda │ │Tua  │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                                  │
│  TANGGA (7 level — identik dengan anak tangga naik)              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │#B07D│ │#E0A8│ │#F0B0│ │#E873│ │#A855│ │#0EA5│ │#10B9││
│  │ 62  │ │ 2C  │ │ 3C  │ │ 3A  │ │ F7  │ │ E9  │ │ 81  ││
│  │ T0  │ │ T1  │ │ T2  │ │ T3  │ │ T4  │ │ T5  │ │ T6  ││
│  │Tanah│ │Kunin│ │Orany│ │Orany│ │ Ungu│ │ Biru│ │Hijau││
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
│                                                                  │
│  STATUS & FEEDBACK                                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │#E639│ │#F4A2│ │#2D6A│ │#3B82│ │#6B75│                  │
│  │ 46  │ │ 61  │ │ 4F  │ │ F6  │ │ 70  │                  │
│  │Berat│ │Sedang│ │Sukses│ │ Info │ │Netral│                  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                                  │
│  SURFACE & TEXT                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐                                     │
│  │#FFFF│ │#1A1A│ │#6B75│                                     │
│  │ FF  │ │ 2E  │ │ 70  │                                     │
│  │Putih│ │Teks │ │Teks │                                     │
│  │     │ │Prim │ │Sec. │                                     │
│  └──────┘ └──────┘ └──────┘                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Typography

```
┌────────────────────────────────────────────────────────────┐
│  Font Display: "Plus Jakarta Sans" (Google Fonts)          │
│  ─────────────────────────────────────────                 │
│  h1   32px / 40px  Bold         Judul halaman              │
│  h2   24px / 32px  SemiBold     Section header             │
│  h3   20px / 28px  SemiBold     Card title                 │
│  h4   18px / 26px  SemiBold     Sub-section                │
│                                                            │
│  Font Body: "IBM Plex Sans" (Google Fonts)                 │
│  ─────────────────────────────────────────                 │
│  body-lg   18px / 28px  Regular   Leading paragraphs       │
│  body      16px / 24px  Regular   Default content          │
│  body-sm   14px / 20px  Regular   Secondary info           │
│  caption   12px / 16px  Regular   Labels, timestamps       │
│                                                            │
│  Font Mono: "IBM Plex Mono" (Google Fonts)                 │
│  ─────────────────────────────────────────                 │
│  mono-sm   14px / 20px  Regular   Kode, angka, timer       │
│  mono-lg   72px / 88px  Bold      Item asesmen (display)   │
└────────────────────────────────────────────────────────────┘
```

### 2.3 Spacing & Border Radius

```
Spacing scale (4px base):   4, 8, 12, 16, 20, 24, 32, 40, 48, 64
Border radius:              sm(4)  md(8)  lg(12)  xl(16)  full(9999)
Shadows:
  card:    0 1px 3px  rgba(0,0,0,0.08)
  raised:  0 4px 12px rgba(0,0,0,0.10)
  modal:   0 8px 32px rgba(0,0,0,0.16)
  glow:    0 0 20px  rgba(45,106,79,0.15)  ← untuk success state
```

### 2.4 Icons — Lucide React

| Icon | Penggunaan | Lucide Name |
|---|---|---|
| 📋 | Mulai asesmen | `clipboard-check` |
| 👥 | Daftar siswa | `users` |
| 📦 | Pengelompokan | `layout-grid` |
| 📚 | Bahan ajar | `book-open` |
| 📈 | Grafik kemajuan | `trending-up` |
| 💬 | Chat asisten | `message-circle` |
| 🏠 | Beranda | `home` |
| ⚠️ | Stagnasi | `alert-triangle` |
| ✅ | Jawaban benar | `check-circle-2` |
| ❌ | Jawaban salah | `x-circle` |
| ⏭ | Lewati item | `skip-forward` |
| 🎯 | Target tangga | `target` |
| 🏫 | Sekolah | `school` |
| 🎓 | Siswa/siswi | `graduation-cap` |
| ✨ | Generate AI | `sparkles` |
| 📝 | Catatan/edit | `pencil-line` |
| 🔔 | Notifikasi | `bell` |
| 🌙 | Mode gelap | `moon` |
| ☀️ | Mode terang | `sun` |
| ⬆️ | Naik tingkat | `arrow-up` |

---

## 3. Screen Inventory

```
TOTAL: 20 screens + shared states

┌── PUBLIC ────────────────────────────────────────────────────┐
│ SL1  Landing Page (hero, fitur, CTA, footer)                  │
│ SL2  Login / Pilih Peran                                     │
└──────────────────────────────────────────────────────────────┘

┌── GURU (tablet 768×1024, mobile-first) ───────────────────────┐
│ SG1  Dashboard Guru — Beranda                                │
│ SG2  Asesmen Lisan — Pilih Siswa                             │
│ SG3  ⭐ Asesmen Lisan — Sedang Berlangsung (CORE)            │
│ SG4  Asesmen Lisan — Hasil (+ Konfeti)                       │
│ SG5  Daftar Siswa + Titik Pijak                              │
│ SG6  Pengelompokan Kelas                                     │
│ SG7  Bahan Ajar Berdiferensiasi                              │
│ SG8  Rencana Pendampingan Individual                         │
│ SG9  Chat Asisten Guru (RAG)                                 │
│ SG10 Notifikasi & Riwayat                                    │
└──────────────────────────────────────────────────────────────┘

┌── KEPALA SEKOLAH (desktop 1440×900) ──────────────────────────┐
│ SK1  Dashboard Kepsek — Overview                             │
│ SK2  Detail Per Kelas (grafik + tabel)                        │
│ SK3  Siswa Prioritas — Stagnasi Board                        │
└──────────────────────────────────────────────────────────────┘

┌── PENGELOLA PROGRAM (desktop 1440×900) ───────────────────────┐
│ SP1  Dashboard Agregat — Lintas Sekolah                      │
│ SP2  Analitik Pergerakan (tren + heatmap)                     │
│ SP3  Peta Sebaran Sekolah                                    │
└──────────────────────────────────────────────────────────────┘

┌── SHARED (semua persona) ─────────────────────────────────────┐
│ SS1  Loading / Skeleton States                               │
│ SS2  Empty States                                            │
│ SS3  Error States + Fallback                                 │
│ SS4  Modal Detail Siswa                                      │
│ SS5  Toast / Snackbar Notifikasi                             │
│ SS6  Konfirmasi Dialog (logout, hapus, generate ulang)       │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Halaman Utama — Landing Page

### SL1 — Landing Page (Public)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════════╗│
│  ║  ┌──────┐                                          [Tentang] [Login →]  ║│
│  ║  │TANGGA│  Pemetaan Titik Pijak Belajar                                ║│
│  ║  └──────┘  Sekolah Rakyat                                              ║│
│  ╚══════════════════════════════════════════════════════════════════════════╝│
│                                                                              │
│                                                                              │
│                         ╔══════════════════════════════╗                      │
│                         ║                            ║                      │
│                         ║   "Setiap anak punya       ║                      │
│                         ║    anak tangganya sendiri. ║                      │
│                         ║    Tugas kita: menemukan   ║                      │
│                         ║    di mana ia berdiri."    ║                      │
│                         ║                            ║                      │
│                         ╚══════════════════════════════╝                      │
│                                                                              │
│               ┌──────────────────┐    ┌──────────────────┐                   │
│               │   MASUK SEBAGAI  │    │   PELAJARI LEBIH │                   │
│               │      GURU        │    │      LANJUT      │                   │
│               └──────────────────┘    └──────────────────┘                   │
│                                                                              │
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════════╗│
│  ║                                                                          ║│
│  ║   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               ║│
│  ║   │  📋 Asesmen  │    │  📦 Kelompok │    │  📚 Bahan    │               ║│
│  ║   │  Lisan 5-8   │ →  │  Otomatis   │ →  │  Berdifer-   │               ║│
│  ║   │  Menit       │    │  per Tangga  │    │  ensiasi AI  │               ║│
│  ║   └──────────────┘    └──────────────┘    └──────────────┘               ║│
│  ║                                                                          ║│
│  ║   Guru memandu         Kelas terbagi         Satu tema =                 ║│
│  ║   siswa menjawab       berdasarkan           6 tingkat bahan              ║│
│  ║   lisan, 1 ketukan     kemampuan nyata       siap pakai                  ║│
│  ║                                                                          ║│
│  ╚══════════════════════════════════════════════════════════════════════════╝│
│                                                                              │
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════════╗│
│  ║  MENGAPA TANGGA?                                                        ║│
│  ║                                                                          ║│
│  ║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ║│
│  ║  │   5.130     │  │   5-8       │  │   6 Tingkat │  │   Tanpa     │     ║│
│  ║  │   Siswa     │  │   Menit     │  │   Bahan     │  │   Labeling  │     ║│
│  ║  │   Baru 2026 │  │   per       │  │   dari 1    │  │   Negatif   │     ║│
│  ║  │             │  │   Asesmen   │  │   Tema      │  │             │     ║│
│  ║  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     ║│
│  ║                                                                          ║│
│  ╚══════════════════════════════════════════════════════════════════════════╝│
│                                                                              │
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════════╗│
│  ║  TESTIMONI / KUTIPAN                                                    ║│
│  ║                                                                          ║│
│  ║  "Di Sekolah Rakyat ada siswa SMA yang belum bisa membaca. Guru tahu    ║│
│  ║   itu, tapi tidak punya alat untuk tahu persis di anak tangga mana       ║│
│  ║   setiap anak berdiri. TANGGA menjawabnya."                              ║│
│  ║                                                      — Menteri Sosial    ║│
│  ╚══════════════════════════════════════════════════════════════════════════╝│
│                                                                              │
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════════╗│
│  ║  SIAP MEMULAI?                                                [MASUK →] ║│
│  ║  Akses untuk Guru, Kepala Sekolah, dan Pengelola Program                ║│
│  ╚══════════════════════════════════════════════════════════════════════════╝│
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  © 2026 TANGGA · LAN Datathon 2026 · Dibangun untuk Sekolah Rakyat          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### SL1b — Animasi Landing Page

```
Hero section:
  1. Judul "TANGGA" fade-in dari opacity 0 (600ms)
  2. Subtitle slide-up 20px (400ms, delay 200ms)
  3. Kutipan fade-in (500ms, delay 400ms)
  4. Tombol CTA scale-in dari 0.9 (300ms, delay 600ms)
  5. Tiga kartu fitur staggered fade-in:
     - Kartu 1: delay 800ms, slide-up 30px, 400ms
     - Kartu 2: delay 1000ms, slide-up 30px, 400ms
     - Kartu 3: delay 1200ms, slide-up 30px, 400ms

Background: gradien dari krem (#FDF6E3) ke biru muda (#D6E4F0)
diagonal 135 derajat — memberi kesan hangat dan formal.

Ilustrasi: tangga bertingkat dengan 7 anak tangga berbeda warna,
dari coklat (bawah) ke hijau (atas). Siluet anak kecil berdiri
di salah satu anak tangga. SVG inline, tidak perlu gambar eksternal.
```

---

## 5. Screen Designs — Guru (Tablet-First)

*Target: 768×1024px. Touch target minimum 48×48px.*

---

### SG1 — Dashboard Guru (Beranda)

```
┌────────────────────────────────────────────────────────┐
│ [☰]  SELAMAT PAGI, BU SANTİ         🔔³  [👤 Avatar]  │
│      Kelas A — SMA · Minggu ke-3                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  RINGKASAN MINGGU INI           MG 3 dari 16     │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │ │
│  │  │ 30     │ │ 25     │ │ 8 ▲    │ │ 3 ⚠    │    │ │
│  │  │ Siswa  │ │ Sudah  │ │ Naik   │ │ Stag-   │    │ │
│  │  │ Total  │ │ Asesmen│ │ Minggu │ │ nasi    │    │ │
│  │  │        │ │        │ │ Ini    │ │ Aktif   │    │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📋 ASESMEN CEPAT                                │ │
│  │                                                  │ │
│  │  ┌────────────────────────────────────────┐      │ │
│  │  │ 🔍  Ketik nama atau kode siswa...      │      │ │
│  │  └────────────────────────────────────────┘      │ │
│  │                                                  │ │
│  │  5 siswa belum asesmen:                          │ │
│  │  · SR-006 Fajar     · SR-014 Nia                │ │
│  │  · SR-022 Rudi      · SR-028 Tini               │ │
│  │  · SR-030 Yusuf                                  │ │
│  │                                                  │ │
│  │  [MULAI ASESMEN MASSAL — 5 SISWA]               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │ 📦 KELOMPOK AKTIF   │  │ 📚 BAHAN MINGGU INI │     │
│  │                     │  │                     │     │
│  │ Awal (T0-2): 12 ssw │  │ "Lingkungan         │     │
│  │ Tengah (T3-4): 10   │  │  Sekitarku"         │     │
│  │ Lanjut (T5-6): 8    │  │ 6 tingkat · tersedia│     │
│  │                     │  │                     │     │
│  │ [LIHAT KELOMPOK]    │  │ [LIHAT BAHAN]       │     │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ⚠ PERLU PERHATIAN (3 siswa stagnan)             │ │
│  │                                                  │ │
│  │  · SR-002 Budi    T0 · 4 minggu [BUAT RENCANA]  │ │
│  │  · SR-011 Galih   T0 · 3 minggu [BUAT RENCANA]  │ │
│  │  · SR-018 Indah   T1 · 3 minggu [BUAT RENCANA]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  💬 TANYA ASISTEN                                │ │
│  │  "Bagaimana cara mengajar anak yang belum kenal  │ │
│  │   huruf di usia SMA?"              [TANYA →]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
├────────────────────────────────────────────────────────┤
│  🏠 Beranda │ 📋 Asesmen │ 👥 Siswa │ 📚 Bahan │ 💬    │
└────────────────────────────────────────────────────────┘
```

**Animasi Dashboard Guru:**

```
1. Stat cards: count-up animasi angka dari 0 ke nilai akhir
   (durasi 800ms, easing ease-out, dimulai saat card masuk viewport)

2. Progress ring di card "25/30 sudah asesmen":
   SVG circle dengan stroke-dasharray animasi (1000ms)

3. Section stagger: setiap section fade-in + slide-up 20px
   delay: 0ms, 100ms, 200ms, 300ms, 400ms

4. Tombol [MULAI ASESMEN MASSAL]: pulse subtle setiap 3 detik
   (bayangan hijau lembut, mengundang aksi)

5. Badge notifikasi 🔔³: scale bounce saat angka berubah
```

---

### SG2 — Asesmen Lisan: Pilih Siswa

```
┌────────────────────────────────────────────────────────┐
│ [◀]  ASESMEN LISAN — PILIH SISWA                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔍  Ketik nama atau kode...              [Filter]│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Urutkan: [Titik Pijak ▾] [Nama] [Terakhir Asesmen]   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ○ SR-020 Rafi     T6 Lit · T5 Num · 2hr lalu    │ │
│  │ ○ SR-021 Sinta    T5 Lit · T4 Num · 1mg lalu    │ │
│  │ ● SR-003 Citra    T1 Lit · T2 Num · 14hr lalu   │ │
│  │ ○ SR-005 Eko      T2 Lit · T1 Num · 5hr lalu    │ │
│  │ ○ SR-002 Budi ⚠   T0 Lit · — Num · 4mg lalu    │ │
│  │ ○ SR-006 Fajar    — Lit  · — Num · BELUM        │ │
│  │ ...  (scroll)                                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  TERPILIH: SR-003 — Citra · SMA                  │ │
│  │                                                  │ │
│  │  Pilih jenis asesmen:                            │ │
│  │                                                  │ │
│  │  ┌────────────────────┐ ┌────────────────────┐   │ │
│  │  │                    │ │                    │   │ │
│  │  │   📖 LITERASI      │ │   🔢 NUMERASI     │   │ │
│  │  │                    │ │                    │   │ │
│  │  │ Posisi: Tangga 1   │ │ Posisi: Tangga 2   │   │ │
│  │  │ "Mengenal Huruf"   │ │ "Bilangan 10-99"   │   │ │
│  │  │                    │ │                    │   │ │
│  │  │ Terakhir: 14 hari  │ │ Terakhir: 7 hari   │   │ │
│  │  │                    │ │                    │   │ │
│  │  │  [MULAI LITERASI]  │ │  [MULAI NUMERASI]  │   │ │
│  │  │                    │ │                    │   │ │
│  │  └────────────────────┘ └────────────────────┘   │ │
│  │                                                  │ │
│  │  ⓘ Asesmen dimulai dari tangga terakhir.        │ │
│  │    Estimasi: 5-8 menit.                          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### SG3 — Asesmen Lisan: Sedang Berlangsung ⭐ CORE SCREEN

```
┌────────────────────────────────────────────────────────┐
│ [✕]  ASESMEN LITERASI                    ⏱ 04:32     │
│      SR-003 · Citra · SMA                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────┐                                    │
│  │  TINGKAT 2     │  Badge tangga saat ini            │
│  │  Suku Kata     │  bg-tangga-2, rounded-lg          │
│  └────────────────┘                                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │   📢 Instruksi untuk Guru:                      │ │
│  │   "Tunjuk suku kata di bawah. Tanyakan          │ │
│  │   kepada siswa: 'Coba baca ini.'"               │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│                                                        │
│         ╔═══════════════════════════════╗              │
│         ║                             ║              │
│         ║        BA - TU              ║              │
│         ║                             ║              │
│         ╚═══════════════════════════════╝              │
│         font: 72px Bold · IBM Plex Sans                │
│         bg-krem · border-2 border-tangga-2             │
│         rounded-xl · py-10                             │
│                                                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ●●●○○  Item 3 dari 5                           │ │
│  │  Progress: 3/5 jawaban terekam                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│                                                        │
│  ┌──────────────────────┐ ┌──────────────────────┐    │
│  │                      │ │                      │    │
│  │    ✗  SALAH          │ │    ✓  BENAR          │    │
│  │                      │ │                      │    │
│  └──────────────────────┘ └──────────────────────┘    │
│  min-height: 80px         min-height: 80px             │
│  bg-red-50                bg-green-50                  │
│  border-2 border-red-300  border-2 border-green-400    │
│  text-red-700 font-bold    text-green-700 font-bold     │
│  rounded-xl shadow-sm      rounded-xl shadow-sm         │
│  active:scale-95           active:scale-95              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │              ⏭  LEWATI ITEM INI                  │ │
│  └──────────────────────────────────────────────────┘ │
│  text-gray-400 · border border-dashed · rounded-lg     │
│                                                        │
│  ⓘ Ketuk tombol setelah siswa menjawab lisan.         │
│    Siswa tidak melihat layar ini.                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Animasi Tap Benar/Salah (konteks sekolah):**

```
✓ BENAR:
  1. Tombol scale 1.05 (100ms)
  2. Background hijau fade-in (150ms)
  3. Icon check-circle-2 muncul dengan animasi "pop":
     - scale 0 → 1.3 (100ms) → 1.0 (100ms)
     - rotate -15deg → 0deg
  4. Emoji ⭐ atau 🌟 kecil muncul & melayang ke atas
     (3-4 partikel, durasi 600ms, opacity fade)
  5. Kembali normal (200ms)

✗ SALAH:
  1. Tombol scale 1.05 (100ms)
  2. Background merah fade-in (150ms)
  3. Icon x-circle shake horizontal ±4px (200ms)
  4. TIDAK ada efek negatif berlebihan — ingat konteks
     ini tentang anak yang sedang belajar
  5. Kembali normal (200ms)

⏭ LEWATI:
  1. Tombol opacity ke 0.5 (100ms)
  2. Item slide ke kiri dan hilang (200ms)
  3. Item berikutnya slide dari kanan (200ms)
```

### SG3b — Transisi Naik Tingkat

```
┌────────────────────────────────────────────────────────┐
│ [✕]  ASESMEN LITERASI                    ⏱ 06:15     │
│      SR-003 · Citra                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│              ┌──────────────────────┐                  │
│              │     TINGKAT 2        │  Badge lama      │
│              │     Suku Kata        │  slide-up        │
│              └──────────────────────┘  fade-out 200ms   │
│                       ⬆                                │
│                       │                                │
│              ┌──────────────────────┐                  │
│              │  ✨ TINGKAT 3  ✨    │  Badge baru      │
│              │  Membaca Kata Utuh  │  slide-up dari    │
│              └──────────────────────┘  bawah 250ms      │
│                                                    │
│   ╔══════════════════════════════════════════════╗    │
│   ║                                              ║    │
│   ║     🎉  Anda naik ke Tingkat 3!              ║    │
│   ║     Item selanjutnya akan menguji            ║    │
│   ║     kemampuan membaca kata utuh.             ║    │
│   ║                                              ║    │
│   ║              [LANJUTKAN →]                   ║    │
│   ║                                              ║    │
│   ╚══════════════════════════════════════════════╝    │
│                                                        │
│  Animasi: badge baru + teks fade-in (300ms,            │
│  delay 200ms). Background card glow hijau              │
│  (box-shadow pulse 1x).                                │
└────────────────────────────────────────────────────────┘
```

### SG3c — Transisi Mundur Tingkat

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              ┌──────────────────────┐                  │
│              │     TINGKAT 4        │  Badge lama      │
│              │     Kalimat          │  scale-down      │
│              └──────────────────────┘  fade-out         │
│                       ⬇                                │
│              ┌──────────────────────┐                  │
│              │     TINGKAT 3        │  Badge baru      │
│              │     Kata Utuh        │  scale-up dari   │
│              └──────────────────────┘  0.9, fade-in     │
│                                                        │
│   ╔══════════════════════════════════════════════╗    │
│   ║                                              ║    │
│   ║     Mari kita coba di tingkat sebelumnya.    ║    │
│   ║     Tidak apa-apa — setiap anak punya        ║    │
│   ║     kecepatannya sendiri.                    ║    │
│   ║                                              ║    │
│   ║              [LANJUTKAN →]                   ║    │
│   ╚══════════════════════════════════════════════╝    │
│                                                        │
│  Catatan penting: TIDAK ADA kata "gagal" atau          │
│  "turun". Bahasa yang dipakai memberdayakan.           │
│  Tidak ada efek visual negatif.                        │
└────────────────────────────────────────────────────────┘
```

---

### SG4 — Hasil Asesmen

```
┌────────────────────────────────────────────────────────┐
│            ✨ HASIL ASESMEN LITERASI ✨                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  SR-003 · Citra · SMA                                  │
│                                                        │
│        ╔══════════════════════════════╗                │
│        ║                            ║                │
│        ║    Mulai dari Tangga 3     ║                │
│        ║    Membaca Kata Utuh       ║                │
│        ║                            ║                │
│        ╚══════════════════════════════╝                │
│              bg-tangga-3 · text-white                   │
│              rounded-xl · p-6 · shadow-glow             │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ▬▬▲▬▬▬▬▬▬▬▬▬▬▬▬                            │ │
│  │  T0  T1  T2  T3  T4  T5  T6                    │ │
│  │        ───────────────                          │ │
│  │        T1 → T3  ▲ Naik 2 tingkat!               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Detail Jawaban:                                 │ │
│  │                                                  │ │
│  │  Tingkat 2 (Suku Kata)                          │ │
│  │  ✓ ba-tu   ✓ ru-mah   ✓ i-kan                  │ │
│  │  ✓ sa-pi   ✓ bu-ku                              │ │
│  │  5/5 benar — Lanjut ke Tingkat 3 ▲             │ │
│  │                                                  │ │
│  │  Tingkat 3 (Kata Utuh)                          │ │
│  │  ✓ batu    ✓ rumah    ✗ meja                   │ │
│  │  ✓ kucing  ✓ sekolah                            │ │
│  │  4/5 benar — Lanjut ke Tingkat 4 ▲             │ │
│  │                                                  │ │
│  │  Tingkat 4 (Kalimat)                            │ │
│  │  ✗ "Ibu pergi ke pasar"                         │ │
│  │  ✓ "Adik bermain bola"                          │ │
│  │  ✗ "Ayah membaca koran"                         │ │
│  │  ✗ "Kakak menyapu halaman"                      │ │
│  │  ✗ "Nenek duduk di kursi"                       │ │
│  │  1/5 benar — Titik pijak di Tangga 3 ◂          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⏱ Durasi: 8 menit 15 detik                           │
│                                                        │
│  ┌────────────────────┐ ┌────────────────────┐        │
│  │ LIHAT DAFTAR SISWA │ │ LIHAT PENGELOMPOKAN│        │
│  └────────────────────┘ └────────────────────┘        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │        [MULAI ASESMEN SISWA LAIN →]               │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

🎉 KONFETI ANIMASI (jika naik ≥2 tingkat):
   canvas-confetti dari tengah layar
   50 partikel, warna tangga 1-3
   durasi 2000ms, gravity 0.5
```

---

### SG5 — Daftar Siswa + Titik Pijak

```
┌────────────────────────────────────────────────────────┐
│ [◀]  DAFTAR SISWA — KELAS A (SMA)                     │
│      30 siswa · 25 sudah asesmen · 5 belum             │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔍 Cari...     │ ↕ Urutkan ▾ │ [Filter Tangga ▾]│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Quick filter: [Semua] [T0-2: 12] [T3-4: 10]         │
│                [T5-6: 8] [Belum Asesmen: 5] [⚠: 3]   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ┌────┬──────────────────┬─────┬──────┬──────────┐│ │
│  │ │ Lit│ Nama / Kode      │ Num │Asesmn│ Pergerak ││ │
│  │ ├────┼──────────────────┼─────┼──────┼──────────┤│ │
│  │ │ T6 │ SR-020 Rafi     │ T5  │ 2hr  │ ▬▬▬▬▲   ││ │
│  │ │ T5 │ SR-021 Sinta    │ T4  │ 1mg  │ ▬▬▬▲    ││ │
│  │ │ T3 │ SR-003 Citra    │ T2  │ baru │ ▲▲  +2  ││ │
│  │ │ T2 │ SR-005 Eko      │ T1  │ 5hr  │ ▬▬▬     ││ │
│  │ │ T0⚠│ SR-002 Budi     │ —   │ 4mg  │ ▬▬▬▬▬⚠ ││ │
│  │ │    │ 4mg di tangga 0 │     │      │          ││ │
│  │ │ T1 │ SR-001 Ahmad    │ T1  │ 3hr  │ ▬▲      ││ │
│  │ │ —  │ SR-006 Fajar    │ —   │ —    │ Belum    ││ │
│  │ └────┴──────────────────┴─────┴──────┴──────────┘│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⚠ 5 belum asesmen · 3 stagnasi                       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │        [MULAI ASESMEN MASSAL (5 SISWA)]           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘

Interaksi baris:
  Tap → Modal Detail Siswa (SS4)
  Swipe kiri → Quick: Mulai Asesmen
  Long press → Pilih multi-siswa untuk asesmen massal

Animasi:
  Baris baru (setelah asesmen): slide-in dari kanan dengan
  highlight kuning singkat (500ms) lalu normal.
  Badge stagnasi: pulse 3x saat pertama muncul.
```

---

### SG6 — Pengelompokan Kelas

```
┌────────────────────────────────────────────────────────┐
│ [◀]  PENGELOMPOKAN — KELAS A (SMA) · Minggu ke-3      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Tema: [Lingkungan Sekitarku ▾]  [Ganti Tema]         │
│                                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────┐ │
│  │ ▲ AWAL (T0-2) │ │ █ TENGAH(T3-4) │ │ ◆ LANJUT   │ │
│  │                │ │                │ │   (T5-6)   │ │
│  │ 12 siswa       │ │ 10 siswa       │ │ 8 siswa    │ │
│  │                │ │                │ │            │ │
│  │ T0 SR-002 ⚠4mg│ │ T3 SR-003 ▲2  │ │ T5 SR-020  │ │
│  │ T0 SR-007      │ │ T3 SR-008     │ │ T5 SR-021  │ │
│  │ T1 SR-001      │ │ T3 SR-012     │ │ T6 SR-014  │ │
│  │ T1 SR-009      │ │ T4 SR-015     │ │ T6 SR-025  │ │
│  │ T2 SR-005      │ │ ...           │ │ ...        │ │
│  │ ...            │ │                │ │            │ │
│  │                │ │                │ │            │ │
│  │ [GENERATE      │ │ [GENERATE     │ │ [GENERATE  │ │
│  │  BAHAN]        │ │  BAHAN]       │ │  BAHAN]    │ │
│  └────────────────┘ └────────────────┘ └────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📊 DISTRIBUSI TANGGA                            │ │
│  │                                                  │ │
│  │  T6 ██ 3                    🟢 Hijau             │ │
│  │  T5 ██████ 7                🔵 Biru              │ │
│  │  T4 ██████████ 10           🟣 Ungu              │ │
│  │  T3 ████████████ 12         🟠 Oranye            │ │
│  │  T2 ██████ 6                🟡 Kuning            │ │
│  │  T1 ████ 4                  🟡 Kuning muda       │ │
│  │  T0 ██ 2                    🟤 Coklat            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────────┐ ┌────────────────────┐        │
│  │ ATUR ULANG KELOMPOK│ │ ✨ GENERATE BAHAN  │        │
│  │ (drag & drop siswa)│ │ UNTUK SEMUA TINGKAT│        │
│  └────────────────────┘ └────────────────────┘        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### SG7 — Bahan Ajar Berdiferensiasi

```
┌────────────────────────────────────────────────────────┐
│ [◀]  BAHAN AJAR — "Lingkungan Sekitarku"              │
│      Dihasilkan: 10 Agustus 2026 · 6 tingkat           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [Lingkungan] [Keluargaku] [Makanan] [+ Baru]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  TAB TINGKAT:                                          │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐   │
│  │ T.0  │ T.1  │ T.2  │ T.3● │ T.4  │ T.5  │ T.6  │   │
│  │Huruf │Huruf │Suku  │ Kata │Kalimt│Parag │Paham │   │
│  │ 2 ssw│ 4 ssw│ 6 ssw│12 ssw│10 ssw│ 5 ssw│ 3 ssw│   │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘   │
│                                                        │
│  ╔════════════════════════════════════════════════════╗ │
│  ║ TINGKAT 3 — Membaca Kata Utuh                     ║ │
│  ║ Untuk 12 siswa                                     ║ │
│  ╠════════════════════════════════════════════════════╣ │
│  ║                                                    ║ │
│  ║  📋 Instruksi Guru:                                ║ │
│  ║  "Tunjukkan kartu kata satu per satu. Minta        ║ │
│  ║  siswa membaca dengan lantang. Jika kesulitan,     ║ │
│  ║  bantu mengeja per suku kata."                     ║ │
│  ║                                                    ║ │
│  ║  ┌──────────────────────────────────────────┐     ║ │
│  ║  │  KARTU KATA (cetak & gunting):           │     ║ │
│  ║  │                                          │     ║ │
│  ║  │  ┌────────┐ ┌────────┐ ┌────────┐       │     ║ │
│  ║  │  │ RUMAH  │ │ JALAN  │ │ POHON  │       │     ║ │
│  ║  │  └────────┘ └────────┘ └────────┘       │     ║ │
│  ║  │  ┌────────┐ ┌────────┐                  │     ║ │
│  ║  │  │ SUNGAI │ │ SAWAH  │                  │     ║ │
│  ║  │  └────────┘ └────────┘                  │     ║ │
│  ║  │  ┌────────┐ ┌────────┐ ← pseudo-word    │     ║ │
│  ║  │  │ BALO   │ │ TUGI   │   (uji decoding) │     ║ │
│  ║  │  └────────┘ └────────┘                  │     ║ │
│  ║  └──────────────────────────────────────────┘     ║ │
│  ║                                                    ║ │
│  ║  💡 Latihan Tambahan (jika masih kesulitan):       ║ │
│  ║  · Kembali ke suku kata: ru-mah, ja-lan           ║ │
│  ║  · Gunakan kartu bergambar                         ║ │
│  ║                                                    ║ │
│  ║  [✎ Edit]  [🖨 Cetak Kartu]  [💾 Simpan]          ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ✨ [GENERATE BAHAN TEMA BARU...]                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘

Animasi Generate Bahan:
  1. Tombol "Generate" → spinner + teks "AI menyusun bahan..."
  2. Skeleton cards muncul (6 card placeholder)
  3. Cards terisi satu per satu: staggered fade-in + slide-up
     delay: 0, 100, 200, 300, 400, 500ms
  4. Sparkles ✨ di pojok card saat pertama muncul
```

---

### SG8 — Rencana Pendampingan Individual

```
┌────────────────────────────────────────────────────────┐
│ [◀]  RENCANA PENDAMPINGAN                             │
│      SR-003 · Citra · Tangga 3 → Target Tangga 4      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ▬▬▲▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬                       │ │
│  │  W1  W2  W3  W4  W5  W6  W7  W8                 │ │
│  │  T0  T0  T1  T1  T2  T2  T3  → T4?              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  🎯 Indikator: "Citra dapat membaca 3 kalimat pendek  │
│     (4-5 kata) tanpa bantuan mengeja."                 │
│                                                        │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ RENCANA MINGGU INI                        [✎]   ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║                                                   ║ │
│  ║  📅 SENIN — Membaca Kalimat 3 Kata               ║ │
│  ║  ┌───────────────────────────────────────────┐   ║ │
│  ║  │ ⏱ 15 menit                               │   ║ │
│  ║  │ 1. Tunjukkan kartu "Ibu ke pasar"        │   ║ │
│  ║  │ 2. Siswa membaca lantang                 │   ║ │
│  ║  │ 3. Ulangi 3 kalimat berbeda              │   ║ │
│  ║  │ [✓ Selesai]                              │   ║ │
│  ║  └───────────────────────────────────────────┘   ║ │
│  ║                                                   ║ │
│  ║  📅 SELASA — Membaca Kalimat 4 Kata              ║ │
│  ║  ┌───────────────────────────────────────────┐   ║ │
│  ║  │ ⏱ 15 menit                               │   ║ │
│  ║  │ ...                                       │   ║ │
│  ║  │ [  ] Belum                                │   ║ │
│  ║  └───────────────────────────────────────────┘   ║ │
│  ║                                                   ║ │
│  ║  ... RABU, KAMIS, JUMAT ...                      ║ │
│  ║                                                   ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                        │
│  ┌────────────────────┐ ┌────────────────────┐        │
│  │ ✨ GENERATE ULANG  │ │ ✅ TAND AI SEMUA   │        │
│  └────────────────────┘ └────────────────────┘        │
│                                                        │
│  CATATAN GURU:                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                            [SIMPAN]   │
└────────────────────────────────────────────────────────┘

Animasi checklist:
  Tap [ ] → [✓] dengan animasi:
  - Checkmark draw (stroke-dasharray animasi, 300ms)
  - Baris berubah bg-green-50 (200ms)
  - Progress bar di header bertambah
```

---

### SG9 — Chat Asisten Guru (RAG)

```
┌────────────────────────────────────────────────────────┐
│ [◀]  TANYA ASISTEN GURU                      🕐 14:20 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 💡 Pertanyaan yang sering ditanyakan:             │ │
│  │ ┌──────────────────────────────────────────────┐ │ │
│  │ │ Bagaimana mengajar anak yang belum kenal     │ │ │
│  │ │ huruf di usia SMA?                           │ │ │
│  │ └──────────────────────────────────────────────┘ │ │
│  │ ┌──────────────────────────────────────────────┐ │ │
│  │ │ Siswa saya 3 minggu di tangga 2 tidak naik.  │ │ │
│  │ │ Apa yang harus dilakukan?                    │ │ │
│  │ └──────────────────────────────────────────────┘ │ │
│  │ ┌──────────────────────────────────────────────┐ │ │
│  │ │ Metode bermain untuk belajar penjumlahan     │ │ │
│  │ │ dasar                                        │ │ │
│  │ └──────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ 💬 PERCAKAPAN                                    ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║                                                   ║ │
│  ║  ┌─────────────────────────────────────────┐     ║ │
│  ║  │ 🧑 ANDA                         14:20   │     ║ │
│  ║  │ Siswa saya 3 minggu di tangga 2 tidak   │     ║ │
│  ║  │ naik. Apa yang harus saya lakukan?      │     ║ │
│  ║  └─────────────────────────────────────────┘     ║ │
│  ║                                                   ║ │
│  ║  ┌─────────────────────────────────────────┐     ║ │
│  ║  │ 🤖 ASISTEN                       14:20  │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ Jika siswa stagnan di tangga suku kata, │     ║ │
│  ║  │ coba strategi berikut:                  │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ 1. ✂️ Gunting & Tempel Suku Kata        │     ║ │
│  ║  │    Minta siswa menggunting suku kata dan │     ║ │
│  ║  │    menyusunnya jadi kata. Aktivitas      │     ║ │
│  ║  │    motorik membantu retensi.             │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ 2. 🎵 Nyanyian Suku Kata                │     ║ │
│  ║  │    Ubah suku kata jadi lagu pendek.      │     ║ │
│  ║  │    Irama bantu ingat pola bunyi.         │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ 3. 🔙 Mundur Sementara                  │     ║ │
│  ║  │    Mungkin fondasi hurufnya belum kuat.  │     ║ │
│  ║  │    Kembali ke tangga 1 selama 1-2 hari.  │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ 📚 Sumber:                               │     ║ │
│  ║  │ · Metode Suku Kata (0.87)               │     ║ │
│  ║  │ · Strategi Anak Stagnan (0.82)          │     ║ │
│  ║  │                                         │     ║ │
│  ║  │ Apakah membantu? [👍] [👎]              │     ║ │
│  ║  └─────────────────────────────────────────┘     ║ │
│  ║                                                   ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 💬 Ketik pertanyaan...                       [→] │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

Animasi Chat:
  - Pertanyaan user: slide-in dari kanan (200ms)
  - Jawaban asisten: typing indicator ●●● (selama loading)
    lalu teks muncul dengan typewriter effect per paragraf
    (20ms/karakter, bisa di-skip dengan tap)
  - Sumber rujukan: fade-in (300ms, delay 500ms)
```

---

## 6. Dashboard — Kepala Sekolah (Desktop)

*Target: 1440×900px. Sidebar + content.*

---

### SK1 — Dashboard Kepsek

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ╔══════════════╗  DASHBOARD — SEKOLAH RAKYAT HARAPAN BANGSA             │
│ ║   TANGGA     ║  TA 2026/2027 · Minggu ke-3         [Minggu ▾] [Export]│
│ ╠══════════════╣─────────────────────────────────────────────────────────│
│ ║              ║                                                         │
│ ║ 📊 Dashboard ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│ ║              ║  │ 90       │ │ 52       │ │ 8        │ │ 3 Kelas   │ │
│ ║ 📁 Per Kelas ║  │ Total    │ │ Naik ≥1  │ │ Stagnasi │ │ Aktif     │ │
│ ║   ▶ A (SMA)  ║  │ Siswa    │ │ Tingkat  │ │ Aktif ⚠ │ │           │ │
│ ║     B (SMP)  ║  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│ ║     C (SD)   ║                                                         │
│ ║              ║  ┌─────────────────────────┐ ┌─────────────────────────┐│
│ ║ ⚠ Prioritas  ║  │ SEBARAN TANGGA LITERASI│ │ SEBARAN TANGGA NUMERASI││
│ ║              ║  │                         │ │                         ││
│ ║              ║  │ T6 ██ 3                 │ │ T5 ██ 4                 ││
│ ║              ║  │ T5 ██████ 7             │ │ T4 ███████ 10           ││
│ ║              ║  │ T4 ██████████ 15        │ │ T3 ██████████████ 21    ││
│ ║              ║  │ T3 ██████████████ 20    │ │ T2 ██████████ 15        ││
│ ║              ║  │ T2 ██████████████ 18    │ │ T1 ██████ 9             ││
│ ║              ║  │ T1 ██████████ 15        │ │ T0 ██ 3                 ││
│ ║              ║  │ T0 ████████ 12          │ │ (28 belum)              ││
│ ║              ║  └─────────────────────────┘ └─────────────────────────┘│
│ ║              ║                                                         │
│ ║              ║  ┌─────────────────────────────────────────────────────┐│
│ ║              ║  │ KEMAJUAN PER KELAS (Minggu 1 → 3)                  ││
│ ║              ║  │                                                     ││
│ ║              ║  │ Kelas A (SMA)  ████████████▌ 65% (18/30 naik)     ││
│ ║              ║  │ Kelas B (SMP)  █████████████▌ 73% (22/30 naik)    ││
│ ║              ║  │ Kelas C (SD)   █████████████████▌ 83% (25/30 naik) ││
│ ║              ║  └─────────────────────────────────────────────────────┘│
│ ║              ║                                                         │
│ ║              ║  ┌─────────────────────────────────────────────────────┐│
│ ║              ║  │ ⚠ SISWA PERLU PERHATIAN (8)                 [→]   ││
│ ║              ║  │ SR-002 Budi  T0·4mg·Kls A │ SR-011 Galih T0·3mg   ││
│ ║              ║  │ SR-018 Indah T1·3mg·Kls A │ SR-025 Roni  T0·3mg   ││
│ ║              ║  └─────────────────────────────────────────────────────┘│
│ ║              ║                                                         │
│ ║ [👤 Admin]   ║                                                         │
│ ║ [Logout]     ║                                                         │
│ ╚══════════════╝─────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────────────┘

Animasi Dashboard Kepsek:
  1. Stat cards: count-up numbers (800ms, staggered 100ms delay)
  2. Bar chart: bars grow from 0 ke nilai dengan easing (600ms)
  3. Progress bar kemajuan: fill animasi (800ms, dimulai saat visible)
  4. Section: fade-in + slide-up 30px, staggered per section
```

---

## 7. Dashboard — Pengelola Program (Desktop)

### SP1 — Dashboard Agregat

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ╔══════════════╗  DASHBOARD PENGELOLA — PROGRAM SEKOLAH RAKYAT          │
│ ║   TANGGA     ║  Kemensos RI · Tahun Ajaran 2026/2027                  │
│ ╠══════════════╣─────────────────────────────────────────────────────────│
│ ║ 📊 Agregat   ║                                                         │
│ ║              ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│ ║ 📈 Analitik  ║  │ 5.130    │ │ 19       │ │ 3.000+   │ │ Rp 4 T    │ │
│ ║              ║  │ Siswa    │ │ Sekolah  │ │ Guru     │ │ Anggaran  │ │
│ ║ 🗺 Peta      ║  │ Baru     │ │ Aktif    │ │ Baru     │ │ 2026      │ │
│ ║              ║  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│ ║              ║                                                         │
│ ║              ║  ┌──────────────────────────┐ ┌───────────────────────┐ │
│ ║              ║  │ RERATA WAKTU NAIK 1      │ │ % KELUAR TANGGA 0-2  │ │
│ ║              ║  │ TANGGA (per provinsi)    │ │ (dalam 3 bln pertama) │ │
│ ║              ║  │                          │ │                       │ │
│ ║              ║  │ Jabar   ██████ 3.2 mg   │ │ Jabar   ██████ 62%    │ │
│ ║              ║  │ Jateng  ████████ 2.8 mg │ │ Jateng  ████████ 71%  │ │
│ ║              ║  │ Jatim   ███████ 3.1 mg  │ │ Jatim   ███████ 68%   │ │
│ ║              ║  │ Sumut   █████████ 2.5 mg│ │ Sumut   █████████ 78% │ │
│ ║              ║  └──────────────────────────┘ └───────────────────────┘ │
│ ║              ║                                                         │
│ ║              ║  ┌─────────────────────────────────────────────────────┐│
│ ║              ║  │ ⚠ SEKOLAH DENGAN PERGERAKAN TERLAMBAT              ││
│ ║              ║  │ 1. SR Cianjur    · 4.8 mg/tangga · 120 siswa       ││
│ ║              ║  │ 2. SR Lebak      · 4.5 mg/tangga ·  98 siswa       ││
│ ║              ║  │ 3. SR Garut      · 4.2 mg/tangga · 105 siswa       ││
│ ║              ║  └─────────────────────────────────────────────────────┘│
│ ╚══════════════╝─────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Backend API Design

### 8.1 Full API Endpoint Reference

```
BASE URL: /api

AUTH
────
POST   /auth/login              {username, password} → {token, user, peran}
GET    /auth/me                 → {user, sekolah, kelas}
POST   /auth/logout             → {success}

ASESMEN
───────
POST   /asesmen/mulai           {siswa_id, jenis} → {asesmen_id, tangga_awal, urutan_item[]}
POST   /asesmen/jawab           {asesmen_id, item_ke, jawaban, jawaban_siswa?}
                                → {next_item | hasil_akhir}
GET    /asesmen/{id}            → {detail asesmen + semua jawaban}
GET    /asesmen/siswa/{id}      → [...riwayat_asesmen]
GET    /asesmen/kelas/{id}      → [...asesmen_terbaru_per_siswa]
POST   /asesmen/resume          {asesmen_id} → resume asesmen terputus

TANGGA & PENGELOMPOKAN
──────────────────────
GET    /tangga/siswa/{id}       → {posisi_tangga, riwayat_pergerakan, pekan_stagnan}
GET    /tangga/kelas/{id}       → {kelas, daftar_siswa[], pengelompokan{}}
GET    /tangga/sekolah/{id}     → {sebaran_literasi, sebaran_numerasi, rerata_pergerakan}
GET    /tangga/agregat          → {per_provinsi[], per_kabupaten[], tren_bulanan[]}

BAHAN AJAR
──────────
POST   /bahan/generate          {tema, kelas_id, tingkat?[]} → {bahan_per_tingkat[]}
GET    /bahan/list              ?guru_id=&tema= → [...bahan_ajar]
GET    /bahan/{id}              → {detail bahan ajar satu tingkat}
PUT    /bahan/{id}              {konten_json} → update bahan (edit guru)
POST   /bahan/generate-semua    {tema, kelas_id} → generate semua tingkat sekaligus

RENCANA PENDAMPINGAN
────────────────────
POST   /rencana/generate        {siswa_id} → {rencana_pendampingan}
GET    /rencana/siswa/{id}      → [...rencana, sorted by minggu_ke DESC]
GET    /rencana/kelas/{id}      ?minggu_ke= → [...rencana_semua_siswa]
PUT    /rencana/{id}/checklist  {kegiatan_index, selesai: bool} → update ceklis
PUT    /rencana/{id}/catatan    {catatan} → simpan catatan guru

CHAT (RAG)
──────────
POST   /chat/tanya              {pertanyaan} → {jawaban, sumber[], keyakinan}
GET    /chat/suggested          → [...pertanyaan_saran]
POST   /chat/feedback           {jawaban_id, membantu: bool} → {success}

STAGNASI
────────
GET    /stagnasi/cek            ?kelas_id=&sekolah_id= → [...siswa_stagnan]
POST   /stagnasi/tangani        {siswa_id, catatan, tindakan} → {penanda}
GET    /stagnasi/statistik      ?sekolah_id= → {total, per_kelas, per_tingkat}

STATISTIK (Dashboard)
─────────────────────
GET    /statistik/sekolah/{id}  → {overview, sebaran, kemajuan_per_kelas, stagnasi}
GET    /statistik/agregat       ?provinsi=&kabupaten= → {overview, per_provinsi, per_sekolah}
GET    /statistik/trend         ?dari=&sampai= → {tren_bulanan, heatmap}

UTILITY
───────
GET    /health                  → {status, db, ai}
GET    /info                    → {versi, total_sekolah, total_siswa, total_asesmen}
```

### 8.2 API Response Envelope

```json
// Sukses
{
  "sukses": true,
  "data": { ... },
  "meta": {
    "halaman": 1,
    "total": 90,
    "diproses_pada": "2026-08-10T14:30:00+07:00"
  }
}

// Error
{
  "sukses": false,
  "error": {
    "kode": "SISWA_TIDAK_DITEMUKAN",
    "pesan": "Siswa dengan kode SR-099 tidak ditemukan",
    "detail": null
  }
}
```

### 8.3 Error Codes

| Kode | HTTP | Deskripsi |
|---|---|---|
| `SISWA_TIDAK_DITEMUKAN` | 404 | Kode siswa tidak valid |
| `ASESMEN_BERLANGSUNG` | 409 | Siswa masih dalam asesmen aktif |
| `TANGGA_TIDAK_VALID` | 400 | Level tangga di luar 0-6 |
| `AI_UNAVAILABLE` | 503 | LLM API tidak tersedia → gunakan fallback |
| `DATA_SINTETIS_ONLY` | 403 | MVP hanya menerima data sintetis |
| `VALIDASI_GAGAL` | 422 | Pydantic validation error |

---

## 9. Database Schema

### 9.1 Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  sekolah │──1:N──│   kelas  │──1:N──│    siswa     │
└──────────┘       └────┬─────┘       └──────┬───────┘
                        │                    │
                        │ 1:N              1:1│
                   ┌────┴─────┐       ┌──────┴───────────┐
                   │   guru   │       │  posisi_tangga   │
                   └──────────┘       └──────────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                        1:N                  1:N                  1:N
                    ┌────┴─────────┐   ┌──────┴───────┐   ┌───────┴──────────┐
                    │asesmen_siswa │   │riwayat_tangga│   │rencana_pendamping│
                    └────┬─────────┘   └──────────────┘   └──────────────────┘
                        1:N│
                    ┌──────┴──────┐
                    │jawaban_item │
                    └─────────────┘

┌──────────┐       ┌──────────────┐       ┌────────────────┐
│   guru   │──1:N──│  bahan_ajar  │       │penanda_stagnasi│──N:1──┤ siswa
└──────────┘       └──────────────┘       └────────────────┘

┌──────────────┐
│ panduan_docs │  (RAG, pgvector, tidak berelasi ke tabel lain)
└──────────────┘
```

### 9.2 Core Tables (SQLAlchemy Models)

```python
# === SEKOLAH ===
class Sekolah(Base):
    __tablename__ = "sekolah"
    id          = Column(Integer, PK)
    nama        = Column(String(200))
    provinsi    = Column(String(100))
    kabupaten   = Column(String(100))
    kecamatan   = Column(String(100))
    latitude    = Column(Float)
    longitude   = Column(Float)
    tipe        = Column(String(50), default="sekolah_rakyat")

# === GURU ===
class Guru(Base):
    __tablename__ = "guru"
    id          = Column(Integer, PK)
    nama        = Column(String(200))
    nip         = Column(String(30), unique=True)
    peran       = Column(String(20))  # wali_kelas | kepala_sekolah | pengelola
    sekolah_id  = Column(Integer, FK("sekolah.id"))

# === KELAS ===
class Kelas(Base):
    __tablename__ = "kelas"
    id           = Column(Integer, PK)
    sekolah_id   = Column(Integer, FK("sekolah.id"))
    nama         = Column(String(50))
    jenjang      = Column(String(10))  # SD | SMP | SMA
    tahun_ajaran = Column(String(20))
    guru_id      = Column(Integer, FK("guru.id"))

# === SISWA ===
class Siswa(Base):
    __tablename__ = "siswa"
    id           = Column(Integer, PK)
    kode         = Column(String(20), unique=True)  # SR-001-0001
    kelas_id     = Column(Integer, FK("kelas.id"))
    jenjang      = Column(String(10))
    tgl_masuk    = Column(DateTime, default=func.now())
    status_aktif = Column(Boolean, default=True)

# === POSISI TANGGA (current state per siswa) ===
class PosisiTangga(Base):
    __tablename__ = "posisi_tangga"
    id                       = Column(Integer, PK)
    siswa_id                 = Column(Integer, FK("siswa.id"), unique=True)
    tangga_literasi          = Column(Integer, nullable=True)  # 0-6, None=belum
    tangga_numerasi          = Column(Integer, nullable=True)  # 0-5
    tgl_terakhir_literasi    = Column(DateTime)
    tgl_terakhir_numerasi    = Column(DateTime)
    pekan_ke_literasi        = Column(Integer, default=0)
    pekan_ke_numerasi        = Column(Integer, default=0)

# === ASESMEN (satu sesi) ===
class AsesmenSiswa(Base):
    __tablename__ = "asesmen_siswa"
    id            = Column(Integer, PK)
    siswa_id      = Column(Integer, FK("siswa.id"))
    guru_id       = Column(Integer, FK("guru.id"))
    tgl_asesmen   = Column(DateTime, default=func.now())
    jenis         = Column(String(10))  # LITERASI | NUMERASI
    tangga_awal   = Column(Integer, nullable=True)
    tangga_hasil  = Column(Integer, nullable=True)
    durasi_detik  = Column(Integer)
    status        = Column(String(20), default="berlangsung")

# === JAWABAN ITEM (per butir soal) ===
class JawabanItem(Base):
    __tablename__ = "jawaban_item"
    id              = Column(Integer, PK)
    asesmen_id      = Column(Integer, FK("asesmen_siswa.id"))
    item_ke         = Column(Integer)
    tingkatan       = Column(Integer)
    jenis_kemampuan = Column(String(100))
    jawaban         = Column(Boolean)
    jawaban_siswa   = Column(Text, nullable=True)
    catatan         = Column(Text, nullable=True)

# === RIWAYAT TANGGA (log perubahan) ===
class RiwayatTangga(Base):
    __tablename__ = "riwayat_tangga"
    id             = Column(Integer, PK)
    siswa_id       = Column(Integer, FK("siswa.id"))
    jenis          = Column(String(10))
    tangga_awal    = Column(Integer)
    tangga_akhir   = Column(Integer)
    tgl_perubahan  = Column(DateTime, default=func.now())
    asesmen_id     = Column(Integer, FK("asesmen_siswa.id"))
    lama_hari      = Column(Integer)

# === BAHAN AJAR ===
class BahanAjar(Base):
    __tablename__ = "bahan_ajar"
    id           = Column(Integer, PK)
    tema         = Column(String(200))
    tanggal      = Column(DateTime, default=func.now())
    tingkat      = Column(Integer)
    konten_json  = Column(JSON)
    dibuat_oleh  = Column(Integer, FK("guru.id"))
    kelas_id     = Column(Integer, FK("kelas.id"))

# === RENCANA PENDAMPINGAN ===
class RencanaPendampingan(Base):
    __tablename__ = "rencana_pendampingan"
    id              = Column(Integer, PK)
    siswa_id        = Column(Integer, FK("siswa.id"))
    minggu_ke       = Column(Integer)
    tgl_mulai       = Column(DateTime)
    tgl_selesai     = Column(DateTime)
    kegiatan_json   = Column(JSON)
    target_tangga   = Column(Integer)
    indikator       = Column(Text)
    checklist_json  = Column(JSON, default=list)  # [true, false, true, ...]
    catatan_guru    = Column(Text, nullable=True)
    dibuat_oleh     = Column(Integer, FK("guru.id"))

# === PENANDA STAGNASI ===
class PenandaStagnasi(Base):
    __tablename__ = "penanda_stagnasi"
    id              = Column(Integer, PK)
    siswa_id        = Column(Integer, FK("siswa.id"))
    jenis           = Column(String(10))
    tgl_ditandai    = Column(DateTime, default=func.now())
    pekan_stagnan   = Column(Integer)
    level           = Column(String(10))  # BERAT | SEDANG
    status          = Column(String(20), default="aktif")
    catatan_guru    = Column(Text, nullable=True)

# === PANDUAN DOKUMEN (RAG, pgvector) ===
class PanduanDocs(Base):
    __tablename__ = "panduan_docs"
    id          = Column(Integer, PK)
    judul       = Column(String(300))
    konten      = Column(Text)
    kategori    = Column(String(100))
    embedding   = Column(Vector(1536))
    tgl_dibuat  = Column(DateTime, default=func.now())
```

---

## 10. State Management & Data Flow

### 10.1 Zustand Store Architecture

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  peran: 'guru' | 'kepala_sekolah' | 'pengelola' | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// stores/asesmenStore.ts — MOST CRITICAL
interface AsesmenState {
  sesiAktif: AsesmenSesi | null;
  loading: boolean;
  error: string | null;
  mulaiAsesmen: (siswaId: string, jenis: string) => Promise<void>;
  jawab: (jawaban: boolean, jawabanSiswa?: string) => Promise<void>;
  lewati: () => Promise<void>;
  resumeAsesmen: (asesmenId: number) => Promise<void>;
  reset: () => void;
}

// stores/kelasStore.ts
interface KelasState {
  siswaList: Siswa[];
  pengelompokan: Kelompok[];
  sebaranTangga: SebaranTangga | null;
  loading: boolean;
  fetchSiswa: (kelasId: number) => Promise<void>;
  fetchPengelompokan: (kelasId: number) => Promise<void>;
  pindahKelompok: (siswaId: string, dari: number, ke: number) => void;
}

// stores/bahanStore.ts
interface BahanState {
  temaAktif: string | null;
  bahanPerTingkat: Record<number, BahanAjar>;
  loading: boolean;
  generateBahan: (tema: string, kelasId: number) => Promise<void>;
  getBahanByTingkat: (tingkat: number) => BahanAjar | null;
  editBahan: (id: number, konten: any) => Promise<void>;
}

// stores/chatStore.ts
interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  suggestedQuestions: string[];
  tanya: (pertanyaan: string) => Promise<void>;
  fetchSuggested: () => Promise<void>;
  beriFeedback: (msgId: string, membantu: boolean) => Promise<void>;
}

// stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  modalSiswa: string | null;
  toasts: Toast[];
  toggleSidebar: () => void;
  bukaModalSiswa: (kode: string) => void;
  tutupModalSiswa: () => void;
  tambahToast: (toast: Toast) => void;
  hapusToast: (id: string) => void;
}
```

### 10.2 Data Flow — Asesmen (Flow Terpenting)

```
USER ACTION                  STORE                    API                      BACKEND
───────────                  ─────                    ───                      ───────
Tap "Mulai Literasi"
  │
  ▼
asesmenStore.mulaiAsesmen()
  │
  ├─ set loading=true
  ├─ POST /api/asesmen/mulai
  │    {siswa_id, jenis:"LITERASI"} ──────────────────────────► cek posisi terakhir
  │                                                             siapkan item soal
  │                                                             simpan sesi baru
  │◄──────── {asesmen_id, tangga_awal, items: [...]} ─────────
  ├─ set sesiAktif = {asesmen_id, itemKe: 1, items, ...}
  └─ set loading=false
  │
  ▼
UI render item pertama (SG3)
  │
  ▼
Tap "✓ BENAR"
  │
  ▼
asesmenStore.jawab(true, "ba-tu")
  │
  ├─ Optimistic: update itemKe + progress
  ├─ POST /api/asesmen/jawab
  │    {asesmen_id, item_ke:1, jawaban:true, jawaban_siswa:"ba-tu"}
  │                                                              ──► simpan jawaban
  │                                                                  cek: item_ke == 5?
  │                                                                  ├─ belum → next item
  │                                                                  └─ sudah → evaluasi
  │                                                                      3/5 benar?
  │                                                                      ├─ ya → naik tingkat
  │                                                                      └─ tidak → hasil
  │◄── {next_item: {tingkat:2, item_ke:2, teks:"ru-mah", instruksi}}
  │    ATAU
  │◄── {hasil_akhir: {tangga_hasil: 3, detail_jawaban:[...]}}
  │
  ├─ Update store sesuai response
  └─ UI update + animasi transisi
```

### 10.3 Offline Queue Flow

```
TABLET OFFLINE:
  1. AsesmenStore tetap berfungsi normal
  2. Setiap jawaban disimpan di:
     a. State store (untuk UI)
     b. IndexedDB queue (untuk sync nanti)
  3. UI menunjukkan badge "offline" + jumlah item dalam antrian

KONEKSI KEMBALI:
  1. Service Worker mendeteksi 'online' event
  2. SyncManager (jika tersedia) atau manual trigger:
     - Ambil semua item dari IndexedDB queue
     - POST /api/asesmen/jawab untuk setiap item
     - Urutan sesuai item_ke
  3. Sukses → hapus dari queue
  4. Gagal → tetap di queue, retry nanti
  5. Toast: "3 asesmen berhasil dikirim" / "Gagal mengirim, coba lagi"
```

---

## 11. Deployment Architecture

### Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: tangga
      POSTGRES_USER: tangga
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tangga"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://tangga:${DB_PASSWORD}@db:5432/tangga
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      OPENAI_BASE_URL: ${OPENAI_BASE_URL:-}
      CORS_ORIGINS: "http://localhost:3000"
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: /api
    ports:
      - "3000:80"
    depends_on:
      - backend

  seed:
    build: ./backend
    command: python seed_db.py
    environment:
      DATABASE_URL: postgresql+asyncpg://tangga:${DB_PASSWORD}@db:5432/tangga
    depends_on:
      db:
        condition: service_healthy
    profiles:
      - seed

volumes:
  pgdata:
```

### Development Mode (Vite proxy)

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 12. Reusable Components

### Component Tree

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx          (variant: primary, secondary, danger, ghost)
│   │   ├── Card.jsx            (wrapper + Card.Header, Card.Body, Card.Footer)
│   │   ├── Badge.jsx           (variant: tangga-0..6, status)
│   │   ├── Input.jsx           (search, text, with icon)
│   │   ├── Modal.jsx           (overlay + close button + portal)
│   │   ├── Toast.jsx           (success, error, warning, info)
│   │   ├── Skeleton.jsx        (shimmer loading placeholder)
│   │   ├── EmptyState.jsx      (icon + text + CTA button)
│   │   ├── ErrorState.jsx      (icon + message + retry)
│   │   ├── ProgressBar.jsx     (animated fill)
│   │   ├── ConfirmDialog.jsx   (title + message + confirm/cancel)
│   │   ├── Dropdown.jsx        (select with options)
│   │   └── Tabs.jsx            (horizontal tab switcher)
│   │
│   ├── tangga/
│   │   ├── TanggaBadge.jsx         (T0-T6 dengan warna + label)
│   │   ├── TanggaProgress.jsx      (●●●○○ progress indicator)
│   │   ├── PergerakanChart.jsx     (Recharts LineChart — minggu vs tangga)
│   │   ├── SebaranChart.jsx        (Recharts BarChart horizontal)
│   │   └── TanggaTimeline.jsx      (visual timeline riwayat tangga)
│   │
│   ├── asesmen/
│   │   ├── ItemAsesmen.jsx         (satu butir soal + instruksi guru)
│   │   ├── TombolBenar.jsx         (✓ BENAR button + animasi)
│   │   ├── TombolSalah.jsx         (✗ SALAH button + animasi)
│   │   ├── TimerAsesmen.jsx        (⏱ MM:SS countdown)
│   │   └── TransisiTingkat.jsx     (animasi naik/mundur tingkat)
│   │
│   ├── siswa/
│   │   ├── SiswaRow.jsx            (satu baris di daftar siswa)
│   │   ├── ModalDetailSiswa.jsx    (popup detail + tombol aksi)
│   │   ├── StatusStagnasi.jsx      (badge stagnasi + info)
│   │   └── SiswaSelector.jsx       (search + select siswa)
│   │
│   ├── pengelompokan/
│   │   ├── KelompokCard.jsx        (card satu kelompok + daftar siswa)
│   │   └── PengelompokanGrid.jsx   (grid 3 kolom kelompok)
│   │
│   ├── bahan/
│   │   ├── DiffBahanCard.jsx       (card bahan ajar per tingkat)
│   │   ├── TabTingkat.jsx          (horizontal tab T0-T6)
│   │   ├── KartuKata.jsx           (kartu kata printable)
│   │   └── GenerateBahanButton.jsx (✨ Generate + loading state)
│   │
│   ├── rencana/
│   │   ├── RencanaCard.jsx         (rencana mingguan + checklist)
│   │   ├── KegiatanHarian.jsx      (satu hari + checklist)
│   │   └── IndikatorTarget.jsx     (target tangga + indikator)
│   │
│   ├── chat/
│   │   ├── ChatBubble.jsx          (user / assistant message bubble)
│   │   ├── SaranPertanyaan.jsx     (suggested questions chips)
│   │   ├── SumberRujukan.jsx       (source citation + score)
│   │   └── TypingIndicator.jsx     (●●● animasi)
│   │
│   ├── dashboard/
│   │   ├── StatCard.jsx            (angka besar + label)
│   │   ├── ProgressBar.jsx         (persentase bar)
│   │   └── HeatmapChart.jsx        (tangga vs bulan)
│   │
│   └── layout/
│       ├── HeaderGuru.jsx          (top bar + nama guru + notifikasi)
│       ├── BottomNav.jsx           (5 tab navigasi mobile)
│       ├── SidebarKepsek.jsx       (sidebar + menu items)
│       ├── SidebarPengelola.jsx    (sidebar + menu items)
│       └── LandingNav.jsx          (public landing nav)
```

---

## 13. Interaction Patterns

### 13.1 Touch & Click

```
Tombol benar/salah:  min-width: 160px, min-height: 80px
Baris daftar siswa:   min-height: 56px
Tab navigasi:         min-width: 64px, min-height: 48px
Input search:         height: 48px
Card action:          min-height: 44px
Icon button:          min-width: 48px, min-height: 48px
```

### 13.2 Gestures

| Gesture | Context | Action |
|---|---|---|
| Single tap | Tombol benar/salah | Merekam jawaban |
| Single tap | Baris siswa | Buka modal detail |
| Single tap | Tab tingkat | Switch bahan ajar per tingkat |
| Double tap | Item asesmen | Quick: lewati item |
| Long press | Siswa di kelompok | Drag untuk pindah kelompok |
| Swipe left | Item daftar siswa | Quick: mulai asesmen |
| Swipe right | Item daftar siswa | Quick: lihat rencana |
| Pull down | List | Refresh data |

### 13.3 Feedback Patterns

| Aksi | Feedback |
|---|---|
| Tap benar | Scale + warna hijau + checkmark + haptic |
| Tap salah | Scale + warna merah + X shake |
| Asesmen selesai | Konfeti (jika naik ≥2) / sparkle (jika naik 1) / text (jika tetap) |
| Generate bahan | Skeleton → staggered reveal cards |
| Naik tingkat | Badge slide-up + teks + glow |
| Turun tingkat | Badge scale-down, bahasa memberdayakan |
| Stagnasi terdeteksi | Badge ⚠ pulse 3x |
| Offline sync | Toast progress bar |
| Chat loading | Typing indicator ●●● |
| Checklist done | Baris hijau + checkmark draw |

### 13.4 Loading States

```
Asesmen mulai:     items preloaded di memori — tidak ada loading
Generate bahan:    skeleton shimmer (6 cards) + "AI sedang menyusun..."
Chat RAG:          typing indicator ●●●
Fetch data:        skeleton cards / shimmer rows
Submit jawaban:    optimistic update (instant) → sync di background
```

### 13.5 Empty States

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│          📋                  │  │          📚                  │
│   Belum Ada Asesmen          │  │   Belum Ada Bahan Ajar       │
│                              │  │                              │
│ Mulai asesmen pertama untuk  │  │ Generate bahan ajar untuk    │
│ mengetahui titik pijak.      │  │ semua tingkat sekaligus.     │
│                              │  │                              │
│  [MULAI ASESMEN PERTAMA]     │  │  [GENERATE BAHAN PERTAMA]    │
└──────────────────────────────┘  └──────────────────────────────┘

┌──────────────────────────────┐
│          ⚠️                  │
│   Gagal Menghasilkan Bahan   │
│                              │
│ AI sedang tidak tersedia.    │
│ Gunakan bahan templat.       │
│                              │
│  [GUNAKAN TEMPLAT] [ULANGI]  │
└──────────────────────────────┘
```

---

## 14. Animations — Konteks Sekolah

### 14.1 Filosofi Animasi

```
Prinsip animasi TANGGA:
1. Memberdayakan — tidak ada animasi "gagal" atau efek negatif berlebihan
2. Merayakan kemajuan kecil — naik 1 tangga dirayakan, naik 2+ dirayakan besar
3. Tidak mengintimidasi — tidak ada countdown menakutkan, tidak ada warna merah dominan
4. Konteks lokal — ilustrasi benda sekitar (pasar, sawah, sungai), bukan benda asing
```

### 14.2 Library

```
canvas-confetti  (3KB gzipped)  — Konfeti hasil asesmen
framer-motion    (opsional)      — Animasi kompleks (pilih: CSS atau framer)
CSS transitions  (0KB)           — Mayoritas animasi sederhana
CSS keyframes    (0KB)           — Pulse, shimmer, draw
```

### 14.3 Animasi per Konteks

#### A. Landing Page — First Impression

| Elemen | Animasi | Durasi | Delay |
|---|---|---|---|
| Logo "TANGGA" | Fade-in + scale 0.9→1.0 | 600ms | 0ms |
| Tagline | Slide-up 20px + fade-in | 400ms | 200ms |
| Kutipan Mensos | Fade-in | 500ms | 500ms |
| Tombol CTA | Scale 0.9→1.0 + fade-in | 300ms | 700ms |
| 3 Kartu Fitur | Slide-up 30px + fade-in | 400ms | 800/1000/1200ms |
| Angka Statistik | Count-up 0→nilai | 800ms | on-visible |

#### B. Asesmen — Inti Interaksi

| Momen | Animasi | Spesifikasi |
|---|---|---|
| Item muncul | Slide-in dari kanan 20px | 200ms, ease-out |
| ✓ BENAR | Scale-up 1.05 + hijau + ✓ draw | 300ms total |
| ✗ SALAH | Scale-up 1.05 + merah + ✗ shake | 300ms total |
| Naik tingkat | Badge lama slide-up fade-out → badge baru slide-up fade-in + glow | 500ms |
| Mundur tingkat | Badge lama scale-down → badge baru scale-up | 400ms |
| Hasil: naik ≥2 | **Konfeti** (canvas-confetti, 50 partikel, 2 detik) | 2000ms |
| Hasil: naik 1 | **Sparkle** (3-4 bintang kecil melayang) | 1000ms |
| Hasil: tetap | Teks "Kamu sedang membangun fondasi yang kuat" + emoji 💪 | 500ms |
| Hasil: turun | Teks "Mari kita coba lagi dari sini" — TIDAK ADA efek negatif | 500ms |

#### C. Dashboard — Data Visualization

| Elemen | Animasi | Spesifikasi |
|---|---|---|
| Stat cards | Count-up angka + card fade-in | 800ms per card, staggered 100ms |
| Bar chart | Bars grow from 0 | 600ms, ease-out |
| Line chart | Line draw (stroke-dasharray) | 1000ms |
| Progress bar | Fill from 0 ke nilai | 800ms |
| Heatmap | Cells color transition | 300ms per cell |

#### D. Bahan Ajar Generate

| Fase | Animasi |
|---|---|
| Tekan Generate | Tombol → spinner + teks "AI menyusun bahan ajar..." |
| Loading | 6 skeleton cards dengan shimmer animation |
| Cards siap | Staggered fade-in + slide-up (0, 100, 200, 300, 400, 500ms delay) |
| Card muncul | ✨ sparkle di pojok kanan atas card (300ms) |

#### E. Chat Asisten

| Fase | Animasi |
|---|---|
| Mengirim pertanyaan | Bubble slide-in dari kanan (200ms) |
| AI berpikir | Typing indicator ●●● (loop) |
| Jawaban muncul | Typewriter effect per paragraf (20ms/char, bisa tap untuk skip) |
| Sumber rujukan | Fade-in (300ms, delay 500ms setelah jawaban) |

#### F. Micro-interactions

| Elemen | Animasi |
|---|---|
| Checklist [ ] → [✓] | Checkmark stroke draw + baris hijau (300ms) |
| Badge stagnasi baru | Pulse 3x (berhenti setelah 3 detik) |
| Notifikasi 🔔 | Badge scale bounce saat count berubah |
| Toast notifikasi | Slide-in dari atas + auto-dismiss 3 detik |
| Hover card | Scale 1.02 + shadow naik (150ms) |
| Active button | Scale 0.97 (50ms) |

### 14.4 CSS Keyframes

```css
/* Shimmer skeleton loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Pulse warning untuk stagnasi */
@keyframes pulse-warning {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(230, 57, 70, 0); }
}
.stagnasi-pulse {
  animation: pulse-warning 1s ease-in-out 3;
}

/* Checkmark draw */
@keyframes checkmark-draw {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
.checkmark path {
  stroke-dasharray: 24;
  animation: checkmark-draw 300ms ease-out forwards;
}

/* Slide-up fade-in */
@keyframes slideUpFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Count-up tidak pakai animasi CSS — pakai JS interval */
/* requestAnimationFrame untuk smooth number transition */
```

---

## 15. Accessibility & Etika

### 15.1 Color Contrast (WCAG AA)

```
✅ sr-700 (#1B3A5C) on krem (#FDF6E3) → 10.2:1
⚠ Tangga-1 (#E0A82C) + white → 2.8:1 → GANTI teks gelap untuk T0-T2
✅ Tangga-3 (#E8733A) + white → 4.1:1 (large text)
✅ Perbaikan: T0-T2 badge pakai teks #1A1A2E, T3-T6 pakai teks putih
```

### 15.2 Touch Targets (WCAG 2.5.5)

Semua elemen interaktif ≥ 48×48px, dengan spacing minimal 8px antar target.

### 15.3 Keyboard Navigation

```
Tab order:    Input → Button → Link  (logical)
Enter/Space:  Activate button
Escape:       Close modal / cancel
Arrow keys:   Navigate list items
```

### 15.4 Screen Reader (aria)

```html
<button aria-label="Jawaban benar, item ke-3">✓ BENAR</button>
<span role="status" aria-label="Tangga 3, Membaca Kata Utuh">T3</span>
<progress value="3" max="5" aria-label="Item 3 dari 5">●●●○○</progress>
```

### 15.5 Bahasa Non-Labeling (WAJIB — etika inti)

```
KATA YANG DILARANG di seluruh UI:
  ✗ bodoh      ✗ lambat      ✗ tertinggal
  ✗ bermasalah ✗ nilai       ✗ peringkat
  ✗ ranking    ✗ gagal       ✗ turun (sebagai vonis)

KATA YANG DIPAKAI:
  ✓ mulai dari sini          ✓ titik pijak
  ✓ sedang di tangga 3       ✓ naik satu tingkat
  ✓ perlu perhatian khusus   ✓ membutuhkan pendampingan
  ✓ mari coba dari sini      ✓ sedang membangun fondasi
```

---

## 16. Komponen Prioritas MVP

| Prioritas | Komponen | Estimasi | Alasan |
|---|---|---|---|
| **P0** | Landing Page (SL1) | 4 jam | First impression Demo Day |
| **P0** | Login (SL2) | 2 jam | Entry point |
| **P0** | AsesmenLisan (SG3, SG4) | 12 jam | **CORE** — tanpa ini tidak ada demo |
| **P0** | TanggaBadge | 1 jam | Dipakai di semua screen |
| **P0** | BottomNav + HeaderGuru | 3 jam | Navigasi guru |
| **P1** | DashboardGuru (SG1) | 4 jam | Beranda guru |
| **P1** | DaftarSiswa (SG5) | 4 jam | Hasil asesmen harus terlihat |
| **P1** | Pengelompokan (SG6) | 4 jam | Value prop utama |
| **P1** | BahanDiferensiasi (SG7) | 6 jam | AI feature utama |
| **P1** | PergerakanChart | 3 jam | Visualisasi kemajuan |
| **P2** | RencanaIndividu (SG8) | 4 jam | Individual plan AI |
| **P2** | DashboardKepsek (SK1) | 4 jam | Demo 3 persona |
| **P2** | ModalDetailSiswa (SS4) | 2 jam | Dipakai di banyak screen |
| **P2** | Semua empty/error/loading | 3 jam | UX completeness |
| **P3** | ChatGuru (SG9) | 4 jam | Peregang |
| **P3** | SiswaPrioritas (SK3) | 3 jam | Peregang |
| **P3** | DashboardAgregat (SP1) | 3 jam | Peregang |
| **P3** | PetaSekolah (SP3) | 3 jam | Opsional total |

**Total P0+P1: ~43 jam (5-6 hari untuk 1 developer full-time)**

---

*Dokumen Desain Full-Stack v2.0 — 10 Agustus 2026*
*Frontend: React 18 + Vite + Tailwind + Zustand + Recharts*
*Backend: FastAPI + PostgreSQL + pgvector + OpenAI SDK*
*Deployment: Docker Compose (4 services)*
