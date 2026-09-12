import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, BarChart3, Search } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import SidebarShell from '../components/SidebarShell'
import TanggaFilterBar, { matchesTanggaFilter, matchesSearch } from '../components/TanggaFilterBar'
import EmptyState from '../components/EmptyState'

const TANGGA_COLORS = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']

const NAV = [
  { to: '/kepsek', label: 'Dashboard', icon: BarChart3 },
  { to: '/kepsek/kelas', label: 'Per Kelas', icon: Building2 },
  { to: '/kepsek/prioritas', label: 'Prioritas', icon: AlertTriangle },
]

const KELAS_ID = 1

function KepsekKelas() {
  const [roster, setRoster] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')

  useEffect(() => {
    tanggaApi.getRosterKelas(KELAS_ID).then((data) => setRoster(data.map(toRosterView))).catch(() => setRoster([]))
  }, [])

  const filteredRoster = useMemo(
    () => (roster || []).filter((s) => matchesSearch(s, search) && matchesTanggaFilter(s, filter)),
    [roster, search, filter]
  )

  const sebaran = useMemo(() => {
    if (!roster) return []
    const data = []
    for (let i = 0; i <= 6; i++) data.push({ t: i, count: roster.filter(s => s.tanggaLit === i).length })
    return data
  }, [roster])

  const maxSebaran = Math.max(...sebaran.map(d => d.count), 1)
  const naikCount = roster ? roster.filter(s => s.naik > 0).length : 0
  const stagnanCount = roster ? roster.filter(s => s.stagnan > 0).length : 0
  const sudahAsesmen = roster ? roster.filter(s => s.tanggaLit !== null).length : 0

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah" backTo="/kepsek">
      <h1 className="font-display text-2xl font-bold text-sr-900 mb-2">Detail Per Kelas</h1>
      <p className="text-sr-500 text-sm mb-8">Sekolah Rakyat Harapan Bangsa · 3 Kelas · 90 Siswa</p>

      {roster === null ? (
        <div className="text-center py-16 text-sr-400">Memuat...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-card mb-8 overflow-hidden">
          <div className="bg-sr-700 text-white p-6 flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="font-display text-xl font-semibold">Kelas A — SMA</h2>
              <p className="text-sm opacity-80">Wali Kelas: Bu Santi · {roster.length} Siswa</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{naikCount}/{roster.length}</div>
              <div className="text-xs opacity-80">naik ≥1 tingkat</div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-sr-900 mb-3">📊 Sebaran Tangga Literasi</h3>
                {sebaran.map((item) => {
                  const barW = Math.max((item.count / maxSebaran) * 100, 3)
                  return (
                    <div key={item.t} className="flex items-center gap-2 mb-1.5 text-sm">
                      <span className={`inline-flex items-center justify-center w-7 h-5 rounded text-xs font-bold text-white ${TANGGA_COLORS[item.t]}`}>T{item.t}</span>
                      <div className="flex-1 h-4 bg-sr-100 rounded overflow-hidden">
                        <div className={`h-full rounded ${TANGGA_COLORS[item.t]}`} style={{ width: `${barW}%`, transition: 'width 0.5s' }} />
                      </div>
                      <span className="w-5 text-right font-medium">{item.count}</span>
                    </div>
                  )
                })}
              </div>
              <div>
                <h3 className="font-medium text-sr-900 mb-3">📈 Info Kelas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sr-500">Total Siswa</span>
                    <span className="font-medium">{roster.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sr-500">Sudah Asesmen</span>
                    <span className="font-medium">{sudahAsesmen}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sr-500">Naik Minggu Ini</span>
                    <span className="font-medium text-green-600">▲ {naikCount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sr-500">Stagnasi Aktif</span>
                    <span className="font-medium text-orange-500">{stagnanCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-medium text-sr-900 mb-3">👥 Daftar Siswa</h3>
            <TanggaFilterBar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} className="mb-4 !shadow-none !p-0" />
            {filteredRoster.length === 0 ? (
              <EmptyState icon={Search} title="Tidak ada siswa yang cocok" description="Coba ubah kata kunci atau filter tangga." />
            ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead className="bg-sr-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sr-600">Kode</th>
                    <th className="px-3 py-2 text-left text-sr-600">Nama</th>
                    <th className="px-3 py-2 text-center text-sr-600">Lit</th>
                    <th className="px-3 py-2 text-center text-sr-600">Num</th>
                    <th className="px-3 py-2 text-center text-sr-600">Mg Stagnan</th>
                    <th className="px-3 py-2 text-center text-sr-600">Naik</th>
                    <th className="px-3 py-2 text-center text-sr-600">Rencana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoster.map((s) => (
                    <tr key={s.id} className="hover:bg-sr-50">
                      <td className="px-3 py-2 text-sr-500 font-mono text-xs">{s.kode.replace('SR-001-', '')}</td>
                      <td className="px-3 py-2 font-medium text-sr-900">{s.nama}</td>
                      <td className="px-3 py-2 text-center">
                        {s.tanggaLit !== null ? (
                          <span className={`inline-block w-7 h-5 rounded text-xs text-white ${TANGGA_COLORS[s.tanggaLit]}`}>T{s.tanggaLit}</span>
                        ) : <span className="text-sr-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center text-sr-500">{s.tanggaNum !== null ? `T${s.tanggaNum}` : '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {s.stagnan > 0 ? <span className="text-orange-600 font-medium">{s.stagnan}</span> : <span className="text-sr-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {s.naik > 0 ? <span className="text-green-600">▲{s.naik}</span> : '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Link to={`/guru/rencana?siswa=${s.kode}`} className="text-xs text-sr-700 hover:text-sr-900 underline">
                          {s.stagnan > 0 ? 'Buat' : 'Lihat'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      )}
    </SidebarShell>
  )
}

export default KepsekKelas
