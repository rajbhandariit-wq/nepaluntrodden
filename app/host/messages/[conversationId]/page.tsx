import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ConversationList from '@/components/messages/ConversationList'
import Thread from '@/components/messages/Thread'
import { getHostConvos } from '../page'

export default async function HostMessageThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const [convos, messagesResult, bookingResult] = await Promise.all([
    getHostConvos(user!.id),
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

  await admin
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', user!.id)
    .eq('is_read', false)

  let otherName = 'Traveller'
  let listingTitle: string | null = null

  if (booking) {
    const { data: listing } = await admin
      .from('listings')
      .select('title, guide_id, host_user_id')
      .eq('id', booking.listing_id)
      .single()

    listingTitle = listing?.title ?? null
    const hostId = listing?.guide_id ?? listing?.host_user_id
    const otherId = user!.id === hostId ? booking.user_id : hostId

    if (otherId) {
      const { data: other } = await admin.from('profiles').select('full_name, email').eq('id', otherId).single()
      otherName = other?.full_name ?? other?.email ?? 'Traveller'
    }
  } else if (initialMessages.length > 0) {
    const first = initialMessages[0]
    const otherId = first.sender_id === user!.id ? first.receiver_id : first.sender_id
    const { data: other } = await admin.from('profiles').select('full_name, email').eq('id', otherId).single()
    otherName = other?.full_name ?? other?.email ?? 'Support'
  }

  const totalUnread = convos.reduce((n, c) => n + (c.unreadCount ?? 0), 0)

  return (
    <div className="flex h-full overflow-hidden -m-4 md:-m-6">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-80 border-r border-neutral-100 shrink-0 bg-white">
        <div className="px-5 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{convos.length} conversation{convos.length !== 1 ? 's' : ''}</p>
        </div>
        <ConversationList conversations={convos} basePath="/host/messages" />
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0 bg-white">
          <Link href="/host/messages" className="text-neutral-charcoal">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="font-semibold text-sm text-neutral-charcoal leading-tight">{otherName}</p>
            {listingTitle && <p className="text-xs text-brand-green leading-tight">{listingTitle}</p>}
          </div>
        </div>

        <Thread
          conversationId={conversationId}
          myId={user!.id}
          initialMessages={initialMessages}
          otherName={otherName}
          listingTitle={listingTitle}
          postBody={{ bookingId: conversationId }}
        />
      </div>
    </div>
  )
}
