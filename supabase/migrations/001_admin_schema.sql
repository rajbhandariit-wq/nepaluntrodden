-- ============================================================
-- Nepal Untrodden — Admin Schema Migration
-- Run this in the Supabase SQL editor before using admin panel
-- ============================================================

-- 1. Extend profiles table for host/guide verification
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role               TEXT    NOT NULL DEFAULT 'traveller',
  ADD COLUMN IF NOT EXISTS status             TEXT    NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS permanent_address  TEXT,
  ADD COLUMN IF NOT EXISTS gov_id_types       TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS guide_assoc_provided BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rejection_reason   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url         TEXT;

-- 2. Add moderation status to listings
--    Existing listings default to 'approved' (they were live before this system)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- 3. Messages table for traveller ↔ guide conversations
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID        NOT NULL,
  listing_id      UUID        REFERENCES listings(id)  ON DELETE SET NULL,
  sender_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            TEXT        NOT NULL,
  is_read         BOOLEAN     DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx       ON messages (sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx     ON messages (receiver_id);

-- 4. Trigger: auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'traveller'),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'host' THEN 'pending'
      ELSE 'active'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role      = COALESCE(EXCLUDED.role, profiles.role),
    -- only set pending on first insert; don't overwrite admin decisions
    status    = CASE
                  WHEN profiles.status IS NULL THEN EXCLUDED.status
                  ELSE profiles.status
                END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Storage bucket for host documents (private)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('host-documents', 'host-documents', FALSE)
  ON CONFLICT (id) DO NOTHING;

-- 6. RLS: profiles are readable by owner; admins read all via service-role key
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can read own profile"    ON profiles;
DROP POLICY IF EXISTS "Owner can update own profile"  ON profiles;

CREATE POLICY "Owner can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Owner can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can read messages" ON messages;
DROP POLICY IF EXISTS "Sender can insert messages"     ON messages;

CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Sender can insert messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
