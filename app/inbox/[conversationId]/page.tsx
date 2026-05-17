import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ConversationList from '@/components/messages/ConversationList'
import Thread from '@/components/messages/Thread'
import { getConvos } from '../page'

export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch conversations for sidebar + initial messages + booking context in parallel
  const [convos, messagesResult, bookingResult] = await Promise.all([
    getConvos(user.id),
    admin
      .from('messages')
      .select('id, body, sender_id, receiver_id, is_read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
    admin
      .from('bookings')
      .select('user_id, listing_id, status')
      .eq('id', conversationId)
      .single(),
  ])

  const initialMessages = messagesResult.data ?? []
  const booking = bookingResult.data

  // Mark unread as read for current user
  await admin
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  let otherName = 'Guide'
  let listingTitle: string | null = null

  if (booking) {
    const { data: listing } = await admin
      .from('listings')
      .select('title, guide_id, host_user_id')
      .eq('id', booking.listing_id)
      .single()

    listingTitle = listing?.title ?? null
    const hostId = listing?.guide_id ?? listing?.host_user_id
    const otherId = user.id === booking.user_id ? hostId : booking.user_id

    if (otherId) {
      const { data: other } = await admin
        .from('profiles')
        .select('full_name, email')
        .eq('id', otherId)
        .single()
      otherName = other?.full_name ?? other?.email ?? 'Guide'
    }
  } else if (initialMessages.length > 0) {
    // Derive other participant from messages (admin-initiated conversation)
    const first = initialMessages[0]
    const otherId = first.sender_id === user.id ? first.receiver_id : first.sender_id
    const { data: other } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', otherId)
      .single()
    otherName = other?.full_name ?? other?.email ?? 'Support'
  }

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex flex-col w-80 border-r border-neutral-100 shrink-0 bg-white">
        <div className="px-5 py-5 border-b border-neutral-100 shrink-0">
          <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Messages</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{convos.length} conversation{convos.length !== 1 ? 's' : ''}</p>
        </div>
        <ConversationList conversations={convos} basePath="/inbox" />
      </div>

      {/* Thread panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile back button */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0 bg-white">
          <Link href="/inbox" className="text-neutral-charcoal">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="font-semibold text-sm text-neutral-charcoal leading-tight">{otherName}</p>
            {listingTitle && <p className="text-xs text-brand-green leading-tight">{listingTitle}</p>}
          </div>
        </div>

        <Thread
          conversationId={conversationId}
          myId={user.id}
          initialMessages={initialMessages}
          otherName={otherName}
          listingTitle={listingTitle}
          postBody={{ bookingId: conversationId }}
        />
      </div>
    </div>
  )
}
