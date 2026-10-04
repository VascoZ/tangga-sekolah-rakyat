import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, ClipboardList, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../lib/auth'
import { tanggaApi, rencanaApi } from '../lib/api'
import GuruShell from '../components/GuruShell'
import TanggaLegend from '../components/TanggaLegend'
import JenisToggle from '../components/JenisToggle'
import { useToast } from '../components/ToastProvider'

const TANGGA_COLORS = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']

async function buatRencanaUntuk(siswaList, jenis) {
  const hasil = await Promise.allSettled(siswaList.map((s) => rencanaApi.generate(s.id, jenis)))
  return hasil.filter((h) => h.status === 'fulfilled').length
}

function kelompokMeta(jenis) {
  const lanjut = jenis === 'NUMERASI' ? [5, 5] : [5, 6]
  return {
    awal: { nama: 'Awal', rentang: [0, 2], icon: '▲', bg: 'bg-tangga-0' },
    tengah: { nama: 'Tengah', rentang: [3, 4], icon: '█', bg: 'bg-tangga-3' },
    lanjut: { nama: 'Lanjut', rentang: lanjut, icon: '◆', bg: 'bg-tangga-6' },
  }
}

function rentangLabel([lo, hi]) {
  return lo === hi ? `T${lo}` : `T${lo}-${hi}`
}

function Pengelompokan() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1
  const [jenis, setJenis] = useState('LITERASI')
  const [data, setData] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generatingKelompok, setGeneratingKelompok] = useState(null)

  const meta = kelompokMeta(jenis)
  const jumlahTingkat = jenis === 'NUMERASI' ? 6 : 7

  const load = () => {
    setData(null)
    tanggaApi.getKelas(kelasId, jenis).then(setData).catch(() => toast.error('Gagal memuat pengelompokan.'))
  }
  useEffect(load, [kelasId, jenis])

  const totalSiswa = data ? Object.values(data.kelompok).reduce((n, arr) => n + arr.length, 0) : 0

  const buatRencanaKelompok = async (key) => {
    const siswaList = data.kelompok[key]
    if (siswaList.length === 0) {
      toast.info(`Belum ada siswa di kelompok ${meta[key].nama}.`)
      return
    }
    setGeneratingKelompok(key)
    try {
      const jumlah = await buatRencanaUntuk(siswaList, jenis)
      toast.success(`${jumlah} rencana pendampingan ${jenis === 'NUMERASI' ? 'numerasi' : 'literasi'} untuk kelompok ${meta[key].nama} dibuat.`)
      navigate('/guru/rencana')
    } catch (err) {
      toast.error(`Gagal membuat rencana: ${err.message}`)
    } finally {
      setGeneratingKelompok(null)
    }
  }

  const aturUlangKelompok = () => {
    setReordering(true)
    setTimeout(() => {
      setReordering(false)
      toast.success('Kelompok diperbarui berdasarkan hasil asesmen terbaru.')
      load()
    }, 600)
  }

  const buatRencanaSemua = async () => {
    const semua = Object.values(data.kelompok).flat()
    if (semua.length === 0) {
      toast.info('Belum ada siswa di kelas ini.')
      return
    }
    setGeneratingAll(true)
    try {
      const jumlah = await buatRencanaUntuk(semua, jenis)
      toast.success(`${jumlah} rencana pendampingan ${jenis === 'NUMERASI' ? 'numerasi' : 'literasi'} dibuat untuk semua siswa.`)
      navigate('/guru/rencana')
    } catch (err) {
      toast.error(`Gagal membuat rencana: ${err.message}`)
    } finally {
      setGeneratingAll(false)
    }
  }

  return (
    <GuruShell title="Pengelompokan Kelas — Kelas A (SMA)" subtitle="Minggu ke-3">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <JenisToggle value={jenis} onChange={setJenis} />
        <TanggaLegend jenis={jenis} />
      </div>

      {!data ? (
        <div className="text-center py-16 text-sr-400">Memuat pengelompokan...</div>
      ) : (
        <>
          {/* Kelompok Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Object.entries(data.kelompok).map(([key, siswaList]) => {
              const m = meta[key]
              return (
                <div key={key} className="bg-white rounded-xl shadow-card overflow-hidden">
                  <div className={`${m.bg} text-white p-4`}>
                    <div className="font-display font-semibold">
                      {m.icon} {m.nama} ({rentangLabel(m.rentang)})
                    </div>
                    <div className="text-sm opacity-90">
                      {siswaList.length} siswa
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {siswaList.length === 0 && <div className="text-sm text-sr-400">Belum ada siswa.</div>}
                      {siswaList.map((s) => (
                        <div key={s.id} className="flex justify-between items-center text-sm">
                          <span className="text-sr-600">{s.nama || s.kode}</span>
                          <span className="text-xs text-sr-400">{s.tingkat !== null ? `T${s.tingkat}` : '—'}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => buatRencanaKelompok(key)}
                      disabled={generatingKelompok === key}
                      className="w-full bg-sr-100 text-sr-700 py-2 rounded-lg font-medium hover:bg-sr-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {generatingKelompok === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                      Buat Rencana Kelompok
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-card mb-6">
            <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" /> Distribusi Tangga {jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'} ({totalSiswa} siswa)
            </h2>
            <div className="space-y-2">
              {Array.from({ length: jumlahTingkat }, (_, i) => jumlahTingkat - 1 - i).map((t) => {
                const count = data.sebaran[`T${t}`] || 0
                const pct = totalSiswa ? Math.round((count / totalSiswa) * 100) : 0
                return (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-8 text-sm text-sr-500">T{t}</span>
                    <div className="flex-1 h-6 bg-sr-100 rounded overflow-hidden">
                      <div
                        className={`h-full ${TANGGA_COLORS[t]}`}
                        style={{ width: `${Math.max(pct, count ? 3 : 0)}%`, transition: 'width 0.5s' }}
                      />
                    </div>
                    <span className="text-sm text-sr-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={aturUlangKelompok}
              disabled={reordering}
              className="bg-white border-2 border-sr-200 text-sr-700 py-3 rounded-lg font-medium hover:bg-sr-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${reordering ? 'animate-spin' : ''}`} />
              {reordering ? 'Menyusun ulang...' : 'Atur Ulang Kelompok'}
            </button>
            <button
              onClick={buatRencanaSemua}
              disabled={generatingAll}
              className="bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingAll ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
              {generatingAll ? 'Menyusun rencana...' : 'Buat Rencana Semua Siswa'}
            </button>
          </div>
        </>
      )}
    </GuruShell>
  )
}

export default Pengelompokan
