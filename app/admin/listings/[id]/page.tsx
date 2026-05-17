import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import ListingActions from '@/components/admin/ListingActions'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100   text-amber-700',
    rejected: 'bg-red-100     text-status-error',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-mid mb-0.5 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-neutral-charcoal">{value ?? <span className="text-neutral-mid italic">—</span>}</p>
    </div>
  )
}

export default async function AdminListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: listing, error } = await admin
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !listing) notFound()

  // Fetch guide separately to avoid FK join cache issues
  const guideId = (listing as Record<string, unknown>).guide_id as string | null
  const { data: guideRow } = guideId
    ? await admin.from('guides').select('name, avatar_url, experience_years').eq('id', guideId).single()
    : { data: null }
  const guide = guideRow as Record<string, unknown> | null
  const status = listing.status ?? 'pending'

  return (
    <div className="max-w-2xl">
      <Link href="/admin/listings" className="inline-flex items-center gap-1.5 text-sm text-neutral-mid hover:text-neutral-charcoal mb-5 transition-colors">
        <ArrowLeft size={15} /> All listings
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
            {listing.title}
          </h1>
          <StatusBadge status={status} />
        </div>

        {/* All uploaded images */}
        {((listing.images as string[]) ?? []).length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(listing.images as string[]).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`${listing.title} photo ${i + 1}`}
                  className="w-full h-36 object-cover rounded-xl hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Type"         value={listing.type} />
          <Field label="Region"       value={listing.region} />
          <Field label="District"     value={listing.district} />
          <Field label="Price/person" value={listing.price_per_person ? `$${listing.price_per_person}` : undefined} />
          <Field label="Duration"     value={listing.duration_days ? `${listing.duration_days} days` : undefined} />
          <Field label="Difficulty"   value={listing.difficulty} />
          <Field label="Max group"    value={listing.max_group_size} />
          <Field label="Created"      value={new Date(listing.created_at).toLocaleDateString()} />
        </div>

        {listing.description && (
          <div>
            <p className="text-xs font-semibold text-neutral-mid uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-neutral-charcoal leading-relaxed">{listing.description}</p>
          </div>
        )}
      </div>

      {/* Guide info */}
      {guide && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Guide / Host</h2>
          <div className="flex items-center gap-3">
            {guide.avatar_url ? (
              <img src={guide.avatar_url as string} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green-pale flex items-center justify-center text-brand-green font-bold">
                {(guide.name as string)?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm text-neutral-charcoal">{guide.name as string}</p>
              <p className="text-xs text-neutral-mid">{guide.experience_years as number} yrs experience</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="text-sm font-bold text-neutral-charcoal mb-4">Moderation</h2>
        <ListingActions listingId={id} status={status} />
      </div>
    </div>
  )
}
