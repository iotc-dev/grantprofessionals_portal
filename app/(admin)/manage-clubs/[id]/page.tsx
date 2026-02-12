// app/(admin)/manage-clubs/[id]/page.tsx
// Club profile view — real data from /api/clubs/[id] and /api/clubs/[id]/applications

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/ui/badge";
import { ClubAvatar } from "@/components/ui/avatar";

// ═══════════════════════════════════
// TYPES
// ═══════════════════════════════════

interface ClubProfile {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  abn: string;
  entityType: string;
  plan: string;
  planLabel: string;
  subscriptionActive: boolean;
  createdAt: string;
  state: string;
  lga: string;
  sport: string;
  ae: string;
  am: string | null;
  bdm: string | null;
  primaryContact: { name: string; position: string; email: string; mobile: string; isAuthorized: boolean } | null;
  secondaryContact: { name: string; position: string; email: string; mobile: string; isAuthorized: boolean } | null;
  addresses: { organisation: string | null; postal: string | null; activity: string | null };
  about: string | null;
  purpose: string | null;
  yearEstablished: number | null;
  totalMembers: number | null;
  activeVolunteers: number | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  gstRegistered: boolean | null;
  dgrStatus: boolean | null;
  acncRegistered: boolean | null;
  previousGrantFunding: boolean | null;
  outstandingAcquittals: boolean | null;
  wishlist: Record<string, string[]>;
  applicationCount: number;
  pendingItemCount: number;
}

interface GrantApplication {
  id: string;
  grantId: string;
  grantName: string;
  grantProvider: string;
  grantType: string;
  amount: string;
  amountWon: string | null;
  closeDate: string | null;
  closeDateFormatted: string;
  closingSoon: boolean;
  applicationUrl: string | null;
  applicationStatus: string;
  interestStatus: string | null;
  interestSubmittedAt: string | null;
  submittedAt: string | null;
  draftingStatus: string;
  attachmentStatus: string;
  reviewStatus: string;
  lodgmentStatus: string;
  invoiceStatus: string;
  outcomeStatus: string;
  acquittalStatus: string;
  preparationStatus: string;
  projectDescription: string | null;
  probabilityOfSuccess: number | null;
  forecastedSuccessFee: number | null;
  successFeeAmount: string | null;
  outcomeDate: string | null;
  outcomeExpectedDate: string | null;
  applicationReference: string | null;
  assignedAE: string | null;
  grantWriter: string | null;
  reviewer: string | null;
  pendingItems: { id: string; name: string; type: string; description: string; status: string }[];
  pendingCount: number;
  invoice: { number: string; amount: string; status: string; date: string } | null;
}

// ═══════════════════════════════════
// PIPELINE STAGES
// ═══════════════════════════════════

const PIPELINE_STAGES: { key: string; label: string; style: string; iconBg: string }[] = [
  { key: "open_match",  label: "Open Match",   style: "bg-[#FEF3C7] text-[#92400E]",         iconBg: "bg-[#FEF3C7] text-[#92400E]" },
  { key: "proceeding",  label: "Proceeding",    style: "bg-warning-light text-[#9A3412]",      iconBg: "bg-warning-light text-[#9A3412]" },
  { key: "preparation", label: "Preparation",   style: "bg-[#F3E8FF] text-[#7C3AED]",         iconBg: "bg-[#F3E8FF] text-[#7C3AED]" },
  { key: "drafting",    label: "Drafting",       style: "bg-[#FFF7ED] text-[#C2410C]",         iconBg: "bg-[#FFF7ED] text-[#C2410C]" },
  { key: "attachments", label: "Attachments",    style: "bg-[#FEF3C7] text-[#78350F]",         iconBg: "bg-[#FEF3C7] text-[#78350F]" },
  { key: "review",      label: "Review",         style: "bg-[#E0E7FF] text-[#3730A3]",         iconBg: "bg-[#E0E7FF] text-[#3730A3]" },
  { key: "lodgment",    label: "Lodgment",       style: "bg-gp-blue-light text-gp-blue-dark",   iconBg: "bg-gp-blue-light text-gp-blue" },
  { key: "outcome",     label: "Outcome",        style: "bg-[#DBEAFE] text-[#1E40AF]",         iconBg: "bg-[#DBEAFE] text-[#1E40AF]" },
  { key: "acquittal",   label: "Acquittal",      style: "bg-[#D1FAE5] text-[#065F46]",         iconBg: "bg-[#D1FAE5] text-[#065F46]" },
  { key: "won",         label: "Won",            style: "bg-success-light text-success",         iconBg: "bg-success-light text-success" },
  { key: "lost",        label: "Lost",           style: "bg-danger-light text-danger",           iconBg: "bg-danger-light text-danger" },
  { key: "dnl",         label: "DNL",            style: "bg-gray-100 text-gray-500",            iconBg: "bg-gray-100 text-gray-400" },
];

