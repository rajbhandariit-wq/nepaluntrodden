import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin — Nepal Untrodden' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.is_admin !== true) redirect('/')

  return (
    // position:fixed + inset:0 escapes the root layout's 430px .app-content constraint
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      <AdminShell>{children}</AdminShell>
    </div>
  )
}
