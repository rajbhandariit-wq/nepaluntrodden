import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import AdminCompose from '@/components/admin/AdminCompose'

export async function getAdminConvos() {
  const admin = createAdminClient()
  const { data: messages } = await admin
    .from('messages')
    .select('id, conversation_id, body, is_read, created_at, sender_id, receiver_id, listing_id')
    .order('created_at', { ascending: false })

  const convMap = new Map<string, NonNullable<typeof messages>[number]>()
  for (const msg of messages ?? []) {
    if (!convMap.has(msg.conversation_id)) convMap.set(msg.conversation_id, msg)
  }
  const latest = [...convMap.values()]

  const allIds = [...new Set(latest.flatMap(c => [c.sender_id, c.receiver_id]).filter(Boolean))]
  const listingIds = [...new Set(latest.map(c => c.listing_id).filter(Boolean))]

  const [{ data: profiles }, { data: listings }] = await Promise.all([
    allIds.length ? admin.from('profiles').select('id, full_name, email, role').in('id', allIds) : Promise.resolve({ data: [] }),
    listingIds.length ? admin.from('listings').select('id, title').in('id', listingIds) : Promise.resolve({ data: [] }),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const listingMap = Object.fromEntries((listings ?? []).map(l => [l.id, l.title as string]))

  return latest.map(c => ({
    conversationId: c.conversation_id,
    listingTitle: c.listing_id ? (listingMap[c.listing_id] ?? null) : null,
    sender: profileMap[c.sender_id] as { id: string; full_name: string | null; email: string } | null,
    receiver: profileMap[c.receiver_id] as { id: string; full_name: string | null; email: string } | null,
    lastMessage: c.body,
    lastAt: c.created_at,
    isUnread: !c.is_read,
  }))
}

function displayName(p: { full_name: string | null; email: string } | null) {
  return p?.full_name ?? p?.email ?? 'Unknown'
}

function initials(p: { full_name: string | null; email: string } | null) {
  const name = p?.full_name ?? p?.email ?? '?'
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString()
}

export default async function AdminMessagesPage() {
  const admin = createAdminClient()
  const convos = await getAdminConvos()

  // Fetch all non-admin users for compose panel
  const { data: users } = await admin
    .from('profiles')
    .select('id, full_name, email, role')
    .neq('role', 'admin')
    .order('full_name')

  return (
    <div className="flex h-full overflow-hidden -m-4 md:-m-6">
      {/* Conversation list */}
      <div className="flex flex-col w-full md:w-80 lg:w-96 border-r border-neutral-100 shrink-0 bg-white">
        <div className="px-5 py-5 border-b border-neutral-100 shrink-0">
          <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
            All Conversations
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">{convos.length} conversation{convos.length !== 1 ? 's' : ''}</p>
        </div>

        {convos.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-sm font-semibold text-neutral-charcoal mb-1">No conversations yet</p>
            <p className="text-xs text-neutral-400">Conversations between travellers and hosts will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {convos.map(conv => (
              <Link
                key={conv.conversationId}
                href={`/admin/messages/${conv.conversationId}`}
                className="flex items-start gap-3 px-4 py-4 border-b border-neutral-100 hover:bg-stone-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-brand-green-pale flex items-center justify-center text-brand-green font-bold text-xs shrink-0">
                  {initials(conv.sender)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-neutral-charcoal truncate">
                      {displayName(conv.sender)}
                      <span className="font-normal text-neutral-400 mx-1">↔</span>
                      {displayName(conv.receiver)}
                    </p>
                    <span className="text-[11px] text-neutral-400 shrink-0">{relativeTime(conv.lastAt)}</span>
                  </div>
                  {conv.listingTitle && (
                    <p className="text-[11px] text-brand-green font-medium truncate mb-0.5">{conv.listingTitle}</p>
                  )}
                  <p className="text-xs text-neutral-400 truncate">{conv.lastMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right panel: compose + empty state */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <p className="font-semibold text-neutral-charcoal mb-1">Select a conversation to view it</p>
          <p className="text-sm text-neutral-400 mb-6">Or send a new message to any user below.</p>
          <div className="w-full max-w-md">
            <AdminCompose users={(users ?? []) as { id: string; full_name: string | null; email: string; role: string }[]} />
          </div>
        </div>
      </div>
    </div>
  )
}
