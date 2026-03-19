"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { PublicLayout } from "@/components/status/public-layout";
import { StatusBanner } from "@/components/status/status-banner";
import { ComponentGroup } from "@/components/status/component-group";
import { IncidentCard } from "@/components/status/incident-card";
import { MaintenanceCard } from "@/components/status/maintenance-card";
import { getOverallStatus } from "@/models/status";
import {
  componentGroups,
  activeIncidents,
  pastIncidents,
  scheduledMaintenance,
} from "@/mocks/status-data";

const INITIAL_HISTORY_COUNT = 5;

export default function StatusPage() {
  const overallStatus = getOverallStatus(componentGroups);
  const [historyCount, setHistoryCount] = useState(INITIAL_HISTORY_COUNT);
  const visiblePast = pastIncidents.slice(0, historyCount);

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Overall status */}
        <StatusBanner status={overallStatus} />

        {/* Component groups */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            Components
          </h2>
          {componentGroups.map((group) => (
            <ComponentGroup key={group.id} group={group} />
          ))}
        </section>

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

        {/* Scheduled Maintenance */}
        {scheduledMaintenance.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Scheduled Maintenance
            </h2>
            {scheduledMaintenance.map((m) => (
              <MaintenanceCard key={m.id} maintenance={m} />
            ))}
          </section>
        )}

        {/* Incident History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Past Incidents
            </h2>
            <Link href="/status/history">
              <Button variant="ghost" size="sm" leadingIcon={<Clock size={14} />}>
                Full History
              </Button>
            </Link>
          </div>
          {visiblePast.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
          {historyCount < pastIncidents.length && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setHistoryCount((c) => Math.min(c + 5, pastIncidents.length))
                }
              >
                Load More
              </Button>
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
