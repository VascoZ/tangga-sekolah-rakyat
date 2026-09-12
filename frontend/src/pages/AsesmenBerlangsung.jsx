import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'

const MOCK_ITEMS = {
  LITERASI: {
    0: [
      { teks: 'A', instruksi: 'Tunjuk huruf. Tanyakan: Huruf apa ini?' },
      { teks: 'B', instruksi: 'Tunjuk huruf. Tanyakan: Huruf apa ini?' },
      { teks: 'C', instruksi: 'Tunjuk huruf. Tanyakan: Huruf apa ini?' },
      { teks: 'D', instruksi: 'Tunjuk huruf. Tanyakan: Huruf apa ini?' },
      { teks: 'I', instruksi: 'Tunjuk huruf. Tanyakan: Huruf apa ini?' },
    ],
    1: [
      { teks: 'M', instruksi: 'Tunjuk huruf. Minta siswa sebutkan nama dan bunyinya.' },
      { teks: 'S', instruksi: 'Tunjuk huruf. Minta siswa sebutkan nama dan bunyinya.' },
      { teks: 'L', instruksi: 'Tunjuk huruf. Minta siswa sebutkan nama dan bunyinya.' },
      { teks: 'P', instruksi: 'Tunjuk huruf. Minta siswa sebutkan nama dan bunyinya.' },
      { teks: 'N', instruksi: 'Tunjuk huruf. Minta siswa sebutkan nama dan bunyinya.' },
    ],
    2: [
      { teks: 'BA-TU', instruksi: 'Tunjuk suku kata. Tanyakan: Coba baca ini.' },
      { teks: 'RU-MAH', instruksi: 'Tunjuk suku kata. Tanyakan: Coba baca ini.' },
      { teks: 'I-KAN', instruksi: 'Tunjuk suku kata. Tanyakan: Coba baca ini.' },
      { teks: 'SA-PI', instruksi: 'Tunjuk suku kata. Tanyakan: Coba baca ini.' },
      { teks: 'BU-KU', instruksi: 'Tunjuk suku kata. Tanyakan: Coba baca ini.' },
    ],
    3: [
      { teks: 'RUMAH', instruksi: 'Tunjukkan kartu kata. Minta siswa membaca dengan lantang.' },
      { teks: 'JALAN', instruksi: 'Tunjukkan kartu kata. Minta siswa membaca dengan lantang.' },
      { teks: 'POHON', instruksi: 'Tunjukkan kartu kata. Minta siswa membaca dengan lantang.' },
      { teks: 'SUNGAI', instruksi: 'Tunjukkan kartu kata. Minta siswa membaca dengan lantang.' },
      { teks: 'BALO', instruksi: 'Tunjukkan kartu kata. Minta siswa membaca dengan lantang.' },
    ],
    4: [
      { teks: 'Ibu pergi ke pasar', instruksi: 'Tunjukkan kalimat. Minta siswa membaca dengan lantang.' },
      { teks: 'Adik bermain bola', instruksi: 'Tunjukkan kalimat. Minta siswa membaca dengan lantang.' },
      { teks: 'Ayah membaca koran', instruksi: 'Tunjukkan kalimat. Minta siswa membaca dengan lantang.' },
      { teks: 'Kakak menyapu halaman', instruksi: 'Tunjukkan kalimat. Minta siswa membaca dengan lantang.' },
      { teks: 'Nenek duduk di kursi', instruksi: 'Tunjukkan kalimat. Minta siswa membaca dengan lantang.' },
    ],
    5: [
      { teks: 'Pagi ini, Budi pergi ke sekolah.', instruksi: 'Minta siswa membaca paragraf dengan lancar.' },
      { teks: 'Ia berjalan bersama teman-temannya.', instruksi: 'Lanjutkan paragraf.' },
      { teks: 'Di jalan, mereka melihat pohon dan bunga.', instruksi: 'Lanjutkan paragraf.' },
      { teks: 'Budi senang karena hari ini cerah.', instruksi: 'Lanjutkan paragraf.' },
      { teks: 'Ia sampai di sekolah tepat waktu.', instruksi: 'Selesaikan paragraf.' },
    ],
    6: [
      { teks: 'Siapa yang pergi ke sekolah?', instruksi: 'Tanyakan: Siapa yang pergi ke sekolah? (Jawaban: Budi)' },
      { teks: 'Apa yang mereka lihat di jalan?', instruksi: 'Tanyakan: Apa yang mereka lihat? (Jawaban: pohon dan bunga)' },
      { teks: 'Mengapa Budi senang?', instruksi: 'Tanyakan: Mengapa Budi senang? (Jawaban: hari cerah)' },
      { teks: 'Bagaimana Budi pergi ke sekolah?', instruksi: 'Tanyakan: Bagaimana Budi pergi? (Jawaban: berjalan)' },
      { teks: 'Hari apa Budi pergi ke sekolah?', instruksi: 'Tanyakan: Kapan Budi pergi? (Jawaban: pagi hari)' },
    ],
  },
}

const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf Lancar', 'Memahami Bacaan']

