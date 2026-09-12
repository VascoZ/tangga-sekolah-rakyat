import { useEffect, useRef, useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { TANGGA_LABELS } from '../lib/demoData'

const TANGGA_COLOR_CLASS = ['badge-tangga-0', 'badge-tangga-1', 'badge-tangga-2', 'badge-tangga-3', 'badge-tangga-4', 'badge-tangga-5', 'badge-tangga-6']

/** Small "?" button that explains what T0-T6 mean, so the ladder isn't unexplained jargon. */
function TanggaLegend({ jenis = 'LITERASI', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const labels = TANGGA_LABELS[jenis] || TANGGA_LABELS.LITERASI

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Apa arti Tangga?"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs text-sr-400 hover:text-sr-700 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="underline decoration-dotted">Apa itu Tangga?</span>
      </button>

      {open && (
        <div className="absolute z-50 top-7 left-0 w-72 max-w-[85vw] bg-white rounded-xl shadow-modal border border-gray-100 p-4 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-sr-900">Tangga {jenis === 'NUMERASI' ? 'Numerasi' : 'Literasi'}</p>
            <button onClick={() => setOpen(false)} aria-label="Tutup" className="text-sr-400 hover:text-sr-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-sr-500 mb-3">
            Setiap siswa berdiri di satu &ldquo;anak tangga&rdquo; sesuai kemampuannya saat ini — bukan sesuai usia atau jenjang kelas.
          </p>
          <ul className="space-y-1.5">
            {labels.map((label, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className={`inline-flex items-center justify-center w-8 h-5 rounded font-bold text-white flex-shrink-0 ${TANGGA_COLOR_CLASS[i] || 'bg-sr-500'}`}>
                  T{i}
                </span>
                <span className="text-sr-600">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TanggaLegend
