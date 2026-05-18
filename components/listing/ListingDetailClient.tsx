'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Share2, Heart, MapPin, Clock, Users, Mountain, ShieldCheck, Stethoscope, Users2, ChevronRight } from 'lucide-react'
import type { Listing, Review } from '@/lib/types'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import { formatPrice, difficultyColor, difficultyLabel } from '@/lib/utils'

export default function ListingDetailClient({
  listing,
  reviews,
}: {
  listing: Listing
  reviews: Review[]
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [saved, setSaved] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: listing.title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="page-scroll">
      {/* Desktop top bar */}
      <div className="hidden md:flex items-center justify-between gap-4 px-8 py-4 sticky top-0 bg-brand-cream/95 backdrop-blur-sm border-b border-neutral-light z-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-neutral-charcoal hover:text-brand-green transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-light text-sm text-neutral-charcoal hover:border-brand-green transition-colors">
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-light text-sm hover:border-brand-green transition-colors"
          >
            <Heart size={14} className={saved ? 'fill-status-error text-status-error' : 'text-neutral-charcoal'} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="md:grid md:grid-cols-[1fr_1fr] md:items-start">
        {/* Left: Photo panel */}
        <div className="md:sticky md:top-[65px] md:p-6">
          <div className="relative md:rounded-2xl md:overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

            {/* Mobile-only top controls */}
            <div className="md:hidden absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-2">
              <Link href="/" className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <ArrowLeft size={18} className="text-neutral-charcoal" />
              </Link>
              <div className="flex gap-2">
                <button onClick={handleShare} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                  <Share2 size={16} className="text-neutral-charcoal" />
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
                >
                  <Heart size={16} className={saved ? 'fill-status-error text-status-error' : 'text-neutral-charcoal'} />
                </button>
              </div>
            </div>

            {listing.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {listing.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-150"
                    style={{ background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.5)' }}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-8 right-3 flex gap-1">
              {listing.images.slice(0, 3).map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className="w-10 h-10 rounded-lg overflow-hidden border-2 transition-all"
                  style={{ borderColor: i === imgIdx ? 'white' : 'transparent' }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="bg-white rounded-t-3xl -mt-4 md:mt-0 md:rounded-none md:border-l md:border-neutral-light pb-32 md:pb-0">
          <div className="px-5 pt-5 md:px-8 md:pt-8">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-neutral-charcoal leading-tight flex-1" style={{ fontFamily: 'Lora, serif' }}>
                {listing.title}
              </h1>
              <Badge variant="gray" className="capitalize mt-0.5 shrink-0">{listing.type}</Badge>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1 text-sm text-neutral-mid">
                <MapPin size={13} />{listing.district}, {listing.region}
              </span>
              <StarRating rating={listing.rating} reviewCount={listing.reviewCount} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {listing.difficulty && (
                <div className="bg-neutral-pale rounded-xl p-3 text-center">
                  <p className="text-xs text-neutral-mid mb-0.5">Difficulty</p>
                  <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${difficultyColor(listing.difficulty)}`}>
                    {difficultyLabel(listing.difficulty)}
                  </p>
                </div>
              )}
              {listing.durationDays && (
                <div className="bg-neutral-pale rounded-xl p-3 text-center">
                  <Clock size={14} className="text-neutral-mid mx-auto mb-0.5" />
                  <p className="text-xs font-semibold text-neutral-charcoal">{listing.durationDays} days</p>
                </div>
              )}
              {listing.maxAltitudeM && (
                <div className="bg-neutral-pale rounded-xl p-3 text-center">
                  <Mountain size={14} className="text-neutral-mid mx-auto mb-0.5" />
                  <p className="text-xs font-semibold text-neutral-charcoal">{(listing.maxAltitudeM / 1000).toFixed(1)}km</p>
                </div>
              )}
              {listing.maxGroupSize && !listing.maxAltitudeM && (
                <div className="bg-neutral-pale rounded-xl p-3 text-center">
                  <Users size={14} className="text-neutral-mid mx-auto mb-0.5" />
                  <p className="text-xs font-semibold text-neutral-charcoal">Max {listing.maxGroupSize}</p>
                </div>
              )}
            </div>

            {listing.guide && (
              <div className="card p-4 mb-5">
                <p className="section-title mb-3">{listing.type === 'homestay' ? 'Your Host' : 'Your Guide'}</p>
                <div className="flex items-center gap-3">
                  <img src={listing.guide.avatar} alt={listing.guide.name} className="w-14 h-14 rounded-full object-cover border-2 border-brand-green-pale" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-charcoal">{listing.guide.name}</p>
                    <StarRating rating={listing.guide.rating} reviewCount={listing.guide.reviewCount} size={12} className="mt-0.5" />
                    <p className="text-xs text-neutral-mid mt-0.5">{listing.guide.experienceYears} yrs · {listing.guide.languages.join(', ')}</p>
                  </div>
                  <Link href="#" className="text-brand-green text-xs font-semibold shrink-0">View →</Link>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {listing.guide.badges.govId && <span className="verified-badge"><ShieldCheck size={11} /> Gov ID</span>}
                  {listing.guide.badges.firstAid && <span className="verified-badge"><Stethoscope size={11} /> First Aid</span>}
                  {listing.guide.badges.cooperative && <span className="verified-badge"><Users2 size={11} /> Co-op</span>}
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="section-title mb-2">About this {listing.type}</p>
              <p className="text-sm text-neutral-charcoal leading-relaxed">{listing.description}</p>
            </div>

            <div className="bg-brand-ochre/10 border border-brand-ochre/30 rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-brand-ochre mb-1">🌿 Cultural note</p>
              <p className="text-sm text-neutral-charcoal">{listing.culturalNote}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <p className="section-title mb-2">Included</p>
                {listing.included.map((item) => (
                  <p key={item} className="text-xs text-neutral-charcoal flex items-start gap-1.5 mb-1">
                    <span className="text-status-success font-bold mt-0.5">✓</span> {item}
                  </p>
                ))}
              </div>
              <div>
                <p className="section-title mb-2">Not included</p>
                {listing.excluded.map((item) => (
                  <p key={item} className="text-xs text-neutral-mid flex items-start gap-1.5 mb-1">
                    <span className="font-bold mt-0.5">✕</span> {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="section-title mb-2">Best time to visit</p>
              <div className="flex flex-wrap gap-1.5">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
                  <span key={m} className={`text-xs px-2 py-1 rounded-lg font-medium ${listing.bestMonths.includes(m) ? 'bg-brand-green text-white' : 'bg-neutral-pale text-neutral-light'}`}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-title">Reviews ({listing.reviewCount})</p>
                  <button className="text-xs text-brand-green font-semibold flex items-center gap-0.5">See all <ChevronRight size={13} /></button>
                </div>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r.id} className="bg-neutral-pale rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={r.avatar} alt={r.travelerName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-neutral-charcoal">{r.travelerName}</p>
                          <p className="text-[10px] text-neutral-mid">{r.travelerCountry} · {r.date}</p>
                        </div>
                        <StarRating rating={r.rating} size={11} className="ml-auto" />
                      </div>
                      <p className="text-xs text-neutral-charcoal leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop inline booking CTA */}
            <div className="hidden md:block border-t border-neutral-light pt-6 pb-10 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-neutral-charcoal">{formatPrice(listing.pricePerPerson, listing.currency)}</span>
                  <span className="text-sm text-neutral-mid ml-1">/ person</span>
                </div>
                <Link
                  href={`/booking/${listing.slug}`}
                  className="bg-brand-green text-white font-semibold px-8 py-3 rounded-2xl text-sm hover:bg-brand-green-light active:scale-95 transition-all"
                >
                  Request to Book →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking footer */}
      <div className="md:hidden fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-neutral-light px-5 py-3 z-40" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-neutral-charcoal">{formatPrice(listing.pricePerPerson, listing.currency)}</span>
            <span className="text-xs text-neutral-mid ml-1">/ person</span>
          </div>
          <Link
            href={`/booking/${listing.slug}`}
            className="bg-brand-green text-white font-semibold px-6 py-2.5 rounded-2xl text-sm active:scale-95 transition-transform"
          >
            Request to Book →
          </Link>
        </div>
      </div>
    </div>
  )
}
