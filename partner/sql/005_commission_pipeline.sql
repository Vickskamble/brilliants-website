-- 005 Commission pipeline, tier expiry maintenance & directory hardening
-- Additive, idempotent. Run AFTER 004.

-- ============================================================
-- 1) commissions.cancellation_reason
--    Admin "Cancel commission" modal posts this column.
-- ============================================================
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- ============================================================
-- 2) partners.status must allow 'EXPIRED'
--    Added for the tier-expiry maintenance job below.
-- ============================================================
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_status_check;
ALTER TABLE partners ADD CONSTRAINT partners_status_check
  CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED', 'EXPIRED'));

-- ============================================================
-- 3) Auto-create an INITIAL commission when an opportunity is WON
--    SECURITY DEFINER so it still writes even though clients cannot
--    UPDATE/INSERT commissions directly through their own policies.
--    commission_rate comes from the partner's tier (silver 22%, gold 25%).
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_commission_on_won()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_rate numeric;
BEGIN
  IF NEW.status = 'WON'
     AND OLD.status IS DISTINCT FROM 'WON'
     AND NEW.partner_id IS NOT NULL THEN

    IF EXISTS (
      SELECT 1 FROM public.commissions c
      WHERE c.opportunity_id = NEW.opportunity_id
        AND c.commission_type = 'INITIAL'
    ) THEN
      RETURN NEW;
    END IF;

    SELECT CASE lower(p.tier)
             WHEN 'silver' THEN 22
             WHEN 'gold'   THEN 25
             ELSE 0
           END
      INTO v_rate
      FROM public.partners p
      WHERE p.partner_id = NEW.partner_id;

    INSERT INTO public.commissions (
      partner_id,
      opportunity_id,
      subscription_amount,
      commission_rate,
      commission_amount,
      status,
      commission_type,
      hosted_subscription
    ) VALUES (
      NEW.partner_id,
      NEW.opportunity_id,
      COALESCE(NEW.estimated_value, 0),
      COALESCE(v_rate, 0),
      ROUND(COALESCE(NEW.estimated_value, 0) * COALESCE(v_rate, 0) / 100, 2),
      'PENDING',
      'INITIAL',
      COALESCE(NEW.hosted_subscription, false)
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS create_commission_on_won ON public.opportunities;
CREATE TRIGGER create_commission_on_won
  AFTER UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.create_commission_on_won();

-- ============================================================
-- 4) Tier expiry maintenance
--    Deactivates partners whose paid tier has expired.
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_partner_tiers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_affected integer;
BEGIN
  UPDATE public.partners
     SET status = 'EXPIRED',
         fee_paid = false
   WHERE fee_paid = true
     AND tier_expires_at IS NOT NULL
     AND tier_expires_at < now();
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected;
END;
$function$;

REVOKE ALL ON FUNCTION public.expire_partner_tiers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_partner_tiers() TO authenticated;

-- ============================================================
-- 5) Admin-only maintenance RPC (callable from admin UI later)
-- ============================================================
CREATE OR REPLACE FUNCTION public.partner_maintenance(p_task text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_rows integer;
  v_result text := '';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF p_task = 'expire_partner_tiers' THEN
    SELECT public.expire_partner_tiers() INTO v_rows;
    v_result := 'expired_tiers=' || v_rows;
  END IF;

  RETURN v_result;
END;
$function$;

REVOKE ALL ON FUNCTION public.partner_maintenance(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_maintenance(text) TO authenticated;

-- ============================================================
-- 6) Directory: only list partners whose paid tier is active
-- ============================================================
CREATE OR REPLACE VIEW public.partner_directory AS
  SELECT partner_id, full_name, company_name, city, state, tier,
         certified_resources, customers_ytd, retention_rate
  FROM public.partners
  WHERE status = 'ACTIVE'
    AND directory_visible = true
    AND COALESCE(fee_paid, false) = true;