"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  Card,
  CardContent,
} from "@/components/atoms/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/atoms/dialog";
import { scheduledMaintenance, componentGroups } from "@/mocks/status-data";

const allComponents = componentGroups.flatMap((g) => g.components);

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const statusBadgeMap: Record<string, "info" | "warning" | "success"> = {
  scheduled: "info",
  "in-progress": "warning",
  completed: "success",
};

export default function MaintenancePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const toggleComponent = (id: string) => {
    setSelectedComponents((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Maintenance Windows
        </h2>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Plus size={14} />}
          onClick={() => setCreateOpen(true)}
        >
          Schedule Maintenance
        </Button>
      </div>

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
                    Start
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    End
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Affected Components
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {scheduledMaintenance.map((maint) => (
                  <tr key={maint.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {maint.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeMap[maint.status] ?? "info"}>
                        {maint.status === "in-progress"
                          ? "In Progress"
                          : maint.status.charAt(0).toUpperCase() +
                            maint.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDateTime(maint.scheduledStart)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDateTime(maint.scheduledEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {maint.affectedComponentNames.map((name) => (
                          <Badge key={name} variant="outline" size="sm">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 py-4">
            <Input
              label="Title"
              placeholder="Maintenance window title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Describe what will happen during this maintenance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
                      checked={selectedComponents.includes(comp.id)}
                      onCheckedChange={() => toggleComponent(comp.id)}
                    />
                    {comp.name}
                  </label>
                ))}
              </div>
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
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
