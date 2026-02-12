"use client";

import { ClubHeader } from "@/components/layout/club-header";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <ClubHeader />
      <main className="max-w-[1400px] mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}