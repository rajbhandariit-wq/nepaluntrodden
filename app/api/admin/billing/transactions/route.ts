import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const status    = searchParams.get('status')
  const hostId    = searchParams.get('host_id')
  const dateFrom  = searchParams.get('date_from')
  const dateTo    = searchParams.get('date_to')
  const page      = parseInt(searchParams.get('page') ?? '1')
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)
  const offset    = (page - 1) * limit

  let query = guard.admin
    .from('transactions')
    .select(`
      id, booking_id, gross_amount, commission_amount, net_payout,
      payment_method, payment_status, transaction_ref, dispute_status,
      refund_amount, refund_policy, created_at,
      bookings ( booking_ref, date_from, date_to ),
      traveler:traveler_id ( id, full_name, email:id ),
      host:host_id ( id, full_name )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)   query = query.eq('payment_status', status)
  if (hostId)   query = query.eq('host_id', hostId)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59Z')

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count, page, limit })
}
