import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import UserActions from '@/components/admin/UserActions'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100   text-amber-700',
    rejected: 'bg-red-100     text-status-error',
    inactive: 'bg-neutral-light text-neutral-mid',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-mid mb-0.5 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-neutral-charcoal">{value || <span className="text-neutral-mid italic">Not provided</span>}</p>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: authUser, error }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from('profiles').select('*').eq('id', id).single(),
  ])

  if (error || !authUser) notFound()

  const meta = authUser.user_metadata ?? {}
  const role    = profile?.role    ?? meta.role    ?? 'traveller'
  const status  = profile?.status  ?? (role === 'host' ? 'pending' : 'active')
  const govIds  = (profile?.gov_id_types ?? meta.gov_id_types ?? []) as string[]

  return (
    <div className="max-w-2xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-neutral-mid hover:text-neutral-charcoal mb-5 transition-colors">
        <ArrowLeft size={15} /> All users
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-green-pale flex items-center justify-center text-brand-green font-bold text-lg shrink-0">
              {(meta.full_name as string)?.[0]?.toUpperCase() ?? authUser.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>
                {(meta.full_name as string) ?? authUser.email}
              </h1>
              <p className="text-sm text-neutral-mid">{authUser.email}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Role"     value={role} />
          <Field label="Joined"   value={new Date(authUser.created_at).toLocaleDateString()} />
          <Field label="Email verified" value={authUser.email_confirmed_at ? 'Yes' : 'No'} />
        </div>
      </div>

      {/* Host-specific details */}
      {role === 'host' && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h2 className="text-sm font-bold text-neutral-charcoal mb-4">Host / Guide Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone"            value={profile?.phone ?? (meta.phone as string)} />
            <Field label="Permanent address" value={profile?.permanent_address ?? (meta.permanent_address as string)} />
            <Field label="Guide assoc. ID"  value={(profile?.guide_assoc_provided || meta.guide_assoc_provided) ? 'Provided' : 'Not provided'} />
          </div>

          {/* Government IDs */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-neutral-mid uppercase tracking-wide mb-2">Government IDs provided</p>
            {govIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {govIds.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-brand-green-pale text-brand-green text-xs font-semibold rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-mid italic">No government IDs on file.</p>
            )}
          </div>

          {/* Rejection reason */}
          {status === 'rejected' && profile?.rejection_reason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-status-error mb-1">Rejection reason</p>
              <p className="text-sm text-neutral-charcoal">{profile.rejection_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="text-sm font-bold text-neutral-charcoal mb-4">Actions</h2>
        <UserActions userId={id} userEmail={authUser.email ?? ''} status={status} />
      </div>
    </div>
  )
}
