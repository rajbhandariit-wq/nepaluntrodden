import { getListingBySlug } from '@/lib/queries'
import BookingWizard from '@/components/booking/BookingWizard'

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing = await getListingBySlug(slug)

  if (!listing) {
    return (
      <div className="page-scroll flex items-center justify-center">
        <p className="text-neutral-mid py-20">Listing not found.</p>
      </div>
    )
  }

  return <BookingWizard listing={listing} />
}
