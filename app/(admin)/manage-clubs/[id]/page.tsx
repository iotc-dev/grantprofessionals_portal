"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/ui/badge";
import { ClubAvatar } from "@/components/ui/avatar";

// --- Sample Club Data ---

const club = {
  name: "Ryde Saints Junior Football Club",
  shortName: "Ryde Saints JFC",
  initials: "RS",
  plan: "GRP",
  planLabel: "Grant Ready Plan",
  sport: "AFL",
  lga: "City of Ryde",
  state: "NSW",
  ae: "John Smith",
  primaryContact: { name: "Rebecca Pezzutti", email: "rebecca@rydesaints.com.au" },
  activeGrants: "3 applications",
  pendingItems: "7 items",
  lastLogin: "2 hours ago",
  abn: "12 345 678 901",
  entityType: "Incorporated Association",
  gstRegistered: "No",
  dgrStatus: "No",
  established: "1985",
  members: "280",
  volunteers: "45",
  about:
    "Ryde Saints Junior Football Club was established in 1985 and has been serving the Ryde community for nearly 40 years. We provide Australian Rules Football programs for children aged 5-17, with a focus on skill development, teamwork, and community engagement. Our club fields 14 teams across various age groups and participates in the AFL Sydney Junior competitions.",
  orgAddress: "123 Ryde Road, West Ryde NSW 2114",
  postalAddress: "PO Box 456, West Ryde NSW 2114",
  activityAddress: "ELS Hall Park, Marsden Road, West Ryde NSW 2114",
  secondaryContact: { name: "Michael Chen", position: "Club President", email: "michael@rydesaints.com.au", mobile: "0434 567 890" },
  primaryPosition: "Club Secretary",
  primaryMobile: "0423 456 789",
  website: "rydesaintsjfc.com.au",
  facebook: "facebook.com/rydesaintsjfc",
  instagram: "instagram.com/rydesaintsjfc",
  grantHistory: "Yes",
  outstandingAcquittals: "No",
  wishlist: {
    Programs: ["Auskick Program", "Youth Leadership", "Coach Education"],
    Equipment: ["Goal Posts", "Training Equipment", "First Aid Kits"],
    "Facilities & Infrastructure": ["Clubhouse Renovation", "Lighting Upgrade"],
    "Lighting & Power": ["LED Flood Lights"],
  },
};

const grants = [
  {
    title: "Community Building Partnership 2026",
    subtitle: "State Government · Infrastructure",
    amount: "Up to $50,000",
    closeDate: "Feb 21, 2026",
    status: "open-match",
    statusLabel: "Open Match",
    iconType: "open-match",
    infoText: "This grant matches your club profile. Awaiting club interest.",
    infoBg: "",
  },
  {
    title: "Telstra Footy Grants 2026",
    subtitle: "Corporate · AFL Community",
    amount: "Up to $20,000",
    closeDate: "Mar 15, 2026",
    status: "open-match",
    statusLabel: "Open Match",
    iconType: "open-match",
    interest: "Interested",
    infoText: "Club expressed interest on Jan 18, 2026 · Awaiting Grant Professional review for eligibility",
    infoBg: "bg-[#FEF3C7]",
  },
  {
    title: "Stronger Communities Programme Round 10",
    subtitle: "Federal Government · Community Infrastructure",
    amount: "$20,000",
    closeDate: "Feb 14, 2026",
    closeDateUrgent: true,
    status: "proceeding",
    statusLabel: "Proceeding",
    iconType: "default",
    interest: "Interested",
    pendingItems: 3,
  },
  {
    title: "Local Sport Defibrillator Grant 2026",
    subtitle: "State Government · Equipment",
    amount: "$2,000",
    closeDate: "Mar 30, 2026",
    status: "lodged",
    statusLabel: "Lodged",
    iconType: "default",
    infoText: "Application submitted Jan 25, 2026 · Outcome expected Mar 15, 2026",
    infoBg: "",
    infoType: "success",
  },
  {
    title: "Sports Equipment Grant 2025",
    subtitle: "State Government · Equipment",
    amount: "$8,500",
    closeDate: "Aug 15, 2025",
    status: "won",
    statusLabel: "Won",
    iconType: "won",
    wonDetails: { amount: "$8,500", date: "Oct 20, 2025", fee: "$850", invoiceStatus: "Paid" },
  },
  {
    title: "Community Infrastructure Grant 2025",
    subtitle: "Local Council · Infrastructure",
    amount: "$15,000",
    closeDate: "Jul 30, 2025",
    status: "lost",
    statusLabel: "Lost",
    iconType: "lost",
    infoText: "Application unsuccessful · Outcome received Sep 15, 2025",
    infoBg: "bg-danger-light",
    infoType: "danger",
  },
];

