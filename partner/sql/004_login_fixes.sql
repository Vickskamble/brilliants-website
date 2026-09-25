-- 004 Login & RLS fixes
-- Additive, safe to re-run (uses OR REPLACE / IF NOT EXISTS patterns where possible).
-- Fixes discovered while validating the full flow on the live database:
--   1. No INSERT policy on partners  -> admin approval insert failed via REST.
--   2. No public partner lookup       -> login "Create Account" could not fetch partner by email.
--   3. Only Admins can UPDATE partners-> partner profile self-edit AND user_id linking were 403.
--   4. Column-level grants so partners can never mutate financial/tier columns (even after self-update policy).

-- ============================================================
-- 1) RPC: lookup an approved partner by email (SECURITY DEFINER)
--    Used by /partner/login "Create Account" before the auth user exists.
--    Returns only safe fields, and only for ACTIVE partners.
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_approved_partner_by_email(p_email text)
RETURNS TABLE(partner_id text, application_id text, full_name text, business_email text, tier text, status text, fee_paid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pr.partner_id, pr.application_id, pr.full_name, pr.business_email, pr.tier, pr.status, COALESCE(pr.fee_paid, false)
  FROM public.partners pr
  WHERE lower(pr.business_email) = lower(btrim(p_email))
    AND pr.status = 'ACTIVE'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_approved_partner_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_approved_partner_by_email(text) TO anon, authenticated;

-- ============================================================
-- 2) partners INSERT policy (Admin only)
--    Admin approve flow inserts into partners with authenticated JWT.
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert partners" ON public.partners;
CREATE POLICY "Admins can insert partners" ON public.partners
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- ============================================================
-- 3) partners SELECT + UPDATE policies
--    (a) Partner can view/edit their OWN profile row.
--    (b) Pre-link visibility + one-time account linking: user_id currently
--        NULL and business_email matches the signed-in auth user's email.
--    IMPORTANT: PostgREST UPDATE only touches rows that are also SELECT-visible,
--    so the SELECT policy MUST allow the unlinked row (email match) or the
--    user_id link PATCH silently affects 0 rows.
--    NOTE: policies must NOT reference auth.users directly — authenticated role
--          has no SELECT on auth.users. Use SECURITY DEFINER current_auth_email().
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_auth_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_auth_email() TO anon, authenticated;

DROP POLICY IF EXISTS "Partners can view own profile" ON public.partners;
CREATE POLICY "Partners can view own profile" ON public.partners
  FOR SELECT TO authenticated
  USING ((user_id IS NULL AND lower(business_email) = lower(public.current_auth_email()))
         OR user_id = auth.uid());

DROP POLICY IF EXISTS "Partners can update own profile" ON public.partners;
CREATE POLICY "Partners can update own profile" ON public.partners
  FOR UPDATE TO authenticated
  USING ((user_id IS NULL AND lower(business_email) = lower(public.current_auth_email()))
         OR user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status = 'ACTIVE');

DROP POLICY IF EXISTS "Partners can link account" ON public.partners;

-- ============================================================
-- 4) Column-level UPDATE grants on partners
--    001 granted table-level UPDATE to anon + authenticated, which overrides
--    any column REVOKE. We must drop the table-wide UPDATE and re-grant ONLY
--    updatable columns to authenticated:
--      * profile fields the partner may self-edit
--      * user_id (one-time link, restricted by the policy above)
--    Financial / tier / status / id / KPI columns remain non-updatable via REST.
--    NOTE: admin cannot direct-update partners via REST anymore (no admin flow
--    does this today; any future admin edit should use a SECURITY DEFINER RPC).
--    Triggers run as table owner -> unaffected by these grants.
-- ============================================================
REVOKE UPDATE ON public.partners FROM anon, authenticated;

GRANT UPDATE (user_id, full_name, phone, city, state, country, linkedin, company_name,
              company_website, business_type, years_in_business, industries_served, customer_base)
  ON public.partners TO authenticated;

-- ============================================================
-- 5) Mark the Brilliants admin user as role='admin'
--    is_admin() checks raw_user_meta_data->>'role' = 'admin'.
--    admin@brilliants.in currently has no role -> admin pages were Access Denied.
-- ============================================================
UPDATE auth.users
SET raw_user_meta_data = COALESCE((raw_user_meta_data::jsonb), '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'admin@brilliants.in'
  AND (raw_user_meta_data IS NULL OR (raw_user_meta_data->>'role') IS DISTINCT FROM 'admin');

-- ============================================================
-- 6) Payment-verify trigger must be SECURITY DEFINER
--    activate_tier_on_payment() UPDATEs public.partners (fee_paid,
--    tier_expires_at) when a payment becomes VERIFIED. Those columns are NO
--    LONGER granted to authenticated (see section 4), so an invoker trigger
--    fails with 42501 and the admin's "verify payment" PATCH errors.
--    Run it as the function owner (postgres) so verification still works.
--    auto_escalate_tier() only modifies NEW.tier on the same row -> stays invoker.
-- ============================================================
CREATE OR REPLACE FUNCTION public.activate_tier_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'VERIFIED' AND OLD.status <> 'VERIFIED' THEN
    UPDATE public.partners
    SET fee_paid = true,
        tier_expires_at = NOW() + INTERVAL '1 year'
    WHERE partner_id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$function$;