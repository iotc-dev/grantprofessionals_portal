// app/(admin)/manage-grants/page.tsx
// Server-side search, filter, sort, pagination via /api/grants

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { StatsGrid } from "@/components/ui/stat-card";
import { useGrants, type GrantRow } from "@/lib/hooks/use-grants";

// ── Stats Hook ──
function useGrantStats() {
  const [stats, setStats] = useState({
    openGrants: 0, totalApplications: 0, closingSoon: 0, clubsInterested: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grants/stats")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setStats(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ── Filters ──
const filterConfig = [
  {
    key: "status",
    placeholder: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    key: "grantType",
    placeholder: "Grant Type",
    options: [
      { label: "Federal", value: "Federal" },
      { label: "State", value: "State" },
      { label: "Council/Local", value: "Council/Local" },
      { label: "Foundation/Trust", value: "Foundation/Trust" },
      { label: "Corporate", value: "Corporate" },
    ],
  },
];

// ── Columns ──
const columns: Column<GrantRow>[] = [
  {
    key: "name",
    label: "Grant",
    sortable: true,
    render: (g) => (
      <div>
        <div className="font-semibold text-gray-900">{g.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">{g.provider}</div>
      </div>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (g) => <span className="text-sm font-medium">{g.amount}</span>,
  },
  {
    key: "openDate",
    label: "Open Date",
    sortable: true,
    render: (g) => <span className="text-sm text-gray-600">{g.openDateFormatted}</span>,
  },
  {
    key: "closeDate",
    label: "Close Date",
    sortable: true,
    render: (g) => (
      <span className={`text-sm font-medium ${g.closingSoon ? "text-danger" : "text-gray-900"}`}>
        {g.closeDateFormatted}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (g) => <StatusBadge status={g.statusType} />,
  },
  {
    key: "applicationCount",
    label: "Applications",
    sortable: true,
    render: (g) => (
      <span className="inline-flex px-2.5 py-1 bg-gp-blue-light text-gp-blue-dark rounded-full text-xs font-semibold">
        {g.applicationCount} clubs
      </span>
    ),
  },
  {
    key: "link",
    label: "Link",
    render: (g) =>
      g.applicationUrl ? (
        <a
          href={g.applicationUrl}
          target="_blank"
          className="text-sm text-gp-blue no-underline hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {g.linkDomain} ↗
        </a>
      ) : (
        <span className="text-sm text-gray-400">—</span>
      ),
  },
];

// ── Icons ──
const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── Page ──
export default function ManageGrants() {
  const { stats, loading: statsLoading } = useGrantStats();
  const {
    grants, total, page, perPage, totalPages,
    loading, error, filters, setFilters,
  } = useGrants({ perPage: 10 });

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
      label: "Open Grants",
      value: statsLoading ? "…" : String(stats.openGrants),
      iconColor: "bg-gp-blue-light text-gp-blue",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    },
    {
      label: "Total Applications",
      value: statsLoading ? "…" : String(stats.totalApplications),
      iconColor: "bg-success-light text-success",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    },
    {
      label: "Closing Soon",
      value: statsLoading ? "…" : String(stats.closingSoon),
      iconColor: "bg-danger-light text-danger",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    },
    {
      label: "Clubs Interested",
      value: statsLoading ? "…" : String(stats.clubsInterested),
      iconColor: "bg-gp-blue-light text-gp-blue",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
  ];

  return (
    <div>
      <StatsGrid stats={statsConfig} />

      <Card>
        <CardHeader
          title="Grant Opportunities"
          subtitle={loading ? "Loading..." : `${total} grants`}
          actions={
            <Button variant="primary" icon={PlusIcon}>Add Grant</Button>
          }
        />
        <FilterBar
          filters={filterConfig}
          searchPlaceholder="Search grants..."
          onFilterChange={(key, value) => setFilters({ [key]: value })}
          onSearchChange={handleSearch}
          onClear={() => setFilters({ search: "", status: "", grantType: "" })}
        />

        {error && (
          <div className="p-4 mx-4 mb-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-6 h-6 animate-spin mx-auto mb-3 text-gp-blue" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
            </svg>
            Loading grants...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={grants}
            rowKey={(g) => g.id}
            rowHref={(g) => `/manage-grants/${g.id}/clubs`}
            onSort={handleSort}
            sortKey={filters.sort}
            sortDir={filters.order}
            minWidth="900px"
          />
        )}

        {!loading && totalPages > 0 && (
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