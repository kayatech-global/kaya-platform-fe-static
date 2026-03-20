"use client";

import { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Checkbox } from "@/components/atoms/checkbox";
import { Switch } from "@/components/atoms/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/atoms/dialog";
import { IncidentTimeline } from "@/components/status/incident-timeline";
import { cn } from "@/lib/utils";
import {
  activeIncidents,
  pastIncidents,
  componentGroups,
} from "@/mocks/status-data";
import type { Incident, IncidentImpact, IncidentStatus } from "@/models/status";
import { INCIDENT_STATUS_LABELS, IMPACT_LABELS } from "@/models/status";

const allIncidents = [...activeIncidents, ...pastIncidents];

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

const allComponents = componentGroups.flatMap((g) => g.components);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function IncidentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newImpact, setNewImpact] = useState<IncidentImpact>("minor");
  const [newMessage, setNewMessage] = useState("");
  const [newComponents, setNewComponents] = useState<string[]>([]);
  const [newNotify, setNewNotify] = useState(true);

  // Detail view update form
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateStatus, setUpdateStatus] = useState<IncidentStatus>("investigating");

  const toggleComponent = (id: string) => {
    setNewComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (selectedIncident) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<ArrowLeft size={14} />}
          onClick={() => setSelectedIncident(null)}
        >
          Back to Incidents
        </Button>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {selectedIncident.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariants[selectedIncident.status]}>
              {INCIDENT_STATUS_LABELS[selectedIncident.status]}
            </Badge>
            <Badge variant={impactBadgeVariants[selectedIncident.impact]}>
              {IMPACT_LABELS[selectedIncident.impact]}
            </Badge>
            {selectedIncident.affectedComponentNames.map((name) => (
              <Badge key={name} variant="outline">
                {name}
              </Badge>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentTimeline updates={selectedIncident.updates} />
          </CardContent>
        </Card>

        {selectedIncident.status !== "resolved" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post Update</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {(
                  ["investigating", "identified", "monitoring", "resolved"] as IncidentStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUpdateStatus(s)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                      updateStatus === s
                        ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/20 dark:text-violet-300"
                        : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                    )}
                  >
                    {INCIDENT_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <Textarea
                label="Update Message"
                placeholder="Provide an update on the current status..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
              />
              <Button variant="primary" size="sm">
                Post Update
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Incidents
        </h2>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus size={14} />}
          onClick={() => setCreateOpen(true)}
        >
          Create Incident
        </Button>
      </div>

      {/* Incidents table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Impact
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Components
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {allIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {inc.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariants[inc.status]}>
                        {INCIDENT_STATUS_LABELS[inc.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={impactBadgeVariants[inc.impact]}>
                        {IMPACT_LABELS[inc.impact]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {inc.affectedComponentNames.map((name) => (
                          <Badge key={name} variant="outline" size="sm">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(inc.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Incident Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Incident</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 py-4">
            <Input
              label="Title"
              placeholder="Brief incident description"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                Impact
              </p>
              <div className="flex gap-2">
                {(["minor", "major", "critical"] as IncidentImpact[]).map(
                  (impact) => (
                    <button
                      key={impact}
                      type="button"
                      onClick={() => setNewImpact(impact)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                        newImpact === impact
                          ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/20 dark:text-violet-300"
                          : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {impact}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                Affected Components
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allComponents.map((comp) => (
                  <label
                    key={comp.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <Checkbox
                      checked={newComponents.includes(comp.id)}
                      onCheckedChange={() => toggleComponent(comp.id)}
                    />
                    {comp.name}
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              label="Initial Message"
              placeholder="Describe what is happening..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Switch checked={newNotify} onCheckedChange={setNewNotify} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Notify subscribers
              </span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Create Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
