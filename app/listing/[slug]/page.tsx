import { getListingBySlug, getListingReviews } from '@/lib/queries'
import ListingDetailClient from '@/components/listing/ListingDetailClient'
import Link from 'next/link'

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [listing, reviews] = await Promise.all([
    getListingBySlug(slug),
    getListingBySlug(slug).then((l) => l ? getListingReviews(l.id) : []),
  ])

  if (!listing) {
    return (
      <div className="page-scroll flex items-center justify-center">
        <div className="text-center py-20">
          <p className="text-2xl mb-2">🏔️</p>
          <p className="font-semibold text-neutral-charcoal">Trail not found</p>
          <Link href="/" className="text-brand-green text-sm mt-2 block">← Back to Discover</Link>
        </div>
      </div>
    )
  }

  return <ListingDetailClient listing={listing} reviews={reviews} />
}
