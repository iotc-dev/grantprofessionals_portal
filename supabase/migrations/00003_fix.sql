-- ============================================================
-- FIX: Update application_status to use pipeline stages
-- Run in Supabase SQL Editor (staging)
-- 
-- Old values: 'new', 'in_progress', 'submitted', 'dnl', 'won', 'lost'
-- New values: 'new', 'preparation', 'drafting', 'attachments', 'review', 
--             'lodgment', 'outcome', 'acquittal', 'won', 'lost', 'dnl'
--
-- The application_status now represents WHERE in the pipeline the app is.
-- The sub-status columns (drafting_status, attachment_status, etc.) 
-- track detail within each stage.
-- ============================================================

-- Vikings App 1: SCGP Cat 2 - was 'submitted', sub-statuses show lodged
-- lodgment_status='lodged', outcome_status='lodged' → stage is 'outcome'
UPDATE grant_applications 
SET application_status = 'outcome'
WHERE application_reference = 'GA-F4779183-2086';

-- Vikings App 2: SCGP Uniforms - was 'submitted', sub-statuses show lodged  
-- lodgment_status='lodged', outcome_status='lodged' → stage is 'outcome'
UPDATE grant_applications 
SET application_status = 'outcome'
WHERE application_reference = 'GA-F4779101-9571';

-- Vikings App 3: LSIF - 'dnl' stays as 'dnl' (correct)
-- No change needed

-- Coraki App 1: Clubgrants - 'dnl' stays as 'dnl' (correct)
-- No change needed

-- Coraki App 2: Richmond Valley CFAP - was 'in_progress'
-- drafting_status='wip', everything else 'pending' → stage is 'drafting'
UPDATE grant_applications 
SET application_status = 'drafting'
WHERE hubspot_deal_id = '43402464276';

-- Wanderers App 1: GCBF R126 - was 'in_progress'
-- All sub-statuses 'pending' → stage is 'preparation' (not yet started drafting)
UPDATE grant_applications 
SET application_status = 'preparation'
WHERE hubspot_deal_id IS NULL 
  AND application_status = 'in_progress';

-- ============================================================
-- VERIFY:
-- SELECT application_status, count(*) FROM grant_applications GROUP BY 1;
-- Expected: outcome: 2, dnl: 2, drafting: 1, preparation: 1
-- ============================================================