function AsesmenBerlangsung() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const siswa = state.siswa || { nama: 'Siswa', kode: 'SR-001-0000' }
  const jenis = state.jenis || 'LITERASI'
  const tingkatAwal = jenis === 'LITERASI' ? (siswa.tanggaLit ?? 0) : (siswa.tanggaNum ?? 0)

  const [tingkat, setTingkat] = useState(tingkatAwal)
  const [itemKe, setItemKe] = useState(0)
  const [jawaban, setJawaban] = useState([])
  const [waktu, setWaktu] = useState(0)
  const [showTransisi, setShowTransisi] = useState(false)
  const [transisiAksi, setTransisiAksi] = useState(null)
  const [detailJawaban, setDetailJawaban] = useState([])

  useEffect(() => {
    const timer = setInterval(() => setWaktu(w => w + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleBatalkan = () => {
    if (window.confirm('Batalkan asesmen ini? Jawaban yang sudah tercatat akan hilang.')) {
      navigate('/guru/asesmen')
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selesaiAsesmen = (hasilTingkat) => {
    navigate('/guru/asesmen/hasil', {
      state: {
        siswa,
        jenis,
        tingkatAwal,
        hasil: hasilTingkat,
        naik: hasilTingkat - tingkatAwal,
        durasi: formatTime(waktu),
        detail: [...detailJawaban],
      },
    })
  }

  const handleJawab = (benar) => {
    const newJawaban = [...jawaban, benar]
    const items = MOCK_ITEMS.LITERASI[tingkat] || []
    const newDetail = [...detailJawaban, { tingkat, itemKe, teks: items[itemKe]?.teks || '', benar }]
    setDetailJawaban(newDetail)
    setJawaban(newJawaban)

    if (newJawaban.length >= 5) {
      const benarCount = newJawaban.filter(j => j).length

      if (benarCount >= 3) {
        // Lulus
        if (tingkat < 6) {
          setTransisiAksi('naik')
          setShowTransisi(true)
          setTimeout(() => {
            setShowTransisi(false)
            setTingkat(tingkat + 1)
            setItemKe(0)
            setJawaban([])
          }, 1500)
        } else {
          selesaiAsesmen(6)
        }
      } else {
        // Tidak lulus -> selesai
        if (tingkat > 0 && tingkat <= tingkatAwal + 1) {
          setTransisiAksi('selesai')
          setShowTransisi(true)
          setTimeout(() => {
            selesaiAsesmen(tingkatAwal)
          }, 1500)
        } else {
          selesaiAsesmen(tingkat > 0 ? tingkat : 0)
        }
      }
    } else {
      setItemKe(itemKe + 1)
    }
  }

  const items = MOCK_ITEMS.LITERASI[tingkat] || []
  const current = items[itemKe]

  if (showTransisi) {
    return (
      <div className="min-h-screen bg-krem flex items-center justify-center">
        <div className="text-center animate-slideUp">
          {transisiAksi === 'naik' ? (
            <>
              <div className="text-7xl mb-4">▲</div>
              <div className="text-3xl font-display font-bold text-green-700 mb-2">
                Naik ke Tingkat {tingkat + 1}!
              </div>
              <div className="text-lg text-sr-500">
                {TANGGA_LABELS[tingkat + 1]}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-display font-bold text-sr-700 mb-2">
                Titik pijak ditemukan
              </div>
              <div className="text-lg text-sr-500">
                {TANGGA_LABELS[tingkat]}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-krem flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display font-semibold text-sr-900 mb-4">
            Asesmen Selesai
          </div>
          <button
            onClick={() => selesaiAsesmen(tingkat)}
            className="bg-sr-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Lihat Hasil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krem pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-sr-500 text-sm">ASESMEN {jenis}</p>
            <p className="font-display text-lg font-semibold text-sr-900">
              {siswa.kode} · {siswa.nama} · {siswa.jenjang || 'SMA'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono font-medium text-sr-700 tabular-nums">
              ⏱ {formatTime(waktu)}
            </div>
            <button
              onClick={handleBatalkan}
              aria-label="Batalkan asesmen"
              className="text-sr-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tingkat Badge */}
        <div className="text-center mb-8">
          <div className={`inline-block px-6 py-3 rounded-xl text-white font-display font-semibold text-xl badge-tangga-${tingkat}`}>
            TINGKAT {tingkat}
          </div>
          <div className="text-sr-600 mt-2 text-lg">
            {TANGGA_LABELS[tingkat]}
          </div>
        </div>

        {/* Instruksi */}
        <div className="bg-white rounded-xl p-5 shadow-card mb-8">
          <p className="text-sr-700">
            📢 <strong>Instruksi untuk Guru:</strong>
          </p>
          <p className="text-sr-600 mt-2 text-lg">
            "{current.instruksi}"
          </p>
        </div>

        {/* Item Display */}
        <div className="bg-white rounded-xl p-10 shadow-card mb-8 text-center min-h-[200px] flex items-center justify-center">
          <div className="font-mono font-bold text-sr-900" style={{ fontSize: '64px', lineHeight: '1.2' }}>
            {current.teks}
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-3 mb-8">
          {items.map((_, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-colors ${
                idx < itemKe ? 'bg-green-500' : idx === itemKe ? 'bg-sr-700 ring-2 ring-sr-300' : 'bg-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-sr-400 ml-2">{itemKe + 1}/{items.length}</span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleJawab(false)}
            className="bg-red-50 border-2 border-red-300 text-red-700 py-6 rounded-xl font-bold text-xl hover:bg-red-100 active:scale-95 transition-all select-none"
          >
            ✗ SALAH
          </button>
          <button
            onClick={() => handleJawab(true)}
            className="bg-green-50 border-2 border-green-400 text-green-700 py-6 rounded-xl font-bold text-xl hover:bg-green-100 active:scale-95 transition-all select-none"
          >
            ✓ BENAR
          </button>
        </div>

        <p className="text-center text-sm text-sr-400 mt-6">
          ⓘ Ketuk tombol setelah siswa menjawab lisan. Siswa tidak melihat layar ini.
        </p>
      </main>
    </div>
  )
}

export default AsesmenBerlangsung