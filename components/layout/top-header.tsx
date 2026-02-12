/**
 * TopHeader component - sticky top bar with page title and mobile menu toggle
 * Responsive: shows hamburger on mobile, hides on desktop
 */

"use client";

import { usePathname } from "next/navigation";

interface TopHeaderProps {
  onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
  "/admin-dashboard": "Dashboard",
  "/manage-clubs": "Manage Clubs",
  "/manage-grants": "Manage Grants",
  "/manage-invoices": "Invoices",
  "/settings": "Settings",
};

export function TopHeader({ onMenuToggle }: TopHeaderProps) {
  const pathname = usePathname();

  // Match exact or parent path for title
  const getPageTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    // Check parent paths for nested routes like /manage-clubs/[id]
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) return title;
    }
    return "Dashboard";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Hamburger - visible on mobile only */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Future: notifications, search, etc. */}
      </div>
    </header>
  );
}