"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/staff-sidebar";
import { TopHeader } from "@/components/layout/top-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-[260px] min-w-0">
        <TopHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}