const STATUS_MAP = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.key, s]));

// Active pipeline keys for progress bar (excludes open_match, proceeding, terminal)
const PROGRESS_PIPELINE = ["preparation", "drafting", "attachments", "review", "lodgment", "outcome", "acquittal"];

// Sub-status definitions with valid values
const SUB_STATUS_CONFIG: { key: string; label: string; dbField: string; options: { value: string; label: string }[] }[] = [
  { key: "preparationStatus", label: "Prep",        dbField: "preparationStatus", options: [{ value: "pending", label: "Pending" }, { value: "complete", label: "Complete" }] },
  { key: "draftingStatus",    label: "Drafting",     dbField: "draftingStatus",    options: [{ value: "pending", label: "Pending" }, { value: "wip", label: "WIP" }, { value: "loaded", label: "Loaded" }, { value: "complete", label: "Complete" }] },
  { key: "attachmentStatus",  label: "Attachments",  dbField: "attachmentStatus",  options: [{ value: "pending", label: "Pending" }, { value: "loaded", label: "Loaded" }] },
  { key: "reviewStatus",      label: "Review",       dbField: "reviewStatus",      options: [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }] },
  { key: "lodgmentStatus",    label: "Lodgment",     dbField: "lodgmentStatus",    options: [{ value: "pending", label: "Pending" }, { value: "lodged", label: "Lodged" }] },
  { key: "outcomeStatus",     label: "Outcome",      dbField: "outcomeStatus",     options: [{ value: "pending", label: "Pending" }, { value: "lodged", label: "Lodged" }, { value: "pending outcome", label: "Pending Outcome" }] },
  { key: "acquittalStatus",   label: "Acquittal",    dbField: "acquittalStatus",   options: [{ value: "pending", label: "Pending" }, { value: "pending outcome", label: "Pending Outcome" }] },
];

// ═══════════════════════════════════
// SHARED HELPER COMPONENTS
// ═══════════════════════════════════

function Tabs({ tabs, activeTab, onChange }: { tabs: { key: string; label: string; count?: number }[]; activeTab: string; onChange: (key: string) => void }) {
  return (
    <div className="flex bg-white border border-gray-200 rounded-t-xl border-b-0 px-2 md:px-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className={`px-3 md:px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap bg-transparent cursor-pointer ${activeTab === tab.key ? "text-gp-blue border-gp-blue" : "text-gray-600 border-transparent hover:text-gray-900"}`}>
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? "bg-gp-blue-light text-gp-blue-dark" : "bg-gray-100 text-gray-600"}`}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[0.9375rem] font-medium text-gray-900">{value || <span className="text-gray-400">—</span>}</div>
    </div>
  );
}

function InfoSection({ title, children, noBorder }: { title: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className={noBorder ? "" : "pb-8 border-b border-gray-200"}>
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Status badge (static) ──
function GrantStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || STATUS_MAP.open_match;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide ${config.style}`}>
      {config.label}
    </span>
  );
}

