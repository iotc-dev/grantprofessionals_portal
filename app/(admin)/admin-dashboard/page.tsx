// app/(admin)/admin-dashboard/page.tsx
// Analytics dashboard — summary stats, pipeline breakdown, activity feeds

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatsGrid } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/ui/badge";
import { ClubAvatar } from "@/components/ui/avatar";

// ═══════════════════════════════════
// TYPES
// ═══════════════════════════════════

interface DashboardStats {
  totalClubs: number;
  activeGrants: number;
  closingSoon: number;
  totalApplications: number;
  pendingItems: number;
  wonThisYear: number;
  lostThisYear: number;
  totalWonAmount: string;
  pipelineCounts: Record<string, number>;
  recentActivity: ActivityItem[];
  closingSoonGrants: ClosingSoonGrant[];
  clubsNeedingAttention: AttentionClub[];
}

interface ActivityItem {
  id: string;
  type: "status_change" | "interest" | "pending_item" | "outcome";
  clubName: string;
  clubInitials: string;
  grantName: string;
  description: string;
  timestamp: string;
  timeAgo: string;
}

interface ClosingSoonGrant {
  id: string;
  name: string;
  provider: string;
  closeDate: string;
  closeDateFormatted: string;
  daysLeft: number;
  applicationCount: number;
  pendingCount: number;
}

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

// ═══════════════════════════════════
// DATA HOOK
// ═══════════════════════════════════

function useDashboardData() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ═══════════════════════════════════
// PIPELINE STAGE CONFIG
// ═══════════════════════════════════

const PIPELINE_STAGES = [
  { key: "open_match",  label: "Open Match",  color: "bg-[#FEF3C7]", text: "text-[#92400E]",  dot: "bg-[#F59E0B]" },
  { key: "proceeding",  label: "Proceeding",   color: "bg-warning-light", text: "text-[#9A3412]", dot: "bg-warning" },
  { key: "preparation", label: "Preparation",  color: "bg-[#F3E8FF]", text: "text-[#7C3AED]",  dot: "bg-[#7C3AED]" },
  { key: "drafting",    label: "Drafting",      color: "bg-[#FFF7ED]", text: "text-[#C2410C]",  dot: "bg-[#C2410C]" },
  { key: "attachments", label: "Attachments",   color: "bg-[#FEF3C7]", text: "text-[#78350F]",  dot: "bg-[#78350F]" },
  { key: "review",      label: "Review",        color: "bg-[#E0E7FF]", text: "text-[#3730A3]",  dot: "bg-[#3730A3]" },
  { key: "lodgment",    label: "Lodgment",      color: "bg-gp-blue-light", text: "text-gp-blue-dark", dot: "bg-gp-blue" },
  { key: "outcome",     label: "Outcome",       color: "bg-[#DBEAFE]", text: "text-[#1E40AF]",  dot: "bg-[#1E40AF]" },
  { key: "acquittal",   label: "Acquittal",     color: "bg-[#D1FAE5]", text: "text-[#065F46]",  dot: "bg-[#065F46]" },
];

// ═══════════════════════════════════
// ICONS
// ═══════════════════════════════════

const ClubsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const GrantsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const ClockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const AppsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const PendingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const TrophyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// ═══════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════

