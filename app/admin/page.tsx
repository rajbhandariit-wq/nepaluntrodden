import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Users, MapPin, Calendar, Clock, CheckCircle, DollarSign, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/billing/formatters'

export default async function AdminDashboard() {
  const admin = createAdminClient()

  const mtdStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`

  const [
    { data: profiles },
    { data: listings },
    { data: bookings },
    { data: txMtd },
    { data: pendingPayouts },
  ] = await Promise.all([
    admin.from('profiles').select('id, role, status'),
    admin.from('listings').select('id, status'),
    admin.from('bookings').select('id, status'),
    admin.from('transactions').select('gross_amount').eq('payment_status', 'captured').gte('created_at', mtdStart),
    admin.from('payouts').select('amount').eq('status', 'pending'),
  ])

  const totalUsers         = profiles?.length ?? 0
  const pendingHosts       = profiles?.filter(p => p.role === 'host' && p.status === 'pending').length ?? 0
  const approvedListings   = listings?.filter(l => l.status === 'approved').length ?? 0
  const pendingListings    = listings?.filter(l => l.status === 'pending').length ?? 0
  const totalBookings      = bookings?.length ?? 0
  const confirmedBookings  = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const revenueMtd         = txMtd?.reduce((s, t) => s + Number(t.gross_amount), 0) ?? 0
  const pendingPayoutTotal = pendingPayouts?.reduce((s, p) => s + Number(p.amount), 0) ?? 0

  const stats = [
    { label: 'Total Users',        value: totalUsers,                       icon: Users,        color: 'text-status-info',    bg: 'bg-blue-50',          href: '/admin/users' },
    { label: 'Pending Hosts',      value: pendingHosts,                     icon: Clock,        color: 'text-brand-ochre',    bg: 'bg-amber-50',         href: '/admin/users?status=pending&role=host' },
    { label: 'Active Listings',    value: approvedListings,                 icon: MapPin,       color: 'text-brand-green',    bg: 'bg-brand-green-pale', href: '/admin/listings?status=approved' },
    { label: 'Total Bookings',     value: totalBookings,                    icon: Calendar,     color: 'text-purple-600',     bg: 'bg-purple-50',        href: '/admin/bookings' },
    { label: 'Revenue MTD',        value: formatCurrency(revenueMtd),       icon: DollarSign,   color: 'text-emerald-600',    bg: 'bg-emerald-50',       href: '/admin/billing' },
    { label: 'Pending Payouts',    value: formatCurrency(pendingPayoutTotal), icon: CreditCard, color: 'text-amber-600',      bg: 'bg-amber-50',         href: '/admin/billing/payouts' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5" style={{ fontFamily: 'Lora, serif' }}>Dashboard</h1>
      <p className="text-sm text-neutral-mid mb-5">Platform overview</p>

      {/* Stat grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className="text-2xl font-bold text-neutral-charcoal">{value}</p>
            <p className="text-xs text-neutral-mid mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Action alerts */}
      <div className="space-y-2">
        {pendingHosts > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-neutral-charcoal">
              <span className="font-semibold">{pendingHosts}</span>{' '}
              host account{pendingHosts > 1 ? 's' : ''} awaiting review
            </p>
            <Link href="/admin/users?status=pending&role=host" className="text-xs font-semibold text-brand-ochre shrink-0 ml-4">
              Review →
            </Link>
          </div>
        )}
        {pendingListings > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-neutral-charcoal">
              <span className="font-semibold">{pendingListings}</span>{' '}
              listing{pendingListings > 1 ? 's' : ''} awaiting approval
            </p>
            <Link href="/admin/listings?status=pending" className="text-xs font-semibold text-brand-ochre shrink-0 ml-4">
              Review →
            </Link>
          </div>
        )}
        {pendingHosts === 0 && pendingListings === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-sm text-emerald-700 font-medium">✓ All accounts and listings are reviewed — nothing pending.</p>
          </div>
        )}
      </div>
    </div>
  )
}
