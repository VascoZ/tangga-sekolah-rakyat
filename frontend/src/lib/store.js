import { create } from 'zustand'

const useAsesmenStore = create((set, get) => ({
  sesiAktif: null,
  loading: false,
  error: null,
  
  mulaiAsesmen: async (siswaId, jenis) => {
    set({ loading: true, error: null })
    try {
      const { mulai } = await import('./api').then(m => m.asesmenApi)
      const data = await mulai(siswaId, jenis)
      set({ sesiAktif: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
  
  jawab: async (jawaban, jawabanSiswa = null) => {
    const { sesiAktif } = get()
    if (!sesiAktif) throw new Error('Tidak ada sesi aktif')
    
    set({ loading: true, error: null })
    try {
      const { jawab } = await import('./api').then(m => m.asesmenApi)
      const data = await jawab(sesiAktif.asesmen_id, sesiAktif.item_ke, jawaban, jawabanSiswa)
      
      if (data.status === 'selesai') {
        set({ sesiAktif: { ...sesiAktif, selesai: true, hasil: data.hasil }, loading: false })
      } else if (data.status === 'lanjut_tingkat') {
        set({ 
          sesiAktif: { 
            ...sesiAktif, 
            tingkat_saat_ini: data.tingkat_baru,
            items: data.items,
            item_ke: 0,
          }, 
          loading: false 
        })
      } else {
        set({ 
          sesiAktif: { ...sesiAktif, item_ke: sesiAktif.item_ke + 1 }, 
          loading: false 
        })
      }
      
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
  
  reset: () => set({ sesiAktif: null, loading: false, error: null }),
}))

export { useAsesmenStore }