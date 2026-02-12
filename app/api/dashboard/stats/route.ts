// app/api/dashboard/stats/route.ts
// Lightweight count queries for dashboard stat cards

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Run all count queries in parallel
    const [totalRes, activeRes, pendingRes, appsRes, grantsOpenRes] = await Promise.all([
      supabase.from("clubs").select("*", { count: "exact", head: true }),
      supabase.from("clubs").select("*", { count: "exact", head: true }).eq("subscription_active", true),
      supabase.from("pending_items").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("grant_applications").select("*", { count: "exact", head: true }),
      supabase.from("grants").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);

    return NextResponse.json({
      totalClubs: totalRes.count || 0,
      activeClubs: activeRes.count || 0,
      pendingItems: pendingRes.count || 0,
      totalApplications: appsRes.count || 0,
      openGrants: grantsOpenRes.count || 0,
      needAttention: (totalRes.count || 0) - (activeRes.count || 0),
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}