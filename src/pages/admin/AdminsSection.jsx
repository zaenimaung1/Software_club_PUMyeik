import { useCallback, useEffect, useState } from 'react'
import { FiEdit2, FiLock, FiPlus, FiShield, FiTrash2 } from 'react-icons/fi'
import { api } from '../../api/client'

const empty = { name: '', email: '', password: '' }

export default function AdminsSection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/users/admins', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load admins')
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
    setForm({ name: row.name, email: row.email, password: '' })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    try {
      if (editingId) {
        const body = {
          name: form.name.trim(),
          email: form.email.trim(),
        }
        if (form.password.trim()) body.password = form.password.trim()
        await api(`/api/users/admins/${editingId}`, {
          method: 'PATCH',
          token,
          body,
        })
        onNotify('Admin updated')
      } else {
        if (!form.password.trim()) {
          onNotify('Password is required for new admins')
          return
        }
        await api('/api/users/admins', {
          method: 'POST',
          token,
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
          },
        })
        onNotify('Admin created')
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
    if (!window.confirm('Delete this admin account?')) return
    try {
      await api(`/api/users/admins/${id}`, { method: 'DELETE', token })
      onNotify('Admin deleted')
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-end">
        
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:from-violet-500 hover:to-purple-500"
          onClick={startCreate}
        >
          <FiPlus className="h-4 w-4" />
          Add admin
        </button>
      </div>

      {showForm ? (
        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 lg:grid-cols-2" onSubmit={save}>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit admin' : 'Create admin'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keep admin accounts secure and limited to trusted club leaders.
            </p>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Name
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.name}
              onChange={(ev) =>
                setForm((f) => ({ ...f, name: ev.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Email
            <input
              type="email"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.email}
              onChange={(ev) =>
                setForm((f) => ({ ...f, email: ev.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 lg:col-span-2">
            {editingId ? 'New password (optional)' : 'Password'}
            <input
              type="password"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.password}
              onChange={(ev) =>
                setForm((f) => ({ ...f, password: ev.target.value }))
              }
              placeholder={editingId ? 'Leave blank to keep current password' : 'Create a secure password'}
            />
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white">
              Save admin
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
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
          <FiShield className="h-3.5 w-3.5" />
          {items.length} admin accounts
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {items.map((row) => (
              <article key={String(row._id)} className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-bold text-white">
                    {row.name?.trim()?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{row.name}</h3>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{row.email}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                    Admin
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <FiLock className="h-4 w-4" />
                  <span>Secure access to dashboard controls</span>
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
