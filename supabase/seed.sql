-- ============================================================
-- SEED DATA from Monday.com Exports (Real Data)
-- Run in Supabase SQL Editor (staging)
-- 3 clubs, 22 team members, 18 grants, 59 wishlist items
-- ============================================================

-- ============================================================
-- 1. GP TEAM (from CBGP Directory — 22 members)
-- ============================================================

INSERT INTO gp_team (email, full_name, role, position, phone) VALUES
  ('anthony@arwk.com.au', 'Anthony Nicholls', 'admin', 'Managing Director', '407585775'),
  ('robert@arwk.com.au', 'Robert Palmaricciotti', 'admin', 'Grants Director', '476165683'),
  ('sid@arwk.com.au', 'Sid Sarathy', 'admin', 'General Manager', '492972927'),
  ('jason@arwk.com.au', 'Jason Goldsmith', 'staff', 'Business Development Manager', '491170595'),
  ('sara@arwk.com.au', 'Sara Duboudin', 'staff', 'Business Development Manager', '492977901'),
  ('adrian@arwk.com.au', 'Adrian Salerno', 'staff', 'Business Development Manager', '492972460'),
  ('ankur@arwk.com.au', 'Ankur Tayal', 'staff', 'Account Executive, Team Leader', '492970147'),
  ('pranav@arwk.com.au', 'Pranav Nambiar', 'staff', 'Team Leader, Account Executive', '61398693276'),
  ('jacob@arwk.com.au', 'Jacob Miller', 'staff', 'Account Executive, Team Leader', '492972134'),
  ('ramjel@arwk.com.au', 'Ramjel Manacmul', 'staff', 'Account Manager', '61370476765'),
  ('suzy@arwk.com.au', 'Suzy Rogers', 'staff', 'Director of Communications', '416293759'),
  ('heidi@arwk.com.au', 'Heidi Wong', 'staff', 'Specialist Grant Writer', '457256901'),
  ('dennis@arwk.com.au', 'Dennis Smith', 'staff', 'Specialist Grant Writer', '419360449'),
  ('joel@arwk.com.au', 'Joel Lotherington', 'staff', 'Communications Manager', '432544054'),
  ('suva@arwk.com.au', 'Suva Tamilchelvan', 'staff', 'First Human Contact (FHC)', '492972875'),
  ('prathamesh@arwk.com.au', 'Prathamesh Shedge', 'staff', 'First Human Contact (FHC)', '492978967'),
  ('maria@arwk.com.au', 'Maria Lourdes Palomo', 'staff', 'Project Assistant', NULL),
  ('prusti@arwk.com.au', 'Prusti Doshi', 'staff', 'Project Assistant', NULL),
  ('aiko@arwk.com.au', 'Aiko Estuista', 'staff', 'Project Assistant', '61383469664'),
  ('marian@arwk.com.au', 'Marian Dela Cruz', 'staff', 'Project Assistant, Communications Assistant', '61383469690'),
  ('aldrin@arwk.com.au', 'Aldrin Laranang', 'staff', 'Project Assistant', NULL),
  ('zarah@arwk.com.au', 'Zarah Quintillano', 'staff', 'Grants Researcher', NULL)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. REFERENCE DATA: Sports
-- ============================================================

INSERT INTO sports (name, display_order) VALUES
  ('Gridiron', 1),
  ('Lawn Bowls', 2),
  ('Rugby League', 3),
  ('AFL', 4),
  ('Netball', 5),
  ('Cricket', 6),
  ('Soccer', 7),
  ('Basketball', 8),
  ('Tennis', 9),
  ('Swimming', 10),
  ('Surf Life Saving', 11),
  ('Hockey', 12),
  ('Athletics', 13),
  ('Rugby Union', 14),
  ('Softball', 15)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. REFERENCE DATA: Grant Types
-- ============================================================

