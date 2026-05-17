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

  if (!['active', 'rejected', 'inactive'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createAdminClient()

  const update: Record<string, unknown> = { status }
  if (status === 'rejected' && reason) update.rejection_reason = reason
  if (status === 'active') update.rejection_reason = null

  const { error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const label: Record<string, string> = { active: 'approved', rejected: 'rejected', inactive: 'deactivated' }
  return NextResponse.json({ message: `Account ${label[status] ?? status} successfully.` })
}
