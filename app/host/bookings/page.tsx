import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-status-error',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

export default async function HostBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: myListings } = await supabase
    .from('listings')
    .select('id, title')
    .or(`guide_id.eq.${user!.id},host_user_id.eq.${user!.id}`)

  const listingIds = (myListings ?? []).map(l => l.id)
  const listingMap = Object.fromEntries((myListings ?? []).map(l => [l.id, l.title as string]))

  const { data: bookings } = listingIds.length
    ? await admin
        .from('bookings')
        .select('id, booking_ref, status, num_adults, num_children, grand_total, date_from, date_to, created_at, listing_id, user_id, message_to_host, payment_method')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const travIds = [...new Set((bookings ?? []).map(b => b.user_id).filter(Boolean))]
  const { data: profiles } = travIds.length
    ? await admin.from('profiles').select('id, full_name, email').in('id', travIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p as { id: string; full_name: string; email: string }]))

  const all = bookings?.length ?? 0

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5" style={{ fontFamily: 'Lora, serif' }}>Bookings</h1>
      <p className="text-sm text-neutral-mid mb-5">{all} booking{all !== 1 ? 's' : ''} across your listings</p>

      {all === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 flex flex-col items-center text-center">
          <span className="text-5xl mb-4">📋</span>
          <h2 className="font-bold text-neutral-charcoal mb-1" style={{ fontFamily: 'Lora, serif' }}>No bookings yet</h2>
          <p className="text-sm text-neutral-mid">Bookings from travellers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(bookings ?? []).map(b => {
            const traveller = profileMap[b.user_id as string]
            const listingTitle = listingMap[b.listing_id as string] ?? '—'
            const guests = (b.num_adults ?? 0) + (b.num_children ?? 0)
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-charcoal truncate">{listingTitle}</p>
                    <p className="text-xs text-neutral-mid">
                      {traveller?.full_name ?? traveller?.email ?? 'Unknown traveller'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={b.status ?? 'pending'} />
                    {b.booking_ref && (
                      <span className="font-mono text-xs text-brand-green font-semibold">{b.booking_ref}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-neutral-mid mb-0.5">Dates</p>
                    <p className="font-medium text-neutral-charcoal">
                      {b.date_from ? `${b.date_from} → ${b.date_to ?? '?'}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-mid mb-0.5">Guests</p>
                    <p className="font-medium text-neutral-charcoal">
                      {guests ? `${b.num_adults ?? 0} adults${b.num_children ? `, ${b.num_children} children` : ''}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-mid mb-0.5">Total</p>
                    <p className="font-medium text-neutral-charcoal">
                      {b.grand_total != null ? `$${Number(b.grand_total).toFixed(2)}` : '—'}
                    </p>
                  </div>
                </div>

                {b.message_to_host && (
                  <div className="bg-neutral-pale rounded-xl px-3 py-2 text-xs text-neutral-charcoal">
                    <span className="font-semibold text-neutral-mid">Message: </span>
                    {b.message_to_host}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-neutral-mid">
                    Booked {new Date(b.created_at).toLocaleDateString()} · {b.payment_method ?? ''}
                  </p>
                  {b.status === 'confirmed' && (
                    <Link
                      href={`/host/messages/${b.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle size={13} /> Message traveller
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
