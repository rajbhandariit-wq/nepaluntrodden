import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ListingForm, { type ListingInitialData } from '@/components/host/ListingForm'

export const metadata = { title: 'Edit Listing — Host Panel' }

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('host_user_id', user.id)
    .single()

  if (!listing) notFound()

  const initial: ListingInitialData = {
    type:           listing.type ?? 'trek',
    title:          listing.title ?? '',
    region:         listing.region ?? '',
    district:       listing.district ?? '',
    description:    listing.description ?? '',
    culturalNote:   listing.cultural_note ?? '',
    difficulty:     listing.difficulty ?? '',
    durationDays:   listing.duration_days ?? null,
    maxGroupSize:   listing.max_group_size ?? null,
    maxAltitudeM:   listing.max_altitude_m ?? null,
    pricePerPerson: listing.price_per_person ?? 0,
    currency:       listing.currency ?? 'USD',
    included:       (listing.included as string[]) ?? [],
    excluded:       (listing.excluded as string[]) ?? [],
    tags:           (listing.tags as string[]) ?? [],
    bestMonths:     (listing.best_months as string[]) ?? [],
    isHiddenGem:    listing.is_hidden_gem ?? false,
    latitude:       listing.latitude ?? null,
    longitude:      listing.longitude ?? null,
    images:         (listing.images as string[]) ?? [],
    status:         listing.status ?? 'draft',
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-5" style={{ fontFamily: 'Lora, serif' }}>
        {listing.status === 'approved' || listing.status === 'pending' ? 'View listing' : 'Edit listing'}
      </h1>
      <ListingForm mode="edit" listingId={id} userId={user.id} initial={initial} />
    </div>
  )
}
