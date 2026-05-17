import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ConversationList, { type Convo } from '@/components/messages/ConversationList'
import Thread from '@/components/messages/Thread'
import { getAdminConvos } from '../page'

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const [adminConvos, messagesResult] = await Promise.all([
    getAdminConvos(),
    admin
      .from('messages')
      .select('id, body, sender_id, receiver_id, is_read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
  ])

  const initialMessages = messagesResult.data ?? []
  if (initialMessages.length === 0) notFound()

  // Derive participants from messages
  const allParticipantIds = [...new Set(initialMessages.flatMap(m => [m.sender_id, m.receiver_id]))]
  const { data: participantProfiles } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .in('id', allParticipantIds)

  const profileMap = Object.fromEntries((participantProfiles ?? []).map(p => [p.id, p]))

  // First non-admin sender's name as "other" for admin thread view
  const nonAdminId = allParticipantIds.find(id => id !== user!.id) ?? allParticipantIds[0]
  const otherProfile = profileMap[nonAdminId]
  const otherName = otherProfile?.full_name ?? otherProfile?.email ?? 'User'

  // Get listing title if this conversation has one
  const { data: firstMsg } = await admin
    .from('messages')
    .select('listing_id')
    .eq('conversation_id', conversationId)
    .not('listing_id', 'is', null)
    .limit(1)
    .single()

  let listingTitle: string | null = null
  if (firstMsg?.listing_id) {
    const { data: listing } = await admin.from('listings').select('title').eq('id', firstMsg.listing_id).single()
    listingTitle = listing?.title ?? null
  }

  // Build sidebar convos list
  const sidebarConvos: Convo[] = adminConvos.map(c => ({
    conversationId: c.conversationId,
    listingTitle: c.listingTitle,
    other: c.sender ?? c.receiver,
    lastMessage: c.lastMessage,
    lastAt: c.lastAt,
    unreadCount: 0,
  }))

  // Participant display for header
  const participant1 = profileMap[initialMessages[0].sender_id]
  const participant2 = profileMap[initialMessages[0].receiver_id]
  const name1 = participant1?.full_name ?? participant1?.email ?? 'Unknown'
  const name2 = participant2?.full_name ?? participant2?.email ?? 'Unknown'

  return (
    <div className="flex h-full overflow-hidden -m-4 md:-m-6">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-80 border-r border-neutral-100 shrink-0 bg-white">
        <div className="px-5 py-5 border-b border-neutral-100 shrink-0">
          <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>All Conversations</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{adminConvos.length} conversation{adminConvos.length !== 1 ? 's' : ''}</p>
        </div>
        <ConversationList conversations={sidebarConvos} basePath="/admin/messages" />
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 shrink-0 bg-white">
          <Link href="/admin/messages" className="text-neutral-400 hover:text-neutral-charcoal lg:hidden">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-charcoal">
              {name1}
              <span className="font-normal text-neutral-400 mx-1.5">↔</span>
              {name2}
            </p>
            {listingTitle && <p className="text-xs text-brand-green">{listingTitle}</p>}
          </div>
          <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
            Admin view
          </span>
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
