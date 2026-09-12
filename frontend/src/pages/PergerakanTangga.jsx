import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { Users } from 'lucide-react'
import { DEMO_SISWA_KELAS_A, RIWAYAT_PERGERAKAN, PERGERAKAN_KELOMPOK } from '../lib/demoData'
import GuruShell from '../components/GuruShell'

const TANGGA_LABELS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']
const TANGGA_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6']

function PergerakanTangga() {
  const siswaContoh = DEMO_SISWA_KELAS_A.filter(s =>
    ['SR-001-0003', 'SR-001-0002', 'SR-001-0013'].includes(s.kode)
  )

  return (
    <GuruShell title="Pergerakan Tangga" subtitle="Kelas A (SMA) · Minggu 1–4 · Data sintetis demo" backTo="/guru">
      <div className="space-y-6">
        {/* Per Siswa */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">
            Pergerakan per Siswa (Literasi)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {siswaContoh.map((siswa) => {
              const data = RIWAYAT_PERGERAKAN[siswa.kode] || []
              return (
                <div key={siswa.kode} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-medium text-sr-900">{siswa.nama}</div>
                      <div className="text-xs text-sr-400">{siswa.kode}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white badge-tangga-${siswa.tanggaLit ?? 0}`}>
                      T{siswa.tanggaLit}
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="minggu" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5, 6]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v) => [`Tingkat ${v}`, 'Literasi']}
                        labelFormatter={(l) => `Minggu ${l}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="tangga"
                        stroke="#1e3a5f"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#1e3a5f' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  {siswa.stagnan > 0 && (
                    <p className="text-xs text-orange-600 mt-2">⚠ Stagnan {siswa.stagnan} minggu</p>
                  )}
                  {siswa.naik > 0 && (
                    <p className="text-xs text-green-600 mt-2">▲ Naik {siswa.naik} tingkat bulan ini</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Per Kelompok */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Rata-rata Pergerakan per Kelompok
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={PERGERAKAN_KELOMPOK}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="minggu" />
              <YAxis domain={[0, 6]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="awal" name="Awal (T0-2)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tengah" name="Tengah (T3-4)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lanjut" name="Lanjut (T5-6)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-sr-400 mt-3 text-center">
            Rata-rata tingkat literasi per kelompok dari minggu ke minggu
          </p>
        </div>

        {/* Sebaran Saat Ini */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">
            Sebaran Tangga Saat Ini (30 siswa)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={TANGGA_LABELS.map((label, i) => ({
                tingkat: label,
                jumlah: DEMO_SISWA_KELAS_A.filter(s => s.tanggaLit === i).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tingkat" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Siswa" radius={[4, 4, 0, 0]}>
                {TANGGA_LABELS.map((_, i) => (
                  <Cell key={i} fill={TANGGA_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          ⓘ Data pergerakan ini sepenuhnya sintetis untuk demo LAN Datathon 2026.
          Tidak ada data siswa nyata yang digunakan.
        </div>
      </div>
    </GuruShell>
  )
}

export default PergerakanTangga
