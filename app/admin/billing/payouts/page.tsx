'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_STYLES } from '@/lib/billing/formatters'
import PayoutModal from '@/components/admin/billing/PayoutModal'

type Payout = {
  id: string; host_id: string; amount: number; status: string;
  payout_method: string | null; payout_account_ref: string | null;
  bank_name: string | null; booking_ids: string[];
  period_start: string | null; period_end: string | null;
  paid_at: string | null; payment_reference: string | null; notes: string | null;
  created_at: string;
  host: { id: string; full_name: string } | null
}

export default function PayoutsPage() {
  const [tab, setTab]                 = useState<'pending' | 'paid'>('pending')
  const [payouts, setPayouts]         = useState<Payout[]>([])
  const [pendingTotal, setPendingTotal] = useState(0)
  const [paidTotal, setPaidTotal]     = useState(0)
  const [loading, setLoading]         = useState(true)
  const [marking, setMarking]         = useState<Payout | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/billing/payouts?status=${tab}`)
    const json = await res.json()
    setPayouts(json.data ?? [])
    setPendingTotal(json.pendingTotal ?? 0)
    setPaidTotal(json.paidTotal ?? 0)
    setLoading(false)
  }, [tab])

  useEffect(() => { void load() }, [load])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Payout Manager</h1>
        <p className="text-sm text-neutral-mid">Host settlement — review before releasing funds</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">Pending Payouts</p>
          </div>
          <p className="text-2xl font-bold text-neutral-charcoal">{formatCurrency(pendingTotal)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={15} className="text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700">Total Paid Out</p>
          </div>
          <p className="text-2xl font-bold text-neutral-charcoal">{formatCurrency(paidTotal)}</p>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-1 bg-neutral-pale rounded-xl p-1 w-fit mb-4">
        {(['pending', 'paid'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-neutral-charcoal shadow-sm' : 'text-neutral-mid hover:text-neutral-charcoal'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Payout cards */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-neutral-mid py-8 text-center">Loading...</p>}
        {!loading && payouts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <p className="text-sm text-neutral-mid">No {tab} payouts.</p>
          </div>
        )}
        {payouts.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-neutral-charcoal">{p.host?.full_name ?? 'Unknown host'}</p>
                <p className="text-xs text-neutral-mid mt-0.5">
                  {p.booking_ids?.length ?? 0} booking{(p.booking_ids?.length ?? 0) !== 1 ? 's' : ''}
                  {p.period_start && p.period_end ? ` · ${formatDate(p.period_start)} – ${formatDate(p.period_end)}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-neutral-charcoal">{formatCurrency(p.amount)}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[p.status] ?? ''}`}>
                  {p.status}
                </span>
              </div>
            </div>

            {p.status === 'paid' && (
              <div className="text-xs text-neutral-mid space-y-0.5 border-t border-neutral-light pt-3">
                {p.payout_method   && <p>Method: <span className="capitalize font-medium text-neutral-charcoal">{p.payout_method.replace('_', ' ')}</span></p>}
                {p.bank_name       && <p>Bank: <span className="font-medium text-neutral-charcoal">{p.bank_name}</span></p>}
                {p.payout_account_ref && <p>Account: <span className="font-mono font-medium">{p.payout_account_ref}</span></p>}
                {p.payment_reference  && <p>Ref: <span className="font-mono font-medium">{p.payment_reference}</span></p>}
                {p.paid_at         && <p>Paid: <span className="font-medium text-neutral-charcoal">{formatDate(p.paid_at)}</span></p>}
                {p.notes           && <p>Notes: {p.notes}</p>}
              </div>
            )}

            {p.status === 'pending' && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setMarking(p)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white text-xs font-semibold rounded-xl hover:bg-brand-green/90 transition-colors"
                >
                  <CheckCircle size={13} /> Mark as Paid
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {marking && (
        <PayoutModal
          payoutId={marking.id}
          hostName={marking.host?.full_name ?? 'Host'}
          amount={Number(marking.amount)}
          bookingCount={marking.booking_ids?.length ?? 0}
          onClose={() => setMarking(null)}
          onSuccess={() => { setMarking(null); void load() }}
        />
      )}
    </div>
  )
}
