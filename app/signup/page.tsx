'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green-pale flex items-center justify-center mb-5">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>Check your email</h1>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className="text-brand-green text-sm font-semibold">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mb-3">
            <Mountain size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Create account</h1>
          <p className="text-sm text-neutral-mid mt-1">Join Nepal&apos;s hidden trail community</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                required
                className="input-field pr-11"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-status-error">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-mid mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-green font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
