import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, AlertTriangle, Plus, X } from 'lucide-react'
import { tanggaApi, siswaApi } from '../lib/api'
import { useAuthStore } from '../lib/auth'
import { toRosterView } from '../lib/roster'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/ToastProvider'

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

function TambahSiswaModal({ kelasId, jenjang, onClose, onCreated }) {
  const toast = useToast()
  const [nama, setNama] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nama.trim() || saving) return
    setSaving(true)
    try {
      const created = await siswaApi.create(nama.trim(), kelasId, jenjang)
      toast.success(`${created.nama} ditambahkan sebagai ${created.kode}.`)
      onCreated()
      onClose()
    } catch (err) {
      toast.error(`Gagal menambah siswa: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-modal p-6 w-full max-w-sm animate-slideUp"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-sr-900">Tambah Siswa</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-sr-400 hover:text-sr-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="block text-sm font-medium text-sr-700 mb-2">Nama Siswa</label>
        <input
          autoFocus
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="cth. Fitri Handayani"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none mb-2"
        />
        <p className="text-xs text-sr-400 mb-4">
          Kode siswa (SR-...) dan posisi tangga dibuat otomatis — siswa dimulai dari "Belum Asesmen".
        </p>
        <button
          type="submit"
          disabled={saving || !nama.trim()}
          className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  )
}

function DaftarSiswa() {
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1
  const jenjang = user?.kelas?.jenjang || 'SMA'
  const toast = useToast()

  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('cari') || '')
  const [filter, setFilter] = useState('semua')
  const [roster, setRoster] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [showTambah, setShowTambah] = useState(false)

  const loadRoster = () => {
    setLoadError(null)
    tanggaApi.getRosterKelas(kelasId)
      .then((data) => setRoster(data.map(toRosterView)))
      .catch((err) => setLoadError(err.message))
  }

  useEffect(loadRoster, [kelasId])

  const filtered = useMemo(() => {
    if (!roster) return []
    const q = search.trim().toLowerCase()
    return roster.filter((s) => {
      const matchesSearch = !q || s.nama.toLowerCase().includes(q) || s.kode.toLowerCase().includes(q)
      return matchesSearch && matchesFilter(s, filter)
    })
  }, [roster, search, filter])

  const sudahAsesmen = roster ? roster.filter(s => s.tanggaLit !== null).length : 0
  const stagnanCount = roster ? roster.filter(s => s.stagnan > 0).length : 0

  return (
    <GuruShell
      title="Daftar Siswa — Kelas A (SMA)"
      subtitle={roster ? `${roster.length} siswa · ${sudahAsesmen} sudah asesmen · ${roster.length - sudahAsesmen} belum` : 'Memuat...'}
      right={
        <button
          onClick={() => setShowTambah(true)}
          className="flex items-center gap-1.5 bg-sr-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-sr-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah Siswa</span>
        </button>
      }
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

      {loadError && (
        <EmptyState
          icon={AlertTriangle}
          title="Gagal memuat daftar siswa"
          description={loadError}
          action={<button onClick={loadRoster} className="text-sr-700 font-medium hover:text-sr-900">Coba lagi</button>}
        />
      )}

      {!loadError && roster === null && (
        <div className="text-center py-16 text-sr-400">Memuat daftar siswa...</div>
      )}

      {!loadError && roster !== null && filtered.length === 0 && (
        <EmptyState
          icon={Search}
          title="Tidak ada siswa yang cocok"
          description="Coba ubah kata kunci pencarian atau filter tangga."
        />
      )}

      {!loadError && roster !== null && filtered.length > 0 && (
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

      {roster !== null && stagnanCount > 0 && (
        <div className="mt-4 text-center text-sm text-sr-500">
          ⚠ {roster.length - sudahAsesmen} siswa belum asesmen · {stagnanCount} siswa stagnan
        </div>
      )}

      {/* Action */}
      <div className="mt-6">
        <Link
          to="/guru/asesmen"
          className="block w-full bg-sr-700 text-white py-3 rounded-lg font-medium text-center hover:bg-sr-900 transition-colors"
        >
          Mulai Asesmen
        </Link>
      </div>

      {showTambah && (
        <TambahSiswaModal
          kelasId={kelasId}
          jenjang={jenjang}
          onClose={() => setShowTambah(false)}
          onCreated={loadRoster}
        />
      )}
    </GuruShell>
  )
}

export default DaftarSiswa
