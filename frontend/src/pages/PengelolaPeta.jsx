import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, BarChart3, MapPin, School } from 'lucide-react'
import SidebarShell from '../components/SidebarShell'
import { useToast } from '../components/ToastProvider'

const NAV = [
  { to: '/pengelola', label: 'Agregat', icon: BarChart3 },
  { to: '/pengelola/analitik', label: 'Analitik', icon: TrendingUp },
  { to: '/pengelola/peta', label: 'Peta', icon: MapPin },
]

const SEKOLAH_DATA = [
  { nama: 'SR Medan', prov: 'Sumatera Utara', lat: 3.59, lng: 98.67, mg: 2.5, siswa: 240, status: 'baik' },
  { nama: 'SR Deli Serdang', prov: 'Sumatera Utara', lat: 3.53, lng: 98.72, mg: 2.7, siswa: 180, status: 'baik' },
  { nama: 'SR Jakarta', prov: 'DKI Jakarta', lat: -6.2, lng: 106.82, mg: 2.9, siswa: 300, status: 'baik' },
  { nama: 'SR Bekasi', prov: 'Jawa Barat', lat: -6.24, lng: 106.99, mg: 2.8, siswa: 280, status: 'baik' },
  { nama: 'SR Cianjur', prov: 'Jawa Barat', lat: -6.82, lng: 107.14, mg: 4.8, siswa: 120, status: 'terlambat' },
  { nama: 'SR Garut', prov: 'Jawa Barat', lat: -7.21, lng: 107.9, mg: 4.2, siswa: 105, status: 'terlambat' },
  { nama: 'SR Bandung', prov: 'Jawa Barat', lat: -6.92, lng: 107.6, mg: 3.0, siswa: 260, status: 'baik' },
  { nama: 'SR Lebak', prov: 'Banten', lat: -6.35, lng: 106.22, mg: 4.5, siswa: 98, status: 'terlambat' },
  { nama: 'SR Karawang', prov: 'Jawa Barat', lat: -6.32, lng: 107.3, mg: 3.9, siswa: 112, status: 'sedang' },
  { nama: 'SR Semarang', prov: 'Jawa Tengah', lat: -6.97, lng: 110.42, mg: 2.8, siswa: 320, status: 'baik' },
  { nama: 'SR Surabaya', prov: 'Jawa Timur', lat: -7.25, lng: 112.75, mg: 3.1, siswa: 350, status: 'baik' },
  { nama: 'SR Makassar', prov: 'Sulawesi Selatan', lat: -5.15, lng: 119.43, mg: 3.5, siswa: 200, status: 'sedang' },
  { nama: 'SR Jayapura', prov: 'Papua', lat: -2.53, lng: 140.72, mg: 4.1, siswa: 95, status: 'sedang' },
  { nama: 'SR Bali', prov: 'Bali', lat: -8.65, lng: 115.22, mg: 2.3, siswa: 180, status: 'baik' },
]

const STATUS_COLOR = {
  baik: { color: '#10B981', label: 'Baik (< 3 mg)' },
  sedang: { color: '#F4A261', label: 'Sedang (3-4 mg)' },
  terlambat: { color: '#E63946', label: 'Terlambat (> 4 mg)' },
}

function PengelolaPeta() {
  const toast = useToast()
  const [selected, setSelected] = useState(null)

  // Simple map: center roughly on Indonesia (Jakarta area), show pins using absolute positioning
  // In production use Leaflet. For demo, use a stylized grid map.
  const mapWidth = 800
  const mapHeight = 500
  const centerLat = -3
  const centerLng = 112
  const spanLat = 12
  const spanLng = 25

  const projectToMap = (lat, lng) => {
    const x = ((lng - (centerLng - spanLng / 2)) / spanLng) * mapWidth
    const y = (((centerLat + spanLat / 2) - lat) / spanLat) * mapHeight
    return { x, y }
  }

  return (
    <SidebarShell navItems={NAV} roleLabel="Pengelola Program" orgLabel="Kemensos RI" backTo="/pengelola">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Peta Sebaran Sekolah Rakyat</h1>
          <p className="text-sr-500 text-sm mt-1">14 sekolah · 8 provinsi</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {Object.entries(STATUS_COLOR).map(([key, v]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: v.color }} />
            {v.label}
          </span>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-card mb-6 overflow-x-auto">
        <div className="relative bg-sr-50 rounded-lg border border-gray-200" style={{ height: mapHeight, width: mapWidth, minWidth: mapWidth }}>
          {/* Grid lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute border-b border-gray-200" style={{ top: `${(i / 6) * 100}%`, left: 0, right: 0 }} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute border-r border-gray-200" style={{ left: `${(i / 8) * 100}%`, top: 0, bottom: 0 }} />
          ))}

          {/* Pins */}
          {SEKOLAH_DATA.map((s) => {
            const { x, y } = projectToMap(s.lat, s.lng)
            return (
              <button
                key={s.nama}
                onClick={() => setSelected(s)}
                aria-label={`Lihat detail ${s.nama}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                style={{ left: `${(x / mapWidth) * 100}%`, top: `${(y / mapHeight) * 100}%` }}
              >
                <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${s.status === 'baik' ? 'bg-green-500' : s.status === 'terlambat' ? 'bg-red-500' : 'bg-orange-400'} ${selected?.nama === s.nama ? 'ring-4 ring-sr-300' : ''}`}
                  style={{ animation: 'pulse 2s infinite' }} />
              </button>
            )
          })}

          <div className="absolute bottom-2 left-2 text-xs text-sr-400">
            Peta ilustratif — 14 sekolah demo
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="bg-white rounded-xl p-6 shadow-card animate-slideUp">
          <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: STATUS_COLOR[selected.status].color }}>
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-sr-900 text-lg">{selected.nama}</h2>
                <p className="text-sr-500 text-sm">{selected.prov} · {selected.siswa} siswa</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: STATUS_COLOR[selected.status].color }}>
              {STATUS_COLOR[selected.status].label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-sr-50 rounded-lg p-4">
              <div className="text-xs text-sr-500">Rerata naik tangga</div>
              <div className="text-xl font-bold text-sr-900 mt-1">{selected.mg} minggu</div>
            </div>
            <div className="bg-sr-50 rounded-lg p-4">
              <div className="text-xs text-sr-500">Total siswa</div>
              <div className="text-xl font-bold text-sr-900 mt-1">{selected.siswa}</div>
            </div>
            <div className="bg-sr-50 rounded-lg p-4">
              <div className="text-xs text-sr-500">Koordinat</div>
              <div className="text-xl font-bold text-sr-900 mt-1 text-sm">{selected.lat.toFixed(2)}, {selected.lng.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Link to="/kepsek" className="px-4 py-2 bg-sr-700 text-white rounded-lg text-sm font-medium hover:bg-sr-900">
              Lihat Dashboard Sekolah →
            </Link>
            {selected.status === 'terlambat' && (
              <button
                onClick={() => toast.info(`Tim pendamping wilayah akan dihubungi untuk ${selected.nama}.`)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                ⚠ Perlu Intervensi
              </button>
            )}
          </div>
        </div>
      )}
    </SidebarShell>
  )
}

export default PengelolaPeta
