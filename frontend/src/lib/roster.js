// Shared mapping from the backend's roster shape (tangga_literasi, tgl_terakhir_literasi, ...)
// to the flat shape the UI already expects (tanggaLit, terakhir, stagnan, ...).

export function timeAgo(iso) {
  if (!iso) return null
  const diffMs = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return 'baru'
  if (hours < 24) return `${hours}hr`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}hr`
  return `${Math.floor(days / 7)}mg`
}

export function toRosterView(item) {
  return {
    id: item.id,
    kode: item.kode,
    nama: item.nama || item.kode,
    tanggaLit: item.tangga_literasi,
    tanggaNum: item.tangga_numerasi,
    terakhir: timeAgo(item.tgl_terakhir_literasi),
    naik: item.pekan_ke_literasi === 1 && item.tangga_literasi !== null ? 1 : 0,
    stagnan: item.pekan_ke_literasi >= 3 ? item.pekan_ke_literasi : 0,
  }
}
