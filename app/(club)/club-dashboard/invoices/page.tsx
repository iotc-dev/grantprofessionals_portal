"use client";

import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────
type InvoiceStatus = "paid" | "sent" | "pending" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  grantName: string;
  amountWon: number;
  fee: number;
  dueDate: string;
  paidDate: string | null;
  status: InvoiceStatus;
}

// ── Sample data scoped to this club (Ryde Saints JFC) ──────
const invoices: Invoice[] = [
  {
    id: "1", invoiceNumber: "INV-2026-001",
    grantName: "Sports Equipment Grant 2025", amountWon: 8500, fee: 850,
    dueDate: "2025-11-25", paidDate: "2025-11-20", status: "paid",
  },
  {
    id: "2", invoiceNumber: "INV-2026-008",
    grantName: "Stronger Communities Programme R9", amountWon: 20000, fee: 2000,
    dueDate: "2026-02-20", paidDate: null, status: "pending",
  },
  {
    id: "3", invoiceNumber: "INV-2025-076",
    grantName: "Local Sport Defibrillator Grant", amountWon: 2000, fee: 200,
    dueDate: "2025-09-15", paidDate: "2025-09-10", status: "paid",
  },
  {
    id: "4", invoiceNumber: "INV-2026-015",
    grantName: "Community Building Partnership 2026", amountWon: 25000, fee: 2500,
    dueDate: "2026-03-15", paidDate: null, status: "sent",
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
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Summary stats ──────────────────────────────────────────
const totalInvoices = invoices.length;
const totalFees = invoices.reduce((sum, inv) => sum + inv.fee, 0);
const pendingCount = invoices.filter((inv) => inv.status === "pending" || inv.status === "sent").length;
const paidCount = invoices.filter((inv) => inv.status === "paid").length;

// ── Page ──
export default function ClubInvoices() {
  return (
    <div>
      <Breadcrumb items={[
        { label: "My Club", href: "/club-dashboard" },
        { label: "Invoices" },
        ]} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900">{totalInvoices}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Fees</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalFees)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Paid</div>
          <div className="text-2xl font-bold text-success">{paidCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
          <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending / Sent</div>
          <div className="text-2xl font-bold text-warning">{pendingCount}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader
          title="Your Invoices"
          actions={
            <Link href="/club-dashboard" className="no-underline">
              <Button
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                }
              >
                Back to Profile
              </Button>
            </Link>
          }
        />
        <CardBody noPadding>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "700px" }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Grant</th>
                  <th className="text-right px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Amount Won</th>
                  <th className="text-right px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="text-left px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <th className="text-left px-4 md:px-6 py-3 text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-semibold text-gray-900">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-sm text-gray-600">{inv.grantName}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <span className="font-semibold text-success tabular-nums">{formatCurrency(inv.amountWon)}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <span className="font-semibold tabular-nums">{formatCurrency(inv.fee)}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`text-sm ${inv.status === "overdue" ? "text-danger font-medium" : "text-gray-600"}`}>
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {inv.paidDate ? formatDate(inv.paidDate) : "—"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}