import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from '@/components/host/ListingForm'

export const metadata = { title: 'New Listing — Host Panel' }

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-5" style={{ fontFamily: 'Lora, serif' }}>
        Create a new listing
      </h1>
      <ListingForm mode="create" userId={user.id} />
    </div>
  )
}
