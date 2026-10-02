-- ============================================================
-- BRILLIANTS PARTNER MANAGEMENT SYSTEM
-- 007 — Resources + test-data cleanup (live DB)
-- ============================================================
-- What this does:
--   1. Deactivates legacy IronBook resources (were seeded pre-2026-10)
--   2. Inserts Brilliants ERP + Smart HRMS resources in their place
--   3. Deletes the test/dummy partner records (safe-guarded, list first)
--
-- How to run: Supabase dashboard -> SQL Editor -> paste + Run
--   https://supabase.com/dashboard/project/ekjakdhxodugncdpwkrj/sql/new
-- ============================================================

-- ------------------------------------------------------------
-- 1) RESOURCES — retire IronBook, add ERP / Smart HRMS
-- ------------------------------------------------------------
UPDATE partner_resources
   SET is_active = false
 WHERE product ILIKE '%IronBook%'
    OR url ILIKE '/ironbook/%';

INSERT INTO partner_resources (title, description, resource_type, url, product, sort_order) VALUES
  ('Brilliants ERP Product Overview', 'Industrial maintenance ERP for work orders, assets, spares and preventive maintenance', 'brochure', 'https://erp.brilliants.in', 'Brilliants ERP', 2),
  ('Smart HRMS Product Overview', 'Face-recognition HRMS for attendance, leave and payroll', 'brochure', '/smart-hrms/', 'Smart HRMS', 3),
  ('Brilliants ERP Demo', 'Live app link for Brilliants ERP', 'demo_link', 'https://erp.brilliants.in', 'Brilliants ERP', 5),
  ('Smart HRMS Demo', 'Smart HRMS early access page', 'demo_link', '/smart-hrms/', 'Smart HRMS', 6)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 2) TEST DATA — inspect first, then delete if listed
-- ------------------------------------------------------------
-- Run the inspect block, confirm only test rows appear, then run the delete block.
SELECT application_id, full_name, business_email, status, created_at
  FROM partner_applications
 WHERE application_id = 'BRL-PA-00006'
    OR business_email ILIKE '%test%@%'
    OR full_name ILIKE '%test%';

SELECT partner_id, full_name, business_email, user_id, status, created_at
  FROM partners
 WHERE partner_id = 'BRL-PT-00007'                -- adjust to actual test partner
    OR business_email ILIKE '%test%@%'
    OR user_id = '9acd7286-3615-4bad-a6b7-5071768f1b92';  -- test auth user

-- ------------------------------------------------------------
-- 3) TEST DATA — DELETE (only after inspect confirms rows)
-- ------------------------------------------------------------
-- DELETE FROM partner_audit_logs    WHERE entity_id IN ('BRL-PA-00006', 'BRL-PT-00007');
-- DELETE FROM partner_agreements    WHERE application_id = 'BRL-PA-00006';
-- DELETE FROM renewals              WHERE partner_id = 'BRL-PT-00007';
-- DELETE FROM commissions           WHERE partner_id = 'BRL-PT-00007';
-- DELETE FROM opportunities         WHERE partner_id = 'BRL-PT-00007';
-- DELETE FROM partner_leads         WHERE partner_id = 'BRL-PT-00007';
-- DELETE FROM partners              WHERE partner_id = 'BRL-PT-00007'
--                                      OR user_id = '9acd7286-3615-4bad-a6b7-5071768f1b92';
-- DELETE FROM partner_applications  WHERE application_id = 'BRL-PA-00006';
-- DELETE FROM auth.users            WHERE id = '9acd7286-3615-4bad-a6b7-5071768f1b92';
--
-- -- Reset counters so real partners start clean
-- UPDATE id_counters SET current_value = 0 WHERE entity_type = 'partner_application';
-- UPDATE id_counters SET current_value = 0 WHERE entity_type = 'partner';
-- ============================================================