'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

const STORAGE_KEY = 'nu_notif_prefs'

interface Prefs { bookings: boolean; reminders: boolean; newListings: boolean; promos: boolean }

const defaults: Prefs = { bookings: true, reminders: true, newListings: false, promos: false }

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${on ? 'bg-brand-green' : 'bg-neutral-light'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Prefs>(defaults)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPrefs({ ...defaults, ...JSON.parse(raw) })
    } catch {}
  }, [])

  const update = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const rows: { key: keyof Prefs; label: string; sub: string }[] = [
    { key: 'bookings',    label: 'Booking updates',       sub: 'Confirmations, cancellations, changes' },
    { key: 'reminders',   label: 'Trip reminders',        sub: 'Alerts before your upcoming trips' },
    { key: 'newListings', label: 'New experiences',       sub: 'Listings matching your interests' },
    { key: 'promos',      label: 'Promotions & offers',   sub: 'Discounts and seasonal deals' },
  ]

  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Notifications</h1>
      </div>

      <div className="px-4 py-5">
        <div className="card overflow-hidden mb-5">
          {rows.map(({ key, label, sub }, i) => (
            <div key={key} className={`flex items-center gap-3 px-4 py-3.5 ${i < rows.length - 1 ? 'border-b border-neutral-light/60' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-charcoal">{label}</p>
                <p className="text-xs text-neutral-mid">{sub}</p>
              </div>
              <Toggle on={prefs[key]} onChange={() => update(key)} />
            </div>
          ))}
        </div>

        {/* Emergency alerts — always on */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-status-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neutral-charcoal">Emergency alerts</p>
            <p className="text-xs text-neutral-mid mt-0.5">Safety and weather warnings are always on and cannot be disabled.</p>
          </div>
          <div className="ml-auto shrink-0">
            <div className="w-11 h-6 rounded-full bg-brand-green relative">
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
