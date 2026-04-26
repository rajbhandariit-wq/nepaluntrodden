import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      listing_id:       body.listingId,
      user_id:          user.id,
      date_from:        body.dateFrom || null,
      date_to:          body.dateTo || null,
      num_adults:       body.numAdults,
      num_children:     body.numChildren,
      addons:           body.addons,
      payment_method:   body.paymentMethod,
      message_to_host:  body.messageToHost,
      include_insurance: body.includeInsurance,
      base_total:       body.baseTotal,
      addons_total:     body.addonsTotal,
      platform_fee:     body.platformFee,
      insurance_fee:    body.insuranceFee,
      grand_total:      body.grandTotal,
      status:           'confirmed',
    })
    .select('booking_ref')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
