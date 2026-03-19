import { cn } from "@/lib/utils";
import type { IncidentUpdate, IncidentStatus } from "@/models/status";
import { INCIDENT_STATUS_LABELS } from "@/models/status";

const dotColors: Record<IncidentStatus, string> = {
  investigating: "bg-yellow-500",
  identified: "bg-orange-500",
  monitoring: "bg-blue-500",
  resolved: "bg-green-500",
};

interface IncidentTimelineProps {
  updates: IncidentUpdate[];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function IncidentTimeline({ updates }: IncidentTimelineProps) {
  return (
    <div className="relative ml-3 border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-4">
      {updates.map((update) => (
        <div key={update.id} className="relative">
          <div
            className={cn(
              "absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
              dotColors[update.status]
            )}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {INCIDENT_STATUS_LABELS[update.status]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(update.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {update.message}
            </p>
            {update.author && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                — {update.author}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
