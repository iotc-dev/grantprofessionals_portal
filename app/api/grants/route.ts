// app/api/grants/route.ts
// Server-side grants API with search, filter, sort, pagination

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
    const status = url.get("status") || ""; // "open" | "closed" | "draft"
    const grantType = url.get("grant_type") || ""; // grant_type name
    const sort = url.get("sort") || "close_date";
    const order = url.get("order") === "asc" ? true : false; // default desc (soonest closing first)

    // ── Build query ──
    let query = supabase
      .from("grants")
      .select(`
        id,
        name,
        provider,
        program_name,
        amount_min,
        amount_max,
        open_date,
        close_date,
        status,
        application_url,
        is_active,
        grant_type:grant_types(name),
        grant_eligible_states(state)
      `, { count: "exact" });

    // Only show active grants by default
    query = query.eq("is_active", true);

    // ── Filters ──

    if (search) {
      query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%,program_name.ilike.%${search}%`);
    }

    if (status === "open") {
      query = query.eq("status", "open");
    } else if (status === "closed") {
      query = query.eq("status", "closed");
    } else if (status === "draft") {
      query = query.eq("status", "draft");
    }

    if (grantType) {
      query = query.eq("grant_type.name", grantType);
    }

    // ── Sort ──
    const sortMap: Record<string, string> = {
      name: "name",
      close_date: "close_date",
      closeDate: "close_date",
      open_date: "open_date",
      openDate: "open_date",
      status: "status",
      amount: "amount_max",
    };
    const sortColumn = sortMap[sort] || "close_date";
    query = query.order(sortColumn, { ascending: order, nullsFirst: false });

    // ── Pagination ──
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // ── Execute ──
    const { data: grantsData, error: grantsError, count } = await query;

    if (grantsError) {
      console.error("Grants query error:", grantsError);
      return NextResponse.json({ error: grantsError.message }, { status: 500 });
    }

    // ── Get application counts for these grants ──
    const grantIds = (grantsData || []).map((g: any) => g.id);
    const appCountMap = new Map<string, number>();

    if (grantIds.length > 0) {
      const { data: appData } = await supabase
        .from("grant_applications")
        .select("grant_id")
        .in("grant_id", grantIds);

      (appData || []).forEach((app: any) => {
        appCountMap.set(app.grant_id, (appCountMap.get(app.grant_id) || 0) + 1);
      });
    }

    // ── Transform response ──
    const today = new Date();
    const closingSoonDays = 14; // grants closing within 14 days

    const grants = (grantsData || []).map((grant: any) => {
      // Format amount
      let amount = "—";
      if (grant.amount_min && grant.amount_max) {
        if (grant.amount_min === grant.amount_max) {
          amount = formatCurrency(grant.amount_max);
        } else {
          amount = `${formatCurrency(grant.amount_min)} – ${formatCurrency(grant.amount_max)}`;
        }
      } else if (grant.amount_max) {
        amount = `Up to ${formatCurrency(grant.amount_max)}`;
      } else if (grant.amount_min) {
        amount = `From ${formatCurrency(grant.amount_min)}`;
      }

      // Check closing soon
      const closeDate = grant.close_date ? new Date(grant.close_date) : null;
      const closingSoon = closeDate
        ? (closeDate.getTime() - today.getTime()) / 86400000 <= closingSoonDays && closeDate > today
        : false;

      // Eligible states
      const states = (grant.grant_eligible_states || []).map((s: any) => s.state);

      // Extract link domain
      let linkDomain = "";
      if (grant.application_url) {
        try {
          linkDomain = new URL(grant.application_url).hostname.replace("www.", "");
        } catch {
          linkDomain = grant.application_url;
        }
      }

      return {
        id: grant.id,
        name: grant.name,
        provider: grant.provider || "—",
        programName: grant.program_name || "",
        grantType: grant.grant_type?.name || "—",
        amount,
        amountMax: grant.amount_max,
        openDate: grant.open_date,
        closeDate: grant.close_date,
        closingSoon,
        status: grant.status,
        applicationUrl: grant.application_url || "",
        linkDomain,
        states,
        applicationCount: appCountMap.get(grant.id) || 0,
      };
    });

    return NextResponse.json({
      grants,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch (err: any) {
    console.error("Grants API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}