import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100   text-amber-700',
    cancelled: 'bg-red-100     text-status-error',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const admin = createAdminClient()

  const { data: bookings } = await admin
    .from('bookings')
    .select('id, booking_ref, status, num_adults, num_children, grand_total, date_from, date_to, created_at, listing_id, user_id')
    .order('created_at', { ascending: false })

  const listingIds = [...new Set((bookings ?? []).map(b => b.listing_id).filter(Boolean))]
  const userIds    = [...new Set((bookings ?? []).map(b => b.user_id).filter(Boolean))]

  const [{ data: listingsData }, { data: profilesData }] = await Promise.all([
    listingIds.length ? admin.from('listings').select('id, title').in('id', listingIds) : Promise.resolve({ data: [] }),
    userIds.length    ? admin.from('profiles').select('id, full_name, email').in('id', userIds) : Promise.resolve({ data: [] }),
  ])

  const listingMap = Object.fromEntries((listingsData ?? []).map(l => [l.id, l as { id: string; title: string }]))
  const profileMap = Object.fromEntries((profilesData ?? []).map(p => [p.id, p as { id: string; full_name: string; email: string }]))

  const filtered = (bookings ?? []).filter(b =>
    !filterStatus || b.status === filterStatus
  )

  // Summary stats
  const all       = bookings?.length ?? 0
  const confirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const pending   = bookings?.filter(b => b.status === 'pending').length ?? 0
  const cancelled = bookings?.filter(b => b.status === 'cancelled').length ?? 0

  const filters = [
    { label: `All (${all})`,             href: '/admin/bookings' },
    { label: `Confirmed (${confirmed})`, href: '/admin/bookings?status=confirmed' },
    { label: `Pending (${pending})`,     href: '/admin/bookings?status=pending' },
    { label: `Cancelled (${cancelled})`, href: '/admin/bookings?status=cancelled' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5" style={{ fontFamily: 'Lora, serif' }}>Bookings</h1>
      <p className="text-sm text-neutral-mid mb-4">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total',     value: all,       color: 'text-neutral-charcoal' },
          { label: 'Confirmed', value: confirmed,  color: 'text-emerald-600' },
          { label: 'Pending',   value: pending,    color: 'text-brand-ochre' },
          { label: 'Cancelled', value: cancelled,  color: 'text-status-error' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-card text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-mid">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => {
          const key = f.href.split('?')[1] ?? ''
          const isActive = (filterStatus ? `status=${filterStatus}` : '') === key
          return (
            <Link key={f.label} href={f.href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isActive ? 'bg-brand-green text-white' : 'bg-white border border-neutral-light text-neutral-mid hover:border-brand-green hover:text-brand-green'
              }`}>
              {f.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-pale border-b border-neutral-light">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Listing</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Traveller</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Dates</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Guests</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-mid">No bookings found.</td>
                </tr>
              )}
              {filtered.map(b => {
                const listing = listingMap[b.listing_id as string] ?? null
                const profile = profileMap[b.user_id as string] ?? null
                const guests = (b.num_adults ?? 0) + (b.num_children ?? 0)
                return (
                  <tr key={b.id} className="border-b border-neutral-light/60 hover:bg-neutral-pale/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-green">{b.booking_ref ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-charcoal max-w-[140px] truncate">{listing?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-mid max-w-[120px] truncate">
                      {profile?.full_name ?? profile?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-mid whitespace-nowrap">
                      {b.date_from ? `${b.date_from} → ${b.date_to ?? '?'}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-mid text-center">{guests || '—'}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-neutral-charcoal">
                      {b.grand_total != null ? `$${Number(b.grand_total).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status ?? 'pending'} /></td>
                    <td className="px-4 py-3 text-xs text-neutral-mid whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
