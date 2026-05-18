'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Map, Backpack, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/',        label: 'Discover', icon: Compass },
  { href: '/map',     label: 'Map',      icon: Map },
  { href: '/trips',   label: 'Trips',    icon: Backpack },
  { href: '/inbox',   label: 'Inbox',    icon: MessageCircle },
  { href: '/profile', label: 'Profile',  icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    /* md:hidden — invisible on desktop, sidebar takes over */
    <nav
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-neutral-light z-50"
      style={{ boxShadow: 'var(--shadow-nav)' }}
    >
      <div className="flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors duration-150',
                active ? 'text-brand-green' : 'text-neutral-mid hover:text-neutral-charcoal'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>{label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-brand-green" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
