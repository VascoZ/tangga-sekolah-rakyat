const DEMO_AKUN = {
  guru: {
    username: 'guru',
    password: 'guru123',
    nama: 'Bu Santi',
    peran: 'wali_kelas',
    kelas: { id: 1, nama: 'Kelas A - SMA', jenjang: 'SMA' },
  },
  kepsek: {
    username: 'kepsek',
    password: 'kepsek123',
    nama: 'Pak Haryono',
    peran: 'kepala_sekolah',
  },
  pengelola: {
    username: 'pengelola',
    password: 'pengelola123',
    nama: 'Pak Pengelola',
    peran: 'pengelola',
  },
}

const DEMO_SISWA_KELAS_A = [
  { id: 1, kode: 'SR-001-0001', nama: 'Ahmad', tanggaLit: 1, tanggaNum: 1, pekanLit: 2, pekanNum: 2, terakhir: '3hr', naik: 0, stagnan: 0 },
  { id: 2, kode: 'SR-001-0002', nama: 'Budi', tanggaLit: 0, tanggaNum: null, pekanLit: 4, pekanNum: 0, terakhir: '4mg', naik: 0, stagnan: 4 },
  { id: 3, kode: 'SR-001-0003', nama: 'Citra', tanggaLit: 3, tanggaNum: 2, pekanLit: 1, pekanNum: 1, terakhir: 'baru', naik: 2, stagnan: 0 },
  { id: 4, kode: 'SR-001-0004', nama: 'Dewi', tanggaLit: 3, tanggaNum: 3, pekanLit: 1, pekanNum: 1, terakhir: '5hr', naik: 0, stagnan: 0 },
  { id: 5, kode: 'SR-001-0005', nama: 'Eko', tanggaLit: 2, tanggaNum: 1, pekanLit: 2, pekanNum: 3, terakhir: '5hr', naik: 0, stagnan: 0 },
  { id: 6, kode: 'SR-001-0006', nama: 'Fajar', tanggaLit: null, tanggaNum: null, pekanLit: 0, pekanNum: 0, terakhir: null, naik: 0, stagnan: 0 },
  { id: 7, kode: 'SR-001-0007', nama: 'Gita', tanggaLit: 0, tanggaNum: 0, pekanLit: 1, pekanNum: 1, terakhir: '1mg', naik: 0, stagnan: 0 },
  { id: 8, kode: 'SR-001-0008', nama: 'Hadi', tanggaLit: 3, tanggaNum: 2, pekanLit: 0, pekanNum: 1, terakhir: '2hr', naik: 1, stagnan: 0 },
  { id: 9, kode: 'SR-001-0009', nama: 'Irma', tanggaLit: 1, tanggaNum: 0, pekanLit: 3, pekanNum: 2, terakhir: '2mg', naik: 0, stagnan: 0 },
  { id: 10, kode: 'SR-001-0010', nama: 'Joko', tanggaLit: 4, tanggaNum: 4, pekanLit: 1, pekanNum: 1, terakhir: '3hr', naik: 0, stagnan: 0 },
  { id: 11, kode: 'SR-001-0011', nama: 'Galih', tanggaLit: 0, tanggaNum: null, pekanLit: 3, pekanNum: 0, terakhir: '3mg', naik: 0, stagnan: 3 },
  { id: 12, kode: 'SR-001-0012', nama: 'Lina', tanggaLit: 3, tanggaNum: 3, pekanLit: 2, pekanNum: 2, terakhir: '6hr', naik: 0, stagnan: 0 },
  { id: 13, kode: 'SR-001-0013', nama: 'Maman', tanggaLit: 5, tanggaNum: 5, pekanLit: 1, pekanNum: 1, terakhir: '4hr', naik: 1, stagnan: 0 },
  { id: 14, kode: 'SR-001-0014', nama: 'Nia', tanggaLit: null, tanggaNum: null, pekanLit: 0, pekanNum: 0, terakhir: null, naik: 0, stagnan: 0 },
  { id: 15, kode: 'SR-001-0015', nama: 'Oman', tanggaLit: 4, tanggaNum: 3, pekanLit: 2, pekanNum: 1, terakhir: '2hr', naik: 0, stagnan: 0 },
  { id: 16, kode: 'SR-001-0016', nama: 'Putri', tanggaLit: 2, tanggaNum: 1, pekanLit: 1, pekanNum: 2, terakhir: '1mg', naik: 0, stagnan: 0 },
  { id: 17, kode: 'SR-001-0017', nama: 'Qori', tanggaLit: 5, tanggaNum: 4, pekanLit: 2, pekanNum: 1, terakhir: '1mg', naik: 0, stagnan: 0 },
  { id: 18, kode: 'SR-001-0018', nama: 'Indah', tanggaLit: 1, tanggaNum: 1, pekanLit: 3, pekanNum: 3, terakhir: '3mg', naik: 0, stagnan: 3 },
  { id: 19, kode: 'SR-001-0019', nama: 'Sari', tanggaLit: 6, tanggaNum: 5, pekanLit: 1, pekanNum: 1, terakhir: '2hr', naik: 0, stagnan: 0 },
  { id: 20, kode: 'SR-001-0020', nama: 'Tono', tanggaLit: 4, tanggaNum: 4, pekanLit: 3, pekanNum: 2, terakhir: '5hr', naik: 1, stagnan: 0 },
  { id: 21, kode: 'SR-001-0021', nama: 'Umar', tanggaLit: 1, tanggaNum: 2, pekanLit: 2, pekanNum: 1, terakhir: '2hr', naik: 0, stagnan: 0 },
  { id: 22, kode: 'SR-001-0022', nama: 'Rudi', tanggaLit: null, tanggaNum: null, pekanLit: 0, pekanNum: 0, terakhir: null, naik: 0, stagnan: 0 },
  { id: 23, kode: 'SR-001-0023', nama: 'Wati', tanggaLit: 3, tanggaNum: 3, pekanLit: 1, pekanNum: 1, terakhir: '1hr', naik: 1, stagnan: 0 },
  { id: 24, kode: 'SR-001-0024', nama: 'Anton', tanggaLit: 2, tanggaNum: 2, pekanLit: 2, pekanNum: 2, terakhir: '4hr', naik: 0, stagnan: 0 },
  { id: 25, kode: 'SR-001-0025', nama: 'Roni', tanggaLit: 0, tanggaNum: 0, pekanLit: 4, pekanNum: 4, terakhir: '4mg', naik: 0, stagnan: 4 },
  { id: 26, kode: 'SR-001-0026', nama: 'Susi', tanggaLit: 5, tanggaNum: 5, pekanLit: 2, pekanNum: 1, terakhir: '3hr', naik: 0, stagnan: 0 },
  { id: 27, kode: 'SR-001-0027', nama: 'Tomi', tanggaLit: 4, tanggaNum: 4, pekanLit: 1, pekanNum: 2, terakhir: '2hr', naik: 0, stagnan: 0 },
  { id: 28, kode: 'SR-001-0028', nama: 'Tini', tanggaLit: null, tanggaNum: null, pekanLit: 0, pekanNum: 0, terakhir: null, naik: 0, stagnan: 0 },
  { id: 29, kode: 'SR-001-0029', nama: 'Bayu', tanggaLit: 2, tanggaNum: 2, pekanLit: 2, pekanNum: 1, terakhir: '1mg', naik: 1, stagnan: 0 },
  { id: 30, kode: 'SR-001-0030', nama: 'Yusuf', tanggaLit: null, tanggaNum: null, pekanLit: 0, pekanNum: 0, terakhir: null, naik: 0, stagnan: 0 },
]

