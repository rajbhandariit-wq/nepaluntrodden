'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, MapPin, Star } from 'lucide-react'

interface SavedListing {
  id: string
  slug: string
  title: string
  image: string
  district: string
  pricePerPerson: number
  currency: string
  rating: number
  reviewCount: number
  type: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<SavedListing[]>([])

  useEffect(() => {
    const saved: SavedListing[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('nu_wish_')) {
        try {
          const val = localStorage.getItem(key)
          if (val) saved.push(JSON.parse(val))
        } catch {}
      }
    }
    setItems(saved)
  }, [])

  const remove = (id: string) => {
    localStorage.removeItem(`nu_wish_${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Wishlist</h1>
        {items.length > 0 && (
          <span className="ml-auto text-white/70 text-sm">{items.length} saved</span>
        )}
      </div>

      <div className="px-4 py-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-brand-green-pale flex items-center justify-center mb-4">
              <Heart size={28} className="text-brand-green" />
            </div>
            <p className="text-lg font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>Nothing saved yet</p>
            <p className="text-sm text-neutral-mid mb-6 max-w-xs">Tap the heart on any listing to save it here for later.</p>
            <Link href="/" className="bg-brand-green text-white font-semibold px-6 py-3 rounded-2xl text-sm">
              Explore listings →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card overflow-hidden flex gap-3 p-3">
                <Link href={`/listing/${item.slug}`} className="shrink-0">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/listing/${item.slug}`}>
                    <p className="text-sm font-semibold text-neutral-charcoal leading-tight mb-1 line-clamp-2">{item.title}</p>
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-neutral-mid mb-1">
                    <MapPin size={11} /> {item.district}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-brand-green">
                      {item.currency} {item.pricePerPerson.toLocaleString()}
                      <span className="text-[10px] text-neutral-mid font-normal">/person</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-neutral-mid">
                      <Star size={11} className="fill-brand-ochre text-brand-ochre" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <button onClick={() => remove(item.id)} className="shrink-0 self-start p-1">
                  <Heart size={18} className="fill-status-error text-status-error" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
