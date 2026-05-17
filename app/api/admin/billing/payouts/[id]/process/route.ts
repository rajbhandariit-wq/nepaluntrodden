import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await params
  const body = await request.json() as {
    payment_reference: string
    notes?: string
    payout_method?: string
    payout_account_ref?: string
    bank_name?: string
  }

  if (!body.payment_reference?.trim()) {
    return NextResponse.json({ error: 'payment_reference is required' }, { status: 400 })
  }

  const { data: payout } = await guard.admin
    .from('payouts')
    .select('id, status, booking_ids, host_id')
    .eq('id', id)
    .single()

  if (!payout) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
  if (payout.status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

  // Mark payout as paid
  const { error } = await guard.admin
    .from('payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_reference: body.payment_reference,
      notes: body.notes ?? null,
      ...(body.payout_method       ? { payout_method: body.payout_method } : {}),
      ...(body.payout_account_ref  ? { payout_account_ref: body.payout_account_ref } : {}),
      ...(body.bank_name           ? { bank_name: body.bank_name } : {}),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark all related bookings' payout status as paid
  if (payout.booking_ids?.length) {
    await guard.admin
      .from('bookings')
      .update({ host_payout_status: 'paid' })
      .in('id', payout.booking_ids)
  }

  return NextResponse.json({ success: true })
}
