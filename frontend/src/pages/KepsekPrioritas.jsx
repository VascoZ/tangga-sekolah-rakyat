import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Building2, Sparkles, CheckCircle2 } from 'lucide-react'
import { DEMO_SISWA_KELAS_A } from '../lib/demoData'
import SidebarShell from '../components/SidebarShell'
import { useToast } from '../components/ToastProvider'

const NAV = [
  { to: '/kepsek', label: 'Dashboard', icon: BarChart3 },
  { to: '/kepsek/kelas', label: 'Per Kelas', icon: Building2 },
  { to: '/kepsek/prioritas', label: 'Prioritas', icon: AlertTriangle },
]

function KepsekPrioritas() {
  const toast = useToast()
  const [ditanganiIds, setDitanganiIds] = useState(new Set())

  const stagnanList = useMemo(() => {
    return DEMO_SISWA_KELAS_A
      .filter(s => s.stagnan >= 3)
      .sort((a, b) => b.stagnan - a.stagnan)
  }, [])

  const tandaiDitangani = (id, nama) => {
    setDitanganiIds(prev => new Set([...prev, id]))
    toast.success(`${nama} ditandai sudah ditangani.`)
  }

  const berat = stagnanList.filter(s => s.stagnan >= 5)
  const sedang = stagnanList.filter(s => s.stagnan < 5)

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah" backTo="/kepsek">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Siswa Prioritas</h1>
          <p className="text-sr-500 text-sm mt-1">{stagnanList.length} siswa membutuhkan perhatian khusus</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full font-medium">
            {berat.length} Berat
          </span>
          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full font-medium">
            {sedang.length} Sedang
          </span>
        </div>
      </div>

      {stagnanList.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-10 text-center text-sr-500">
          Tidak ada siswa dengan stagnasi ≥ 3 minggu saat ini. 🎉
        </div>
      )}

      {/* BERAT */}
      {berat.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Level BERAT (stagnasi ≥ 5 minggu) — {berat.length} siswa
          </h2>
          {berat.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl p-6 shadow-card mb-4 border-l-4 ${ditanganiIds.has(s.id) ? 'border-green-400' : 'border-red-400'}`}>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <div className="font-display font-semibold text-sr-900 text-lg">{s.nama} · {s.kode}</div>
                  <div className="text-sm text-sr-500 mt-1">Kelas A (SMA) · Tangga {s.tanggaLit} · Stagnan {s.stagnan} minggu</div>
                </div>
                {ditanganiIds.has(s.id) ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Sudah ditangani
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full font-medium">⚠ Butuh Intervensi</span>
                )}
              </div>
              <div className="bg-sr-50 rounded-lg p-4 mb-4">
                <div className="text-xs text-sr-400 mb-1">Pergerakan {s.stagnan} minggu terakhir:</div>
                <div className="flex gap-1">
                  {Array.from({ length: s.stagnan }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded bg-red-400 flex items-center justify-center text-white text-xs font-bold">T{s.tanggaLit}</div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to={`/guru/rencana?siswa=${s.kode}`} className="flex items-center gap-2 px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900 transition-colors">
                  <Sparkles className="w-4 h-4" /> Lihat Rencana Pendampingan
                </Link>
                {!ditanganiIds.has(s.id) && (
                  <button onClick={() => tandaiDitangani(s.id, s.nama)} className="px-4 py-2 border border-sr-200 text-sr-700 rounded-lg text-sm font-medium hover:bg-sr-50 transition-colors">
                    Tandai Sudah Ditangani
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEDANG */}
      {sedang.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-orange-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Level SEDANG (stagnasi 3-4 minggu) — {sedang.length} siswa
          </h2>
          {sedang.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl p-6 shadow-card mb-4 border-l-4 ${ditanganiIds.has(s.id) ? 'border-green-400' : 'border-orange-300'}`}>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <div className="font-display font-semibold text-sr-900 text-lg">{s.nama} · {s.kode}</div>
                  <div className="text-sm text-sr-500 mt-1">Kelas A (SMA) · Tangga {s.tanggaLit} · Stagnan {s.stagnan} minggu</div>
                </div>
                {ditanganiIds.has(s.id) ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Sudah ditangani
                  </span>
                ) : null}
              </div>
              <div className="bg-sr-50 rounded-lg p-4 mb-4">
                <div className="text-xs text-sr-400 mb-1">Pergerakan {s.stagnan} minggu terakhir:</div>
                <div className="flex gap-1">
                  {Array.from({ length: s.stagnan }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded bg-orange-400 flex items-center justify-center text-white text-xs font-bold">T{s.tanggaLit}</div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to={`/guru/rencana?siswa=${s.kode}`} className="flex items-center gap-2 px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900 transition-colors">
                  <Sparkles className="w-4 h-4" /> Lihat Rencana Pendampingan
                </Link>
                {!ditanganiIds.has(s.id) && (
                  <button onClick={() => tandaiDitangani(s.id, s.nama)} className="px-4 py-2 border border-sr-200 text-sr-700 rounded-lg text-sm font-medium hover:bg-sr-50 transition-colors">
                    Tandai Sudah Ditangani
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SidebarShell>
  )
}

export default KepsekPrioritas
