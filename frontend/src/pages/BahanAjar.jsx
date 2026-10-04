import { useEffect, useState } from 'react'
import { Sparkles, Printer, Plus } from 'lucide-react'
import { useAuthStore } from '../lib/auth'
import { bahanApi, tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import GuruShell from '../components/GuruShell'
import EmptyState from '../components/EmptyState'
import JenisToggle from '../components/JenisToggle'
import { useToast } from '../components/ToastProvider'

const TANGGA_LABELS = {
  LITERASI: ['Belum Mengenal Huruf', 'Mengenal Huruf', 'Membaca Suku Kata', 'Membaca Kata Utuh', 'Membaca Kalimat', 'Membaca Paragraf Lancar', 'Memahami Bacaan'],
  NUMERASI: ['Belum Mengenal Bilangan', 'Mengenal Bilangan 1-9', 'Bilangan 10-99 & Perbandingan', 'Penjumlahan & Pengurangan', 'Perkalian & Pembagian', 'Soal Cerita Sederhana'],
}

const TANGGA_COLORS = {
  0: 'bg-tangga-0', 1: 'bg-tangga-1', 2: 'bg-tangga-2', 3: 'bg-tangga-3',
  4: 'bg-tangga-4', 5: 'bg-tangga-5', 6: 'bg-tangga-6',
}

function contentBlock(konten) {
  // konten_json shape from generate_bahan_ai(): { instruksi_guru, konten: str | list, ... }
  const isi = konten?.konten
  if (Array.isArray(isi)) {
    if (isi.length && typeof isi[0] === 'object' && isi[0].tanya) {
      return { kind: 'qa', items: isi }
    }
    return { kind: 'kartu', items: isi }
  }
  return { kind: 'teks', text: isi || '' }
}

function BahanAjar() {
  const toast = useToast()
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1

  const [jenis, setJenis] = useState('LITERASI')
  const [temas, setTemas] = useState(null)
  const [temaAktif, setTemaAktif] = useState(null)
  const [selectedTingkat, setSelectedTingkat] = useState(3)
  const [bahanByTingkat, setBahanByTingkat] = useState({})
  const [roster, setRoster] = useState(null)
  const [loadingGenerate, setLoadingGenerate] = useState(false)

  const labels = TANGGA_LABELS[jenis]
  const jumlahTingkat = labels.length

  useEffect(() => {
    setTemas(null)
    setTemaAktif(null)
    setBahanByTingkat({})
    setSelectedTingkat(0)
    bahanApi.temas(kelasId, jenis).then((list) => {
      setTemas(list)
      setTemaAktif(list[0] || null)
    }).catch(() => setTemas([]))
  }, [kelasId, jenis])

  useEffect(() => {
    tanggaApi.getRosterKelas(kelasId).then((data) => setRoster(data.map(toRosterView))).catch(() => setRoster([]))
  }, [kelasId])

  useEffect(() => {
    if (!temaAktif) return
    bahanApi.list({ kelas_id: kelasId, tema: temaAktif, jenis }).then((rows) => {
      const byTingkat = {}
      rows.forEach((r) => { byTingkat[r.tingkat] = r.konten_json })
      setBahanByTingkat(byTingkat)
    }).catch(() => setBahanByTingkat({}))
  }, [temaAktif, kelasId, jenis])

  const jumlahSiswa = (tingkat) => (roster || []).filter((s) =>
    (jenis === 'NUMERASI' ? s.tanggaNum : s.tanggaLit) === tingkat
  ).length

  const handleGenerate = async () => {
    if (!temaAktif) return
    setLoadingGenerate(true)
    try {
      const res = await bahanApi.generate(temaAktif, kelasId, jenis)
      const byTingkat = {}
      Object.entries(res.bahan).forEach(([key, konten]) => {
        byTingkat[parseInt(key.replace('tingkat_', ''), 10)] = konten
      })
      setBahanByTingkat(byTingkat)
      toast.success(`Bahan ajar ${jenis === 'NUMERASI' ? 'numerasi' : 'literasi'} untuk tema "${temaAktif}" (${jumlahTingkat} tingkat) siap ditinjau.`)
    } catch (err) {
      toast.error(`Gagal generate bahan: ${err.message}`)
    } finally {
      setLoadingGenerate(false)
    }
  }

  const handleTambahTema = () => {
    const nama = window.prompt('Nama tema baru:')
    const trimmed = nama?.trim()
    if (!trimmed) return
    if (temas.includes(trimmed)) {
      toast.info(`Tema "${trimmed}" sudah ada.`)
      setTemaAktif(trimmed)
      return
    }
    setTemas((prev) => [...prev, trimmed])
    setTemaAktif(trimmed)
    setBahanByTingkat({})
    toast.info(`Tema "${trimmed}" siap. Klik "Generate" untuk mengisinya.`)
  }

  const handleCetak = () => window.print()

  if (temas === null || roster === null) {
    return (
      <GuruShell title="Bahan Ajar" subtitle="Memuat...">
        <div className="text-center py-16 text-sr-400">Memuat bahan ajar...</div>
      </GuruShell>
    )
  }

  const bahan = bahanByTingkat[selectedTingkat]
  const blok = bahan ? contentBlock(bahan) : null

  return (
    <GuruShell title={temaAktif ? `Bahan Ajar — "${temaAktif}"` : 'Bahan Ajar'} subtitle={temaAktif ? `${jumlahTingkat} tingkat ${jenis === 'NUMERASI' ? 'numerasi' : 'literasi'}` : 'Belum ada tema'}>
      <div className="mb-4">
        <JenisToggle value={jenis} onChange={setJenis} />
      </div>

      {/* Tema Selector */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {temas.map((t) => (
            <button
              key={t}
              onClick={() => setTemaAktif(t)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                temaAktif === t ? 'bg-sr-700 text-white' : 'bg-sr-100 text-sr-700 hover:bg-sr-200'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={handleTambahTema}
            className="px-4 py-2 rounded-lg border-2 border-dashed border-sr-300 text-sr-500 whitespace-nowrap hover:bg-sr-50 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Tema Baru
          </button>
        </div>
      </div>

      {!temaAktif ? (
        <EmptyState
          icon={Sparkles}
          title="Belum ada bahan ajar"
          description={`Tambah tema baru lalu generate untuk membuat bahan ajar ${jumlahTingkat} tingkat ${jenis === 'NUMERASI' ? 'numerasi' : 'literasi'}.`}
        />
      ) : (
        <>
          {/* Tingkat Tabs */}
          <div className="flex gap-2 overflow-x-auto mb-6">
            {labels.map((_, t) => (
              <button
                key={t}
                onClick={() => setSelectedTingkat(t)}
                className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedTingkat === t ? 'bg-sr-700 text-white' : 'bg-white text-sr-700 hover:bg-sr-50'
                }`}
              >
                <div className="text-sm">T.{t}</div>
                <div className="text-xs opacity-75">{labels[t].split(' ').slice(0, 2).join(' ')}</div>
                <div className="text-xs opacity-60 mt-0.5">{jumlahSiswa(t)} ssw</div>
              </button>
            ))}
          </div>

          {/* Bahan Content */}
          {!bahan ? (
            <EmptyState
              icon={Sparkles}
              title={`Belum ada bahan untuk Tingkat ${selectedTingkat}`}
              description={`Klik "Generate" di bawah untuk membuat bahan tema "${temaAktif}" untuk semua tingkat.`}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className={`${TANGGA_COLORS[selectedTingkat]} text-white p-6`}>
                <div className="font-display text-xl font-semibold">
                  Tingkat {selectedTingkat} — {labels[selectedTingkat]}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  Untuk {jumlahSiswa(selectedTingkat)} siswa · Tema: {temaAktif}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-medium text-sr-900 mb-2">📋 Instruksi untuk Guru:</h3>
                  <p className="text-sr-600">{bahan.instruksi_guru}</p>
                </div>

                <div className="mb-6">
                  {blok.kind === 'qa' && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-sr-900 mb-2">
                        {jenis === 'NUMERASI' ? 'Soal Cerita:' : 'Pertanyaan Pemahaman:'}
                      </h3>
                      {blok.items.map((q, idx) => (
                        <div key={idx} className="bg-sr-50 rounded-lg p-4">
                          <div className="font-medium text-sr-900">❓ {q.tanya}</div>
                          <div className="text-sm text-green-700 mt-1">💡 Jawaban: {q.jawaban}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {blok.kind === 'kartu' && (
                    <>
                      <h3 className="font-medium text-sr-900 mb-2">
                        {jenis === 'NUMERASI' ? 'Kartu Soal / Bilangan (cetak & gunting):' : 'Kartu (cetak & gunting):'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {blok.items.map((k, idx) => (
                          <div key={idx} className="bg-sr-50 rounded-lg p-4 text-center">
                            <div className="text-lg md:text-xl font-bold text-sr-900 break-words">{k}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {blok.kind === 'teks' && (
                    <>
                      <h3 className="font-medium text-sr-900 mb-2">Teks Bacaan:</h3>
                      <p className="bg-sr-50 rounded-lg p-4 text-sr-800 leading-relaxed">{blok.text}</p>
                    </>
                  )}
                </div>

                {bahan.latihan && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-orange-800 mb-2">💡 Latihan Tambahan (jika masih kesulitan):</h3>
                    <p className="text-orange-700">{bahan.latihan}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCetak}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-sr-200 text-sr-700 hover:bg-sr-50"
                  >
                    <Printer className="w-4 h-4" /> Cetak
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate New */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loadingGenerate}
              className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingGenerate ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI sedang menyusun bahan ajar...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {Object.keys(bahanByTingkat).length ? 'Generate Ulang Bahan Tema Ini' : `Generate Bahan (${jumlahTingkat} Tingkat)`}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </GuruShell>
  )
}

export default BahanAjar
