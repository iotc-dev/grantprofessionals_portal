// app/api/clubs/route.ts
// Server-side clubs API with search, filter, sort, pagination
// All filtering happens at the database level for 2k+ clubs

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const url = request.nextUrl.searchParams;

    // Parse query params
    const page = Math.max(1, parseInt(url.get("page") || "1"));
    const perPage = Math.min(50, Math.max(1, parseInt(url.get("per_page") || "10")));
    const search = url.get("search")?.trim() || "";
    const state = url.get("state") || "";
    const plan = url.get("plan") || "";
    const status = url.get("status") || ""; // "active" | "inactive"
    const ae = url.get("ae") || ""; // AE user id
    const sort = url.get("sort") || "shortened_name";
    const order = url.get("order") === "desc" ? false : true; // true = ascending

    // ── Build the query ──
    // We need a count query and a data query
    // Supabase supports count with the same query

    let query = supabase
      .from("clubs")
      .select(`
        id,
        shortened_name,
        legal_entity_name,
        subscription_active,
        updated_at,
        subscription_plan:subscription_plans(code),
        account_executive:gp_team!clubs_account_executive_id_fkey(id, full_name),
        club_addresses!inner(state, local_government_area),
        club_sports(sport:sports(name))
      `, { count: "exact" });

    // ── Filters ──

    // Search: match on shortened_name or legal_entity_name
    if (search) {
      query = query.or(`shortened_name.ilike.%${search}%,legal_entity_name.ilike.%${search}%`);
    }

    // State filter (via club_addresses)
    if (state) {
      query = query.eq("club_addresses.state", state);
    }

    // Plan filter (via subscription_plans)
    if (plan) {
      query = query.eq("subscription_plan.code", plan);
    }

    // Status filter
    if (status === "active") {
      query = query.eq("subscription_active", true);
    } else if (status === "inactive") {
      query = query.eq("subscription_active", false);
    }

    // AE filter
    if (ae) {
      query = query.eq("account_executive_id", ae);
    }

    // ── Sort ──
    const sortMap: Record<string, string> = {
      name: "shortened_name",
      shortened_name: "shortened_name",
      plan: "subscription_plan.code",
      state: "club_addresses.state",
      apps: "shortened_name", // fallback — app count sort needs a DB view/function
      lastActive: "updated_at",
      updated_at: "updated_at",
    };
    const sortColumn = sortMap[sort] || "shortened_name";

    // For simple columns, use .order() directly
    if (!sortColumn.includes(".")) {
      query = query.order(sortColumn, { ascending: order });
    } else {
      // For related table sorts, fall back to name
      query = query.order("shortened_name", { ascending: order });
    }

    // ── Pagination ──
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // ── Execute ──
    const { data: clubsData, error: clubsError, count } = await query;

    if (clubsError) {
      console.error("Clubs query error:", clubsError);
      return NextResponse.json(
        { error: clubsError.message },
        { status: 500 }
      );
    }

    // ── Get application counts for these clubs ──
    const clubIds = (clubsData || []).map((c: any) => c.id);

    let appCountMap = new Map<string, number>();
    if (clubIds.length > 0) {
      const { data: appData } = await supabase
        .from("grant_applications")
        .select("club_id")
        .in("club_id", clubIds);

      (appData || []).forEach((app: any) => {
        appCountMap.set(app.club_id, (appCountMap.get(app.club_id) || 0) + 1);
      });
    }

    // ── Transform response ──
    const clubs = (clubsData || []).map((club: any) => {
      const name = club.shortened_name || club.legal_entity_name || "Unnamed Club";
      const addr = club.club_addresses?.[0];
      const sportName = club.club_sports?.[0]?.sport?.name || "—";
      const planCode = club.subscription_plan?.code || "—";
      const aeName = club.account_executive?.full_name || "Unassigned";
      const aeId = club.account_executive?.id || null;

      return {
        id: club.id,
        name,
        sport: sportName,
        lga: addr?.local_government_area || "—",
        plan: planCode,
        ae: { id: aeId, name: aeName },
        state: addr?.state || "—",
        subscriptionActive: club.subscription_active,
        apps: appCountMap.get(club.id) || 0,
        updatedAt: club.updated_at,
      };
    });

    return NextResponse.json({
      clubs,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch (err: any) {
    console.error("Clubs API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}