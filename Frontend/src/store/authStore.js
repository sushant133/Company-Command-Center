import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hydrated: false,
      isRefreshing: false,

      setSession: ({ accessToken, refreshToken, user }) => {
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
        }
        set({
          accessToken,
          refreshToken,
          user,
        })
      },

      setTokens: ({ accessToken, refreshToken }) => {
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken)
        }
        set({
          accessToken,
          refreshToken,
        })
      },

      clearSession: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('auth-store')
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        })
      },

      setUser: (user) => {
        set((state) => ({
          ...state,
          user,
        }))
      },

      setRefreshing: (isRefreshing) => set({ isRefreshing }),

      setHydrated: (hydrated) => {
        set({ hydrated })
      },

      refreshAccessToken: async () => {
        const { refreshToken, setTokens, setRefreshing } = get()
        if (!refreshToken) return false

        try {
          setRefreshing(true)
          const response = await authAPI.refresh()
          setTokens(response)
          return true
        } catch {
          get().clearSession()
          return false
        } finally {
          setRefreshing(false)
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
