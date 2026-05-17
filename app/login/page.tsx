'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mountain, Eye, EyeOff, Clock, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type BlockedState = 'pending' | 'inactive' | 'rejected' | null

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState<BlockedState>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    setBlocked(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // After successful auth, check host/guide approval status
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.role === 'host') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, rejection_reason')
        .eq('id', user.id)
        .single()

      if (profile?.status === 'pending' || profile?.status === 'inactive') {
        await supabase.auth.signOut()
        setBlocked(profile.status)
        setLoading(false)
        return
      }

      if (profile?.status === 'rejected') {
        await supabase.auth.signOut()
        setBlocked('rejected')
        setRejectionReason(profile.rejection_reason ?? '')
        setLoading(false)
        return
      }
    }

    const isAdmin = user?.user_metadata?.is_admin === true
    const role = user?.user_metadata?.role
    if (isAdmin) {
      router.push('/admin')
    } else if (role === 'host') {
      router.push('/host')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  // ── Blocked: pending review ──────────────────────────────────────
  if (blocked === 'pending') {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <Clock size={28} className="text-brand-ochre" />
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>
          Application under review
        </h1>
        <p className="text-sm text-neutral-mid mb-2 max-w-xs">
          Your application is currently in review.
        </p>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">
          You will be notified by email / SMS once your account is verified.
        </p>
        <button onClick={() => setBlocked(null)} className="text-brand-green text-sm font-semibold">
          ← Back to sign in
        </button>
      </div>
    )
  }

  // ── Blocked: deactivated ─────────────────────────────────────────
  if (blocked === 'inactive') {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-light flex items-center justify-center mb-5">
          <Clock size={28} className="text-neutral-mid" />
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>
          Account deactivated
        </h1>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">
          Your account has been temporarily deactivated. Please contact{' '}
          <span className="font-semibold text-neutral-charcoal">support@nepaluntrodden.com</span>{' '}
          for assistance.
        </p>
        <button onClick={() => setBlocked(null)} className="text-brand-green text-sm font-semibold">
          ← Back to sign in
        </button>
      </div>
    )
  }

  // ── Blocked: rejected ────────────────────────────────────────────
  if (blocked === 'rejected') {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
          <XCircle size={28} className="text-status-error" />
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>
          Application not approved
        </h1>
        <p className="text-sm text-neutral-mid mb-3 max-w-xs">
          Unfortunately your host application was not approved.
        </p>
        {rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 max-w-xs text-left">
            <p className="text-xs font-semibold text-status-error mb-1">Reason</p>
            <p className="text-sm text-neutral-charcoal">{rejectionReason}</p>
          </div>
        )}
        <p className="text-xs text-neutral-mid mb-5 max-w-xs">
          Please contact{' '}
          <span className="font-semibold text-neutral-charcoal">support@nepaluntrodden.com</span>{' '}
          if you believe this is an error.
        </p>
        <button
          onClick={() => setBlocked(null)}
          className="text-brand-green text-sm font-semibold"
        >
          ← Back to sign in
        </button>
      </div>
    )
  }

  // ── Normal login form ────────────────────────────────────────────
  return (
    <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mb-3">
            <Mountain size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Welcome back</h1>
          <p className="text-sm text-neutral-mid mt-1">Sign in to Nepal Untrodden</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); void handleLogin() }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password" required className="input-field pr-11"
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

        <div className="mt-5 space-y-2">
          <p className="text-center text-xs text-neutral-mid font-semibold uppercase tracking-wide">Try a demo account</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => { setEmail('guest1@example.com'); setPassword('guest123') }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-brand-green/30 bg-brand-green-pale text-sm font-medium text-neutral-charcoal hover:border-brand-green transition-colors disabled:opacity-60"
          >
            <span>Traveller demo</span>
            <span className="text-xs text-neutral-mid font-normal">guest1@example.com</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => { setEmail('host1@example.com'); setPassword('host123') }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-brand-ochre/30 bg-brand-ochre/5 text-sm font-medium text-neutral-charcoal hover:border-brand-ochre/60 transition-colors disabled:opacity-60"
          >
            <span>Host demo</span>
            <span className="text-xs text-neutral-mid font-normal">host1@example.com</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => { setEmail('admin@nepaluntrodden.com'); setPassword('admin123') }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-charcoal hover:border-neutral-400 transition-colors disabled:opacity-60"
          >
            <span>Admin demo</span>
            <span className="text-xs text-neutral-mid font-normal">admin@nepaluntrodden.com</span>
          </button>
        </div>

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
