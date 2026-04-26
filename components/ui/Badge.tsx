import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'green' | 'ochre' | 'red' | 'gray'
  className?: string
}

const variants = {
  green: 'bg-brand-green-pale text-brand-green',
  ochre: 'bg-amber-50 text-brand-ochre',
  red:   'bg-red-50 text-status-error',
  gray:  'bg-neutral-pale text-neutral-mid',
}

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', variants[variant], className)}>
      {children}
    </span>
  )
}
