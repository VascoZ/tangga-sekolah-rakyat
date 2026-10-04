import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, AlertTriangle, Plus, X } from 'lucide-react'
import { tanggaApi, siswaApi } from '../lib/api'
import { useAuthStore } from '../lib/auth'
import { toRosterView } from '../lib/roster'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import EmptyState from '../components/EmptyState'
import TanggaFilterBar, { matchesTanggaFilter, matchesSearch } from '../components/TanggaFilterBar'
import { useToast } from '../components/ToastProvider'
import { TANGGA_BADGE_CLASS } from '../lib/tangga'

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

function LevelBadge({ tingkat, stagnan, naik }) {
  if (tingkat === null) return <span className="text-sr-400 text-sm">Belum</span>
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${TANGGA_BADGE_CLASS[tingkat]}`}>T{tingkat}</span>
      {naik > 0 && <span className="text-green-600 text-xs">▲{naik}</span>}
      {stagnan > 0 && <span className="text-orange-600 text-xs flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />{stagnan}mg</span>}
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
    return roster.filter((s) => matchesSearch(s, search) && matchesTanggaFilter(s, filter))
  }, [roster, search, filter])

  const sudahAsesmen = roster ? roster.filter(s => s.tanggaLit !== null).length : 0
  const sudahAsesmenNum = roster ? roster.filter(s => s.tanggaNum !== null).length : 0
  const stagnanCount = roster ? roster.filter(s => s.stagnan > 0 || s.stagnanNum > 0).length : 0

  return (
    <GuruShell
      title="Daftar Siswa — Kelas A (SMA)"
      subtitle={roster ? `${roster.length} siswa · Literasi: ${sudahAsesmen} sudah asesmen · Numerasi: ${sudahAsesmenNum} sudah asesmen` : 'Memuat...'}
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
      <TanggaFilterBar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} />
      <div className="mb-6 mt-2 flex flex-wrap gap-4">
        <TanggaLegend jenis="LITERASI" />
        <TanggaLegend jenis="NUMERASI" />
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
          {/* Desktop table: literasi & numerasi dalam kolom terpisah */}
          <div className="hidden md:block bg-white rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-sr-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-900 border-l border-gray-200">📖 Literasi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-900 border-l border-gray-200">🔢 Numerasi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-sr-600 border-l border-gray-200">Asesmen Terakhir</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-sr-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sr-900">{siswa.nama}</div>
                      <div className="text-xs text-sr-400">{siswa.kode}</div>
                    </td>
                    <td className="px-4 py-3 border-l border-gray-100">
                      <LevelBadge tingkat={siswa.tanggaLit} stagnan={siswa.stagnan} naik={siswa.naik} />
                    </td>
                    <td className="px-4 py-3 border-l border-gray-100">
                      <LevelBadge tingkat={siswa.tanggaNum} stagnan={siswa.stagnanNum} naik={siswa.naikNum} />
                    </td>
                    <td className="px-4 py-3 text-sm text-sr-500 border-l border-gray-100">
                      <div>Lit: {siswa.terakhir ? `${siswa.terakhir} lalu` : 'Belum'}</div>
                      <div>Num: {siswa.terakhirNum ? `${siswa.terakhirNum} lalu` : 'Belum'}</div>
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
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sr-900 truncate">{siswa.nama}</div>
                    <div className="text-xs text-sr-400">{siswa.kode}</div>
                  </div>
                  <Link to={`/guru/rencana?siswa=${siswa.kode}`} className="text-xs text-sr-700 hover:text-sr-900 font-medium flex-shrink-0">
                    Rencana →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-sr-50 rounded-lg p-2">
                    <div className="text-sr-500 mb-1">📖 Literasi</div>
                    <LevelBadge tingkat={siswa.tanggaLit} stagnan={siswa.stagnan} naik={siswa.naik} />
                    <div className="text-sr-400 mt-1">{siswa.terakhir ? `${siswa.terakhir} lalu` : 'Belum asesmen'}</div>
                  </div>
                  <div className="bg-sr-50 rounded-lg p-2">
                    <div className="text-sr-500 mb-1">🔢 Numerasi</div>
                    <LevelBadge tingkat={siswa.tanggaNum} stagnan={siswa.stagnanNum} naik={siswa.naikNum} />
                    <div className="text-sr-400 mt-1">{siswa.terakhirNum ? `${siswa.terakhirNum} lalu` : 'Belum asesmen'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {roster !== null && stagnanCount > 0 && (
        <div className="mt-4 text-center text-sm text-sr-500">
          ⚠ {stagnanCount} siswa stagnan di salah satu tangga
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
