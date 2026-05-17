-- ══════════════════════════════════════════════════════════════
-- Nepal Untrodden — Billing Module Migration
-- Run in Supabase SQL Editor after schema.sql
-- ══════════════════════════════════════════════════════════════

-- ── Alter existing tables ──────────────────────────────────────

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) DEFAULT 20.00;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancellation_fee_charged boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS host_payout_status text
    CHECK (host_payout_status IN ('pending','processing','paid','na'))
    DEFAULT 'pending';

-- ── 1. Transactions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id       uuid REFERENCES bookings(id) ON DELETE SET NULL,
  traveler_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  host_id          uuid REFERENCES profiles(id) ON DELETE SET NULL,
  gross_amount     numeric(10,2) NOT NULL DEFAULT 0,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  net_payout       numeric(10,2) NOT NULL DEFAULT 0,
  payment_method   text CHECK (payment_method IN ('khalti','esewa','card','cash')),
  payment_status   text CHECK (payment_status IN ('pending','captured','refunded','partially_refunded','failed'))
                   DEFAULT 'pending',
  transaction_ref  text UNIQUE,
  dispute_status   text CHECK (dispute_status IN ('none','open','resolved','lost')) DEFAULT 'none',
  refund_amount    numeric(10,2) DEFAULT 0,
  refund_policy    text CHECK (refund_policy IN ('full','partial','none')),
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- ── 2. Payouts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount              numeric(10,2) NOT NULL DEFAULT 0,
  status              text CHECK (status IN ('pending','processing','paid','failed')) DEFAULT 'pending',
  payout_method       text CHECK (payout_method IN ('khalti','bank_transfer','esewa','paypal')),
  payout_account_ref  text,                        -- masked, e.g. "****1234" or "ra***@gmail.com"
  bank_name           text,                        -- e.g. "NABIL", "SBI", "NMB"
  booking_ids         uuid[] DEFAULT '{}',
  period_start        date,
  period_end          date,
  paid_at             timestamptz,
  payment_reference   text,                        -- admin-entered gateway ref on mark-as-paid
  notes               text,
  retry_count         integer DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

-- ── 3. Invoices ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  booking_id     uuid REFERENCES bookings(id) ON DELETE SET NULL,
  traveler_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  host_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount         numeric(10,2) NOT NULL DEFAULT 0,
  type           text CHECK (type IN ('traveler_receipt','host_commission')) NOT NULL,
  pdf_url        text,
  sent_at        timestamptz,
  created_at     timestamptz DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id   ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_traveler_id  ON transactions(traveler_id);
CREATE INDEX IF NOT EXISTS idx_transactions_host_id      ON transactions(host_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status       ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at   ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payouts_host_id           ON payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status            ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id       ON invoices(booking_id);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security
-- ══════════════════════════════════════════════════════════════

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices     ENABLE ROW LEVEL SECURITY;

-- Transactions: travelers and hosts see their own; admin sees all via service role
CREATE POLICY "transactions_own_select" ON transactions
  FOR SELECT USING (auth.uid() = traveler_id OR auth.uid() = host_id);

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (true);  -- service role only in practice

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (true);       -- service role only in practice

-- Payouts: hosts see their own; admin sees all via service role
CREATE POLICY "payouts_host_select" ON payouts
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "payouts_insert" ON payouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payouts_update" ON payouts
  FOR UPDATE USING (true);

-- Invoices: travelers and hosts see their own
CREATE POLICY "invoices_own_select" ON invoices
  FOR SELECT USING (auth.uid() = traveler_id OR auth.uid() = host_id);

CREATE POLICY "invoices_insert" ON invoices
  FOR INSERT WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- Helper: auto-generate invoice numbers
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION generate_invoice_number(booking_ref text)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'INV-' || booking_ref || '-' || to_char(now(), 'YYYYMMDDHHMMSS');
END;
$$;