INSERT INTO grant_types (name, display_order) VALUES
  ('State', 1),
  ('Federal (National)', 2),
  ('Council', 3),
  ('Foundation-funded', 4),
  ('Corporate / Private', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 4. WISHLIST CATEGORIES & ITEMS (59 real items, 7 categories)
-- ============================================================

INSERT INTO wishlist_categories (name, display_order) VALUES
  ('Programs & Participation', 1),
  ('Equipment & Uniforms', 2),
  ('Facilities & Buildings', 3),
  ('Lighting & Power', 4),
  ('Playing Surfaces & Grounds', 5),
  ('Access, Inclusion & Public Areas', 6),
  ('Car Parks & External', 7)
ON CONFLICT DO NOTHING;

-- Programs & Participation (13 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Culturally and Linguistically Diverse (CALD) Programs', 1),
  ('Coaching Development Program', 2),
  ('Committee Education Programs', 3),
  ('Community Participation Programs (programs for members of the community who are not a part of the Club / Organisation)', 4),
  ('Female Participation Programs (programs specifically for, or with substantial numbers of, female participants)', 5),
  ('Indigenous Participation Programs', 6),
  ('Junior Participation Programs', 7),
  ('Programs (All-abilities / Disabled participants)', 8),
  ('School Engagement Programs', 9),
  ('Socio-economically Disadvantaged Participation Programs (Programs specifically for, or with substantial numbers of, socioeconomically disadvantaged participants)', 10),
  ('Training for referees/officials/umpires', 11),
  ('Training for volunteers', 12),
  ('Volunteer Education Programs', 13)
) AS item(name, ord)
WHERE wc.name = 'Programs & Participation';

-- Equipment & Uniforms (7 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Audio-visual equipment (Speakers, TVs etc.)', 1),
  ('Defibrillator', 2),
  ('First Aid Equipment', 3),
  ('Lane Ropes', 4),
  ('Line Markings', 5),
  ('Training equipment', 6),
  ('Uniforms / Attire', 7)
) AS item(name, ord)
WHERE wc.name = 'Equipment & Uniforms';

-- Facilities & Buildings (16 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Access to an additional facility', 1),
  ('Additional Change Rooms', 2),
  ('Additional storage areas', 3),
  ('Additional Toilets', 4),
  ('Canteen / Kiosk', 5),
  ('Change rooms', 6),
  ('Female Friendly Change Rooms', 7),
  ('Increased access levels to existing facilities', 8),
  ('Kitchen / Canteen Upgrades', 9),
  ('Pavilion furnishings', 10),
  ('Pavilion Heating/Cooling', 11),
  ('Toilet redevelopments', 12),
  ('Toilets / Showers', 13),
  ('Training Amenities', 14),
  ('Umpire / Referee / Officials Room', 15),
  ('Ventilation', 16)
) AS item(name, ord)
WHERE wc.name = 'Facilities & Buildings';

-- Lighting & Power (6 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Lighting', 1),
  ('New on-field lighting (in a location where there is no existing lighting)', 2),
  ('Off-field Lighting upgrades/replacement (e.g. Carpark lighting, safety lighting etc.)', 3),
  ('Upgrade/replace existing on-field lighting', 4),
  ('Solar Panels', 5),
  ('Solar Battery', 6)
) AS item(name, ord)
WHERE wc.name = 'Lighting & Power';

-- Playing Surfaces & Grounds (9 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Grass field/pitch', 1),
  ('Synthetic field/pitch', 2),
  ('Ground / Field Drainage', 3),
  ('Permanent Goals', 4),
  ('Portable Goals', 5),
  ('Permanent Fencing', 6),
  ('Temporary Fencing', 7),
  ('Soft netting (e.g. Nets behind Footy goals)', 8),
  ('Water Filtering', 9)
) AS item(name, ord)
WHERE wc.name = 'Playing Surfaces & Grounds';

-- Access, Inclusion & Public Areas (5 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('All-abilities / Disability Amenities', 1),
  ('BBQ Area', 2),
  ('Concourse / Walkways', 3),
  ('Permanent Shade Structures', 4),
  ('Spectator Seating', 5)
) AS item(name, ord)
WHERE wc.name = 'Access, Inclusion & Public Areas';

-- Car Parks & External (3 items)
INSERT INTO wishlist_items (category_id, name, display_order)
SELECT wc.id, item.name, item.ord
FROM wishlist_categories wc
CROSS JOIN (VALUES
  ('Additional Car Parking Space', 1),
  ('Carpark resurfacing', 2),
  ('Carpark Safety Improvements', 3)
) AS item(name, ord)
WHERE wc.name = 'Car Parks & External';

-- ============================================================
-- 5. CLUBS, GRANTS, APPLICATIONS
-- ============================================================

DO $$
DECLARE
  plan_grp UUID;
  plan_stp UUID;
  ae_ankur UUID;
  ae_pranav UUID;
  ae_jacob UUID;
  bdm_adrian UUID;
  reviewer_dennis UUID;
  club_vikings UUID;
  club_coraki UUID;
  club_wanderers UUID;
  sport_gridiron UUID;
  sport_bowls UUID;
  sport_rugby UUID;
  gt_state UUID;
  gt_federal UUID;
  gt_council UUID;
  gt_foundation UUID;
  -- Grant IDs (18 grants)
  grant_climate UUID;
  grant_vasas UUID;
  grant_accessible UUID;
  grant_school UUID;
  grant_rv_cfap UUID;
  grant_gcbf_125 UUID;
  grant_scgp_vol UUID;
  grant_scgp_uni UUID;
  grant_scgp_travel UUID;
  grant_scgp_gov UUID;
  grant_clubgrants UUID;
  grant_lsif_indoor UUID;
  grant_lsif_female UUID;
  grant_lsif_community UUID;
  grant_lsif_lighting UUID;
  grant_lsif_planning UUID;
  grant_gcbf_126 UUID;
  grant_gcbf_124 UUID;
BEGIN
  SELECT id INTO plan_grp FROM subscription_plans WHERE code = 'GRP';
  SELECT id INTO plan_stp FROM subscription_plans WHERE code = 'STP';
  SELECT id INTO ae_ankur FROM gp_team WHERE email = 'ankur@arwk.com.au';
  SELECT id INTO ae_pranav FROM gp_team WHERE email = 'pranav@arwk.com.au';
  SELECT id INTO ae_jacob FROM gp_team WHERE email = 'jacob@arwk.com.au';
  SELECT id INTO bdm_adrian FROM gp_team WHERE email = 'adrian@arwk.com.au';
  SELECT id INTO reviewer_dennis FROM gp_team WHERE email = 'dennis@arwk.com.au';
  SELECT id INTO sport_gridiron FROM sports WHERE name = 'Gridiron';
  SELECT id INTO sport_bowls FROM sports WHERE name = 'Lawn Bowls';
  SELECT id INTO sport_rugby FROM sports WHERE name = 'Rugby League';
  SELECT id INTO gt_state FROM grant_types WHERE name = 'State';
  SELECT id INTO gt_federal FROM grant_types WHERE name = 'Federal (National)';
  SELECT id INTO gt_council FROM grant_types WHERE name = 'Council';
  SELECT id INTO gt_foundation FROM grant_types WHERE name = 'Foundation-funded';

  -- ══════════════════════════════════════════════════════════
  -- CLUBS
  -- ══════════════════════════════════════════════════════════

  -- Club 1: Southern Vikings Gridiron Club (VIC)
  INSERT INTO clubs (abn, legal_entity_name, shortened_name, entity_type, subscription_plan_id, subscription_active, code_version, account_executive_id)
  VALUES ('96883145762', 'Southern Vikings Americian Football Club Incorporated', 'Southern Vikings GR', 'Incorporated Association', plan_stp, true, 1, ae_ankur)
  RETURNING id INTO club_vikings;

  INSERT INTO club_addresses (club_id, address_type, state, local_government_area) VALUES
    (club_vikings, 'organisation', 'VIC', 'Frankston');
  INSERT INTO club_contacts (club_id, contact_type, first_name, last_name, position, email, is_authorized_contact, receives_notifications) VALUES
    (club_vikings, 'primary', 'Claire', 'Lawrence', 'President', 'president@southernvikings.com.au', true, true);
  INSERT INTO club_sports (club_id, sport_id) VALUES (club_vikings, sport_gridiron);

  -- Club 2: Coraki Memorial Bowling Club (NSW)
  INSERT INTO clubs (abn, legal_entity_name, shortened_name, entity_type, subscription_plan_id, subscription_active, code_version, account_executive_id, bdm_id)
  VALUES ('81000981886', 'Coraki Memorial Bowling Club Ltd', 'Coraki Memorial LB', 'Company Limited by Guarantee', plan_grp, true, 1, ae_pranav, bdm_adrian)
  RETURNING id INTO club_coraki;

  INSERT INTO club_addresses (club_id, address_type, state, local_government_area) VALUES
    (club_coraki, 'organisation', 'NSW', 'Richmond Valley');
  INSERT INTO club_contacts (club_id, contact_type, first_name, last_name, position, email, is_authorized_contact, receives_notifications) VALUES
    (club_coraki, 'primary', 'Kirralee', 'Morgan', 'Admin', 'admin@corakibowlingclub.com.au', true, true);
  INSERT INTO club_sports (club_id, sport_id) VALUES (club_coraki, sport_bowls);

  -- Club 3: Wanderers Rugby League Club (QLD) — dummy ABN
  INSERT INTO clubs (abn, legal_entity_name, shortened_name, entity_type, subscription_plan_id, subscription_active, code_version, account_executive_id)
  VALUES ('99999999999', 'Wanderers Rugby League Club (QLD)', 'Wanderers RLC', 'Incorporated Association', plan_grp, false, 1, ae_jacob)
  RETURNING id INTO club_wanderers;

  INSERT INTO club_addresses (club_id, address_type, state, local_government_area) VALUES
    (club_wanderers, 'organisation', 'QLD', 'Mackay');
  INSERT INTO club_sports (club_id, sport_id) VALUES (club_wanderers, sport_rugby);

  -- ══════════════════════════════════════════════════════════
  -- WISHLIST SELECTIONS
  -- ══════════════════════════════════════════════════════════

  -- Southern Vikings (54 items)
  INSERT INTO club_wishlist_selections (club_id, wishlist_item_id)
  SELECT club_vikings, wi.id FROM wishlist_items wi WHERE wi.name IN (
    'Culturally and Linguistically Diverse (CALD) Programs','Coaching Development Program','Committee Education Programs',
    'Community Participation Programs (programs for members of the community who are not a part of the Club / Organisation)',
    'Female Participation Programs (programs specifically for, or with substantial numbers of, female participants)',
    'Indigenous Participation Programs','Junior Participation Programs','Programs (All-abilities / Disabled participants)',
    'Socio-economically Disadvantaged Participation Programs (Programs specifically for, or with substantial numbers of, socioeconomically disadvantaged participants)',
    'Training for referees/officials/umpires','Training for volunteers','Volunteer Education Programs',
    'Audio-visual equipment (Speakers, TVs etc.)','Defibrillator','First Aid Equipment','Line Markings','Training equipment','Uniforms / Attire',
    'Access to an additional facility','Additional Car Parking Space','Additional Change Rooms','Additional storage areas','Additional Toilets',
    'All-abilities / Disability Amenities','BBQ Area','Canteen / Kiosk','Carpark resurfacing','Carpark Safety Improvements',
    'Change rooms','Concourse / Walkways','Female Friendly Change Rooms','Grass field/pitch','Ground / Field Drainage',
    'Increased access levels to existing facilities','Kitchen / Canteen Upgrades','Lighting',
    'New on-field lighting (in a location where there is no existing lighting)',
    'Off-field Lighting upgrades/replacement (e.g. Carpark lighting, safety lighting etc.)',
    'Pavilion furnishings','Pavilion Heating/Cooling','Permanent Fencing','Permanent Goals','Permanent Shade Structures',
    'Portable Goals','Soft netting (e.g. Nets behind Footy goals)','Solar Panels','Spectator Seating','Synthetic field/pitch',
    'Toilet redevelopments','Toilets / Showers','Training Amenities','Umpire / Referee / Officials Room',
    'Upgrade/replace existing on-field lighting','Water Filtering'
  );

  -- Coraki Memorial (45 items)
  INSERT INTO club_wishlist_selections (club_id, wishlist_item_id)
  SELECT club_coraki, wi.id FROM wishlist_items wi WHERE wi.name IN (
    'Female Participation Programs (programs specifically for, or with substantial numbers of, female participants)',
    'Junior Participation Programs','School Engagement Programs','Programs (All-abilities / Disabled participants)',
    'Training for referees/officials/umpires','Training for volunteers','Volunteer Education Programs',
    'Audio-visual equipment (Speakers, TVs etc.)','Defibrillator','First Aid Equipment','Line Markings','Training equipment','Uniforms / Attire',
    'Access to an additional facility','Additional Car Parking Space','Additional Change Rooms','Additional storage areas','Additional Toilets',
    'All-abilities / Disability Amenities','BBQ Area','Canteen / Kiosk','Carpark resurfacing','Carpark Safety Improvements',
    'Change rooms','Concourse / Walkways','Grass field/pitch','Ground / Field Drainage',
    'Increased access levels to existing facilities','Kitchen / Canteen Upgrades','Lane Ropes','Lighting',
    'New on-field lighting (in a location where there is no existing lighting)',
    'Off-field Lighting upgrades/replacement (e.g. Carpark lighting, safety lighting etc.)',
    'Permanent Fencing','Permanent Shade Structures','Solar Battery','Solar Panels','Spectator Seating','Synthetic field/pitch',
    'Temporary Fencing','Toilet redevelopments','Toilets / Showers','Training Amenities',
    'Upgrade/replace existing on-field lighting','Ventilation'
  );

  -- ══════════════════════════════════════════════════════════
  -- 18 GRANTS
  -- ══════════════════════════════════════════════════════════

  -- 1. Community Led Climate Solutions 2025/26 Round 4
  INSERT INTO grants (name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, notes)
  VALUES ('Community Led Climate Solutions 2025/26 Round 4', 'FRRR', gt_federal, 20000, '2026-02-10', '2026-03-12', 'open', 'https://frrr.org.au/funding/community-led-climate-solutions/', 'We can apply ourselves', 'Applications requesting solar panels/batteries must demonstrate broader community climate solutions impact')
  RETURNING id INTO grant_climate;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_climate, 'AUS');

  -- 2. The Maria Vasas Foundation
  INSERT INTO grants (name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via)
  VALUES ('The Maria Vasas Foundation', 'Maria Vasas Foundation', gt_foundation, 50000, '2026-02-02', '2026-02-27', 'open', 'https://www.eqt.com.au/our-services/community/grant-funding/aet-foundations/the-maria-vasas-foundation', 'We can apply ourselves')
  RETURNING id INTO grant_vasas;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_vasas, 'QLD');

  -- 3. Commonwealth Accessible Australia Initiative
  INSERT INTO grants (name, provider, grant_type_id, status, application_url)
  VALUES ('Commonwealth Accessible Australia Initiative (Accessible Australia)', 'Australian Government', gt_federal, 'closed', 'https://www.health.gov.au/our-work/accessible-australia')
  RETURNING id INTO grant_accessible;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_accessible, 'AUS');

  -- 4. QLD School Subsidy Scheme
  INSERT INTO grants (name, provider, grant_type_id, amount_min, status, application_url, apply_via, is_recurring, grant_frequency, pool_value, notes)
  VALUES ('QLD School Subsidy Scheme', 'QLD Government', gt_state, 50000, 'closed', 'https://education.qld.gov.au/about-us/budgets-funding-grants/grants/state-schools/previous-funded-programs/school-subsidy-scheme', 'We can apply ourselves', true, 'Annual', 10000000, 'Project should be discussed first by principal to regional infrastructure advisor')
  RETURNING id INTO grant_school;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_school, 'QLD');

  -- 5. Richmonde Valley CFAP 2025/26 Round 1
  INSERT INTO grants (name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, results_available, notes)
  VALUES ('Richmonde Valley Community Financial Assistance Program 2025/26 Round 1', 'Richmonde Valley Council', gt_council, 5000, '2025-09-01', '2025-09-30', 'closed', 'https://richmondvalley.nsw.gov.au/community-services/grants-and-funding/community-financial-assistance-program/', 'We can apply ourselves', true, 'Bi-Annual', 'No Public Availability', 'Two funding rounds each financial year: Round 1 opens September, Round 2 opens March')
  RETURNING id INTO grant_rv_cfap;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_rv_cfap, 'NSW');
  INSERT INTO grant_eligible_lgas (grant_id, lga_name) VALUES (grant_rv_cfap, 'Richmond Valley');

  -- 6. QLD GCBF 2025 Round 125 (Standard)
  INSERT INTO grants (name, provider, grant_type_id, amount_max, pool_value, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, results_available, notes)
  VALUES ('QLD Gambling Community Benefit Fund 2025 Round 125 (Standard Grant Round)', 'Justice Queensland', gt_state, 100000, 60000000, '2025-09-19', '2025-12-15', 'closed', 'https://www.justice.qld.gov.au/initiatives/community-grants', 'We can apply ourselves', true, 'Annual / bi-annual', 'Yes', 'Will reopen mid-September. Accepts reapplication. Requires referrals.')
  RETURNING id INTO grant_gcbf_125;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_gcbf_125, 'QLD');

  -- 7. SCGP 25-26 Category 2: Volunteers and Officials
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, guidelines_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('Sporting Club Grants Program 25-26 Category 2: Volunteers and Officials', 'SCGP Cat 2', 'SRV', gt_state, 1000, '2025-10-23', '2025-11-26', 'closed', 'https://sport.vic.gov.au/funding/sporting-club-grants-program', 'https://sport.vic.gov.au/__data/assets/pdf_file/0014/2432012/2025-26-Sporting-Club-Grants-Program-Guidelines.pdf', 'Sport and Recreation Victoria', 'https://grants.business.vic.gov.au/', 'We can apply ourselves', true, 'Annual', 'None', 'Expected', 'Round 2: Opens 10 Feb 2026, Closes 18 Mar 2026. Outcomes May 2026.')
  RETURNING id INTO grant_scgp_vol;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_scgp_vol, 'VIC');

  -- 8. SCGP 25/26 Rd1 Category 1: Uniforms and Equipment
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, guidelines_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('Sporting Club Grants Program 25/26 Rd1 Category 1: Uniforms and Equipment', 'SCGP Cat 1', 'SRV', gt_state, 5000, '2025-10-23', '2025-11-26', 'closed', 'https://sport.vic.gov.au/funding/sporting-club-grants-program', 'https://sport.vic.gov.au/__data/assets/pdf_file/0014/2432012/2025-26-Sporting-Club-Grants-Program-Guidelines.pdf', 'Sport and Recreation Victoria', 'https://grants.business.vic.gov.au/', 'We can apply ourselves', true, 'Annual', 'None', 'Expected', 'Round 2: Opens 10 Feb 2026, Closes 18 Mar 2026. Outcomes May 2026.')
  RETURNING id INTO grant_scgp_uni;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_scgp_uni, 'VIC');

  -- 9. SCGP 25-26 Category 4: Travel
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, guidelines_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('Sporting Club Grants Program 25-26 Category 4: Travel', 'SCGP Cat 4', 'SRV', gt_state, 750, '2025-10-23', '2025-11-26', 'closed', 'https://sport.vic.gov.au/funding/sporting-club-grants-program', 'https://sport.vic.gov.au/__data/assets/pdf_file/0014/2432012/2025-26-Sporting-Club-Grants-Program-Guidelines.pdf', 'Sport and Recreation Victoria', 'https://grants.business.vic.gov.au/', 'We can apply ourselves', true, 'Annual', 'None', 'Expected', 'Round 2: Opens 10 Feb 2026, Closes 18 Mar 2026. Outcomes May 2026.')
  RETURNING id INTO grant_scgp_travel;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_scgp_travel, 'VIC');

  -- 10. SCGP 25-26 Category 5: Governance and Engagement
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, guidelines_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('Sporting Club Grants Program 25-26 Category 5: Governance and Engagement', 'SCGP Cat 5', 'SRV', gt_state, 1500, '2025-10-23', '2025-11-26', 'closed', 'https://sport.vic.gov.au/funding/sporting-club-grants-program', 'https://sport.vic.gov.au/__data/assets/pdf_file/0014/2432012/2025-26-Sporting-Club-Grants-Program-Guidelines.pdf', 'Sport and Recreation Victoria', 'https://grants.business.vic.gov.au/', 'We can apply ourselves', true, 'Annual', 'None', 'Expected', 'Round 2: Opens 10 Feb 2026, Closes 18 Mar 2026. Outcomes May 2026.')
  RETURNING id INTO grant_scgp_gov;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_scgp_gov, 'VIC');

  -- 11. NSW Clubgrants Category 3
  INSERT INTO grants (name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, guidelines_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, results_available)
  VALUES ('NSW Clubgrants Category 3: Infrastructure Grants | Sport and Recreation Round 2 2025-26', 'Office of Responsible Gambling (NSW)', gt_state, 300000, '2025-11-24', '2025-12-15', 'closed', 'https://www.nsw.gov.au/grants-and-funding/clubgrants-infrastructure-sport', 'https://www.nsw.gov.au/grants-and-funding/clubgrants-category-3-fund/clubgrants-infrastructure-sport#program-guide', 'NSW Government', 'https://fundingorg.smapply.io/', 'We can apply ourselves', true, 'Annual', 'Yes')
  RETURNING id INTO grant_clubgrants;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_clubgrants, 'NSW');

  -- 12. SRV LSIF 2025/26: Indoor Stadiums/Aquatic Facilities Stream
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, results_available, notes)
  VALUES ('SRV Local Sport Infrastructure Fund 2025/26: Indoor Stadiums/Aquatic Facilities Stream', 'LSIF Indoor', 'SRV', gt_state, 2500000, '2025-09-02', '2025-12-02', 'closed', 'https://sport.vic.gov.au/funding/local-sports-infrastructure-fund', 'We can apply ourselves', true, 'Annual', 'Yes', 'Recently announced')
  RETURNING id INTO grant_lsif_indoor;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_lsif_indoor, 'VIC');

  -- 13. SRV LSIF 2025/26: Female Friendly Facilities Stream
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available)
  VALUES ('SRV Local Sport Infrastructure Fund 2025/26: Female Friendly Facilities Stream', 'LSIF Female', 'SRV', gt_state, 1000000, '2025-09-02', '2025-12-02', 'closed', 'https://sport.vic.gov.au/funding/local-sports-infrastructure-fund', 'We can apply ourselves', true, 'Annual', '1:1 Funding Co-contribution Ratio Required', 'Yes')
  RETURNING id INTO grant_lsif_female;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_lsif_female, 'VIC');

  -- 14. SRV LSIF 2025/26: Community Facilities Stream
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available)
  VALUES ('SRV Local Sport Infrastructure Fund 2025/26: Community Facilities Stream', 'LSIF Community', 'SRV', gt_state, 300000, '2025-09-02', '2025-12-02', 'closed', 'https://sport.vic.gov.au/funding/local-sports-infrastructure-fund', 'We can apply ourselves', true, 'Annual', '1:1 Funding Co-contribution Ratio Required', 'Yes')
  RETURNING id INTO grant_lsif_community;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_lsif_community, 'VIC');

  -- 15. SRV LSIF 2025/26: Community Sports Lighting
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('SRV Local Sport Infrastructure Fund 2025/26: Community Sports Lighting', 'LSIF Lighting', 'SRV', gt_state, 250000, '2025-09-02', '2025-12-02', 'closed', 'https://sport.vic.gov.au/funding/local-sports-infrastructure-fund', 'We can apply ourselves', true, 'Annual', '1:1 Funding Co-contribution Ratio Required', 'Yes', 'Specifically for LED Lighting')
  RETURNING id INTO grant_lsif_lighting;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_lsif_lighting, 'VIC');

  -- 16. SRV LSIF 2025/26: Planning
  INSERT INTO grants (name, short_name, provider, grant_type_id, amount_max, open_date, close_date, status, application_url, apply_via, is_recurring, grant_frequency, co_contribution, results_available, notes)
  VALUES ('SRV Local Sport Infrastructure Fund 2025/26: Planning', 'LSIF Planning', 'SRV', gt_state, 30000, '2025-09-02', '2025-12-02', 'closed', 'https://sport.vic.gov.au/funding/local-sports-infrastructure-fund', 'We can apply ourselves', true, 'Annual', '1:1 Funding Co-contribution Ratio Required', 'Yes', 'Can fund facility plans and strategic planning')
  RETURNING id INTO grant_lsif_planning;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_lsif_planning, 'VIC');

  -- 17. QLD GCBF 2026 Round 126 (Standard) — OPEN
  INSERT INTO grants (name, provider, grant_type_id, amount_max, pool_value, open_date, close_date, status, application_url, application_system, application_login_url, apply_via, is_recurring, grant_frequency, results_available, notes)
  VALUES ('QLD Gambling Community Benefit Fund 2026 Round 126 (Standard)', 'Justice Queensland', gt_state, 35000, 60000000, '2026-01-13', '2026-02-28', 'open', 'https://www.justice.qld.gov.au/initiatives/community-grants', 'QLD Government', 'https://www.gamblingcommunityfund.qld.gov.au/#/signin', 'We can apply ourselves', true, 'Annual / bi-annual', 'Yes', 'Requires referrals')
  RETURNING id INTO grant_gcbf_126;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_gcbf_126, 'QLD');

  -- 18. QLD GCBF 2025 Round 124 (Super Round)
  INSERT INTO grants (name, provider, grant_type_id, amount_max, pool_value, close_date, status, application_url, apply_via, is_recurring, grant_frequency, results_available, notes)
  VALUES ('QLD Gambling Community Benefit Fund 2025 Round 124 (Super Round)', 'Justice Queensland', gt_state, 100000, 60000000, '2025-10-31', 'closed', 'https://www.justice.qld.gov.au/initiatives/community-grants', 'We can apply ourselves', true, 'Annual / bi-annual', 'Yes', 'Accepts reapplication. Requires referrals.')
  RETURNING id INTO grant_gcbf_124;
  INSERT INTO grant_eligible_states (grant_id, state) VALUES (grant_gcbf_124, 'QLD');

  -- ══════════════════════════════════════════════════════════
  -- GRANT APPLICATIONS (6 total from Grants Master)
  -- ══════════════════════════════════════════════════════════

  -- Southern Vikings App 1: SCGP Cat 2 (Access and events) — Lodged
  INSERT INTO grant_applications (
    club_id, grant_id, application_status, amount_requested, submitted_at,
    assigned_gp_team_id, account_manager_id, grant_writer_id, reviewer_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status,
    project_description, forecasted_success_fee, probability_of_success, success_fee_amount,
    outcome_expected_date, application_reference, hubspot_deal_id
  ) VALUES (
    club_vikings, grant_scgp_vol, 'submitted', 1868.98, '2025-11-26',
    ae_ankur, ae_ankur, ae_ankur, reviewer_dennis,
    'loaded', 'loaded', 'approved', 'lodged', 'pending', 'lodged', 'pending',
    'Access and events', 355.35, 0.50, 75,
    '2026-02-01', 'GA-F4779183-2086', '48441600591'
  );

  -- Southern Vikings App 2: SCGP Uniforms — Lodged
  INSERT INTO grant_applications (
    club_id, grant_id, application_status, amount_requested, submitted_at,
    assigned_gp_team_id, account_manager_id, grant_writer_id, reviewer_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status,
    project_description, forecasted_success_fee, probability_of_success, success_fee_amount,
    outcome_expected_date, application_reference, hubspot_deal_id
  ) VALUES (
    club_vikings, grant_scgp_uni, 'submitted', 1000, '2025-11-26',
    ae_ankur, ae_ankur, ae_ankur, reviewer_dennis,
    'loaded', 'loaded', 'approved', 'lodged', 'pending', 'lodged', 'pending',
    'Uniforms', 225, 0.50, 75,
    '2026-02-01', 'GA-F4779101-9571', '48441600591'
  );

  -- Southern Vikings App 3: LSIF — Did not lodge (maps to any LSIF stream)
  INSERT INTO grant_applications (
    club_id, grant_id, application_status,
    assigned_gp_team_id, account_manager_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status, preparation_status,
    forecasted_success_fee, probability_of_success, hubspot_deal_id
  ) VALUES (
    club_vikings, grant_lsif_community, 'dnl',
    ae_ankur, ae_ankur,
    'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'complete',
    75, 0.50, '43664909627'
  );

  -- Coraki App 1: NSW Clubgrants — Did not lodge
  INSERT INTO grant_applications (
    club_id, grant_id, application_status,
    assigned_gp_team_id, account_manager_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status,
    forecasted_success_fee, probability_of_success, outcome_expected_date, hubspot_deal_id
  ) VALUES (
    club_coraki, grant_clubgrants, 'dnl',
    ae_pranav, ae_pranav,
    'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending',
    75, 0.50, '2026-03-31', '43458251843'
  );

  -- Coraki App 2: Richmond Valley CFAP — Drafting
  INSERT INTO grant_applications (
    club_id, grant_id, application_status,
    assigned_gp_team_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status,
    forecasted_success_fee, probability_of_success, hubspot_deal_id
  ) VALUES (
    club_coraki, grant_rv_cfap, 'in_progress',
    ae_pranav,
    'wip', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending',
    75, 0.50, '43402464276'
  );

  -- Wanderers App 1: QLD GCBF R126 — Being prepared
  INSERT INTO grant_applications (
    club_id, grant_id, application_status,
    assigned_gp_team_id, account_manager_id,
    drafting_status, attachment_status, review_status, lodgment_status, invoice_status, outcome_status, acquittal_status,
    forecasted_success_fee, probability_of_success
  ) VALUES (
    club_wanderers, grant_gcbf_126, 'in_progress',
    ae_jacob, ae_ankur,
    'pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending',
    75, 0.50
  );

END $$;

-- ============================================================
-- VERIFY:
-- SELECT count(*) FROM gp_team;                    -- 22+ (plus your own admin)
-- SELECT count(*) FROM sports;                     -- 15
-- SELECT count(*) FROM grant_types;                -- 5
-- SELECT count(*) FROM wishlist_categories;        -- 7
-- SELECT count(*) FROM wishlist_items;             -- 59
-- SELECT count(*) FROM clubs;                      -- 3
-- SELECT count(*) FROM club_contacts;              -- 2 (Vikings + Coraki)
-- SELECT count(*) FROM club_wishlist_selections;   -- ~99
-- SELECT count(*) FROM grants;                     -- 18
-- SELECT count(*) FROM grant_eligible_states;      -- 18
-- SELECT count(*) FROM grant_applications;         -- 6
-- ============================================================