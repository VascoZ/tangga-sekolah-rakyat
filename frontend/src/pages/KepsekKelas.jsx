import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Building2, BarChart3, Search } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import SidebarShell from '../components/SidebarShell'
import TanggaFilterBar, { matchesTanggaFilter, matchesSearch } from '../components/TanggaFilterBar'
import EmptyState from '../components/EmptyState'
import SebaranTable from '../components/SebaranTable'
import TanggaLegend from '../components/TanggaLegend'
import { TANGGA_BADGE_CLASS } from '../lib/tangga'

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
    const hitung = (key, n) => Array.from({ length: n }, (_, i) => (roster || []).filter(s => s[key] === i).length)
    return { LITERASI: hitung('tanggaLit', 7), NUMERASI: hitung('tanggaNum', 6) }
  }, [roster])

  const info = useMemo(() => {
    const r = roster || []
    return {
      total: r.length,
      sudahLit: r.filter(s => s.tanggaLit !== null).length,
      sudahNum: r.filter(s => s.tanggaNum !== null).length,
      naikLit: r.filter(s => s.naik > 0).length,
      naikNum: r.filter(s => s.naikNum > 0).length,
      stagnanLit: r.filter(s => s.stagnan > 0).length,
      stagnanNum: r.filter(s => s.stagnanNum > 0).length,
    }
  }, [roster])

  const infoRows = [
    { label: 'Total Siswa', lit: info.total, num: info.total },
    { label: 'Sudah Asesmen', lit: info.sudahLit, num: info.sudahNum },
    { label: 'Naik Minggu Ini', lit: info.naikLit, num: info.naikNum, cls: 'text-green-600', prefix: '▲ ' },
    { label: 'Stagnasi Aktif', lit: info.stagnanLit, num: info.stagnanNum, cls: 'text-orange-500' },
  ]

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah" backTo="/kepsek">
      <h1 className="font-display text-2xl font-bold text-sr-900 mb-2">Detail Per Kelas</h1>
      <p className="text-sr-500 text-sm mb-8">Sekolah Rakyat Harapan Bangsa · 3 Kelas · 90 Siswa</p>

      {roster === null ? (
        <div className="text-center py-16 text-sr-400">Memuat...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-card mb-8 overflow-hidden">
          <div className="bg-sr-700 text-white p-6">
            <h2 className="font-display text-xl font-semibold">Kelas A — SMA</h2>
            <p className="text-sm opacity-80">Wali Kelas: Bu Santi · {roster.length} Siswa</p>
          </div>
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {['LITERASI', 'NUMERASI'].map((jenis) => (
                <div key={jenis}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-medium text-sr-900">📊 Sebaran Tangga {jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'}</h3>
                    <TanggaLegend jenis={jenis} />
                  </div>
                  <SebaranTable jenis={jenis} counts={sebaran[jenis]} />
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-sr-900 mb-3">📈 Info Kelas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sr-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sr-600">Ringkasan</th>
                      <th className="px-3 py-2 text-right text-sr-600">Literasi</th>
                      <th className="px-3 py-2 text-right text-sr-600">Numerasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {infoRows.map((row) => (
                      <tr key={row.label}>
                        <td className="px-3 py-2 text-sr-500">{row.label}</td>
                        <td className={`px-3 py-2 text-right font-medium ${row.cls || ''}`}>{row.prefix || ''}{row.lit}</td>
                        <td className={`px-3 py-2 text-right font-medium ${row.cls || ''}`}>{row.prefix || ''}{row.num}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th rowSpan={2} className="px-3 py-2 text-left text-sr-600 align-bottom">Kode</th>
                      <th rowSpan={2} className="px-3 py-2 text-left text-sr-600 align-bottom">Nama</th>
                      <th colSpan={3} className="px-3 py-2 text-center text-sr-900 border-l border-gray-200">📖 Literasi</th>
                      <th colSpan={3} className="px-3 py-2 text-center text-sr-900 border-l border-gray-200">🔢 Numerasi</th>
                      <th rowSpan={2} className="px-3 py-2 text-center text-sr-600 align-bottom border-l border-gray-200">Rencana</th>
                    </tr>
                    <tr>
                      <th className="px-3 py-2 text-center text-sr-600 border-l border-gray-200">Tingkat</th>
                      <th className="px-3 py-2 text-center text-sr-600">Stagnan</th>
                      <th className="px-3 py-2 text-center text-sr-600">Naik</th>
                      <th className="px-3 py-2 text-center text-sr-600 border-l border-gray-200">Tingkat</th>
                      <th className="px-3 py-2 text-center text-sr-600">Stagnan</th>
                      <th className="px-3 py-2 text-center text-sr-600">Naik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRoster.map((s) => (
                      <tr key={s.id} className="hover:bg-sr-50">
                        <td className="px-3 py-2 text-sr-500 font-mono text-xs">{s.kode.replace('SR-001-', '')}</td>
                        <td className="px-3 py-2 font-medium text-sr-900">{s.nama}</td>
                        <td className="px-3 py-2 text-center border-l border-gray-100">
                          {s.tanggaLit !== null ? (
                            <span className={`inline-block w-7 h-5 rounded text-xs text-white ${TANGGA_BADGE_CLASS[s.tanggaLit]}`}>T{s.tanggaLit}</span>
                          ) : <span className="text-sr-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {s.stagnan > 0 ? <span className="text-orange-600 font-medium">{s.stagnan}</span> : <span className="text-sr-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {s.naik > 0 ? <span className="text-green-600">▲{s.naik}</span> : <span className="text-sr-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center border-l border-gray-100">
                          {s.tanggaNum !== null ? (
                            <span className={`inline-block w-7 h-5 rounded text-xs text-white ${TANGGA_BADGE_CLASS[s.tanggaNum]}`}>T{s.tanggaNum}</span>
                          ) : <span className="text-sr-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {s.stagnanNum > 0 ? <span className="text-orange-600 font-medium">{s.stagnanNum}</span> : <span className="text-sr-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {s.naikNum > 0 ? <span className="text-green-600">▲{s.naikNum}</span> : <span className="text-sr-300">—</span>}
                        </td>
                        <td className="px-3 py-2 text-center border-l border-gray-100">
                          <Link to={`/guru/rencana?siswa=${s.kode}`} className="text-xs text-sr-700 hover:text-sr-900 underline">
                            {s.stagnan > 0 || s.stagnanNum > 0 ? 'Buat' : 'Lihat'}
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
