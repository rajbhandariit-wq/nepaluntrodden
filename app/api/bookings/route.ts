import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  // Server-side availability check
  if (body.dateFrom && body.dateTo && body.listingId) {
    const { data: overlap } = await admin
      .from('bookings')
      .select('id')
      .eq('listing_id', body.listingId)
      .in('status', ['confirmed', 'pending'])
      .lte('date_from', body.dateTo)
      .gte('date_to', body.dateFrom)
      .limit(1)

    if (overlap && overlap.length > 0) {
      return NextResponse.json(
        { error: 'These dates are no longer available. Please choose different dates.' },
        { status: 409 }
      )
    }
  }

  // Insert booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      listing_id:        body.listingId,
      user_id:           user.id,
      date_from:         body.dateFrom || null,
      date_to:           body.dateTo || null,
      num_adults:        body.numAdults,
      num_children:      body.numChildren,
      addons:            body.addons,
      payment_method:    body.paymentMethod,
      message_to_host:   body.messageToHost,
      include_insurance: body.includeInsurance,
      base_total:        body.baseTotal,
      addons_total:      body.addonsTotal,
      platform_fee:      body.platformFee,
      insurance_fee:     body.insuranceFee,
      grand_total:       body.grandTotal,
      status:            'confirmed',
      host_payout_status: 'pending',
    })
    .select('id, booking_ref')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Create transaction record — best-effort, don't fail the booking if this errors
  try {
    await createTransactionForBooking({
      admin,
      bookingId:     booking.id,
      travelerId:    user.id,
      listingId:     body.listingId,
      grossAmount:   Number(body.grandTotal ?? 0),
      paymentMethod: body.paymentMethod ?? 'cash',
    })
  } catch (txErr) {
    console.error('[billing] failed to create transaction:', txErr)
  }

  return NextResponse.json({ booking_ref: booking.booking_ref })
}

async function createTransactionForBooking({
  admin,
  bookingId,
  travelerId,
  listingId,
  grossAmount,
  paymentMethod,
}: {
  admin: ReturnType<typeof createAdminClient>
  bookingId: string
  travelerId: string
  listingId: string
  grossAmount: number
  paymentMethod: string
}) {
  // Resolve host: listing → guide_id → guides.user_id
  const { data: listing } = await admin
    .from('listings')
    .select('guide_id, commission_rate, guides(user_id)')
    .eq('id', listingId)
    .single()

  const commissionRate = Number(listing?.commission_rate ?? 20) / 100
  const commissionAmount = +(grossAmount * commissionRate).toFixed(2)
  const netPayout = +(grossAmount - commissionAmount).toFixed(2)

  const guideRow = listing?.guides as { user_id: string } | null
  const hostId   = guideRow?.user_id ?? null

  await admin.from('transactions').insert({
    booking_id:        bookingId,
    traveler_id:       travelerId,
    host_id:           hostId,
    gross_amount:      grossAmount,
    commission_amount: commissionAmount,
    net_payout:        netPayout,
    payment_method:    paymentMethod,
    payment_status:    'pending',
    transaction_ref:   `TXN-${bookingId.slice(0, 8).toUpperCase()}`,
  })
}
