// app/(admin)/admin-dashboard/page.tsx
// Dashboard with real stats + recent clubs table (server-side queries)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatsGrid } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge, AlertBadge, StatusBadge } from "@/components/ui/badge";
import { ClubAvatar, AECell } from "@/components/ui/avatar";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { useClubs, type ClubRow } from "@/lib/hooks/use-clubs";

// ── Stats Hook ──
function useDashboardStats() {
  const [stats, setStats] = useState({
    totalClubs: 0, activeClubs: 0, pendingItems: 0, needAttention: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ── Column Definitions ──
const columns: Column<ClubRow>[] = [
  {
    key: "name",
    label: "Club",
    sortable: true,
    render: (club) => (
      <div className="flex items-center gap-3">
        <ClubAvatar initials={club.initials} />
        <div>
          <div className="font-semibold text-gray-900 whitespace-nowrap">{club.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{club.sport} · {club.lga}</div>
        </div>
      </div>
    ),
  },
  {
    key: "plan",
    label: "Plan",
    render: (club) => <PlanBadge plan={club.plan} />,
  },
  {
    key: "ae",
    label: "Account Executive",
    render: (club) => <AECell name={club.ae.name} initials={club.ae.initials} color={club.ae.color} />,
  },
  {
    key: "state",
    label: "State",
    render: (club) => <span className="text-sm">{club.state}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (club) =>
      club.status.type === "alert" ? (
        <AlertBadge text={club.status.text} />
      ) : (
        <StatusBadge status={club.status.type} />
      ),
  },
  {
    key: "apps",
    label: "Apps",
    sortable: true,
    render: (club) => <span className="text-sm">{club.apps}</span>,
  },
  {
    key: "lastActive",
    label: "Last Active",
    sortable: true,
    render: (club) => (
      <span className={`text-sm ${club.lastActiveRecent ? "text-gp-blue font-medium" : "text-gray-500"}`}>
        {club.lastActive}
      </span>
    ),
  },
];

// ── Page ──
export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const {
    clubs, total, page, perPage, totalPages,
    loading: clubsLoading, error, filters, setFilters,
  } = useClubs({ perPage: 10, sort: "updated_at", order: "desc" });

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const handleSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => setFilters({ search: value }), 300));
  };

  // Sort handler
  const handleSort = (key: string) => {
    if (filters.sort === key) {
      setFilters({ order: filters.order === "asc" ? "desc" : "asc" });
    } else {
      setFilters({ sort: key, order: "asc" });
    }
  };

  const statsConfig = [
    {
      label: "Total Clubs",
      value: statsLoading ? "…" : String(stats.totalClubs),
      iconColor: "bg-gp-blue-light text-gp-blue",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Active Clubs",
      value: statsLoading ? "…" : String(stats.activeClubs),
      iconColor: "bg-success-light text-success",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Pending Items",
      value: statsLoading ? "…" : String(stats.pendingItems),
      iconColor: "bg-warning-light text-warning",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Need Attention",
      value: statsLoading ? "…" : String(stats.needAttention),
      iconColor: "bg-danger-light text-danger",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  // Dashboard filter config — simpler than manage-clubs (no AE dropdown)
  const filterConfig = [
    {
      key: "plan",
      placeholder: "Plan",
      options: [
        { label: "GRP", value: "GRP" },
        { label: "STP", value: "STP" },
        { label: "FDP", value: "FDP" },
      ],
    },
    {
      key: "status",
      placeholder: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "state",
      placeholder: "State",
      options: [
        { label: "NSW", value: "NSW" },
        { label: "VIC", value: "VIC" },
        { label: "QLD", value: "QLD" },
        { label: "WA", value: "WA" },
        { label: "SA", value: "SA" },
        { label: "TAS", value: "TAS" },
        { label: "ACT", value: "ACT" },
        { label: "NT", value: "NT" },
      ],
    },
  ];

  return (
    <div>
      <StatsGrid stats={statsConfig} />

      <Card>
        <CardHeader
          title="Manage Clubs"
          subtitle={clubsLoading ? "Loading..." : `${total} clubs`}
          actions={
            <Link href="/manage-clubs" className="no-underline">
              <Button>View All</Button>
            </Link>
          }
        />
        <FilterBar
          filters={filterConfig}
          searchPlaceholder="Search clubs..."
          onFilterChange={(key, value) => setFilters({ [key]: value })}
          onSearchChange={handleSearch}
          onClear={() => setFilters({ search: "", state: "", plan: "", status: "" })}
        />

        {error && (
          <div className="p-4 mx-4 mb-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {clubsLoading ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-6 h-6 animate-spin mx-auto mb-3 text-gp-blue" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
            </svg>
            Loading clubs...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={clubs}
            rowKey={(club) => club.id}
            rowHref={(club) => `/manage-clubs/${club.id}`}
            onSort={handleSort}
            sortKey={filters.sort}
            sortDir={filters.order}
            minWidth="900px"
          />
        )}

        {!clubsLoading && totalPages > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={perPage}
            onPageChange={(p) => setFilters({ page: p })}
          />
        )}
      </Card>
    </div>
  );
}