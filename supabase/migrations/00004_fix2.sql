-- ============================================================
-- FIX: Update application_status to use pipeline stages
-- Run in Supabase SQL Editor (staging)
-- 
-- Pipeline: open_match → proceeding → preparation → drafting → 
--           attachments → review → lodgment → outcome → acquittal
--           → won / lost / dnl
-- ============================================================

-- Vikings App 1: SCGP Cat 2 - was 'submitted', lodged + awaiting outcome → 'outcome'
UPDATE grant_applications 
SET application_status = 'outcome'
WHERE application_reference = 'GA-F4779183-2086';

-- Vikings App 2: SCGP Uniforms - was 'submitted', same pattern → 'outcome'
UPDATE grant_applications 
SET application_status = 'outcome'
WHERE application_reference = 'GA-F4779101-9571';

-- Coraki App 2: Richmond Valley CFAP - was 'in_progress', drafting_status='wip' → 'drafting'
UPDATE grant_applications 
SET application_status = 'drafting'
WHERE hubspot_deal_id = '43402464276';

-- Wanderers App 1: GCBF R126 - was 'in_progress', all pending → 'preparation'
UPDATE grant_applications 
SET application_status = 'preparation'
WHERE hubspot_deal_id IS NULL 
  AND application_status = 'in_progress';

-- dnl rows stay as 'dnl' — no change needed

-- ============================================================
-- Also add interest_status column if not already present
-- ============================================================
-- ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS interest_status TEXT;
-- ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS interest_submitted_at TIMESTAMPTZ;

-- ============================================================
-- VERIFY:
-- SELECT application_status, count(*) FROM grant_applications GROUP BY 1 ORDER BY 1;
-- Expected: dnl: 2, drafting: 1, outcome: 2, preparation: 1
-- ============================================================