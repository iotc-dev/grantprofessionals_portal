-- ============================================================
-- Grant Professionals - Database Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AUTHENTICATION & USERS
-- ============================================================

CREATE TABLE gp_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SUBSCRIPTION PLANS
-- ============================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price_yearly DECIMAL(10,2),
    features TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- CLUBS - CORE
-- ============================================================

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abn TEXT NOT NULL UNIQUE,
    legal_entity_name TEXT NOT NULL,
    shortened_name TEXT,
    entity_type TEXT,
    gst_registered TEXT,
    dgr_status TEXT,
    tax_concession TEXT,
    acnc_registered TEXT,
    has_gaming_machines BOOLEAN DEFAULT false,
    land_ownership TEXT,
    code_version INT NOT NULL DEFAULT 1,
    subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    subscription_active BOOLEAN NOT NULL DEFAULT false,
    folder_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL,
    street_address TEXT,
    suburb TEXT,
    state TEXT,
    postcode TEXT,
    local_government_area TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    contact_type TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    is_authorized_contact BOOLEAN DEFAULT false,
    receives_notifications BOOLEAN DEFAULT false,
    hubspot_contact_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL UNIQUE REFERENCES clubs(id) ON DELETE CASCADE,
    about_organisation TEXT,
    purpose_mission TEXT,
    key_issues_priorities TEXT,
    sports_activities TEXT,
    league_affiliation TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL UNIQUE REFERENCES clubs(id) ON DELETE CASCADE,
    bank_account_in_org_name BOOLEAN,
    account_name_encrypted TEXT,
    bsb_encrypted TEXT,
    account_number_encrypted TEXT,
    previously_managed_grants BOOLEAN DEFAULT false,
    outstanding_acquittals BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_document_refs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    uploaded_by_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    uploaded_by_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- WISHLIST
-- ============================================================

CREATE TABLE wishlist_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES wishlist_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE club_wishlist_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(club_id, wishlist_item_id)
);

-- ============================================================
-- SPORTS & GRANT TYPES
-- ============================================================

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE club_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(club_id, sport_id)
);

CREATE TABLE grant_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- GRANTS & ELIGIBILITY
-- ============================================================

CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT,
    program_name TEXT,
    grant_type_id UUID REFERENCES grant_types(id) ON DELETE SET NULL,
    amount_min DECIMAL(12,2),
    amount_max DECIMAL(12,2),
    open_date DATE,
    close_date DATE,
    status TEXT NOT NULL DEFAULT 'draft',
    application_url TEXT,
    description TEXT,
    requirements TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grant_eligible_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    UNIQUE(grant_id, state)
);

CREATE TABLE grant_eligible_lgas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    lga_name TEXT NOT NULL,
    UNIQUE(grant_id, lga_name)
);

CREATE TABLE grant_eligible_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    UNIQUE(grant_id, sport_id)
);

CREATE TABLE grant_eligible_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
    UNIQUE(grant_id, wishlist_item_id)
);

CREATE TABLE grant_eligible_entity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    UNIQUE(grant_id, entity_type)
);

-- ============================================================
-- GRANT APPLICATIONS
-- ============================================================

CREATE TABLE grant_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    grant_id UUID NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    interest_status TEXT,
    interest_submitted_at TIMESTAMPTZ,
    application_status TEXT NOT NULL DEFAULT 'new',
    amount_requested DECIMAL(12,2),
    amount_won DECIMAL(12,2),
    success_fee_percentage DECIMAL(5,2),
    success_fee_amount DECIMAL(12,2),
    outcome_date DATE,
    submitted_at TIMESTAMPTZ,
    assigned_gp_team_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PENDING ITEMS
-- ============================================================

