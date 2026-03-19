import { cn } from "@/lib/utils";
import type { ComponentStatus } from "@/models/status";

const dotColors: Record<ComponentStatus, string> = {
  operational: "bg-green-500",
  degraded: "bg-yellow-500",
  "partial-outage": "bg-orange-500",
  "major-outage": "bg-red-500",
  maintenance: "bg-blue-500",
};

interface StatusDotProps {
  status: ComponentStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        dotColors[status],
        className
      )}
      aria-label={status}
    />
  );
}
