import { useCallback, useEffect, useState } from 'react'
import { FiCalendar, FiEdit2, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi'
import { api } from '../../api/client'

const empty = { title: '', description: '', date: '', location: '' }

export default function EventsSection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/events', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load events')
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
      title: row.title,
      description: row.description,
      date: row.date,
      location: row.location,
    })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date.trim() ||
      !form.location.trim()
    )
      return
    try {
      if (editingId) {
        await api(`/api/events/${editingId}`, {
          method: 'PATCH',
          token,
          body: {
            title: form.title.trim(),
            description: form.description.trim(),
            date: form.date.trim(),
            location: form.location.trim(),
          },
        })
        onNotify('Event updated')
      } else {
        await api('/api/events', {
          method: 'POST',
          token,
          body: {
            title: form.title.trim(),
            description: form.description.trim(),
            date: form.date.trim(),
            location: form.location.trim(),
          },
        })
        onNotify('Event created')
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
    if (!window.confirm('Delete this event?')) return
    try {
      await api(`/api/events/${id}`, { method: 'DELETE', token })
      onNotify('Event deleted')
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-end">
        
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:from-violet-500 hover:to-purple-500"
          onClick={startCreate}
        >
          <FiPlus className="h-4 w-4" />
          Add event
        </button>
      </div>

      {showForm ? (
        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 lg:grid-cols-2" onSubmit={save}>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit event' : 'Create event'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Give each event a clear title, date, and place so members know where to join.
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
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 lg:col-span-2">
            Description
            <textarea
              rows={4}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.description}
              onChange={(ev) =>
                setForm((f) => ({ ...f, description: ev.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 lg:col-span-2">
            Location
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.location}
              onChange={(ev) =>
                setForm((f) => ({ ...f, location: ev.target.value }))
              }
            />
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white">
              Save event
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
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          <FiCalendar className="h-3.5 w-3.5" />
          {items.length} planned events
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {items.map((row) => (
              <article key={String(row._id)} className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{row.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{row.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <FiCalendar className="mr-1 inline h-3.5 w-3.5" />
                    {row.date || '-'}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <FiMapPin className="h-4 w-4" />
                  <span>{row.location}</span>
                </div>
                <div className="mt-5 flex justify-end gap-2">
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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
