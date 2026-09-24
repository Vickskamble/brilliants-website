-- ============================================================
-- BRILLIANTS PARTNER MANAGEMENT SYSTEM
-- Manual Entry-Fee Payments — Supabase PostgreSQL Migration (v3)
-- ============================================================
-- Run AFTER 001_partner_schema.sql and 002_tier_upgrade.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ekjakdhxodugncdpwkrj/sql/new
-- ============================================================
-- Adds manual payment tracking for Silver/Gold partner entry fees.
-- Flow: Partner submits UPI/bank reference -> status PENDING
--       -> Admin verifies -> status VERIFIED + partners.fee_paid = true
-- When a payment gateway is added later, webhooks will insert/update
-- rows in the same table with status already VERIFIED.
-- ============================================================

-- ============================================================
-- 1. PARTNER PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL,
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  application_id TEXT REFERENCES partner_applications(application_id),

  -- Payment intent
  tier TEXT NOT NULL CHECK (tier IN ('silver', 'gold')),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',

  -- How the partner paid
  method TEXT NOT NULL DEFAULT 'UPI' CHECK (method IN ('UPI', 'Bank', 'Netbanking', 'Card', 'Gateway', 'Other')),
  reference TEXT NOT NULL DEFAULT '',
  paid_date DATE,

  -- Status lifecycle
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'VERIFIED', 'EXPIRED', 'FAILED', 'REFUNDED'
  )),

  -- Admin verification
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_partner ON partner_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON partner_payments(status);

-- ============================================================
-- 2. PARTNERS: tier validity window
-- ============================================================
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;

-- ============================================================
-- 3. TRIGGER: Auto-generate payment_id
-- ============================================================
CREATE OR REPLACE FUNCTION generate_payment_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_id IS NULL OR NEW.payment_id = '' THEN
    NEW.payment_id := get_next_id('partner_payment', 'BRL-PY-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_id ON partner_payments;

CREATE TRIGGER set_payment_id BEFORE INSERT ON partner_payments
  FOR EACH ROW EXECUTE FUNCTION generate_payment_id();

INSERT INTO id_counters (entity_type, current_value) VALUES
  ('partner_payment', 0)
ON CONFLICT (entity_type) DO NOTHING;

-- ============================================================
-- 4. TRIGGER: Auto-update updated_at
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at ON partner_payments;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partner_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE partner_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all payments"
  ON partner_payments FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own payments"
  ON partner_payments FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Partners can submit their own payment"
  ON partner_payments FOR INSERT
  WITH CHECK (partner_id = get_partner_id());

CREATE POLICY "Admins can manage payments"
  ON partner_payments FOR ALL
  USING (is_admin());

-- ============================================================
-- 6. TRIGGER: On VERIFIED, mark partner fee as paid + set expiry
-- ============================================================
CREATE OR REPLACE FUNCTION activate_tier_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'VERIFIED' AND OLD.status <> 'VERIFIED' THEN
    UPDATE partners
    SET fee_paid = true,
        tier_expires_at = NOW() + INTERVAL '1 year'
    WHERE partner_id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS activate_tier_payment ON partner_payments;

CREATE TRIGGER activate_tier_payment AFTER UPDATE ON partner_payments
  FOR EACH ROW EXECUTE FUNCTION activate_tier_on_payment();