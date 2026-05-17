import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { KeyRound, Eye } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100   text-amber-700',
    rejected: 'bg-red-100     text-status-error',
    inactive: 'bg-neutral-light text-neutral-mid',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {status}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    host:      'bg-brand-green-pale text-brand-green',
    traveller: 'bg-blue-50 text-status-info',
    admin:     'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[role] ?? 'bg-neutral-light text-neutral-mid'}`}>
      {role}
    </span>
  )
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; role?: string }>
}) {
  const { status: filterStatus, role: filterRole } = await searchParams
  const admin = createAdminClient()

  // Fetch auth users (email, metadata, timestamps) + profile rows
  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('profiles').select('id, role, status, phone, gov_id_types, created_at'),
  ])

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const users = (authData?.users ?? []).map(u => {
    const prof = profileMap.get(u.id)
    return {
      id:        u.id,
      email:     u.email ?? '',
      name:      (u.user_metadata?.full_name as string) ?? u.email?.split('@')[0] ?? '—',
      role:      (prof?.role ?? u.user_metadata?.role ?? 'traveller') as string,
      status:    (prof?.status ?? (u.user_metadata?.role === 'host' ? 'pending' : 'active')) as string,
      joinedAt:  u.created_at,
    }
  })

  const filtered = users.filter(u => {
    if (filterStatus && u.status !== filterStatus) return false
    if (filterRole   && u.role   !== filterRole)   return false
    return true
  })

  const filters = [
    { label: 'All',        href: '/admin/users' },
    { label: 'Travellers', href: '/admin/users?role=traveller' },
    { label: 'Hosts',      href: '/admin/users?role=host' },
    { label: 'Pending',    href: '/admin/users?status=pending' },
    { label: 'Inactive',   href: '/admin/users?status=inactive' },
    { label: 'Rejected',   href: '/admin/users?status=rejected' },
  ]

  const activeFilter = filterStatus
    ? `status=${filterStatus}`
    : filterRole
    ? `role=${filterRole}`
    : ''

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-charcoal mb-0.5" style={{ fontFamily: 'Lora, serif' }}>Users</h1>
      <p className="text-sm text-neutral-mid mb-4">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => {
          const key = f.href.split('?')[1] ?? ''
          const isActive = key === activeFilter
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-pale border-b border-neutral-light">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-mid">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-neutral-mid">No users found.</td>
                </tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-neutral-light/60 hover:bg-neutral-pale/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-charcoal">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-mid text-xs">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-xs text-neutral-mid whitespace-nowrap">
                    {new Date(u.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
