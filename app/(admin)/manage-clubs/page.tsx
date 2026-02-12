// app/(admin)/manage-clubs/page.tsx
// Server-side search, filter, sort, pagination via /api/clubs

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge, AlertBadge, StatusBadge } from "@/components/ui/badge";
import { ClubAvatar, AECell } from "@/components/ui/avatar";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { useClubs, type ClubRow } from "@/lib/hooks/use-clubs";

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
export default function ManageClubs() {
  const {
    clubs, total, page, perPage, totalPages,
    loading, error, filters, setFilters, refetch,
  } = useClubs({ perPage: 10 });

  // Dynamic AE filter options — loaded once
  const [aeOptions, setAeOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    fetch("/api/clubs/filters")
      .then((r) => r.json())
      .then((data) => setAeOptions(data.aes || []))
      .catch(() => {});
  }, []);

  // Build filter config with dynamic AE list
  const filterConfig = [
    {
      key: "ae",
      placeholder: "Account Executive",
      options: aeOptions,
    },
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

  return (
    <div>
      <Card>
        <CardHeader
          title="Manage Clubs"
          subtitle={loading ? "Loading..." : `${total} clubs`}
          actions={
            <Button variant="primary" icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }>
              Add Club
            </Button>
          }
        />
        <FilterBar
          filters={filterConfig}
          searchPlaceholder="Search clubs..."
          onFilterChange={(key, value) => setFilters({ [key]: value })}
          onSearchChange={handleSearch}
          onClear={() => setFilters({ search: "", state: "", plan: "", status: "", ae: "" })}
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