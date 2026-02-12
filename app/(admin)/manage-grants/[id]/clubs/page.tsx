"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card } from "@/components/ui/card";
import { PlanBadge } from "@/components/ui/badge";
import { ClubAvatar, AECell } from "@/components/ui/avatar";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";

// --- Grant Info ---
const grant = {
  name: "Telstra Footy Grants 2026",
  program: "AFL Community Grants · Corporate",
  amount: "Up to $20,000",
  deadline: "Feb 1, 2026 (10 days)",
  eligibility: "AFL Clubs",
  status: "Open - Closing Soon",
};

const grantStats = [
  { value: "8", label: "Clubs Interested" },
  { value: "5", label: "In Progress" },
  { value: "2", label: "Submitted" },
  { value: "7", label: "Pending Items" },
];

// --- Club Rows ---
interface ClubGrantRow {
  id: string;
  initials: string;
  name: string;
  sport: string;
  lga: string;
  state: string;
  plan: string;
  ae: { name: string; initials: string; color: string };
  appStatus: string;
  appStatusType: string;
  pendingCount: number;
  lastUpdated: string;
}

const clubs: ClubGrantRow[] = [
  { id: "rs", initials: "RS", name: "Ryde Saints Junior Football Club", sport: "AFL", lga: "Ryde", state: "NSW", plan: "GRP", ae: { name: "John Smith", initials: "JS", color: "#43A047" }, appStatus: "Pending Info", appStatusType: "pending-info", pendingCount: 3, lastUpdated: "2 hours ago" },
  { id: "ee", initials: "EE", name: "Epping Eastwood Tigers AFC", sport: "AFL", lga: "Epping", state: "NSW", plan: "STP", ae: { name: "Emma Wilson", initials: "EW", color: "#8E24AA" }, appStatus: "Pending Info", appStatusType: "pending-info", pendingCount: 2, lastUpdated: "Yesterday" },
  { id: "ch", initials: "CH", name: "Castle Hill Hawks Junior AFL", sport: "AFL", lga: "Castle Hill", state: "NSW", plan: "GRP", ae: { name: "John Smith", initials: "JS", color: "#43A047" }, appStatus: "Submitted", appStatusType: "submitted", pendingCount: 0, lastUpdated: "3 days ago" },
  { id: "mw", initials: "MW", name: "Manly Warringah Giants AFC", sport: "AFL", lga: "Manly", state: "NSW", plan: "FDP", ae: { name: "David Chen", initials: "DC", color: "#F57C00" }, appStatus: "In Progress", appStatusType: "in-progress", pendingCount: 0, lastUpdated: "1 day ago" },
  { id: "pd", initials: "PD", name: "Penrith Districts Junior AFL", sport: "AFL", lga: "Penrith", state: "NSW", plan: "STP", ae: { name: "Emma Wilson", initials: "EW", color: "#8E24AA" }, appStatus: "Approved", appStatusType: "approved", pendingCount: 0, lastUpdated: "5 days ago" },
  { id: "bb", initials: "BB", name: "Bankstown Bulls AFL Club", sport: "AFL", lga: "Bankstown", state: "NSW", plan: "GRP", ae: { name: "John Smith", initials: "JS", color: "#43A047" }, appStatus: "Pending Info", appStatusType: "pending-info", pendingCount: 1, lastUpdated: "4 hours ago" },
  { id: "ss", initials: "SS", name: "Sutherland Shire Junior AFL", sport: "AFL", lga: "Sutherland", state: "NSW", plan: "GRP", ae: { name: "David Chen", initials: "DC", color: "#F57C00" }, appStatus: "Submitted", appStatusType: "submitted", pendingCount: 0, lastUpdated: "1 week ago" },
  { id: "cs", initials: "CS", name: "Cronulla Seagulls AFC", sport: "AFL", lga: "Cronulla", state: "NSW", plan: "STP", ae: { name: "Emma Wilson", initials: "EW", color: "#8E24AA" }, appStatus: "In Progress", appStatusType: "in-progress", pendingCount: 0, lastUpdated: "2 days ago" },
];

