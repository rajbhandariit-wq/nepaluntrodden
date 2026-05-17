// Approximate exchange rate — update periodically or replace with live API
export const USD_TO_NPR = 135

export type Currency = 'NPR' | 'USD'

export function formatCurrency(amount: number, currency: Currency = 'NPR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / USD_TO_NPR)
  }
  return new Intl.NumberFormat('ne-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(amount)
}

export function usdToNpr(usd: number): number {
  return +(usd * USD_TO_NPR).toFixed(2)
}

export function nprToUsd(npr: number): number {
  return +(npr / USD_TO_NPR).toFixed(2)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const NEPAL_BANKS = [
  'NABIL Bank', 'Standard Chartered', 'Himalayan Bank', 'NMB Bank',
  'SBI Bank', 'Everest Bank', 'NIC Asia', 'Machhapuchchhre Bank',
  'Kumari Bank', 'Laxmi Sunrise Bank', 'Prabhu Bank', 'Citizens Bank',
  'Global IME Bank', 'Prime Commercial Bank', 'Sanima Bank',
]

export const STATUS_STYLES: Record<string, string> = {
  pending:             'bg-amber-100 text-amber-700',
  captured:            'bg-emerald-100 text-emerald-700',
  refunded:            'bg-blue-100 text-blue-700',
  partially_refunded:  'bg-indigo-100 text-indigo-700',
  failed:              'bg-red-100 text-red-700',
  processing:          'bg-purple-100 text-purple-700',
  paid:                'bg-emerald-100 text-emerald-700',
  na:                  'bg-neutral-100 text-neutral-500',
}
