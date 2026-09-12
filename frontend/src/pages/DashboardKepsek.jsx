import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, BarChart3 } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import SidebarShell from '../components/SidebarShell'
import TanggaLegend from '../components/TanggaLegend'

const TANGGA_COLORS = ['badge-tangga-0', 'badge-tangga-1', 'badge-tangga-2', 'badge-tangga-3', 'badge-tangga-4', 'badge-tangga-5', 'badge-tangga-6']
const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata', 'Membaca Kalimat', 'Baca Paragraf', 'Memahami Bacaan']

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
    tanggaApi.getSekolah(SEKOLAH_ID).then(setDashboard).catch(() => setDashboard({ total_siswa: 0, sebaran_literasi: [], naik_minggu_ini: 0, stagnan_aktif: 0 }))
    tanggaApi.getStagnasi({ sekolah_id: SEKOLAH_ID }).then((list) =>
      setStagnanList(list.filter(s => s.jenis === 'LITERASI').sort((a, b) => b.pekan_stagnan - a.pekan_stagnan))
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

  const maxSebaran = Math.max(...dashboard.sebaran_literasi.map(d => d.jumlah), 1)

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
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sr-900">Sebaran Tangga Literasi</h2>
            <TanggaLegend jenis="LITERASI" />
          </div>
          <div className="space-y-2">
            {dashboard.sebaran_literasi.map((item) => {
              const barW = Math.max((item.jumlah / maxSebaran) * 100, 3)
              return (
                <div key={item.tangga} className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold text-white ${TANGGA_COLORS[item.tangga]}`}>
                    T{item.tangga}
                  </span>
                  <span className="w-28 text-xs text-sr-500 hidden xl:inline truncate">{TANGGA_LABELS[item.tangga]}</span>
                  <div className="flex-1 h-5 bg-sr-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${TANGGA_COLORS[item.tangga]}`} style={{ width: `${barW}%`, transition: 'width 0.6s' }} />
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-sr-700">{item.jumlah}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Kemajuan per Kelas (naik ≥1 tingkat)</h2>
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
              <div className="text-xs text-sr-500">T{s.tangga} · {s.pekan_stagnan} minggu</div>
            </div>
            <Link to={`/guru/rencana?siswa=${s.siswa_kode}`} className="text-sm text-sr-700 hover:text-sr-900 font-medium px-3 py-1.5 bg-white rounded-lg border border-sr-200 flex-shrink-0">
              Lihat Rencana
            </Link>
          </div>
        ))}
      </div>
    </SidebarShell>
  )
}

export default DashboardKepsek
