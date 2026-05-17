import Link from 'next/link'
import { CheckCircle2, Clock, Download, MessageCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  type Booking = {
    id: string
    booking_ref: string
    status: string
    date_from: string | null
    date_to: string | null
    num_adults: number
    grand_total: number
    created_at: string
    listings: {
      title: string
      images: string[]
      slug: string
    } | null
  }

  let upcoming: Booking[] = []
  let past: Booking[] = []

  if (user) {
    const { data } = await supabase
      .from('bookings')
      .select('*, listings(title, images, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      const now = new Date()
      upcoming = (data as Booking[]).filter((b) => !b.date_from || new Date(b.date_from) >= now)
      past     = (data as Booking[]).filter((b) =>  b.date_from && new Date(b.date_from) <  now)
    }
  }

  if (!user) {
    return (
      <div className="page-scroll flex flex-col items-center justify-center py-20 text-center px-8 min-h-screen">
        <Clock size={40} className="text-neutral-light mb-3" />
        <p className="font-semibold text-neutral-charcoal mb-1">Sign in to see your trips</p>
        <p className="text-sm text-neutral-mid mb-5">Your bookings and travel history will appear here.</p>
        <Link href="/login" className="btn-primary text-sm py-3 px-6 w-auto inline-block">Sign in →</Link>
      </div>
    )
  }

  return (
    <div className="page-scroll">
      {/* Mobile header */}
      <div className="md:hidden px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>My Trips</h1>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 bg-brand-cream/95 backdrop-blur-sm border-b border-neutral-light z-10">
        <div>
          <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>My Trips</h1>
          <p className="text-sm text-neutral-mid">Your upcoming and past adventures</p>
        </div>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
          <Clock size={40} className="text-neutral-light mb-3" />
          <p className="font-semibold text-neutral-charcoal mb-1">No trips yet</p>
          <p className="text-sm text-neutral-mid mb-5">Start exploring Nepal&apos;s hidden trails</p>
          <Link href="/" className="btn-primary text-sm py-3 px-6 w-auto inline-block">Explore now →</Link>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="px-4 md:px-8 mb-6 md:mt-6">
              <p className="section-title mb-3">Upcoming ({upcoming.length})</p>
              <div className="md:grid md:grid-cols-2 md:gap-4">
                {upcoming.map((trip) => (
                  <div key={trip.id} className="card mb-3 md:mb-0 overflow-hidden">
                    <div className="relative h-32">
                      <img
                        src={trip.listings?.images?.[0] ?? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=200&fit=crop'}
                        alt={trip.listings?.title ?? 'Trip'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-semibold text-sm leading-tight">{trip.listings?.title}</p>
                        <p className="text-white/80 text-xs">
                          {trip.date_from && trip.date_to ? `${trip.date_from} → ${trip.date_to}` : 'Dates TBD'}
                        </p>
                      </div>
                      <span className="absolute top-3 right-3 text-[10px] font-semibold bg-status-success text-white px-2 py-0.5 rounded-full capitalize">
                        {trip.status}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-neutral-mid mb-3">
                        Booking ref: <span className="font-semibold text-brand-green">{trip.booking_ref}</span>
                        {' · '}{trip.num_adults} adult{trip.num_adults !== 1 ? 's' : ''}
                        {' · '}{formatPrice(trip.grand_total)}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="flex flex-col items-center gap-1 py-2 rounded-xl bg-neutral-pale text-xs text-neutral-charcoal font-medium">
                          <Download size={14} className="text-brand-green" /> Offline pack
                        </button>
                        <Link href={`/inbox/${trip.id}`} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-neutral-pale text-xs text-neutral-charcoal font-medium">
                          <MessageCircle size={14} className="text-brand-green" /> Chat guide
                        </Link>
                        <button className="flex flex-col items-center gap-1 py-2 rounded-xl bg-red-50 text-xs text-status-error font-medium">
                          <AlertTriangle size={14} /> SOS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="px-4 md:px-8">
              <p className="section-title mb-3">Past ({past.length})</p>
              <div className="md:grid md:grid-cols-2 md:gap-4">
                {past.map((trip) => (
                  <div key={trip.id} className="card mb-3 md:mb-0 flex gap-3 p-3">
                    <img
                      src={trip.listings?.images?.[0] ?? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=200&fit=crop'}
                      alt={trip.listings?.title ?? 'Trip'}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-charcoal leading-tight mb-0.5">{trip.listings?.title}</p>
                      <p className="text-xs text-neutral-mid mb-2">{trip.date_from ?? 'Date TBD'}</p>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-neutral-mid">
                          <CheckCircle2 size={11} className="text-status-success" /> Completed
                        </span>
                        {trip.listings?.slug && (
                          <Link href={`/listing/${trip.listings.slug}`} className="text-[10px] font-semibold text-neutral-mid bg-neutral-pale px-2 py-1 rounded-lg">
                            Book again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="h-6" />
    </div>
  )
}
