import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('bookings')
    .select('date_from, date_to')
    .eq('listing_id', id)
    .in('status', ['confirmed', 'pending'])
    .not('date_from', 'is', null)
    .not('date_to', 'is', null)

  return NextResponse.json({
    ranges: (data ?? []).map(b => ({ from: b.date_from as string, to: b.date_to as string })),
  })
}
