'use client'

import { useEffect } from 'react'
import { Mountain, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PendingPage() {
  useEffect(() => {
    // Sign out so subsequent navigation treats them as anonymous
    createClient().auth.signOut()
  }, [])

  return (
    <div className="page-scroll flex flex-col items-center justify-center px-6 py-12 min-h-screen text-center">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mb-8">
          <Mountain size={26} className="text-white" />
        </div>
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <Clock size={28} className="text-brand-ochre" />
        </div>
        <h1 className="text-xl font-bold text-neutral-charcoal mb-2" style={{ fontFamily: 'Lora, serif' }}>
          Application under review
        </h1>
        <p className="text-sm text-neutral-mid mb-2 max-w-xs">
          Your application is currently in review.
        </p>
        <p className="text-sm text-neutral-mid mb-6 max-w-xs">
          You will be notified by email / SMS once your account is verified.
        </p>
        <Link href="/login" className="text-brand-green text-sm font-semibold">
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
