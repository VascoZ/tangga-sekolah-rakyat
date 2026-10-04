import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { tanggaApi, rencanaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import { useToast } from '../components/ToastProvider'
import TanggaFilterBar, { matchesTanggaFilter, matchesSearch } from '../components/TanggaFilterBar'
import JenisToggle from '../components/JenisToggle'
import { Sparkles, ChevronLeft, CheckCircle2, RefreshCw, Eye } from 'lucide-react'

const TANGGA_COLORS_BG = ['bg-tangga-0', 'bg-tangga-1', 'bg-tangga-2', 'bg-tangga-3', 'bg-tangga-4', 'bg-tangga-5', 'bg-tangga-6']
const TANGGA_LABELS = {
  LITERASI: ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata', 'Membaca Kalimat', 'Membaca Paragraf', 'Memahami Bacaan'],
  NUMERASI: ['Belum Mengenal Bilangan', 'Mengenal Bilangan 1-9', 'Bilangan 10-99 & Perbandingan', 'Penjumlahan & Pengurangan', 'Perkalian & Pembagian', 'Soal Cerita Sederhana'],
}

function RencanaPendampingan() {
  const { peran, user } = useAuthStore()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const kodeSearch = searchParams.get('siswa') || ''
  const isKepsek = peran === 'kepala_sekolah' || peran === 'pengelola'
  const kelasId = user?.kelas?.id || 1

  const [roster, setRoster] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('semua')
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [jenis, setJenis] = useState('LITERASI')
  const [rencanaHistory, setRencanaHistory] = useState(null) // list, newest first
  const [generating, setGenerating] = useState(false)
  const [checklist, setChecklist] = useState([])
  const [catatan, setCatatan] = useState('')
  const [savingCatatan, setSavingCatatan] = useState(false)

  useEffect(() => {
    tanggaApi.getRosterKelas(kelasId).then((data) => setRoster(data.map(toRosterView))).catch(() => setRoster([]))
  }, [kelasId])

  useEffect(() => {
    if (!roster || !kodeSearch) return
    const found = roster.find(s => s.kode === kodeSearch || s.kode.replace('SR-001-', 'SR-') === kodeSearch)
    if (found) selectSiswa(found)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, kodeSearch])

  const loadRencana = (siswaId) => {
    rencanaApi.getBySiswa(siswaId, jenis).then((list) => {
      setRencanaHistory(list)
      const aktif = list[0] || null
      setChecklist(aktif ? aktif.kegiatan.map((k, i) => (k.selesai ? i : -1)).filter(i => i >= 0) : [])
      setCatatan(aktif?.catatan_guru || '')
    }).catch(() => setRencanaHistory([]))
  }

  const selectSiswa = (siswa) => {
    setSelectedSiswa(siswa)
    setRencanaHistory(null)
    loadRencana(siswa.id)
  }

  useEffect(() => {
    if (!selectedSiswa) return
    setRencanaHistory(null)
    loadRencana(selectedSiswa.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jenis])

  const rencana = rencanaHistory?.[0] || null

  const handleGenerate = async () => {
    if (!selectedSiswa) return
    setGenerating(true)
    try {
      await rencanaApi.generate(selectedSiswa.id, jenis)
      toast.success(`Rencana pendampingan untuk ${selectedSiswa.nama} siap.`)
      loadRencana(selectedSiswa.id)
    } catch (err) {
      toast.error(`Gagal generate rencana: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const toggleCheck = async (idx) => {
    if (isKepsek || !rencana) return
    const next = checklist.includes(idx) ? checklist.filter(i => i !== idx) : [...checklist, idx]
    setChecklist(next)
    try {
      await rencanaApi.update(rencana.id, { checklist: next })
    } catch (err) {
      toast.error(`Gagal menyimpan checklist: ${err.message}`)
      setChecklist(checklist) // revert
    }
  }

  const handleSimpanCatatan = async () => {
    if (!rencana) return
    setSavingCatatan(true)
    try {
      await rencanaApi.update(rencana.id, { catatan_guru: catatan })
      toast.success('Catatan guru disimpan.')
    } catch (err) {
      toast.error(`Gagal menyimpan catatan: ${err.message}`)
    } finally {
      setSavingCatatan(false)
    }
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-medium text-sr-900">Pilih Siswa</h2>
            <JenisToggle value={jenis} onChange={setJenis} />
          </div>
          {roster === null ? (
            <div className="text-sr-400 text-sm py-4">Memuat daftar siswa...</div>
          ) : (
            <>
              <TanggaFilterBar search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} className="mb-4 !p-0 !shadow-none" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {roster.filter((s) => matchesSearch(s, search) && matchesTanggaFilter(s, filter)).map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSiswa(s)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedSiswa?.id === s.id ? 'border-sr-700 bg-sr-50' : 'border-gray-200 hover:border-sr-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-sr-900">{s.nama}</span>
                    {s.stagnan > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">⚠</span>}
                  </div>
                  <div className="text-xs text-sr-500">{s.kode.replace('SR-001-', 'SR-')}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${s.tanggaLit !== null ? TANGGA_COLORS_BG[s.tanggaLit] : 'bg-sr-300'}`}>
                      Lit {s.tanggaLit !== null ? `T${s.tanggaLit}` : '—'}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${s.tanggaNum !== null ? TANGGA_COLORS_BG[s.tanggaNum] : 'bg-sr-300'}`}>
                      Num {s.tanggaNum !== null ? `T${s.tanggaNum}` : '—'}
                    </span>
                  </div>
                </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!selectedSiswa && roster !== null && (
          <div className="text-center py-16 text-sr-400">
            Pilih siswa di atas untuk {isKepsek ? 'melihat' : 'membuat'} rencana pendampingan.
          </div>
        )}

        {selectedSiswa && rencanaHistory === null && (
          <div className="text-center py-16 text-sr-400">Memuat rencana...</div>
        )}

        {/* Siswa tanpa rencana (guru) - generate */}
        {selectedSiswa && rencanaHistory !== null && !rencana && !isKepsek && (
          <div className="text-center py-12 bg-white rounded-xl shadow-card">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="font-display text-xl font-semibold text-sr-900 mb-2">
              Generate Rencana untuk {selectedSiswa.nama}
            </h2>
            <p className="text-sr-500 mb-6">
              Tangga {jenis === 'NUMERASI' ? (selectedSiswa.tanggaNum ?? '?') : (selectedSiswa.tanggaLit ?? '?')} — {TANGGA_LABELS[jenis][(jenis === 'NUMERASI' ? selectedSiswa.tanggaNum : selectedSiswa.tanggaLit) ?? 0]}
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
        {selectedSiswa && rencanaHistory !== null && !rencana && isKepsek && (
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
                    Minggu ke-{rencana.minggu_ke} · Dibuat {new Date(rencana.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium">
                  ● Aktif
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className={`px-4 py-2 rounded-lg text-white font-bold ${TANGGA_COLORS_BG[(jenis === 'NUMERASI' ? selectedSiswa.tanggaNum : selectedSiswa.tanggaLit) ?? 0]}`}>
                  Tangga {(jenis === 'NUMERASI' ? selectedSiswa.tanggaNum : selectedSiswa.tanggaLit) ?? 0}
                </div>
                <span className="text-sr-400 text-xl">→</span>
                <div className={`px-4 py-2 rounded-lg text-white font-bold ${TANGGA_COLORS_BG[rencana.target_tangga]}`}>
                  Tangga {rencana.target_tangga}
                </div>
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
                            📅 Hari {k.hari} — {k.kegiatan}
                          </h3>
                          <span className="text-xs text-sr-400">{k.durasi_menit} menit</span>
                        </div>
                        <p className="text-sm text-sr-500">{k.instruksi_guru}</p>
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
                  <button
                    onClick={handleSimpanCatatan}
                    disabled={savingCatatan}
                    className="px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900 disabled:opacity-50"
                  >
                    {savingCatatan ? 'Menyimpan...' : 'Simpan Catatan'}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 border border-sr-200 text-sr-700 rounded-lg text-sm font-medium hover:bg-sr-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Menyusun...' : 'Generate Ulang (Minggu Baru)'}
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
