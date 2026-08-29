-- ============================================================
-- BRILLIANTS PARTNER MANAGEMENT SYSTEM
-- Database Schema — Supabase PostgreSQL Migration
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ekjakdhxodugncdpwkrj/sql/new
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. COUNTERS TABLE (for sequential IDs)
-- ============================================================
CREATE TABLE IF NOT EXISTS id_counters (
  entity_type TEXT PRIMARY KEY,
  current_value INTEGER NOT NULL DEFAULT 0
);

INSERT INTO id_counters (entity_type, current_value) VALUES
  ('partner_application', 0),
  ('partner', 0),
  ('partner_lead', 0),
  ('opportunity', 0),
  ('commission', 0)
ON CONFLICT (entity_type) DO NOTHING;

-- Function to get next sequential ID
CREATE OR REPLACE FUNCTION get_next_id(entity TEXT, prefix TEXT, digits INTEGER DEFAULT 5)
RETURNS TEXT AS $$
DECLARE
  next_val INTEGER;
  padded TEXT;
BEGIN
  UPDATE id_counters SET current_value = current_value + 1 WHERE entity_type = entity RETURNING current_value INTO next_val;
  IF next_val IS NULL THEN
    INSERT INTO id_counters (entity_type, current_value) VALUES (entity, 1) RETURNING current_value INTO next_val;
  END IF;
  padded := LPAD(next_val::TEXT, digits, '0');
  RETURN prefix || padded;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. PARTNER APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',
  linkedin TEXT,
  
  -- Business Information
  company_name TEXT NOT NULL,
  company_website TEXT,
  business_type TEXT NOT NULL,
  years_in_business TEXT,
  industries_served TEXT,
  customer_base TEXT,
  
  -- Partnership
  partner_capability TEXT NOT NULL CHECK (partner_capability IN ('refer_sell', 'refer_sell_implement')),
  interested_solutions TEXT[] DEFAULT '{}',
  business_profile TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN (
    'NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED',
    'AGREEMENT_PENDING', 'AGREEMENT_SIGNED', 'ACTIVE',
    'SUSPENDED', 'TERMINATED'
  )),
  
  -- Review
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  
  -- Security token for agreement link
  secure_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PARTNERS (activated after agreement signing)
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id TEXT UNIQUE NOT NULL,
  application_id TEXT UNIQUE NOT NULL REFERENCES partner_applications(application_id),
  
  -- Auth
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Profile (copied from application, editable)
  full_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  linkedin TEXT,
  company_name TEXT,
  company_website TEXT,
  business_type TEXT,
  years_in_business TEXT,
  industries_served TEXT,
  customer_base TEXT,
  
  -- Partnership
  partner_capability TEXT NOT NULL CHECK (partner_capability IN ('refer_sell', 'refer_sell_implement')),
  interested_solutions TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'SUSPENDED', 'TERMINATED'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. PARTNER AGREEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  application_id TEXT NOT NULL REFERENCES partner_applications(application_id),
  
  agreement_version TEXT NOT NULL DEFAULT 'v1.0',
  agreement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (agreement_status IN (
    'PENDING', 'SENT', 'SIGNED', 'DECLINED'
  )),
  
  -- Signing
  signed_name TEXT,
  signed_email TEXT,
  signed_at TIMESTAMPTZ,
  signed_ip TEXT,
  
  -- Snapshot of agreement at time of signing
  agreement_snapshot JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(partner_id, agreement_version)
);

