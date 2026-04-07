import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'flowbite-react'
import {
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiGrid,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiUsers,
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'
import MembersSection from './admin/MembersSection'
import EventsSection from './admin/EventsSection'
import GallerySection from './admin/GallerySection'
import AdminsSection from './admin/AdminsSection'

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'members', label: 'Members', icon: FiUsers },
  { id: 'events', label: 'Events', icon: FiCalendar },
  { id: 'knowledge', label: 'Knowledge Sharing', icon: FiBookOpen },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

export default function Admin() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [section, setSection] = useState('dashboard')
  const [banner, setBanner] = useState('')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [search, setSearch] = useState('')

  const onNotify = useCallback((msg) => {
    setBanner(msg)
  }, [])

  useEffect(() => {
    if (section !== 'dashboard' || !token) return
    let cancelled = false
    setStatsLoading(true)
    ;(async () => {
      try {
        const [members, admins, events, blogs] = await Promise.all([
          api('/api/users/members', { token }),
          api('/api/users/admins', { token }),
          api('/api/events'),
          api('/api/blogs'),
        ])
        if (!cancelled) {
          setStats({
            members: members.length,
            admins: admins.length,
            events: events.length,
            knowledge: blogs.length,
          })
        }
      } catch (e) {
        if (!cancelled) {
          setStats(null)
          setBanner(e instanceof Error ? e.message : 'Could not load stats')
        }
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [section, token])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial =
    user?.name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'A'

  return (
    <main className="min-h-screen bg-[#eef0f8] px-3 py-3 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] gap-4 rounded-[32px] bg-[#f7f8fc] p-3 shadow-[0_28px_80px_rgba(76,29,149,0.14)] dark:bg-slate-950 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">
        <aside className="flex flex-col gap-6 rounded-[28px] bg-gradient-to-b from-violet-700 via-purple-700 to-indigo-700 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-violet-700 shadow-sm">
              SC
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">Software Club</h2>
              <p className="text-sm text-violet-100/80">Admin workspace</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/8 px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-base font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="truncate text-xs text-violet-100/75">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Admin sections">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = section === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? 'bg-white/18 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]'
                      : 'text-violet-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => {
                    setSection(s.id)
                    setBanner('')
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </nav>

          <button
            type="button"
            className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            onClick={handleLogout}
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <section className="flex min-w-0 flex-col gap-4 rounded-[28px] bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5 lg:p-6">
          <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {section === 'dashboard'
                  ? `Welcome, ${user?.name?.split(' ')[0] ?? 'Admin'}`
                  : SECTIONS.find((s) => s.id === section)?.label}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {section === 'dashboard'
                  ? 'A cleaner control center for your club operations.'
                  : 'Manage data with a more polished dashboard workflow.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex min-w-[260px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <FiSearch className="h-4 w-4" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search members, posts, or events"
                  className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
                />
              </label>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Notifications"
              >
                <FiBell className="h-4 w-4" />
              </button>
            </div>
          </header>

          {banner ? (
            <Alert color="info" role="status" className="rounded-2xl border-cyan-200">
              <span className="font-medium">{banner}</span>
            </Alert>
          ) : null}

          {section === 'dashboard' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Total Members', stats?.members, 'from-violet-600 to-purple-600'],
                  ['Total Admins', stats?.admins, 'from-sky-500 to-cyan-500'],
                  ['Total Events', stats?.events, 'from-amber-400 to-orange-500'],
                  ['Knowledge Posts', stats?.knowledge, 'from-emerald-500 to-teal-500'],
                ].map(([label, value, gradient]) => (
                  <article
                    key={label}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {label}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                        {statsLoading ? '...' : value ?? '-'}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dashboard notes
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Use the sidebar to manage members, events, knowledge sharing posts,
                  and admin accounts. The members screen has been refreshed to feel
                  closer to a modern club operations dashboard.
                </p>
              </div>
            </>
          ) : null}

          {section === 'members' && token ? (
            <MembersSection token={token} onNotify={onNotify} searchTerm={search} />
          ) : null}
          {section === 'events' && token ? (
            <EventsSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'knowledge' && token ? (
            <GallerySection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'settings' && token ? (
            <AdminsSection token={token} onNotify={onNotify} />
          ) : null}
        </section>
      </div>
    </main>
  )
}
