export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert'
export type ListingType = 'trek' | 'homestay' | 'experience'
export type HostRole = 'guide' | 'host' | 'artisan'

export interface Guide {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  experienceYears: number
  languages: string[]
  badges: {
    govId: boolean
    firstAid: boolean
    cooperative: boolean
    policeCheck: boolean
  }
  bio: string
  tripsCompleted: number
}

export interface Listing {
  id: string
  type: ListingType
  title: string
  slug: string
  region: string
  district: string
  description: string
  images: string[]
  guide?: Guide
  rating: number
  reviewCount: number
  difficulty?: Difficulty
  durationDays?: number
  maxGroupSize?: number
  maxAltitudeM?: number
  pricePerPerson: number
  currency: string
  included: string[]
  excluded: string[]
  culturalNote: string
  bestMonths: string[]
  tags: string[]
  isHiddenGem?: boolean
  isFeatured?: boolean
  latitude: number
  longitude: number
}

export interface Review {
  id: string
  listingId: string
  travelerName: string
  travelerCountry: string
  rating: number
  comment: string
  date: string
  avatar: string
}

export interface BookingState {
  listingId: string
  dateFrom: string
  dateTo: string
  numAdults: number
  numChildren: number
  addons: string[]
  paymentMethod: string
  messageToHost: string
  includeInsurance: boolean
}
