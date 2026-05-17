import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HostShell from '@/components/host/HostShell'

export const metadata = { title: 'Host Panel — Nepal Untrodden' }

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.user_metadata?.role as string | undefined
  if (role !== 'host') redirect('/')

  // Re-check live status (admin may have deactivated after login)
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.status !== 'active') redirect('/login')

  const hostName = (profile?.full_name as string | null) ?? user.email ?? 'Host'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      <HostShell hostName={hostName}>{children}</HostShell>
    </div>
  )
}
