import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Alert, Button, Card, Label, Progress, TextInput } from 'flowbite-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) return
    setLoading(true)
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { email: email.trim(), password },
      })
      login({
        token: data.token,
        user: {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          photo: data.user.photo ?? '',
          gender: data.user.gender ?? '',
          batch: data.user.batch ?? '',
          role: data.user.role,
        },
      })
      navigate(data.user.role === 'admin' ? '/admin' : '/settings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(password)
  const strengthLabel = ['Too weak', 'Weak', 'Good', 'Strong'][strength]
  const progress = (strength / 3) * 100

  return (
    <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Authentication
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-gray-900 dark:text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Sign in with your club account. Members go to Settings first, while admins go to Admin.
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            New here?{' '}
            <NavLink
              className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
              to="/register"
            >
              Create an account
            </NavLink>
          </p>
        </div>

        <Card className="w-full max-w-lg justify-self-end shadow-lg">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error ? (
              <Alert color="failure" role="alert">
                <span className="font-medium">{error}</span>
              </Alert>
            ) : null}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="login-email" value="Email address" />
              </div>
              <TextInput
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="login-password" value="Password" />
              </div>
              <TextInput
                id="login-password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Password strength</span>
                <span>{password ? strengthLabel : 'Enter a password'}</span>
              </div>
              <Progress progress={progress} color="cyan" size="sm" />
              <p className="mt-1 text-xs text-gray-500">
                Use 8+ characters, uppercase, lowercase, number, and symbol.
              </p>
            </div>
            <Button
              type="submit"
              color="blue"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-xs text-gray-500 sm:text-left">
              Run the API on port 5050 and use MongoDB data to manage content.
            </p>
          </form>
        </Card>
      </div>
    </main>
  )
}

function getPasswordStrength(password) {
  if (!password) return 0
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = rules.filter(Boolean).length
  if (score <= 2) return 0
  if (score === 3) return 1
  if (score === 4) return 2
  return 3
}

