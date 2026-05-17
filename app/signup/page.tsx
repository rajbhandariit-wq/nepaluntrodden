'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mountain, Eye, EyeOff, Plus, Trash2, Upload, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const GOV_ID_TYPES = ['Driving License', 'National ID (NID)', 'Citizenship Number', 'Passport']

type GovId = { type: string; number: string; file: File | null }
type Role = 'traveller' | 'host'

export default function SignupPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Host-specific fields
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [govIds, setGovIds] = useState<GovId[]>([
    { type: '', number: '', file: null },
    { type: '', number: '', file: null },
  ])
  const [guideAssocFile, setGuideAssocFile] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const formRef = useRef<HTMLDivElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const guideAssocRef = useRef<HTMLInputElement>(null)
  const idFileRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (role) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }, [role])

  function handleProfilePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfilePhoto(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  function updateGovId(index: number, field: keyof GovId, value: string | File | null) {
    setGovIds(prev => prev.map((id, i) => i === index ? { ...id, [field]: value } : id))
  }

  function removeGovId(index: number) {
    setGovIds(prev => prev.filter((_, i) => i !== index))
    idFileRefs.current = idFileRefs.current.filter((_, i) => i !== index)
  }

  async function handleSignup() {
    if (role === 'host') {
      const completeIds = govIds.filter(id => id.type && id.number && id.file)
      const partialIds = govIds.filter(id => (id.type || id.number || id.file) && !(id.type && id.number && id.file))
      if (partialIds.length > 0) {
        setError('Please complete all ID entries (type, number, and photo required for each)')
        return
      }
      if (completeIds.length < 2) {
        setError('Please provide at least 2 government IDs with their photos')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const meta: Record<string, unknown> = { full_name: name, role }

      if (role === 'host') {
        meta.phone = phone
        meta.permanent_address = address
        meta.gov_id_types = govIds.filter(id => id.type).map(id => id.type)
        meta.guide_assoc_provided = !!guideAssocFile
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSent(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent && role === 'host') {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>Application under review</h1>
        <p className="text-sm text-neutral-mid mb-2 max-w-xs">
          Your application is currently in review.
        </p>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">
          You will be notified by email / SMS once your account is verified.
        </p>
        <Link href="/login" className="text-brand-green text-sm font-semibold">Back to sign in</Link>
      </div>
    )
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
    <div className="page-scroll flex flex-col items-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mb-3">
            <Mountain size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Create account</h1>
          <p className="text-sm text-neutral-mid mt-1">Join Nepal&apos;s hidden trail community</p>
        </div>

        {/* Role selector */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-neutral-mid mb-3 text-center uppercase tracking-wide">I am signing up as a...</p>
          {!mounted && (
            <p className="text-xs text-center text-neutral-mid mb-2 animate-pulse">Loading…</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'traveller' as Role, icon: '🧳', label: 'Traveller', desc: 'Explore & book trips' },
              { value: 'host' as Role,      icon: '🏡', label: 'Guest / Host', desc: 'List & host experiences' },
            ]).map(({ value, icon, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setRole(value); setError('') }}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  role === value
                    ? 'border-brand-green bg-brand-green-pale'
                    : 'border-neutral-light bg-white hover:border-brand-green-light'
                }`}
              >
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-sm font-semibold text-neutral-charcoal block">{label}</span>
                <span className="text-xs text-neutral-mid">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {role && (
          <div ref={formRef}>
          <form onSubmit={e => { e.preventDefault(); void handleSignup() }} className="space-y-4">

            {/* ── Common fields ── */}
            <div>
              <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" required className="input-field"
              />
            </div>
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
                  placeholder="Min. 6 characters" minLength={6} required
                  className="input-field pr-11"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ── Host-only fields ── */}
            {role === 'host' && (
              <>
                {/* Profile photo */}
                <div className="bg-neutral-pale rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-neutral-mid">Profile photo</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-neutral-light flex items-center justify-center overflow-hidden shrink-0">
                      {profilePreview
                        ? <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        : <span className="text-2xl">👤</span>
                      }
                    </div>
                    {/* Camera input — opens device camera directly */}
                    <input
                      ref={cameraInputRef} type="file" accept="image/*"
                      capture="environment" className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    {/* Gallery input — opens file picker */}
                    <input
                      ref={galleryInputRef} type="file" accept="image/*"
                      className="hidden" onChange={handleProfilePhotoChange}
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <button type="button" onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2 justify-center text-xs font-semibold text-white bg-brand-green rounded-xl px-3 py-2">
                        <Camera size={14} /> Take photo
                      </button>
                      <button type="button" onClick={() => galleryInputRef.current?.click()}
                        className="flex items-center gap-2 justify-center text-xs font-semibold text-neutral-charcoal bg-white border border-neutral-light rounded-xl px-3 py-2">
                        <Upload size={14} /> Choose from gallery
                      </button>
                    </div>
                  </div>
                  {profilePhoto && (
                    <p className="text-xs text-brand-green truncate">✓ {profilePhoto.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Phone number</label>
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+977 98XXXXXXXX" required className="input-field"
                  />
                </div>

                {/* Permanent address */}
                <div>
                  <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Permanent address</label>
                  <textarea
                    value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="District, Municipality, Ward No." required rows={2}
                    className="input-field resize-none"
                  />
                </div>

                {/* Government IDs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold text-neutral-mid">Government IDs</span>
                      <span className="text-xs text-status-error ml-1">(min. 2 required)</span>
                    </div>
                    {govIds.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setGovIds(prev => [...prev, { type: '', number: '', file: null }])}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-green"
                      >
                        <Plus size={12} /> Add ID
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {govIds.map((govId, i) => (
                      <div key={i} className="bg-neutral-pale rounded-2xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={govId.type}
                            onChange={e => updateGovId(i, 'type', e.target.value)}
                            className="input-field flex-1"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                          >
                            <option value="">Select ID type</option>
                            {GOV_ID_TYPES.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          {i >= 2 && (
                            <button
                              type="button" onClick={() => removeGovId(i)}
                              className="text-neutral-mid hover:text-status-error shrink-0 p-1 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        <input
                          type="text" value={govId.number}
                          onChange={e => updateGovId(i, 'number', e.target.value)}
                          placeholder="ID number"
                          className="input-field"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        />

                        <input
                          ref={el => { idFileRefs.current[i] = el }}
                          type="file" accept="image/*,application/pdf"
                          className="hidden"
                          onChange={e => updateGovId(i, 'file', e.target.files?.[0] ?? null)}
                        />
                        <button
                          type="button"
                          onClick={() => idFileRefs.current[i]?.click()}
                          className={`w-full flex items-center justify-center gap-2 text-xs rounded-xl border-2 border-dashed py-2.5 transition-colors ${
                            govId.file
                              ? 'border-brand-green bg-brand-green-pale text-brand-green font-semibold'
                              : 'border-neutral-light text-neutral-mid hover:border-brand-green-light'
                          }`}
                        >
                          <Upload size={13} />
                          {govId.file ? `✓ ${govId.file.name}` : 'Upload ID photo or scan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guide Association ID */}
                <div>
                  <label className="text-xs font-semibold text-neutral-mid block mb-1.5">
                    Guide Association ID
                    <span className="font-normal text-neutral-mid ml-1">(optional)</span>
                  </label>
                  <input
                    ref={guideAssocRef} type="file" accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => setGuideAssocFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button" onClick={() => guideAssocRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-2 text-xs rounded-xl border-2 border-dashed py-3 transition-colors ${
                      guideAssocFile
                        ? 'border-brand-green bg-brand-green-pale text-brand-green font-semibold'
                        : 'border-neutral-light text-neutral-mid hover:border-brand-green-light'
                    }`}
                  >
                    <Upload size={14} />
                    {guideAssocFile ? `✓ ${guideAssocFile.name}` : 'Browse & upload guide association ID'}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs text-status-error">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
          </div>
        )}

        <p className="text-center text-sm text-neutral-mid mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-green font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
