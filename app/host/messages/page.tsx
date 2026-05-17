import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ConversationList, { type Convo } from '@/components/messages/ConversationList'

export async function getHostConvos(userId: string): Promise<Convo[]> {
  const admin = createAdminClient()
  const { data: messages } = await admin
    .from('messages')
    .select('id, conversation_id, body, is_read, created_at, sender_id, receiver_id, listing_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  const convMap = new Map<string, NonNullable<typeof messages>[number]>()
  for (const msg of messages ?? []) {
    if (!convMap.has(msg.conversation_id)) convMap.set(msg.conversation_id, msg)
  }
  const latest = [...convMap.values()]

  const otherIds = [...new Set(latest.map(c => c.sender_id === userId ? c.receiver_id : c.sender_id).filter(Boolean))]
  const listingIds = [...new Set(latest.map(c => c.listing_id).filter(Boolean))]

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    otherIds.length ? admin.from('profiles').select('id, full_name, email').in('id', otherIds) : Promise.resolve({ data: [] }),
    listingIds.length ? admin.from('listings').select('id, title').in('id', listingIds) : Promise.resolve({ data: [] }),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const listingMap = Object.fromEntries((listings ?? []).map(l => [l.id, l.title as string]))

  const unread: Record<string, number> = {}
  for (const msg of messages ?? []) {
    if (!msg.is_read && msg.receiver_id === userId)
      unread[msg.conversation_id] = (unread[msg.conversation_id] ?? 0) + 1
  }

  return latest.map(c => {
    const otherId = c.sender_id === userId ? c.receiver_id : c.sender_id
    return {
      conversationId: c.conversation_id,
      listingTitle: c.listing_id ? (listingMap[c.listing_id] ?? null) : null,
      other: profileMap[otherId] ?? null,
      lastMessage: c.body,
      lastAt: c.created_at,
      unreadCount: unread[c.conversation_id] ?? 0,
    }
  })
}

export default async function HostMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const convos = await getHostConvos(user!.id)
  const totalUnread = convos.reduce((n, c) => n + (c.unreadCount ?? 0), 0)

  return (
    <div className="flex h-full overflow-hidden -m-4 md:-m-6">
      <div className="flex flex-col w-full md:w-80 md:border-r md:border-neutral-100 md:shrink-0 bg-white">
        <div className="px-5 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-brand-green text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{convos.length} conversation{convos.length !== 1 ? 's' : ''}</p>
        </div>
        <ConversationList conversations={convos} basePath="/host/messages" emptyText="No messages from travellers yet" />
      </div>

      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-stone-50/60 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <p className="font-semibold text-neutral-charcoal mb-1">Select a conversation</p>
        <p className="text-sm text-neutral-400">Messages from travellers about your listings appear here.</p>
      </div>
    </div>
  )
}
