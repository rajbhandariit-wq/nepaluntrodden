'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mb-3">
            <Mountain size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Welcome back</h1>
          <p className="text-sm text-neutral-mid mt-1">Sign in to Nepal Untrodden</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Your password"
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
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-mid mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-brand-green font-semibold">Create one</Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-neutral-mid hover:text-neutral-charcoal">Continue without signing in →</Link>
        </p>
      </div>
    </div>
  )
}
