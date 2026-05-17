'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_STYLES } from '@/lib/billing/formatters'
import TransactionDetailModal from '@/components/admin/billing/TransactionDetailModal'

type Tx = {
  id: string; booking_id: string; gross_amount: number; commission_amount: number;
  net_payout: number; payment_method: string; payment_status: string;
  transaction_ref: string | null; dispute_status: string; refund_amount: number;
  refund_policy: string | null; created_at: string;
  bookings: { booking_ref: string; date_from: string; date_to: string } | null
  traveler: { id: string; full_name: string } | null
  host: { id: string; full_name: string } | null
}

const STATUSES = ['', 'pending', 'captured', 'refunded', 'partially_refunded', 'failed']

export default function TransactionsPage() {
  const [txs, setTxs]         = useState<Tx[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Tx | null>(null)

  const [status,   setStatus]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [page,     setPage]     = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (status)   params.set('status',    status)
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo)   params.set('date_to',   dateTo)
    const res = await fetch(`/api/admin/billing/transactions?${params}`)
    const json = await res.json()
    setTxs(json.data ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [status, dateFrom, dateTo, page])

  useEffect(() => { void load() }, [load])

  function exportCsv() {
    const rows = [
      ['Booking Ref', 'Traveler', 'Host', 'Gross (NPR)', 'Commission', 'Net Payout', 'Method', 'Status', 'Date'],
      ...txs.map(t => [
        t.bookings?.booking_ref ?? '',
        t.traveler?.full_name ?? '',
        t.host?.full_name ?? '',
        t.gross_amount, t.commission_amount, t.net_payout,
        t.payment_method, t.payment_status,
        formatDate(t.created_at),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `transactions-${dateFrom || 'all'}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Transactions</h1>
          <p className="text-sm text-neutral-mid">{total} total</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-light text-xs font-semibold text-neutral-charcoal hover:border-brand-green transition-colors">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-1.5 flex-1 min-w-40">
          <Search size={14} className="text-neutral-mid shrink-0" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field py-2 text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-1 min-w-48">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="input-field py-2 text-sm flex-1" />
          <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   setPage(1) }} className="input-field py-2 text-sm flex-1" />
        </div>
        <button onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }}
          className="text-xs text-neutral-mid hover:text-neutral-charcoal">Clear</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-pale border-b border-neutral-light">
              <tr>
                {['Booking', 'Traveler', 'Host', 'Gross', 'Commission', 'Net', 'Method', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light/60">
              {loading && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-mid text-sm">Loading...</td></tr>
              )}
              {!loading && txs.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-neutral-mid text-sm">No transactions found.</td></tr>
              )}
              {txs.map(tx => (
                <tr key={tx.id}
                  className="hover:bg-neutral-pale/40 cursor-pointer transition-colors"
                  onClick={() => setSelected(tx)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-neutral-charcoal">{tx.bookings?.booking_ref ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-charcoal">{tx.traveler?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-charcoal">{tx.host?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-charcoal">{formatCurrency(tx.gross_amount)}</td>
                  <td className="px-4 py-3 text-brand-ochre">{formatCurrency(tx.commission_amount)}</td>
                  <td className="px-4 py-3 text-brand-green">{formatCurrency(tx.net_payout)}</td>
                  <td className="px-4 py-3 capitalize text-neutral-mid">{tx.payment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[tx.payment_status] ?? ''}`}>
                      {tx.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-mid whitespace-nowrap">{formatDate(tx.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-light text-sm">
            <span className="text-neutral-mid">Page {page} of {Math.ceil(total / 50)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-neutral-light disabled:opacity-40 hover:border-brand-green transition-colors">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)}
                className="px-3 py-1 rounded-lg border border-neutral-light disabled:opacity-40 hover:border-brand-green transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <TransactionDetailModal
          tx={selected}
          onClose={() => setSelected(null)}
          onRefundSuccess={() => { setSelected(null); void load() }}
        />
      )}
    </div>
  )
}
