import { useState } from 'react'
import { Sparkles, Printer, Edit2, Plus } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import { useToast } from '../components/ToastProvider'

const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf Lancar', 'Memahami Bacaan']

const BAHAN_PER_TINGKAT = {
  0: {
    tipe: 'huruf',
    instruksi_guru: 'Tunjukkan kartu huruf satu per satu. Minta siswa menyebutkan nama huruf dan benda yang diawali huruf tersebut.',
    kartu: ['A', 'B', 'C', 'D', 'I'],
    latihan: 'Gunakan kartu huruf besar dengan gambar benda: A-ayam, B-buku, C-cangkul, D-daun, I-ikan.',
  },
  1: {
    tipe: 'huruf',
    instruksi_guru: 'Minta siswa menebalkan huruf di lembar kerja. Sebutkan nama dan bunyi setiap huruf.',
    kartu: ['M', 'S', 'L', 'P', 'N'],
    latihan: 'Tebalkan huruf dengan pensil, lalu sebutkan bunyinya dengan lantang.',
  },
  2: {
    tipe: 'suku_kata',
    instruksi_guru: 'Tunjukkan kartu suku kata. Minta siswa membaca dengan lantang, lalu rangkai menjadi kata.',
    kartu: ['BA-TU', 'RU-MAH', 'I-KAN', 'SA-PI', 'BU-KU'],
    latihan: 'Gunting dan tempel suku kata untuk membentuk kata: ba-tu → batu, ru-mah → rumah.',
  },
  3: {
    tipe: 'kata',
    instruksi_guru: 'Tunjukkan kartu kata satu per satu. Minta siswa membaca dengan lantang. Jika kesulitan, bantu mengeja per suku kata.',
    kartu: ['RUMAH', 'JALAN', 'POHON', 'SUNGAI', 'SAWAH'],
    latihan: 'Jika siswa masih kesulitan, kembali ke suku kata: ru-mah, ja-lan. Gunakan kartu bergambar.',
  },
  4: {
    tipe: 'kalimat',
    instruksi_guru: 'Tunjukkan kartu kalimat. Minta siswa membaca dengan lantang dan intonasi yang tepat.',
    kartu: ['Ibu pergi ke pasar', 'Adik bermain bola', 'Ayah membaca koran', 'Kakak menyapu halaman', 'Nenek duduk di kursi'],
    latihan: 'Baca kalimat berulang sampai lancar, lalu tunjuk kata-kata yang dikenali.',
  },
  5: {
    tipe: 'paragraf',
    instruksi_guru: 'Minta siswa membaca paragraf pendek dengan lancar. Catat kata yang masih tersendat.',
    kartu: ['Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.'],
    latihan: 'Baca paragraf berulang. Hitung kata per menit untuk melihat kemajuan.',
  },
  6: {
    tipe: 'pemahaman',
    instruksi_guru: 'Setelah siswa membaca paragraf, tanyakan pertanyaan pemahaman di bawah.',
    kartu: [
      { tanya: 'Siapa yang pergi ke sekolah?', jawab: 'Budi' },
      { tanya: 'Apa yang mereka lihat di jalan?', jawab: 'pohon dan bunga' },
      { tanya: 'Mengapa Budi senang?', jawab: 'karena hari cerah' },
    ],
    latihan: 'Minta siswa menceritakan kembali isi bacaan dengan kata-kata sendiri.',
  },
}

const TANGGA_COLORS = {
  0: 'bg-tangga-0', 1: 'bg-tangga-1', 2: 'bg-tangga-2', 3: 'bg-tangga-3',
  4: 'bg-tangga-4', 5: 'bg-tangga-5', 6: 'bg-tangga-6',
}

const JUDUL_SEKSI = {
  huruf: 'Kartu Huruf (cetak & gunting):',
  suku_kata: 'Kartu Suku Kata (cetak & gunting):',
  kata: 'Kartu Kata (cetak & gunting):',
  kalimat: 'Kartu Kalimat (cetak & gunting):',
  paragraf: 'Teks Bacaan:',
  pemahaman: 'Pertanyaan Pemahaman:',
}