// --- Application Status Badge ---
function AppStatusBadge({ status, type }: { status: string; type: string }) {
  const styles: Record<string, string> = {
    "pending-info": "bg-warning-light text-[#9A3412]",
    "in-progress": "bg-gp-blue-light text-gp-blue-dark",
    "submitted": "bg-[#E0E7FF] text-[#3730A3]",
    "approved": "bg-success-light text-success",
    "unsuccessful": "bg-gray-100 text-gray-600",
    "acquitted": "bg-[#F0FDF4] text-[#166534]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// --- Pending Count ---
function PendingCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${count > 0 ? "bg-danger" : "bg-success"}`}>
        {count}
      </span>
      <span className="text-sm text-gray-600">pending</span>
    </div>
  );
}

// --- Filters ---
const filterConfig = [
  {
    key: "status",
    placeholder: "Status",
    options: [
      { label: "Pending Info", value: "pending-info" },
      { label: "In Progress", value: "in-progress" },
      { label: "Submitted", value: "submitted" },
      { label: "Approved", value: "approved" },
      { label: "Unsuccessful", value: "unsuccessful" },
      { label: "Acquitted", value: "acquitted" },
    ],
  },
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
    key: "pending",
    placeholder: "Pending Items",
    options: [
      { label: "Has Pending Items", value: "has-pending" },
      { label: "No Pending Items", value: "no-pending" },
    ],
  },
];

// --- Columns ---
const columns: Column<ClubGrantRow>[] = [
  {
    key: "name",
    label: "Club",
    sortable: true,
    render: (c) => (
      <div className="flex items-center gap-3">
        <ClubAvatar initials={c.initials} />
        <div>
          <div className="font-semibold text-gray-900 whitespace-nowrap">{c.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{c.sport} · {c.lga}, {c.state}</div>
        </div>
      </div>
    ),
  },
  {
    key: "plan",
    label: "Plan",
    render: (c) => <PlanBadge plan={c.plan} />,
  },
  {
    key: "ae",
    label: "Account Executive",
    render: (c) => <AECell name={c.ae.name} initials={c.ae.initials} color={c.ae.color} />,
  },
  {
    key: "appStatus",
    label: "Status",
    render: (c) => <AppStatusBadge status={c.appStatus} type={c.appStatusType} />,
  },
  {
    key: "pending",
    label: "Pending Items",
    sortable: true,
    render: (c) => <PendingCount count={c.pendingCount} />,
  },
  {
    key: "lastUpdated",
    label: "Last Updated",
    sortable: true,
    render: (c) => <span className="text-sm text-gray-500">{c.lastUpdated}</span>,
  },
];

// --- Tab filter ---
const statusTabs = [
  { key: "all", label: "All Clubs", count: 8 },
  { key: "pending-info", label: "Pending Info", count: 3 },
  { key: "in-progress", label: "In Progress", count: 2 },
  { key: "submitted", label: "Submitted", count: 2 },
  { key: "approved", label: "Approved", count: 1 },
];

export default function GrantClubsView() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredClubs = activeTab === "all"
    ? clubs
    : clubs.filter((c) => c.appStatusType === activeTab);

  return (
    <div>
      <Breadcrumb items={[
        { label: "Dashboard", href: "/admin-dashboard" },
        { label: "Manage Grants", href: "/manage-grants" },
        { label: grant.name },
      ]} />

      {/* Grant Header Card */}
      <Card className="mb-6">
        <div className="p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{grant.name}</h1>
          <div className="flex items-center gap-2 text-[0.9375rem] text-gray-600 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {grant.program}
          </div>

          <div className="flex gap-6 md:gap-8 flex-wrap mb-6">
            <div>
              <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount</div>
              <div className="text-base font-semibold text-gray-900">{grant.amount}</div>
            </div>
            <div>
              <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</div>
              <div className="text-base font-semibold text-danger">{grant.deadline}</div>
            </div>
            <div>
              <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Eligibility</div>
              <div className="text-base font-semibold text-gray-900">{grant.eligibility}</div>
            </div>
            <div>
              <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</div>
              <div className="text-base font-semibold text-gray-900">{grant.status}</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
            {grantStats.map((s) => (
              <div key={s.label} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{s.value}</div>
                <div className="text-[0.8125rem] text-gray-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Clubs Table */}
      <Card>
        <FilterBar filters={filterConfig} searchPlaceholder="Search clubs..." />

        {/* Status Tabs */}
        <div className="flex gap-0 px-4 md:px-6 border-b border-gray-200 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 md:px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap bg-transparent cursor-pointer ${
                activeTab === tab.key
                  ? "text-gp-blue border-gp-blue"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? "bg-gp-blue-light text-gp-blue-dark" : "bg-gray-100 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredClubs}
          rowKey={(c) => c.id}
          rowHref={(c) => `/manage-clubs/${c.id}`}
          minWidth="900px"
        />
        <Pagination currentPage={1} totalPages={1} totalItems={filteredClubs.length} itemsPerPage={10} />
      </Card>
    </div>
  );
}