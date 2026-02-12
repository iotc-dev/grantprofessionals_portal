"use client";

import Link from "next/link";
import { StatsGrid } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge, AlertBadge, StatusBadge } from "@/components/ui/badge";
import { ClubAvatar, AECell } from "@/components/ui/avatar";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";

// --- Sample Data (replace with Supabase later) ---

const stats = [
  {
    label: "Total Clubs",
    value: "47",
    trend: "+3",
    trendUp: true,
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
    value: "38",
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
    value: "6",
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
    value: "3",
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

interface ClubRow {
  initials: string;
  name: string;
  sport: string;
  lga: string;
  plan: string;
  ae: { name: string; initials: string; color: string };
  state: string;
  status: { type: string; text: string };
  apps: number;
  lastActive: string;
  lastActiveRecent: boolean;
}

const clubs: ClubRow[] = [
  {
    initials: "RS", name: "Ryde Saints Junior FC", sport: "AFL", lga: "City of Ryde",
    plan: "GRP", ae: { name: "James Chen", initials: "JC", color: "#1E88E5" },
    state: "NSW", status: { type: "alert", text: "3 Pending" }, apps: 5,
    lastActive: "2 hours ago", lastActiveRecent: true,
  },
  {
    initials: "HN", name: "Hornsby Netball Association", sport: "Netball", lga: "Hornsby",
    plan: "FDP", ae: { name: "Emma Wilson", initials: "EW", color: "#8E24AA" },
    state: "NSW", status: { type: "active", text: "Active" }, apps: 5,
    lastActive: "Yesterday", lastActiveRecent: false,
  },
  {
    initials: "PC", name: "Parramatta Cricket Club", sport: "Cricket", lga: "Parramatta",
    plan: "STP", ae: { name: "David Chen", initials: "DC", color: "#F57C00" },
    state: "NSW", status: { type: "active", text: "Active" }, apps: 2,
    lastActive: "3 days ago", lastActiveRecent: false,
  },
  {
    initials: "MS", name: "Manly Surf Life Saving", sport: "Surf Life Saving", lga: "Northern Beaches",
    plan: "GRP", ae: { name: "John Smith", initials: "JS", color: "#43A047" },
    state: "NSW", status: { type: "alert", text: "1 Pending" }, apps: 4,
    lastActive: "5 hours ago", lastActiveRecent: true,
  },
  {
    initials: "BS", name: "Blacktown Soccer FC", sport: "Soccer", lga: "Blacktown",
    plan: "GRP", ae: { name: "Sarah Jones", initials: "SJ", color: "#EC407A" },
    state: "NSW", status: { type: "inactive", text: "Inactive" }, apps: 0,
    lastActive: "2 weeks ago", lastActiveRecent: false,
  },
  {
    initials: "PB", name: "Penrith Basketball Assoc", sport: "Basketball", lga: "Penrith",
    plan: "FDP", ae: { name: "David Chen", initials: "DC", color: "#F57C00" },
    state: "NSW", status: { type: "alert", text: "2 Pending" }, apps: 6,
    lastActive: "4 hours ago", lastActiveRecent: true,
  },
];

const filterConfig = [
  {
    key: "ae",
    placeholder: "Account Executive",
    options: [
      { label: "John Smith", value: "john-smith" },
      { label: "Emma Wilson", value: "emma-wilson" },
      { label: "David Chen", value: "david-chen" },
    ],
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
      { label: "Pending", value: "pending" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

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
      <span className={`text-sm ${club.lastActiveRecent ? "text-success" : "text-gray-500"}`}>
        {club.lastActive}
      </span>
    ),
  },
  {
    key: "actions",
    label: "",
    render: (club) => (
      <Link
        href={`/manage-clubs/${club.initials.toLowerCase()}`}
        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors no-underline"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </Link>
    ),
  },
];

const ExportIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function AdminDashboard() {
  return (
    <div>
      <StatsGrid stats={stats} />

      <Card>
        <CardHeader
          title="All Clubs"
          actions={
            <>
              <Button icon={ExportIcon} className="flex-1 sm:flex-none">Export</Button>
              <Button variant="primary" icon={PlusIcon} className="flex-1 sm:flex-none">Add Club</Button>
            </>
          }
        />
        <FilterBar filters={filterConfig} searchPlaceholder="Search clubs..." />
        <DataTable columns={columns} data={clubs} rowKey={(club) => club.initials} />
        <Pagination currentPage={1} totalPages={8} totalItems={47} itemsPerPage={6} />
      </Card>
    </div>
  );
}