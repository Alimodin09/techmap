'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import AuthShell from '@/components/auth/AuthShell'
import PasswordField from '@/components/auth/PasswordField'

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      })

      if (signUpError) throw signUpError

      setSuccess('Account created successfully. You can now log in.')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join TechMap to report technical issues, track progress, and keep your campus support work organized."
      footer={
        <p className="text-center">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-sky-700 transition hover:text-sky-600">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="signup-full-name" className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="signup-full-name"
            type="text"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Juan Dela Cruz"
            disabled={loading}
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <PasswordField
          label="Password"
          value={password}
          placeholder="Create a password"
          visible={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
          onChange={setPassword}
          disabled={loading}
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          placeholder="Re-enter your password"
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((current) => !current)}
          onChange={setConfirmPassword}
          disabled={loading}
          autoComplete="new-password"
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : ''}
        />

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:from-sky-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
    </AuthShell>
  )
}
