import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify host is active
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (profile?.status !== 'active') {
    return NextResponse.json({ error: 'Account not active' }, { status: 403 })
  }

  const body = await req.json()
  const admin = createAdminClient()

  // Auto-create or find guide record for this host
  let { data: guide } = await supabase
    .from('guides')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!guide) {
    const guideName = user.user_metadata?.full_name ?? user.email ?? 'Host'
    const { data: newGuide, error: guideErr } = await admin
      .from('guides')
      .insert({
        id: user.id,
        user_id: user.id,
        name: guideName,
        full_name: guideName,
      })
      .select('id')
      .single()

    if (guideErr || !newGuide) {
      console.error('[guides insert]', guideErr)
      return NextResponse.json({ error: 'Failed to create guide profile', detail: guideErr?.message, code: guideErr?.code }, { status: 500 })
    }
    guide = newGuide
  }

  // Generate a unique slug
  const baseSlug = slugify(body.title ?? 'listing')
  const suffix   = Date.now().toString(36)
  const slug     = `${baseSlug}-${suffix}`

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      host_user_id:    user.id,
      guide_id:        guide.id,
      slug,
      type:            body.type,
      title:           body.title,
      region:          body.region,
      district:        body.district || null,
      description:     body.description || null,
      cultural_note:   body.culturalNote || null,
      difficulty:      body.difficulty || null,
      duration_days:   body.durationDays ?? null,
      max_group_size:  body.maxGroupSize ?? null,
      max_altitude_m:  body.maxAltitudeM ?? null,
      price_per_person: body.pricePerPerson,
      currency:        body.currency ?? 'USD',
      included:        body.included ?? [],
      excluded:        body.excluded ?? [],
      tags:            body.tags ?? [],
      best_months:     body.bestMonths ?? [],
      is_hidden_gem:   body.isHiddenGem ?? false,
      latitude:        body.latitude ?? null,
      longitude:       body.longitude ?? null,
      images:          body.images ?? [],
      status:          body.status ?? 'draft',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: listing.id }, { status: 201 })
}
