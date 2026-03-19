import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentStatus } from "@/models/status";
import { STATUS_LABELS } from "@/models/status";

const config: Record<
  ComponentStatus,
  { bg: string; text: string; icon: React.ElementType }
> = {
  operational: {
    bg: "bg-green-500",
    text: "text-white",
    icon: CheckCircle,
  },
  degraded: {
    bg: "bg-yellow-500",
    text: "text-white",
    icon: AlertTriangle,
  },
  "partial-outage": {
    bg: "bg-orange-500",
    text: "text-white",
    icon: AlertCircle,
  },
  "major-outage": {
    bg: "bg-red-500",
    text: "text-white",
    icon: XCircle,
  },
  maintenance: {
    bg: "bg-blue-500",
    text: "text-white",
    icon: Wrench,
  },
};

interface StatusBannerProps {
  status: ComponentStatus;
}

export function StatusBanner({ status }: StatusBannerProps) {
  const { bg, text, icon: Icon } = config[status];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-6 py-5",
        bg,
        text
      )}
    >
      <Icon size={28} />
      <span className="text-lg font-semibold">{STATUS_LABELS[status]}</span>
    </div>
  );
}
