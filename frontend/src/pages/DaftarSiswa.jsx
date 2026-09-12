import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, AlertTriangle } from 'lucide-react'
import { DEMO_SISWA_KELAS_A } from '../lib/demoData'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import EmptyState from '../components/EmptyState'

const TANGGA_COLORS = ['badge-tangga-0', 'badge-tangga-1', 'badge-tangga-2', 'badge-tangga-3', 'badge-tangga-4', 'badge-tangga-5', 'badge-tangga-6']

const FILTERS = [
  { value: 'semua', label: 'Semua Tangga' },
  { value: 'awal', label: 'T0-2 (Awal)' },
  { value: 'tengah', label: 'T3-4 (Tengah)' },
  { value: 'lanjut', label: 'T5-6 (Lanjut)' },
  { value: 'belum', label: 'Belum Asesmen' },
  { value: 'stagnan', label: 'Stagnasi' },
]

function matchesFilter(siswa, filter) {
  switch (filter) {
    case 'awal': return siswa.tanggaLit !== null && siswa.tanggaLit <= 2
    case 'tengah': return siswa.tanggaLit !== null && siswa.tanggaLit >= 3 && siswa.tanggaLit <= 4
    case 'lanjut': return siswa.tanggaLit !== null && siswa.tanggaLit >= 5
    case 'belum': return siswa.tanggaLit === null
    case 'stagnan': return siswa.stagnan > 0
    default: return true
  }
}

function DaftarSiswa() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('cari') || '')
  const [filter, setFilter] = useState('semua')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return DEMO_SISWA_KELAS_A.filter((s) => {
      const matchesSearch = !q || s.nama.toLowerCase().includes(q) || s.kode.toLowerCase().includes(q)
      return matchesSearch && matchesFilter(s, filter)
    })
  }, [search, filter])

  const sudahAsesmen = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null).length
  const stagnanCount = DEMO_SISWA_KELAS_A.filter(s => s.stagnan > 0).length

  return (
    <GuruShell
      title="Daftar Siswa — Kelas A (SMA)"
      subtitle={`${DEMO_SISWA_KELAS_A.length} siswa · ${sudahAsesmen} sudah asesmen · ${DEMO_SISWA_KELAS_A.length - sudahAsesmen} belum`}
    >
      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sr-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau kode..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-sr-500 outline-none"
          >
            {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="mt-3">
          <TanggaLegend jenis="LITERASI" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Tidak ada siswa yang cocok"
          description="Coba ubah kata kunci pencarian atau filter tangga."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-sr-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Tangga</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Num</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Asesmen</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Δ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-sr-50">
                    <td className="px-4 py-3">
                      {siswa.tanggaLit !== null ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${TANGGA_COLORS[siswa.tanggaLit]}`}>
                          T{siswa.tanggaLit}
                        </span>
                      ) : (
                        <span className="text-sr-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sr-900">{siswa.nama}</div>
                      <div className="text-xs text-sr-400">{siswa.kode}</div>
                      {siswa.stagnan > 0 && (
                        <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {siswa.stagnan}mg stagnan
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {siswa.tanggaNum !== null ? (
                        <span className="text-sm text-sr-600">T{siswa.tanggaNum}</span>
                      ) : (
                        <span className="text-sr-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-sr-500">
                      {siswa.terakhir || 'Belum'}
                    </td>
                    <td className="px-4 py-3">
                      {siswa.naik > 0 && <span className="text-green-600 text-sm">▲{siswa.naik}</span>}
                      {siswa.stagnan > 0 && <span className="text-orange-600 text-sm">⚠{siswa.stagnan}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/guru/rencana?siswa=${siswa.kode}`} className="text-xs text-sr-700 hover:text-sr-900 font-medium">
                        Rencana →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((siswa) => (
              <div key={siswa.id} className="bg-white rounded-xl shadow-card p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sr-900 truncate">{siswa.nama}</div>
                    <div className="text-xs text-sr-400">{siswa.kode}</div>
                  </div>
                  {siswa.tanggaLit !== null ? (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white flex-shrink-0 ${TANGGA_COLORS[siswa.tanggaLit]}`}>
                      T{siswa.tanggaLit}
                    </span>
                  ) : (
                    <span className="text-sr-400 text-xs flex-shrink-0">Belum asesmen</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-sr-500">
                  <span>Num: {siswa.tanggaNum !== null ? `T${siswa.tanggaNum}` : '—'}</span>
                  <span>{siswa.terakhir ? `Asesmen ${siswa.terakhir} lalu` : 'Belum asesmen'}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    {siswa.naik > 0 && <span className="text-green-600 font-medium">▲ Naik {siswa.naik}</span>}
                    {siswa.stagnan > 0 && (
                      <span className="text-orange-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {siswa.stagnan}mg stagnan
                      </span>
                    )}
                  </div>
                  <Link to={`/guru/rencana?siswa=${siswa.kode}`} className="text-xs text-sr-700 hover:text-sr-900 font-medium">
                    Rencana →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {stagnanCount > 0 && (
        <div className="mt-4 text-center text-sm text-sr-500">
          ⚠ {DEMO_SISWA_KELAS_A.length - sudahAsesmen} siswa belum asesmen · {stagnanCount} siswa stagnan
        </div>
      )}

      {/* Action */}
      <div className="mt-6">
        <Link
          to="/guru/asesmen"
          className="block w-full bg-sr-700 text-white py-3 rounded-lg font-medium text-center hover:bg-sr-900 transition-colors"
        >
          Mulai Asesmen Massal ({DEMO_SISWA_KELAS_A.length - sudahAsesmen} Siswa)
        </Link>
      </div>
    </GuruShell>
  )
}

export default DaftarSiswa
