import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'

const empty = { title: '', content: '' }

export default function BlogsSection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/blogs', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }, [token, onNotify])

  useEffect(() => {
    load()
  }, [load])

  const startCreate = () => {
    setEditingId(null)
    setForm(empty)
    setShowForm(true)
  }

  const startEdit = (row) => {
    setEditingId(String(row._id))
    setForm({ title: row.title, content: row.content })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    try {
      if (editingId) {
        await api(`/api/blogs/${editingId}`, {
          method: 'PATCH',
          token,
          body: {
            title: form.title.trim(),
            content: form.content.trim(),
          },
        })
        onNotify('Blog updated')
      } else {
        await api('/api/blogs', {
          method: 'POST',
          token,
          body: {
            title: form.title.trim(),
            content: form.content.trim(),
          },
        })
        onNotify('Blog created')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(empty)
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this blog post?')) return
    try {
      await api(`/api/blogs/${id}`, { method: 'DELETE', token })
      onNotify('Blog deleted')
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="admin-crud">
      <div className="admin-crud-toolbar">
        <h2>Blogs</h2>
        <button type="button" className="button primary" onClick={startCreate}>
          Add blog post
        </button>
      </div>

      {showForm ? (
        <form className="admin-form-card" onSubmit={save}>
          <h3>{editingId ? 'Edit blog' : 'New blog post'}</h3>
          <label>
            Title
            <input
              value={form.title}
              onChange={(ev) =>
                setForm((f) => ({ ...f, title: ev.target.value }))
              }
            />
          </label>
          <label>
            Content
            <textarea
              rows={8}
              value={form.content}
              onChange={(ev) =>
                setForm((f) => ({ ...f, content: ev.target.value }))
              }
            />
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="button primary">
              Save
            </button>
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setForm(empty)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={String(row._id)}>
                  <td>{row.title}</td>
                  <td>
                    {typeof row.author === 'object' && row.author?.name
                      ? row.author.name
                      : '—'}
                  </td>
                  <td>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="button ghost small"
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button ghost small danger"
                      onClick={() => remove(String(row._id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
