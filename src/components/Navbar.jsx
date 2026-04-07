import { NavLink, useLocation } from 'react-router-dom'
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react'
import { useAuthStore } from '../store/authStore'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/blogs', label: 'Blogs', end: false },
  { to: '/events', label: 'Events', end: false },
  { to: '/gallery', label: 'Knowledge', end: false },
]

export default function SiteNavbar() {
  const { role, user, logout } = useAuthStore()
  const { pathname } = useLocation()

  const userInitial =
    user?.name?.trim()?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <Navbar fluid rounded className="border-0">
        <NavbarBrand as={NavLink} to="/">
          <span className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-cyan-600 text-sm font-bold text-white">
            SC
          </span>
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Software Club
          </span>
          <span className="hidden text-xs font-normal text-gray-500 sm:inline dark:text-gray-400">
            &nbsp;| Build, share, ship
          </span>
        </NavbarBrand>

        <div className="flex items-center gap-2 md:order-2">
          {user ? (
            <>
              <NavLink
                to="/settings"
                className="hidden items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-900 dark:text-orange-100">
                    {userInitial}
                  </span>
                )}
                <span>{user.name}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              Login
            </NavLink>
          )}
          <NavbarToggle />
        </div>

        <NavbarCollapse>
          {links.map(({ to, label, end }) => (
            <NavbarLink
              key={to}
              as={NavLink}
              to={to}
              end={end}
              active={end ? pathname === to : pathname.startsWith(to)}
            >
              {label}
            </NavbarLink>
          ))}
          {user && (
            <NavbarLink as={NavLink} to="/settings" active={pathname.startsWith('/settings')}>
              Settings
            </NavbarLink>
          )}
          {role === 'admin' && (
            <NavbarLink
              as={NavLink}
              to="/admin"
              active={pathname.startsWith('/admin')}
            >
              Admin
            </NavbarLink>
          )}
        </NavbarCollapse>
      </Navbar>
    </header>
  )
}
