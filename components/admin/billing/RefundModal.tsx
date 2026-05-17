'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { calculateRefund } from '@/lib/billing/calculateRefund'
import { formatCurrency } from '@/lib/billing/formatters'

interface Props {
  bookingId: string
  bookingRef: string
  startDate: string
  grossAmount: number
  onClose: () => void
  onSuccess: () => void
}

export default function RefundModal({ bookingId, bookingRef, startDate, grossAmount, onClose, onSuccess }: Props) {
  const [override, setOverride] = useState(false)
  const [overrideAmount, setOverrideAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const policy = calculateRefund(new Date(startDate), new Date(), grossAmount, true)
  const displayAmount = override ? Number(overrideAmount) || 0 : policy.refundAmount

  async function handleRefund() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/billing/refund/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(override ? { override_amount: Number(overrideAmount) } : {}),
          reason,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const policyLabel = { full: 'Full refund (>72h)', partial: '80% refund (24–72h)', none: 'No refund (<24h)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
            Issue Refund — {bookingRef}
          </h2>
          <button onClick={onClose} className="text-neutral-mid hover:text-neutral-charcoal">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Policy summary */}
          <div className="bg-neutral-pale rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-mid">Trek start</span>
              <span className="font-medium">{new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-mid">Hours to start</span>
              <span className="font-medium">{policy.hoursToStart > 0 ? `${policy.hoursToStart.toFixed(1)}h` : 'Past'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-mid">Policy</span>
              <span className={`font-semibold ${policy.policy === 'full' ? 'text-emerald-600' : policy.policy === 'partial' ? 'text-amber-600' : 'text-red-600'}`}>
                {policyLabel[policy.policy]}
              </span>
            </div>
            <div className="border-t border-neutral-light pt-2 flex justify-between">
              <span className="text-neutral-mid">Gross paid</span>
              <span className="font-medium">{formatCurrency(grossAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-mid">Policy refund</span>
              <span className="font-semibold text-brand-green">{formatCurrency(policy.refundAmount)}</span>
            </div>
            {policy.platformKeeps > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-mid">Platform keeps</span>
                <span className="font-medium">{formatCurrency(policy.platformKeeps)}</span>
              </div>
            )}
            {policy.hostKeeps > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-mid">Host compensation</span>
                <span className="font-medium">{formatCurrency(policy.hostKeeps)}</span>
              </div>
            )}
          </div>

          {/* Override toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)} className="rounded" />
            <span className="text-neutral-charcoal font-medium">Override refund amount</span>
          </label>

          {override && (
            <div>
              <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Override amount (NPR)</label>
              <input
                type="number" min={0} max={grossAmount}
                value={overrideAmount}
                onChange={e => setOverrideAmount(e.target.value)}
                className="input-field"
                placeholder={`Max ${grossAmount}`}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Reason (optional)</label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)}
              className="input-field resize-none" rows={2}
              placeholder="Weather cancellation, guest request..."
            />
          </div>

          {policy.policy === 'none' && !override && (
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>Policy says no refund. Use the override option to issue a discretionary refund.</span>
            </div>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
            <button
              onClick={handleRefund}
              disabled={loading || (policy.policy === 'none' && !override) || (override && !overrideAmount)}
              className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Refund ${formatCurrency(displayAmount)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