export default function AdminDashboard() {
  const { data, loading } = useDashboardData();

  const statsConfig = [
    {
      label: "Total Clubs",
      value: loading ? "…" : String(data?.totalClubs ?? 0),
      iconColor: "bg-gp-blue-light text-gp-blue",
      icon: ClubsIcon,
    },
    {
      label: "Active Grants",
      value: loading ? "…" : String(data?.activeGrants ?? 0),
      iconColor: "bg-success-light text-success",
      icon: GrantsIcon,
    },
    {
      label: "Closing Soon",
      value: loading ? "…" : String(data?.closingSoon ?? 0),
      iconColor: "bg-danger-light text-danger",
      icon: ClockIcon,
    },
    {
      label: "Total Applications",
      value: loading ? "…" : String(data?.totalApplications ?? 0),
      iconColor: "bg-gp-blue-light text-gp-blue",
      icon: AppsIcon,
    },
    {
      label: "Pending Items",
      value: loading ? "…" : String(data?.pendingItems ?? 0),
      iconColor: "bg-warning-light text-warning",
      icon: PendingIcon,
    },
    {
      label: "Won This Year",
      value: loading ? "…" : data?.totalWonAmount ?? "$0",
      iconColor: "bg-success-light text-success",
      icon: TrophyIcon,
    },
  ];

  return (
    <div>
      {/* ── Top Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {statsConfig.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl md:text-[2rem] font-bold text-gray-900 leading-none mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Pipeline Breakdown */}
        <Card>
          <CardHeader
            title="Application Pipeline"
            subtitle={loading ? "Loading..." : `${data?.totalApplications ?? 0} total applications`}
            actions={
              <Link href="/manage-grants" className="no-underline">
                <Button size="sm">View Grants</Button>
              </Link>
            }
          />
          <CardBody>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                {PIPELINE_STAGES.map((stage) => {
                  const count = data?.pipelineCounts?.[stage.key] ?? 0;
                  const total = data?.totalApplications ?? 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-medium text-gray-600 shrink-0">{stage.label}</div>
                      <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${stage.color}`}
                          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                        />
                        {count > 0 && (
                          <span className={`absolute inset-y-0 flex items-center text-xs font-semibold ${pct > 15 ? "left-2" : "left-[calc(100%*" + pct/100 + "+0.5rem)]"} ${stage.text}`}>
                            {count}
                          </span>
                        )}
                      </div>
                      <div className="w-10 text-right text-xs text-gray-500">{pct}%</div>
                    </div>
                  );
                })}
                {/* Won / Lost summary */}
                <div className="flex gap-4 pt-3 mt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-success" />
                    <span className="text-sm text-gray-600">Won</span>
                    <span className="text-sm font-semibold text-success">{data?.wonThisYear ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                    <span className="text-sm text-gray-600">Lost</span>
                    <span className="text-sm font-semibold text-danger">{data?.lostThisYear ?? 0}</span>
                  </div>
                  {(data?.wonThisYear ?? 0) + (data?.lostThisYear ?? 0) > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-gray-600">Win Rate</span>
                      <span className="text-sm font-semibold text-gp-blue">
                        {Math.round(((data?.wonThisYear ?? 0) / ((data?.wonThisYear ?? 0) + (data?.lostThisYear ?? 0))) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Grants Closing Soon */}
        <Card>
          <CardHeader
            title="Grants Closing Soon"
            subtitle="Next 14 days"
            actions={
              <Link href="/manage-grants" className="no-underline">
                <Button size="sm">All Grants</Button>
              </Link>
            }
          />
          <CardBody noPadding>
            {loading ? (
              <div className="p-6"><LoadingSpinner /></div>
            ) : !data?.closingSoonGrants?.length ? (
              <div className="p-8 text-center text-gray-500 text-sm">No grants closing in the next 14 days</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {data.closingSoonGrants.map((grant) => (
                  <div key={grant.id} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm truncate">{grant.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{grant.provider} · {grant.applicationCount} applications</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {grant.pendingCount > 0 && (
                        <span className="px-2 py-0.5 bg-warning-light text-warning rounded-full text-xs font-semibold">
                          {grant.pendingCount} pending
                        </span>
                      )}
                      <div className={`text-right ${grant.daysLeft <= 3 ? "text-danger" : grant.daysLeft <= 7 ? "text-warning" : "text-gray-600"}`}>
                        <div className="text-sm font-semibold">{grant.daysLeft}d left</div>
                        <div className="text-xs">{grant.closeDateFormatted}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ── Bottom Two Column Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Clubs Needing Attention */}
        <Card>
          <CardHeader
            title="Clubs Needing Attention"
            subtitle="Clubs with outstanding pending items"
            actions={
              <Link href="/manage-clubs" className="no-underline">
                <Button size="sm">All Clubs</Button>
              </Link>
            }
          />
          <CardBody noPadding>
            {loading ? (
              <div className="p-6"><LoadingSpinner /></div>
            ) : !data?.clubsNeedingAttention?.length ? (
              <div className="p-8 text-center text-sm">
                <div className="text-success font-medium mb-1">All clear!</div>
                <div className="text-gray-500">No clubs with outstanding pending items</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {data.clubsNeedingAttention.map((club) => (
                  <Link key={club.id} href={`/manage-clubs/${club.id}`} className="flex items-center justify-between px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors no-underline">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClubAvatar initials={club.initials} />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{club.shortName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{club.activeApps} active apps · Last active {club.lastActive}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <PlanBadge plan={club.plan} />
                      <span className="px-2.5 py-1 bg-warning-light text-warning rounded-full text-xs font-semibold">
                        {club.pendingItems} pending
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Latest updates across all clubs" />
          <CardBody noPadding>
            {loading ? (
              <div className="p-6"><LoadingSpinner /></div>
            ) : !data?.recentActivity?.length ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {data.recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-3 px-4 md:px-6 py-4">
                    <div className="shrink-0 mt-0.5">
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold">{item.clubName}</span>
                        <span className="text-gray-600"> · {item.grantName}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{item.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{item.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════

function LoadingSpinner() {
  return (
    <div className="py-8 text-center text-gray-500">
      <svg className="w-5 h-5 animate-spin mx-auto mb-2 text-gp-blue" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
      </svg>
      <span className="text-sm">Loading...</span>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const base = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";
  switch (type) {
    case "status_change":
      return (
        <div className={`${base} bg-gp-blue-light text-gp-blue`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
        </div>
      );
    case "interest":
      return (
        <div className={`${base} bg-[#FEF3C7] text-[#92400E]`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
      );
    case "pending_item":
      return (
        <div className={`${base} bg-warning-light text-warning`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </div>
      );
    case "outcome":
      return (
        <div className={`${base} bg-success-light text-success`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        </div>
      );
    default:
      return (
        <div className={`${base} bg-gray-100 text-gray-500`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        </div>
      );
  }
}