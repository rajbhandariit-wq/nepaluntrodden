'use client'

import Link from 'next/link'
import { Heart, MapPin, Clock, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Listing } from '@/lib/types'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import { formatPrice, difficultyColor, difficultyLabel, cn } from '@/lib/utils'

interface ListingCardProps {
  listing: Listing
  featured?: boolean
}

const wishlistKey = (id: string) => `nu_wish_${id}`

export default function ListingCard({ listing, featured }: ListingCardProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(!!localStorage.getItem(wishlistKey(listing.id)))
  }, [listing.id])

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !saved
    setSaved(next)
    if (next) {
      localStorage.setItem(wishlistKey(listing.id), JSON.stringify({
        id: listing.id, slug: listing.slug, title: listing.title,
        image: listing.images[0], district: listing.district,
        pricePerPerson: listing.pricePerPerson, currency: listing.currency,
        rating: listing.rating, reviewCount: listing.reviewCount, type: listing.type,
      }))
    } else {
      localStorage.removeItem(wishlistKey(listing.id))
    }
  }

  return (
    <div className={cn('card mx-4 mb-4', featured && 'ring-2 ring-brand-ochre/40')}>
      {/* Image */}
      <Link href={`/listing/${listing.slug}`}>
      <div className="relative overflow-hidden" style={{ aspectRatio: featured ? '16/9' : '3/2' }}>
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {listing.isHiddenGem && (
            <span className="text-[10px] font-semibold bg-brand-ochre text-white px-2 py-0.5 rounded-full shadow-sm">
              Hidden Gem
            </span>
          )}
          {featured && (
            <span className="text-[10px] font-semibold bg-brand-green text-white px-2 py-0.5 rounded-full shadow-sm">
              ✦ Featured
            </span>
          )}
        </div>
        {/* Save button */}
        <button
          onClick={toggleSave}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={16} className={saved ? 'fill-status-error text-status-error' : 'text-neutral-mid'} />
        </button>
        {/* Type pill */}
        <span className="absolute bottom-3 left-3 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full capitalize backdrop-blur-sm">
          {listing.type}
        </span>
      </div>
      </Link>

      {/* Body */}
      <Link href={`/listing/${listing.slug}`} className="block p-4">
        {/* Title */}
        <h3 className="font-semibold text-neutral-charcoal text-[15px] leading-snug mb-1">
          {listing.title}
        </h3>

        {/* Location + rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-xs text-neutral-mid">
            <MapPin size={11} />
            {listing.district}
          </span>
          <StarRating rating={listing.rating} reviewCount={listing.reviewCount} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {listing.difficulty && (
            <Badge variant="ochre" className={difficultyColor(listing.difficulty)}>
              {difficultyLabel(listing.difficulty)}
            </Badge>
          )}
          {listing.durationDays && (
            <span className="flex items-center gap-1 text-xs text-neutral-mid">
              <Clock size={11} />
              {listing.durationDays} {listing.durationDays === 1 ? 'day' : 'days'}
            </span>
          )}
          {listing.maxGroupSize && (
            <span className="flex items-center gap-1 text-xs text-neutral-mid">
              <Users size={11} />
              Max {listing.maxGroupSize}
            </span>
          )}
        </div>

        {/* Guide row */}
        {listing.guide && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-light/60">
            <img src={listing.guide.avatar} alt={listing.guide.name} className="w-7 h-7 rounded-full object-cover" />
            <span className="text-xs text-neutral-mid">
              Guide: <span className="font-medium text-neutral-charcoal">{listing.guide.name}</span>
            </span>
            {listing.guide.badges.govId && (
              <span className="verified-badge ml-auto">✓ Verified</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-neutral-charcoal">
              {formatPrice(listing.pricePerPerson, listing.currency)}
            </span>
            <span className="text-xs text-neutral-mid ml-1">/ person</span>
          </div>
          <span className="text-xs font-semibold text-brand-green bg-brand-green-pale px-3 py-1.5 rounded-xl">
            View →
          </span>
        </div>
      </Link>
    </div>
  )
}
