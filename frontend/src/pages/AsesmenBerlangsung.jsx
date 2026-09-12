import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAsesmenStore } from '../lib/store'
import { useToast } from '../components/ToastProvider'

// Item shapes vary per tingkat/jenis (huruf, teks, bilangan, soal, pertanyaan) -
// "jawaban" is always the answer key, everything else is what to display.
const DISPLAY_KEYS = ['huruf', 'bilangan', 'teks', 'soal', 'pertanyaan']
function displayTextFor(item) {
  if (!item) return ''
  for (const key of DISPLAY_KEYS) {
    if (item[key] != null) return item[key]
  }
  return ''
}

function AsesmenBerlangsung() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sesiAktif, loading, jawab, reset } = useAsesmenStore()
  const toast = useToast()

  const state = location.state || {}
  const siswa = state.siswa || { nama: 'Siswa', kode: 'SR-001-0000' }
  const jenis = sesiAktif?.jenis || state.jenis || 'LITERASI'

  const [waktu, setWaktu] = useState(0)
  const [transisi, setTransisi] = useState(null) // { aksi: 'naik' | 'turun' | 'selesai', label }
  const redirectedRef = useRef(false)

  useEffect(() => {
    if (!sesiAktif && !redirectedRef.current) {
      redirectedRef.current = true
      navigate('/guru/asesmen', { replace: true })
    }
  }, [sesiAktif, navigate])

  useEffect(() => {
    const timer = setInterval(() => setWaktu((w) => w + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const handleBatalkan = () => {
    if (window.confirm('Batalkan asesmen ini? Jawaban yang sudah tercatat akan hilang.')) {
      reset()
      navigate('/guru/asesmen')
    }
  }

  const handleJawab = async (benar) => {
    if (loading || !sesiAktif) return
    const tingkatSebelum = sesiAktif.tingkat_saat_ini ?? sesiAktif.tangga_awal ?? sesiAktif.tingkat_awal

    try {
      const data = await jawab(benar)

      if (data.status === 'selesai') {
        setTransisi({ aksi: 'selesai', label: data.hasil.tingkat_label })
        setTimeout(() => {
          navigate('/guru/asesmen/hasil', {
            state: {
              siswa,
              jenis,
              asesmenId: sesiAktif.asesmen_id,
              tingkatAwal: sesiAktif.tangga_awal ?? sesiAktif.tingkat_awal,
              hasil: data.hasil.tingkat_hasil,
              naik: data.hasil.naik_tingkat,
              durasi: formatTime(waktu),
            },
          })
        }, 1500)
      } else if (data.status === 'lanjut_tingkat') {
        setTransisi({
          aksi: data.tingkat_baru > tingkatSebelum ? 'naik' : 'turun',
          label: data.tingkat_label,
          tingkat: data.tingkat_baru,
        })
        setTimeout(() => setTransisi(null), 1400)
      }
      // status === 'lanjut': store already advanced item_ke, component re-renders normally.
    } catch (err) {
      toast.error(`Gagal menyimpan jawaban: ${err.message}`)
    }
  }

  if (!sesiAktif) return null // redirecting

  const tingkat = sesiAktif.tingkat_saat_ini ?? sesiAktif.tangga_awal ?? sesiAktif.tingkat_awal
  const items = sesiAktif.items || []
  const itemKe = sesiAktif.item_ke || 0
  // Some tingkat only have 1-3 authored items (e.g. literasi paragraf reading) -
  // wrap around rather than showing a blank card past the last one.
  const current = items.length ? items[itemKe % items.length] : null

  if (transisi) {
    return (
      <div className="min-h-screen bg-krem flex items-center justify-center">
        <div className="text-center animate-slideUp">
          {transisi.aksi === 'naik' ? (
            <>
              <div className="text-7xl mb-4">▲</div>
              <div className="text-3xl font-display font-bold text-green-700 mb-2">
                Naik ke Tingkat {transisi.tingkat}!
              </div>
              <div className="text-lg text-sr-500">{transisi.label}</div>
            </>
          ) : transisi.aksi === 'turun' ? (
            <>
              <div className="text-3xl font-display font-bold text-sr-700 mb-2">
                Mencoba tingkat {transisi.tingkat}
              </div>
              <div className="text-lg text-sr-500">{transisi.label}</div>
            </>
          ) : (
            <>
              <div className="text-3xl font-display font-bold text-sr-700 mb-2">
                Titik pijak ditemukan
              </div>
              <div className="text-lg text-sr-500">{transisi.label}</div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen bg-krem flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display font-semibold text-sr-900">Memuat asesmen...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-krem pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-sr-500 text-sm">ASESMEN {jenis}</p>
            <p className="font-display text-lg font-semibold text-sr-900">
              {siswa.kode} · {siswa.nama} · {siswa.jenjang || 'SMA'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono font-medium text-sr-700 tabular-nums">
              ⏱ {formatTime(waktu)}
            </div>
            <button
              onClick={handleBatalkan}
              aria-label="Batalkan asesmen"
              className="text-sr-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tingkat Badge */}
        <div className="text-center mb-8">
          <div className={`inline-block px-6 py-3 rounded-xl text-white font-display font-semibold text-xl badge-tangga-${tingkat}`}>
            TINGKAT {tingkat}
          </div>
          <div className="text-sr-600 mt-2 text-lg">
            {sesiAktif.tingkat_label}
          </div>
        </div>

        {/* Instruksi */}
        {sesiAktif.instruksi_guru && (
          <div className="bg-white rounded-xl p-5 shadow-card mb-8">
            <p className="text-sr-700">
              📢 <strong>Instruksi untuk Guru:</strong>
            </p>
            <p className="text-sr-600 mt-2 text-lg">
              "{sesiAktif.instruksi_guru}"
            </p>
          </div>
        )}

        {/* Item Display */}
        <div className="bg-white rounded-xl p-10 shadow-card mb-8 text-center min-h-[200px] flex items-center justify-center">
          <div className="font-mono font-bold text-sr-900" style={{ fontSize: current.soal || current.pertanyaan ? '28px' : '64px', lineHeight: '1.3' }}>
            {displayTextFor(current)}
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: Math.max(items.length, 5) }).map((_, idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-colors ${
                idx < itemKe ? 'bg-green-500' : idx === itemKe ? 'bg-sr-700 ring-2 ring-sr-300' : 'bg-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-sr-400 ml-2">{itemKe + 1}/5</span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleJawab(false)}
            disabled={loading}
            className="bg-red-50 border-2 border-red-300 text-red-700 py-6 rounded-xl font-bold text-xl hover:bg-red-100 active:scale-95 transition-all select-none disabled:opacity-50"
          >
            ✗ SALAH
          </button>
          <button
            onClick={() => handleJawab(true)}
            disabled={loading}
            className="bg-green-50 border-2 border-green-400 text-green-700 py-6 rounded-xl font-bold text-xl hover:bg-green-100 active:scale-95 transition-all select-none disabled:opacity-50"
          >
            ✓ BENAR
          </button>
        </div>

        <p className="text-center text-sm text-sr-400 mt-6">
          ⓘ Ketuk tombol setelah siswa menjawab lisan. Siswa tidak melihat layar ini.
        </p>
      </main>
    </div>
  )
}

export default AsesmenBerlangsung
