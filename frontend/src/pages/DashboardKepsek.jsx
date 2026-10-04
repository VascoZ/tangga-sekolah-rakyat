import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, BarChart3 } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import SidebarShell from '../components/SidebarShell'
import TanggaLegend from '../components/TanggaLegend'
import SebaranTable from '../components/SebaranTable'

const NAV = [
  { to: '/kepsek', label: 'Dashboard', icon: BarChart3 },
  { to: '/kepsek/kelas', label: 'Per Kelas', icon: Building2 },
  { to: '/kepsek/prioritas', label: 'Prioritas', icon: AlertTriangle },
]

const SEKOLAH_ID = 1
const KELAS_IDS = [1, 2, 3]
const KELAS_NAMA = { 1: 'Kelas A (SMA)', 2: 'Kelas B (SMP)', 3: 'Kelas C (SD)' }

function DashboardKepsek() {
  const [dashboard, setDashboard] = useState(null)
  const [stagnanList, setStagnanList] = useState([])
  const [kemajuanKelas, setKemajuanKelas] = useState(null)

  useEffect(() => {
    tanggaApi.getSekolah(SEKOLAH_ID).then(setDashboard).catch(() => setDashboard({ total_siswa: 0, sebaran_literasi: [], sebaran_numerasi: [], naik_minggu_ini: 0, stagnan_aktif: 0 }))
    tanggaApi.getStagnasi({ sekolah_id: SEKOLAH_ID }).then((list) =>
      setStagnanList([...list].sort((a, b) => b.pekan_stagnan - a.pekan_stagnan))
    ).catch(() => {})

    Promise.all(KELAS_IDS.map((id) =>
      tanggaApi.getRosterKelas(id).then((data) => data.map(toRosterView)).catch(() => [])
    )).then((rosters) => {
      setKemajuanKelas(KELAS_IDS.map((id, i) => {
        const roster = rosters[i]
        const naik = roster.filter(s => s.naik > 0).length
        return { nama: KELAS_NAMA[id], pct: roster.length ? Math.round((naik / roster.length) * 100) : 0, count: naik, total: roster.length }
      }))
    })
  }, [])

  if (!dashboard) {
    return (
      <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah">
        <div className="text-center py-16 text-sr-400">Memuat dashboard...</div>
      </SidebarShell>
    )
  }

  const toCounts = (list = []) => list.map((item) => item.jumlah)

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Dashboard — Sekolah Rakyat Harapan Bangsa</h1>
          <p className="text-sr-500 text-sm">TA 2026/2027 · Bekasi, Jawa Barat</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-sr-900">{dashboard.total_siswa}</div>
          <div className="text-sm text-sr-500 mt-1">Total Siswa</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-green-600">{dashboard.naik_minggu_ini}</div>
          <div className="text-sm text-sr-500 mt-1">Naik 1+ Tingkat</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-orange-500">{dashboard.stagnan_aktif}</div>
          <div className="text-sm text-sr-500 mt-1">Stagnasi Aktif</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="text-3xl md:text-4xl font-bold text-sr-700">{KELAS_IDS.length}</div>
          <div className="text-sm text-sr-500 mt-1">Kelas Aktif</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {[
          { jenis: 'LITERASI', list: dashboard.sebaran_literasi },
          { jenis: 'NUMERASI', list: dashboard.sebaran_numerasi },
        ].map(({ jenis, list }) => (
          <div key={jenis} className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-display font-semibold text-sr-900">Sebaran Tangga {jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'}</h2>
              <TanggaLegend jenis={jenis} />
            </div>
            <SebaranTable jenis={jenis} counts={toCounts(list)} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Kemajuan per Kelas (naik ≥1 tingkat literasi)</h2>
          {kemajuanKelas === null ? (
            <div className="text-sr-400 text-sm">Memuat...</div>
          ) : kemajuanKelas.map((k) => (
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

        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Siswa Perlu Perhatian ({stagnanList.length} siswa)
          </h2>
          {stagnanList.length === 0 && <p className="text-sm text-sr-400">Tidak ada siswa stagnan saat ini. 🎉</p>}
          {stagnanList.map((s) => (
            <div key={`${s.siswa_id}-${s.jenis}`} className="flex justify-between items-center gap-3 p-3 bg-orange-50 rounded-lg mb-2">
              <div className="min-w-0">
                <div className="font-medium text-sr-900 text-sm truncate">{s.siswa_kode} · {s.siswa_nama}</div>
                <div className="text-xs text-sr-500">{s.jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'} T{s.tangga} · {s.pekan_stagnan} minggu</div>
              </div>
              <Link to={`/guru/rencana?siswa=${s.siswa_kode}`} className="text-sm text-sr-700 hover:text-sr-900 font-medium px-3 py-1.5 bg-white rounded-lg border border-sr-200 flex-shrink-0">
                Lihat Rencana
              </Link>
            </div>
          ))}
        </div>
      </div>
    </SidebarShell>
  )
}

export default DashboardKepsek
