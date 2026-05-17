import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { DollarSign, Clock, TrendingUp, BarChart2, ArrowRight, Play } from 'lucide-react'
import { formatCurrency } from '@/lib/billing/formatters'

async function getBillingKpis() {
  const admin = createAdminClient()
  const now = new Date()
  const mtdStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [
    { data: txMtd },
    { data: txAll },
    { data: pendingPayouts },
    { data: recentTx },
  ] = await Promise.all([
    admin.from('transactions').select('gross_amount, commission_amount').eq('payment_status', 'captured').gte('created_at', mtdStart),
    admin.from('transactions').select('gross_amount, commission_amount, created_at, payment_status').eq('payment_status', 'captured').order('created_at', { ascending: false }),
    admin.from('payouts').select('amount').eq('status', 'pending'),
    admin.from('transactions').select('gross_amount, commission_amount, net_payout, payment_method, payment_status, transaction_ref, created_at, bookings(booking_ref)').order('created_at', { ascending: false }).limit(5),
  ])

  const revenueMtd   = txMtd?.reduce((s, t) => s + Number(t.gross_amount), 0) ?? 0
  const commMtd      = txMtd?.reduce((s, t) => s + Number(t.commission_amount), 0) ?? 0
  const pendingTotal = pendingPayouts?.reduce((s, p) => s + Number(p.amount), 0) ?? 0
  const avgValue     = txAll?.length ? (txAll.reduce((s, t) => s + Number(t.gross_amount), 0) / txAll.length) : 0

  // Last 30 days chart: group captured transactions by day
  const last30: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last30[d.toISOString().slice(0, 10)] = 0
  }
  for (const t of txAll ?? []) {
    const day = t.created_at.slice(0, 10)
    if (day in last30) last30[day] += Number(t.gross_amount)
  }
  const chartData = Object.entries(last30).map(([date, amount]) => ({ date, amount }))
  const maxChart = Math.max(...chartData.map(d => d.amount), 1)

  return { revenueMtd, commMtd, pendingTotal, avgValue, chartData, maxChart, recentTx }
}

export default async function BillingDashboard() {
  const { revenueMtd, commMtd, pendingTotal, avgValue, chartData, maxChart, recentTx } = await getBillingKpis()

  const kpis = [
    { label: 'Revenue MTD',      value: formatCurrency(revenueMtd),   icon: TrendingUp,  bg: 'bg-emerald-50',     color: 'text-emerald-600' },
    { label: 'Pending Payouts',  value: formatCurrency(pendingTotal),  icon: Clock,       bg: 'bg-amber-50',       color: 'text-amber-600'   },
    { label: 'Commission MTD',   value: formatCurrency(commMtd),       icon: DollarSign,  bg: 'bg-purple-50',      color: 'text-purple-600'  },
    { label: 'Avg Booking',      value: formatCurrency(avgValue),      icon: BarChart2,   bg: 'bg-blue-50',        color: 'text-blue-600'    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Billing</h1>
          <p className="text-sm text-neutral-mid">Revenue, payouts &amp; transactions</p>
        </div>
        <form action="/api/admin/billing/batch-payouts" method="POST">
          <button type="submit" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-green text-white text-xs font-semibold hover:bg-brand-green/90 transition-colors">
            <Play size={12} /> Run Payout Batch
          </button>
        </form>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {kpis.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-card">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={17} className={color} />
            </div>
            <p className="text-xl font-bold text-neutral-charcoal leading-tight">{value}</p>
            <p className="text-xs text-neutral-mid mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart — last 30 days */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
        <h2 className="text-sm font-bold text-neutral-charcoal mb-4">Revenue — Last 30 Days</h2>
        <div className="flex items-end gap-1 h-28">
          {chartData.map(({ date, amount }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              <div
                className="w-full bg-brand-green/20 group-hover:bg-brand-green transition-colors rounded-sm"
                style={{ height: `${(amount / maxChart) * 100}%`, minHeight: amount > 0 ? 3 : 1 }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-neutral-charcoal text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                  {date.slice(5)} · {formatCurrency(amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav + recent */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Quick Access</h2>
          <div className="space-y-1">
            {[
              { href: '/admin/billing/transactions', label: 'All Transactions',   sub: 'Payments & refunds' },
              { href: '/admin/billing/payouts',      label: 'Payout Manager',     sub: 'Pending host payouts' },
              { href: '/admin/billing/hosts',        label: 'Host Earnings',       sub: 'Per-host YTD report' },
            ].map(({ href, label, sub }) => (
              <Link key={href} href={href} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-pale transition-colors">
                <div>
                  <p className="text-sm font-medium text-neutral-charcoal">{label}</p>
                  <p className="text-xs text-neutral-mid">{sub}</p>
                </div>
                <ArrowRight size={15} className="text-neutral-mid" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Recent Transactions</h2>
          <div className="space-y-2">
            {(recentTx ?? []).length === 0 && (
              <p className="text-xs text-neutral-mid py-4 text-center">No transactions yet.</p>
            )}
            {(recentTx ?? []).map((t: { id: string; bookings: { booking_ref: string } | null; gross_amount: number; payment_status: string; payment_method: string }) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-neutral-charcoal font-mono text-xs">{t.bookings?.booking_ref ?? '—'}</p>
                  <p className="text-xs text-neutral-mid capitalize">{t.payment_method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-charcoal">{formatCurrency(t.gross_amount)}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${t.payment_status === 'captured' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
