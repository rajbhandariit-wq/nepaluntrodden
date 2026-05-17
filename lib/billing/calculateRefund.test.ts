/**
 * Unit tests for calculateRefund
 * Run with: npx vitest lib/billing/calculateRefund.test.ts
 * Install:  npm install -D vitest
 */
import { describe, it, expect } from 'vitest'
import { calculateRefund, calculateProRataRefund } from './calculateRefund'

const GROSS = 10000 // NPR 10,000

function hoursFrom(h: number): Date {
  return new Date(Date.now() + h * 60 * 60 * 1000)
}

describe('calculateRefund — policy boundaries', () => {
  it('returns full refund exactly at 72h boundary', () => {
    const result = calculateRefund(hoursFrom(72), new Date(), GROSS)
    expect(result.policy).toBe('full')
    expect(result.refundAmount).toBe(GROSS)
    expect(result.platformKeeps).toBe(0)
    expect(result.hostKeeps).toBe(0)
  })

  it('returns full refund > 72h before start', () => {
    const result = calculateRefund(hoursFrom(96), new Date(), GROSS)
    expect(result.policy).toBe('full')
    expect(result.refundAmount).toBe(GROSS)
  })

  it('returns 80% refund at 48h (inside 24–72h window)', () => {
    const result = calculateRefund(hoursFrom(48), new Date(), GROSS)
    expect(result.policy).toBe('partial')
    expect(result.refundAmount).toBe(8000)
    expect(result.platformKeeps).toBe(2000)
    expect(result.hostKeeps).toBe(0)
  })

  it('returns 80% refund exactly at 24h boundary', () => {
    const result = calculateRefund(hoursFrom(24), new Date(), GROSS)
    expect(result.policy).toBe('partial')
    expect(result.refundAmount).toBe(8000)
  })

  it('returns no refund < 24h before start', () => {
    const result = calculateRefund(hoursFrom(12), new Date(), GROSS)
    expect(result.policy).toBe('none')
    expect(result.refundAmount).toBe(0)
    expect(result.platformKeeps).toBe(2000)
    expect(result.hostKeeps).toBe(8000)
  })

  it('returns no refund when start date has already passed', () => {
    const pastDate = hoursFrom(-1) // 1 hour ago
    const result = calculateRefund(pastDate, new Date(), GROSS)
    expect(result.policy).toBe('none')
    expect(result.refundAmount).toBe(0)
  })

  it('platform + host + refund always sums to gross', () => {
    for (const h of [0, 12, 24, 48, 72, 96]) {
      const r = calculateRefund(hoursFrom(h), new Date(), GROSS)
      expect(r.refundAmount + r.platformKeeps + r.hostKeeps).toBeCloseTo(GROSS, 2)
    }
  })
})

describe('calculateRefund — edge cases', () => {
  it('skips refund if payment not captured', () => {
    const result = calculateRefund(hoursFrom(10), new Date(), GROSS, false)
    expect(result.refundAmount).toBe(0)
    expect(result.policy).toBe('full') // policy says full but amount is 0 — nothing to process
  })

  it('handles zero gross amount', () => {
    const result = calculateRefund(hoursFrom(100), new Date(), 0)
    expect(result.refundAmount).toBe(0)
    expect(result.platformKeeps).toBe(0)
  })

  it('rounds to 2 decimal places on fractional amounts', () => {
    const result = calculateRefund(hoursFrom(48), new Date(), 10001)
    expect(result.refundAmount).toBe(8000.80)
    expect(result.platformKeeps).toBe(2000.20)
  })
})

describe('calculateProRataRefund', () => {
  it('calculates proportional refund for 3 of 7 days cancelled at 80h', () => {
    // 7-day trek, 3 days cancelled, 80h before start → full refund policy
    const result = calculateProRataRefund(7, 3, GROSS, new Date(), hoursFrom(80))
    const proRataGross = (GROSS * 3) / 7
    expect(result.refundAmount).toBeCloseTo(proRataGross, 1)
    expect(result.policy).toBe('full')
  })

  it('applies cancellation policy to pro-rata amount', () => {
    // 7-day trek, 3 days cancelled, 48h before start → 80% of pro-rata
    const result = calculateProRataRefund(7, 3, GROSS, new Date(), hoursFrom(48))
    const proRataGross = (GROSS * 3) / 7
    expect(result.refundAmount).toBeCloseTo(proRataGross * 0.8, 1)
    expect(result.policy).toBe('partial')
  })
})