-- ============================================================
-- 5. PARTNER LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT UNIQUE NOT NULL,
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  company_website TEXT,
  city TEXT,
  industry TEXT,
  
  -- Opportunity
  product TEXT NOT NULL,
  customer_requirement TEXT NOT NULL,
  expected_timeline TEXT,
  estimated_value TEXT,
  additional_notes TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN (
    'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED',
    'DUPLICATE', 'EXISTING_CUSTOMER',
    'DEMO_SCHEDULED', 'PROPOSAL', 'NEGOTIATION',
    'WON', 'LOST'
  )),
  
  -- Admin fields
  assigned_to TEXT,
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  accepted_at TIMESTAMPTZ,
  demo_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. OPPORTUNITIES (deals in progress)
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id TEXT UNIQUE NOT NULL,
  lead_id TEXT REFERENCES partner_leads(lead_id),
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  
  customer_name TEXT NOT NULL,
  product TEXT NOT NULL,
  estimated_value NUMERIC(12,2),
  
  -- Implementation
  implementation_required BOOLEAN DEFAULT false,
  implementation_by TEXT CHECK (implementation_by IN ('brilliants', 'partner')),
  implementation_status TEXT DEFAULT 'NOT_STARTED' CHECK (implementation_status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'
  )),
  
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
    'OPEN', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'
  )),
  
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  loss_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. COMMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id TEXT UNIQUE NOT NULL,
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  opportunity_id TEXT REFERENCES opportunities(opportunity_id),
  
  -- Calculation
  subscription_amount NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'APPROVED', 'PAYABLE', 'PAID', 'CANCELLED'
  )),
  
  -- Payment
  approved_at TIMESTAMPTZ,
  payable_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- Type
  commission_type TEXT NOT NULL DEFAULT 'INITIAL' CHECK (commission_type IN (
    'INITIAL', 'RENEWAL'
  )),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. RENEWALS
-- ============================================================
CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  opportunity_id TEXT REFERENCES opportunities(opportunity_id),
  
  customer_name TEXT NOT NULL,
  product TEXT NOT NULL,
  subscription_period TEXT,
  renewal_date DATE,
  
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN (
    'UPCOMING', 'RENEWED', 'EXPIRED', 'CANCELLED'
  )),
  
  partner_eligible BOOLEAN DEFAULT true,
  commission_rate NUMERIC(5,2),
  commission_id TEXT REFERENCES commissions(commission_id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. PARTNER RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'brochure', 'presentation', 'demo_link', 'sales_guide', 'video', 'case_study', 'proposal_template', 'other'
  )),
  url TEXT,
  file_path TEXT,
  product TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  performed_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_status ON partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON partner_applications(business_email);
