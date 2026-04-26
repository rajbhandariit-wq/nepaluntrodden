'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Compass, Map, Backpack, MessageCircle, User, Mountain, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const tabs = [
  { href: '/',        label: 'Discover', icon: Compass,       desc: 'Hidden gems & treks' },
  { href: '/map',     label: 'Map',      icon: Map,           desc: 'All listings on map' },
  { href: '/trips',   label: 'My Trips', icon: Backpack,      desc: 'Upcoming & past' },
  { href: '/inbox',   label: 'Inbox',    icon: MessageCircle, desc: 'Guides & hosts' },
  { href: '/profile', label: 'Profile',  icon: User,          desc: 'Account & settings' },
]

export default function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null
  const initials = displayName
    ? displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : null

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 bg-white border-r border-neutral-light z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-neutral-light">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shrink-0">
            <Mountain size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-neutral-charcoal leading-tight">Nepal Untrodden</p>
            <p className="text-[10px] text-neutral-mid">Venture Beyond the Trails</p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map(({ href, label, icon: Icon, desc }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                active
                  ? 'bg-brand-green-pale text-brand-green'
                  : 'text-neutral-mid hover:bg-neutral-pale hover:text-neutral-charcoal'
              )}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn('shrink-0', active ? 'text-brand-green' : 'text-neutral-mid group-hover:text-neutral-charcoal')}
              />
              <div className="min-w-0">
                <p className={cn('text-sm leading-tight', active ? 'font-semibold text-brand-green' : 'font-medium')}>{label}</p>
                <p className="text-[10px] text-neutral-mid truncate">{desc}</p>
              </div>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user or sign-in */}
      <div className="px-4 py-5 border-t border-neutral-light">
        {user ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-charcoal truncate">{displayName}</p>
              <button
                onClick={handleSignOut}
                className="text-[10px] text-neutral-mid hover:text-status-error transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-green-pale text-brand-green hover:bg-brand-green hover:text-white transition-all text-sm font-semibold"
          >
            <LogIn size={16} />
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
