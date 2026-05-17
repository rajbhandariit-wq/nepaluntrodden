import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'

  const { data, error } = await guard.admin
    .from('payouts')
    .select(`
      id, host_id, amount, status, payout_method, payout_account_ref,
      bank_name, booking_ids, period_start, period_end, paid_at,
      payment_reference, notes, retry_count, created_at,
      host:host_id ( id, full_name )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Summary of all pending amounts
  const { data: summary } = await guard.admin
    .from('payouts')
    .select('amount, status')

  const pendingTotal = summary?.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0) ?? 0
  const paidTotal    = summary?.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0) ?? 0

  return NextResponse.json({ data, pendingTotal, paidTotal })
}
