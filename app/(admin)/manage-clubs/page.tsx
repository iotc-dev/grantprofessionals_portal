"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge, AlertBadge, StatusBadge } from "@/components/ui/badge";
import { ClubAvatar, AECell } from "@/components/ui/avatar";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";

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
  {
    initials: "CB", name: "Canterbury Bulldogs JRL", sport: "Rugby League", lga: "Canterbury-Bankstown",
    plan: "GRP", ae: { name: "James Chen", initials: "JC", color: "#1E88E5" },
    state: "NSW", status: { type: "active", text: "Active" }, apps: 3,
    lastActive: "1 day ago", lastActiveRecent: false,
  },
  {
    initials: "CS", name: "Cronulla Seagulls AFC", sport: "AFL", lga: "Sutherland",
    plan: "STP", ae: { name: "Emma Wilson", initials: "EW", color: "#8E24AA" },
    state: "NSW", status: { type: "active", text: "Active" }, apps: 2,
    lastActive: "2 days ago", lastActiveRecent: false,
  },
];

const filterConfig = [
  {
    key: "ae",
    placeholder: "Account Executive",
    options: [
      { label: "James Chen", value: "james-chen" },
      { label: "John Smith", value: "john-smith" },
      { label: "Emma Wilson", value: "emma-wilson" },
      { label: "David Chen", value: "david-chen" },
      { label: "Sarah Jones", value: "sarah-jones" },
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

export default function ManageClubs() {
  return (
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
      <DataTable
        columns={columns}
        data={clubs}
        rowKey={(club) => club.initials}
        rowHref={(club) => `/manage-clubs/${club.initials.toLowerCase()}`}
      />
      <Pagination currentPage={1} totalPages={8} totalItems={47} itemsPerPage={6} />
    </Card>
  );
}