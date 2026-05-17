import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'
import { calculateRefund } from '@/lib/billing/calculateRefund'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { bookingId } = await params
  const body = await request.json() as { override_amount?: number; reason?: string }

  // Load booking + transaction
  const { data: booking } = await guard.admin
    .from('bookings')
    .select('id, booking_ref, date_from, grand_total, status, user_id')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { data: transaction } = await guard.admin
    .from('transactions')
    .select('id, gross_amount, payment_status, refund_amount')
    .eq('booking_id', bookingId)
    .single()

  if (!transaction) return NextResponse.json({ error: 'No transaction for this booking' }, { status: 404 })
  if (transaction.payment_status === 'refunded') return NextResponse.json({ error: 'Already fully refunded' }, { status: 409 })
  if (transaction.payment_status !== 'captured') return NextResponse.json({ error: 'Payment not captured — nothing to refund' }, { status: 400 })

  // Calculate refund using policy, or use admin override
  let refundAmount: number
  let policy: string

  if (typeof body.override_amount === 'number') {
    refundAmount = Math.min(body.override_amount, Number(transaction.gross_amount))
    policy = 'admin_override'
  } else {
    const result = calculateRefund(
      new Date(booking.date_from),
      new Date(),
      Number(transaction.gross_amount),
      true,
    )
    refundAmount = result.refundAmount
    policy = result.policy
  }

  const isFullRefund = refundAmount >= Number(transaction.gross_amount)

  // Update transaction
  const { error } = await guard.admin
    .from('transactions')
    .update({
      payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
      refund_amount: refundAmount,
      refund_policy: policy,
      metadata: { refund_reason: body.reason ?? 'Admin manual refund', refunded_at: new Date().toISOString() },
    })
    .eq('id', transaction.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update booking status
  await guard.admin
    .from('bookings')
    .update({ status: 'cancelled', cancellation_fee_charged: !isFullRefund })
    .eq('id', bookingId)

  // NOTE: Actual gateway refund call (Khalti/Stripe) goes here.
  // TODO: call gateway.refund(transaction.transaction_ref, refundAmount)

  return NextResponse.json({ success: true, refundAmount, policy })
}
