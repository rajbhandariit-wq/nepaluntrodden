export type RefundPolicy = 'full' | 'partial' | 'none'

export interface RefundResult {
  policy: RefundPolicy
  hoursToStart: number
  refundAmount: number     // back to traveler
  refundPercent: number
  platformKeeps: number    // platform revenue on cancellation
  hostKeeps: number        // host compensation (only in <24h case)
}

/**
 * Calculates the refund amounts based on how far in advance the booking
 * is cancelled relative to the trek/stay start date.
 *
 * Rules:
 *   >= 72h before start  → 100% refund to traveler
 *   24–72h before start  → 80% refund; platform keeps 20%
 *   <  24h before start  → 0% refund; host gets 80%, platform keeps 20%
 *   payment not captured → no refund needed (returns policy:'full', amounts:0)
 */
export function calculateRefund(
  startDate: Date,
  cancelledAt: Date,
  grossAmount: number,
  paymentCaptured = true,
): RefundResult {
  if (!paymentCaptured) {
    return { policy: 'full', hoursToStart: 0, refundAmount: 0, refundPercent: 100, platformKeeps: 0, hostKeeps: 0 }
  }

  const msToStart = startDate.getTime() - cancelledAt.getTime()
  const hoursToStart = msToStart / (1000 * 60 * 60)

  if (hoursToStart >= 72) {
    return {
      policy: 'full',
      hoursToStart,
      refundAmount: grossAmount,
      refundPercent: 100,
      platformKeeps: 0,
      hostKeeps: 0,
    }
  }

  if (hoursToStart >= 24) {
    const refundAmount = +(grossAmount * 0.8).toFixed(2)
    const platformKeeps = +(grossAmount * 0.2).toFixed(2)
    return {
      policy: 'partial',
      hoursToStart,
      refundAmount,
      refundPercent: 80,
      platformKeeps,
      hostKeeps: 0,
    }
  }

  // < 24h: no refund, host paid their share
  const hostKeeps  = +(grossAmount * 0.8).toFixed(2)
  const platformKeeps = +(grossAmount * 0.2).toFixed(2)
  return {
    policy: 'none',
    hoursToStart,
    refundAmount: 0,
    refundPercent: 0,
    platformKeeps,
    hostKeeps,
  }
}

/**
 * Pro-rata refund for partial cancellation (e.g. cutting a 7-day trek to 4 days).
 */
export function calculateProRataRefund(
  totalDays: number,
  cancelledDays: number,
  grossAmount: number,
  cancelledAt: Date,
  startDate: Date,
): RefundResult {
  if (totalDays <= 0 || cancelledDays <= 0) {
    return calculateRefund(startDate, cancelledAt, grossAmount)
  }
  const proRataGross = +(grossAmount * (cancelledDays / totalDays)).toFixed(2)
  return calculateRefund(startDate, cancelledAt, proRataGross)
}
