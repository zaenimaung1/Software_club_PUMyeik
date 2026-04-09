import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Blogs from './pages/Blogs'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Projects from './pages/Projects'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import MemberSettings from './pages/MemberSettings'
import NotFound from './pages/NotFound'
import { useAuthStore } from './store/authStore'
import './App.css'

function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true)
    )
    return unsub
  }, [])

  return hydrated
}

function RequireAuth({ children }) {
  const { token } = useAuthStore()
  const hydrated = useAuthHydrated()

  if (!hydrated) {
    return null
  }
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RequireAdmin({ children }) {
  const { role, token } = useAuthStore()
  const hydrated = useAuthHydrated()

  if (!hydrated) {
    return null
  }
  if (role !== 'admin' || !token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const location = useLocation()
  const hideChrome = location.pathname.startsWith('/admin')

  return (
    <div className="app-shell flex min-h-screen flex-col bg-stone-50 dark:bg-gray-900">
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <MemberSettings />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideChrome && <Footer />}
    </div>
  )
}

export default App

