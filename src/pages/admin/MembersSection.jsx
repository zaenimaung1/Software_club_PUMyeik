import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiMail, FiPlus, FiTrash2, FiUsers,  } from 'react-icons/fi'
import { api } from '../../api/client'

const empty = { name: '', email: '', password: '', gender: '', batch: '' }

export default function MembersSection({ token, onNotify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [batchFilter, setBatchFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api('/api/users/members', { token })
      setItems(data)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [token, onNotify])

  useEffect(() => {
    load()
  }, [load])

  const batches = useMemo(() => {
    const values = Array.from(
      new Set(items.map((item) => item.batch).filter(Boolean))
    )
    return values.sort((a, b) => a.localeCompare(b))
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesBatch = batchFilter === 'all' || (item.batch || '') === batchFilter
      return matchesBatch
    })
  }, [items, batchFilter])

  const startCreate = () => {
    setEditingId(null)
    setForm(empty)
    setShowForm(true)
  }

  const startEdit = (row) => {
    setEditingId(String(row._id))
    setForm({
      name: row.name ?? '',
      email: row.email ?? '',
      password: '',
      gender: row.gender ?? '',
      batch: row.batch ?? '',
    })
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
          gender: form.gender.trim(),
          batch: form.batch.trim(),
        }
        if (form.password.trim()) body.password = form.password.trim()
        await api(`/api/users/members/${editingId}`, {
          method: 'PATCH',
          token,
          body,
        })
        onNotify('Member updated')
      } else {
        if (!form.password.trim()) {
          onNotify('Password is required for new members')
          return
        }
        await api('/api/users/members', {
          method: 'POST',
          token,
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            gender: form.gender.trim(),
            batch: form.batch.trim(),
          },
        })
        onNotify('Member created')
      }
      setShowForm(false)
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this member?')) return
    try {
      await api(`/api/users/members/${id}`, { method: 'DELETE', token })
      onNotify('Member deleted')
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
          Add Member
        </button>
      </div>

      {showForm ? (
        <form className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 lg:grid-cols-2" onSubmit={save}>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Edit member' : 'Create member'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keep the profile complete so the members dashboard stays clean.
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
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Gender
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.gender}
              onChange={(ev) =>
                setForm((f) => ({ ...f, gender: ev.target.value }))
              }
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Batch
            <input
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={form.batch}
              onChange={(ev) =>
                setForm((f) => ({ ...f, batch: ev.target.value }))
              }
              placeholder="Batch 2025"
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
              placeholder={editingId ? 'Leave blank to keep current password' : 'Create a password'}
            />
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white">
              Save member
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
           <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    <FiUsers className="h-3.5 w-3.5" />
                    {filteredItems.length} Members
                  </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Filtrer par
            </label>
            <select
              value={batchFilter}
              onChange={(event) => setBatchFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">Batch</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Searching all members
            </div>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Membre</th>
                    <th className="px-5 py-4">Gender</th>
                    <th className="px-5 py-4">Batch</th>
                    <th className="px-5 py-4">Adresse e-mail</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((row, index) => (
                    <tr key={String(row._id)} className="border-t border-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-xs font-bold text-white">
                            {row.name?.trim()?.[0]?.toUpperCase() ?? 'M'}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                            <p className="text-xs text-slate-400">Member profile</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{row.gender || '-'}</td>
                      <td className="px-5 py-4">{row.batch || '-'}</td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <FiMail className="h-4 w-4 text-slate-400" />
                          <span>{row.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
