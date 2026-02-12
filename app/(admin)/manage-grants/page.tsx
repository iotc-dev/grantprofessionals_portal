"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { FilterBar } from "@/components/data/filter-bar";
import { DataTable, type Column } from "@/components/data/data-table";
import { Pagination } from "@/components/data/pagination";
import { StatsGrid } from "@/components/ui/stat-card";

// --- Stats ---
const stats = [
  {
    label: "Active Grants",
    value: "12",
    iconColor: "bg-gp-blue-light text-gp-blue",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  },
  {
    label: "Total Applications",
    value: "34",
    iconColor: "bg-success-light text-success",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  },
  {
    label: "Closing Soon",
    value: "3",
    iconColor: "bg-danger-light text-danger",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  },
  {
    label: "Clubs Interested",
    value: "23",
    iconColor: "bg-gp-blue-light text-gp-blue",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
];

// --- Sample Grants ---
interface GrantRow {
  id: string;
  name: string;
  provider: string;
  amount: string;
  openDate: string;
  closeDate: string;
  closingSoon: boolean;
  status: string;
  statusType: string;
  matchedClubs: number;
  link: string;
  linkDomain: string;
}

const grants: GrantRow[] = [
  {
    id: "sc-r10", name: "Stronger Communities Programme R10", provider: "Federal Government",
    amount: "Up to $20,000", openDate: "Nov 1, 2025", closeDate: "Feb 14, 2026", closingSoon: true,
    status: "Open", statusType: "active", matchedClubs: 8, link: "https://business.gov.au", linkDomain: "business.gov.au",
  },
  {
    id: "cbp-2026", name: "Community Building Partnership 2026", provider: "State Government · NSW",
    amount: "Up to $50,000", openDate: "Jan 15, 2026", closeDate: "Feb 21, 2026", closingSoon: true,
    status: "Open", statusType: "active", matchedClubs: 12, link: "https://nsw.gov.au", linkDomain: "nsw.gov.au",
  },
  {
    id: "defib", name: "Local Sport Defibrillator Grant", provider: "State Government",
    amount: "$2,000", openDate: "Oct 15, 2025", closeDate: "Mar 1, 2026", closingSoon: false,
    status: "Open", statusType: "active", matchedClubs: 15, link: "https://sport.nsw.gov.au", linkDomain: "sport.nsw.gov.au",
  },
  {
    id: "telstra", name: "Telstra Footy Grants 2026", provider: "Corporate · AFL",
    amount: "Up to $20,000", openDate: "Feb 1, 2026", closeDate: "Mar 15, 2026", closingSoon: false,
    status: "Open", statusType: "active", matchedClubs: 6, link: "https://telstra.com.au", linkDomain: "telstra.com.au",
  },
  {
    id: "equip-2025", name: "Sports Equipment Grant 2025", provider: "State Government",
    amount: "Up to $10,000", openDate: "May 1, 2025", closeDate: "Aug 15, 2025", closingSoon: false,
    status: "Closed", statusType: "inactive", matchedClubs: 18, link: "https://sport.nsw.gov.au", linkDomain: "sport.nsw.gov.au",
  },
  {
    id: "infra-2025", name: "Community Infrastructure Grant 2025", provider: "Local Council",
    amount: "Up to $25,000", openDate: "Apr 1, 2025", closeDate: "Jul 30, 2025", closingSoon: false,
    status: "Closed", statusType: "inactive", matchedClubs: 10, link: "https://ryde.nsw.gov.au", linkDomain: "ryde.nsw.gov.au",
  },
];

// --- Filters ---
const filterConfig = [
  {
    key: "status",
    placeholder: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closing Soon", value: "closing-soon" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    key: "type",
    placeholder: "Program Type",
    options: [
      { label: "Federal", value: "federal" },
      { label: "State", value: "state" },
      { label: "Local", value: "local" },
      { label: "Corporate", value: "corporate" },
    ],
  },
  {
    key: "amount",
    placeholder: "Amount Range",
    options: [
      { label: "Up to $5K", value: "5k" },
      { label: "$5K – $20K", value: "20k" },
      { label: "$20K – $50K", value: "50k" },
      { label: "$50K+", value: "50k-plus" },
    ],
  },
];

// --- Columns ---
const columns: Column<GrantRow>[] = [
  {
    key: "name",
    label: "Grant",
    sortable: true,
    render: (g) => (
      <div>
        <div className="font-semibold text-gray-900 whitespace-nowrap">{g.name}</div>
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
    render: (g) => <span className="text-sm text-gray-600">{g.openDate}</span>,
  },
  {
    key: "closeDate",
    label: "Close Date",
    sortable: true,
    render: (g) => (
      <span className={`text-sm font-medium ${g.closingSoon ? "text-danger" : "text-gray-900"}`}>
        {g.closeDate}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (g) => <StatusBadge status={g.statusType} />,
  },
  {
    key: "matchedClubs",
    label: "Matched Clubs",
    sortable: true,
    render: (g) => (
      <span className="inline-flex px-2.5 py-1 bg-gp-blue-light text-gp-blue-dark rounded-full text-xs font-semibold">
        {g.matchedClubs} clubs
      </span>
    ),
  },
  {
    key: "link",
    label: "Link",
    render: (g) => (
      <a
        href={g.link}
        target="_blank"
        className="text-sm text-gp-blue no-underline hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {g.linkDomain} ↗
      </a>
    ),
  },
];

// --- Icons ---
const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function ManageGrants() {
  return (
    <div>
      <StatsGrid stats={stats} />

      <Card>
        <CardHeader
          title="Grant Opportunities"
          actions={
            <Button variant="primary" icon={PlusIcon}>Add Grant</Button>
          }
        />
        <FilterBar filters={filterConfig} searchPlaceholder="Search grants..." />
        <DataTable
          columns={columns}
          data={grants}
          rowKey={(g) => g.id}
          rowHref={(g) => `/manage-grants/${g.id}/clubs`}
          minWidth="900px"
        />
        <Pagination currentPage={1} totalPages={3} totalItems={12} itemsPerPage={6} />
      </Card>
    </div>
  );
}