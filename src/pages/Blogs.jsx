import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useBlogStore } from '../store/blogStore'

export default function Blogs() {
  const { role, user } = useAuthStore()
  const { blogs, isLoading, error, toggleLike, addComment, loadFromApi } =
    useBlogStore()
  const [drafts, setDrafts] = useState({})
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    loadFromApi()

    const refresh = () => {
      loadFromApi()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [loadFromApi])

  const handleCommentChange = (id, value) => {
    setDrafts((prev) => ({ ...prev, [id]: value }))
  }

  const handleCommentSubmit = async (id) => {
    const text = drafts[id]?.trim()
    if (!text || !user) return
    await addComment(id, {
      id: `c-${Date.now()}`,
      user: user.name,
      text,
    })
    setDrafts((prev) => ({ ...prev, [id]: '' }))
  }

  const canComment = role === 'member' || role === 'admin'
  const canLike = role === 'member' || role === 'admin'

  const truncateText = (text, maxLength = 260) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <main className="page">
      <section className="page-hero page-hero--simple">
        <div>
          <span className="eyebrow">Blogs</span>
          <h1>Club blogs and announcements</h1>
          <p>
            Read updates from the admins in a cleaner reading layout. Members
            can react and comment on each post.
          </p>
        </div>
      </section>

     
    </main>
  )
}
