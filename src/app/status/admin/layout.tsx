"use client";

import type { ReactNode } from "react";
import DashboardHeader from "@/components/molecules/dashboard-header/dashboard-header";
import { AdminSidebar } from "@/components/status/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader isFullWidth />
      <div className="flex flex-1 bg-gray-50 dark:bg-gray-950">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
