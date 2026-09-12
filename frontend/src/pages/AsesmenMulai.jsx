import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsesmenStore } from '../lib/store'
import { DEMO_SISWA_KELAS_A } from '../lib/demoData'
import { Search } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import EmptyState from '../components/EmptyState'

const TANGGA_LABELS = {
  LITERASI: ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf', 'Memahami Bacaan'],
  NUMERASI: ['Belum Mengenal Bilangan', 'Mengenal Bilangan 1-9', 'Bilangan 10-99', 'Penjumlahan & Pengurangan', 'Perkalian & Pembagian', 'Soal Cerita Sederhana'],
}

function AsesmenMulai() {
  const navigate = useNavigate()
  const { mulaiAsesmen, loading } = useAsesmenStore()
  const [search, setSearch] = useState('')
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [jenis, setJenis] = useState('LITERASI')

  const filteredSiswa = DEMO_SISWA_KELAS_A.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.kode.toLowerCase().includes(search.toLowerCase())
  )

  const handleStart = () => {
    if (!selectedSiswa) return
    navigate('/guru/asesmen/sesi', { state: { siswa: selectedSiswa, jenis } })
  }

  return (
    <GuruShell title="Asesmen Lisan — Pilih Siswa" backTo="/guru">
      <>
        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sr-400" />
            <input
              type="text"
              placeholder="Cari nama atau kode siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none"
            />
          </div>
        </div>

        {/* Siswa List */}
        {filteredSiswa.length === 0 ? (
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
                    {TANGGA_LABELS[selectedSiswa.tanggaLit ?? 0]}
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
                    {selectedSiswa.tanggaNum !== null ? `Tingkat ${selectedSiswa.tanggaNum}` : 'Belum asesmen'}
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