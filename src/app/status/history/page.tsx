"use client";

import { useState, useMemo } from "react";
import { PublicLayout } from "@/components/status/public-layout";
import { IncidentCard } from "@/components/status/incident-card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentImpact } from "@/models/status";
import {
  activeIncidents,
  pastIncidents,
  componentGroups,
} from "@/mocks/status-data";

const allIncidents = [...activeIncidents, ...pastIncidents];

const impactOptions: { label: string; value: IncidentImpact | "all" }[] = [
  { label: "All Impacts", value: "all" },
  { label: "Minor", value: "minor" },
  { label: "Major", value: "major" },
  { label: "Critical", value: "critical" },
];

const PAGE_SIZE = 10;

function groupByDay(
  incidents: typeof allIncidents
): Record<string, typeof allIncidents> {
  const groups: Record<string, typeof allIncidents> = {};
  for (const inc of incidents) {
    const day = new Date(inc.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[day]) groups[day] = [];
    groups[day].push(inc);
  }
  return groups;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedImpact, setSelectedImpact] = useState<
    IncidentImpact | "all"
  >("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allIncidents.filter((inc) => {
      if (search && !inc.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (selectedGroup !== "all") {
        const group = componentGroups.find((g) => g.id === selectedGroup);
        if (group) {
          const groupComponentIds = group.components.map((c) => c.id);
          if (
            !inc.affectedComponents.some((cid) =>
              groupComponentIds.includes(cid)
            )
          )
            return false;
        }
      }
      if (selectedImpact !== "all" && inc.impact !== selectedImpact)
        return false;
      return true;
    });
  }, [search, selectedGroup, selectedImpact]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const dayGroups = groupByDay(paginated);
  const hasMore = paginated.length < filtered.length;

  return (
    <PublicLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Incident History
        </h1>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leadingIcon={<Search size={16} />}
            />
          </div>
          <select
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Components</option>
            {componentGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {impactOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedImpact(opt.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedImpact === opt.value
                    ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped incidents */}
        {Object.keys(dayGroups).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
            <Filter size={32} />
            <p className="text-sm">No incidents match your filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(dayGroups).map(([day, incidents]) => (
              <div key={day} className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  {day}
                </h3>
                {incidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
