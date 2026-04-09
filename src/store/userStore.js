import { create } from 'zustand'
import { api } from '../api/client'

export const useUserStore = create((set, get) => ({
  admins: [],
  members: [],
  adminsLoading: false,
  membersLoading: false,
  
  loadStats: async () => {
    set({ adminsLoading: true, membersLoading: true })
    try {
      const [adminsRes, membersRes] = await Promise.all([
        api('/api/users/admins', {}),
        api('/api/users/members', {})
      ])
      set({
        admins: adminsRes,
        members: membersRes,
        adminsLoading: false,
        membersLoading: false,
      })
    } catch (error) {
      console.error('Failed to load user stats:', error)
      set({ adminsLoading: false, membersLoading: false })
    }
  },
  
  getMemberCount: () => get().members.length,
  getAdminCount: () => get().admins.length,
}))