CREATE INDEX IF NOT EXISTS idx_applications_token ON partner_applications(secure_token);
CREATE INDEX IF NOT EXISTS idx_partners_user ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_leads_partner ON partner_leads(partner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON partner_leads(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_renewals_partner ON renewals(partner_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON partner_audit_logs(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check if user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER: Get partner_id from user_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_partner_id()
RETURNS TEXT AS $$
DECLARE
  pid TEXT;
BEGIN
  SELECT partner_id INTO pid FROM partners WHERE user_id = auth.uid();
  RETURN pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES: partner_applications
-- ============================================================
-- Anyone can insert (public registration)
CREATE POLICY "Public can submit applications"
  ON partner_applications FOR INSERT
  WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins can view all applications"
  ON partner_applications FOR SELECT
  USING (is_admin());

-- Admins can update
CREATE POLICY "Admins can update applications"
  ON partner_applications FOR UPDATE
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: partners
-- ============================================================
CREATE POLICY "Admins can view all partners"
  ON partners FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own profile"
  ON partners FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can update partners"
  ON partners FOR UPDATE
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: partner_agreements
-- ============================================================
CREATE POLICY "Admins can view all agreements"
  ON partner_agreements FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own agreements"
  ON partner_agreements FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Partners can insert agreement acceptance"
  ON partner_agreements FOR INSERT
  WITH CHECK (partner_id = get_partner_id());

CREATE POLICY "Admins can update agreements"
  ON partner_agreements FOR UPDATE
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: partner_leads
-- ============================================================
CREATE POLICY "Admins can view all leads"
  ON partner_leads FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own leads"
  ON partner_leads FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Partners can insert own leads"
  ON partner_leads FOR INSERT
  WITH CHECK (partner_id = get_partner_id());

CREATE POLICY "Admins can update leads"
  ON partner_leads FOR UPDATE
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: opportunities
-- ============================================================
CREATE POLICY "Admins can view all opportunities"
  ON opportunities FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own opportunities"
  ON opportunities FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Admins can manage opportunities"
  ON opportunities FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: commissions
-- ============================================================
CREATE POLICY "Admins can view all commissions"
  ON commissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own commissions"
  ON commissions FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Admins can manage commissions"
  ON commissions FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: renewals
-- ============================================================
CREATE POLICY "Admins can view all renewals"
  ON renewals FOR SELECT
  USING (is_admin());

CREATE POLICY "Partners can view own renewals"
  ON renewals FOR SELECT
  USING (partner_id = get_partner_id());

CREATE POLICY "Admins can manage renewals"
  ON renewals FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: partner_resources (public read)
-- ============================================================
CREATE POLICY "Anyone can view active resources"
  ON partner_resources FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage resources"
  ON partner_resources FOR ALL
  USING (is_admin());

-- ============================================================
-- RLS POLICIES: audit logs
-- ============================================================
CREATE POLICY "Admins can view all audit logs"
  ON partner_audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON partner_audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON partner_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON partner_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON renewals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: Auto-generate application_id
-- ============================================================
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_id IS NULL OR NEW.application_id = '' THEN
    NEW.application_id := get_next_id('partner_application', 'BRL-PA-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_application_id BEFORE INSERT ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION generate_application_id();

-- ============================================================
-- TRIGGER: Auto-generate partner_id on approval
-- ============================================================
CREATE OR REPLACE FUNCTION generate_partner_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_id IS NULL OR NEW.partner_id = '' THEN
    NEW.partner_id := get_next_id('partner', 'BRL-PT-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_partner_id BEFORE INSERT ON partners
  FOR EACH ROW EXECUTE FUNCTION generate_partner_id();

-- ============================================================
-- TRIGGER: Auto-generate lead_id
-- ============================================================
CREATE OR REPLACE FUNCTION generate_lead_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_id IS NULL OR NEW.lead_id = '' THEN
    NEW.lead_id := get_next_id('partner_lead', 'BRL-LD-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lead_id BEFORE INSERT ON partner_leads
  FOR EACH ROW EXECUTE FUNCTION generate_lead_id();

-- ============================================================
-- TRIGGER: Auto-generate opportunity_id
-- ============================================================
CREATE OR REPLACE FUNCTION generate_opportunity_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opportunity_id IS NULL OR NEW.opportunity_id = '' THEN
    NEW.opportunity_id := get_next_id('opportunity', 'BRL-OP-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_opportunity_id BEFORE INSERT ON opportunities
  FOR EACH ROW EXECUTE FUNCTION generate_opportunity_id();

-- ============================================================
-- TRIGGER: Auto-generate commission_id
-- ============================================================
CREATE OR REPLACE FUNCTION generate_commission_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.commission_id IS NULL OR NEW.commission_id = '' THEN
    NEW.commission_id := get_next_id('commission', 'BRL-CM-');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_commission_id BEFORE INSERT ON commissions
  FOR EACH ROW EXECUTE FUNCTION generate_commission_id();

-- ============================================================
-- SEED: Default admin user (update email as needed)
-- ============================================================
-- NOTE: Create admin user in Supabase Auth dashboard first,
-- then run: UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb WHERE email = 'admin@brilliants.in';

-- ============================================================
-- SEED: Default resources
-- ============================================================
INSERT INTO partner_resources (title, description, resource_type, url, product, sort_order) VALUES
  ('Power EmS Product Overview', 'Energy management system overview and features', 'brochure', '/power-ems/', 'PowerEMS', 1),
  ('IronBook Product Overview', 'AI Gym Operating System overview and features', 'brochure', '/ironbook/', 'IronBook', 2),
  ('Brilliants Partner Guide', 'Complete guide for Brilliants partners', 'sales_guide', NULL, NULL, 3),
  ('Power EmS Demo', 'Live demo link for Power EmS', 'demo_link', '/power-ems/', 'PowerEMS', 4),
  ('IronBook Demo', 'Live demo link for IronBook', 'demo_link', '/ironbook/', 'IronBook', 5)
ON CONFLICT DO NOTHING;
