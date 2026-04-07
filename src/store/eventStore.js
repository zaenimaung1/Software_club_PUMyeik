import { create } from 'zustand'
import { api } from '../api/client'
import { mapEventFromApi } from '../utils/eventMap'

export const useEventStore = create((set) => ({
  events: [],
  isLoading: false,
  error: null,
  loadFromApi: async () => {
    try {
      set({ isLoading: true, error: null })
      const rows = await api('/api/events')
      if (Array.isArray(rows)) {
        set({ events: rows.map(mapEventFromApi) })
      }
    } catch {
      set({ error: 'Unable to load events right now.', events: [] })
    } finally {
      set({ isLoading: false })
    }
  },
}))
