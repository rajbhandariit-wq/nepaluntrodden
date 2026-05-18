'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Trash2, ExternalLink, Eye, Lock } from 'lucide-react'

export default function PrivacyPage() {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const requestExport = () => {
    alert('Your data export has been requested. You will receive an email within 48 hours.')
  }

  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Privacy & Data</h1>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* What we collect */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-brand-green" />
            <p className="text-sm font-semibold text-neutral-charcoal">What we collect</p>
          </div>
          {['Name and email address', 'Booking and trip history', 'Saved listings (wishlist)', 'Emergency contacts you provide', 'Device language preference'].map(item => (
            <p key={item} className="text-xs text-neutral-mid flex items-start gap-1.5 mb-1.5">
              <span className="text-status-success font-bold mt-0.5">·</span> {item}
            </p>
          ))}
        </div>

        {/* Documents */}
        <div>
          <p className="section-title mb-3">Legal documents</p>
          <div className="card overflow-hidden">
            {[
              { label: 'Privacy Policy',    href: '#' },
              { label: 'Terms of Service',  href: '#' },
              { label: 'Cookie Policy',     href: '#' },
            ].map(({ label, href }, i) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3.5 active:bg-neutral-pale transition-colors ${i < 2 ? 'border-b border-neutral-light/60' : ''}`}
              >
                <Lock size={15} className="text-brand-green" />
                <span className="flex-1 text-sm font-medium text-neutral-charcoal">{label}</span>
                <ExternalLink size={14} className="text-neutral-light" />
              </a>
            ))}
          </div>
        </div>

        {/* Data actions */}
        <div>
          <p className="section-title mb-3">Your data</p>
          <button
            onClick={requestExport}
            className="w-full flex items-center gap-3 px-4 py-3.5 card mb-2 active:bg-neutral-pale transition-colors"
          >
            <Download size={16} className="text-brand-green" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-neutral-charcoal">Download my data</p>
              <p className="text-xs text-neutral-mid">Get a copy of all your account data</p>
            </div>
          </button>
        </div>

        {/* Delete account */}
        <div className="border border-red-100 rounded-2xl p-4 bg-red-50">
          <p className="text-sm font-semibold text-status-error mb-1">Delete account</p>
          <p className="text-xs text-neutral-mid mb-3">This permanently removes all your data and cannot be undone.</p>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm font-semibold text-status-error">
              <Trash2 size={15} /> Request account deletion
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-status-error">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl border border-neutral-light text-sm font-medium text-neutral-mid bg-white">Cancel</button>
                <button className="flex-1 py-2 rounded-xl bg-status-error text-white text-sm font-semibold">Yes, delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
