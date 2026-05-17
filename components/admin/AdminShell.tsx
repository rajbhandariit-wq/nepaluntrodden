'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, MapPin, Calendar,
  MessageSquare, LogOut, Mountain, Menu, X, CreditCard,
} from 'lucide-react'

const NAV = [
  { href: '/admin',              label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/users',        label: 'Users',       icon: Users },
  { href: '/admin/listings',     label: 'Listings',    icon: MapPin },
  { href: '/admin/bookings',     label: 'Bookings',    icon: Calendar },
  { href: '/admin/billing',      label: 'Billing',     icon: CreditCard },
  { href: '/admin/messages',     label: 'Messages',    icon: MessageSquare },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-full w-full bg-neutral-pale overflow-hidden">

      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-56 bg-brand-green flex flex-col shrink-0
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Mountain size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs leading-tight truncate">Nepal Untrodden</p>
            <p className="text-white/50 text-[10px]">Admin</p>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden ml-auto text-white/60 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href} href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${active ? 'bg-white/20 text-white' : 'text-white/65 hover:text-white hover:bg-white/10'}
                `}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-white/10">
          <form action="/api/auth/signout" method="POST">
            <button type="submit"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/10 w-full transition-colors">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-neutral-light shrink-0">
          <button onClick={() => setOpen(true)} className="text-neutral-charcoal">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm text-neutral-charcoal">Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
