"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import type { Incident, IncidentStatus, IncidentImpact } from "@/models/status";
import { INCIDENT_STATUS_LABELS, IMPACT_LABELS } from "@/models/status";
import { IncidentTimeline } from "./incident-timeline";

const statusBadgeVariants: Record<
  IncidentStatus,
  "warning" | "default" | "info" | "success"
> = {
  investigating: "warning",
  identified: "warning",
  monitoring: "info",
  resolved: "success",
};

const impactBadgeVariants: Record<
  IncidentImpact,
  "secondary" | "warning" | "destructive"
> = {
  minor: "secondary",
  major: "warning",
  critical: "destructive",
};

interface IncidentCardProps {
  incident: Incident;
  defaultOpen?: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function IncidentCard({
  incident,
  defaultOpen = false,
}: IncidentCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-col gap-2 px-5 py-4 text-left"
      >
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {incident.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariants[incident.status]}>
                {INCIDENT_STATUS_LABELS[incident.status]}
              </Badge>
              <Badge variant={impactBadgeVariants[incident.impact]}>
                {IMPACT_LABELS[incident.impact]}
              </Badge>
              {incident.affectedComponentNames.map((name) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
              {formatDate(incident.createdAt)}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-gray-400 transition-transform",
                open && "rotate-180"
              )}
            />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
          <IncidentTimeline updates={incident.updates} />
        </div>
      )}
    </div>
  );
}
