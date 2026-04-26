import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: number
  className?: string
}

export default function StarRating({ rating, reviewCount, size = 13, className }: StarRatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star size={size} className="fill-brand-ochre text-brand-ochre" />
      <span className="text-sm font-semibold text-neutral-charcoal">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-neutral-mid">({reviewCount})</span>
      )}
    </span>
  )
}
