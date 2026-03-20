"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Wrench,
  Layers,
  Users,
  ArrowUpRight,
  Activity,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/status-management", label: "Overview", icon: LayoutDashboard },
  { href: "/status-management/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/status-management/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/status-management/components", label: "Components", icon: Layers },
  { href: "/status-management/subscribers", label: "Subscribers", icon: Users },
  { href: "/status-management/escalation", label: "Escalation", icon: ArrowUpRight },
  { href: "/status-management/health", label: "Health", icon: Activity },
  { href: "/status-management/sla-reports", label: "SLA Reports", icon: FileBarChart },
];

export default function StatusManagementLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-14 items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
              <span className="text-xs font-bold text-white">K</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Status Management
            </h1>
          </div>
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive =
                tab.href === "/status-management"
                  ? pathname === "/status-management"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-violet-600 text-violet-700 dark:border-violet-400 dark:text-violet-300"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
