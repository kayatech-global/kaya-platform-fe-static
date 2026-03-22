"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PublicLayout } from "@/components/status/public-layout";
import { StatusBanner } from "@/components/status/status-banner";
import { ComponentGroup } from "@/components/status/component-group";
import { IncidentCard } from "@/components/status/incident-card";
import { MaintenanceCard } from "@/components/status/maintenance-card";
import { getOverallStatus } from "@/models/status";
import {
  componentGroups,
  activeIncidents,
  scheduledMaintenance,
} from "@/mocks/status-data";

type UptimeRange = 30 | 60 | 90;

export default function StatusPage() {
  const overallStatus = getOverallStatus(componentGroups);
  const [selectedRange, setSelectedRange] = useState<UptimeRange>(90);
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* System Status Banner */}
        <StatusBanner status={overallStatus} />

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Active Incidents
            </h2>
            {activeIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                defaultOpen
              />
            ))}
          </section>
        )}

        {/* Scheduled Maintenance (collapsible) */}
        {scheduledMaintenance.length > 0 && (
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => setMaintenanceExpanded((prev) => !prev)}
              className="flex w-full items-center gap-2"
            >
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Scheduled Maintenance
              </h2>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  maintenanceExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {maintenanceExpanded && (
              <div className="space-y-3">
                {scheduledMaintenance.map((m) => (
                  <MaintenanceCard key={m.id} maintenance={m} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Component Groups with Uptime Bars */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Components
            </h2>
            <div className="flex gap-1">
              {([30, 60, 90] as UptimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                    selectedRange === range
                      ? "bg-primary text-white"
                      : "bg-muted text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {range}d
                </button>
              ))}
            </div>
          </div>
          {componentGroups.map((group) => (
            <ComponentGroup key={group.id} group={group} />
          ))}
        </section>
      </div>
    </PublicLayout>
  );
}
