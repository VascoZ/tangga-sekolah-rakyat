import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { tanggaApi, bahanApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import { ClipboardCheck, LayoutGrid, BookOpen, MessageCircle, AlertTriangle, BarChart3, Search } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import SebaranTable from '../components/SebaranTable'

function DashboardGuru() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1
  const [search, setSearch] = useState('')
  const [roster, setRoster] = useState(null)
  const [stagnasiList, setStagnasiList] = useState([])
  const [temaMingguIni, setTemaMingguIni] = useState(null)

  useEffect(() => {
    tanggaApi.getRosterKelas(kelasId).then((data) => setRoster(data.map(toRosterView))).catch(() => setRoster([]))
    tanggaApi.getStagnasi({ kelas_id: kelasId }).then(setStagnasiList).catch(() => {})
    bahanApi.temas(kelasId).then((temas) => setTemaMingguIni(temas[0] || null)).catch(() => {})
  }, [kelasId])

  const stats = useMemo(() => {
    if (!roster) return { totalSiswa: 0, sudahAsesmen: 0, sudahAsesmenNum: 0, naikMingguIni: 0, stagnasiAktif: 0 }
    return {
      totalSiswa: roster.length,
      sudahAsesmen: roster.filter(s => s.tanggaLit !== null).length,
      sudahAsesmenNum: roster.filter(s => s.tanggaNum !== null).length,
      naikMingguIni: roster.filter(s => s.naik > 0 || s.naikNum > 0).length,
      stagnasiAktif: new Set(stagnasiList.map(s => s.siswa_id)).size,
    }
  }, [roster, stagnasiList])

  const kelompok = useMemo(() => {
    if (!roster) return { awal: 0, tengah: 0, lanjut: 0 }
    return {
      awal: roster.filter(s => s.tanggaLit !== null && s.tanggaLit <= 2).length,
      tengah: roster.filter(s => s.tanggaLit !== null && s.tanggaLit >= 3 && s.tanggaLit <= 4).length,
      lanjut: roster.filter(s => s.tanggaLit !== null && s.tanggaLit >= 5).length,
    }
  }, [roster])

  const sebaran = useMemo(() => {
    const hitung = (key, n) => Array.from({ length: n }, (_, i) => (roster || []).filter(s => s[key] === i).length)
    return {
      LITERASI: {
        counts: hitung('tanggaLit', 7),
        belum: (roster || []).filter(s => s.tanggaLit === null).length,
      },
      NUMERASI: {
        counts: hitung('tanggaNum', 6),
        belum: (roster || []).filter(s => s.tanggaNum === null).length,
      },
    }
  }, [roster])

  const belumAsesmen = useMemo(() => (roster || []).filter(s => s.tanggaLit === null), [roster])
  const stagnanList = useMemo(
    () => [...stagnasiList].sort((a, b) => b.pekan_stagnan - a.pekan_stagnan),
    [stagnasiList]
  )

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/guru/siswa${search.trim() ? `?cari=${encodeURIComponent(search.trim())}` : ''}`)
  }

  if (roster === null) {
    return (
      <GuruShell greeting subtitle="Kelas A — SMA · Minggu ke-3">
        <div className="text-center py-16 text-sr-400">Memuat data kelas...</div>
      </GuruShell>
    )
  }

  return (
    <GuruShell greeting subtitle="Kelas A — SMA · Minggu ke-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="text-3xl font-bold text-sr-900">{stats.totalSiswa}</div>
          <div className="text-sr-500 text-sm">Total Siswa</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="text-3xl font-bold text-sr-900">{stats.sudahAsesmen}</div>
          <div className="text-sr-500 text-sm">Sudah Asesmen Literasi</div>
          <div className="text-xs text-sr-400 mt-1">Numerasi: {stats.sudahAsesmenNum}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="text-3xl font-bold text-green-600">{stats.naikMingguIni} ▲</div>
          <div className="text-sr-500 text-sm">Naik Minggu Ini</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="text-3xl font-bold text-orange-500">{stats.stagnasiAktif} ⚠</div>
          <div className="text-sr-500 text-sm">Stagnasi Aktif</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <h2 className="font-display text-lg font-semibold text-sr-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Asesmen Cepat
        </h2>
        <form onSubmit={handleSearch} className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sr-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode siswa, lalu tekan Enter..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none"
          />
        </form>
        {belumAsesmen.length > 0 && (
          <p className="text-sr-500 text-sm mb-4">
            {belumAsesmen.length} siswa belum asesmen literasi:{' '}
            {belumAsesmen.map(s => `${s.kode} ${s.nama}`).join(', ')}
          </p>
        )}
        <Link
          to="/guru/asesmen"
          className="inline-block bg-sr-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors"
        >
          Mulai Asesmen{belumAsesmen.length > 0 ? ` — ${belumAsesmen.length} Siswa` : ''}
        </Link>
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Kelompok */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Kelompok Aktif (Literasi)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-tangga-0 bg-opacity-10 rounded-lg">
              <div>
                <div className="font-medium text-sr-900">Awal (T0-2)</div>
                <div className="text-sm text-sr-500">Belum Baca Kata</div>
              </div>
              <div className="text-2xl font-bold text-sr-900">{kelompok.awal}</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-tangga-3 bg-opacity-10 rounded-lg">
              <div>
                <div className="font-medium text-sr-900">Tengah (T3-4)</div>
                <div className="text-sm text-sr-500">Baca Kata-Kalimat</div>
              </div>
              <div className="text-2xl font-bold text-sr-900">{kelompok.tengah}</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-tangga-6 bg-opacity-10 rounded-lg">
              <div>
                <div className="font-medium text-sr-900">Lanjut (T5-6)</div>
                <div className="text-sm text-sr-500">Baca Paragraf-Paham</div>
              </div>
              <div className="text-2xl font-bold text-sr-900">{kelompok.lanjut}</div>
            </div>
          </div>
          <Link
            to="/guru/kelompok"
            className="block mt-4 text-center text-sr-700 hover:text-sr-900 font-medium"
          >
            Lihat Kelompok →
          </Link>
        </div>

        {/* Bahan */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Bahan Minggu Ini
          </h2>
          <div className="mb-4">
            {temaMingguIni ? (
              <>
                <div className="text-lg font-medium text-sr-900">"{temaMingguIni}"</div>
                <div className="text-sr-500 text-sm">tersedia</div>
              </>
            ) : (
              <div className="text-sr-500 text-sm">Belum ada bahan ajar dibuat.</div>
            )}
          </div>
          <Link
            to="/guru/bahan"
            className="inline-block bg-sr-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors"
          >
            Lihat Bahan
          </Link>
        </div>
      </div>

      {/* Sebaran Tangga — literasi & numerasi dipisah */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {['LITERASI', 'NUMERASI'].map((jenis) => (
          <div key={jenis} className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h2 className="font-display text-lg font-semibold text-sr-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tangga {jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'} — Kelas A (SMA)
              </h2>
              <TanggaLegend jenis={jenis} />
            </div>
            <SebaranTable jenis={jenis} counts={sebaran[jenis].counts} belum={sebaran[jenis].belum} />
          </div>
        ))}
      </div>

      {/* Stagnasi Warning */}
      {stagnanList.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Perlu Perhatian ({stagnanList.length} siswa stagnan)
          </h2>
          <div className="space-y-2">
            {stagnanList.map((s) => (
              <div key={`${s.siswa_id}-${s.jenis}`} className="flex justify-between items-center gap-3">
                <span className="text-sr-700">{s.siswa_kode} {s.siswa_nama} · {s.jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'} T{s.tangga} · {s.pekan_stagnan} minggu</span>
                <Link to={`/guru/rencana?siswa=${s.siswa_kode}`} className="text-sm text-orange-700 hover:text-orange-900 font-medium flex-shrink-0">
                  Buat Rencana
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat CTA */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-sr-900 mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Tanya Asisten
        </h2>
        <p className="text-sr-500 mb-4">
          "Bagaimana cara mengajar anak yang belum kenal huruf di usia SMA?"
        </p>
        <Link to="/guru/chat" className="text-sr-700 hover:text-sr-900 font-medium">
          Tanya →
        </Link>
      </div>
    </GuruShell>
  )
}

export default DashboardGuru
