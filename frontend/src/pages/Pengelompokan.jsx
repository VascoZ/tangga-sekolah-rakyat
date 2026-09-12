import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import { useToast } from '../components/ToastProvider'

const TANGGA_COLORS = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']

// Mock data
const KELOMPOK = {
  awal: { nama: 'Awal (T0-2)', siswa: ['SR-001-0002', 'SR-001-0007', 'SR-001-0001', 'SR-001-0009'], stagnan: 2 },
  tengah: { nama: 'Tengah (T3-4)', siswa: ['SR-001-0003', 'SR-001-0004', 'SR-001-0008'], stagnan: 0 },
  lanjut: { nama: 'Lanjut (T5-6)', siswa: ['SR-001-0005', 'SR-001-0006'], stagnan: 0 },
}

function Pengelompokan() {
  const navigate = useNavigate()
  const toast = useToast()
  const [reordering, setReordering] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)

  const generateBahanUntuk = (nama) => {
    toast.success(`Menyusun bahan ajar untuk kelompok ${nama}...`)
    navigate('/guru/bahan')
  }

  const aturUlangKelompok = () => {
    setReordering(true)
    setTimeout(() => {
      setReordering(false)
      toast.success('Kelompok diperbarui berdasarkan hasil asesmen terbaru.')
    }, 900)
  }

  const generateSemuaBahan = () => {
    setGeneratingAll(true)
    setTimeout(() => {
      setGeneratingAll(false)
      toast.success('Bahan ajar untuk 3 kelompok siap ditinjau.')
      navigate('/guru/bahan')
    }, 1200)
  }

  return (
    <GuruShell title="Pengelompokan Kelas — Kelas A (SMA)" subtitle="Minggu ke-3 · Tema: Lingkungan Sekitarku">
      <div className="mb-4">
        <TanggaLegend jenis="LITERASI" />
      </div>

      {/* Kelompok Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {Object.entries(KELOMPOK).map(([key, kelompok]) => (
          <div key={key} className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className={`${key === 'awal' ? 'bg-tangga-0' : key === 'tengah' ? 'bg-tangga-3' : 'bg-tangga-6'} text-white p-4`}>
              <div className="font-display font-semibold">
                {key === 'awal' ? '▲' : key === 'tengah' ? '█' : '◆'} {kelompok.nama}
              </div>
              <div className="text-sm opacity-90">
                {kelompok.siswa.length} siswa
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {kelompok.siswa.map((kode, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-sr-600">{kode}</span>
                    <span className="text-xs text-sr-400">T{key === 'awal' ? idx : key === 'tengah' ? idx + 3 : idx + 5}</span>
                  </div>
                ))}
              </div>
              {kelompok.stagnan > 0 && (
                <div className="text-xs text-orange-600 mb-2">
                  ⚠ {kelompok.stagnan} stagnan
                </div>
              )}
              <button
                onClick={() => generateBahanUntuk(kelompok.nama)}
                className="w-full bg-sr-100 text-sr-700 py-2 rounded-lg font-medium hover:bg-sr-200 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Generate Bahan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" /> Distribusi Tangga (30 siswa)
        </h2>
        <div className="space-y-2">
          {[
            { t: 6, count: 3, pct: 10 },
            { t: 5, count: 5, pct: 17 },
            { t: 4, count: 8, pct: 27 },
            { t: 3, count: 12, pct: 40 },
            { t: 2, count: 6, pct: 20 },
            { t: 1, count: 4, pct: 13 },
            { t: 0, count: 2, pct: 7 },
          ].map((item) => (
            <div key={item.t} className="flex items-center gap-2">
              <span className="w-8 text-sm text-sr-500">T{item.t}</span>
              <div className="flex-1 h-6 bg-sr-100 rounded overflow-hidden">
                <div
                  className={`h-full ${TANGGA_COLORS[item.t]}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-sm text-sr-600">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={aturUlangKelompok}
          disabled={reordering}
          className="bg-white border-2 border-sr-200 text-sr-700 py-3 rounded-lg font-medium hover:bg-sr-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${reordering ? 'animate-spin' : ''}`} />
          {reordering ? 'Menyusun ulang...' : 'Atur Ulang Kelompok'}
        </button>
        <button
          onClick={generateSemuaBahan}
          disabled={generatingAll}
          className="bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generatingAll ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {generatingAll ? 'AI menyusun...' : 'Generate Semua Bahan'}
        </button>
      </div>
    </GuruShell>
  )
}

export default Pengelompokan
