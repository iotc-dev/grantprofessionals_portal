/**
 * Sidebar component - staff/admin navigation
 * Responsive: hidden on mobile with hamburger toggle, fixed on desktop
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  clubs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  grants: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  invoices: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/admin-dashboard", icon: icons.dashboard },
      { label: "Manage Clubs", href: "/manage-clubs", icon: icons.clubs },
      { label: "Manage Grants", href: "/manage-grants", icon: icons.grants },
      { label: "Invoices", href: "/manage-invoices", icon: icons.invoices },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", href: "/settings", icon: icons.settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[260px] bg-gp-navy fixed top-0 left-0 h-screen flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 pb-5 border-b border-white/8">
          <Link
            href="/admin-dashboard"
            className="block no-underline"
            onClick={onClose}
          >
            <Image
              src="/images/gp-logo.png"
              alt="Grant Professionals"
              width={160}
              height={43}
              className="brightness-0 invert"
              priority
            />
            <div className="text-[0.6875rem] font-medium text-white/50 mt-1.5 tracking-wide">
              Admin Portal
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.group} className="mb-6">
              <div className="px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/35">
                {group.group}
              </div>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin-dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium mb-1 transition-all duration-150 no-underline ${
                      isActive
                        ? "bg-gp-blue text-white [&>svg]:opacity-100"
                        : "text-white/70 hover:bg-white/8 hover:text-white [&>svg]:opacity-80"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card - will be dynamic later */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-white/8 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-gp-blue to-[#42A5F5] rounded-full flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                Josiah Dalisay
              </div>
              <div className="text-xs text-white/50">Account Executive</div>
            </div>
            <button className="p-1 bg-transparent border-none text-white/50 cursor-pointer rounded hover:bg-white/10 hover:text-white">
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}