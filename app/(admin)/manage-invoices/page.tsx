"use client";

import { useState, useMemo } from "react";
import { StatsGrid } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { Pagination } from "@/components/data/pagination";

// ── Types ──────────────────────────────────────────────────
type InvoiceStatus = "paid" | "sent" | "pending" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clubName: string;
  grantName: string;
  amountWon: number;
  fee: number;
  dueDate: string;
  status: InvoiceStatus;
}

// ── Sample Data (from index.html mockup + extras) ──────────
const sampleInvoices: Invoice[] = [
  {
    id: "1", invoiceNumber: "INV-2026-001", clubName: "Ryde Saints JFC",
    grantName: "Sports Equipment Grant 2025", amountWon: 8500, fee: 850,
    dueDate: "2025-11-25", status: "paid",
  },
  {
    id: "2", invoiceNumber: "INV-2026-002", clubName: "Hornsby Netball Association",
    grantName: "Community Building Partnership 2025", amountWon: 25000, fee: 2500,
    dueDate: "2025-12-10", status: "paid",
  },
  {
    id: "3", invoiceNumber: "INV-2026-003", clubName: "Parramatta Cricket Club",
    grantName: "Local Sport Defibrillator Grant", amountWon: 2000, fee: 200,
    dueDate: "2026-01-01", status: "paid",
  },
  {
    id: "4", invoiceNumber: "INV-2026-004", clubName: "Manly Surf Life Saving",
    grantName: "Stronger Communities Programme R9", amountWon: 18000, fee: 1800,
    dueDate: "2026-01-15", status: "sent",
  },
  {
    id: "5", invoiceNumber: "INV-2026-005", clubName: "Blacktown Soccer FC",
    grantName: "NSW Club Grants Program", amountWon: 15000, fee: 1500,
    dueDate: "2026-01-28", status: "sent",
  },
  {
    id: "6", invoiceNumber: "INV-2026-006", clubName: "Penrith Basketball Assoc",
    grantName: "Community Infrastructure Grant", amountWon: 32000, fee: 3200,
    dueDate: "2026-02-10", status: "pending",
  },
  {
    id: "7", invoiceNumber: "INV-2026-007", clubName: "Cronulla Seagulls AFC",
    grantName: "Active Kids Rebate Program", amountWon: 5000, fee: 500,
    dueDate: "2026-02-15", status: "pending",
  },
  {
    id: "8", invoiceNumber: "INV-2026-008", clubName: "Ryde Saints JFC",
    grantName: "Stronger Communities Programme R9", amountWon: 20000, fee: 2000,
    dueDate: "2026-02-20", status: "pending",
  },
  {
    id: "9", invoiceNumber: "INV-2026-009", clubName: "Hornsby Netball Association",
    grantName: "Female Facilities Program", amountWon: 45000, fee: 4500,
    dueDate: "2026-03-01", status: "pending",
  },
  {
    id: "10", invoiceNumber: "INV-2025-089", clubName: "Eastern Suburbs FC",
    grantName: "Active Kids Voucher Program", amountWon: 4000, fee: 400,
    dueDate: "2025-12-01", status: "overdue",
  },
  {
    id: "11", invoiceNumber: "INV-2025-092", clubName: "Canterbury Bulldogs JRL",
    grantName: "Local Sport Defibrillator Grant", amountWon: 2000, fee: 200,
    dueDate: "2025-12-15", status: "overdue",
  },
];

// ── Helpers ────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Constants ──────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

