'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, KeyRound, ChevronDown, ChevronUp, PauseCircle, PlayCircle } from 'lucide-react'

interface Props {
  userId: string
  userEmail: string
  status: string
}

export default function UserActions({ userId, userEmail, status }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  async function updateStatus(newStatus: string, rejectionReason?: string) {
    setBusy(newStatus)
    setMsg(null)

    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason: rejectionReason }),
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

  async function sendPasswordReset() {
    setBusy('reset-password')
    setMsg(null)

    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    })

    const json = await res.json()
    setMsg({
      type: res.ok ? 'ok' : 'err',
      text: json.message ?? json.error ?? 'Something went wrong.',
    })
    setBusy(null)
  }

  return (
    <div className="space-y-3">
      {msg && (
        <div className={`rounded-xl px-4 py-2.5 text-sm ${
          msg.type === 'ok'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-status-error border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">

        {/* ── Pending: approve or reject ── */}
        {status === 'pending' && (
          <>
            <button
              onClick={() => updateStatus('active')}
              disabled={!!busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle size={15} />
              {busy === 'active' ? 'Approving…' : 'Approve'}
            </button>

            <button
              onClick={() => setShowReject(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-red-200 text-status-error text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <XCircle size={15} />
              Reject
              {showReject ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </>
        )}

        {/* ── Active: deactivate only (no reject) ── */}
        {status === 'active' && (
          <button
            onClick={() => updateStatus('inactive')}
            disabled={!!busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-amber-300 text-amber-700 text-sm font-semibold disabled:opacity-60 hover:bg-amber-50 transition-colors"
          >
            <PauseCircle size={15} />
            {busy === 'inactive' ? 'Deactivating…' : 'Deactivate account'}
          </button>
        )}

        {/* ── Inactive: reactivate only ── */}
        {status === 'inactive' && (
          <button
            onClick={() => updateStatus('active')}
            disabled={!!busy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 hover:bg-emerald-700 transition-colors"
          >
            <PlayCircle size={15} />
            {busy === 'active' ? 'Reactivating…' : 'Reactivate account'}
          </button>
        )}

        {/* Reset password — always available */}
        <button
          onClick={sendPasswordReset}
          disabled={!!busy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-neutral-light text-neutral-charcoal text-sm font-semibold disabled:opacity-60 hover:bg-neutral-pale transition-colors"
        >
          <KeyRound size={15} />
          {busy === 'reset-password' ? 'Sending…' : 'Send password reset'}
        </button>
      </div>

      {/* Reject reason form */}
      {showReject && status === 'pending' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-status-error">Rejection reason (shown to user)</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Documents could not be verified. Please re-submit."
            className="input-field resize-none text-sm"
          />
          <button
            onClick={() => {
              if (!reason.trim()) { setMsg({ type: 'err', text: 'Please enter a rejection reason.' }); return }
              updateStatus('rejected', reason)
            }}
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
