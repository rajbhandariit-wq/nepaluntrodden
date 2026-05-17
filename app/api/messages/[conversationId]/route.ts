import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/messages/[conversationId] — fetch thread + mark as read
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: messages } = await admin
    .from('messages')
    .select('id, body, sender_id, receiver_id, is_read, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  // Non-admin must be a participant
  if (!isAdmin && (messages ?? []).length > 0) {
    const isParticipant = (messages ?? []).some(
      m => m.sender_id === user.id || m.receiver_id === user.id
    )
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Mark unread messages as read
  await admin
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  return NextResponse.json(messages ?? [])
}
