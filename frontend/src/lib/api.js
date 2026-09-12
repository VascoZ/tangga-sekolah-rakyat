const API_BASE = '/api'

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  const config = {
    ...options,
    headers,
  }
  
  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(error.detail || 'Something went wrong')
  }
  
  return response.json()
}

// Auth
export const authApi = {
  login: (username, password, peran) => 
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ username, password, peran }) }),
  
  logout: () => 
    fetchApi('/auth/logout', { method: 'POST' }),
  
  me: () => 
    fetchApi('/auth/me'),
}

// Asesmen
export const asesmenApi = {
  mulai: (siswaId, jenis) => 
    fetchApi('/asesmen/mulai', { method: 'POST', body: JSON.stringify({ siswa_id: siswaId, jenis }) }),
  
  jawab: (asesmenId, itemKe, jawaban, jawabanSiswa = null) => 
    fetchApi('/asesmen/jawab', { method: 'POST', body: JSON.stringify({ asesmen_id: asesmenId, item_ke: itemKe, jawaban, jawaban_siswa: jawabanSiswa }) }),
  
  get: (asesmenId) => 
    fetchApi(`/asesmen/${asesmenId}`),
  
  getBySiswa: (siswaId) => 
    fetchApi(`/asesmen/siswa/${siswaId}`),
}

// Tangga
export const tanggaApi = {
  getSiswa: (siswaId) =>
    fetchApi(`/tangga/siswa/${siswaId}`),

  getKelas: (kelasId) =>
    fetchApi(`/tangga/kelas/${kelasId}`),

  getSekolah: (sekolahId) =>
    fetchApi(`/tangga/sekolah/${sekolahId}`),

  getAgregat: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetchApi(`/tangga/agregat${query ? `?${query}` : ''}`)
  },

  getRosterKelas: (kelasId) =>
    fetchApi(`/tangga/kelas/${kelasId}/siswa`),

  getStagnasi: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetchApi(`/tangga/stagnasi${query ? `?${query}` : ''}`)
  },

  getRiwayatSiswa: (siswaId, jenis = 'LITERASI') =>
    fetchApi(`/tangga/riwayat/siswa/${siswaId}?jenis=${jenis}`),

  getRiwayatKelompok: (kelasId, jenis = 'LITERASI') =>
    fetchApi(`/tangga/riwayat/kelompok?kelas_id=${kelasId}&jenis=${jenis}`),
}

// Siswa
export const siswaApi = {
  create: (nama, kelasId, jenjang) =>
    fetchApi('/tangga/siswa', { method: 'POST', body: JSON.stringify({ nama, kelas_id: kelasId, jenjang }) }),
}

// Bahan Ajar
export const bahanApi = {
  generate: (tema, kelasId, tingkat = null) =>
    fetchApi('/bahan/generate', { method: 'POST', body: JSON.stringify({ tema, kelas_id: kelasId, tingkat }) }),

  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetchApi(`/bahan/list${query ? `?${query}` : ''}`)
  },

  get: (bahanId) =>
    fetchApi(`/bahan/${bahanId}`),

  temas: (kelasId) =>
    fetchApi(`/bahan/temas?kelas_id=${kelasId}`),
}

// Rencana
export const rencanaApi = {
  generate: (siswaId) =>
    fetchApi('/rencana/generate', { method: 'POST', body: JSON.stringify({ siswa_id: siswaId }) }),

  getBySiswa: (siswaId) =>
    fetchApi(`/rencana/siswa/${siswaId}`),

  getByKelas: (kelasId, mingguKe = null) => {
    const query = mingguKe ? `?minggu_ke=${mingguKe}` : ''
    return fetchApi(`/rencana/kelas/${kelasId}${query}`)
  },

  update: (rencanaId, data) =>
    fetchApi(`/rencana/${rencanaId}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// Chat
export const chatApi = {
  tanya: (pertanyaan) => 
    fetchApi('/chat/tanya', { method: 'POST', body: JSON.stringify({ pertanyaan }) }),
  
  suggested: () => 
    fetchApi('/chat/suggested'),
}

// Statistik
export const statistikApi = {
  getSekolah: (sekolahId) => 
    fetchApi(`/statistik/sekolah/${sekolahId}`),
  
  getAgregat: () => 
    fetchApi('/statistik/agregat'),
}

export default fetchApi