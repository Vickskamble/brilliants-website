-- ============================================================
-- BRILLIANTS PARTNER MANAGEMENT SYSTEM
-- Tier Upgrade — Supabase PostgreSQL Migration (v2)
-- ============================================================
-- Run AFTER 001_partner_schema.sql
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ekjakdhxodugncdpwkrj/sql/new
-- ============================================================
-- Adds the 4-tier partner program:
--   sales    -> Sales Partner     (free, 10%, Refer + Sell)
--   solution -> Solution Partner   (free, up to 20%, Refer + Sell + Implement)
--   silver   -> Silver Partner     (Rs 4,999/yr, up to 22%, 1 certified resource)
--   gold     -> Gold Partner       (Rs 9,999/yr, up to 25%, 3 certified resources)
-- ============================================================

-- ============================================================
-- 1. PARTNER APPLICATIONS: add tier selection
-- ============================================================
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS tier TEXT
    CHECK (tier IN ('sales', 'solution', 'silver', 'gold')),
  ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_paid BOOLEAN DEFAULT false;

-- ============================================================
-- 2. PARTNERS: add tier, KPI and directory fields
-- ============================================================
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS tier TEXT
    DEFAULT 'solution'
    CHECK (tier IN ('sales', 'solution', 'silver', 'gold')),
  ADD COLUMN IF NOT EXISTS certified_resources INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retention_rate NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customers_ytd INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS directory_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_paid BOOLEAN DEFAULT false;

-- ============================================================
-- 3. OPPORTUNITIES: hosted vs self-hosted subscription
-- ============================================================
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS hosted_subscription BOOLEAN DEFAULT false;

-- ============================================================
-- 4. COMMISSIONS: hosted vs self-hosted flag
-- ============================================================
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS hosted_subscription BOOLEAN DEFAULT false;

-- ============================================================
-- 5. RENEWALS: retention tracking support
-- ============================================================
ALTER TABLE renewals
  ADD COLUMN IF NOT EXISTS renewed_at TIMESTAMPTZ;

-- ============================================================
-- 6. CERTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  certification_name TEXT NOT NULL,
  certified_for TEXT,
  certificate_url TEXT,
  certified_date TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all certifications"
  ON certifications FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own certifications"
  ON certifications FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Admins can manage certifications"
  ON certifications FOR ALL
  USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_certifications_partner ON certifications(partner_id);

-- ============================================================
-- 7. PUBLIC PARTNER DIRECTORY VIEW (safe, column-limited read)
-- ============================================================
CREATE OR REPLACE VIEW partner_directory AS
SELECT
  partner_id,
  full_name,
  company_name,
  city,
  state,
  tier,
  certified_resources,
  customers_ytd,
  retention_rate
FROM partners
WHERE status = 'ACTIVE' AND directory_visible = true;

GRANT SELECT ON partner_directory TO anon;
GRANT SELECT ON partner_directory TO authenticated;
GRANT SELECT ON partner_directory TO service_role;

-- ============================================================
-- 8. TIER KPI UPGRADE: escalate to Gold when KPIs are met
-- ============================================================
CREATE OR REPLACE FUNCTION auto_escalate_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ACTIVE' THEN
    IF NEW.certified_resources >= 3
       AND NEW.customers_ytd >= 10
       AND COALESCE(NEW.retention_rate, 0) >= 80 THEN
      NEW.tier := 'gold';
    ELSIF NEW.certified_resources >= 1
          AND NEW.customers_ytd >= 6
          AND COALESCE(NEW.retention_rate, 0) >= 70 THEN
      IF NEW.tier <> 'gold' THEN
        NEW.tier := 'silver';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS escalate_tier_kpis ON partners;

CREATE TRIGGER escalate_tier_kpis BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION auto_escalate_tier();