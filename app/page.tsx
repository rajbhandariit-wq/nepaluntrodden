import { getAllListings } from '@/lib/queries'
import DiscoverClient from '@/components/discover/DiscoverClient'

export default async function DiscoverPage() {
  const listings = await getAllListings()
  return <DiscoverClient listings={listings} />
}
