import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/nav/BottomNav'
import SidebarNav from '@/components/nav/SidebarNav'

export const metadata: Metadata = {
  title: 'Nepal Untrodden — Venture Beyond the Trails',
  description: 'Discover authentic off-path treks, remote homestays and hidden cultural gems across Nepal.',
}

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-body">
        {/* Desktop sidebar — hidden on mobile */}
        <SidebarNav />

        {/* Main content — shifts right on desktop to clear sidebar */}
        <div className="app-content">
          <main>{children}</main>
        </div>

        {/* Mobile bottom nav — hidden on desktop */}
        <BottomNav />
      </body>
    </html>
  )
}
