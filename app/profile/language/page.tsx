'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

const STORAGE_KEY = 'nu_language'

const languages = [
  { code: 'en',    label: 'English',    native: 'English' },
  { code: 'ne',    label: 'Nepali',     native: 'नेपाली' },
  { code: 'hi',    label: 'Hindi',      native: 'हिन्दी' },
  { code: 'zh',    label: 'Chinese',    native: '中文' },
  { code: 'fr',    label: 'French',     native: 'Français' },
  { code: 'de',    label: 'German',     native: 'Deutsch' },
  { code: 'es',    label: 'Spanish',    native: 'Español' },
  { code: 'ja',    label: 'Japanese',   native: '日本語' },
  { code: 'ko',    label: 'Korean',     native: '한국어' },
]

export default function LanguagePage() {
  const [selected, setSelected] = useState('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setSelected(stored)
  }, [])

  const pick = (code: string) => {
    setSelected(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Language</h1>
      </div>

      <div className="px-4 py-5">
        <p className="text-xs text-neutral-mid mb-4">Choose the language used throughout the app.</p>
        <div className="card overflow-hidden">
          {languages.map(({ code, label, native }, i) => (
            <button
              key={code}
              onClick={() => pick(code)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-neutral-pale ${i < languages.length - 1 ? 'border-b border-neutral-light/60' : ''}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-charcoal">{label}</p>
                <p className="text-xs text-neutral-mid">{native}</p>
              </div>
              {selected === code && <Check size={16} className="text-brand-green shrink-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