const TANGGA_LABELS = {
  LITERASI: ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf Lancar', 'Memahami Bacaan'],
  NUMERASI: ['Belum Mengenal Bilangan', 'Mengenal Bilangan 1-9', 'Bilangan 10-99', 'Penjumlahan & Pengurangan', 'Perkalian & Pembagian', 'Soal Cerita Sederhana'],
}

const DUMMY_RENCANA = {}
DUMMY_RENCANA['SR-001-0002'] = {
  dibuatOleh: 'Bu Santi', dibuatTanggal: '7 Agustus 2026', status: 'aktif',
  kegiatan: [
    { hari: 'Senin', kegiatan: 'Mengenal Huruf A-E', durasi: 15, instruksi: 'Kartu huruf besar A-E dengan gambar: A-ayam, B-buku. Minta siswa menyebutkan.', selesai: true },
    { hari: 'Selasa', kegiatan: 'Menebalkan Huruf', durasi: 15, instruksi: 'Lembar kerja menebalkan huruf A-E dengan pensil.', selesai: true },
    { hari: 'Rabu', kegiatan: 'Huruf di Pasir', durasi: 20, instruksi: 'Tulis di nampan pasir. Siswa menelusuri dengan jari.', selesai: false },
    { hari: 'Kamis', kegiatan: 'Latihan Mandiri', durasi: 15, instruksi: 'Siswa menunjuk dan menyebut 5 huruf acak tanpa bantuan.', selesai: false },
    { hari: 'Jumat', kegiatan: 'Evaluasi Mingguan', durasi: 20, instruksi: 'Tes 5 huruf acak. Target: 4/5 benar.', selesai: false },
  ],
  catatan: 'Budi mulai mengenali A, B, C. Masih bingung D dan E. Perlu latihan ekstra dengan gambar.',
}
DUMMY_RENCANA['SR-001-0011'] = {
  dibuatOleh: 'Bu Santi', dibuatTanggal: '8 Agustus 2026', status: 'aktif',
  kegiatan: [
    { hari: 'Senin', kegiatan: 'Huruf dengan Lagu', durasi: 15, instruksi: 'Nyanyikan alfabet. Tunjuk huruf satu per satu.', selesai: true },
    { hari: 'Selasa', kegiatan: 'Kartu Bergambar', durasi: 15, instruksi: 'Cocokkan kartu huruf dengan gambar.', selesai: false },
    { hari: 'Rabu', kegiatan: 'Menulis di Udara', durasi: 15, instruksi: 'Gerakan tangan besar, guru menebak huruf.', selesai: false },
    { hari: 'Kamis', kegiatan: 'Latihan Mandiri', durasi: 15, instruksi: 'Siswa sebut 5 huruf acak.', selesai: false },
    { hari: 'Jumat', kegiatan: 'Tes Kecil', durasi: 20, instruksi: 'Target: 3/5 benar.', selesai: false },
  ],
  catatan: 'Galih responsif dengan lagu. Vokal sudah dikuasai.',
}

