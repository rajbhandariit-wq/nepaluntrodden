import { createClient } from './supabase/server'
import type { Listing, Guide, Review } from './types'

function mapGuide(row: Record<string, unknown>): Guide {
  return {
    id: row.id as string,
    name: row.name as string,
    avatar: (row.avatar_url as string) ?? '',
    rating: Number(row.rating),
    reviewCount: (row.review_count as number) ?? 0,
    experienceYears: (row.experience_years as number) ?? 0,
    languages: (row.languages as string[]) ?? [],
    badges: {
      govId: (row.badge_gov_id as boolean) ?? false,
      firstAid: (row.badge_first_aid as boolean) ?? false,
      cooperative: (row.badge_cooperative as boolean) ?? false,
      policeCheck: (row.badge_police_check as boolean) ?? false,
    },
    bio: (row.bio as string) ?? '',
    tripsCompleted: (row.trips_completed as number) ?? 0,
  }
}

function mapListing(row: Record<string, unknown>): Listing {
  const guideRow = row.guides as Record<string, unknown> | null
  return {
    id: row.id as string,
    type: row.type as Listing['type'],
    title: row.title as string,
    slug: row.slug as string,
    region: row.region as string,
    district: row.district as string,
    description: (row.description as string) ?? '',
    images: (row.images as string[]) ?? [],
    guide: guideRow ? mapGuide(guideRow) : undefined,
    rating: Number(row.rating),
    reviewCount: (row.review_count as number) ?? 0,
    difficulty: row.difficulty as Listing['difficulty'],
    durationDays: row.duration_days as number | undefined,
    maxGroupSize: row.max_group_size as number | undefined,
    maxAltitudeM: row.max_altitude_m as number | undefined,
    pricePerPerson: Number(row.price_per_person),
    currency: (row.currency as string) ?? 'USD',
    included: (row.included as string[]) ?? [],
    excluded: (row.excluded as string[]) ?? [],
    culturalNote: (row.cultural_note as string) ?? '',
    bestMonths: (row.best_months as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    isHiddenGem: (row.is_hidden_gem as boolean) ?? false,
    isFeatured: (row.is_featured as boolean) ?? false,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }
}

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    listingId: row.listing_id as string,
    travelerName: row.traveler_name as string,
    travelerCountry: (row.traveler_country as string) ?? '',
    rating: row.rating as number,
    comment: (row.comment as string) ?? '',
    date: (row.review_date as string) ?? '',
    avatar: (row.avatar_url as string) ?? '',
  }
}

export async function getAllListings(): Promise<Listing[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, guides(*)')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((row) => mapListing(row as Record<string, unknown>))
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, guides(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapListing(data as Record<string, unknown>)
}

export async function getListingReviews(listingId: string): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data.map((row) => mapReview(row as Record<string, unknown>))
}

export async function getUserBookings(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, listings(title, images, slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}

export async function createBooking(booking: {
  listingId: string
  userId: string
  dateFrom: string
  dateTo: string
  numAdults: number
  numChildren: number
  addons: string[]
  paymentMethod: string
  messageToHost: string
  includeInsurance: boolean
  baseTotal: number
  addonsTotal: number
  platformFee: number
  insuranceFee: number
  grandTotal: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      listing_id: booking.listingId,
      user_id: booking.userId,
      date_from: booking.dateFrom || null,
      date_to: booking.dateTo || null,
      num_adults: booking.numAdults,
      num_children: booking.numChildren,
      addons: booking.addons,
      payment_method: booking.paymentMethod,
      message_to_host: booking.messageToHost,
      include_insurance: booking.includeInsurance,
      base_total: booking.baseTotal,
      addons_total: booking.addonsTotal,
      platform_fee: booking.platformFee,
      insurance_fee: booking.insuranceFee,
      grand_total: booking.grandTotal,
      status: 'confirmed',
    })
    .select('booking_ref')
    .single()

  if (error) throw error
  return data
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}
