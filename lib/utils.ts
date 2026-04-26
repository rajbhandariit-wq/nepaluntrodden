import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'USD') {
  if (currency === 'USD') return `$${amount.toLocaleString()}`
  if (currency === 'NPR') return `NPR ${amount.toLocaleString()}`
  return `${currency} ${amount.toLocaleString()}`
}

export function difficultyColor(d?: string) {
  switch (d) {
    case 'easy':     return 'text-status-success bg-green-50'
    case 'moderate': return 'text-brand-ochre bg-amber-50'
    case 'hard':     return 'text-orange-600 bg-orange-50'
    case 'expert':   return 'text-status-error bg-red-50'
    default:         return 'text-neutral-mid bg-neutral-pale'
  }
}

export function difficultyLabel(d?: string) {
  if (!d) return ''
  return d.charAt(0).toUpperCase() + d.slice(1)
}
