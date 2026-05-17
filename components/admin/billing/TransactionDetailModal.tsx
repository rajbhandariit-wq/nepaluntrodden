'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { formatCurrency, formatDateTime, STATUS_STYLES } from '@/lib/billing/formatters'
import RefundModal from './RefundModal'

interface Transaction {
  id: string
  booking_id: string
  gross_amount: number
  commission_amount: number
  net_payout: number
  payment_method: string
  payment_status: string
  transaction_ref: string | null
  dispute_status: string
  refund_amount: number
  refund_policy: string | null
  created_at: string
  bookings: { booking_ref: string; date_from: string; date_to: string } | null
  traveler: { id: string; full_name: string } | null
  host: { id: string; full_name: string } | null
}

interface Props {
  tx: Transaction
  onClose: () => void
  onRefundSuccess: () => void
}

export default function TransactionDetailModal({ tx, onClose, onRefundSuccess }: Props) {
  const [showRefund, setShowRefund] = useState(false)

  const canRefund = tx.payment_status === 'captured' && tx.bookings?.date_from

  if (showRefund && tx.bookings) {
    return (
      <RefundModal
        bookingId={tx.booking_id}
        bookingRef={tx.bookings.booking_ref}
        startDate={tx.bookings.date_from}
        grossAmount={Number(tx.gross_amount)}
        onClose={() => setShowRefund(false)}
        onSuccess={() => { setShowRefund(false); onRefundSuccess() }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
            Transaction Detail
          </h2>
          <button onClick={onClose} className="text-neutral-mid hover:text-neutral-charcoal"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status + ref */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[tx.payment_status] ?? 'bg-neutral-100 text-neutral-500'}`}>
              {tx.payment_status.replace('_', ' ')}
            </span>
            <span className="text-xs text-neutral-mid font-mono">{tx.transaction_ref ?? '—'}</span>
          </div>

          {/* Amounts */}
          <div className="bg-neutral-pale rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-neutral-mid mb-0.5">Gross</p>
              <p className="font-bold text-neutral-charcoal">{formatCurrency(tx.gross_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-mid mb-0.5">Commission</p>
              <p className="font-bold text-brand-ochre">{formatCurrency(tx.commission_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-mid mb-0.5">Host Net</p>
              <p className="font-bold text-brand-green">{formatCurrency(tx.net_payout)}</p>
            </div>
          </div>

          {tx.refund_amount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex justify-between text-sm">
              <span className="text-neutral-mid">Refunded ({tx.refund_policy})</span>
              <span className="font-semibold text-blue-700">–{formatCurrency(tx.refund_amount)}</span>
            </div>
          )}

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white border border-neutral-light rounded-xl p-3">
              <p className="text-xs text-neutral-mid mb-0.5">Traveler</p>
              <p className="font-medium">{tx.traveler?.full_name ?? '—'}</p>
            </div>
            <div className="bg-white border border-neutral-light rounded-xl p-3">
              <p className="text-xs text-neutral-mid mb-0.5">Host / Guide</p>
              <p className="font-medium">{tx.host?.full_name ?? '—'}</p>
            </div>
          </div>

          {/* Booking */}
          {tx.bookings && (
            <div className="text-sm border border-neutral-light rounded-xl p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-mid">Booking ref</span>
                <span className="font-mono font-medium">{tx.bookings.booking_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-mid">Dates</span>
                <span>{tx.bookings.date_from} → {tx.bookings.date_to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-mid">Method</span>
                <span className="capitalize">{tx.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-mid">Created</span>
                <span>{formatDateTime(tx.created_at)}</span>
              </div>
            </div>
          )}

          {tx.dispute_status !== 'none' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 font-semibold">
              Dispute: {tx.dispute_status}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">Close</button>
            {canRefund && (
              <button
                onClick={() => setShowRefund(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-2xl transition-colors"
              >
                Issue Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
