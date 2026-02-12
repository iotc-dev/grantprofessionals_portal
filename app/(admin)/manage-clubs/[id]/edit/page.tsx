"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/ui/badge";

// --- Section Navigation ---
const sections = [
  { key: "identity", label: "Identity & Legal" },
  { key: "location", label: "Address & Location" },
  { key: "contacts", label: "Contacts" },
  { key: "overview", label: "Organisation Overview" },
  { key: "wishlist", label: "Funding Wishlist" },
  { key: "financial", label: "Financial Data" },
  { key: "communications", label: "Communications" },
  { key: "settings", label: "Account Settings" },
];

// --- Reusable Form Components ---

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-600 mb-8">{description}</p>
      {children}
    </div>
  );
}

function Subsection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-[0.9375rem] font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
        {icon && <span className="text-gp-blue [&>svg]:w-[18px] [&>svg]:h-[18px]">{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function FormGroup({ label, required, fullWidth, hint, children }: { label: string; required?: boolean; fullWidth?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block mb-2 font-medium text-gray-900 text-sm">
        {label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-[0.8125rem] text-gray-500">{hint}</div>}
    </div>
  );
}

function Input({ type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15"
      {...props}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15" {...props}>
      {children}
    </select>
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-y min-h-[100px] transition-all focus:outline-none focus:border-gp-blue focus:ring-2 focus:ring-gp-blue/15" {...props} />
  );
}

function RadioGroup({ name, options, defaultValue }: { name: string; options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
          <input type="radio" name={name} value={opt.value} defaultChecked={opt.value === defaultValue} className="w-[18px] h-[18px] accent-gp-blue cursor-pointer" />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function CheckboxGrid({ items }: { items: { id: string; label: string; checked?: boolean }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700">
          <input type="checkbox" id={item.id} defaultChecked={item.checked} className="w-[18px] h-[18px] accent-gp-blue cursor-pointer" />
          {item.label}
        </label>
      ))}
    </div>
  );
}

function InfoBox({ type, children }: { type: "warning" | "info"; children: React.ReactNode }) {
  const styles = type === "warning"
    ? "bg-warning-light border-l-[3px] border-l-warning text-[#9A3412]"
    : "bg-gp-blue-light border-l-[3px] border-l-gp-blue text-gp-blue-dark";
  return (
    <div className={`p-4 rounded-lg text-sm flex items-start gap-3 ${styles}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 mt-0.5">
        {type === "warning" ? (
          <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
        ) : (
          <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}

function FormNav({ activeIdx, onPrev, onNext, isFirst, isLast }: { activeIdx: number; onPrev: () => void; onNext: () => void; isFirst: boolean; isLast: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-8 pt-6 border-t border-gray-200 gap-3">
      {!isFirst ? (
        <Button onClick={onPrev} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>}>
          Previous
        </Button>
      ) : (
        <Link href="/manage-clubs/rs" className="no-underline"><Button>Cancel</Button></Link>
      )}
      {isLast ? (
        <Button variant="primary" onClick={() => alert("Changes saved! (Will save to Supabase later)")} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>}>
          Save All Changes
        </Button>
      ) : (
        <Button variant="primary" onClick={onNext}>
          Next: {sections[activeIdx + 1]?.label}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 ml-1"><polyline points="9 18 15 12 9 6" /></svg>
        </Button>
      )}
    </div>
  );
}

// --- State Dropdown ---
const stateOptions = (
  <>
    <option value="NSW">NSW</option>
    <option value="VIC">VIC</option>
    <option value="QLD">QLD</option>
    <option value="SA">SA</option>
    <option value="WA">WA</option>
    <option value="TAS">TAS</option>
    <option value="ACT">ACT</option>
    <option value="NT">NT</option>
  </>
);

// --- SVG Icons ---
const docIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const taxIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
const houseIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const pinIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const mailIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const compassIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
const personIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const peopleIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const infoIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
const globeIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const dollarIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const lockIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

// === MAIN PAGE ===
export default function ClubEditForm() {
  const [activeIdx, setActiveIdx] = useState(0);

  const goNext = () => {
    if (activeIdx < sections.length - 1) {
      setActiveIdx(activeIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goPrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Breadcrumb items={[
        { label: "Dashboard", href: "/admin-dashboard" },
        { label: "Manage Clubs", href: "/manage-clubs" },
        { label: "Ryde Saints JFC", href: "/manage-clubs/rs" },
        { label: "Edit" },
      ]} />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
          Ryde Saints Junior Football Club
          <PlanBadge plan="GRP" />
        </h1>
        <p className="text-sm text-gray-600 mt-1">Edit your club profile information</p>
      </div>

      {/* Section Nav */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-6 flex gap-2 overflow-x-auto">
        {sections.map((sec, i) => (
          <button
            key={sec.key}
            onClick={() => { setActiveIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`px-3 md:px-4 py-2 border rounded-lg text-[0.8125rem] font-medium whitespace-nowrap cursor-pointer transition-all ${
              i === activeIdx
                ? "bg-gp-blue text-white border-gp-blue"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <Card className="p-4 md:p-8">
        {activeIdx === 0 && <IdentitySection />}
        {activeIdx === 1 && <LocationSection />}
        {activeIdx === 2 && <ContactsSection />}
        {activeIdx === 3 && <OverviewSection />}
        {activeIdx === 4 && <WishlistSection />}
        {activeIdx === 5 && <FinancialSection />}
        {activeIdx === 6 && <CommunicationsSection />}
        {activeIdx === 7 && <SettingsSection />}

        <FormNav activeIdx={activeIdx} onPrev={goPrev} onNext={goNext} isFirst={activeIdx === 0} isLast={activeIdx === sections.length - 1} />
      </Card>
    </div>
  );
}

// ========================
// SECTION 1: Identity
// ========================
function IdentitySection() {
  return (
    <FormSection title="Organisation Identity & Legal Status" description="Update your organisation's legal and registration details">
      <Subsection title="Legal Information" icon={docIcon}>
        <FormGrid>
          <FormGroup label="Legal Entity Name / Club Name" required><Input defaultValue="Ryde Saints Junior Football Club Incorporated" /></FormGroup>
          <FormGroup label="Shortened Name" required><Input defaultValue="Ryde Saints JFC" /></FormGroup>
          <FormGroup label="ABN" required><Input defaultValue="12 345 678 901" /></FormGroup>
          <FormGroup label="GST Number"><Input placeholder="If registered for GST" /></FormGroup>
          <FormGroup label="ACN / Incorporation Number"><Input defaultValue="INC9876543" /></FormGroup>
          <FormGroup label="ACNC Registration Number"><Input placeholder="If applicable" /></FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Tax Status" icon={taxIcon}>
        <FormGroup label="DGR Endorsed" required>
          <RadioGroup name="dgr" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="no" />
        </FormGroup>
        <div className="mt-4">
          <FormGroup label="Tax Concessions">
            <CheckboxGrid items={[
              { id: "tax-income", label: "Income tax exempt", checked: true },
              { id: "tax-gst", label: "GST concessions" },
              { id: "tax-fbt", label: "FBT (Fringe Benefits Tax) concessions" },
              { id: "tax-dgr", label: "DGR-related tax concessions" },
            ]} />
          </FormGroup>
        </div>
      </Subsection>

      <Subsection title="Entity Type" icon={houseIcon}>
        <FormGroup label="Select Entity Type" required>
          <Select defaultValue="incorporated">
            <option value="incorporated">Incorporated not-for-profit organisation</option>
            <option value="company">Company limited by guarantee</option>
            <option value="cooperative">Non-distributing co-operative</option>
            <option value="indigenous">Australian Indigenous corporation</option>
            <option value="religious">Religious organisation</option>
            <option value="trustee">Incorporated trustee</option>
            <option value="local-gov">Local governing body</option>
            <option value="state-gov">State government agency</option>
            <option value="other">Other eligible organisation</option>
          </Select>
        </FormGroup>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 2: Address
// ========================
function LocationSection() {
  return (
    <FormSection title="Address & Location Details" description="Update your organisation's physical and postal addresses">
      <Subsection title="Organisation Physical Address" icon={pinIcon}>
        <FormGrid>
          <FormGroup label="Street Address" required fullWidth><Input defaultValue="123 Sports Avenue" /></FormGroup>
          <FormGroup label="Suburb/Town" required><Input defaultValue="Ryde" /></FormGroup>
          <FormGroup label="State" required><Select defaultValue="NSW">{stateOptions}</Select></FormGroup>
          <FormGroup label="Postcode" required><Input defaultValue="2112" /></FormGroup>
          <FormGroup label="Local Government Area" required><Input defaultValue="City of Ryde" /></FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Postal Address" icon={mailIcon}>
        <FormGroup label="Is the postal address the same as the organisation address?">
          <RadioGroup name="postal-same" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No, provide different postal address" }]} defaultValue="yes" />
        </FormGroup>
      </Subsection>

      <Subsection title="Primary Activity / Facility Address" icon={compassIcon}>
        <FormGroup label="Is the activity address the same as the organisation address?">
          <RadioGroup name="activity-same" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No, provide different activity address" }]} defaultValue="no" />
        </FormGroup>
        <div className="mt-4">
          <FormGrid>
            <FormGroup label="Facility Street Address" fullWidth><Input defaultValue="ELS Hall Park" /></FormGroup>
            <FormGroup label="Suburb/Town"><Input defaultValue="Marsfield" /></FormGroup>
            <FormGroup label="State"><Select defaultValue="NSW">{stateOptions}</Select></FormGroup>
            <FormGroup label="Postcode"><Input defaultValue="2122" /></FormGroup>
          </FormGrid>
        </div>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 3: Contacts
// ========================
function ContactsSection() {
  return (
    <FormSection title="Primary & Secondary Contacts" description="Update contact details for key personnel">
      <Subsection title="Primary Contact" icon={personIcon}>
        <FormGrid>
          <FormGroup label="Full Name" required fullWidth><Input defaultValue="Rebecca Pezzutti" /></FormGroup>
          <FormGroup label="Role / Position at Club" required><Input defaultValue="Club Secretary" /></FormGroup>
          <FormGroup label="Email" required><Input type="email" defaultValue="rebecca@rydesaints.com.au" /></FormGroup>
          <FormGroup label="Phone"><Input type="tel" placeholder="(02) 1234 5678" /></FormGroup>
          <FormGroup label="Mobile" required><Input type="tel" defaultValue="0423 456 789" /></FormGroup>
        </FormGrid>
        <div className="mt-4">
          <FormGroup label="Authorised to submit grant applications?" required>
            <RadioGroup name="primary-auth" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="yes" />
          </FormGroup>
        </div>
      </Subsection>

      <Subsection title="Secondary Contact" icon={peopleIcon}>
        <FormGrid>
          <FormGroup label="Full Name" fullWidth><Input defaultValue="Michael Chen" /></FormGroup>
          <FormGroup label="Role / Position"><Input defaultValue="Club President" /></FormGroup>
          <FormGroup label="Email"><Input type="email" defaultValue="michael@rydesaints.com.au" /></FormGroup>
          <FormGroup label="Phone"><Input type="tel" placeholder="(02) 1234 5678" /></FormGroup>
          <FormGroup label="Mobile"><Input type="tel" defaultValue="0434 567 890" /></FormGroup>
        </FormGrid>
        <div className="mt-4">
          <FormGroup label="Authorised to receive correspondence and make decisions?">
            <RadioGroup name="secondary-auth" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="yes" />
          </FormGroup>
        </div>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 4: Overview
// ========================
function OverviewSection() {
  return (
    <FormSection title="Organisation Overview" description="Update information about your organisation">
      <Subsection title="About Your Organisation" icon={infoIcon}>
        <FormGroup label="About the Organisation" required hint="Provide a brief history and overview of your organisation">
          <Textarea rows={6} defaultValue="Ryde Saints Junior Football Club was established in 1985 and has been serving the Ryde community for nearly 40 years. We provide Australian Rules Football programs for children aged 5-17, with a focus on skill development, teamwork, and community engagement. Our club has grown from 30 members to over 240 registered players across multiple age groups." />
        </FormGroup>
        <div className="mt-5">
          <FormGroup label="Purpose / Mission" required>
            <Textarea rows={4} defaultValue="To provide a safe, inclusive, and supportive environment for young people to learn and play Australian Rules Football while developing life skills, building friendships, and fostering community connections." />
          </FormGroup>
        </div>
        <div className="mt-5">
          <FormGroup label="Key Issues / Priorities" required hint="List your organisation's main challenges and priorities">
            <Textarea rows={4} defaultValue={"1. Upgrade aging clubroom facilities to meet modern safety standards.\n2. Purchase new training equipment including defibrillators.\n3. Expand girls' football program.\n4. Improve spectator amenities including shade structures and seating."} />
          </FormGroup>
        </div>
      </Subsection>

      <Subsection title="Sports & Activities" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>}>
        <FormGroup label="Sports or Activities Delivered" required>
          <CheckboxGrid items={[
            { id: "sport-afl", label: "Australian Rules Football", checked: true },
            { id: "sport-netball", label: "Netball" },
            { id: "sport-cricket", label: "Cricket" },
            { id: "sport-soccer", label: "Soccer" },
          ]} />
        </FormGroup>
        <div className="mt-4">
          <FormGroup label="Competition / League / Governing Body Affiliation">
            <Input defaultValue="AFL NSW/ACT, Sydney Junior Football League" />
          </FormGroup>
        </div>
      </Subsection>

      <Subsection title="Membership" icon={peopleIcon}>
        <FormGrid>
          <FormGroup label="Year Established" required><Input defaultValue="1985" /></FormGroup>
          <FormGroup label="Total Members" required><Input defaultValue="280" /></FormGroup>
          <FormGroup label="Active Volunteers"><Input defaultValue="45" /></FormGroup>
          <FormGroup label="Number of Teams"><Input defaultValue="14" /></FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Club Files, Photos & Documents" icon={docIcon}>
        <FormGroup label="Upload Documents">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-gp-blue hover:bg-gp-blue-light/30">
            <div className="w-12 h-12 mx-auto mb-3 bg-gp-blue-light rounded-full flex items-center justify-center text-gp-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <div className="text-sm text-gray-900 mb-1"><strong className="text-gp-blue">Click to upload</strong> or drag and drop</div>
            <div className="text-[0.8125rem] text-gray-500">PDF, DOC, XLS, JPG, PNG (Max 10MB each)</div>
          </div>
          {/* Sample uploaded files */}
          <div className="mt-4 space-y-2">
            {[
              { name: "Financial Report 2024-25.pdf", size: "2.4 MB" },
              { name: "Constitution.pdf", size: "856 KB" },
              { name: "Club Logo.png", size: "245 KB" },
            ].map((f) => (
              <div key={f.name} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gp-blue-light rounded-md flex items-center justify-center text-gp-blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div><span className="font-medium text-sm">{f.name}</span><span className="text-[0.8125rem] text-gray-500"> · {f.size}</span></div>
                </div>
                <button className="text-[0.8125rem] font-medium text-danger px-2 py-1 rounded hover:bg-danger-light transition-colors bg-transparent border-none cursor-pointer">Remove</button>
              </div>
            ))}
          </div>
        </FormGroup>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 5: Wishlist
// ========================
function WishlistSection() {
  return (
    <FormSection title="Funding Wishlist" description="Select all items that apply or may apply in the future to your Club. This helps us match you with relevant grant opportunities.">
      <Subsection title="Programs & Participation" icon={peopleIcon}>
        <CheckboxGrid items={[
          { id: "wish-cald", label: "Culturally and Linguistically Diverse (CALD) Programs" },
          { id: "wish-coaching", label: "Coaching Development Program", checked: true },
          { id: "wish-committee", label: "Committee Education Programs" },
          { id: "wish-disability", label: "Disability Programs" },
          { id: "wish-female", label: "Female Participation Programs", checked: true },
          { id: "wish-indigenous", label: "Indigenous Programs" },
          { id: "wish-junior", label: "Junior Development Programs", checked: true },
          { id: "wish-mental", label: "Mental Health Programs" },
        ]} />
      </Subsection>

      <Subsection title="Field Infrastructure" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>}>
        <CheckboxGrid items={[
          { id: "wish-drainage", label: "Ground / Field Drainage", checked: true },
          { id: "wish-permgoals", label: "Permanent Goals", checked: true },
          { id: "wish-portgoals", label: "Portable Goals" },
          { id: "wish-netting", label: "Soft netting (e.g. nets behind footy goals)" },
        ]} />
      </Subsection>

      <Subsection title="Lighting & Power" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>}>
        <CheckboxGrid items={[
          { id: "wish-newlighting", label: "New on-field lighting (no existing lighting)" },
          { id: "wish-upgradelighting", label: "Upgrade / replace existing on-field lighting", checked: true },
          { id: "wish-offlighting", label: "Off-field lighting upgrades (carpark, safety lighting)" },
          { id: "wish-solar", label: "Solar Panels", checked: true },
          { id: "wish-battery", label: "Solar Battery" },
        ]} />
      </Subsection>

      <Subsection title="Pavilions, Buildings & Amenities" icon={houseIcon}>
        <CheckboxGrid items={[
          { id: "wish-furnish", label: "Pavilion furnishings" },
          { id: "wish-hvac", label: "Pavilion Heating / Cooling" },
          { id: "wish-change", label: "Change rooms" },
          { id: "wish-femalechange", label: "Female Friendly Change Rooms", checked: true },
          { id: "wish-toilets", label: "Toilets / Showers" },
          { id: "wish-kitchen", label: "Kitchen / Canteen Upgrades", checked: true },
          { id: "wish-umpire", label: "Umpire / Referee / Officials Room" },
          { id: "wish-ventilation", label: "Ventilation" },
        ]} />
      </Subsection>

      <Subsection title="Access, Inclusion & Public Areas" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>}>
        <CheckboxGrid items={[
          { id: "wish-disability-amen", label: "All-abilities / Disability Amenities" },
          { id: "wish-access", label: "Increased access levels to existing facilities" },
          { id: "wish-seating", label: "Spectator Seating", checked: true },
          { id: "wish-shade", label: "Permanent Shade Structures", checked: true },
          { id: "wish-bbq", label: "BBQ Area" },
        ]} />
      </Subsection>

      <Subsection title="Carpark & External Works" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>}>
        <CheckboxGrid items={[
          { id: "wish-parking", label: "Additional Car Parking Space" },
          { id: "wish-resurface", label: "Carpark resurfacing" },
          { id: "wish-carparksafety", label: "Carpark Safety Improvements" },
          { id: "wish-permfence", label: "Permanent Fencing" },
          { id: "wish-tempfence", label: "Temporary Fencing" },
        ]} />
      </Subsection>

      <Subsection title="Other" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>
        <FormGroup label="Other items not listed above">
          <Textarea rows={3} placeholder="Please specify any other funding needs..." />
        </FormGroup>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 6: Financial
// ========================
function FinancialSection() {
  return (
    <FormSection title="Financial Data" description="Update your organisation's financial information">
      <Subsection title="Bank Account Details" icon={taxIcon}>
        <FormGroup label="Bank account held in organisation name?" required>
          <RadioGroup name="bank-org" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="yes" />
        </FormGroup>
        <div className="mt-4">
          <FormGrid>
            <FormGroup label="Account Name" required fullWidth><Input defaultValue="Ryde Saints Junior Football Club Inc" /></FormGroup>
            <FormGroup label="BSB" required><Input defaultValue="***-***" placeholder="123-456" /></FormGroup>
            <FormGroup label="Account Number" required><Input defaultValue="****4567" placeholder="12345678" /></FormGroup>
          </FormGrid>
        </div>
        <div className="mt-4">
          <InfoBox type="warning">Bank details are encrypted and securely stored. Only authorised staff can access this information.</InfoBox>
        </div>
      </Subsection>

      <Subsection title="Grant History" icon={dollarIcon}>
        <FormGroup label="Has the organisation previously managed grant funding?" required>
          <RadioGroup name="grant-history" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="yes" />
        </FormGroup>
        <div className="mt-4">
          <FormGroup label="Any outstanding or incomplete grant acquittals?" required>
            <RadioGroup name="acquittal" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} defaultValue="no" />
          </FormGroup>
        </div>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 7: Communications
// ========================
function CommunicationsSection() {
  return (
    <FormSection title="Communications & Public Presence" description="Update your organisation's website and social media details">
      <Subsection title="Online Presence" icon={globeIcon}>
        <FormGrid>
          <FormGroup label="Website URL"><Input type="url" defaultValue="https://www.rydesaintsjfc.com.au" /></FormGroup>
          <FormGroup label="Facebook Page"><Input type="url" defaultValue="https://facebook.com/rydesaintsjfc" /></FormGroup>
          <FormGroup label="Instagram Page"><Input type="url" defaultValue="https://instagram.com/rydesaintsjfc" /></FormGroup>
          <FormGroup label="LinkedIn Page"><Input type="url" placeholder="https://linkedin.com/company/yourclub" /></FormGroup>
          <FormGroup label="Twitter / X"><Input type="url" placeholder="https://twitter.com/yourclub" /></FormGroup>
          <FormGroup label="YouTube Channel"><Input type="url" placeholder="https://youtube.com/@yourclub" /></FormGroup>
        </FormGrid>
      </Subsection>
    </FormSection>
  );
}

// ========================
// SECTION 8: Settings
// ========================
function SettingsSection() {
  return (
    <FormSection title="Account Settings" description="Manage your subscription plan and portal access settings">
      <Subsection title="Subscription Plan" icon={dollarIcon}>
        <div className="bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white rounded-xl p-6 md:p-8 mb-6">
          <div className="text-2xl font-bold mb-2">Grant Ready Plan</div>
          <div className="text-3xl font-bold">$500<span className="text-base font-normal opacity-80">/year</span></div>
          <div className="mt-6 space-y-2 text-sm">
            {["Unlimited grant applications", "Priority support", "Grant matching alerts", "Document storage"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </div>
            ))}
          </div>
        </div>
        <FormGrid>
          <FormGroup label="Next Payment Date"><Input defaultValue="March 15, 2026" readOnly className="bg-gray-50" /></FormGroup>
          <FormGroup label="Member Since"><Input defaultValue="March 2024" readOnly className="bg-gray-50" /></FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Club Portal Access" icon={lockIcon}>
        <div className="mb-6">
          <InfoBox type="info">This passcode allows club members to access the portal and submit information for grant applications. Share this code only with authorised club representatives.</InfoBox>
        </div>
        <FormGrid>
          <FormGroup label="Club Passcode" required hint="Enter a memorable passcode for your club members (4-10 characters)">
            <Input defaultValue="RS2024" className="font-mono text-lg tracking-widest" />
          </FormGroup>
        </FormGrid>
      </Subsection>
    </FormSection>
  );
}