import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Building2, Sparkles, CheckCircle2 } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import SidebarShell from '../components/SidebarShell'
import { useToast } from '../components/ToastProvider'

const NAV = [
  { to: '/kepsek', label: 'Dashboard', icon: BarChart3 },
  { to: '/kepsek/kelas', label: 'Per Kelas', icon: Building2 },
  { to: '/kepsek/prioritas', label: 'Prioritas', icon: AlertTriangle },
]

const SEKOLAH_ID = 1

const JENIS_OPTIONS = [
  { value: 'LITERASI', label: 'Literasi' },
  { value: 'NUMERASI', label: 'Numerasi' },
  { value: 'SEMUA', label: 'Semua Jenis' },
]

function KepsekPrioritas() {
  const toast = useToast()
  const [allStagnan, setAllStagnan] = useState(null)
  const [jenisFilter, setJenisFilter] = useState('LITERASI')
  const [ditanganiIds, setDitanganiIds] = useState(new Set())

  useEffect(() => {
    tanggaApi.getStagnasi({ sekolah_id: SEKOLAH_ID }).then(setAllStagnan).catch(() => setAllStagnan([]))
  }, [])

  const tandaiDitangani = (key, nama) => {
    setDitanganiIds(prev => new Set([...prev, key]))
    toast.success(`${nama} ditandai sudah ditangani.`)
  }

  const stagnanList = useMemo(() => {
    if (!allStagnan) return []
    const filtered = jenisFilter === 'SEMUA' ? allStagnan : allStagnan.filter(s => s.jenis === jenisFilter)
    return [...filtered].sort((a, b) => b.pekan_stagnan - a.pekan_stagnan)
  }, [allStagnan, jenisFilter])

  const berat = useMemo(() => stagnanList.filter(s => s.pekan_stagnan >= 5), [stagnanList])
  const sedang = useMemo(() => stagnanList.filter(s => s.pekan_stagnan < 5), [stagnanList])

  if (allStagnan === null) {
    return (
      <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah" backTo="/kepsek">
        <div className="text-center py-16 text-sr-400">Memuat...</div>
      </SidebarShell>
    )
  }

  const Kartu = ({ s, warna }) => (
    <div className={`bg-white rounded-xl p-6 shadow-card mb-4 border-l-4 ${ditanganiIds.has(s.siswa_id) ? 'border-green-400' : warna}`}>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
        <div>
          <div className="font-display font-semibold text-sr-900 text-lg">{s.siswa_nama} · {s.siswa_kode}</div>
          <div className="text-sm text-sr-500 mt-1">Tangga {s.tangga} · Stagnan {s.pekan_stagnan} minggu</div>
        </div>
        {ditanganiIds.has(s.siswa_id) ? (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Sudah ditangani
          </span>
        ) : (
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${s.level === 'BERAT' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
            ⚠ {s.level === 'BERAT' ? 'Butuh Intervensi' : 'Perlu Perhatian'}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <Link to={`/guru/rencana?siswa=${s.siswa_kode}`} className="flex items-center gap-2 px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900 transition-colors">
          <Sparkles className="w-4 h-4" /> Lihat Rencana Pendampingan
        </Link>
        {!ditanganiIds.has(s.siswa_id) && (
          <button onClick={() => tandaiDitangani(s.siswa_id, s.siswa_nama)} className="px-4 py-2 border border-sr-200 text-sr-700 rounded-lg text-sm font-medium hover:bg-sr-50 transition-colors">
            Tandai Sudah Ditangani
          </button>
        )}
      </div>
    </div>
  )

  return (
    <SidebarShell navItems={NAV} roleLabel="Kepala Sekolah" backTo="/kepsek">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Siswa Prioritas</h1>
          <p className="text-sr-500 text-sm mt-1">{stagnanList.length} siswa membutuhkan perhatian khusus</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full font-medium">{berat.length} Berat</span>
          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full font-medium">{sedang.length} Sedang</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {JENIS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setJenisFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              jenisFilter === opt.value ? 'bg-sr-700 text-white' : 'bg-white text-sr-600 border border-gray-200 hover:bg-sr-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {stagnanList.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-10 text-center text-sr-500">
          Tidak ada siswa dengan stagnasi ≥ 3 minggu saat ini. 🎉
        </div>
      )}

      {berat.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Level BERAT (stagnasi ≥ 5 minggu) — {berat.length} siswa
          </h2>
          {berat.map((s) => <Kartu key={s.siswa_id} s={s} warna="border-red-400" />)}
        </div>
      )}

      {sedang.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-orange-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Level SEDANG (stagnasi 3-4 minggu) — {sedang.length} siswa
          </h2>
          {sedang.map((s) => <Kartu key={s.siswa_id} s={s} warna="border-orange-300" />)}
        </div>
      )}
    </SidebarShell>
  )
}

export default KepsekPrioritas
