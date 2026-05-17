'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type Convo = {
  conversationId: string
  listingTitle: string | null
  other: { id: string; full_name: string | null; email: string } | null
  lastMessage: string
  lastAt: string
  unreadCount?: number
}

function initials(name: string | null | undefined, email: string) {
  if (name) return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function ConversationList({
  conversations,
  basePath,
  emptyText = 'No messages yet',
}: {
  conversations: Convo[]
  basePath: string
  emptyText?: string
}) {
  const pathname = usePathname()

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
        <div className="w-14 h-14 rounded-full bg-neutral-light flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm font-semibold text-neutral-charcoal mb-1">{emptyText}</p>
        <p className="text-xs text-neutral-mid">Your conversations will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto flex-1">
      {conversations.map(conv => {
        const href = `${basePath}/${conv.conversationId}`
        const isActive = pathname.startsWith(href)
        const name = conv.other?.full_name ?? conv.other?.email ?? 'Unknown'
        const unread = conv.unreadCount ?? 0

        return (
          <Link
            key={conv.conversationId}
            href={href}
            className={`flex items-start gap-3 px-4 py-4 border-b border-neutral-100 transition-colors hover:bg-stone-50 ${
              isActive ? 'bg-stone-50' : 'bg-white'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                unread > 0 ? 'bg-brand-green text-white' : 'bg-neutral-light text-neutral-charcoal'
              }`}
            >
              {initials(conv.other?.full_name, conv.other?.email ?? '?')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-neutral-charcoal' : 'font-medium text-neutral-600'}`}>
                  {name}
                </p>
                <span className="text-[11px] text-neutral-400 shrink-0">{relativeTime(conv.lastAt)}</span>
              </div>

              {conv.listingTitle && (
                <p className="text-[11px] text-brand-green font-medium truncate mb-0.5">
                  {conv.listingTitle}
                </p>
              )}

              <div className="flex items-center gap-2">
                <p className={`text-xs truncate flex-1 ${unread > 0 ? 'text-neutral-700 font-medium' : 'text-neutral-400'}`}>
                  {conv.lastMessage}
                </p>
                {unread > 0 && (
                  <span className="bg-brand-green text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                    {unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
