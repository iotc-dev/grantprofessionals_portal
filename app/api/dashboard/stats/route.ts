// app/api/dashboard/stats/route.ts
// Dashboard analytics — stats, pipeline, closing soon, attention clubs, activity

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearStart = `${currentYear}-01-01`;

    // ── 1. Total Clubs ──
    const { count: totalClubs } = await supabase
      .from("clubs")
      .select("*", { count: "exact", head: true });

    // ── 2. Active Grants (open, not past close date) ──
    const { count: activeGrants } = await supabase
      .from("grants")
      .select("*", { count: "exact", head: true })
      .eq("status", "open")
      .gte("close_date", now.toISOString().split("T")[0]);

    // ── 3. Closing Soon (next 14 days) ──
    const closingSoonDate = new Date(now);
    closingSoonDate.setDate(closingSoonDate.getDate() + 14);
    const todayStr = now.toISOString().split("T")[0];
    const closingSoonStr = closingSoonDate.toISOString().split("T")[0];

    const { data: closingSoonGrants } = await supabase
      .from("grants")
      .select(`
        id, name, provider, close_date,
        grant_applications(id, application_status)
      `)
      .eq("status", "open")
      .gte("close_date", todayStr)
      .lte("close_date", closingSoonStr)
      .order("close_date", { ascending: true })
      .limit(10);

    // ── 4. Total Applications (active — exclude won/lost/dnl) ──
    const activeStatuses = [
      "open_match", "proceeding", "new", "preparation", "drafting",
      "attachments", "review", "lodgment", "outcome", "acquittal",
    ];
    const { count: totalApplications } = await supabase
      .from("grant_applications")
      .select("*", { count: "exact", head: true })
      .in("application_status", activeStatuses);

    // ── 5. Pipeline Counts ──
    const { data: allApps } = await supabase
      .from("grant_applications")
      .select("application_status")
      .in("application_status", activeStatuses);

    const pipelineCounts: Record<string, number> = {};
    (allApps || []).forEach((app) => {
      pipelineCounts[app.application_status] = (pipelineCounts[app.application_status] || 0) + 1;
    });

    // ── 6. Pending Items Count ──
    const { count: pendingItems } = await supabase
      .from("pending_items")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // ── 7. Won / Lost This Year ──
    const { count: wonThisYear } = await supabase
      .from("grant_applications")
      .select("*", { count: "exact", head: true })
      .eq("application_status", "won")
      .gte("outcome_date", yearStart);

    const { count: lostThisYear } = await supabase
      .from("grant_applications")
      .select("*", { count: "exact", head: true })
      .eq("application_status", "lost")
      .gte("outcome_date", yearStart);

    // ── 8. Total Won Amount This Year ──
    const { data: wonApps } = await supabase
      .from("grant_applications")
      .select("amount_won")
      .eq("application_status", "won")
      .gte("outcome_date", yearStart);

    const totalWonRaw = (wonApps || []).reduce((sum, a) => sum + (parseFloat(a.amount_won) || 0), 0);
    const totalWonAmount = totalWonRaw >= 1000
      ? `$${(totalWonRaw / 1000).toFixed(totalWonRaw % 1000 === 0 ? 0 : 1)}k`
      : `$${totalWonRaw.toLocaleString("en-AU")}`;

    // ── 9. Closing Soon Grants (formatted) ──
    const closingSoonFormatted = (closingSoonGrants || []).map((g: any) => {
      const closeDate = new Date(g.close_date + "T00:00:00");
      const daysLeft = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const apps = g.grant_applications || [];
      return {
        id: g.id,
        name: g.name,
        provider: g.provider,
        closeDate: g.close_date,
        closeDateFormatted: closeDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
        daysLeft,
        applicationCount: apps.length,
        pendingCount: 0, // Would need a join to pending_items for accuracy
      };
    });

    // ── 10. Clubs Needing Attention (with pending items) ──
    const { data: clubsWithPending } = await supabase
      .from("clubs")
      .select(`
        id, legal_entity_name, shortened_name, plan_type, updated_at,
        grant_applications!inner(
          id, application_status,
          pending_items!inner(id, status)
        )
      `)
      .eq("grant_applications.pending_items.status", "pending")
      .limit(10);

    const attentionClubs: AttentionClub[] = [];
    const seenClubIds = new Set<string>();

    (clubsWithPending || []).forEach((club: any) => {
      if (seenClubIds.has(club.id)) return;
      seenClubIds.add(club.id);

      let pendingCount = 0;
      const activeAppIds = new Set<string>();

      (club.grant_applications || []).forEach((app: any) => {
        activeAppIds.add(app.id);
        (app.pending_items || []).forEach((item: any) => {
          if (item.status === "pending") pendingCount++;
        });
      });

      if (pendingCount > 0) {
        const name = club.shortened_name || club.legal_entity_name;
        const words = name.split(" ");
        const initials = words.length >= 2
          ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

        const updatedAt = new Date(club.updated_at);
        const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const lastActive = diffDays === 0 ? "today" : diffDays === 1 ? "yesterday" : `${diffDays}d ago`;

        attentionClubs.push({
          id: club.id,
          name: club.legal_entity_name,
          shortName: name,
          initials,
          plan: club.plan_type || "GRP",
          pendingItems: pendingCount,
          activeApps: activeAppIds.size,
          lastActive,
        });
      }
    });

    // Sort by most pending items first
    attentionClubs.sort((a, b) => b.pendingItems - a.pendingItems);

    // ── 11. Recent Activity (latest updated applications) ──
    const { data: recentApps } = await supabase
      .from("grant_applications")
      .select(`
        id, application_status, interest_status, updated_at,
        clubs(shortened_name, legal_entity_name),
        grants(name)
      `)
      .order("updated_at", { ascending: false })
      .limit(8);

    const recentActivity: ActivityItem[] = (recentApps || []).map((app: any) => {
      const clubName = app.clubs?.shortened_name || app.clubs?.legal_entity_name || "Unknown Club";
      const words = clubName.split(" ");
      const initials = words.length >= 2
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : clubName.substring(0, 2).toUpperCase();

      const updatedAt = new Date(app.updated_at);
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      const timeAgo = diffMins < 60 ? `${diffMins}m ago` : diffHrs < 24 ? `${diffHrs}h ago` : `${diffDays}d ago`;

      let type: "status_change" | "interest" | "pending_item" | "outcome" = "status_change";
      let description = `Status: ${formatStatus(app.application_status)}`;

      if (app.application_status === "won" || app.application_status === "lost") {
        type = "outcome";
        description = app.application_status === "won" ? "Grant application won!" : "Grant application unsuccessful";
      } else if (app.interest_status) {
        type = "interest";
        description = `Club expressed: ${app.interest_status.replace("_", " ")}`;
      }

      return {
        id: app.id,
        type,
        clubName,
        clubInitials: initials,
        grantName: app.grants?.name || "Unknown Grant",
        description,
        timestamp: app.updated_at,
        timeAgo,
      };
    });

    return NextResponse.json({
      totalClubs: totalClubs ?? 0,
      activeGrants: activeGrants ?? 0,
      closingSoon: closingSoonFormatted.length,
      totalApplications: totalApplications ?? 0,
      pendingItems: pendingItems ?? 0,
      wonThisYear: wonThisYear ?? 0,
      lostThisYear: lostThisYear ?? 0,
      totalWonAmount,
      pipelineCounts,
      closingSoonGrants: closingSoonFormatted,
      clubsNeedingAttention: attentionClubs.slice(0, 8),
      recentActivity,
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ── Helpers ──

interface AttentionClub {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  plan: string;
  pendingItems: number;
  activeApps: number;
  lastActive: string;
}

interface ActivityItem {
  id: string;
  type: string;
  clubName: string;
  clubInitials: string;
  grantName: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}