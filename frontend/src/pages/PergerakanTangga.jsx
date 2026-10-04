import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { Users } from 'lucide-react'
import { useAuthStore } from '../lib/auth'
import { tanggaApi } from '../lib/api'
import { toRosterView } from '../lib/roster'
import GuruShell from '../components/GuruShell'
import JenisToggle from '../components/JenisToggle'

const TANGGA_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6']

const JENIS_META = {
  LITERASI: { nama: 'Literasi', jumlah: 7, lanjut: [5, 6], labels: ['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'] },
  NUMERASI: { nama: 'Numerasi', jumlah: 6, lanjut: [5, 5], labels: ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'] },
}

function PergerakanTangga() {
  const { user } = useAuthStore()
  const kelasId = user?.kelas?.id || 1

  const [jenis, setJenis] = useState('LITERASI')
  const [roster, setRoster] = useState(null)
  const [riwayatPerSiswa, setRiwayatPerSiswa] = useState({})
  const [riwayatKelompok, setRiwayatKelompok] = useState(null)

  const meta = JENIS_META[jenis]
  const tingkatKey = jenis === 'NUMERASI' ? 'tanggaNum' : 'tanggaLit'
  const stagnanKey = jenis === 'NUMERASI' ? 'stagnanNum' : 'stagnan'
  const naikKey = jenis === 'NUMERASI' ? 'naikNum' : 'naik'

  useEffect(() => {
    tanggaApi.getRosterKelas(kelasId).then((data) => setRoster(data.map(toRosterView))).catch(() => setRoster([]))
  }, [kelasId])

  useEffect(() => {
    setRiwayatKelompok(null)
    tanggaApi.getRiwayatKelompok(kelasId, jenis).then((d) => setRiwayatKelompok(d.titik)).catch(() => setRiwayatKelompok([]))
  }, [kelasId, jenis])

  const siswaContoh = (roster || [])
    .filter(s => s[tingkatKey] !== null)
    .sort((a, b) => (b[stagnanKey] - a[stagnanKey]) || (b[naikKey] - a[naikKey]))
    .slice(0, 3)

  useEffect(() => {
    siswaContoh.forEach((s) => {
      const cacheKey = `${s.id}-${jenis}`
      if (riwayatPerSiswa[cacheKey]) return
      tanggaApi.getRiwayatSiswa(s.id, jenis).then((data) => {
        setRiwayatPerSiswa((prev) => ({
          ...prev,
          [cacheKey]: data.map((r, i) => ({ minggu: i + 1, tangga: r.tangga_akhir })),
        }))
      }).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, jenis])

  if (roster === null) {
    return (
      <GuruShell title="Pergerakan Tangga" subtitle="Memuat..." backTo="/guru">
        <div className="text-center py-16 text-sr-400">Memuat data pergerakan...</div>
      </GuruShell>
    )
  }

  return (
    <GuruShell title="Pergerakan Tangga" subtitle="Kelas A (SMA) · Riwayat asesmen sungguhan" backTo="/guru">
      <div className="space-y-6">
        <JenisToggle value={jenis} onChange={setJenis} />

        {/* Per Siswa */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">
            Pergerakan per Siswa ({meta.nama}) — 3 siswa dengan aktivitas terbanyak
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {siswaContoh.map((siswa) => {
              const data = riwayatPerSiswa[`${siswa.id}-${jenis}`] || []
              const tingkat = siswa[tingkatKey]
              return (
                <div key={siswa.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-medium text-sr-900">{siswa.nama}</div>
                      <div className="text-xs text-sr-400">{siswa.kode}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white badge-tangga-${tingkat ?? 0}`}>
                      T{tingkat}
                    </span>
                  </div>
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="minggu" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, meta.jumlah - 1]} ticks={meta.labels.map((_, i) => i)} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v) => [`Tingkat ${v}`, meta.nama]}
                          labelFormatter={(l) => `Titik ke-${l}`}
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
                  ) : (
                    <div className="h-[160px] flex items-center justify-center text-sm text-sr-400">Belum ada riwayat</div>
                  )}
                  {siswa[stagnanKey] > 0 && (
                    <p className="text-xs text-orange-600 mt-2">⚠ Stagnan {siswa[stagnanKey]} minggu</p>
                  )}
                  {siswa[naikKey] > 0 && (
                    <p className="text-xs text-green-600 mt-2">▲ Naik terbaru</p>
                  )}
                </div>
              )
            })}
            {siswaContoh.length === 0 && (
              <p className="text-sm text-sr-400 md:col-span-3">Belum ada siswa dengan asesmen {meta.nama.toLowerCase()}.</p>
            )}
          </div>
        </div>

        {/* Per Kelompok */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Rata-rata Tingkat per Kelompok ({meta.nama}), dari Waktu ke Waktu
          </h2>
          {riwayatKelompok && riwayatKelompok.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riwayatKelompok}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="minggu" />
                <YAxis domain={[0, meta.jumlah - 1]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="awal" name="Awal (T0-2)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tengah" name="Tengah (T3-4)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lanjut" name={`Lanjut (T${meta.lanjut[0]}${meta.lanjut[0] === meta.lanjut[1] ? '' : `-${meta.lanjut[1]}`})`} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-sr-400 py-8 text-center">Belum cukup riwayat untuk grafik ini.</p>
          )}
          <p className="text-xs text-sr-400 mt-3 text-center">
            Dikelompokkan dari riwayat_tangga sungguhan, per minggu kalender sejak entri pertama.
          </p>
        </div>

        {/* Sebaran Saat Ini */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="font-display font-semibold text-sr-900 mb-4">
            Sebaran Tangga {meta.nama} Saat Ini ({roster.length} siswa)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={meta.labels.map((label, i) => ({
                tingkat: label,
                jumlah: roster.filter(s => s[tingkatKey] === i).length,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tingkat" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" name="Siswa" radius={[4, 4, 0, 0]}>
                {meta.labels.map((_, i) => (
                  <Cell key={i} fill={TANGGA_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GuruShell>
  )
}

export default PergerakanTangga
