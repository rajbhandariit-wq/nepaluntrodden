import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DollarSign, Clock, TrendingUp, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_STYLES } from '@/lib/billing/formatters'

export default async function HostEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()

  // All transactions where this user is the host
  const { data: transactions } = await admin
    .from('transactions')
    .select(`
      id, gross_amount, commission_amount, net_payout,
      payment_status, refund_amount, created_at,
      bookings ( booking_ref, date_from, date_to, status, host_payout_status,
        listings ( title ) )
    `)
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  // Pending payouts for this host
  const { data: payouts } = await admin
    .from('payouts')
    .select('id, amount, status, period_start, period_end, paid_at, payment_reference')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const captured   = transactions?.filter(t => t.payment_status === 'captured') ?? []
  const pendingTx  = transactions?.filter(t => t.payment_status === 'pending')  ?? []

  const now        = new Date()
  const mtdStart   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const totalNet   = captured.reduce((s, t) => s + Number(t.net_payout), 0)
  const mtdNet     = captured.filter(t => t.created_at >= mtdStart).reduce((s, t) => s + Number(t.net_payout), 0)
  const pendingAmt = (payouts ?? []).filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)

  const kpis = [
    { label: 'Total Earned',    value: formatCurrency(totalNet),   icon: TrendingUp,  bg: 'bg-emerald-50',  color: 'text-emerald-600' },
    { label: 'This Month',      value: formatCurrency(mtdNet),     icon: DollarSign,  bg: 'bg-blue-50',     color: 'text-blue-600'    },
    { label: 'Pending Payout',  value: formatCurrency(pendingAmt), icon: Clock,       bg: 'bg-amber-50',    color: 'text-amber-600'   },
    { label: 'Trips Completed', value: String(captured.length),    icon: CheckCircle, bg: 'bg-purple-50',   color: 'text-purple-600'  },
  ]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Earnings</h1>
        <p className="text-sm text-neutral-mid">Your revenue and payout history</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-4">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className="text-xl font-bold text-neutral-charcoal leading-tight">{value}</p>
            <p className="text-xs text-neutral-mid mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* How payouts work */}
      <div className="bg-brand-green-pale border border-brand-green/20 rounded-2xl p-4 mb-5 text-sm text-neutral-mid">
        <p className="font-semibold text-neutral-charcoal mb-1">How payouts work</p>
        <p>Payouts are processed every Monday for all trips completed 48+ hours ago. You keep <strong className="text-neutral-charcoal">80%</strong> of each booking — the platform retains 20% as commission.</p>
      </div>

      {/* Pending payouts */}
      {(payouts ?? []).some(p => p.status === 'pending') && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Upcoming Payouts</h2>
          <div className="space-y-2">
            {(payouts ?? []).filter(p => p.status === 'pending').map(p => (
              <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-charcoal">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-neutral-mid">
                    {p.period_start && p.period_end
                      ? `${formatDate(p.period_start)} – ${formatDate(p.period_end)}`
                      : 'Awaiting admin review'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout history */}
      {(payouts ?? []).some(p => p.status === 'paid') && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Payout History</h2>
          <div className="space-y-2">
            {(payouts ?? []).filter(p => p.status === 'paid').map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-charcoal">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-neutral-mid">{p.paid_at ? formatDate(p.paid_at) : '—'}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Paid</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction breakdown */}
      <div>
        <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Booking Earnings</h2>

        {transactions?.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center">
            <p className="text-3xl mb-3">💰</p>
            <p className="font-semibold text-neutral-charcoal mb-1">No earnings yet</p>
            <p className="text-sm text-neutral-mid">Earnings will appear here once travellers book your listings.</p>
          </div>
        )}

        <div className="space-y-2">
          {(transactions ?? []).map(t => {
            type BookingShape = { booking_ref: string; date_from: string; date_to: string; host_payout_status: string; listings: { title: string } | { title: string }[] | null }
            const bRaw = t.bookings as unknown as BookingShape | BookingShape[] | null
            const b = Array.isArray(bRaw) ? bRaw[0] ?? null : bRaw
            const listingsRaw = b?.listings
            const listing = Array.isArray(listingsRaw) ? listingsRaw[0] ?? null : listingsRaw
            return (
              <div key={t.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-charcoal truncate">
                      {listing?.title ?? 'Unknown listing'}
                    </p>
                    <p className="text-xs font-mono text-brand-green">{b?.booking_ref ?? '—'}</p>
                    {b?.date_from && (
                      <p className="text-xs text-neutral-mid mt-0.5">{b.date_from} → {b.date_to}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-charcoal">{formatCurrency(t.net_payout)}</p>
                    <p className="text-xs text-neutral-mid">of {formatCurrency(t.gross_amount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[t.payment_status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                    {t.payment_status.replace('_', ' ')}
                  </span>
                  {b?.host_payout_status && b.host_payout_status !== 'na' && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.host_payout_status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                      Payout: {b.host_payout_status}
                    </span>
                  )}
                  {t.refund_amount > 0 && (
                    <span className="text-xs text-blue-600">Refunded {formatCurrency(t.refund_amount)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
