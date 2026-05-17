import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, Edit, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import DeleteListingButton from '@/components/host/DeleteListingButton'

const STATUS = {
  draft:    { label: 'Draft',             color: 'bg-neutral-light text-neutral-mid',    icon: FileText },
  pending:  { label: 'In Review',         color: 'bg-amber-100 text-amber-700',           icon: Clock },
  approved: { label: 'Live',              color: 'bg-emerald-100 text-emerald-700',        icon: CheckCircle },
  rejected: { label: 'Rejected',          color: 'bg-red-100 text-status-error',          icon: XCircle },
} as const

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.draft
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.color}`}>
      <Icon size={11} />
      {s.label}
    </span>
  )
}

export default async function HostDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, type, status, images, rejection_reason, created_at')
    .or(`guide_id.eq.${user!.id},host_user_id.eq.${user!.id}`)
    .order('created_at', { ascending: false })

  const all      = listings?.length ?? 0
  const drafts   = listings?.filter(l => l.status === 'draft').length ?? 0
  const pending  = listings?.filter(l => l.status === 'pending').length ?? 0
  const approved = listings?.filter(l => l.status === 'approved').length ?? 0
  const rejected = listings?.filter(l => l.status === 'rejected').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>My Listings</h1>
          <p className="text-sm text-neutral-mid">{all} listing{all !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/host/listings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <PlusCircle size={16} /> New listing
        </Link>
      </div>

      {/* Quick stats */}
      {all > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Drafts',   value: drafts,   color: 'text-neutral-mid' },
            { label: 'In review',value: pending,  color: 'text-amber-600' },
            { label: 'Live',     value: approved, color: 'text-emerald-600' },
            { label: 'Rejected', value: rejected, color: 'text-status-error' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-card text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-neutral-mid">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Listing cards */}
      {all === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 flex flex-col items-center text-center">
          <span className="text-5xl mb-4">🏔</span>
          <h2 className="font-bold text-neutral-charcoal mb-1" style={{ fontFamily: 'Lora, serif' }}>No listings yet</h2>
          <p className="text-sm text-neutral-mid mb-5">Create your first listing to start hosting travellers.</p>
          <Link href="/host/listings/new" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            Create first listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings!.map(l => {
            const cover = (l.images as string[])?.[0]
            const canEdit   = l.status === 'draft' || l.status === 'rejected'
            const canDelete = l.status === 'draft' || l.status === 'pending' || l.status === 'approved'
            return (
              <div key={l.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                {/* Cover */}
                <div className="h-36 bg-neutral-pale relative">
                  {cover
                    ? <img src={cover} alt={l.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">
                        {l.type === 'trek' ? '🏔' : l.type === 'homestay' ? '🏡' : '🎭'}
                      </div>
                  }
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={l.status ?? 'draft'} />
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-semibold text-neutral-charcoal mb-0.5 truncate">{l.title}</p>
                  <p className="text-xs text-neutral-mid capitalize mb-3">{l.type} · {new Date(l.created_at).toLocaleDateString()}</p>

                  {/* Rejection reason */}
                  {l.status === 'rejected' && l.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                      <p className="text-xs font-semibold text-status-error mb-0.5">Rejection reason</p>
                      <p className="text-xs text-neutral-charcoal">{l.rejection_reason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {canEdit && (
                      <Link href={`/host/listings/${l.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-green text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Edit size={13} />
                        {l.status === 'rejected' ? 'Edit & resubmit' : 'Edit'}
                      </Link>
                    )}
                    {l.status === 'pending' && (
                      <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                        <Clock size={13} /> Awaiting review
                      </div>
                    )}
                    {l.status === 'approved' && (
                      <Link href={`/host/listings/${l.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-neutral-light text-neutral-mid text-xs font-medium hover:bg-neutral-pale transition-colors">
                        <Edit size={13} /> View
                      </Link>
                    )}
                    {canDelete && (
                      <DeleteListingButton listingId={l.id} status={l.status ?? 'draft'} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

