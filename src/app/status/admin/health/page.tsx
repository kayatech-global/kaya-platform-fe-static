import {
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { StatusDot } from "@/components/status/status-dot";
import { healthChecks, componentGroups, componentBaselineConfigs } from "@/mocks/status-data";
import { STATUS_LABELS } from "@/models/status";
import { cn } from "@/lib/utils";
import type { ComponentStatus } from "@/models/status";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getResponseTimeColor(ms: number): string {
  if (ms < 100) return "text-green-600 dark:text-green-400";
  if (ms < 300) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getResponseTimeBg(ms: number): string {
  if (ms < 100) return "bg-green-50 dark:bg-green-950/30";
  if (ms < 300) return "bg-yellow-50 dark:bg-yellow-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}

export default function HealthPage() {
  const groupedChecks = componentGroups.map((group) => ({
    group,
    checks: healthChecks.filter((hc) =>
      group.components.some((c) => c.id === hc.componentId)
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Health Monitoring
        </h2>
        <Badge variant="info" size="md">
          <Activity size={12} className="mr-1" />
          Real-time
        </Badge>
      </div>

      {/* Auto-incident rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Auto-Incident Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-500" />
              <span>
                Auto-create incident after{" "}
                <span className="font-semibold">3 consecutive failures</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              <span>
                Auto-resolve after{" "}
                <span className="font-semibold">5 consecutive successes</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health check cards grouped */}
      {groupedChecks.map(({ group, checks }) => (
        <div key={group.id} className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {group.name}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((hc) => (
              <Card key={hc.componentId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={hc.status} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {hc.componentName}
                      </span>
                    </div>
                    {hc.autoIncidentEnabled && (
                      <Badge variant="secondary" size="sm">
                        Auto
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={cn(
                        "rounded-lg px-2 py-1.5 text-center",
                        getResponseTimeBg(hc.responseTimeMs)
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold",
                          getResponseTimeColor(hc.responseTimeMs)
                        )}
                      >
                        {hc.responseTimeMs}ms
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Response
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-800">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {hc.consecutiveFailures}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Failures
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {formatTimestamp(hc.lastCheck)}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Last Check
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      const cfg = componentBaselineConfigs.find(
                        (c) => c.componentId === hc.componentId
                      );
                      return (
                        <>
                          <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-800">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {cfg ? `${cfg.baselineResponseTimeMs / 1000}s` : "15s"}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              Baseline RT
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 px-2 py-1.5 text-center dark:bg-gray-800">
                            <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400">
                              {STATUS_LABELS[hc.status]}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
