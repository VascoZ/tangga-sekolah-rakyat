import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf Lancar', 'Memahami Bacaan']

function AsesmenHasil() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const siswa = state.siswa || { nama: 'Siswa', kode: 'SR-...' }
  const jenis = state.jenis || 'LITERASI'
  const hasil = state.hasil ?? 0
  const naik = state.naik ?? 0
  const tingkatAwal = state.tingkatAwal ?? 0
  const durasi = state.durasi || '00:00'
  const detail = state.detail || []

  // Group detail by tingkat
  const groupByTingkat = {}
  detail.forEach(d => {
    if (!groupByTingkat[d.tingkat]) groupByTingkat[d.tingkat] = []
    groupByTingkat[d.tingkat].push(d)
  })

  useEffect(() => {
    if (naik >= 2) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } })
    }
  }, [naik])

  return (
    <div className="min-h-screen bg-krem pb-20">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-sr-900 mb-2">
            {naik >= 2 ? '🎉 Hasil Asesmen' : naik === 1 ? '✨ Hasil Asesmen' : 'Hasil Asesmen'}
          </h1>
          <p className="text-sr-500">{siswa.kode} · {siswa.nama} · {siswa.jenjang || 'SMA'}</p>
        </div>

        {/* Result Badge */}
        <div className="bg-white rounded-xl p-8 shadow-card mb-6 text-center">
          <div className={`inline-block px-8 py-4 rounded-xl text-white font-display font-bold text-2xl badge-tangga-${hasil}`}>
            Mulai dari Tangga {hasil}
          </div>
          <div className="text-sr-600 mt-2 text-lg">
            {TANGGA_LABELS[hasil]}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sr-500">Posisi awal: Tangga {tingkatAwal}</span>
            <span className={`font-medium ${naik > 0 ? 'text-green-600' : naik < 0 ? 'text-red-500' : 'text-sr-500'}`}>
              {naik > 0 ? `▲ Naik ${naik} tingkat` : naik < 0 ? `▼ Turun ${Math.abs(naik)} tingkat` : '▬ Tetap'}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((t) => (
              <div
                key={t}
                className={`flex-1 h-3 rounded transition-colors ${
                  t === hasil ? `badge-tangga-${t}` : t >= tingkatAwal && t <= hasil ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-sr-400 mt-1">
            <span>T0</span><span>T6</span>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h3 className="font-display font-semibold text-sr-900 mb-4">Detail Jawaban</h3>
          {Object.entries(groupByTingkat).map(([t, items]) => {
            const benarCount = items.filter(i => i.benar).length
            const lulus = benarCount >= 3
            return (
              <div key={t} className={`border-l-4 ${lulus ? 'border-green-400' : 'border-red-400'} pl-4 mb-4`}>
                <div className="font-medium text-sr-900">
                  Tingkat {t} ({TANGGA_LABELS[parseInt(t)]})
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {items.map((item, idx) => (
                    item.benar
                      ? <CheckCircle key={idx} className="w-5 h-5 text-green-500" />
                      : <XCircle key={idx} className="w-5 h-5 text-red-500" />
                  ))}
                </div>
                <div className="text-sm text-sr-500 mt-1">
                  {benarCount}/5 benar — {lulus ? (parseInt(t) === hasil ? `Titik Pijak: Tangga ${t}` : `Lulus ▸ Tingkat ${parseInt(t) + 1}`) : 'Tidak Lulus ◂'}
                </div>
              </div>
            )
          })}
        </div>

        {/* Duration */}
        <div className="text-center text-sr-500 mb-6">
          ⏱ Durasi: {durasi}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button onClick={() => navigate('/guru/siswa')} className="bg-white border-2 border-sr-200 text-sr-700 py-3 rounded-lg font-medium hover:bg-sr-50">
            Lihat Daftar Siswa
          </button>
          <button onClick={() => navigate('/guru/kelompok')} className="bg-white border-2 border-sr-200 text-sr-700 py-3 rounded-lg font-medium hover:bg-sr-50">
            Lihat Pengelompokan
          </button>
        </div>
        <button onClick={() => navigate('/guru/asesmen')} className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors">
          Mulai Asesmen Siswa Lain →
        </button>
      </main>
    </div>
  )
}

export default AsesmenHasil