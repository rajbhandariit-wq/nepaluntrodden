'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(false)
      prevPath.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/') || href === pathname) return
      setLoading(true)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        className="w-12 h-12 rounded-full animate-spin"
        style={{
          border: '3px solid rgba(45,106,79,0.15)',
          borderTopColor: '#2D6A4F',
        }}
      />
    </div>
  )
}
