/**
 * POST /api/admin/billing/batch-payouts
 *
 * Weekly batch job: finds all completed bookings with host_payout_status='pending'
 * whose end_date + 48h has passed, groups by host, and creates pending payout records.
 *
 * Call this from a cron job on the droplet (runs every Monday 09:00 NPT = 03:15 UTC):
 *   crontab: 15 3 * * 1 curl -X POST https://nepaluntrodden.com/api/admin/billing/batch-payouts \
 *              -H "Authorization: Bearer $CRON_SECRET"
 *
 * Set CRON_SECRET in .env.local to protect the endpoint.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  // Simple shared-secret auth for cron callers
  const authHeader = request.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET

  const isAdminCall = authHeader === `Bearer ${cronSecret}` && !!cronSecret
  // Also allow calls from authenticated admins (via UI "Run Now" button)
  if (!isAdminCall) {
    // Fall back to user auth check
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.is_admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const admin = createAdminClient()

  // Cutoff: 48h ago — only settle trips that ended at least 48h ago
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // Find eligible bookings
  const { data: bookings, error } = await admin
    .from('bookings')
    .select(`
      id, booking_ref, grand_total, date_from, date_to, listing_id,
      listings ( guide_id, guides ( user_id ) )
    `)
    .eq('status', 'confirmed')
    .eq('host_payout_status', 'pending')
    .lte('date_to', cutoff)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!bookings?.length) return NextResponse.json({ message: 'No eligible bookings', created: 0 })

  // Group by host (via guide → user_id)
  const hostGroups: Record<string, { bookingIds: string[]; total: number }> = {}
  const periodStart = bookings.reduce((min, b) => b.date_from < min ? b.date_from : min, bookings[0].date_from)
  const periodEnd   = cutoff

  for (const b of bookings) {
    const listing = (b.listings as unknown as { guide_id: string; guides: { user_id: string } | { user_id: string }[] } | null)
    const guidesRaw = listing?.guides
    const hostId = Array.isArray(guidesRaw) ? guidesRaw[0]?.user_id : guidesRaw?.user_id
    if (!hostId) continue

    // Net payout = 80% of grand_total (platform keeps 20% commission)
    const commissionRate = 0.20
    const net = +(Number(b.grand_total) * (1 - commissionRate)).toFixed(2)

    if (!hostGroups[hostId]) hostGroups[hostId] = { bookingIds: [], total: 0 }
    hostGroups[hostId].bookingIds.push(b.id)
    hostGroups[hostId].total = +(hostGroups[hostId].total + net).toFixed(2)
  }

  // Create one pending payout per host
  const payoutRows = Object.entries(hostGroups).map(([hostId, g]) => ({
    host_id:      hostId,
    amount:       g.total,
    status:       'pending' as const,
    booking_ids:  g.bookingIds,
    period_start: periodStart,
    period_end:   periodEnd,
  }))

  const { data: created, error: insertErr } = await admin
    .from('payouts')
    .insert(payoutRows)
    .select('id')

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Mark bookings as processing
  await admin
    .from('bookings')
    .update({ host_payout_status: 'processing' })
    .in('id', bookings.map(b => b.id))

  return NextResponse.json({ message: 'Batch complete', created: created?.length ?? 0, hostCount: payoutRows.length })
}
