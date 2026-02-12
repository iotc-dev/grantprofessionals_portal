// app/api/clubs/[id]/route.ts
// Fetch single club with full profile data

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // ── Club core data ──
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select(`
        id,
        abn,
        legal_entity_name,
        shortened_name,
        entity_type,
        subscription_active,
        code_version,
        created_at,
        updated_at,
        subscription_plan:subscription_plans(code, name),
        account_executive:gp_team!clubs_account_executive_id_fkey(id, full_name, email),
        account_manager:gp_team!clubs_account_manager_id_fkey(id, full_name),
        bdm:gp_team!clubs_bdm_id_fkey(id, full_name)
      `)
      .eq("id", id)
      .single();

    if (clubError || !club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // ── Parallel queries for related data ──
    const [
      addressesRes,
      contactsRes,
      sportsRes,
      profileRes,
      wishlistRes,
      financialsRes,
      appsCountRes,
      pendingCountRes,
    ] = await Promise.all([
      supabase.from("club_addresses").select("*").eq("club_id", id),
      supabase.from("club_contacts").select("*").eq("club_id", id).order("contact_type"),
      supabase.from("club_sports").select("sport:sports(id, name)").eq("club_id", id),
      supabase.from("club_profiles").select("*").eq("club_id", id).maybeSingle(),
      supabase
        .from("club_wishlist_selections")
        .select("wishlist_item:wishlist_items(id, name, category:wishlist_categories(name))")
        .eq("club_id", id),
      supabase.from("club_financials").select("*").eq("club_id", id).maybeSingle(),
      supabase.from("grant_applications").select("*", { count: "exact", head: true }).eq("club_id", id),
      supabase.from("pending_items").select("id, grant_application:grant_applications!inner(club_id)").eq("grant_application.club_id", id).eq("status", "pending"),
    ]);

    // ── Build addresses map ──
    const addresses: Record<string, any> = {};
    (addressesRes.data || []).forEach((addr: any) => {
      addresses[addr.address_type] = addr;
    });

    // ── Build contacts ──
    const contacts: Record<string, any> = {};
    (contactsRes.data || []).forEach((contact: any) => {
      contacts[contact.contact_type] = contact;
    });

    // ── Sports list ──
    const sports = (sportsRes.data || []).map((s: any) => s.sport?.name).filter(Boolean);

    // ── Wishlist grouped by category ──
    const wishlistMap: Record<string, string[]> = {};
    (wishlistRes.data || []).forEach((sel: any) => {
      const catName = sel.wishlist_item?.category?.name || "Other";
      const itemName = sel.wishlist_item?.name;
      if (itemName) {
        if (!wishlistMap[catName]) wishlistMap[catName] = [];
        wishlistMap[catName].push(itemName);
      }
    });

    // ── Primary address for header ──
    const primaryAddr = addresses["organisation"] || addresses["postal"] || Object.values(addresses)[0];

    // ── Build initials ──
    const name = club.shortened_name || club.legal_entity_name;
    const words = name.split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

    return NextResponse.json({
      id: club.id,
      name: club.legal_entity_name,
      shortName: club.shortened_name,
      initials,
      abn: club.abn,
      entityType: club.entity_type,
      plan: club.subscription_plan?.code || "—",
      planLabel: club.subscription_plan?.name || "—",
      subscriptionActive: club.subscription_active,
      createdAt: club.created_at,

      // Location
      state: primaryAddr?.state || "—",
      lga: primaryAddr?.local_government_area || "—",
      sport: sports.join(", ") || "—",

      // People
      ae: club.account_executive?.full_name || "—",
      am: club.account_manager?.full_name || null,
      bdm: club.bdm?.full_name || null,

      // Contacts
      primaryContact: contacts["primary"] ? {
        name: `${contacts["primary"].first_name} ${contacts["primary"].last_name}`,
        position: contacts["primary"].position || "—",
        email: contacts["primary"].email || "—",
        mobile: contacts["primary"].mobile || "—",
        isAuthorized: contacts["primary"].is_authorized_contact,
      } : null,
      secondaryContact: contacts["secondary"] ? {
        name: `${contacts["secondary"].first_name} ${contacts["secondary"].last_name}`,
        position: contacts["secondary"].position || "—",
        email: contacts["secondary"].email || "—",
        mobile: contacts["secondary"].mobile || "—",
        isAuthorized: contacts["secondary"].is_authorized_contact,
      } : null,

      // Addresses
      addresses: {
        organisation: addresses["organisation"] ? formatAddress(addresses["organisation"]) : null,
        postal: addresses["postal"] ? formatAddress(addresses["postal"]) : null,
        activity: addresses["activity"] ? formatAddress(addresses["activity"]) : null,
      },

      // Profile
      about: profileRes.data?.about || null,
      purpose: profileRes.data?.purpose || null,
      yearEstablished: profileRes.data?.year_established || null,
      totalMembers: profileRes.data?.total_members || null,
      activeVolunteers: profileRes.data?.active_volunteers || null,
      website: profileRes.data?.website || null,
      facebook: profileRes.data?.facebook_url || null,
      instagram: profileRes.data?.instagram_url || null,

      // Financial
      gstRegistered: financialsRes.data?.gst_registered ?? null,
      dgrStatus: financialsRes.data?.dgr_status ?? null,
      acncRegistered: financialsRes.data?.acnc_registered ?? null,
      previousGrantFunding: financialsRes.data?.previous_grant_funding ?? null,
      outstandingAcquittals: financialsRes.data?.outstanding_acquittals ?? null,

      // Wishlist
      wishlist: wishlistMap,

      // Counts
      applicationCount: appsCountRes.count || 0,
      pendingItemCount: pendingCountRes.data?.length || 0,
    });
  } catch (err: any) {
    console.error("Club profile API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function formatAddress(addr: any): string {
  const parts = [
    addr.street_address,
    addr.suburb,
    addr.state,
    addr.postcode,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  // Fallback: just show state + LGA
  return [addr.local_government_area, addr.state].filter(Boolean).join(", ");
}