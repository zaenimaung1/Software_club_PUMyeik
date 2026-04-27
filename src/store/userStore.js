import { create } from 'zustand'
import { api } from '../api/client'

export const useUserStore = create((set, get) => ({
  admins: [],
  members: [],
  totalAdmins: 0,
  totalMembers: 0,
  adminsLoading: false,
  membersLoading: false,
  
  loadStats: async () => {
    set({ adminsLoading: true, membersLoading: true })
    try {
      const statsRes = await api('/api/users/stats', {})
      set({
        totalAdmins: Number(statsRes?.admins) || 0,
        totalMembers: Number(statsRes?.members) || 0,
        adminsLoading: false,
        membersLoading: false,
      })
    } catch (error) {
      console.error('Failed to load user stats:', error)
      set({ adminsLoading: false, membersLoading: false })
    }
  },
  
  getMemberCount: () => get().totalMembers || get().members.length,
  getAdminCount: () => get().totalAdmins || get().admins.length,
}))
