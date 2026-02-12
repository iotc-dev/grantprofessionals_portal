/**
 * ClubHeader - simple top bar for club portal
 * Matches club-profile-view.html and club-admin-portal-edit.html header
 * Layout: logo icon + "Grant Professionals" left, club name + avatar right
 */

"use client";

import Link from "next/link";

// Sample club data — will come from session later
const club = {
  name: "Ryde Saints JFC",
  initials: "RS",
};

export function ClubHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/club-dashboard" className="flex items-center gap-3 no-underline text-gray-900">
          <img src="/images/gp-logo.png" alt="Grant Professionals" className="h-10 w-auto" />
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="hidden sm:inline">{club.name}</span>
          <div className="w-8 h-8 bg-gradient-to-br from-gp-blue to-[#42A5F5] rounded-full flex items-center justify-center text-white font-semibold text-xs">
            {club.initials}
          </div>
        </div>
      </div>
    </header>
  );
}