import { TANGGA_LABELS, JENIS_NAMA, TANGGA_BADGE_CLASS } from '../lib/tangga'

/**
 * Tabel sebaran siswa per tingkat untuk satu jenis tangga (literasi/numerasi).
 * `counts` berisi jumlah siswa per index tingkat; `belum` opsional untuk siswa
 * yang belum pernah asesmen jenis ini.
 */
function SebaranTable({ jenis, counts, belum = null, className = '' }) {
  const labels = TANGGA_LABELS[jenis]
  const total = counts.reduce((n, c) => n + c, 0)
  const maxCount = Math.max(...counts, belum ?? 0, 1)
  const order = labels.map((_, i) => labels.length - 1 - i)

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-sr-500 border-b border-gray-100">
              <th className="py-2 pr-2 font-medium">Tingkat</th>
              <th className="py-2 pr-2 font-medium hidden sm:table-cell">Tahap</th>
              <th className="py-2 pr-2 font-medium text-right">Siswa</th>
              <th className="py-2 pr-2 font-medium text-right">%</th>
              <th className="py-2 font-medium w-1/4 hidden md:table-cell" aria-hidden="true" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.map((t) => {
              const count = counts[t] || 0
              const pct = total ? Math.round((count / total) * 100) : 0
              const barW = Math.max((count / maxCount) * 100, count ? 3 : 0)
              return (
                <tr key={t}>
                  <td className="py-2 pr-2">
                    <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-bold text-white ${TANGGA_BADGE_CLASS[t]}`}>
                      T{t}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-sr-600 hidden sm:table-cell">{labels[t]}</td>
                  <td className="py-2 pr-2 text-right font-medium text-sr-900">{count}</td>
                  <td className="py-2 pr-2 text-right text-sr-500">{pct}%</td>
                  <td className="py-2 hidden md:table-cell">
                    <div className="h-3 bg-sr-100 rounded overflow-hidden">
                      <div className={`h-full rounded ${TANGGA_BADGE_CLASS[t]}`} style={{ width: `${barW}%`, transition: 'width 0.6s' }} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {belum !== null && (
              <tr>
                <td className="py-2 pr-2 text-sr-400 text-xs" colSpan={2}>Belum asesmen {JENIS_NAMA[jenis]}</td>
                <td className="py-2 pr-2 text-right text-sr-500">{belum}</td>
                <td className="py-2 pr-2" />
                <td className="hidden md:table-cell" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SebaranTable
