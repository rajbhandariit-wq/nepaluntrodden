'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

type User = { id: string; full_name: string | null; email: string; role: string }

export default function AdminCompose({ users }: { users: User[] }) {
  const [receiverId, setReceiverId] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function send() {
    if (!receiverId || !body.trim()) return
    setSending(true)
    setError('')
    try {
      const r = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, body: body.trim() }),
      })
      const d = await r.json()
      if (r.ok) {
        router.push(`/admin/messages/${d.conversationId}`)
        router.refresh()
      } else {
        setError(d.error ?? 'Failed to send message.')
      }
    } catch {
      setError('Network error.')
    }
    setSending(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 text-left">
      <p className="text-sm font-semibold text-neutral-charcoal mb-4">New Message</p>

      <div className="mb-3">
        <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Recipient</label>
        <select
          value={receiverId}
          onChange={e => setReceiverId(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green text-neutral-charcoal"
        >
          <option value="">Select a user…</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.full_name ?? u.email} ({u.role})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Message</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Type your message…"
          rows={4}
          className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green placeholder:text-neutral-400 text-neutral-charcoal"
        />
      </div>

      {error && <p className="text-xs text-status-error mb-3">{error}</p>}

      <button
        onClick={send}
        disabled={sending || !receiverId || !body.trim()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        <Send size={14} />
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </div>
  )
}