// ── Dropdown component (reusable for status and sub-statuses) ──
function StatusDropdown({
  value,
  options,
  onChange,
  saving,
  label,
}: {
  value: string;
  options: { value: string; label: string; style?: string }[];
  onChange: (newValue: string) => void;
  saving?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      {label && <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>}
      <button
        onClick={() => !saving && setOpen(!open)}
        disabled={saving}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer border border-gray-200 bg-white transition-all hover:border-gray-400 disabled:opacity-50 ${saving ? "" : "hover:shadow-sm"}`}
      >
        {saving ? <span className="text-gray-400">...</span> : <span className="capitalize">{current?.label || value}</span>}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-gray-400"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
          {options.map((opt) => (
            <button key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer border-0 bg-transparent transition-colors ${opt.value === value ? "bg-gray-50 font-semibold text-gp-blue" : "hover:bg-gray-50 text-gray-700"}`}>
              {opt.label}
              {opt.value === value && <span className="float-right text-gp-blue">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Editable application status dropdown ──
function EditableAppStatus({
  appId,
  clubId,
  currentStatus,
  onStatusChange,
}: {
  appId: string;
  clubId: string;
  currentStatus: string;
  onStatusChange: (appId: string, newStatus: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const config = STATUS_MAP[currentStatus] || STATUS_MAP.open_match;

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${clubId}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) onStatusChange(appId, newStatus);
    } catch (err) { console.error("Failed to update status:", err); }
    finally { setSaving(false); }
  };

  const statusOptions = PIPELINE_STAGES.map((s) => ({ value: s.key, label: s.label, style: s.style }));

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider text-right">Status</div>
      <button onClick={() => !saving && setOpen(!open)} disabled={saving}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide cursor-pointer border-0 transition-all ${config.style} ${saving ? "opacity-50" : "hover:ring-2 hover:ring-gp-blue/30"}`}>
        {saving ? "..." : config.label}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[180px] max-h-[360px] overflow-y-auto">
          {PIPELINE_STAGES.map((stage) => (
            <button key={stage.key}
              onClick={() => { handleChange(stage.key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent ${stage.key === currentStatus ? "bg-gray-50 font-semibold" : "hover:bg-gray-50"}`}>
              <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${stage.style.split(" ")[0]}`} />
              {stage.label}
              {stage.key === currentStatus && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 ml-auto text-gp-blue"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-status pill colors ──
const SUB_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  wip: "bg-warning-light text-[#9A3412]",
  loaded: "bg-gp-blue-light text-gp-blue-dark",
  complete: "bg-success-light text-success",
  approved: "bg-success-light text-success",
  lodged: "bg-gp-blue-light text-gp-blue-dark",
  invoiced: "bg-[#E0E7FF] text-[#3730A3]",
  paid: "bg-success-light text-success",
  "pending outcome": "bg-[#FEF3C7] text-[#92400E]",
};

// ── Pipeline progress indicator ──
function PipelineProgress({ currentStage }: { currentStage: string }) {
  const currentIndex = PROGRESS_PIPELINE.indexOf(currentStage);
  if (currentIndex === -1) return null;

  return (
    <div className="flex items-center gap-1 px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50">
      {PROGRESS_PIPELINE.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1 flex-1">
          <div className={`h-2 rounded-full flex-1 ${i < currentIndex ? "bg-success" : i === currentIndex ? "bg-gp-blue" : "bg-gray-200"}`} />
          {i < PROGRESS_PIPELINE.length - 1 && <div className="w-0.5" />}
        </div>
      ))}
      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{STATUS_MAP[currentStage]?.label || currentStage}</span>
    </div>
  );
}

// ── Icons ──
const EditIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const InvoicesIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const FilesIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const DocIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const MatchIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;

// ═══════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════

export default function ClubProfileView() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("info");
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [apps, setApps] = useState<GrantApplication[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/clubs/${id}`).then((r) => r.json()),
      fetch(`/api/clubs/${id}/applications`).then((r) => r.json()),
    ])
      .then(([clubData, appsData]) => {
        if (clubData.error) throw new Error(clubData.error);
        setClub(clubData);
        setApps(appsData.applications || []);
        setStatusCounts(appsData.statusCounts || {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Handler for updating app status or sub-status locally
  const updateAppField = useCallback((appId: string, field: string, value: string) => {
    setApps((prev) => {
      const updated = prev.map((a) => a.id === appId ? { ...a, [field]: value } : a);
      // Recompute status counts
      const counts: Record<string, number> = {};
      updated.forEach((a) => { counts[a.applicationStatus] = (counts[a.applicationStatus] || 0) + 1; });
      setStatusCounts(counts);
      return updated;
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <svg className="w-6 h-6 animate-spin mx-auto mb-3 text-gp-blue" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" /></svg>
        Loading club profile...
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-600 mb-2">Failed to load club</div>
        <div className="text-sm text-gray-500">{error}</div>
        <Link href="/manage-clubs" className="text-gp-blue mt-4 inline-block">← Back to Manage Clubs</Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: "Dashboard", href: "/admin-dashboard" },
        { label: "Manage Clubs", href: "/manage-clubs" },
        { label: club.shortName },
      ]} />

      {/* Club Header Card */}
      <Card className="mb-6">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex gap-4 items-start">
              <ClubAvatar initials={club.initials} size="lg" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
                  {club.name}
                  <PlanBadge plan={club.plan} />
                </h1>
                <p className="text-[0.9375rem] text-gray-600 mt-1">{club.sport} · {club.lga}, {club.state}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/manage-clubs/${id}/edit`} className="no-underline"><Button icon={EditIcon}>Edit Club Details</Button></Link>
              <Link href={`/manage-clubs/${id}/invoices`} className="no-underline"><Button icon={InvoicesIcon}>Invoices</Button></Link>
              <Button icon={FilesIcon}>Files</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 pt-6 border-t border-gray-200">
            <InfoItem label="Account Executive" value={club.ae} />
            <InfoItem label="Primary Contact" value={club.primaryContact ? <a href={`mailto:${club.primaryContact.email}`} className="text-gp-blue no-underline hover:underline">{club.primaryContact.name}</a> : "—"} />
            <InfoItem label="Active Grants" value={`${club.applicationCount} applications`} />
            <InfoItem label="Pending Items" value={club.pendingItemCount > 0 ? <span className="text-warning">{club.pendingItemCount} items</span> : "0 items"} />
            <InfoItem label="Status" value={club.subscriptionActive ? <span className="text-success">Active</span> : <span className="text-gray-500">Inactive</span>} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "info", label: "Club Information" },
          { key: "grants", label: "Grant Opportunities", count: apps.length },
          { key: "settings", label: "Account Settings" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="bg-white border border-gray-200 rounded-b-xl p-4 md:p-8">
        {activeTab === "info" && <ClubInfoTab club={club} />}
        {activeTab === "grants" && <GrantsTab apps={apps} statusCounts={statusCounts} clubId={club.id} onUpdateApp={updateAppField} />}
        {activeTab === "settings" && <SettingsTab club={club} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// TAB: Club Information
// ═══════════════════════════════════

function ClubInfoTab({ club }: { club: ClubProfile }) {
  return (
    <div className="space-y-8">
      <InfoSection title="Identity & Legal Status">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <InfoItem label="Legal Entity Name" value={club.name} />
          <InfoItem label="Shortened Name" value={club.shortName} />
          <InfoItem label="ABN" value={club.abn} />
          <InfoItem label="Entity Type" value={club.entityType} />
          <InfoItem label="GST Registered" value={club.gstRegistered === null ? "—" : club.gstRegistered ? "Yes" : "No"} />
          <InfoItem label="DGR Status" value={club.dgrStatus === null ? "—" : club.dgrStatus ? "Yes" : "No"} />
        </div>
      </InfoSection>

      <InfoSection title="Addresses">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <InfoItem label="Organisation Address" value={club.addresses.organisation} />
          <InfoItem label="Postal Address" value={club.addresses.postal} />
          <InfoItem label="Activity Address" value={club.addresses.activity} />
        </div>
      </InfoSection>

      <InfoSection title="Contacts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {club.primaryContact && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Primary Contact</span>
                {club.primaryContact.isAuthorized && <span className="text-[0.6875rem] px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded font-medium">Authorised to submit applications</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Name" value={club.primaryContact.name} />
                <InfoItem label="Position" value={club.primaryContact.position} />
                <InfoItem label="Email" value={<a href={`mailto:${club.primaryContact.email}`} className="text-gp-blue no-underline">{club.primaryContact.email}</a>} />
                <InfoItem label="Mobile" value={club.primaryContact.mobile} />
              </div>
            </div>
          )}
          {club.secondaryContact && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4"><span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Secondary Contact</span></div>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Name" value={club.secondaryContact.name} />
                <InfoItem label="Position" value={club.secondaryContact.position} />
                <InfoItem label="Email" value={<a href={`mailto:${club.secondaryContact.email}`} className="text-gp-blue no-underline">{club.secondaryContact.email}</a>} />
                <InfoItem label="Mobile" value={club.secondaryContact.mobile} />
              </div>
            </div>
          )}
          {!club.primaryContact && !club.secondaryContact && <p className="text-gray-500 text-sm">No contacts on file</p>}
        </div>
      </InfoSection>

      {(club.about || club.yearEstablished) && (
        <InfoSection title="Organisation Overview">
          {club.about && <div className="mb-6"><div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-2">About the Organisation</div><p className="text-[0.9375rem] text-gray-700 leading-relaxed">{club.about}</p></div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <InfoItem label="Year Established" value={club.yearEstablished} />
            <InfoItem label="Total Members" value={club.totalMembers} />
            <InfoItem label="Active Volunteers" value={club.activeVolunteers} />
          </div>
        </InfoSection>
      )}

      {Object.keys(club.wishlist).length > 0 && (
        <InfoSection title="Funding Wishlist">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(club.wishlist).map(([category, items]) => (
              <div key={category}>
                <div className="text-sm font-semibold text-gray-700 mb-2">{category}</div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => <span key={item} className="px-3 py-1.5 bg-gp-blue-light text-gp-blue-dark rounded-full text-xs font-medium">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </InfoSection>
      )}

      <InfoSection title="Financial Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InfoItem label="Previously Managed Grant Funding" value={club.previousGrantFunding === null ? "—" : club.previousGrantFunding ? "Yes" : "No"} />
          <InfoItem label="Outstanding Grant Acquittals" value={club.outstandingAcquittals === null ? "—" : club.outstandingAcquittals ? "Yes" : "No"} />
        </div>
      </InfoSection>

      <InfoSection title="Communications & Online Presence" noBorder>
        <div className="flex flex-wrap gap-3">
          {club.website && <a href={`https://${club.website}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>{club.website}</a>}
          {club.facebook && <a href={`https://${club.facebook}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>Facebook</a>}
          {club.instagram && <a href={`https://${club.instagram}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>Instagram</a>}
          {!club.website && !club.facebook && !club.instagram && <p className="text-gray-500 text-sm">No online presence recorded</p>}
        </div>
      </InfoSection>
    </div>
  );
}

// ═══════════════════════════════════
// TAB: Grant Opportunities
// ═══════════════════════════════════

function GrantsTab({ apps, statusCounts, clubId, onUpdateApp }: {
  apps: GrantApplication[];
  statusCounts: Record<string, number>;
  clubId: string;
  onUpdateApp: (appId: string, field: string, value: string) => void;
}) {
  const [grantFilter, setGrantFilter] = useState("all");

  const filteredApps = grantFilter === "all" ? apps : apps.filter((a) => a.applicationStatus === grantFilter);

  const filterTabs = [
    { key: "all", label: "All", count: apps.length },
    ...PIPELINE_STAGES.map((stage) => ({ key: stage.key, label: stage.label, count: statusCounts[stage.key] || 0 })),
  ];

  // PATCH helper for sub-status changes
  const handleSubStatusChange = async (appId: string, fieldKey: string, newValue: string) => {
    onUpdateApp(appId, fieldKey, newValue); // optimistic
    try {
      await fetch(`/api/clubs/${clubId}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldKey]: newValue }),
      });
    } catch (err) { console.error("Failed to update sub-status:", err); }
  };

  const handleStatusChange = (appId: string, newStatus: string) => {
    onUpdateApp(appId, "applicationStatus", newStatus);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Grant Opportunities</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button key={tab.key} onClick={() => setGrantFilter(tab.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${grantFilter === tab.key ? "bg-gp-blue text-white border-gp-blue" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No applications match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <GrantCard
              key={app.id}
              app={app}
              clubId={clubId}
              onStatusChange={handleStatusChange}
              onSubStatusChange={handleSubStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// GRANT CARD
// ═══════════════════════════════════

function GrantCard({ app, clubId, onStatusChange, onSubStatusChange }: {
  app: GrantApplication;
  clubId: string;
  onStatusChange: (appId: string, newStatus: string) => void;
  onSubStatusChange: (appId: string, fieldKey: string, newValue: string) => void;
}) {
  const config = STATUS_MAP[app.applicationStatus] || STATUS_MAP.open_match;
  const isOpenMatch = app.applicationStatus === "open_match";
  const isProceeding = app.applicationStatus === "proceeding";
  const isActivePipeline = PROGRESS_PIPELINE.includes(app.applicationStatus);
  const showSubStatuses = isProceeding || isActivePipeline;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* ── Card Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.iconBg}`}>
            {isOpenMatch ? MatchIcon : DocIcon}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{app.grantName}</div>
            <div className="text-[0.8125rem] text-gray-600 mt-0.5">
              {app.grantProvider} · {app.grantType}
              {app.projectDescription && ` · ${app.projectDescription}`}
            </div>
          </div>
        </div>
        <div className="flex gap-4 md:gap-6 items-center flex-wrap">
          <div className="text-right">
            <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Amount</div>
            <div className="text-sm font-medium">{app.amount}</div>
          </div>
          <div className="text-right">
            <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Close Date</div>
            <div className={`text-sm font-medium ${app.closingSoon ? "text-danger" : ""}`}>{app.closeDateFormatted}</div>
          </div>
          {app.interestStatus && (
            <div className="text-right">
              <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Interest</div>
              <InterestBadge status={app.interestStatus} />
            </div>
          )}
          {app.applicationReference && (
            <div className="text-right">
              <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Reference</div>
              <div className="text-xs font-mono text-gray-600">{app.applicationReference}</div>
            </div>
          )}
          {/* Editable status dropdown */}
          <EditableAppStatus appId={app.id} clubId={clubId} currentStatus={app.applicationStatus} onStatusChange={onStatusChange} />
        </div>
      </div>

      {/* ── Open Match: Interest Row ── */}
      {isOpenMatch && !app.interestStatus && (
        <OpenMatchInterestRow appId={app.id} clubId={clubId} />
      )}
      {isOpenMatch && app.interestStatus && (
        <div className={`flex items-center gap-3 px-4 md:px-6 py-3 border-t ${app.interestStatus === "interested" ? "bg-[#FEF3C7]" : "bg-gray-50"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" style={{ color: "#92400E" }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span className="text-sm">
            Club expressed interest
            {app.interestSubmittedAt && ` on ${new Date(app.interestSubmittedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
            {app.interestStatus === "interested" && " · "}
            {app.interestStatus === "interested" && <strong>Awaiting Grant Professional review for eligibility</strong>}
            {app.interestStatus === "not_interested" && " · Club is not interested"}
            {app.interestStatus === "need_info" && " · Club needs more information"}
          </span>
        </div>
      )}

      {/* ── Pipeline progress bar ── */}
      {isActivePipeline && <PipelineProgress currentStage={app.applicationStatus} />}

      {/* ── Editable Sub-statuses Row ── */}
      {showSubStatuses && (
        <div className="flex flex-wrap gap-3 items-center px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50">
          {SUB_STATUS_CONFIG.map((sub) => {
            const currentValue = (app as any)[sub.key] || "pending";
            return (
              <StatusDropdown
                key={sub.key}
                label={sub.label}
                value={currentValue}
                options={sub.options}
                onChange={(val) => onSubStatusChange(app.id, sub.key, val)}
              />
            );
          })}
          {app.assignedAE && (
            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-gray-500">AE:</span>
              <span className="font-medium text-gray-700">{app.assignedAE}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Pending Items Table (proceeding and beyond — always visible so admin can add items) ── */}
      {(isProceeding || isActivePipeline) && (
        <ProceedingPendingTable app={app} clubId={clubId} />
      )}

      {/* ── Outcome expected info ── */}
      {(app.applicationStatus === "outcome" || app.applicationStatus === "lodgment") && app.outcomeExpectedDate && (
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gp-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          {app.submittedAt && <>Application submitted {new Date(app.submittedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })} · </>}
          Outcome expected {new Date(app.outcomeExpectedDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      )}

      {/* ── Won details ── */}
      {app.applicationStatus === "won" && (
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-success-light">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Grant Amount</div><div className="text-sm font-semibold text-success">{app.amountWon || app.amount}</div></div>
            <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Outcome Date</div><div className="text-sm font-medium">{app.outcomeDate || "—"}</div></div>
            <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Success Fee</div><div className="text-sm font-medium">{app.successFeeAmount || "—"}</div></div>
            <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Invoice Status</div>{app.invoice ? <span className="inline-flex px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold bg-white text-success uppercase">{app.invoice.status}</span> : <span className="text-sm text-gray-500">No invoice</span>}</div>
          </div>
        </div>
      )}

      {/* ── Lost info ── */}
      {app.applicationStatus === "lost" && (
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-t border-gray-200 bg-danger-light text-sm text-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          Application unsuccessful{app.outcomeDate ? ` · Outcome received ${new Date(app.outcomeDate + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}` : ""}
        </div>
      )}

      {/* ── DNL info ── */}
      {app.applicationStatus === "dnl" && (
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          Did not proceed to lodgment
        </div>
      )}

      {/* ── Simple Pending Items (for open_match/won/lost/dnl only) ── */}
      {!isProceeding && !isActivePipeline && app.pendingCount > 0 && (
        <div className="px-4 md:px-6 py-4 border-t-[3px] border-[#FCD34D] bg-warning-light">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#9A3412] mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Pending Items from Club
            <span className="px-2 py-0.5 bg-[#FCD34D] text-[#78350F] rounded-full text-xs font-semibold">{app.pendingCount}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-lg overflow-hidden border border-[#FCD34D] min-w-[500px]">
              <thead className="bg-[#FEF3C7]"><tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Item</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Status</th>
              </tr></thead>
              <tbody>
                {app.pendingItems.filter((p) => p.status === "pending").map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="px-4 py-3"><div className="font-medium">{item.name}</div>{item.description && <div className="text-xs text-gray-500">{item.description}</div>}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded text-xs font-medium capitalize">{item.type}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-warning-light text-warning rounded text-xs font-medium capitalize">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// OPEN MATCH: Interest Selection Row
// ═══════════════════════════════════

function OpenMatchInterestRow({ appId, clubId }: { appId: string; clubId: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-4 border-t border-gray-200 bg-[#FEF3C7]">
      <div className="flex items-center gap-2 text-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" style={{ color: "#92400E" }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        <span>This grant matches the club profile. Awaiting club interest response.</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-gray-200 rounded-lg text-[0.8125rem] font-medium bg-white cursor-pointer transition-all hover:border-success hover:bg-success-light">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          Interested
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-gray-200 rounded-lg text-[0.8125rem] font-medium bg-white cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          Not Interested
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-gray-200 rounded-lg text-[0.8125rem] font-medium bg-white cursor-pointer transition-all hover:border-[#F59E0B] hover:bg-[#FEF3C7]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          Need More Info
        </button>
      </div>
    </div>
  );
}

// ── Interest Badge ──
function InterestBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    interested: "bg-success-light text-success",
    not_interested: "bg-gray-100 text-gray-600",
    need_info: "bg-[#FEF3C7] text-[#92400E]",
  };
  const labels: Record<string, string> = {
    interested: "Interested",
    not_interested: "Not Interested",
    need_info: "Need Info",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-semibold uppercase ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {labels[status] || status}
    </span>
  );
}

// ═══════════════════════════════════
// PROCEEDING+: Pending Items Table (always visible)
// ═══════════════════════════════════

function ProceedingPendingTable({ app, clubId }: { app: GrantApplication; clubId: string }) {
  const hasPendingItems = app.pendingItems.length > 0;

  return (
    <div className="border-t-[3px] border-[#FCD34D]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 bg-warning-light">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#9A3412]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          Pending Items from Club
          <span className="px-2 py-0.5 bg-[#FCD34D] text-[#78350F] rounded-full text-xs font-semibold">{app.pendingItems.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Item
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            Notify Club
          </button>
        </div>
      </div>
      {hasPendingItems ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-[#FEF3C7]">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Item</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Notes</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Response</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {app.pendingItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === "file" ? "bg-gp-blue-light text-gp-blue-dark" :
                      item.type === "confirmation" ? "bg-[#F3E8FF] text-[#7C3AED]" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {item.type === "file" ? "File Upload" : item.type === "confirmation" ? "Confirmation" : item.type === "text" ? "Text Response" : item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select className="px-2 py-1 border border-gray-200 rounded text-xs bg-white cursor-pointer" defaultValue={item.status}>
                      <option value="pending">Pending</option>
                      <option value="received">Received</option>
                      <option value="reviewing">Reviewing</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[0.8125rem] text-gray-500">{item.description || "—"}</td>
                  <td className="px-4 py-3">
                    {item.type === "file" ? (
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white cursor-pointer hover:bg-gray-50">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        Upload File
                      </button>
                    ) : item.status === "received" ? (
                      <div className="text-xs text-gray-600 max-w-[200px] truncate">Response submitted</div>
                    ) : (
                      <textarea className="w-full px-2 py-1 border border-gray-200 rounded text-xs resize-y min-h-[32px]" placeholder="Enter response..." />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 md:px-6 py-8 bg-white text-center">
          <div className="text-gray-400 mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 mx-auto"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></svg>
          </div>
          <p className="text-sm text-gray-500 mb-3">No pending items yet</p>
          <p className="text-xs text-gray-400">Add items the club needs to provide for this grant application.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════
// TAB: Account Settings
// ═══════════════════════════════════

function SettingsTab({ club }: { club: ClubProfile }) {
  return (
    <div className="space-y-8">
      <InfoSection title="Subscription Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <InfoItem label="Current Plan" value={<><PlanBadge plan={club.plan} /> <span className="ml-2 text-sm">{club.planLabel}</span></>} />
          <InfoItem label="Status" value={club.subscriptionActive ? <span className="text-success">Active</span> : <span className="text-gray-500">Inactive</span>} />
          <InfoItem label="Member Since" value={new Date(club.createdAt).toLocaleDateString("en-AU", { month: "long", year: "numeric" })} />
        </div>
      </InfoSection>

      <InfoSection title="Club Portal Access" noBorder>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span className="font-semibold text-gray-900">Club Passcode</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">This passcode allows club members to access the portal and submit information for grant applications.</p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-mono text-lg tracking-widest">••••••</div>
            <Button size="sm">Show</Button>
            <Button size="sm">Copy</Button>
          </div>
        </div>
      </InfoSection>
    </div>
  );
}