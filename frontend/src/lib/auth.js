import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      peran: null,
      token: null,
      
      login: (userData, peran, token) => {
        set({ user: userData, peran, token })
      },
      
      logout: () => {
        set({ user: null, peran: null, token: null })
      },
      
      isAuthenticated: () => {
        return get().token !== null
      },
      
      getPeran: () => {
        return get().peran
      },
    }),
    {
      name: 'tangga-auth',
    }
  )
)

export { useAuthStore }