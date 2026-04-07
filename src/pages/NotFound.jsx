import { NavLink } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="page not-found">
      <div>
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <NavLink className="button primary" to="/">
          Back to home
        </NavLink>
      </div>
    </main>
  )
}
