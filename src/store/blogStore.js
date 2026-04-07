import { create } from 'zustand'
import { api } from '../api/client'
import { mapBlogFromApi } from '../utils/blogMap'
import { useAuthStore } from './authStore'

export const useBlogStore = create((set) => ({
  blogs: [],
  isLoading: false,
  error: null,
  loadFromApi: async () => {
    try {
      set({ isLoading: true, error: null })
      const rows = await api('/api/blogs')
      set({
        blogs: Array.isArray(rows) ? rows.map(mapBlogFromApi) : [],
        error: null,
      })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load blogs right now.',
        blogs: [],
      })
    } finally {
      set({ isLoading: false })
    }
  },
  toggleLike: async (blogId, userId) => {
    const token = useAuthStore.getState().token
    if (!token) return
    try {
      await api(`/api/blogs/${blogId}/like`, { method: 'POST', token })
      const rows = await api('/api/blogs')
      set({
        blogs: Array.isArray(rows) ? rows.map(mapBlogFromApi) : [],
        error: null,
      })
    } catch {
      set((state) => ({
        blogs: state.blogs.map((blog) => {
          if (blog.id !== blogId) return blog
          const hasLiked = blog.likes.includes(userId)
          return {
            ...blog,
            likes: hasLiked
              ? blog.likes.filter((id) => id !== userId)
              : [...blog.likes, userId],
          }
        }),
      }))
    }
  },
  addComment: async (blogId, comment) => {
    const token = useAuthStore.getState().token
    if (!token) return
    try {
      await api(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        token,
        body: { text: comment.text },
      })
      const rows = await api('/api/blogs')
      set({
        blogs: Array.isArray(rows) ? rows.map(mapBlogFromApi) : [],
        error: null,
      })
    } catch {
      set((state) => ({
        blogs: state.blogs.map((blog) => {
          if (blog.id !== blogId) return blog
          return {
            ...blog,
            comments: [...blog.comments, comment],
          }
        }),
      }))
    }
  },
}))
