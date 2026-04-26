'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, Shuffle } from 'lucide-react'
import type { Listing } from '@/lib/types'
import ListingCard from './ListingCard'
import FilterChips from './FilterChips'

export default function DiscoverClient({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const featured = listings.find((l) => l.isFeatured)

  const filtered = listings.filter((l) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === '' ||
      l.title.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q) ||
      (l.guide?.name.toLowerCase().includes(q) ?? false)

    if (filter === 'all') return matchesQuery
    if (['trek', 'homestay', 'experience'].includes(filter)) return matchesQuery && l.type === filter
    if (['easy', 'moderate', 'hard', 'expert'].includes(filter)) return matchesQuery && l.difficulty === filter
    return matchesQuery
  })

  return (
    <div className="page-scroll">
      {/* ── Mobile header ──────────────────────────────────────────── */}
      <div className="md:hidden px-4 pt-12 pb-4 bg-brand-green">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-brand-green-pale text-xs font-medium tracking-wide">Nepal Untrodden</p>
            <h1 className="text-white font-bold text-xl" style={{ fontFamily: 'Lora, serif' }}>
              Venture Beyond the Trails
            </h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
        </div>
        <div className="mt-3 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid pointer-events-none" />
          <input
            type="text"
            placeholder="Search destination, guide, homestay..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-10 py-2.5 text-sm text-neutral-charcoal placeholder:text-neutral-mid outline-none"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ── Desktop sticky top bar ─────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between gap-4 px-8 py-5 sticky top-0 bg-brand-cream/95 backdrop-blur-sm border-b border-neutral-light z-10">
        <div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
            Discover Nepal
          </h1>
          <p className="text-sm text-neutral-mid">Hidden treks, homestays &amp; authentic experiences</p>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid pointer-events-none" />
            <input
              type="text"
              placeholder="Search destination, guide, homestay..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-neutral-light rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-charcoal placeholder:text-neutral-mid outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-light rounded-xl text-sm font-medium text-neutral-charcoal hover:border-brand-green transition-colors">
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </div>

      {/* ── Filter chips ───────────────────────────────────────────── */}
      <div className="md:px-8">
        <FilterChips onFilterChange={setFilter} />
      </div>

      {/* ── Desktop featured hero ──────────────────────────────────── */}
      {featured && filter === 'all' && query.trim() === '' && (
        <div className="hidden md:block px-8 mb-6">
          <div className="relative rounded-3xl overflow-hidden" style={{ height: 300 }}>
            <img src={featured.images[0]} alt={featured.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <span className="text-[11px] font-bold text-brand-ochre-light uppercase tracking-widest mb-2">
                ✦ Hidden Gem of the Week
              </span>
              <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Lora, serif' }}>
                {featured.title}
              </h2>
              <p className="text-white/80 text-sm mb-4 max-w-md line-clamp-2">{featured.description}</p>
              <div className="flex items-center gap-4">
                <a
                  href={`/listing/${featured.slug}`}
                  className="bg-brand-green text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-green-light transition-colors"
                >
                  Explore this trek →
                </a>
                <span className="text-white/70 text-sm">From ${featured.pricePerPerson} / person</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile featured card ───────────────────────────────────── */}
      {featured && filter === 'all' && query.trim() === '' && (
        <div className="md:hidden px-4 mb-1">
          <p className="section-title mb-2">✦ Hidden Gem of the Week</p>
          <ListingCard listing={featured} featured />
        </div>
      )}

      {/* ── Random trail CTA ───────────────────────────────────────── */}
      {filter === 'all' && query.trim() === '' && (
        <div className="mx-4 md:mx-8 mb-5">
          <button
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-brand-green/40 text-brand-green text-sm font-semibold active:scale-95 transition-transform"
            style={{ backgroundColor: 'rgba(216,243,220,0.3)' }}
          >
            <Shuffle size={16} />
            Surprise me — Random Hidden Trail
          </button>
        </div>
      )}

      {/* ── Listing grid ───────────────────────────────────────────── */}
      <div className="md:px-8">
        {filtered.length > 0 ? (
          <>
            <p className="section-title px-4 md:px-0 mb-3">
              {query.trim() !== ''
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`
                : filter === 'all' ? 'All Experiences' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
            </p>
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {filtered.map((listing) => (
                <div key={listing.id} className="md:[&>div]:mx-0">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <span className="text-4xl mb-3">🏔️</span>
            <p className="font-semibold text-neutral-charcoal mb-1">No trails found</p>
            <p className="text-sm text-neutral-mid">Try a different search or remove filters.</p>
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  )
}
