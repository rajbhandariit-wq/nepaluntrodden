import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getOwned(listingId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('id, status, host_user_id')
    .eq('id', listingId)
    .eq('host_user_id', userId)
    .single()
  return { supabase, listing: data }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing } = await getOwned(id, user.id)
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Prevent editing approved/pending listings (read-only)
  if (listing.status === 'approved' || listing.status === 'pending') {
    return NextResponse.json({ error: 'Listing cannot be edited in its current status' }, { status: 403 })
  }

  const body = await req.json()

  const { error } = await supabase
    .from('listings')
    .update({
      type:            body.type,
      title:           body.title,
      region:          body.region,
      district:        body.district || null,
      description:     body.description || null,
      cultural_note:   body.culturalNote || null,
      difficulty:      body.difficulty || null,
      duration_days:   body.durationDays ?? null,
      max_group_size:  body.maxGroupSize ?? null,
      max_altitude_m:  body.maxAltitudeM ?? null,
      price_per_person: body.pricePerPerson,
      currency:        body.currency ?? 'USD',
      included:        body.included ?? [],
      excluded:        body.excluded ?? [],
      tags:            body.tags ?? [],
      best_months:     body.bestMonths ?? [],
      is_hidden_gem:   body.isHiddenGem ?? false,
      latitude:        body.latitude ?? null,
      longitude:       body.longitude ?? null,
      images:          body.images ?? [],
      status:          body.status ?? 'draft',
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing } = await getOwned(id, user.id)
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { status } = listing

  if (status !== 'draft' && status !== 'pending' && status !== 'approved') {
    return NextResponse.json({ error: 'This listing cannot be deleted' }, { status: 403 })
  }

  // Approved listings: block if active bookings exist
  if (status === 'approved') {
    const { data: active } = await supabase
      .from('bookings')
      .select('id')
      .eq('listing_id', id)
      .in('status', ['confirmed', 'pending'])
      .limit(1)

    if (active && active.length > 0) {
      return NextResponse.json(
        { error: 'This listing has active bookings and cannot be deleted. Cancel all bookings first.' },
        { status: 409 }
      )
    }
  }

  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