// --- Status Badge for Grants ---
function GrantStatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    "open-match": "bg-[#FEF3C7] text-[#92400E]",
    proceeding: "bg-warning-light text-[#9A3412]",
    lodged: "bg-gp-blue-light text-gp-blue-dark",
    stage2: "bg-[#EDE9FE] text-[#6D28D9]",
    won: "bg-success-light text-success",
    lost: "bg-danger-light text-danger",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold uppercase tracking-wide ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

// --- Tab Component ---
function Tabs({ tabs, activeTab, onChange }: { tabs: { key: string; label: string; count?: number }[]; activeTab: string; onChange: (key: string) => void }) {
  return (
    <div className="flex bg-white border border-gray-200 rounded-t-xl border-b-0 px-2 md:px-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 md:px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap bg-transparent cursor-pointer ${
            activeTab === tab.key
              ? "text-gp-blue border-gp-blue"
              : "text-gray-600 border-transparent hover:text-gray-900"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? "bg-gp-blue-light text-gp-blue-dark" : "bg-gray-100 text-gray-600"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// --- Info Item ---
function InfoItem({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[0.9375rem] font-medium text-gray-900">{value}</div>
    </div>
  );
}

// --- Main Page ---
export default function ClubProfileView() {
  const [activeTab, setActiveTab] = useState("info");

  const EditIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

  const FilesIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );

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
          {/* Top row: avatar + name + actions */}
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
              <Link href={`/manage-clubs/rs/edit`} className="no-underline">
                <Button icon={EditIcon}>Edit Club Details</Button>
              </Link>
              <Button icon={FilesIcon}>Files</Button>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 pt-6 border-t border-gray-200">
            <InfoItem label="Account Executive" value={club.ae} />
            <InfoItem label="Primary Contact" value={
              <a href={`mailto:${club.primaryContact.email}`} className="text-gp-blue no-underline hover:underline">{club.primaryContact.name}</a>
            } />
            <InfoItem label="Active Grants" value={club.activeGrants} />
            <InfoItem label="Pending Items" value={<span className="text-warning">{club.pendingItems}</span>} />
            <InfoItem label="Last Login" value={<span className="text-success">{club.lastLogin}</span>} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "info", label: "Club Information" },
          { key: "grants", label: "Grant Opportunities", count: 6 },
          { key: "settings", label: "Account Settings" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-b-xl p-4 md:p-8">
        {activeTab === "info" && <ClubInfoTab />}
        {activeTab === "grants" && <GrantsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// =====================
// TAB: Club Information
// =====================
function ClubInfoTab() {
  return (
    <div className="space-y-8">
      {/* Identity & Legal */}
      <InfoSection title="Identity & Legal Status">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <InfoItem label="Legal Entity Name" value={club.name + " Incorporated"} />
          <InfoItem label="Shortened Name" value={club.shortName} />
          <InfoItem label="ABN" value={club.abn} />
          <InfoItem label="Entity Type" value={club.entityType} />
          <InfoItem label="GST Registered" value={club.gstRegistered} />
          <InfoItem label="DGR Status" value={club.dgrStatus} />
        </div>
      </InfoSection>

      {/* Addresses */}
      <InfoSection title="Addresses">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <InfoItem label="Organisation Address" value={club.orgAddress} />
          <InfoItem label="Postal Address" value={club.postalAddress} />
          <InfoItem label="Activity Address" value={club.activityAddress} />
        </div>
      </InfoSection>

      {/* Contacts */}
      <InfoSection title="Contacts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Primary Contact</span>
              <span className="text-[0.6875rem] px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded font-medium">Authorised to submit applications</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={club.primaryContact.name} />
              <InfoItem label="Position" value={club.primaryPosition} />
              <InfoItem label="Email" value={<a href={`mailto:${club.primaryContact.email}`} className="text-gp-blue no-underline">{club.primaryContact.email}</a>} />
              <InfoItem label="Mobile" value={club.primaryMobile} />
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Secondary Contact</span>
              <span className="text-[0.6875rem] px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded font-medium">Authorised for correspondence</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Name" value={club.secondaryContact.name} />
              <InfoItem label="Position" value={club.secondaryContact.position} />
              <InfoItem label="Email" value={<a href={`mailto:${club.secondaryContact.email}`} className="text-gp-blue no-underline">{club.secondaryContact.email}</a>} />
              <InfoItem label="Mobile" value={club.secondaryContact.mobile} />
            </div>
          </div>
        </div>
      </InfoSection>

      {/* Organisation Overview */}
      <InfoSection title="Organisation Overview">
        <div className="mb-6">
          <div className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider mb-2">About the Organisation</div>
          <p className="text-[0.9375rem] text-gray-700 leading-relaxed">{club.about}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <InfoItem label="Year Established" value={club.established} />
          <InfoItem label="Total Members" value={club.members} />
          <InfoItem label="Active Volunteers" value={club.volunteers} />
        </div>
      </InfoSection>

      {/* Wishlist */}
      <InfoSection title="Funding Wishlist">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(club.wishlist).map(([category, items]) => (
            <div key={category}>
              <div className="text-sm font-semibold text-gray-700 mb-2">{category}</div>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-gp-blue-light text-gp-blue-dark rounded-full text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </InfoSection>

      {/* Financial */}
      <InfoSection title="Financial Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InfoItem label="Previously Managed Grant Funding" value={club.grantHistory} />
          <InfoItem label="Outstanding Grant Acquittals" value={club.outstandingAcquittals} />
        </div>
      </InfoSection>

      {/* Online Presence */}
      <InfoSection title="Communications & Online Presence" noBorder>
        <div className="flex flex-wrap gap-3">
          <a href={`https://${club.website}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {club.website}
          </a>
          <a href={`https://${club.facebook}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            Facebook
          </a>
          <a href={`https://${club.instagram}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            Instagram
          </a>
        </div>
      </InfoSection>
    </div>
  );
}

// =====================
// TAB: Grant Opportunities
// =====================
function GrantsTab() {
  const [grantFilter, setGrantFilter] = useState("all");

  const filteredGrants = grantFilter === "all"
    ? grants
    : grants.filter((g) => g.status === grantFilter);

  const filterTabs = [
    { key: "all", label: "All", count: 6 },
    { key: "open-match", label: "Open Match", count: 2 },
    { key: "proceeding", label: "Proceeding", count: 1 },
    { key: "lodged", label: "Lodged", count: 1 },
    { key: "stage2", label: "Stage 2", count: 0 },
    { key: "won", label: "Won", count: 1 },
    { key: "lost", label: "Lost", count: 1 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Grant Opportunities</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setGrantFilter(tab.key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
              grantFilter === tab.key
                ? "bg-gp-blue text-white border-gp-blue"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Grant cards */}
      <div className="space-y-4">
        {filteredGrants.map((grant) => (
          <div key={grant.title} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Grant header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  grant.iconType === "won" ? "bg-success-light text-success" :
                  grant.iconType === "lost" ? "bg-danger-light text-danger" :
                  grant.iconType === "open-match" ? "bg-[#FEF3C7] text-[#92400E]" :
                  "bg-gp-blue-light text-gp-blue"
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{grant.title}</div>
                  <div className="text-[0.8125rem] text-gray-600 mt-0.5">{grant.subtitle}</div>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6 items-center flex-wrap">
                <div className="text-right">
                  <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Amount</div>
                  <div className="text-sm font-medium">{grant.amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Close Date</div>
                  <div className={`text-sm font-medium ${grant.closeDateUrgent ? "text-danger" : ""}`}>{grant.closeDate}</div>
                </div>
                {grant.interest && (
                  <div className="text-right">
                    <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Interest</div>
                    <span className="inline-flex px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold bg-success-light text-success uppercase">
                      {grant.interest}
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider">Status</div>
                  <GrantStatusBadge status={grant.status} label={grant.statusLabel} />
                </div>
              </div>
            </div>

            {/* Info row */}
            {grant.infoText && (
              <div className={`flex items-center gap-3 px-4 md:px-6 py-3 border-t border-gray-200 text-sm ${grant.infoBg || "bg-gray-50"} ${
                grant.infoType === "success" ? "text-success" : grant.infoType === "danger" ? "text-danger" : "text-[#92400E]"
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                <span>{grant.infoText}</span>
              </div>
            )}

            {/* Won details */}
            {grant.wonDetails && (
              <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-success-light">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Grant Amount</div><div className="text-sm font-semibold text-success">{grant.wonDetails.amount}</div></div>
                  <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Outcome Date</div><div className="text-sm font-medium">{grant.wonDetails.date}</div></div>
                  <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Success Fee (10%)</div><div className="text-sm font-medium">{grant.wonDetails.fee}</div></div>
                  <div><div className="text-[0.625rem] text-success uppercase tracking-wider font-semibold">Invoice Status</div><span className="inline-flex px-2.5 py-1 rounded-md text-[0.6875rem] font-semibold bg-white text-success uppercase">{grant.wonDetails.invoiceStatus}</span></div>
                </div>
              </div>
            )}

            {/* Pending items (for Proceeding grants) */}
            {grant.pendingItems && (
              <div className="px-4 md:px-6 py-4 border-t-[3px] border-[#FCD34D] bg-warning-light">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#9A3412]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    Pending Items from Club
                    <span className="px-2 py-0.5 bg-[#FCD34D] text-[#78350F] rounded-full text-xs font-semibold">{grant.pendingItems}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-[#9A3412] italic">Last reminder: Jan 20, 2026</span>
                    <Button size="sm">Notify AE</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-lg overflow-hidden border border-[#FCD34D] min-w-[600px]">
                    <thead className="bg-[#FEF3C7]">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Item</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Type</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#92400E] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3"><div className="font-medium">Certificate of Incorporation</div><div className="text-xs text-gray-500">Current certificate showing legal entity status</div></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded text-xs font-medium">File Upload</span></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-warning-light text-warning rounded text-xs font-medium">Pending</span></td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3"><div className="font-medium">Project Quotes</div><div className="text-xs text-gray-500">Minimum 2 quotes for proposed works</div></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-gp-blue-light text-gp-blue-dark rounded text-xs font-medium">File Upload</span></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-warning-light text-warning rounded text-xs font-medium">Pending</span></td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-3"><div className="font-medium">Project Description</div><div className="text-xs text-gray-500">Detailed description of proposed project</div></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-[#E0F2FE] text-[#0369A1] rounded text-xs font-medium">Text Input</span></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-warning-light text-warning rounded text-xs font-medium">Pending</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================
// TAB: Account Settings
// =====================
function SettingsTab() {
  return (
    <div className="space-y-8">
      <InfoSection title="Subscription Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <InfoItem label="Current Plan" value={<><PlanBadge plan="GRP" /> <span className="ml-2 text-sm">Grant Ready Plan</span></>} />
          <InfoItem label="Next Payment" value="March 15, 2026" />
          <InfoItem label="Payment Method" value="Visa ending in 4242" />
          <InfoItem label="Member Since" value="March 2024" />
        </div>
      </InfoSection>

      <InfoSection title="Club Portal Access" noBorder>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="font-semibold text-gray-900">Club Passcode</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">This passcode allows club members to access the portal and submit information for grant applications.</p>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-mono text-lg tracking-widest">
              ••••••
            </div>
            <Button size="sm">Show</Button>
            <Button size="sm">Copy</Button>
          </div>
        </div>
      </InfoSection>
    </div>
  );
}

// --- Info Section wrapper ---
function InfoSection({ title, children, noBorder }: { title: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div className={noBorder ? "" : "pb-8 border-b border-gray-200"}>
      <h3 className="text-base font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}