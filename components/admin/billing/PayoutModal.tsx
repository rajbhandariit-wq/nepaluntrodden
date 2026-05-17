'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { formatCurrency, NEPAL_BANKS } from '@/lib/billing/formatters'

interface Props {
  payoutId: string
  hostName: string
  amount: number
  bookingCount: number
  onClose: () => void
  onSuccess: () => void
}

export default function PayoutModal({ payoutId, hostName, amount, bookingCount, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<'bank_transfer' | 'khalti' | 'esewa'>('bank_transfer')
  const [bankName, setBankName] = useState('')
  const [accountRef, setAccountRef] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMark() {
    if (!paymentRef.trim()) { setError('Payment reference is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/billing/payouts/${payoutId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_reference: paymentRef,
          payout_method: method,
          payout_account_ref: accountRef,
          bank_name: method === 'bank_transfer' ? bankName : undefined,
          notes,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Mark as Paid</h2>
          <button onClick={onClose} className="text-neutral-mid hover:text-neutral-charcoal"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-brand-green-pale rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-neutral-charcoal">{hostName}</p>
              <p className="text-xs text-neutral-mid">{bookingCount} booking{bookingCount !== 1 ? 's' : ''}</p>
            </div>
            <p className="text-xl font-bold text-brand-green">{formatCurrency(amount)}</p>
          </div>

          {/* Method */}
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Payout method</label>
            <div className="flex gap-2">
              {(['bank_transfer', 'khalti', 'esewa'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${method === m ? 'bg-brand-green text-white border-brand-green' : 'border-neutral-light text-neutral-mid hover:border-brand-green'}`}
                >
                  {m === 'bank_transfer' ? 'Bank' : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {method === 'bank_transfer' && (
            <div>
              <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Bank</label>
              <select value={bankName} onChange={e => setBankName(e.target.value)} className="input-field">
                <option value="">Select bank...</option>
                {NEPAL_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">
              {method === 'bank_transfer' ? 'Account (masked, e.g. ****1234)' : 'Wallet ID / email (masked)'}
            </label>
            <input
              type="text" value={accountRef}
              onChange={e => setAccountRef(e.target.value)}
              className="input-field" placeholder="****1234"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Payment reference *</label>
            <input
              type="text" value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              className="input-field" placeholder="Gateway transaction ID or voucher no."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Notes (optional)</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              className="input-field resize-none" rows={2}
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">Cancel</button>
            <button
              onClick={handleMark}
              disabled={loading}
              className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Confirm payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
