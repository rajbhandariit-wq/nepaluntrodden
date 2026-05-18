'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Download, Search, Check, WifiOff } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const PINS = [
  { x: '38%', y: '28%', type: 'trek' },
  { x: '58%', y: '48%', type: 'homestay' },
  { x: '32%', y: '52%', type: 'trek' },
  { x: '62%', y: '72%', type: 'experience' },
  { x: '22%', y: '38%', type: 'trek' },
]

const STORAGE_KEY = 'nu_offline_map'

export default function MapClient({ serverListings }: { serverListings: Listing[] }) {
  const [listings, setListings] = useState<Listing[]>(serverListings)
  const [isOffline, setIsOffline] = useState(false)
  const [cached, setCached] = useState(false)
  const [justCached, setJustCached] = useState(false)

  useEffect(() => {
    const offline = !navigator.onLine
    setIsOffline(offline)

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCached(true)
      if (offline || serverListings.length === 0) {
        try { setListings(JSON.parse(stored)) } catch {}
      }
    }

    const onOnline  = () => setIsOffline(false)
    const onOffline = () => {
      setIsOffline(true)
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) { try { setListings(JSON.parse(raw)) } catch {} }
    }
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [serverListings])

  const handleSaveOffline = () => {
    if (listings.length === 0) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
    setCached(true)
    setJustCached(true)
    setTimeout(() => setJustCached(false), 2000)
  }

  const pinColor = (type: string) =>
    type === 'homestay' ? 'bg-brand-ochre' : type === 'experience' ? 'bg-purple-500' : 'bg-brand-green'

  return (
    <div style={{ height: '100dvh' }} className="flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-light px-4 pt-12 md:pt-4 pb-3 flex items-center gap-2 shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-neutral-pale rounded-xl px-3 py-2">
          <Search size={15} className="text-neutral-mid shrink-0" />
          <span className="text-sm text-neutral-mid">Search on map...</span>
        </div>
        <button
          onClick={handleSaveOffline}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
            isOffline   ? 'text-status-error bg-red-50' :
            justCached  ? 'text-status-success bg-green-50' :
            cached      ? 'text-brand-green bg-brand-green-pale' :
                          'text-brand-green bg-brand-green-pale'
          }`}
        >
          {isOffline   ? <WifiOff size={14} /> :
           justCached  ? <Check size={14} /> :
                         <Download size={14} />}
          {isOffline ? 'Offline' : justCached ? 'Saved!' : cached ? 'Update' : 'Offline'}
        </button>
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <WifiOff size={13} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">You&apos;re offline — showing {listings.length} cached listings</p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Map canvas */}
        <div className="flex-1 relative overflow-hidden bg-[#e8f0e8]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(45,106,79,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(45,106,79,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
            <ellipse cx="40%" cy="35%" rx="120" ry="80"  fill="none" stroke="#2D6A4F" strokeWidth="1.5" />
            <ellipse cx="40%" cy="35%" rx="80"  ry="55"  fill="none" stroke="#2D6A4F" strokeWidth="1.5" />
            <ellipse cx="65%" cy="55%" rx="100" ry="65"  fill="none" stroke="#2D6A4F" strokeWidth="1.5" />
            <ellipse cx="65%" cy="55%" rx="60"  ry="40"  fill="none" stroke="#2D6A4F" strokeWidth="1.5" />
            <path d="M 80 300 Q 120 220 180 250 Q 240 270 300 200 Q 360 130 400 160"
              fill="none" stroke="#2D6A4F" strokeWidth="2" strokeDasharray="6,4" />
          </svg>

          {/* Legend */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-card text-xs space-y-1.5">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-ochre inline-block" /> Homestays</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ borderTop: '2px dashed #2D6A4F' }} /> Treks</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" /> Hidden gems</div>
          </div>

          {/* Pins */}
          {PINS.slice(0, listings.length).map((pin, i) => (
            <Link
              key={i}
              href={`/listing/${listings[i].slug}`}
              className="absolute"
              style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center border-2 border-white active:scale-90 transition-transform ${pinColor(pin.type)}`}>
                <MapPin size={14} className="text-white" />
              </div>
            </Link>
          ))}

          {/* Mobile bottom sheet */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-nav p-4 pb-24">
            <div className="w-10 h-1 bg-neutral-light rounded-full mx-auto mb-3" />
            <p className="section-title mb-3">{listings.length} experiences in Nepal</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {listings.map((l) => (
                <Link key={l.id} href={`/listing/${l.slug}`} className="shrink-0 w-44 card overflow-hidden">
                  <img src={l.images[0]} alt={l.title} className="w-full h-24 object-cover" />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-neutral-charcoal leading-tight line-clamp-2 mb-1">{l.title}</p>
                    <p className="text-xs font-bold text-brand-green">
                      {formatPrice(l.pricePerPerson, l.currency)}
                      <span className="text-[10px] text-neutral-mid font-normal">/person</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-72 bg-white border-l border-neutral-light overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-light shrink-0">
            <p className="section-title">{listings.length} experiences in Nepal</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listings.map((l) => (
              <Link key={l.id} href={`/listing/${l.slug}`} className="flex gap-3 p-3 border-b border-neutral-light/60 hover:bg-neutral-pale transition-colors">
                <img src={l.images[0]} alt={l.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-charcoal leading-tight line-clamp-2 mb-1">{l.title}</p>
                  <p className="text-xs text-neutral-mid mb-1">{l.district}</p>
                  <p className="text-xs font-bold text-brand-green">
                    {formatPrice(l.pricePerPerson, l.currency)}
                    <span className="text-[10px] text-neutral-mid font-normal"> /person</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