CREATE TABLE pending_item_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pending_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_application_id UUID NOT NULL REFERENCES grant_applications(id) ON DELETE CASCADE,
    template_id UUID REFERENCES pending_item_templates(id) ON DELETE SET NULL,
    custom_name TEXT,
    item_type TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_by_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pending_item_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pending_item_id UUID NOT NULL REFERENCES pending_items(id) ON DELETE CASCADE,
    response_text TEXT,
    file_url TEXT,
    responded_by_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    review_status TEXT,
    review_notes TEXT,
    reviewed_by_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE pending_item_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pending_item_id UUID NOT NULL REFERENCES pending_items(id) ON DELETE CASCADE,
    sent_by_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    reminder_type TEXT NOT NULL,
    message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    grant_application_id UUID REFERENCES grant_applications(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    invoice_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    xero_invoice_id TEXT,
    created_by_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    actor_gp_id UUID REFERENCES gp_team(id) ON DELETE SET NULL,
    actor_club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Club lookups
CREATE INDEX idx_clubs_abn ON clubs(abn);
CREATE INDEX idx_clubs_subscription_plan ON clubs(subscription_plan_id);
CREATE INDEX idx_club_addresses_club ON club_addresses(club_id);
CREATE INDEX idx_club_contacts_club ON club_contacts(club_id);
CREATE INDEX idx_club_profiles_club ON club_profiles(club_id);
CREATE INDEX idx_club_financials_club ON club_financials(club_id);
CREATE INDEX idx_club_document_refs_club ON club_document_refs(club_id);

-- Session lookups
CREATE INDEX idx_club_sessions_club ON club_sessions(club_id);
CREATE INDEX idx_club_sessions_token ON club_sessions(session_token);
CREATE INDEX idx_club_sessions_expires ON club_sessions(expires_at);

-- Wishlist
CREATE INDEX idx_wishlist_items_category ON wishlist_items(category_id);
CREATE INDEX idx_club_wishlist_club ON club_wishlist_selections(club_id);
CREATE INDEX idx_club_wishlist_item ON club_wishlist_selections(wishlist_item_id);

-- Sports
CREATE INDEX idx_club_sports_club ON club_sports(club_id);
CREATE INDEX idx_club_sports_sport ON club_sports(sport_id);

-- Grants
CREATE INDEX idx_grants_type ON grants(grant_type_id);
CREATE INDEX idx_grants_status ON grants(status);
CREATE INDEX idx_grants_dates ON grants(open_date, close_date);
CREATE INDEX idx_grant_eligible_states_grant ON grant_eligible_states(grant_id);
CREATE INDEX idx_grant_eligible_lgas_grant ON grant_eligible_lgas(grant_id);
CREATE INDEX idx_grant_eligible_sports_grant ON grant_eligible_sports(grant_id);
CREATE INDEX idx_grant_eligible_wishlist_grant ON grant_eligible_wishlist(grant_id);
CREATE INDEX idx_grant_eligible_entity_types_grant ON grant_eligible_entity_types(grant_id);

-- Grant Applications
CREATE INDEX idx_grant_applications_club ON grant_applications(club_id);
CREATE INDEX idx_grant_applications_grant ON grant_applications(grant_id);
CREATE INDEX idx_grant_applications_assigned ON grant_applications(assigned_gp_team_id);
CREATE INDEX idx_grant_applications_status ON grant_applications(application_status);

-- Pending Items
CREATE INDEX idx_pending_items_application ON pending_items(grant_application_id);
CREATE INDEX idx_pending_items_status ON pending_items(status);
CREATE INDEX idx_pending_item_responses_item ON pending_item_responses(pending_item_id);
CREATE INDEX idx_pending_item_reminders_item ON pending_item_reminders(pending_item_id);

-- Invoices
CREATE INDEX idx_invoices_club ON invoices(club_id);
CREATE INDEX idx_invoices_application ON invoices(grant_application_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Activity Logs
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_actor_gp ON activity_logs(actor_gp_id);
CREATE INDEX idx_activity_logs_actor_club ON activity_logs(actor_club_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- GP Team
CREATE INDEX idx_gp_team_auth ON gp_team(supabase_auth_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON gp_team
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON club_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON club_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON club_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON club_financials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON club_wishlist_selections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON grant_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON pending_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON grants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE gp_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_document_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_wishlist_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligible_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligible_lgas ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligible_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligible_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_eligible_entity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_item_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - GP Staff (authenticated via Supabase Auth)
-- GP staff get full access to everything
-- ============================================================

-- Helper: Check if current user is an active GP team member
CREATE OR REPLACE FUNCTION is_gp_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM gp_team
        WHERE supabase_auth_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GP Team - staff can see all team members
CREATE POLICY "gp_team_select" ON gp_team FOR SELECT USING (is_gp_staff());
CREATE POLICY "gp_team_insert" ON gp_team FOR INSERT WITH CHECK (is_gp_staff());
CREATE POLICY "gp_team_update" ON gp_team FOR UPDATE USING (is_gp_staff());

-- Subscription Plans - readable by GP staff (and later by clubs via service role)
CREATE POLICY "plans_select_gp" ON subscription_plans FOR SELECT USING (is_gp_staff());
CREATE POLICY "plans_manage_gp" ON subscription_plans FOR ALL USING (is_gp_staff());

-- Clubs - GP staff full access
CREATE POLICY "clubs_all_gp" ON clubs FOR ALL USING (is_gp_staff());

-- Club sub-tables - GP staff full access
CREATE POLICY "club_sessions_all_gp" ON club_sessions FOR ALL USING (is_gp_staff());
CREATE POLICY "club_addresses_all_gp" ON club_addresses FOR ALL USING (is_gp_staff());
CREATE POLICY "club_contacts_all_gp" ON club_contacts FOR ALL USING (is_gp_staff());
CREATE POLICY "club_profiles_all_gp" ON club_profiles FOR ALL USING (is_gp_staff());
CREATE POLICY "club_financials_all_gp" ON club_financials FOR ALL USING (is_gp_staff());
CREATE POLICY "club_document_refs_all_gp" ON club_document_refs FOR ALL USING (is_gp_staff());
CREATE POLICY "club_wishlist_all_gp" ON club_wishlist_selections FOR ALL USING (is_gp_staff());
CREATE POLICY "club_sports_all_gp" ON club_sports FOR ALL USING (is_gp_staff());

-- Reference data - GP staff full access
CREATE POLICY "wishlist_categories_all_gp" ON wishlist_categories FOR ALL USING (is_gp_staff());
CREATE POLICY "wishlist_items_all_gp" ON wishlist_items FOR ALL USING (is_gp_staff());
CREATE POLICY "sports_all_gp" ON sports FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_types_all_gp" ON grant_types FOR ALL USING (is_gp_staff());

-- Grants & eligibility - GP staff full access
CREATE POLICY "grants_all_gp" ON grants FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_eligible_states_all_gp" ON grant_eligible_states FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_eligible_lgas_all_gp" ON grant_eligible_lgas FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_eligible_sports_all_gp" ON grant_eligible_sports FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_eligible_wishlist_all_gp" ON grant_eligible_wishlist FOR ALL USING (is_gp_staff());
CREATE POLICY "grant_eligible_entity_types_all_gp" ON grant_eligible_entity_types FOR ALL USING (is_gp_staff());

-- Grant Applications - GP staff full access
CREATE POLICY "grant_applications_all_gp" ON grant_applications FOR ALL USING (is_gp_staff());

-- Pending Items - GP staff full access
CREATE POLICY "pending_templates_all_gp" ON pending_item_templates FOR ALL USING (is_gp_staff());
CREATE POLICY "pending_items_all_gp" ON pending_items FOR ALL USING (is_gp_staff());
CREATE POLICY "pending_responses_all_gp" ON pending_item_responses FOR ALL USING (is_gp_staff());
CREATE POLICY "pending_reminders_all_gp" ON pending_item_reminders FOR ALL USING (is_gp_staff());

-- Invoices - GP staff full access
CREATE POLICY "invoices_all_gp" ON invoices FOR ALL USING (is_gp_staff());

-- Activity Logs - GP staff full access
CREATE POLICY "activity_logs_all_gp" ON activity_logs FOR ALL USING (is_gp_staff());

-- ============================================================
-- NOTE ON CLUB ACCESS
-- ============================================================
-- Club authentication is custom (ABN + code), NOT Supabase Auth.
-- Club data access will be handled via:
--   1. Supabase Edge Functions or Next.js API routes
--   2. Using the service_role key (bypasses RLS)
--   3. Session validation against club_sessions table
-- 
-- This means clubs don't need RLS policies on these tables.
-- The API layer enforces club-level access control.
-- ============================================================

-- ============================================================
-- ENCRYPTION HELPER FUNCTIONS
-- For encrypting/decrypting bank details
-- The encryption key should be stored as a Supabase secret/vault
-- ============================================================

-- Encrypt a value
CREATE OR REPLACE FUNCTION encrypt_sensitive(plain_text TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(plain_text, encryption_key),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt a value
CREATE OR REPLACE FUNCTION decrypt_sensitive(encrypted_text TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_text, 'base64'),
        encryption_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME
-- Enable realtime for tables that need live updates
-- (for the 20-staff concurrent dashboard)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE clubs;
ALTER PUBLICATION supabase_realtime ADD TABLE club_addresses;
ALTER PUBLICATION supabase_realtime ADD TABLE club_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE club_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE club_wishlist_selections;
ALTER PUBLICATION supabase_realtime ADD TABLE grant_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE grants;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_items;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_item_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;

-- ============================================================
-- SEED DATA - Subscription Plans
-- ============================================================

INSERT INTO subscription_plans (code, name, price_yearly, features, is_active) VALUES
    ('GRP', 'Grant Ready Program', 0, 'Basic grant readiness assessment and preparation', true),
    ('STP', 'Success Track Program', 0, 'Active grant matching and application support', true),
    ('FDP', 'Full Drive Program', 0, 'Complete grant management and success fee model', true);

-- ============================================================
-- DONE!
-- Next steps:
-- 1. Set your encryption key in Supabase Vault/Secrets
-- 2. Seed wishlist_categories and wishlist_items
-- 3. Seed sports reference data
-- 4. Seed grant_types reference data
-- 5. Create your first GP team member linked to a Supabase Auth user
-- ============================================================