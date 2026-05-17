'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  listingId: string
  status: string
}

export default function ListingActions({ listingId, status }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  async function act(newStatus: 'approved' | 'rejected') {
    setBusy(newStatus)
    setMsg(null)

    if (newStatus === 'rejected' && !reason.trim()) {
      setMsg({ type: 'err', text: 'Please enter a rejection reason.' })
      setBusy(null)
      return
    }

    const res = await fetch(`/api/admin/listings/${listingId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason }),
    })

    const json = await res.json()
    if (!res.ok) {
      setMsg({ type: 'err', text: json.error ?? 'Something went wrong.' })
    } else {
      setMsg({ type: 'ok', text: json.message ?? 'Done.' })
      setShowReject(false)
      setReason('')
      router.refresh()
    }
    setBusy(null)
  }

  return (
    <div className="space-y-3">
      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-status-error border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status !== 'approved' && (
          <button
            onClick={() => act('approved')}
            disabled={!!busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle size={15} />
            {busy === 'approved' ? 'Approving…' : 'Approve listing'}
          </button>
        )}

        {status !== 'rejected' && (
          <button
            onClick={() => setShowReject(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-red-200 text-status-error text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <XCircle size={15} />
            Reject
            {showReject ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {showReject && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-status-error">Rejection reason (shown to host)</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Listing images are unclear. Please upload higher quality photos."
            className="input-field resize-none text-sm"
          />
          <button
            onClick={() => act('rejected')}
            disabled={!!busy}
            className="px-4 py-2 rounded-xl bg-status-error text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
          >
            {busy === 'rejected' ? 'Rejecting…' : 'Confirm rejection'}
          </button>
        </div>
      )}
    </div>
  )
}
