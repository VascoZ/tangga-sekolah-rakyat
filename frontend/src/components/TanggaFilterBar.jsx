import { Search } from 'lucide-react'

export const TANGGA_FILTERS = [
  { value: 'semua', label: 'Semua Tangga' },
  { value: 'awal', label: 'T0-2 (Awal)' },
  { value: 'tengah', label: 'T3-4 (Tengah)' },
  { value: 'lanjut', label: 'T5-6 (Lanjut)' },
  { value: 'belum', label: 'Belum Asesmen' },
  { value: 'stagnan', label: 'Stagnasi' },
]

/** Shared filter predicate so every siswa list (search + tangga filter) behaves identically. */
export function matchesTanggaFilter(siswa, filter) {
  switch (filter) {
    case 'awal': return siswa.tanggaLit !== null && siswa.tanggaLit <= 2
    case 'tengah': return siswa.tanggaLit !== null && siswa.tanggaLit >= 3 && siswa.tanggaLit <= 4
    case 'lanjut': return siswa.tanggaLit !== null && siswa.tanggaLit >= 5
    case 'belum': return siswa.tanggaLit === null
    case 'stagnan': return siswa.stagnan > 0
    default: return true
  }
}

export function matchesSearch(siswa, search) {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return siswa.nama.toLowerCase().includes(q) || siswa.kode.toLowerCase().includes(q)
}

export default function TanggaFilterBar({ search, onSearchChange, filter, onFilterChange, placeholder = 'Cari nama atau kode...', className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sr-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-sr-500 outline-none"
        >
          {TANGGA_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>
    </div>
  )
}
