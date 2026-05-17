import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const users = [
  { email: 'guest1@example.com', password: 'guest123', full_name: 'Demo Traveller', role: 'traveler' },
  { email: 'host1@example.com',  password: 'host123',  full_name: 'Demo Host',      role: 'host' },
]

for (const u of users) {
  // Check if user already exists
  const { data: existing } = await admin.auth.admin.listUsers()
  const found = existing?.users?.find(x => x.email === u.email)

  if (found) {
    console.log(`✓ ${u.email} already exists — skipping auth creation`)
    // Still ensure profile role is correct
    await admin.from('profiles').upsert({ id: found.id, full_name: u.full_name, role: u.role }, { onConflict: 'id' })
    console.log(`  updated profile role → ${u.role}`)
    continue
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { full_name: u.full_name, role: u.role },
  })

  if (error) {
    console.error(`✗ ${u.email}: ${error.message}`)
    continue
  }

  console.log(`✓ created ${u.email} (${u.role}) — id: ${data.user.id}`)

  // Upsert profile with correct role (trigger auto-creates it but may not set role)
  const { error: profErr } = await admin
    .from('profiles')
    .upsert({ id: data.user.id, full_name: u.full_name, role: u.role }, { onConflict: 'id' })

  if (profErr) console.error(`  profile upsert error: ${profErr.message}`)
  else console.log(`  profile role set → ${u.role}`)
}
