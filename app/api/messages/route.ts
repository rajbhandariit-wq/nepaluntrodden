import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/messages — conversation list for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: messages } = await admin
    .from('messages')
    .select('id, conversation_id, body, is_read, created_at, sender_id, receiver_id, listing_id')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Keep only the latest message per conversation
  const convMap = new Map<string, NonNullable<typeof messages>[number]>()
  for (const msg of messages ?? []) {
    if (!convMap.has(msg.conversation_id)) convMap.set(msg.conversation_id, msg)
  }
  const convos = [...convMap.values()]

  const otherIds = [...new Set(convos.map(c =>
    c.sender_id === user.id ? c.receiver_id : c.sender_id
  ).filter(Boolean))]
  const listingIds = [...new Set(convos.map(c => c.listing_id).filter(Boolean))]

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    otherIds.length
      ? admin.from('profiles').select('id, full_name, email').in('id', otherIds)
      : Promise.resolve({ data: [] }),
    listingIds.length
      ? admin.from('listings').select('id, title').in('id', listingIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const listingMap = Object.fromEntries((listings ?? []).map(l => [l.id, l.title as string]))

  // Count unread per conversation
  const unread: Record<string, number> = {}
  for (const msg of messages ?? []) {
    if (!msg.is_read && msg.receiver_id === user.id) {
      unread[msg.conversation_id] = (unread[msg.conversation_id] ?? 0) + 1
    }
  }

  return NextResponse.json(convos.map(c => {
    const otherId = c.sender_id === user.id ? c.receiver_id : c.sender_id
    return {
      conversationId: c.conversation_id,
      listingId: c.listing_id ?? null,
      listingTitle: c.listing_id ? (listingMap[c.listing_id] ?? null) : null,
      other: profileMap[otherId] ?? null,
      lastMessage: c.body,
      lastAt: c.created_at,
      unreadCount: unread[c.conversation_id] ?? 0,
    }
  }))
}

// POST /api/messages — send a message (booking-validated)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId, body } = await request.json()
  if (!bookingId || !body?.trim()) {
    return NextResponse.json({ error: 'bookingId and body are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check sender role — admins bypass booking validation
  const { data: senderProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = senderProfile?.role === 'admin'

  if (isAdmin) {
    // Admin replying in an existing conversation — find participants
    const { data: existing } = await admin
      .from('messages')
      .select('sender_id, receiver_id, listing_id')
      .eq('conversation_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!existing) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const receiverId = existing.sender_id === user.id ? existing.receiver_id : existing.sender_id
    const { data: msg, error } = await supabase
      .from('messages')
      .insert({ conversation_id: bookingId, listing_id: existing.listing_id, sender_id: user.id, receiver_id: receiverId, body: body.trim() })
      .select('id, created_at')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(msg, { status: 201 })
  }

  // Non-admin: validate confirmed booking
  const { data: booking } = await admin
    .from('bookings')
    .select('id, status, user_id, listing_id')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Messaging is only available for confirmed bookings.' }, { status: 403 })
  }

  const { data: listing } = await admin
    .from('listings')
    .select('guide_id, host_user_id')
    .eq('id', booking.listing_id)
    .single()

  const hostId = listing?.guide_id ?? listing?.host_user_id
  const travellerId = booking.user_id

  if (user.id !== travellerId && user.id !== hostId) {
    return NextResponse.json({ error: 'You are not a participant in this booking.' }, { status: 403 })
  }

  const receiverId = user.id === travellerId ? hostId : travellerId

  const { data: msg, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: bookingId,
      listing_id: booking.listing_id,
      sender_id: user.id,
      receiver_id: receiverId,
      body: body.trim(),
    })
    .select('id, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(msg, { status: 201 })
}