// Riwayat pergerakan tangga per siswa (minggu 1-4)
const RIWAYAT_PERGERAKAN = {
  'SR-001-0002': [
    { minggu: 1, tangga: 0 }, { minggu: 2, tangga: 0 },
    { minggu: 3, tangga: 0 }, { minggu: 4, tangga: 0 },
  ],
  'SR-001-0003': [
    { minggu: 1, tangga: 1 }, { minggu: 2, tangga: 2 },
    { minggu: 3, tangga: 2 }, { minggu: 4, tangga: 3 },
  ],
  'SR-001-0013': [
    { minggu: 1, tangga: 4 }, { minggu: 2, tangga: 4 },
    { minggu: 3, tangga: 5 }, { minggu: 4, tangga: 5 },
  ],
}

// Rata-rata tingkat per kelompok per minggu
const PERGERAKAN_KELOMPOK = [
  { minggu: 'Mg 1', awal: 1.2, tengah: 3.5, lanjut: 5.3 },
  { minggu: 'Mg 2', awal: 1.4, tengah: 3.6, lanjut: 5.4 },
  { minggu: 'Mg 3', awal: 1.3, tengah: 3.7, lanjut: 5.5 },
  { minggu: 'Mg 4', awal: 1.5, tengah: 3.8, lanjut: 5.6 },
]

export { DEMO_AKUN, DEMO_SISWA_KELAS_A, TANGGA_LABELS, DUMMY_RENCANA, RIWAYAT_PERGERAKAN, PERGERAKAN_KELOMPOK }