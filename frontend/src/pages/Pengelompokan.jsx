import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../lib/auth'
import { tanggaApi, bahanApi } from '../lib/api'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import { useToast } from '../components/ToastProvider'

const TANGGA_COLORS = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']

const KELOMPOK_META = {
  awal: { nama: 'Awal (T0-2)', icon: '▲', bg: 'bg-tangga-0' },
  tengah: { nama: 'Tengah (T3-4)', icon: '█', bg: 'bg-tangga-3' },
  lanjut: { nama: 'Lanjut (T5-6)', icon: '◆', bg: 'bg-tangga-6' },
}

function Pengelompokan() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1
  const [data, setData] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generatingKelompok, setGeneratingKelompok] = useState(null)

  const load = () => {
    tanggaApi.getKelas(kelasId).then(setData).catch(() => toast.error('Gagal memuat pengelompokan.'))
  }
  useEffect(load, [kelasId])

  const totalSiswa = data ? Object.values(data.kelompok).reduce((n, arr) => n + arr.length, 0) : 0

  const generateBahanUntuk = async (key, kelompok) => {
    setGeneratingKelompok(key)
    try {
      const tingkatList = kelompok.nama.match(/T(\d)-(\d)/)
      const tingkat = tingkatList
        ? Array.from({ length: +tingkatList[2] - +tingkatList[1] + 1 }, (_, i) => +tingkatList[1] + i)
        : undefined
      await bahanApi.generate('Lingkungan Sekitarku', kelasId, tingkat)
      toast.success(`Bahan ajar untuk kelompok ${KELOMPOK_META[key].nama} disiapkan.`)
      navigate('/guru/bahan')
    } catch (err) {
      toast.error(`Gagal generate bahan: ${err.message}`)
    } finally {
      setGeneratingKelompok(null)
    }
  }

  const aturUlangKelompok = () => {
    setReordering(true)
    setTimeout(() => {
      setReordering(false)
      toast.success('Kelompok diperbarui berdasarkan hasil asesmen terbaru.')
      load()
    }, 600)
  }

  const generateSemuaBahan = async () => {
    setGeneratingAll(true)
    try {
      await bahanApi.generate('Lingkungan Sekitarku', kelasId)
      toast.success('Bahan ajar untuk semua tingkat siap ditinjau.')
      navigate('/guru/bahan')
    } catch (err) {
      toast.error(`Gagal generate bahan: ${err.message}`)
    } finally {
      setGeneratingAll(false)
    }
  }

  if (!data) {
    return (
      <GuruShell title="Pengelompokan Kelas — Kelas A (SMA)" subtitle="Memuat...">
        <div className="text-center py-16 text-sr-400">Memuat pengelompokan...</div>
      </GuruShell>
    )
  }

  return (
    <GuruShell title="Pengelompokan Kelas — Kelas A (SMA)" subtitle="Minggu ke-3">
      <div className="mb-4">
        <TanggaLegend jenis="LITERASI" />
      </div>

      {/* Kelompok Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {Object.entries(data.kelompok).map(([key, siswaList]) => {
          const meta = KELOMPOK_META[key]
          return (
            <div key={key} className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className={`${meta.bg} text-white p-4`}>
                <div className="font-display font-semibold">
                  {meta.icon} {meta.nama}
                </div>
                <div className="text-sm opacity-90">
                  {siswaList.length} siswa
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {siswaList.length === 0 && <div className="text-sm text-sr-400">Belum ada siswa.</div>}
                  {siswaList.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-sm">
                      <span className="text-sr-600">{s.nama || s.kode}</span>
                      <span className="text-xs text-sr-400">{s.tingkat !== null ? `T${s.tingkat}` : '—'}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => generateBahanUntuk(key, meta)}
                  disabled={generatingKelompok === key}
                  className="w-full bg-sr-100 text-sr-700 py-2 rounded-lg font-medium hover:bg-sr-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingKelompok === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  Generate Bahan
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" /> Distribusi Tangga ({totalSiswa} siswa)
        </h2>
        <div className="space-y-2">
          {[6, 5, 4, 3, 2, 1, 0].map((t) => {
            const count = data.sebaran[`T${t}`] || 0
            const pct = totalSiswa ? Math.round((count / totalSiswa) * 100) : 0
            return (
              <div key={t} className="flex items-center gap-2">
                <span className="w-8 text-sm text-sr-500">T{t}</span>
                <div className="flex-1 h-6 bg-sr-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${TANGGA_COLORS[t]}`}
                    style={{ width: `${Math.max(pct, count ? 3 : 0)}%`, transition: 'width 0.5s' }}
                  />
                </div>
                <span className="text-sm text-sr-600">{count}</span>
              </div>
            )
          })}
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
