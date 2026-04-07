import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: 'guest',
      /** @param {{ user: { id: string, name: string, email: string, role: string, photo?: string, gender?: string, batch?: string }, token: string }} payload */
      login: (payload) =>
        set({
          user: payload.user,
          token: payload.token,
          role: payload.user.role,
        }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
          role: user.role ?? state.role,
        })),
      logout: () => set({ user: null, token: null, role: 'guest' }),
    }),
    {
      name: 'software-club-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
      }),
    }
  )
)
