import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useBlogStore } from '../store/blogStore'

export default function Gallery() {
  const { blogs, isLoading, error, loadFromApi } = useBlogStore()
  const [expanded, setExpanded] = useState({})

  const truncateText = (text, maxLength = 220) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

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

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <main className="page">
      <section className="page-hero page-hero--simple">
        <div>
          <span className="eyebrow">Knowledge Sharing</span>
          <h1>Admin knowledge for all members</h1>
          <p>
            Tutorials, notes, and updates shared by admins in a simpler reading
            layout for the whole club.
          </p>
        </div>
      </section>

      <section className="journal-list journal-list--knowledge">
        {isLoading ? (
          <p className="muted">Loading knowledge posts...</p>
        ) : error ? (
          <p className="muted">{error}</p>
        ) : blogs.length ? (
          blogs.map((item) => {
            const isExpanded = Boolean(expanded[item.id])
            const isLong = item.content.length > 220
            return (
              <article key={item.id} className="journal-entry">
                <div className="journal-entry__top">
                  <div>
                    <p className="journal-entry__meta">
                      <span>{item.author}</span>
                      <span>{item.createdAt}</span>
                    </p>
                    <h2>{item.title}</h2>
                  </div>
                  <div className="journal-entry__actions journal-entry__actions--quiet">
                    <span>{item.likes.length} reactions</span>
                    <span>{item.comments.length} comments</span>
                  </div>
                </div>

                <div className="journal-entry__body">
                  <p>{isExpanded ? item.content : truncateText(item.content)}</p>
                  {isLong ? (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  ) : null}
                </div>

                <div className="journal-entry__footer">
                  <NavLink className="button ghost" to="/blogs">
                    Open discussion
                  </NavLink>
                </div>
              </article>
            )
          })
        ) : (
          <p className="muted">No knowledge posts yet.</p>
        )}
      </section>
    </main>
  )
}
