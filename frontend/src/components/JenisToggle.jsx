const OPTIONS = [
  { value: 'LITERASI', label: '📖 Literasi' },
  { value: 'NUMERASI', label: '🔢 Numerasi' },
]

/** Switch between the two tangga families (literasi / numerasi) on a page. */
function JenisToggle({ value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-1 p-1 bg-white rounded-lg shadow-card ${className}`} role="tablist" aria-label="Jenis tangga">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            value === opt.value ? 'bg-sr-700 text-white' : 'text-sr-600 hover:bg-sr-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default JenisToggle
