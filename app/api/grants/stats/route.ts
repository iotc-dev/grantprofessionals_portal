// app/api/grants/stats/route.ts
// Lightweight count queries for grants stat cards

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const soonDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    const [openRes, appsRes, closingSoonRes, clubsInterestedRes] = await Promise.all([
      // Open grants
      supabase.from("grants").select("*", { count: "exact", head: true })
        .eq("status", "open").eq("is_active", true),
      // Total applications
      supabase.from("grant_applications").select("*", { count: "exact", head: true }),
      // Closing soon (open + close_date within 14 days)
      supabase.from("grants").select("*", { count: "exact", head: true })
        .eq("status", "open").eq("is_active", true)
        .gte("close_date", today).lte("close_date", soonDate),
      // Distinct clubs with applications
      supabase.from("grant_applications").select("club_id"),
    ]);

    // Count distinct clubs
    const distinctClubs = new Set((clubsInterestedRes.data || []).map((a: any) => a.club_id));

    return NextResponse.json({
      openGrants: openRes.count || 0,
      totalApplications: appsRes.count || 0,
      closingSoon: closingSoonRes.count || 0,
      clubsInterested: distinctClubs.size,
    });
  } catch (err: any) {
    console.error("Grants stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}