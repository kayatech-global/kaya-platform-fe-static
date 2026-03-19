"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { UptimeDay, UptimeDayStatus } from "@/models/status";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/atoms/tooltip";

const barColors: Record<UptimeDayStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  "partial-outage": "bg-orange-500",
  "major-outage": "bg-red-500",
  maintenance: "bg-blue-500",
  "no-data": "bg-gray-300",
};

const statusLabels: Record<UptimeDayStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  "partial-outage": "Partial Outage",
  "major-outage": "Major Outage",
  maintenance: "Maintenance",
  "no-data": "No Data",
};

interface UptimeBarProps {
  data: UptimeDay[];
}

type DayRange = 30 | 60 | 90;

export function UptimeBar({ data }: UptimeBarProps) {
  const [range, setRange] = useState<DayRange>(90);

  const slicedData = useMemo(() => {
    return data.slice(data.length - range);
  }, [data, range]);

  const uptimePercent = useMemo(() => {
    if (slicedData.length === 0) return 100;
    const avg =
      slicedData.reduce((sum, d) => sum + d.uptimePercent, 0) /
      slicedData.length;
    return parseFloat(avg.toFixed(2));
  }, [slicedData]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {([30, 60, 90] as DayRange[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setRange(d)}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                range === d
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {d}d
            </button>
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {uptimePercent}% uptime
        </span>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex gap-[2px]">
          {slicedData.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-8 flex-1 rounded-sm transition-all hover:opacity-80 cursor-default",
                    barColors[day.status]
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{day.date}</p>
                <p>{statusLabels[day.status]}</p>
                <p>{day.uptimePercent}% uptime</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
