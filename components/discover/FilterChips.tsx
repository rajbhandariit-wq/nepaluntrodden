'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'trek',       label: 'Treks' },
  { id: 'homestay',   label: 'Homestays' },
  { id: 'experience', label: 'Experiences' },
  { id: 'easy',       label: 'Easy' },
  { id: 'moderate',   label: 'Moderate' },
  { id: 'hard',       label: 'Hard' },
]

interface FilterChipsProps {
  onFilterChange?: (filter: string) => void
}

export default function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [active, setActive] = useState('all')

  function select(id: string) {
    setActive(id)
    onFilterChange?.(id)
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => select(id)}
          className={cn('chip', active === id ? 'chip-active' : 'chip-inactive')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
