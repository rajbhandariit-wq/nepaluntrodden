import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Verify the requesting user is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json() as { status: string; reason?: string }
  const { status, reason } = body

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createAdminClient()

  const update: Record<string, unknown> = { status }
  if (status === 'rejected' && reason) update.rejection_reason = reason

  // Store rejection reason on listing if column exists; ignore if not
  const { error } = await admin
    .from('listings')
    .update(update)
    .eq('id', id)

  if (error) {
    // Retry without rejection_reason in case the column doesn't exist yet
    const { error: e2 } = await admin
      .from('listings')
      .update({ status })
      .eq('id', id)
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })
  }

  return NextResponse.json({ message: `Listing ${status} successfully.` })
}
