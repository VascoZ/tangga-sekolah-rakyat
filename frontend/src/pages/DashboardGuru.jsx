import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEMO_SISWA_KELAS_A } from '../lib/demoData'
import { ClipboardCheck, LayoutGrid, BookOpen, MessageCircle, AlertTriangle, BarChart3, Search } from 'lucide-react'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'

const TANGGA_COLORS = ['badge-tangga-0', 'badge-tangga-1', 'badge-tangga-2', 'badge-tangga-3', 'badge-tangga-4', 'badge-tangga-5', 'badge-tangga-6']
const TANGGA_LABELS = ['Belum Huruf', 'Mengenal Huruf', 'Suku Kata', 'Kata Utuh', 'Kalimat', 'Paragraf', 'Paham Bacaan']

function DashboardGuru() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const stats = useMemo(() => {
    const total = DEMO_SISWA_KELAS_A.length
    const sudah = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null).length
    const naik = DEMO_SISWA_KELAS_A.filter(s => s.naik > 0).length
    const stagnan = DEMO_SISWA_KELAS_A.filter(s => s.stagnan > 0).length
    return { totalSiswa: total, sudahAsesmen: sudah, naikMingguIni: naik, stagnasiAktif: stagnan }
  }, [])

  const kelompok = useMemo(() => {
    const awal = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null && s.tanggaLit <= 2).length
    const tengah = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null && s.tanggaLit >= 3 && s.tanggaLit <= 4).length
    const lanjut = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit !== null && s.tanggaLit >= 5).length
    return { awal, tengah, lanjut }
  }, [])

  const sebaranTangga = useMemo(() => {
    const counts = {}
    for (let i = 0; i <= 6; i++) {
      counts[i] = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit === i).length
    }
    const belum = DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit === null).length
    const maxCount = Math.max(...Object.values(counts), belum, 1)
    return { counts, belum, maxCount }
  }, [])

  const belumAsesmen = useMemo(() => DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit === null), [])
  const stagnanList = useMemo(() => DEMO_SISWA_KELAS_A.filter(s => s.stagnan >= 3), [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/guru/siswa${search.trim() ? `?cari=${encodeURIComponent(search.trim())}` : ''}`)
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
          <div className="text-sr-500 text-sm">Sudah Asesmen</div>
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
            {belumAsesmen.length} siswa belum asesmen:{' '}
            {belumAsesmen.map(s => `${s.kode} ${s.nama}`).join(', ')}
          </p>
        )}
        <Link
          to="/guru/asesmen"
          className="inline-block bg-sr-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors"
        >
          Mulai Asesmen Massal — {Math.max(belumAsesmen.length, 1)} Siswa
        </Link>
      </div>

      {/* Two Columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Kelompok */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Kelompok Aktif
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
            <div className="text-lg font-medium text-sr-900">"Lingkungan Sekitarku"</div>
            <div className="text-sr-500 text-sm">6 tingkat · tersedia</div>
          </div>
          <Link
            to="/guru/bahan"
            className="inline-block bg-sr-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors"
          >
            Lihat Bahan
          </Link>
        </div>
      </div>

      {/* Sebaran Tangga */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="font-display text-lg font-semibold text-sr-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tangga Literasi — Kelas A (SMA)
          </h2>
          <TanggaLegend jenis="LITERASI" />
        </div>
        <p className="text-xs text-sr-400 mb-4">
          {sebaranTangga.belum} siswa belum asesmen
        </p>
        <div className="space-y-1.5">
          {[6, 5, 4, 3, 2, 1, 0].map((t) => {
            const count = sebaranTangga.counts[t]
            const pct = Math.round((count / stats.totalSiswa) * 100)
            const barW = Math.max((count / sebaranTangga.maxCount) * 100, 2)
            return (
              <div key={t} className="flex items-center gap-2 text-sm">
                <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold text-white flex-shrink-0 ${TANGGA_COLORS[t]}`}>
                  T{t}
                </span>
                <span className="w-20 text-sr-500 flex-shrink-0 hidden sm:inline">{TANGGA_LABELS[t]}</span>
                <div className="flex-1 h-5 bg-sr-100 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${TANGGA_COLORS[t]}`}
                    style={{ width: `${barW}%`, transition: 'width 0.6s ease-out' }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-sr-700">{count}</span>
                <span className="w-8 text-right text-xs text-sr-400 hidden sm:inline">{pct}%</span>
              </div>
            )
          })}
        </div>
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
              <div key={s.id} className="flex justify-between items-center gap-3">
                <span className="text-sr-700">{s.kode.replace('SR-001-', 'SR-')} {s.nama} · T{s.tanggaLit} · {s.stagnan} minggu</span>
                <Link to={`/guru/rencana?siswa=${s.kode}`} className="text-sm text-orange-700 hover:text-orange-900 font-medium flex-shrink-0">
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
