import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Alert, Button, Card, Label, Progress, TextInput } from 'flowbite-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password.trim()) return
    if (password !== confirm) return
    setLoading(true)
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim(),
          password,
        },
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
      navigate('/settings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
          <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
            Create account
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            Join Software Club
          </h1>
          <p className="mt-3 text-base text-[var(--ink-soft)]">
            Create a member account stored in MongoDB. After signup, you will go to Settings first to complete your profile.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <NavLink
              className="font-medium text-indigo-400 hover:underline"
              to="/login"
            >
              Sign in
            </NavLink>
          </p>
        </div>

        <Card className="w-full max-w-lg justify-self-end border border-[var(--line)] bg-[var(--card)] shadow-lg">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error ? (
              <Alert color="failure" role="alert">
                <span className="font-medium">{error}</span>
              </Alert>
            ) : null}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="reg-name" value="Display name" />
              </div>
              <TextInput
                id="reg-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="reg-email" value="Email address" />
              </div>
              <TextInput
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="reg-password" value="Password" />
              </div>
              <TextInput
                id="reg-password"
                type="password"
                placeholder="At least 8 chars with number & symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="reg-confirm" value="Confirm password" />
              </div>
              <TextInput
                id="reg-confirm"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                <span>Password strength</span>
                <span>{password ? strengthLabel : 'Enter a password'}</span>
              </div>
              <Progress progress={progress} color="green" size="sm" />
            </div>
            {password && confirm && password !== confirm ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Passwords do not match.
              </p>
            ) : null}
            <Button
              type="submit"
              color="green"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create account'}
            </Button>
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
