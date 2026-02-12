-- ============================================================
-- Migration 002: Add columns from Monday.com mapping
-- Run in Supabase SQL Editor (staging branch)
-- Will sync to production when branch is merged
-- ============================================================

-- ============================================================
-- 1. GP_TEAM — add position and phone
-- ============================================================

ALTER TABLE gp_team ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE gp_team ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================================
-- 2. CLUBS — add AE, AM, BDM assignments
-- ============================================================

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS account_executive_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS bdm_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;

-- ============================================================
-- 3. GRANT_APPLICATIONS — add workflow sub-statuses and fields
-- ============================================================

-- Workflow sub-statuses (each progresses independently)
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS drafting_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS attachment_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS lodgment_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS outcome_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS acquittal_status TEXT DEFAULT 'pending';
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS preparation_status TEXT DEFAULT 'pending';

-- Additional team assignments
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS grant_writer_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES gp_team(id) ON DELETE SET NULL;

-- Application details
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS forecasted_success_fee DECIMAL(12,2);
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS probability_of_success DECIMAL(5,2);
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS outcome_expected_date DATE;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS outcome_informed_date DATE;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS application_reference TEXT;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS hubspot_deal_id TEXT;
ALTER TABLE grant_applications ADD COLUMN IF NOT EXISTS onedrive_folder_url TEXT;

-- ============================================================
-- 4. GRANTS — add fields from Grants Register board
-- ============================================================

ALTER TABLE grants ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS guidelines_url TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS pool_value DECIMAL(12,2);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS co_contribution TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS apply_via TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS grant_frequency TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS max_applications INT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS default_win_probability DECIMAL(5,2);
ALTER TABLE grants ADD COLUMN IF NOT EXISTS last_checked_date DATE;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS recheck_date DATE;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS results_available TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS always_open BOOLEAN DEFAULT false;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS application_system TEXT;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS application_login_url TEXT;

-- ============================================================
-- 5. NEW TABLE: Grant application portal credentials
-- Stores login details for grant application portals (encrypted)
-- ============================================================

CREATE TABLE IF NOT EXISTS grant_application_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_application_id UUID NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
    login_url TEXT,
    login_email TEXT,
    login_password_encrypted TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(grant_application_id)
);

-- RLS for credentials table
ALTER TABLE grant_application_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grant_creds_all_gp" ON grant_application_credentials FOR ALL USING (is_gp_staff());

-- ============================================================
-- DONE! Verify with:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'gp_team' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'clubs' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'grant_applications' ORDER BY ordinal_position;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'grants' ORDER BY ordinal_position;
-- SELECT count(*) FROM information_schema.tables WHERE table_name = 'grant_application_credentials';
-- ============================================================