import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/billing/adminGuard'

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { searchParams } = new URL(request.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const month = searchParams.get('month') // optional: 1-12

  let query = guard.admin
    .from('transactions')
    .select('commission_amount, gross_amount, payment_status, created_at')
    .eq('payment_status', 'captured')
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31T23:59:59Z`)

  if (month) {
    const m = month.padStart(2, '0')
    const daysInMonth = new Date(year, parseInt(month), 0).getDate()
    query = query
      .gte('created_at', `${year}-${m}-01`)
      .lte('created_at', `${year}-${m}-${daysInMonth}T23:59:59Z`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by month for chart data
  const byMonth: Record<string, { gross: number; commission: number; count: number }> = {}
  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 7) // YYYY-MM
    if (!byMonth[key]) byMonth[key] = { gross: 0, commission: 0, count: 0 }
    byMonth[key].gross      += Number(row.gross_amount)
    byMonth[key].commission += Number(row.commission_amount)
    byMonth[key].count      += 1
  }

  const totalGross      = data?.reduce((s, r) => s + Number(r.gross_amount), 0) ?? 0
  const totalCommission = data?.reduce((s, r) => s + Number(r.commission_amount), 0) ?? 0

  return NextResponse.json({ totalGross, totalCommission, byMonth, year, month: month ?? null })
}
