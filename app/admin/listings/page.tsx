import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import ListingActions from '@/components/admin/ListingActions'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100   text-amber-700',
    rejected: 'bg-red-100     text-status-error',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const admin = createAdminClient()

  const { data: listings } = await admin
    .from('listings')
    .select('id, title, type, slug, status, created_at, guide_id')
    .order('created_at', { ascending: false })

  const filtered = (listings ?? []).filter(l =>
    !filterStatus || l.status === filterStatus
  )

  const filters = [
    { label: 'All',      href: '/admin/listings' },
    { label: 'Pending',  href: '/admin/listings?status=pending' },
    { label: 'Approved', href: '/admin/listings?status=approved' },
    { label: 'Rejected', href: '/admin/listings?status=rejected' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5" style={{ fontFamily: 'Lora, serif' }}>Listings</h1>
      <p className="text-sm text-neutral-mid mb-4">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</p>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => {
          const key = f.href.split('?')[1] ?? ''
          const isActive = (filterStatus ? `status=${filterStatus}` : '') === key
          return (
            <Link key={f.label} href={f.href}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isActive ? 'bg-brand-green text-white' : 'bg-white border border-neutral-light text-neutral-mid hover:border-brand-green hover:text-brand-green'
              }`}>
              {f.label}
            </Link>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-pale border-b border-neutral-light">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Guide / Host</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Created</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-mid text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-mid">No listings found.</td>
                </tr>
              )}
              {filtered.map(l => {
                return (
                  <tr key={l.id} className="border-b border-neutral-light/60 hover:bg-neutral-pale/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-charcoal max-w-[200px] truncate">{l.title}</td>
                    <td className="px-4 py-3 capitalize text-neutral-mid text-xs">{l.type}</td>
                    <td className="px-4 py-3 text-neutral-mid text-xs">—</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status ?? 'pending'} /></td>
                    <td className="px-4 py-3 text-xs text-neutral-mid whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {l.status === 'pending' && (
                          <ListingActions listingId={l.id} status={l.status ?? 'pending'} />
                        )}
                        <Link href={`/admin/listings/${l.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
                          <Eye size={13} /> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
