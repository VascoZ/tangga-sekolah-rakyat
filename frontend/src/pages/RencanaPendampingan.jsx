import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { DEMO_SISWA_KELAS_A, DUMMY_RENCANA } from '../lib/demoData'
import { Sparkles, ChevronLeft, CheckCircle2, RefreshCw, Eye } from 'lucide-react'
import { useToast } from '../components/ToastProvider'

const TANGGA_COLORS_BG = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']
const TANGGA_LABELS = ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata', 'Membaca Kalimat', 'Membaca Paragraf', 'Memahami Bacaan']

function RencanaPendampingan() {
  const { peran } = useAuthStore()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const kodeSearch = searchParams.get('siswa') || ''
  const isKepsek = peran === 'kepala_sekolah' || peran === 'pengelola'

  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [rencana, setRencana] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [checklist, setChecklist] = useState([])
  const [catatan, setCatatan] = useState('')

  const siswaDenganRencana = DEMO_SISWA_KELAS_A.filter(s => DUMMY_RENCANA[s.kode])

  useEffect(() => {
    if (kodeSearch) {
      const found = DEMO_SISWA_KELAS_A.find(
        s => s.kode === kodeSearch || s.kode.replace('SR-001-', 'SR-') === kodeSearch
      )
      if (found) {
        setSelectedSiswa(found)
        const dummy = DUMMY_RENCANA[found.kode]
        if (dummy) loadExistingPlan(found, dummy)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kodeSearch])

  const loadExistingPlan = (siswa, dummy) => {
    const tingkat = siswa.tanggaLit ?? 0
    setRencana({
      mingguKe: 3,
      targetTangga: Math.min(tingkat + 1, 6),
      indikator: `Siswa dapat ${TANGGA_LABELS[Math.min(tingkat + 1, 6)].toLowerCase()} tanpa bantuan mengeja.`,
      kegiatan: dummy.kegiatan,
      dibuatOleh: dummy.dibuatOleh,
      dibuatTanggal: dummy.dibuatTanggal,
      status: dummy.status,
    })
    setChecklist(dummy.kegiatan.map((k, i) => k.selesai ? i : -1).filter(i => i >= 0))
    setCatatan(dummy.catatan || '')
  }

  const handleGenerate = () => {
    if (!selectedSiswa) return
    setGenerating(true)
    const tingkat = selectedSiswa.tanggaLit ?? 0
    const target = Math.min(tingkat + 1, 6)

    setTimeout(() => {
      setRencana({
        mingguKe: 3,
        targetTangga: target,
        indikator: `Siswa dapat ${TANGGA_LABELS[target].toLowerCase()} tanpa bantuan.`,
        kegiatan: [
          { hari: 'Senin', kegiatan: `Latihan ${TANGGA_LABELS[tingkat]}`, durasi: 15, instruksi: 'Gunakan bahan ajar yang disiapkan. Fokus pengulangan.', selesai: false },
          { hari: 'Selasa', kegiatan: 'Latihan dengan Variasi', durasi: 15, instruksi: 'Ganti media: kartu, lagu, atau permainan.', selesai: false },
          { hari: 'Rabu', kegiatan: 'Aktivitas Motorik', durasi: 20, instruksi: 'Menggunting, menempel, atau menulis.', selesai: false },
          { hari: 'Kamis', kegiatan: 'Latihan Mandiri', durasi: 15, instruksi: 'Biarkan siswa mencoba sendiri. Catat kesulitan.', selesai: false },
          { hari: 'Jumat', kegiatan: 'Evaluasi Mingguan', durasi: 20, instruksi: `Cek: ${TANGGA_LABELS[target].toLowerCase()}. Catat kemajuan.`, selesai: false },
        ],
        dibuatOleh: 'Guru (Baru)',
        dibuatTanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'aktif',
      })
      setChecklist([])
      setCatatan('')
      setGenerating(false)
      toast.success(`Rencana pendampingan untuk ${selectedSiswa.nama} siap.`)
    }, 2000)
  }

  const toggleCheck = (idx) => {
    if (isKepsek) return
    setChecklist(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
  }

  const handleSimpanCatatan = () => {
    toast.success('Catatan guru disimpan.')
  }

  const backTo = isKepsek ? '/kepsek' : '/guru'

  return (
    <div className="min-h-screen bg-krem pb-20">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link to={backTo} className="text-sr-500 hover:text-sr-700 text-sm flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Link>
            <h1 className="font-display text-xl font-semibold text-sr-900 mt-1">
              Rencana Pendampingan Individual
            </h1>
          </div>
          {isKepsek && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <Eye className="w-4 h-4" /> Mode Lihat
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Pilih Siswa */}
        <div className="bg-white rounded-xl p-5 shadow-card mb-6">
          <h2 className="font-medium text-sr-900 mb-3">
            {isKepsek ? 'Siswa dengan Rencana Aktif' : 'Pilih Siswa'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {DEMO_SISWA_KELAS_A.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSiswa(s)
                  const dummy = DUMMY_RENCANA[s.kode]
                  if (dummy) loadExistingPlan(s, dummy)
                  else { setRencana(null); setChecklist([]) }
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedSiswa?.id === s.id ? 'border-sr-700 bg-sr-50' : 'border-gray-200 hover:border-sr-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-sr-900">{s.nama}</span>
                  {DUMMY_RENCANA[s.kode] && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✓</span>
                  )}
                </div>
                <div className="text-xs text-sr-500">{s.kode.replace('SR-001-', 'SR-')}</div>
                {s.tanggaLit !== null && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs text-white ${TANGGA_COLORS_BG[s.tanggaLit]}`}>
                    T{s.tanggaLit}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Belum pilih */}
        {!selectedSiswa && (
          <div className="text-center py-16 text-sr-400">
            Pilih siswa di atas untuk {isKepsek ? 'melihat' : 'membuat'} rencana pendampingan.
          </div>
        )}

        {/* Siswa tanpa rencana (guru) - generate */}
        {selectedSiswa && !rencana && !DUMMY_RENCANA[selectedSiswa.kode] && !isKepsek && (
          <div className="text-center py-12 bg-white rounded-xl shadow-card">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="font-display text-xl font-semibold text-sr-900 mb-2">
              Generate Rencana untuk {selectedSiswa.nama}
            </h2>
            <p className="text-sr-500 mb-6">
              Tangga {selectedSiswa.tanggaLit} — {TANGGA_LABELS[selectedSiswa.tanggaLit ?? 0]}
              {selectedSiswa.stagnan > 0 && ` · Stagnan ${selectedSiswa.stagnan} minggu`}
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-8 py-4 bg-sr-700 text-white rounded-xl font-medium text-lg hover:bg-sr-900 transition-colors disabled:opacity-50"
            >
              {generating ? <><RefreshCw className="w-5 h-5 animate-spin" /> AI menyusun...</> : <><Sparkles className="w-5 h-5" /> Generate Rencana</>}
            </button>
          </div>
        )}

        {/* Siswa tanpa rencana (kepsek) */}
        {selectedSiswa && !rencana && !DUMMY_RENCANA[selectedSiswa.kode] && isKepsek && (
          <div className="text-center py-12 bg-white rounded-xl shadow-card">
            <div className="text-4xl mb-3">📭</div>
            <h2 className="font-display text-lg font-semibold text-sr-900 mb-2">
              Belum Ada Rencana
            </h2>
            <p className="text-sr-500">Rencana untuk {selectedSiswa.nama} belum dibuat oleh guru.</p>
          </div>
        )}

        {/* Rencana detail */}
        {rencana && selectedSiswa && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-display font-semibold text-sr-900 text-lg">
                    {selectedSiswa.nama} · {selectedSiswa.kode}
                  </div>
                  <div className="text-sm text-sr-500 mt-1">
                    Dibuat oleh: <strong>{rencana.dibuatOleh}</strong> · {rencana.dibuatTanggal}
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium">
                  ● Aktif
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`px-4 py-2 rounded-lg text-white font-bold ${TANGGA_COLORS_BG[selectedSiswa.tanggaLit ?? 0]}`}>
                  Tangga {selectedSiswa.tanggaLit}
                </div>
                <span className="text-sr-400 text-xl">→</span>
                <div className={`px-4 py-2 rounded-lg text-white font-bold ${TANGGA_COLORS_BG[rencana.targetTangga]}`}>
                  Tangga {rencana.targetTangga}
                </div>
                <span className="text-sm text-sr-500">Minggu ke-{rencana.mingguKe}</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-1">🎯 Indikator:</div>
                <div className="text-blue-700">{rencana.indikator}</div>
              </div>
            </div>

            {/* Kegiatan */}
            <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
              <div className="bg-sr-700 text-white p-5 flex justify-between items-center">
                <h2 className="font-display font-semibold text-lg">Rencana Mingguan</h2>
                <span className="text-sm opacity-80">{checklist.length}/{rencana.kegiatan.length} selesai</span>
              </div>
              <div className="divide-y divide-gray-100">
                {rencana.kegiatan.map((k, idx) => (
                  <div key={idx} className={`p-5 ${checklist.includes(idx) ? 'bg-green-50' : 'hover:bg-sr-50'} transition-colors`}>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleCheck(idx)}
                        className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          checklist.includes(idx)
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300'
                        } ${isKepsek ? 'cursor-default opacity-80' : 'hover:border-green-400'}`}
                      >
                        {checklist.includes(idx) && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-medium ${checklist.includes(idx) ? 'text-green-700' : 'text-sr-900'}`}>
                            📅 {k.hari} — {k.kegiatan}
                          </h3>
                          <span className="text-xs text-sr-400">{k.durasi} menit</span>
                        </div>
                        <p className="text-sm text-sr-500">{k.instruksi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-white rounded-xl p-6 shadow-card mb-6">
              <h3 className="font-medium text-sr-900 mb-3">📝 Catatan Guru</h3>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                readOnly={isKepsek}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sr-500 outline-none resize-none ${isKepsek ? 'bg-gray-50 text-sr-600' : ''}`}
              />
              {!isKepsek && (
                <div className="flex gap-4 mt-4">
                  <button onClick={handleSimpanCatatan} className="px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900">
                    Simpan Catatan
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 border border-sr-200 text-sr-700 rounded-lg text-sm font-medium hover:bg-sr-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Menyusun...' : 'Generate Ulang'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default RencanaPendampingan