import { useEffect, useState } from 'react'
import { TrendingUp, BarChart3, MapPin } from 'lucide-react'
import { tanggaApi } from '../lib/api'
import SidebarShell from '../components/SidebarShell'

const NAV = [
  { to: '/pengelola', label: 'Agregat', icon: BarChart3 },
  { to: '/pengelola/analitik', label: 'Analitik', icon: TrendingUp },
  { to: '/pengelola/peta', label: 'Peta', icon: MapPin },
]

function PengelolaAnalitik() {
  const [agregat, setAgregat] = useState(null)
  useEffect(() => { tanggaApi.getAgregat().then(setAgregat).catch(() => {}) }, [])

  return (
    <SidebarShell navItems={NAV} roleLabel="Pengelola Program" orgLabel="Kemensos RI" backTo="/pengelola">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-sr-900">Analitik Pergerakan Tangga</h1>
        <p className="text-sr-500 text-sm mt-1">Tren bulanan · Heatmap distribusi · Perbandingan antar provinsi</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
        ⓘ Proyeksi <strong>ilustratif</strong> skala nasional — pilot saat ini baru berjalan di {agregat?.total_sekolah ?? '—'} sekolah,
        lihat Kelas A di menu Kepsek untuk data sungguhan.
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-display font-semibold text-sr-900 mb-6">Tren Bulanan: % Siswa Naik ≥1 Tangga</h2>
        <div className="flex items-end gap-2 h-48 overflow-x-auto">
          {[
            { bulan: 'Jul', pct: 35, label: '35%' },
            { bulan: 'Agu', pct: 42, label: '42%' },
            { bulan: 'Sep', pct: 48, label: '48%' },
            { bulan: 'Okt', pct: 55, label: '55%' },
            { bulan: 'Nov', pct: 58, label: '58%' },
            { bulan: 'Des', pct: 65, label: '65%' },
            { bulan: 'Jan', pct: 72, label: '72%' },
          ].map((item) => (
            <div key={item.bulan} className="flex-1 min-w-[32px] flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-sr-500">{item.label}</span>
              <div className="w-full bg-sr-700 rounded-t-lg transition-all duration-700" style={{ height: `${item.pct * 1.8}px` }} />
              <span className="text-xs text-sr-500">{item.bulan}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-sr-400 mt-4 text-center">▲ Tren positif: dari 35% (Juli) ke 72% (Januari). Target akhir tahun: 80%.</p>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl p-6 shadow-card mb-8">
        <h2 className="font-display font-semibold text-sr-900 mb-4">Heatmap: Distribusi Tangga per Bulan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-sr-500">Tangga</th>
                {['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan'].map(m => (
                  <th key={m} className="text-center px-3 py-2 text-sr-500">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { t: 'T6', data: [1, 1, 2, 3, 5, 8, 12] },
                { t: 'T5', data: [2, 3, 5, 8, 12, 15, 18] },
                { t: 'T4', data: [5, 8, 12, 15, 18, 20, 22] },
                { t: 'T3', data: [8, 12, 15, 18, 20, 22, 20] },
                { t: 'T2', data: [15, 18, 20, 18, 15, 12, 10] },
                { t: 'T1', data: [20, 18, 15, 12, 10, 8, 5] },
                { t: 'T0', data: [30, 25, 18, 12, 8, 5, 3] },
              ].map((row) => (
                <tr key={row.t}>
                  <td className="px-3 py-2 font-medium text-sr-700">{row.t}</td>
                  {row.data.map((v, i) => {
                    const intensity = Math.min(v / 30, 1)
                    const bg = `rgba(27, 58, 92, ${intensity.toFixed(2)})`
                    return (
                      <td key={i} className="px-3 py-2 text-center">
                        <span className="inline-block w-10 h-8 rounded flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: bg, color: intensity > 0.5 ? 'white' : '#1A1A2E' }}>
                          {v}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-sr-400 mt-4">📊 T0 (merah) menurun dari 30% ke 3% — menunjukkan progres signifikan dalam 7 bulan.</p>
      </div>

      {/* Perbandingan */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Provinsi Tercepat</h2>
          {[
            { prov: 'Bali', mg: 2.3, sis: 180 },
            { prov: 'Sumatera Utara', mg: 2.5, sis: 250 },
            { prov: 'Jawa Tengah', mg: 2.8, sis: 320 },
            { prov: 'DKI Jakarta', mg: 2.9, sis: 200 },
            { prov: 'Kalimantan Timur', mg: 3.0, sis: 150 },
          ].map((p) => (
            <div key={p.prov} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <div className="font-medium text-sm text-sr-900">{p.prov}</div>
                <div className="text-xs text-sr-400">{p.sis} siswa</div>
              </div>
              <span className="text-sm font-semibold text-green-600">{p.mg} mg</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">Provinsi Terlambat</h2>
          {[
            { prov: 'Papua', mg: 4.1, sis: 95 },
            { prov: 'Sulawesi Selatan', mg: 3.5, sis: 200 },
            { prov: 'Jawa Barat', mg: 3.2, sis: 500 },
            { prov: 'Jawa Timur', mg: 3.1, sis: 400 },
            { prov: 'NTT', mg: 3.1, sis: 120 },
          ].map((p) => (
            <div key={p.prov} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <div className="font-medium text-sm text-sr-900">{p.prov}</div>
                <div className="text-xs text-sr-400">{p.sis} siswa</div>
              </div>
              <span className="text-sm font-semibold text-orange-600">{p.mg} mg</span>
            </div>
          ))}
        </div>
      </div>
    </SidebarShell>
  )
}

export default PengelolaAnalitik
