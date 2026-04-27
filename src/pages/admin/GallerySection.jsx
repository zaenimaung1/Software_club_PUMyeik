import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiBookOpen,
  FiCalendar,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { api } from '../../api/client'

const emptyForm = { title: '', content: '', date: '' }

export default function GallerySection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const truncateText = (text, maxLength = 240) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/blogs', { token })
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load knowledge posts')
    } finally {
      setLoading(false)
    }
  }, [token, onNotify])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(emptyForm)
  }

  const addSharing = async (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.content.trim() || !form.date.trim()) {
      onNotify('Title, description, and date are required')
      return
    }

    setSaving(true)
    try {
      await api('/api/blogs', {
        method: 'POST',
        token,
        body: {
          title: form.title.trim(),
          content: form.content.trim(),
          date: form.date,
        },
      })
      onNotify('Sharing added successfully')
      closeForm()
      await load()
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Failed to add sharing')
    } finally {
      setSaving(false)
    }
  }

  const removeSharing = async (id) => {
    if (!window.confirm('Delete this sharing item?')) return

    try {
      await api(`/api/blogs/${id}`, { method: 'DELETE', token })
      onNotify('Sharing deleted successfully')
      await load()
    } catch (error) {
      onNotify(error instanceof Error ? error.message : 'Failed to delete sharing')
    }
  }

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return items

    return items.filter((row) => {
      const author =
        typeof row.author === 'object' && row.author?.name
          ? row.author.name
          : typeof row.author === 'string'
            ? row.author
            : ''

      return (
        row.title?.toLowerCase().includes(query) ||
        row.content?.toLowerCase().includes(query) ||
        row.date?.toLowerCase().includes(query) ||
        author.toLowerCase().includes(query)
      )
    })
  }, [items, searchTerm])

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <FiBookOpen className="h-3.5 w-3.5" />
            {filteredItems.length} posts
            {searchTerm.trim() ? ` (filtered from ${items.length})` : ''}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:w-80">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by author, title, or date"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Search knowledge posts"
              />
            </label>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:from-violet-500 hover:to-purple-500"
            >
              <FiPlus className="h-4 w-4" />
              Add Sharing
            </button>
          </div>
        </div>

        {showForm ? (
          <form
            className="mt-5 grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            onSubmit={addSharing}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Sharing</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a knowledge post with title, description, date, and author.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Close add sharing form"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Author
              <input
                type="text"
                value="Current admin account"
                disabled
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Title
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="What is Docker?"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Description
              <textarea
                rows={6}
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Write the sharing description..."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Sharing'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            No sharing posts found.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filteredItems.map((row) => (
              <article
                key={String(row._id)}
                className="flex h-full min-h-[280px] flex-col rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {row.title}
                    </h3>
                    <p className="mt-3 min-h-[96px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {truncateText(row.content)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <FiCalendar className="mr-1 inline h-3.5 w-3.5" />
                    {row.date || '-'}
                  </span>
                </div>

                <div className="mt-auto space-y-4 pt-5">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="inline-flex min-w-0 flex-1 items-center gap-2 truncate pr-4">
                      <FiUser className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {typeof row.author === 'object' && row.author?.name
                          ? row.author.name
                          : typeof row.author === 'string'
                            ? row.author
                            : '-'}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <FiMessageSquare className="h-4 w-4" />
                      {row.comments?.length ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSharing(String(row._id))}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
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