function BahanAjar() {
  const toast = useToast()
  const [selectedTingkat, setSelectedTingkat] = useState(3)
  const [temas, setTemas] = useState(['Lingkungan Sekitarku', 'Keluargaku', 'Makanan'])
  const [temaAktif, setTemaAktif] = useState('Lingkungan Sekitarku')
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const bahan = BAHAN_PER_TINGKAT[selectedTingkat]
  const jumlahSiswa = { 0: 2, 1: 4, 2: 6, 3: 12, 4: 10, 5: 5, 6: 3 }

  const handleGenerate = () => {
    setLoadingGenerate(true)
    setTimeout(() => {
      setLoadingGenerate(false)
      toast.success(`Bahan ajar baru untuk tema "${temaAktif}" (7 tingkat) siap ditinjau.`)
    }, 1500)
  }

  const handleTambahTema = () => {
    const nama = window.prompt('Nama tema baru:')
    const trimmed = nama?.trim()
    if (!trimmed) return
    if (temas.includes(trimmed)) {
      toast.info(`Tema "${trimmed}" sudah ada.`)
      setTemaAktif(trimmed)
      return
    }
    setTemas((prev) => [...prev, trimmed])
    setTemaAktif(trimmed)
    toast.success(`Tema "${trimmed}" ditambahkan. Generate bahan untuk mengisinya.`)
  }

  const handleCetak = () => {
    window.print()
  }

  return (
    <GuruShell title={`Bahan Ajar — "${temaAktif}"`} subtitle="Dihasilkan: 10 Agustus 2026 · 7 tingkat">
      {/* Tema Selector */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {temas.map((t) => (
            <button
              key={t}
              onClick={() => setTemaAktif(t)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                temaAktif === t ? 'bg-sr-700 text-white' : 'bg-sr-100 text-sr-700 hover:bg-sr-200'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={handleTambahTema}
            className="px-4 py-2 rounded-lg border-2 border-dashed border-sr-300 text-sr-500 whitespace-nowrap hover:bg-sr-50 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Tema Baru
          </button>
        </div>
      </div>

      {/* Tingkat Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6">
        {[0, 1, 2, 3, 4, 5, 6].map((t) => (
          <button
            key={t}
            onClick={() => { setSelectedTingkat(t); setEditMode(false) }}
            className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedTingkat === t ? 'bg-sr-700 text-white' : 'bg-white text-sr-700 hover:bg-sr-50'
            }`}
          >
            <div className="text-sm">T.{t}</div>
            <div className="text-xs opacity-75">{TANGGA_LABELS[t].split(' ').slice(0, 2).join(' ')}</div>
            <div className="text-xs opacity-60 mt-0.5">{jumlahSiswa[t]} ssw</div>
          </button>
        ))}
      </div>

      {/* Bahan Content */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className={`${TANGGA_COLORS[selectedTingkat]} text-white p-6`}>
          <div className="font-display text-xl font-semibold">
            Tingkat {selectedTingkat} — {TANGGA_LABELS[selectedTingkat]}
          </div>
          <div className="text-sm opacity-90 mt-1">
            Untuk {jumlahSiswa[selectedTingkat]} siswa · Tema: {temaAktif}
          </div>
        </div>

        <div className="p-6">
          {/* Instruksi Guru */}
          <div className="mb-6">
            <h3 className="font-medium text-sr-900 mb-2">📋 Instruksi untuk Guru:</h3>
            {editMode ? (
              <textarea
                defaultValue={bahan.instruksi_guru}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-sr-300 focus:border-sr-500 outline-none text-sr-700"
              />
            ) : (
              <p className="text-sr-600">{bahan.instruksi_guru}</p>
            )}
          </div>

          {/* Kartu / Teks / Soal */}
          <div className="mb-6">
            <h3 className="font-medium text-sr-900 mb-2">{JUDUL_SEKSI[bahan.tipe]}</h3>
            {selectedTingkat === 6 ? (
              <div className="space-y-3">
                {bahan.kartu.map((q, idx) => (
                  <div key={idx} className="bg-sr-50 rounded-lg p-4">
                    <div className="font-medium text-sr-900">❓ {q.tanya}</div>
                    <div className="text-sm text-green-700 mt-1">💡 Jawaban: {q.jawab}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bahan.kartu.map((k, idx) => (
                  <div key={idx} className="bg-sr-50 rounded-lg p-4 text-center">
                    <div className="text-lg md:text-xl font-bold text-sr-900 break-words">{k}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latihan Tambahan */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-orange-800 mb-2">💡 Latihan Tambahan (jika masih kesulitan):</h3>
            <p className="text-orange-700">{bahan.latihan}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                if (editMode) toast.success('Perubahan bahan ajar disimpan.')
                setEditMode((e) => !e)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                editMode ? 'border-green-300 bg-green-50 text-green-700' : 'border-sr-200 text-sr-700 hover:bg-sr-50'
              }`}
            >
              <Edit2 className="w-4 h-4" /> {editMode ? 'Simpan Perubahan' : 'Edit'}
            </button>
            <button
              onClick={handleCetak}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-sr-200 text-sr-700 hover:bg-sr-50"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Generate New */}
      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={loadingGenerate}
          className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingGenerate ? (
            <>
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI sedang menyusun bahan ajar...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Ulang Bahan Tema Ini
            </>
          )}
        </button>
      </div>
    </GuruShell>
  )
}

export default BahanAjar
