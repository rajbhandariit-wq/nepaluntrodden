import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

  const { data: transactions, error } = await guard.admin
    .from('transactions')
    .select('host_id, gross_amount, commission_amount, net_payout, payment_status, booking_id')
    .in('payment_status', ['captured', 'refunded', 'partially_refunded'])
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31T23:59:59Z`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by host
  const hostMap: Record<string, { gross: number; commission: number; net: number; bookings: number }> = {}
  for (const t of transactions ?? []) {
    if (!t.host_id) continue
    if (!hostMap[t.host_id]) hostMap[t.host_id] = { gross: 0, commission: 0, net: 0, bookings: 0 }
    hostMap[t.host_id].gross      += Number(t.gross_amount)
    hostMap[t.host_id].commission += Number(t.commission_amount)
    hostMap[t.host_id].net        += Number(t.net_payout)
    hostMap[t.host_id].bookings   += 1
  }

  // Fetch host names
  const hostIds = Object.keys(hostMap)
  const { data: profiles } = hostIds.length
    ? await guard.admin.from('profiles').select('id, full_name').in('id', hostIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name]))

  const rows = hostIds.map(id => ({
    host_id:    id,
    host_name:  profileMap[id] ?? 'Unknown',
    ...hostMap[id],
  })).sort((a, b) => b.gross - a.gross)

  return NextResponse.json({ rows, year })
}
