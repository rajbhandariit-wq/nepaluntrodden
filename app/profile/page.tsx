import { Settings, Bell, Globe, Shield, Phone, LogOut, ChevronRight, Heart, Wallet } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const badges = [
  { id: 'trail',    emoji: '🥾', label: 'Trail Seeker',    earned: true },
  { id: 'culture',  emoji: '🏛️', label: 'Culture Lover',   earned: true },
  { id: 'eco',      emoji: '🌱', label: 'Eco Traveler',    earned: true },
  { id: 'altitude', emoji: '⛰️', label: 'Altitude Chaser', earned: false },
  { id: 'solo',     emoji: '🧭', label: 'Solo Explorer',   earned: false },
]

const menuItems = [
  { icon: Wallet,   label: 'Wallet & payments',  sub: 'Balance: $0',              href: '/profile/wallet' },
  { icon: Heart,    label: 'Wishlist',            sub: 'Saved experiences',        href: '/profile/wishlist' },
  { icon: Shield,   label: 'ID verification',     sub: 'Verified ✓',               href: '/profile/id-verification' },
  { icon: Phone,    label: 'Emergency contacts',  sub: 'Add emergency contact',    href: '/profile/emergency-contacts' },
  { icon: Bell,     label: 'Notifications',       sub: 'Bookings, alerts, offers', href: '/profile/notifications' },
  { icon: Globe,    label: 'Language',            sub: 'English',                  href: '/profile/language' },
  { icon: Settings, label: 'Privacy & data',      sub: 'Manage your data',         href: '/profile/privacy' },
]

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Traveler'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  if (!user) {
    return (
      <div className="page-scroll flex flex-col items-center justify-center px-6 py-20 min-h-screen text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green-pale flex items-center justify-center mb-4">
          <span className="text-3xl">🏔️</span>
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>Sign in to your account</h1>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">Track your trips, save experiences, and connect with guides.</p>
        <Link href="/login" className="btn-primary text-sm py-3 px-8 w-auto inline-block">Sign in →</Link>
        <Link href="/signup" className="text-brand-green text-sm font-semibold mt-4">Create account</Link>
      </div>
    )
  }

  return (
    <div className="page-scroll">
      {/* Avatar header */}
      <div className="bg-brand-green pt-12 md:pt-8 pb-6 px-4 md:px-8">
        <div className="flex items-center gap-4 md:max-w-2xl">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/40">
            {initials}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl md:text-2xl" style={{ fontFamily: 'Lora, serif' }}>{displayName}</h1>
            <StarRating rating={4.9} reviewCount={0} className="mt-0.5 text-white/90" />
            <p className="text-white/70 text-xs mt-0.5">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button className="ml-auto text-white/80 bg-white/10 rounded-xl p-2">
            <Settings size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5 md:max-w-2xl">
          {[
            { value: '0',   label: 'Trips' },
            { value: '0km', label: 'Trekked' },
            { value: '0',   label: 'Villages' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-xl py-2.5 text-center">
              <p className="text-white font-bold text-lg leading-none">{value}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-8 md:px-8 md:pt-8 md:items-start">

        {/* Left: Badges + discount */}
        <div className="px-4 md:px-0 py-5 md:py-0">
          <p className="section-title mb-3">My Badges</p>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`shrink-0 md:shrink flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${b.earned ? 'bg-brand-green-pale border-brand-green/30' : 'bg-neutral-pale border-neutral-light opacity-40'}`}
                style={{ minWidth: 72 }}
              >
                <span className="text-2xl">{b.emoji}</span>
                <p className="text-[10px] font-semibold text-neutral-charcoal text-center leading-tight">{b.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-brand-ochre/10 border border-brand-ochre/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-ochre mb-0.5">🎟️ Your discount code</p>
              <p className="text-lg font-bold text-neutral-charcoal tracking-widest">TRAIL10</p>
              <p className="text-xs text-neutral-mid">10% off · expires Jan 2027</p>
            </div>
            <button className="text-xs font-semibold text-brand-ochre bg-brand-ochre/10 border border-brand-ochre/30 px-3 py-1.5 rounded-xl">
              Copy
            </button>
          </div>
        </div>

        {/* Right: Menu */}
        <div className="px-4 md:px-0 md:pb-8">
          <p className="section-title mb-3">Account</p>
          <div className="card overflow-hidden">
            {menuItems.map(({ icon: Icon, label, sub, href }, i) => (
              <Link
                key={label}
                href={href}
                className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-pale transition-colors ${i < menuItems.length - 1 ? 'border-b border-neutral-light/60' : ''}`}
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-pale flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-brand-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-charcoal">{label}</p>
                  <p className="text-xs text-neutral-mid truncate">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-neutral-light shrink-0" />
              </Link>
            ))}
          </div>

          <form action="/auth/signout" method="post">
            <button
              formAction="/api/auth/signout"
              className="w-full flex items-center gap-3 px-4 py-4 mt-3 text-status-error rounded-2xl bg-red-50 active:opacity-80 transition-opacity"
            >
              <LogOut size={18} />
              <span className="text-sm font-semibold">Log out</span>
            </button>
          </form>

          <p className="text-center text-xs text-neutral-mid mt-6 mb-2">Nepal Untrodden v1.0.0</p>
          <p className="text-center text-xs text-neutral-mid mb-4">Made with ❤ for Nepal&apos;s hidden trails</p>
        </div>
      </div>
    </div>
  )
}
