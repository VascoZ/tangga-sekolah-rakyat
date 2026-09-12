import { create } from 'zustand'
import { asesmenApi } from './api'

const useAsesmenStore = create((set, get) => ({
  sesiAktif: null,
  loading: false,
  error: null,
  
  mulaiAsesmen: async (siswaId, jenis) => {
    set({ loading: true, error: null })
    try {
      const data = await asesmenApi.mulai(siswaId, jenis)
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
      const data = await asesmenApi.jawab(sesiAktif.asesmen_id, sesiAktif.item_ke, jawaban, jawabanSiswa)
      
      if (data.status === 'selesai') {
        set({ sesiAktif: { ...sesiAktif, selesai: true, hasil: data.hasil }, loading: false })
      } else if (data.status === 'lanjut_tingkat') {
        set({
          sesiAktif: {
            ...sesiAktif,
            tingkat_saat_ini: data.tingkat_baru,
            tingkat_label: data.tingkat_label,
            items: data.items,
            instruksi_guru: data.instruksi_guru,
            item_ke: 0,
          },
          loading: false
        })
      } else {
        set({
          sesiAktif: { ...sesiAktif, item_ke: data.item_ke },
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