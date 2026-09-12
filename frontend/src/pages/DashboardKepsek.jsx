import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, BarChart3 } from 'lucide-react'
import { DEMO_SISWA_KELAS_A } from '../lib/demoData'
import SidebarShell from '../components/SidebarShell'
import TanggaLegend from '../components/TanggaLegend'

const TANGGA_COLORS = ['badge-tangga-0', 'badge-tangga-1', 'badge-tangga-2', 'badge-tangga-3', 'badge-tangga-4', 'badge-tangga-5', 'badge-tangga-6']
const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata', 'Membaca Kalimat', 'Baca Paragraf', 'Memahami Bacaan']

const NAV = [
  { to: '/kepsek', label: 'Dashboard', icon: BarChart3 },
  { to: '/kepsek/kelas', label: 'Per Kelas', icon: Building2 },
  { to: '/kepsek/prioritas', label: 'Prioritas', icon: AlertTriangle },
]

function DashboardKepsek() {
  const stats = useMemo(() => {
    const totalSiswa = DEMO_SISWA_KELAS_A.length
    const sudahAsesmen = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null).length
    const naikTingkat = DEMO_SISWA_KELAS_A.filter(s => s.naik > 0).length
    const stagnan = DEMO_SISWA_KELAS_A.filter(s => s.stagnan > 0).length
    return { totalSiswa, sudahAsesmen, naikTingkat, stagnan }
  }, [])

  const sebaran = useMemo(() => {
    const data = []
    for (let i = 0; i <= 6; i++) {
      data.push({ t: i, count: DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit === i).length })
    }
    return data
  }, [])

  const maxSebaran = Math.max(...sebaran.map(d => d.count), 1)
  const stagnanList = useMemo(() => DEMO_SISWA_KELAS_A.filter(s => s.stagnan >= 3), [])

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Dashboard — Sekolah Rakyat Harapan Bangsa</h1>
          <p className="text-sr-500 text-sm">TA 2026/2027 · Minggu ke-3 · Bekasi, Jawa Barat</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-sr-900">{stats.totalSiswa}</div>
          <div className="text-sm text-sr-500 mt-1">Total Siswa</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-green-600">{stats.naikTingkat}</div>
          <div className="text-sm text-sr-500 mt-1">Naik 1+ Tingkat</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-orange-500">{stats.stagnan}</div>
          <div className="text-sm text-sr-500 mt-1">Stagnasi Aktif</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-sr-700">3</div>
          <div className="text-sm text-sr-500 mt-1">Kelas Aktif</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Sebaran Literasi */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sr-900">Sebaran Tangga Literasi</h2>
            <TanggaLegend jenis="LITERASI" />
          </div>
          <div className="space-y-2">
            {sebaran.map((item) => {
              const barW = Math.max((item.count / maxSebaran) * 100, 3)
              return (
                <div key={item.t} className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold text-white ${TANGGA_COLORS[item.t]}`}>
                    T{item.t}
                  </span>
                  <span className="w-28 text-xs text-sr-500 hidden xl:inline truncate">{TANGGA_LABELS[item.t]}</span>
                  <div className="flex-1 h-5 bg-sr-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${TANGGA_COLORS[item.t]}`} style={{ width: `${barW}%`, transition: 'width 0.6s' }} />
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-sr-700">{item.count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Kemajuan Per Kelas */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Kemajuan (Minggu 1→3)</h2>
          {[
            { nama: 'Kelas A (SMA)', pct: 65, count: 18, total: 30 },
            { nama: 'Kelas B (SMP)', pct: 73, count: 22, total: 30 },
            { nama: 'Kelas C (SD)', pct: 83, count: 25, total: 30 },
          ].map((k) => (
            <div key={k.nama} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-sr-700">{k.nama}</span>
                <span className="text-sm text-green-600 font-medium">{k.pct}% naik</span>
              </div>
              <div className="h-4 bg-sr-100 rounded overflow-hidden">
                <div className="h-full bg-green-500 rounded" style={{ width: `${k.pct}%`, transition: 'width 0.8s' }} />
              </div>
              <div className="text-xs text-sr-400 mt-1">{k.count}/{k.total} siswa naik ≥1 tingkat</div>
            </div>
          ))}
        </div>
      </div>

      {/* Siswa Perlu Perhatian */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Siswa Perlu Perhatian ({stagnanList.length} siswa)
        </h2>
        {stagnanList.map((s) => (
          <div key={s.id} className="flex justify-between items-center gap-3 p-3 bg-orange-50 rounded-lg mb-2">
            <div className="min-w-0">
              <div className="font-medium text-sr-900 text-sm truncate">{s.kode} · {s.nama}</div>
              <div className="text-xs text-sr-500">T{s.tanggaLit} · {s.stagnan} minggu · Kelas A (SMA)</div>
            </div>
            <Link to={`/guru/rencana?siswa=${s.kode}`} className="text-sm text-sr-700 hover:text-sr-900 font-medium px-3 py-1.5 bg-white rounded-lg border border-sr-200 flex-shrink-0">
              Lihat Rencana
            </Link>
          </div>
        ))}
      </div>
    </SidebarShell>
  )
}

export default DashboardKepsek
