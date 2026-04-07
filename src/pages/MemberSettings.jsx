import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Card, Label, Progress, Select, TextInput } from 'flowbite-react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuthStore } from '../store/authStore'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function MemberSettings() {
  const { token, user, updateUser } = useAuthStore()
  const fileInputRef = useRef(null)
  const [firstName, setFirstName] = useState(splitName(user?.name).firstName)
  const [lastName, setLastName] = useState(splitName(user?.name).lastName)
  const [email, setEmail] = useState(user?.email ?? '')
  const [photo, setPhoto] = useState(user?.photo ?? '')
  const [gender, setGender] = useState(user?.gender ?? '')
  const [batch, setBatch] = useState(user?.batch ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)
  const [emailEditable, setEmailEditable] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const parsed = splitName(user?.name)
    setFirstName(parsed.firstName)
    setLastName(parsed.lastName)
    setEmail(user?.email ?? '')
    setPhoto(user?.photo ?? '')
    setGender(user?.gender ?? '')
    setBatch(user?.batch ?? '')
  }, [user])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const passwordStrength = getPasswordStrength(password)
  const strengthLabel = ['Too weak', 'Weak', 'Good', 'Strong'][passwordStrength]
  const progress = (passwordStrength / 3) * 100
  const initials = useMemo(() => {
    const source = (firstName || email || 'M').trim()
    return source.charAt(0).toUpperCase()
  }, [email, firstName])

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file')
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPhoto(dataUrl)
    } catch {
      setError('Failed to read the selected photo')
    }
  }

  const clearPhoto = () => {
    setPhoto('')
    setSuccess('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancel = () => {
    const parsed = splitName(user?.name)
    setFirstName(parsed.firstName)
    setLastName(parsed.lastName)
    setEmail(user?.email ?? '')
    setPhoto(user?.photo ?? '')
    setGender(user?.gender ?? '')
    setBatch(user?.batch ?? '')
    setPassword('')
    setConfirmPassword('')
    setEmailEditable(false)
    setShowPasswordFields(false)
    setError('')
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
    if (!fullName || !email.trim()) {
      setError('Name and email are required')
      return
    }

    if (showPasswordFields && password && password.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    if (showPasswordFields && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/users/me', {
        method: 'PATCH',
        token,
        body: {
          name: fullName,
          email: email.trim(),
          photo,
          gender,
          batch: batch.trim(),
          password: showPasswordFields ? password.trim() : '',
        },
      })
      updateUser(data.user)
      setPassword('')
      setConfirmPassword('')
      setEmailEditable(false)
      setShowPasswordFields(false)
      setSuccess('Your account settings were updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-14">
      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-8">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Account</h1>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {error ? (
              <Alert color="failure" role="alert" className="mb-5">
                <span className="font-medium">{error}</span>
              </Alert>
            ) : null}
            {success ? (
              <Alert color="success" role="status" className="mb-5">
                <span className="font-medium">{success}</span>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {photo ? (
                  <img
                    src={photo}
                    alt={`${firstName || 'Member'} profile`}
                    className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    {initials}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Picture</h2>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <input
                      ref={fileInputRef}
                      id="settings-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-violet-600 hover:to-purple-600"
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Choose an image from your device for your account photo.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:w-[240px]">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Appearance</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Theme for this device
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      theme === 'light'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      theme === 'dark'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 border-b border-slate-200 py-8 md:grid-cols-2 dark:border-slate-800">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="settings-first-name" value="First Name" />
                </div>
                <TextInput
                  id="settings-first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                  required
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="settings-last-name" value="Last Name" />
                </div>
                <TextInput
                  id="settings-last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="settings-gender" value="Gender" />
                </div>
                <Select
                  id="settings-gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="settings-batch" value="Batch" />
                </div>
                <TextInput
                  id="settings-batch"
                  type="text"
                  value={batch}
                  onChange={(event) => setBatch(event.target.value)}
                  placeholder="Batch 2025"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 block">
                  <Label htmlFor="settings-email" value="Email" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <TextInput
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={!emailEditable}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailEditable((prev) => !prev)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {emailEditable ? 'Lock Email' : 'Edit Email'}
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Used to log in to your account
                </p>
              </div>
            </div>

            <div className="border-b border-slate-200 py-8 dark:border-slate-800">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Password</h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                    Log in with your password instead of using temporary login codes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields((prev) => !prev)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {showPasswordFields ? 'Hide Password' : 'Change Password'}
                </button>
              </div>

              {showPasswordFields ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="settings-password" value="New password" />
                    </div>
                    <TextInput
                      id="settings-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter a new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="settings-confirm-password" value="Confirm password" />
                    </div>
                    <TextInput
                      id="settings-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat the new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Password strength</span>
                      <span>{password ? strengthLabel : 'Enter a password'}</span>
                    </div>
                    <Progress progress={password ? progress : 0} color="purple" size="sm" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-slate-200 px-8 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button
              type="submit"
              color="purple"
              disabled={loading}
              className="rounded-2xl"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  )
}

function splitName(name) {
  const value = String(name ?? '').trim()
  if (!value) return { firstName: '', lastName: '' }
  const parts = value.split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
