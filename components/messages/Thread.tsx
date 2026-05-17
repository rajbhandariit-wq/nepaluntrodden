'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'

type Message = {
  id: string
  body: string
  sender_id: string
  receiver_id: string
  is_read: boolean
  created_at: string
}

type Props = {
  conversationId: string
  myId: string
  initialMessages: Message[]
  otherName: string
  listingTitle?: string | null
  postBody: Record<string, unknown>
  readOnly?: boolean
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Thread({
  conversationId,
  myId,
  initialMessages,
  otherName,
  listingTitle,
  postBody,
  readOnly = false,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchMessages = async () => {
    const r = await fetch(`/api/messages/${conversationId}`, { cache: 'no-store' })
    if (r.ok) setMessages(await r.json())
  }

  useEffect(() => {
    const iv = setInterval(fetchMessages, 5000)
    return () => clearInterval(iv)
  }, [conversationId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const r = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...postBody, body: input.trim() }),
      })
      if (r.ok) {
        setInput('')
        await fetchMessages()
      } else {
        const d = await r.json()
        setError(d.error ?? 'Failed to send message.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-light flex items-center justify-center text-xs font-bold text-neutral-charcoal shrink-0">
            {(otherName.split(' ').map(w => w[0]).slice(0, 2).join('') || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-charcoal leading-tight">{otherName}</p>
            {listingTitle && (
              <p className="text-xs text-brand-green leading-tight">{listingTitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-stone-50/60">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <p className="text-sm text-neutral-400">No messages yet. Say hello!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine = msg.sender_id === myId
          const prev = messages[i - 1]
          const sameAsPrev = prev && prev.sender_id === msg.sender_id

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${sameAsPrev ? 'mt-1' : 'mt-3'}`}>
              <div
                className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? 'bg-brand-green text-white rounded-2xl rounded-br-md'
                    : 'bg-white text-neutral-charcoal shadow-sm rounded-2xl rounded-bl-md border border-neutral-100'
                }`}
              >
                {msg.body}
              </div>
              <p className={`text-[11px] mt-1 ${isMine ? 'text-neutral-400' : 'text-neutral-400'}`}>
                {formatTime(msg.created_at)}
              </p>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      {!readOnly && (
        <div className="px-4 py-3 bg-white border-t border-neutral-100 shrink-0">
          {error && (
            <p className="text-xs text-status-error mb-2">{error}</p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 resize-none rounded-3xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green placeholder:text-neutral-400 text-neutral-charcoal transition-colors"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 pl-1">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  )
}
