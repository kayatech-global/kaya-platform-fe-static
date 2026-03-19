"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/status/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Admin Panel
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
