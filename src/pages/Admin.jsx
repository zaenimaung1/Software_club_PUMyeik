import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'flowbite-react'
import {
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'
import MembersSection from './admin/MembersSection'
import EventsSection from './admin/EventsSection'
import GallerySection from './admin/GallerySection'
import AdminsSection from './admin/AdminsSection'
import ProjectsSection from './admin/ProjectsSection'

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'members', label: 'Members', icon: FiUsers },
  { id: 'events', label: 'Events', icon: FiCalendar },
  { id: 'projects', label: 'Projects', icon: FiLayers },
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const onNotify = useCallback((msg) => {
    setBanner(msg)
  }, [])

  const pendingProjects = stats?.pendingProjects ?? 0
  const latestPendingProjects = useMemo(() => stats?.latestPendingProjects ?? [], [stats])

  useEffect(() => {
    if (section !== 'dashboard' || !token) return
    let cancelled = false
    setStatsLoading(true)
    ;(async () => {
      try {
        const [members, admins, events, blogs, projects] = await Promise.all([
          api('/api/users/members', { token }),
          api('/api/users/admins', { token }),
          api('/api/events'),
          api('/api/blogs'),
          api('/api/projects/admin/all', { token }),
        ])

        if (!cancelled) {
          const projectRows = Array.isArray(projects) ? projects : []
          const approvedProjects = projectRows.filter((project) => project.status === 'approved')
          const pending = projectRows.filter((project) => project.status === 'pending')

          setStats({
            members: members.length,
            admins: admins.length,
            events: events.length,
            knowledge: blogs.length,
            approvedProjects: approvedProjects.length,
            pendingProjects: pending.length,
            latestPendingProjects: pending.slice(0, 3),
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

  useEffect(() => {
    if (!sidebarOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    setSidebarOpen(false)
    logout()
    navigate('/login')
  }

  const initial =
    user?.name?.trim()?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    'A'

  const handleSectionChange = (nextSection) => {
    setSection(nextSection)
    setBanner('')
    setSidebarOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#eef0f8] px-3 py-3 text-slate-900 dark:bg-gray-950 dark:text-white sm:px-4 lg:px-5 lg:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] gap-4 rounded-[32px] bg-[#f7f8fc] p-3 shadow-[0_28px_80px_rgba(76,29,149,0.14)] dark:bg-slate-950 lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          id="admin-mobile-sidebar"
          className={`fixed inset-y-3 left-3 z-40 flex w-[min(86vw,320px)] flex-col gap-6 rounded-[28px] bg-gradient-to-b from-violet-700 via-purple-700 to-indigo-700 p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out lg:static lg:w-auto lg:translate-x-0 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-[115%]'
          }`}
          aria-label="Admin sidebar"
        >
          <div className="flex items-center justify-end lg:hidden">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

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
              const badge = s.id === 'projects' && pendingProjects ? pendingProjects : 0
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? 'bg-white/18 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)]'
                      : 'text-violet-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => handleSectionChange(s.id)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{s.label}</span>
                  {badge ? (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {badge}
                    </span>
                  ) : null}
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
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 lg:hidden"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
                aria-controls="admin-mobile-sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {section === 'dashboard'
                    ? `Welcome, ${user?.name?.split(' ')[0] ?? 'Admin'}`
                    : SECTIONS.find((s) => s.id === section)?.label}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {section === 'dashboard'
                    ? 'Manage members, knowledge, and member projects from one control center.'
                    : 'Review and manage club data with a cleaner dashboard workflow.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label={`Notifications${pendingProjects ? `, ${pendingProjects} pending projects` : ''}`}
                onClick={() => handleSectionChange('projects')}
              >
                <FiBell className="h-4 w-4" />
                {pendingProjects ? (
                  <span className="absolute right-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {pendingProjects}
                  </span>
                ) : null}
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {[
                  ['Total Members', stats?.members, 'from-violet-600 to-purple-600'],
                  ['Total Admins', stats?.admins, 'from-sky-500 to-cyan-500'],
                  ['Total Events', stats?.events, 'from-amber-400 to-orange-500'],
                  ['Knowledge Posts', stats?.knowledge, 'from-emerald-500 to-teal-500'],
                  ['Approved Projects', stats?.approvedProjects, 'from-fuchsia-500 to-pink-500'],
                
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

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Pending project notifications
                    </h2>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                      {statsLoading ? '...' : pendingProjects}
                    </span>
                  </div>
                  {latestPendingProjects.length ? (
                    <div className="mt-4 space-y-3">
                      {latestPendingProjects.map((project) => (
                        <button
                          key={String(project._id)}
                          type="button"
                          className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900"
                          onClick={() => handleSectionChange('projects')}
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {project.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {project.submitter?.name ?? 'Member'} submitted a project for review.
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatDate(project.createdAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      No pending project reviews right now.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {section === 'members' && token ? (
            <MembersSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'events' && token ? (
            <EventsSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'projects' && token ? (
            <ProjectsSection token={token} onNotify={onNotify} />
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

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString()
}

