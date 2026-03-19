import { Wrench } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import type { MaintenanceWindow } from "@/models/status";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface MaintenanceCardProps {
  maintenance: MaintenanceWindow;
}

export function MaintenanceCard({ maintenance }: MaintenanceCardProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {maintenance.title}
          </h3>
          <Badge variant="info">Scheduled</Badge>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          {maintenance.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Start:</span>{" "}
            {formatDateTime(maintenance.scheduledStart)}
          </div>
          <div>
            <span className="font-medium">End:</span>{" "}
            {formatDateTime(maintenance.scheduledEnd)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {maintenance.affectedComponentNames.map((name) => (
            <Badge key={name} variant="outline">
              {name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
