import { Link } from 'react-router-dom'
import { TrendingUp, BarChart3, MapPin, AlertTriangle, School, GraduationCap, DollarSign } from 'lucide-react'
import SidebarShell from '../components/SidebarShell'

const NAV = [
  { to: '/pengelola', label: 'Agregat', icon: BarChart3 },
  { to: '/pengelola/analitik', label: 'Analitik', icon: TrendingUp },
  { to: '/pengelola/peta', label: 'Peta', icon: MapPin },
]

function DashboardPengelola() {
  return (
    <SidebarShell navItems={NAV} roleLabel="Pengelola Program" orgLabel="Kemensos RI">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-sr-900">Dashboard Pengelola — Program Sekolah Rakyat</h1>
        <p className="text-sr-500 text-sm">Kemensos RI · TA 2026/2027 · Data per 10 Agustus 2026</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[
          { label: 'Siswa Baru 2026', value: '5.130', icon: <GraduationCap className="w-6 h-6 text-sr-700" /> },
          { label: 'Sekolah Aktif', value: '19', icon: <School className="w-6 h-6 text-green-700" /> },
          { label: 'Guru Baru 2026', value: '3.000+', icon: <UsersIcon className="w-6 h-6 text-orange-700" /> },
          { label: 'Anggaran 2026', value: 'Rp 4 T', icon: <DollarSignIcon className="w-6 h-6 text-purple-700" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-3">{s.icon}</div>
            <div className="text-2xl lg:text-3xl font-bold text-sr-900">{s.value}</div>
            <div className="text-sm text-sr-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Rerata Waktu Naik */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Rerata Waktu Naik 1 Tangga (minggu)</h2>
          {[
            { prov: 'Sumatera Utara', mg: 2.5 }, { prov: 'Jawa Barat', mg: 3.2 },
            { prov: 'Jawa Tengah', mg: 2.8 }, { prov: 'Jawa Timur', mg: 3.1 },
            { prov: 'Sulawesi Selatan', mg: 3.5 }, { prov: 'Kalimantan Timur', mg: 3.0 },
            { prov: 'Bali', mg: 2.3 }, { prov: 'Papua', mg: 4.1 },
          ].map((p) => (
            <div key={p.prov} className="flex items-center gap-3 mb-2">
              <span className="w-32 lg:w-36 text-sm text-sr-600 truncate">{p.prov}</span>
              <div className="flex-1 h-5 bg-sr-100 rounded overflow-hidden">
                <div className={`h-full rounded transition-all duration-700 ${p.mg < 3 ? 'bg-green-500' : p.mg >= 4 ? 'bg-red-400' : 'bg-sr-500'}`}
                  style={{ width: `${(p.mg / 5) * 100}%` }} />
              </div>
              <span className="w-8 text-right text-sm font-semibold text-sr-700">{p.mg}</span>
            </div>
          ))}
        </div>

        {/* % Keluar Tangga 0-2 */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">% Keluar dari Tangga 0-2 (3 bln pertama)</h2>
          {[
            { prov: 'Sumatera Utara', pct: 78 }, { prov: 'Jawa Barat', pct: 62 },
            { prov: 'Jawa Tengah', pct: 71 }, { prov: 'Jawa Timur', pct: 68 },
            { prov: 'Sulawesi Selatan', pct: 55 }, { prov: 'Kalimantan Timur', pct: 64 },
            { prov: 'Bali', pct: 82 }, { prov: 'Papua', pct: 48 },
          ].map((p) => (
            <div key={p.prov} className="flex items-center gap-3 mb-2">
              <span className="w-32 lg:w-36 text-sm text-sr-600 truncate">{p.prov}</span>
              <div className="flex-1 h-5 bg-sr-100 rounded overflow-hidden">
                <div className={`h-full rounded transition-all duration-700 ${p.pct >= 70 ? 'bg-green-500' : p.pct <= 50 ? 'bg-red-400' : 'bg-orange-400'}`}
                  style={{ width: `${p.pct}%` }} />
              </div>
              <span className="w-10 text-right text-sm font-semibold text-sr-700">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sekolah Terlambat + Distribusi */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" /> Sekolah Pergerakan Terlambat
          </h2>
          {[
            { nama: 'SR Cianjur', mg: 4.8, siswa: 120, guru: 8 },
            { nama: 'SR Lebak', mg: 4.5, siswa: 98, guru: 7 },
            { nama: 'SR Garut', mg: 4.2, siswa: 105, guru: 8 },
            { nama: 'SR Karawang', mg: 3.9, siswa: 112, guru: 7 },
            { nama: 'SR Indramayu', mg: 3.8, siswa: 95, guru: 6 },
          ].map((s) => (
            <div key={s.nama} className="flex justify-between items-center gap-3 p-4 bg-orange-50 rounded-lg mb-2 border border-orange-100">
              <div>
                <div className="font-medium text-sr-900 text-sm">{s.nama}</div>
                <div className="text-xs text-sr-500 mt-1">{s.siswa} siswa · {s.guru} guru · {s.mg} mg/tangga</div>
              </div>
              <Link to="/kepsek" className="text-xs text-orange-700 hover:text-orange-900 font-medium px-3 py-1.5 bg-white rounded border border-orange-200 flex-shrink-0">
                Detail →
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Distribusi Target 2029-2030</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-sr-600">Sekolah (target: 500)</span><span className="font-medium">19/500</span></div>
              <div className="h-4 bg-sr-100 rounded overflow-hidden">
                <div className="h-full bg-blue-500 rounded" style={{ width: '3.8%', transition: 'width 1s' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-sr-600">Siswa (target: 500.000)</span><span className="font-medium">43.344/500.000</span></div>
              <div className="h-4 bg-sr-100 rounded overflow-hidden">
                <div className="h-full bg-green-500 rounded" style={{ width: '8.7%', transition: 'width 1s' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-sr-600">Guru (target: 15.000)</span><span className="font-medium">3.000+/15.000</span></div>
              <div className="h-4 bg-sr-100 rounded overflow-hidden">
                <div className="h-full bg-orange-500 rounded" style={{ width: '20%', transition: 'width 1s' }} />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-sr-50 rounded-lg p-3">
              <div className="text-sr-500">Rerata Asesmen/Bulan</div>
              <div className="font-bold text-sr-900 text-lg">12.450</div>
            </div>
            <div className="bg-sr-50 rounded-lg p-3">
              <div className="text-sr-500">Rerata Naik/Bulan</div>
              <div className="font-bold text-green-600 text-lg">8.713</div>
            </div>
          </div>
        </div>
      </div>
    </SidebarShell>
  )
}

function UsersIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function DollarSignIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

export default DashboardPengelola
