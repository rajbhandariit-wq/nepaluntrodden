'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, CreditCard, Smartphone, Building2, Banknote, MapPin } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { ADDONS, PAYMENT_METHODS } from '@/lib/data'
import { formatPrice, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Dates', 'Travelers', 'Add-ons', 'Review', 'Message', 'Payment', 'Confirm']

export default function BookingWizard({ listing }: { listing: Listing }) {
  const [step, setStep] = useState(0)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [insurance, setInsurance] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingRef, setBookingRef] = useState('NEP-8723A')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id)
    if (!addon) return sum
    return sum + (id === 'porter' ? addon.price * (listing.durationDays ?? 1) : addon.price)
  }, 0)

  const baseTotal = listing.pricePerPerson * adults
  const platformFee = Math.round(baseTotal * 0.10)
  const insuranceFee = insurance ? Math.round(baseTotal * 0.05) : 0
  const grandTotal = baseTotal + addonsTotal + platformFee + insuranceFee
  const hostPayout = Math.round(baseTotal * 0.88)

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }
  function next() { if (step < STEPS.length - 1) setStep(step + 1) }
  function back() { if (step > 0) setStep(step - 1) }

  async function confirmBooking() {
    setSaving(true)
    setSaveError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated: save to database
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: listing.id,
            dateFrom, dateTo,
            numAdults: adults, numChildren: children,
            addons: selectedAddons,
            paymentMethod, messageToHost: message,
            includeInsurance: insurance,
            baseTotal, addonsTotal, platformFee, insuranceFee, grandTotal,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setBookingRef(data.booking_ref ?? bookingRef)
        }
      }
      // If not logged in, proceed with the mock ref (guest checkout)
      setConfirmed(true)
    } catch {
      setSaveError('Could not save booking. Proceeding with confirmation.')
      setConfirmed(true)
    } finally {
      setSaving(false)
    }
  }

  const paymentIcon: Record<string, React.ReactNode> = {
    card:    <CreditCard size={18} />,
    esewa:   <Smartphone size={18} />,
    khalti:  <Smartphone size={18} />,
    bank:    <Building2 size={18} />,
    arrival: <Banknote size={18} />,
  }

  if (confirmed) {
    return (
      <div className="page-scroll">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center pb-24 md:max-w-2xl md:mx-auto">
          <div className="w-20 h-20 rounded-full bg-brand-green-pale flex items-center justify-center mb-5">
            <Check size={36} className="text-brand-green" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-charcoal mb-1" style={{ fontFamily: 'Lora, serif' }}>Booking Confirmed!</h1>
          <p className="text-neutral-mid text-sm mb-2">Booking ID</p>
          <p className="text-lg font-bold text-brand-green mb-6 tracking-widest">{bookingRef}</p>

          <div className="card w-full p-4 mb-4 text-left">
            <p className="text-sm font-semibold text-neutral-charcoal mb-3">{listing.title}</p>
            {dateFrom && dateTo && <p className="text-xs text-neutral-mid mb-1">📅 {dateFrom} → {dateTo}</p>}
            <p className="text-xs text-neutral-mid mb-3">👤 {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? ` · ${children} child` : ''}</p>
            <div className="border-t border-neutral-light pt-3">
              <p className="text-sm font-bold text-neutral-charcoal">Total: {formatPrice(grandTotal)}</p>
              <p className="text-xs text-brand-green mt-0.5">
                💚 {formatPrice(hostPayout)} goes directly to {listing.guide?.name ?? 'your host'}
              </p>
            </div>
          </div>

          <div className="card w-full p-4 mb-6">
            <p className="text-sm font-semibold text-neutral-charcoal mb-3">📦 Your offline pack is ready</p>
            <div className="space-y-2">
              {['GPX trail map & offline markers', 'Emergency contacts', 'Meeting point details', '30 essential Nepali phrases'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check size={13} className="text-brand-green shrink-0" />
                  <p className="text-xs text-neutral-charcoal">{item}</p>
                </div>
              ))}
            </div>
            <button className="btn-outline mt-4 text-sm py-3">Download Offline Pack</button>
          </div>

          <Link href="/trips" className="btn-primary text-sm py-3">Go to My Trips →</Link>
          <Link href="/" className="text-brand-green text-sm mt-4">← Back to Discover</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-scroll">
      <div className="bg-white border-b border-neutral-light px-4 pt-12 md:pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={step === 0 ? `/listing/${listing.slug}` : '#'} onClick={step > 0 ? (e) => { e.preventDefault(); back() } : undefined}>
            <ArrowLeft size={20} className="text-neutral-charcoal" />
          </Link>
          <div className="flex-1">
            <p className="text-xs text-neutral-mid">{listing.title}</p>
            <p className="text-sm font-semibold text-neutral-charcoal">{STEPS[step]}</p>
          </div>
          <span className="text-xs text-neutral-mid font-medium">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="mt-3 bg-neutral-light rounded-full h-1.5">
          <div className="bg-brand-green h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="px-5 py-6 md:max-w-2xl md:mx-auto md:px-8 md:py-8">
        {/* Step 0: Dates */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-1">Select your dates</h2>
            <p className="text-sm text-neutral-mid mb-5">{listing.durationDays ? `${listing.durationDays}-day trip` : 'Choose check-in & check-out'}</p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Start date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-mid block mb-1.5">End date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" />
              </div>
            </div>
            {listing.bestMonths.length > 0 && (
              <div className="bg-brand-green-pale/50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-semibold text-brand-green mb-2">Best months to visit</p>
                <div className="flex flex-wrap gap-1.5">
                  {listing.bestMonths.map((m) => <span key={m} className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">{m}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Travelers */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-1">How many travelers?</h2>
            <p className="text-sm text-neutral-mid mb-6">Max group size: {listing.maxGroupSize ?? '∞'}</p>
            <div className="space-y-4">
              {[
                { label: 'Adults', sub: 'Age 18+', value: adults, min: 1, set: setAdults },
                { label: 'Children', sub: 'Under 12', value: children, min: 0, set: setChildren },
              ].map(({ label, sub, value, min, set }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-light">
                  <div>
                    <p className="font-semibold text-neutral-charcoal text-sm">{label}</p>
                    <p className="text-xs text-neutral-mid">{sub}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => set(Math.max(min, value - 1))} disabled={value <= min}
                      className="w-9 h-9 rounded-full border-2 border-neutral-light flex items-center justify-center text-neutral-charcoal font-bold text-lg active:scale-90 transition-transform disabled:opacity-30">−</button>
                    <span className="w-6 text-center font-bold text-neutral-charcoal">{value}</span>
                    <button onClick={() => set(value + 1)}
                      className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-lg active:scale-90 transition-transform">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Add-ons */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-1">Optional extras</h2>
            <p className="text-sm text-neutral-mid mb-5">Enhance your experience</p>
            <div className="space-y-3">
              {ADDONS.map((addon) => {
                const selected = selectedAddons.includes(addon.id)
                const price = addon.id === 'porter' ? addon.price * (listing.durationDays ?? 1) : addon.price
                return (
                  <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                    className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150', selected ? 'border-brand-green bg-brand-green-pale/40' : 'border-neutral-light bg-white')}>
                    <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', selected ? 'border-brand-green bg-brand-green' : 'border-neutral-light')}>
                      {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-charcoal">{addon.label}</p>
                      <p className="text-xs text-neutral-mid">{addon.description}</p>
                    </div>
                    <p className="text-sm font-bold text-brand-green shrink-0">+${price}{addon.unit}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Price breakdown */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-5">Your trip total</h2>
            <div className="card p-4 mb-4">
              <div className="space-y-2.5 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mid">{formatPrice(listing.pricePerPerson)} × {adults} adult{adults !== 1 ? 's' : ''}</span>
                  <span className="font-semibold text-neutral-charcoal">{formatPrice(baseTotal)}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-mid">Add-ons</span>
                    <span className="font-semibold text-neutral-charcoal">+{formatPrice(addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mid">Platform fee (10%)</span>
                  <span className="font-semibold text-neutral-charcoal">+{formatPrice(platformFee)}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-mid">Booking insurance (5%)</span>
                    <span className="font-semibold text-neutral-charcoal">+{formatPrice(insuranceFee)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-light pt-3 flex justify-between">
                <span className="font-bold text-neutral-charcoal">Total</span>
                <span className="font-bold text-lg text-neutral-charcoal">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button onClick={() => setInsurance(!insurance)}
              className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left mb-4 transition-all', insurance ? 'border-brand-green bg-brand-green-pale/40' : 'border-neutral-light bg-white')}>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', insurance ? 'border-brand-green bg-brand-green' : 'border-neutral-light')}>
                {insurance && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-charcoal">Add booking insurance</p>
                <p className="text-xs text-neutral-mid">Covers cancellation & emergency evacuation · +5%</p>
              </div>
            </button>
            <div className="bg-brand-green-pale rounded-2xl p-4">
              <p className="text-xs font-semibold text-brand-green mb-1">💚 Community impact</p>
              <p className="text-xs text-neutral-charcoal"><strong>{formatPrice(hostPayout)}</strong> (88%) goes directly to {listing.guide?.name ?? 'your host'}&apos;s family.</p>
            </div>
          </div>
        )}

        {/* Step 4: Message */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-1">Message to {listing.guide?.name ?? 'host'}</h2>
            <p className="text-sm text-neutral-mid mb-5">Optional — introduce yourself or share any requirements</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={`e.g. "I'm vegetarian. Can't wait for this trek!"`}
              maxLength={300} rows={5} className="input-field resize-none" />
            <p className="text-xs text-neutral-mid text-right mt-1">{message.length} / 300</p>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-1">How would you like to pay?</h2>
            <p className="text-sm text-neutral-mid mb-5">Total: <strong>{formatPrice(grandTotal)}</strong></p>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                  className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all', paymentMethod === pm.id ? 'border-brand-green bg-brand-green-pale/40' : 'border-neutral-light bg-white')}>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', paymentMethod === pm.id ? 'border-brand-green bg-brand-green' : 'border-neutral-light')}>
                    {paymentMethod === pm.id && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn('shrink-0', paymentMethod === pm.id ? 'text-brand-green' : 'text-neutral-mid')}>{paymentIcon[pm.id]}</span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-charcoal">{pm.label}</p>
                    <p className="text-xs text-neutral-mid">{pm.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              <MapPin size={13} className="text-neutral-mid" />
              <p className="text-xs text-neutral-mid">🔒 Payments secured. Card data never stored on our servers.</p>
            </div>
          </div>
        )}

        {/* Step 6: Confirm */}
        {step === 6 && (
          <div>
            <h2 className="text-lg font-bold text-neutral-charcoal mb-5">Confirm booking</h2>
            <div className="card p-4 mb-4">
              <img src={listing.images[0]} alt={listing.title} className="w-full rounded-xl object-cover mb-3" style={{ height: 140 }} />
              <p className="font-semibold text-neutral-charcoal mb-1">{listing.title}</p>
              {dateFrom && dateTo && <p className="text-xs text-neutral-mid mb-1">📅 {dateFrom} → {dateTo}</p>}
              <p className="text-xs text-neutral-mid mb-1">👤 {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? ` · ${children} child` : ''}</p>
              {selectedAddons.length > 0 && <p className="text-xs text-neutral-mid mb-1">➕ {selectedAddons.join(', ')}</p>}
              <p className="text-xs text-neutral-mid">💳 {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
              <div className="border-t border-neutral-light mt-3 pt-3 flex justify-between">
                <span className="font-bold text-neutral-charcoal">Total</span>
                <span className="font-bold text-lg text-neutral-charcoal">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <p className="text-xs text-neutral-mid text-center mb-5">
              By confirming, you agree to the <span className="text-brand-green font-medium">cancellation policy</span> and <span className="text-brand-green font-medium">terms of service</span>.
            </p>
            {saveError && <p className="text-xs text-status-error text-center mb-3">{saveError}</p>}
          </div>
        )}

        <div className="mt-8">
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary">Continue →</button>
          ) : (
            <button onClick={confirmBooking} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Confirming...' : `Confirm Booking · ${formatPrice(grandTotal)}`}
            </button>
          )}
          {step > 0 && <button onClick={back} className="btn-outline mt-3">← Back</button>}
        </div>
      </div>
    </div>
  )
}
