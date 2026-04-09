import { create } from 'zustand'
import { api } from '../api/client'

export const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: '',
  loadApprovedProjects: async () => {
    set({ isLoading: true, error: '' })
    try {
      const rows = await api('/api/projects')
      set({
        projects: Array.isArray(rows) ? rows : [],
        isLoading: false,
        error: '',
      })
    } catch (error) {
      set({
        projects: [],
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load projects right now.',
      })
    }
  },
  toggleLike: async (projectId) => {
    const project = get().projects.find(p => String(p._id) === projectId)
    if (!project) return

    set({
      projects: get().projects.map(p => 
        String(p._id) === projectId 
          ? { ...p, likes: project.likes.length + 1, userHasLiked: !project.userHasLiked }
          : p
      )
    })

    try {
      await api(`/api/projects/${projectId}/like`, { method: 'POST' })
    } catch (error) {
      // Rollback optimistic update
      set({
        projects: get().projects.map(p => 
          String(p._id) === projectId 
            ? { ...p, likes: project.likes.length, userHasLiked: project.userHasLiked }
            : p
        )
      })
    }
  },
  addComment: async (projectId, text, parentId = null) => {
    try {
      const result = await api(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        body: { text, parentId }
      })
      // Update first project with new comments
      set({
        projects: get().projects.map(p => 
          String(p._id) === projectId ? { ...p, comments: result.comments } : p
        )
      })
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }
}))