// ── Stats config (matches StatsGrid Stat[] interface) ──────
const stats = [
  {
    label: "Total Invoices",
    value: "18",
    iconColor: "bg-gp-blue-light text-gp-blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "Pending",
    value: "4",
    iconColor: "bg-warning-light text-warning",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Overdue",
    value: "2",
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

// ── Filter config (matches FilterBar FilterConfig[] interface) ──
const filterConfig = [
  {
    key: "status",
    placeholder: "Status",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Sent", value: "sent" },
      { label: "Paid", value: "paid" },
      { label: "Overdue", value: "overdue" },
    ],
  },
  {
    key: "dateRange",
    placeholder: "Date Range",
    options: [
      { label: "This Month", value: "this-month" },
      { label: "Last Month", value: "last-month" },
      { label: "Last 3 Months", value: "last-3-months" },
      { label: "This Year", value: "this-year" },
    ],
  },
];

// ── SVG icons for buttons ──────────────────────────────────
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

// ── Table columns ──────────────────────────────────────────
const columns: Column<Invoice>[] = [
  {
    key: "invoiceNumber",
    label: "Invoice #",
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-gray-900">{row.invoiceNumber}</span>
    ),
  },
  {
    key: "clubName",
    label: "Club",
    render: (row) => (
      <div className="font-medium text-gray-900">{row.clubName}</div>
    ),
  },
  {
    key: "grantName",
    label: "Grant",
    render: (row) => (
      <div className="text-sm text-gray-500">{row.grantName}</div>
    ),
  },
  {
    key: "amountWon",
    label: "Amount Won",
    sortable: true,
    className: "text-right",
    render: (row) => (
      <span className="font-semibold text-success tabular-nums">
        {formatCurrency(row.amountWon)}
      </span>
    ),
  },
  {
    key: "fee",
    label: "Fee",
    sortable: true,
    className: "text-right",
    render: (row) => (
      <span className="font-semibold tabular-nums">{formatCurrency(row.fee)}</span>
    ),
  },
  {
    key: "dueDate",
    label: "Due Date",
    sortable: true,
    render: (row) => (
      <span className={row.status === "overdue" ? "text-danger font-medium" : "text-gray-600"}>
        {formatDate(row.dueDate)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => <InvoiceStatusBadge status={row.status} />,
  },
  {
    key: "actions",
    label: "",
    render: () => (
      <Button variant="secondary" size="sm">
        View
      </Button>
    ),
  },
];

// ── Page Component ─────────────────────────────────────────
export default function ManageInvoicesPage() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filter handler (matches FilterBar onFilterChange signature) ──
  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setActiveFilters({});
    setSearchQuery("");
    setCurrentPage(1);
  };

  // ── Sort handler ──
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  // ── Filtered data ──
  const filteredInvoices = useMemo(() => {
    let result = [...sampleInvoices];

    if (activeFilters.status) {
      result = result.filter((inv) => inv.status === activeFilters.status);
    }

    if (activeFilters.dateRange) {
      const now = new Date();
      let startDate: Date | null = null;
      switch (activeFilters.dateRange) {
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last-month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case "last-3-months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case "this-year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      if (startDate) {
        result = result.filter((inv) => new Date(inv.dueDate) >= startDate!);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clubName.toLowerCase().includes(q) ||
          inv.grantName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeFilters, searchQuery]);

  // ── Sorted data ──
  const sortedInvoices = useMemo(() => {
    if (!sortKey) return filteredInvoices;

    return [...filteredInvoices].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortKey) {
        case "invoiceNumber":
          aVal = a.invoiceNumber;
          bVal = b.invoiceNumber;
          break;
        case "amountWon":
          aVal = a.amountWon;
          bVal = b.amountWon;
          break;
        case "fee":
          aVal = a.fee;
          bVal = b.fee;
          break;
        case "dueDate":
          aVal = a.dueDate;
          bVal = b.dueDate;
          break;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredInvoices, sortKey, sortDir]);

  // ── Paginated data ──
  const totalPages = Math.ceil(sortedInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <StatsGrid stats={stats} />

      <Card>
        <CardHeader
          title="All Invoices"
          actions={
            <>
              <Button icon={ExportIcon} className="flex-1 sm:flex-none">Export</Button>
              <Button variant="primary" icon={PlusIcon} className="flex-1 sm:flex-none">New Invoice</Button>
            </>
          }
        />
        <CardBody noPadding>
          <FilterBar
            filters={filterConfig}
            searchPlaceholder="Search by club, ABN, or invoice #..."
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onClear={handleClear}
          />
          <DataTable<Invoice>
            columns={columns}
            data={paginatedInvoices}
            rowKey={(inv) => inv.id}
            onSort={handleSort}
            sortKey={sortKey}
            sortDir={sortDir}
            minWidth="900px"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedInvoices.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardBody>
      </Card>
    </div>
  );
}