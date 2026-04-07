import { useCallback, useEffect, useState } from 'react'
import { FiBookOpen, FiCalendar, FiEdit2, FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi'
import { api } from '../../api/client'

const empty = { title: '', content: '', date: '' }

export default function GallerySection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)

  const truncateText = (text, maxLength = 180) => {
    if (!text) return ''
    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}...`
      : text
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/blogs', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load knowledge posts')
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
    setForm({
      title: row.title ?? '',
      content: row.content ?? '',
      date:
        row.date ??
        (row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : ''),
    })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.date.trim()) return
    try {
      if (editingId) {
        await api(`/api/blogs/${editingId}`, {
          method: 'PATCH',
          token,
          body: {
            title: form.title.trim(),
            content: form.content.trim(),
            date: form.date.trim(),
          },
        })
        onNotify('Knowledge post updated')
      } else {
        await api('/api/blogs', {
          method: 'POST',
          token,
          body: {
            title: form.title.trim(),
            content: form.content.trim(),
            date: form.date.trim(),
          },
        })
        onNotify('Knowledge post created')
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
    if (!window.confirm('Delete this knowledge post?')) return
    try {
      await api(`/api/blogs/${id}`, { method: 'DELETE', token })
      onNotify('Knowledge post deleted')
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
         
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:from-violet-500 hover:to-purple-500"
          onClick={startCreate}
        >
          <FiPlus className="h-4 w-4" />
          Add knowledge
        </button>
      </div>

      {showForm ? (
        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90" onSubmit={save}>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit knowledge' : 'Create knowledge post'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use a clear title, short description, and publish date for every shared post.
            </p>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Title
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.title}
              onChange={(ev) =>
                setForm((f) => ({ ...f, title: ev.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Description
            <textarea
              rows={7}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.content}
              onChange={(ev) =>
                setForm((f) => ({ ...f, content: ev.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Date
            <input
              type="date"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.date}
              onChange={(ev) =>
                setForm((f) => ({ ...f, date: ev.target.value }))
              }
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white">
              Save knowledge
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
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

      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <FiBookOpen className="h-3.5 w-3.5" />
          {items.length} knowledge posts
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {items.map((row) => (
              <article
                key={String(row._id)}
                className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {row.title}
                    </h3>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {truncateText(row.content, 150)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <FiCalendar className="mr-1 inline h-3.5 w-3.5" />
                    {row.date || '-'}
                  </span>
                </div>

                <div className="mt-auto space-y-4 pt-5">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="truncate pr-4">
                      Author:{' '}
                      {typeof row.author === 'object' && row.author?.name
                        ? row.author.name
                        : '-'}
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <FiMessageSquare className="h-4 w-4" />
                      {row.comments?.length ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => startEdit(row)}
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                      onClick={() => remove(String(row._id))}
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
