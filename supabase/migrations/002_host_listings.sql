-- ============================================================
-- Nepal Untrodden — Host Listings Migration
-- Run after 001_admin_schema.sql
-- ============================================================

-- 1. Link guides to auth users (one guide profile per host account)
ALTER TABLE guides
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Direct ownership column on listings (lets hosts query their own listings)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS host_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Rejection reason on listings (admin fills this in when rejecting)
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. 'draft' is a new valid value for listings.status
--    Status flow: draft → pending → approved | rejected
--    Existing listings already defaulted to 'approved' in migration 001.

-- 5. Public bucket for listing photos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('listing-images', 'listing-images', TRUE)
  ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies for listing images
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images"               ON storage.objects;
DROP POLICY IF EXISTS "Hosts can delete their own listing images"    ON storage.objects;

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Hosts can delete their own listing images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images');

-- 7. RLS on listings: hosts can CRUD their own rows; public can read approved ones
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved listings"    ON listings;
DROP POLICY IF EXISTS "Hosts can read their own listings"   ON listings;
DROP POLICY IF EXISTS "Hosts can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Hosts can update their own listings" ON listings;
DROP POLICY IF EXISTS "Hosts can delete draft listings"     ON listings;

CREATE POLICY "Public can read approved listings"
  ON listings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Hosts can read their own listings"
  ON listings FOR SELECT TO authenticated
  USING (host_user_id = auth.uid());

CREATE POLICY "Hosts can insert their own listings"
  ON listings FOR INSERT TO authenticated
  WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can update their own listings"
  ON listings FOR UPDATE TO authenticated
  USING (host_user_id = auth.uid() AND status IN ('draft', 'rejected'));

CREATE POLICY "Hosts can delete draft listings"
  ON listings FOR DELETE TO authenticated
  USING (host_user_id = auth.uid() AND status = 'draft');
