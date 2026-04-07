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

      <section className="journal-list">
        {isLoading ? (
          [0, 1, 2].map((item) => (
            <article key={item} className="journal-entry skeleton-card">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </article>
          ))
        ) : error ? (
          <p className="muted">{error}</p>
        ) : blogs.length ? (
          blogs.map((blog) => {
            const isExpanded = Boolean(expanded[blog.id])
            const isLong = blog.content.length > 260
            return (
              <article key={blog.id} className="journal-entry">
                <div className="journal-entry__top">
                  <div>
                    <p className="journal-entry__meta">
                      <span>{blog.author}</span>
                      <span>{blog.createdAt}</span>
                    </p>
                    <h2>{blog.title}</h2>
                  </div>
                  <div className="journal-entry__actions">
                    <button
                      className="button ghost"
                      type="button"
                      disabled={!canLike}
                      onClick={() => user && toggleLike(blog.id, user.id)}
                    >
                      {'\u2665'} {blog.likes.length}
                    </button>
                    <span className="pill">{blog.comments.length} comments</span>
                  </div>
                </div>

                <div className="journal-entry__body">
                  <p>{isExpanded ? blog.content : truncateText(blog.content)}</p>
                  {isLong ? (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => toggleExpanded(blog.id)}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  ) : null}
                </div>

                {blog.comments.length ? (
                  <div className="journal-comments">
                    {blog.comments.map((comment) => (
                      <div key={comment.id} className="journal-comment">
                        <strong>{comment.user}</strong>
                        <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {canComment ? (
                  <div className="comment-form comment-form--inline">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={drafts[blog.id] || ''}
                      onChange={(event) =>
                        handleCommentChange(blog.id, event.target.value)
                      }
                    />
                    <button
                      className="button primary"
                      type="button"
                      onClick={() => handleCommentSubmit(blog.id)}
                    >
                      Post
                    </button>
                  </div>
                ) : (
                  <p className="muted">
                    Log in as a member or admin to comment on posts.
                  </p>
                )}
              </article>
            )
          })
        ) : (
          <p className="muted">No blog posts yet.</p>
        )}
      </section>
    </main>
  )
}
