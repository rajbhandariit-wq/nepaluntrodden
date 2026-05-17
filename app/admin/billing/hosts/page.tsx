'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { formatCurrency } from '@/lib/billing/formatters'

type Row = {
  host_id: string; host_name: string
  gross: number; commission: number; net: number; bookings: number
}

export default function HostEarningsPage() {
  const [rows, setRows]       = useState<Row[]>([])
  const [year, setYear]       = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/billing/reports/host-earnings?year=${year}`)
      .then(r => r.json())
      .then(json => { setRows(json.rows ?? []); setLoading(false) })
  }, [year])

  function exportCsv() {
    const headers = ['Host', 'Bookings', 'Gross (NPR)', 'Commission (NPR)', 'Net Payout (NPR)']
    const data = rows.map(r => [r.host_name, r.bookings, r.gross, r.commission, r.net])
    const csv = [headers, ...data].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `host-earnings-${year}.csv`
    a.click()
  }

  const totalGross = rows.reduce((s, r) => s + r.gross, 0)
  const totalComm  = rows.reduce((s, r) => s + r.commission, 0)
  const totalNet   = rows.reduce((s, r) => s + r.net, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Host Earnings</h1>
          <p className="text-sm text-neutral-mid">Year-to-date per host</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="input-field py-2 text-sm w-28"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-light text-xs font-semibold text-neutral-charcoal hover:border-brand-green transition-colors">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-pale border-b border-neutral-light">
              <tr>
                {['Host', 'Bookings', 'Gross Revenue', 'Commission Paid', 'Net Payout'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light/60">
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-mid">Loading...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-mid">No earnings data for {year}.</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.host_id} className="hover:bg-neutral-pale/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-charcoal">{r.host_name}</td>
                  <td className="px-4 py-3 text-neutral-mid">{r.bookings}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-charcoal">{formatCurrency(r.gross)}</td>
                  <td className="px-4 py-3 text-brand-ochre">{formatCurrency(r.commission)}</td>
                  <td className="px-4 py-3 text-brand-green font-semibold">{formatCurrency(r.net)}</td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-neutral-pale border-t-2 border-neutral-light">
                <tr>
                  <td className="px-4 py-3 font-bold text-neutral-charcoal">Total</td>
                  <td className="px-4 py-3 font-bold text-neutral-mid">{rows.reduce((s, r) => s + r.bookings, 0)}</td>
                  <td className="px-4 py-3 font-bold text-neutral-charcoal">{formatCurrency(totalGross)}</td>
                  <td className="px-4 py-3 font-bold text-brand-ochre">{formatCurrency(totalComm)}</td>
                  <td className="px-4 py-3 font-bold text-brand-green">{formatCurrency(totalNet)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
