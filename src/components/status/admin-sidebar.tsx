"use client";

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
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/status/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/status/admin/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/status/admin/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/status/admin/components", label: "Components", icon: Layers },
  { href: "/status/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/status/admin/escalation", label: "Escalation", icon: ArrowUpRight },
  { href: "/status/admin/health", label: "Health Monitor", icon: Activity },
  { href: "/status/admin/sla-reports", label: "SLA Reports", icon: FileBarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4 dark:border-gray-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
          <span className="text-xs font-bold text-white">K</span>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Status Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <Link
          href="/workspaces"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={14} />
          Back to Workspaces
        </Link>
      </div>
    </aside>
  );
}
