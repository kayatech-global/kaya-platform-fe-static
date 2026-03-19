"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentGroup as ComponentGroupType } from "@/models/status";
import { STATUS_LABELS } from "@/models/status";
import { StatusDot } from "./status-dot";
import { UptimeBar } from "./uptime-bar";

interface ComponentGroupProps {
  group: ComponentGroupType;
}

export function ComponentGroup({ group }: ComponentGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <StatusDot status={group.status} />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {group.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {STATUS_LABELS[group.status]}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-4 dark:border-gray-800">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {group.components.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between py-3 pl-5"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {comp.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {STATUS_LABELS[comp.status]}
                  </span>
                  <StatusDot status={comp.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
        <UptimeBar data={group.uptimeData} />
      </div>
    </div>
  );
}
