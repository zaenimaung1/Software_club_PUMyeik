import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from 'flowbite-react'
import {
  FiArrowLeft,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
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
  {id: 'admins', label: 'Admins', icon: FiUsers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

export default function Admin() {
  const navigate = useNavigate()
  const { user, token, role, logout, updateUser } = useAuthStore()
  const [section, setSection] = useState('dashboard')
  const [banner, setBanner] = useState('')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsName, setSettingsName] = useState('')
  const [settingsEmail, setSettingsEmail] = useState('')
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [adminProjectTitle, setAdminProjectTitle] = useState('')
  const [adminProjectDescription, setAdminProjectDescription] = useState('')
  const [adminProjectImages, setAdminProjectImages] = useState([])
  const [adminProjectImageNames, setAdminProjectImageNames] = useState([])
  const [adminProjectSaving, setAdminProjectSaving] = useState(false)

  const onNotify = useCallback((msg) => {
    setBanner(msg)
  }, [])

  const pendingProjects = stats?.pendingProjects ?? 0
  const latestPendingProjects = useMemo(() => stats?.latestPendingProjects ?? [], [stats])
  const isAdmin = Boolean(token) && role === 'admin'

  useEffect(() => {
    setSettingsName(user?.name ?? '')
    setSettingsEmail(user?.email ?? '')
  }, [user])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (role !== 'admin') {
      navigate('/')
    }
  }, [navigate, role, token])

  useEffect(() => {
    if (section !== 'dashboard' || !isAdmin) return
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
  }, [isAdmin, section, token])

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

  const handleSectionChange = (nextSection) => {
    setSection(nextSection)
    setBanner('')
    setSidebarOpen(false)
  }

  const saveAdminSettings = async (event) => {
    event.preventDefault()
    if (!token) return
    if (!settingsName.trim() || !settingsEmail.trim()) {
      setBanner('Name and email are required')
      return
    }
    setSettingsSaving(true)
    try {
      const data = await api('/api/users/me', {
        method: 'PATCH',
        token,
        body: {
          name: settingsName.trim(),
          email: settingsEmail.trim(),
        },
      })
      updateUser(data.user)
      setBanner('Settings updated successfully')
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleAdminProjectImages = async (event) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setBanner('Please select image files only')
      return
    }

    try {
      const dataUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)))
      setAdminProjectImages(dataUrls)
      setAdminProjectImageNames(files.map((file) => file.name))
    } catch {
      setBanner('Failed to read selected images')
    }
  }

  const submitAdminProject = async (event) => {
    event.preventDefault()
    if (!token) return
    if (!adminProjectTitle.trim() || !adminProjectDescription.trim()) {
      setBanner('Project title and description are required')
      return
    }
    if (adminProjectImages.length < 3) {
      setBanner('Please upload at least 3 project images')
      return
    }

    setAdminProjectSaving(true)
    try {
      await api('/api/projects', {
        method: 'POST',
        token,
        body: {
          title: adminProjectTitle.trim(),
          description: adminProjectDescription.trim(),
          images: adminProjectImages,
        },
      })
      setAdminProjectTitle('')
      setAdminProjectDescription('')
      setAdminProjectImages([])
      setAdminProjectImageNames([])
      setBanner('Project submitted successfully')
      setSection('projects')
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Failed to add project')
    } finally {
      setAdminProjectSaving(false)
    }
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

          <div className="rounded-2xl border border-white/15 bg-linear-to-br from-white/20 to-white/5 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-lg font-black text-slate-900 shadow-sm">
                SC
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight">Software Club</h2>
                <p className="text-sm text-violet-100/80">Admin workspace</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => {
                setSidebarOpen(false)
                navigate('/')
              }}
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Main Page
            </button>
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

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
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
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dashboard Settings</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Manage admin profile and add projects directly.
                  </p>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => handleSectionChange('settings')}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Change Name / Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSectionChange('settings')}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {section === 'members' && isAdmin ? (
            <MembersSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'events' && isAdmin ? (
            <EventsSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'projects' && isAdmin ? (
            <ProjectsSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'knowledge' && isAdmin ? (
            <GallerySection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'admins' && isAdmin ? (
            <AdminsSection token={token} onNotify={onNotify} />
          ) : null}
          {section === 'settings' && isAdmin ? (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Update your admin profile and add projects directly from here.
              </p>
              <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={saveAdminSettings}>
                <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Name
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    placeholder="Admin name"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                  <input
                    type="email"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={settingsEmail}
                    onChange={(event) => setSettingsEmail(event.target.value)}
                    placeholder="admin@example.com"
                  />
                </label>
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>

              <form className="mt-8 grid gap-4 border-t border-slate-200 pt-6 dark:border-slate-700" onSubmit={submitAdminProject}>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Project</h3>
                <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Project Title
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={adminProjectTitle}
                    onChange={(event) => setAdminProjectTitle(event.target.value)}
                    placeholder="Project title"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Description
                  <textarea
                    rows={4}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={adminProjectDescription}
                    onChange={(event) => setAdminProjectDescription(event.target.value)}
                    placeholder="Describe the project..."
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  Project Images (minimum 3)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdminProjectImages}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </label>
                {adminProjectImageNames.length ? (
                  <div className="flex flex-wrap gap-2">
                    {adminProjectImageNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div>
                  <button
                    type="submit"
                    disabled={adminProjectSaving}
                    className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {adminProjectSaving ? 'Submitting...' : 'Add Project'}
                  </button>
                </div>
              </form>
            </section>
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
