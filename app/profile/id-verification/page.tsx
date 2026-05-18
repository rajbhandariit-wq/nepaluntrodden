'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Upload, CheckCircle2, Clock, XCircle } from 'lucide-react'

const docs = [
  { label: 'Government ID', sub: 'National ID, citizenship card', status: 'verified' as const },
  { label: 'Passport',      sub: 'For international bookings',   status: 'not_uploaded' as const },
  { label: 'Phone number',  sub: '+977 ··· ··· ····',           status: 'verified' as const },
  { label: 'Email address', sub: 'Verified via sign-in',         status: 'verified' as const },
]

const statusConfig = {
  verified:     { icon: CheckCircle2, color: 'text-status-success', bg: 'bg-green-50',   label: 'Verified' },
  pending:      { icon: Clock,        color: 'text-brand-ochre',    bg: 'bg-amber-50',   label: 'Pending review' },
  not_uploaded: { icon: XCircle,      color: 'text-neutral-light',  bg: 'bg-neutral-pale', label: 'Not uploaded' },
}

export default function IdVerificationPage() {
  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>ID Verification</h1>
      </div>

      {/* Trust score */}
      <div className="mx-4 -mt-2 bg-white rounded-2xl shadow-card p-5 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-green-pale flex items-center justify-center">
          <ShieldCheck size={26} className="text-brand-green" />
        </div>
        <div>
          <p className="text-xs text-neutral-mid mb-0.5">Trust score</p>
          <p className="text-2xl font-bold text-neutral-charcoal">85<span className="text-sm text-neutral-mid">/100</span></p>
          <p className="text-xs text-brand-green font-medium">Good standing</p>
        </div>
        <div className="ml-auto w-16 h-2 bg-neutral-pale rounded-full overflow-hidden">
          <div className="h-full bg-brand-green rounded-full" style={{ width: '85%' }} />
        </div>
      </div>

      <div className="px-4">
        <p className="section-title mb-3">Verification documents</p>
        <div className="card overflow-hidden mb-5">
          {docs.map(({ label, sub, status }, i) => {
            const cfg = statusConfig[status]
            const StatusIcon = cfg.icon
            return (
              <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i < docs.length - 1 ? 'border-b border-neutral-light/60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-charcoal">{label}</p>
                  <p className="text-xs text-neutral-mid">{sub}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg}`}>
                  <StatusIcon size={13} className={cfg.color} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold text-neutral-charcoal mb-1">Upload a new document</p>
          <p className="text-xs text-neutral-mid mb-3">Accepted formats: JPG, PNG, PDF — max 5 MB</p>
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-brand-green/30 text-brand-green text-sm font-semibold">
            <Upload size={16} /> Choose file
          </button>
        </div>
      </div>
    </div>
  )
}
