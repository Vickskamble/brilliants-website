-- 006 Auto-create a renewal record when an opportunity is WON
-- Additive, idempotent. Run AFTER 005.

-- ============================================================
-- create_renewal_on_won()
-- Inserts an UPCOMING renewal (12-month period) when a partner
-- opportunity turns WON. Runs AFTER create_commission_on_won so
-- it can link the freshly created INITIAL commission.
-- commission_rate mirrors the tier-based rate used for the
-- initial commission (silver 22%, gold 25%).
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_renewal_on_won()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_rate      numeric;
  v_comm_id   text;
  v_eligible  boolean := true;
BEGIN
  IF NEW.status = 'WON'
     AND OLD.status IS DISTINCT FROM 'WON'
     AND NEW.partner_id IS NOT NULL THEN

    IF EXISTS (
      SELECT 1 FROM public.renewals r
      WHERE r.opportunity_id = NEW.opportunity_id
    ) THEN
      RETURN NEW;
    END IF;

    SELECT CASE lower(p.tier)
             WHEN 'silver' THEN 22
             WHEN 'gold'   THEN 25
             WHEN 'sales'  THEN 10
             WHEN 'solution' THEN 20
             ELSE 0
           END
      INTO v_rate
      FROM public.partners p
      WHERE p.partner_id = NEW.partner_id;

    SELECT c.commission_id
      INTO v_comm_id
      FROM public.commissions c
      WHERE c.opportunity_id = NEW.opportunity_id
        AND c.commission_type = 'INITIAL'
      ORDER BY c.created_at DESC
      LIMIT 1;

    IF COALESCE(v_rate, 0) <= 0 THEN
      v_eligible := false;
    END IF;

    INSERT INTO public.renewals (
      partner_id,
      opportunity_id,
      customer_name,
      product,
      subscription_period,
      renewal_date,
      status,
      partner_eligible,
      commission_rate,
      commission_id
    ) VALUES (
      NEW.partner_id,
      NEW.opportunity_id,
      COALESCE(NEW.customer_name, 'Customer'),
      COALESCE(NEW.product, 'Subscription'),
      '12 months',
      now() + interval '12 months',
      'UPCOMING',
      v_eligible,
      COALESCE(v_rate, 0),
      v_comm_id
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS create_renewal_on_won ON public.opportunities;
CREATE TRIGGER create_renewal_on_won
  AFTER UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.create_renewal_on_won();