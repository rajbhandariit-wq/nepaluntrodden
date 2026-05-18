import { getAllListings } from '@/lib/queries'
import MapClient from '@/components/map/MapClient'
import type { Listing } from '@/lib/types'

export default async function MapPage() {
  let listings: Listing[] = []
  try {
    listings = await getAllListings()
  } catch {
    // Offline or fetch failed; MapClient will load from localStorage
  }
  return <MapClient serverListings={listings} />
}
