import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsesmenStore } from '../lib/store'
import { tanggaApi } from '../lib/api'
import { useAuthStore } from '../lib/auth'
import { toRosterView } from '../lib/roster'
import { Search } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import EmptyState from '../components/EmptyState'
import TanggaFilterBar, { matchesTanggaFilter, matchesSearch } from '../components/TanggaFilterBar'
import { useToast } from '../components/ToastProvider'

const TANGGA_LABELS = {
  LITERASI: ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf', 'Memahami Bacaan'],
  NUMERASI: ['Belum Mengenal Bilangan', 'Mengenal Bilangan 1-9', 'Bilangan 10-99 & Perbandingan', 'Penjumlahan & Pengurangan', 'Perkalian & Pembagian', 'Soal Cerita Sederhana'],
}

function AsesmenMulai() {
  const navigate = useNavigate()
  const { mulaiAsesmen, loading } = useAsesmenStore()
  const { user } = useAuthStore()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [jenis, setJenis] = useState('LITERASI')
  const [roster, setRoster] = useState(null)

  useEffect(() => {
    const kelasId = user?.kelas?.id || 1
    tanggaApi.getRosterKelas(kelasId)
      .then((data) => setRoster(data.map(toRosterView)))
      .catch((err) => toast.error(`Gagal memuat daftar siswa: ${err.message}`))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredSiswa = (roster || []).filter(s => matchesSearch(s, search) && matchesTanggaFilter(s, filter))

  const handleStart = async () => {
    if (!selectedSiswa || loading) return
    try {
      await mulaiAsesmen(selectedSiswa.id, jenis)
      navigate('/guru/asesmen/sesi', { state: { siswa: selectedSiswa, jenis } })
    } catch (err) {
      toast.error(`Gagal memulai asesmen: ${err.message}`)
    }
  }

  return (
    <GuruShell title="Asesmen Lisan — Pilih Siswa" backTo="/guru">
      <>
        {/* Search & Filter */}
        <TanggaFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          placeholder="Cari nama atau kode siswa..."
          className="mb-6"
        />

        {/* Siswa List */}
        {roster === null ? (
          <div className="text-center py-16 text-sr-400">Memuat daftar siswa...</div>
        ) : filteredSiswa.length === 0 ? (
          <EmptyState icon={Search} title="Siswa tidak ditemukan" description="Coba kata kunci lain." />
        ) : (
        <div className="bg-white rounded-xl shadow-card mb-6 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredSiswa.map((siswa) => (
              <button
                key={siswa.id}
                onClick={() => setSelectedSiswa(siswa)}
                className={`w-full p-4 text-left hover:bg-sr-50 transition-colors ${
                  selectedSiswa?.id === siswa.id ? 'bg-sr-50 border-l-4 border-sr-700' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sr-900">{siswa.nama}</div>
                    <div className="text-sm text-sr-500">{siswa.kode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        siswa.stagnan ? 'bg-orange-100 text-orange-700' : 'bg-sr-100 text-sr-700'
                      }`}>
                        {siswa.stagnan && '⚠ '}
                        T{siswa.tanggaLit ?? '?'} Lit
                      </span>
                    </div>
                    <div className="text-xs text-sr-400 mt-1">
                      {siswa.terakhir ? `${siswa.terakhir} lalu` : 'Belum asesmen'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Selected Siswa & Jenis */}
        {selectedSiswa && (
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-sr-900 mb-4">
              Terpilih: {selectedSiswa.nama} ({selectedSiswa.kode})
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-sr-700 mb-2">
                Pilih Jenis Asesmen
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setJenis('LITERASI')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    jenis === 'LITERASI'
                      ? 'border-sr-700 bg-sr-50'
                      : 'border-gray-200 hover:border-sr-300'
                  }`}
                >
                  <div className="font-medium text-sr-900">📖 Literasi</div>
                  <div className="text-sm text-sr-500 mt-1">
                    Posisi: Tangga {selectedSiswa.tanggaLit ?? '?'}
                  </div>
                  <div className="text-xs text-sr-400">
                    {TANGGA_LABELS.LITERASI[selectedSiswa.tanggaLit ?? 0]}
                  </div>
                </button>
                <button
                  onClick={() => setJenis('NUMERASI')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    jenis === 'NUMERASI'
                      ? 'border-sr-700 bg-sr-50'
                      : 'border-gray-200 hover:border-sr-300'
                  }`}
                >
                  <div className="font-medium text-sr-900">🔢 Numerasi</div>
                  <div className="text-sm text-sr-500 mt-1">
                    Posisi: Tangga {selectedSiswa.tanggaNum ?? '?'}
                  </div>
                  <div className="text-xs text-sr-400">
                    {selectedSiswa.tanggaNum !== null ? TANGGA_LABELS.NUMERASI[selectedSiswa.tanggaNum] : 'Belum asesmen'}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-sr-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-sr-600">
                ⓘ Asesmen akan dimulai dari tangga terakhir. Estimasi waktu: 5-8 menit.
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memulai...' : 'Mulai Asesmen'}
            </button>
          </div>
        )}
      </>
    </GuruShell>
  )
}

export default AsesmenMulai