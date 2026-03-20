"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
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
import { StatusDot } from "@/components/status/status-dot";
import { componentGroups, componentBaselineConfigs } from "@/mocks/status-data";
import { STATUS_LABELS } from "@/models/status";
import type { ComponentStatus } from "@/models/status";
const statusOptions: ComponentStatus[] = [
  "operational",
  "degraded",
  "partial-outage",
  "major-outage",
  "maintenance",
];

export default function ComponentsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editThreshold, setEditThreshold] = useState("3");
  const [editGroupName, setEditGroupName] = useState("");
  const [editBaseline, setEditBaseline] = useState("15");
  const [editSla, setEditSla] = useState("99.9");

  const openComponentDialog = (comp?: {
    id?: string;
    name: string;
    failureThreshold?: number;
  }) => {
    setEditName(comp?.name ?? "");
    setEditThreshold(String(comp?.failureThreshold ?? 3));
    const cfg = comp?.id
      ? componentBaselineConfigs.find((c) => c.componentId === comp.id)
      : undefined;
    setEditBaseline(String(cfg?.baselineResponseTimeMs ? cfg.baselineResponseTimeMs / 1000 : 15));
    setEditSla("99.9");
    setEditDialogOpen(true);
  };

  const openGroupDialog = (name?: string) => {
    setEditGroupName(name ?? "");
    setEditGroupDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Components
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => openGroupDialog()}
          >
            Add Group
          </Button>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => openComponentDialog()}
          >
            Add Component
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {componentGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <StatusDot status={group.status} />
                <CardTitle className="text-sm">{group.name}</CardTitle>
                <Badge variant="secondary" size="sm">
                  {group.components.length} components
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openGroupDialog(group.name)}
                >
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-y border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        Name
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        Status
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        Threshold
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        Baseline RT
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        SLA Target
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {group.components.map((comp) => (
                      <tr key={comp.id}>
                        <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                          {comp.name}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <StatusDot status={comp.status} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {STATUS_LABELS[comp.status]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                          {comp.failureThreshold}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                          {(() => {
                            const cfg = componentBaselineConfigs.find((c) => c.componentId === comp.id);
                            return cfg ? `${cfg.baselineResponseTimeMs / 1000}s` : "15s";
                          })()}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                          99.9%
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openComponentDialog({ ...comp, id: comp.id })}
                            >
                              <Pencil size={11} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 size={11} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Component Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editName ? "Edit Component" : "Add Component"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 py-4">
            <Input
              label="Display Name"
              placeholder="e.g. Web Application"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Failure Threshold"
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
              />
              <Input
                label="Baseline Response Time (s)"
                type="number"
                value={editBaseline}
                onChange={(e) => setEditBaseline(e.target.value)}
              />
            </div>
            <Input
              label="SLA Target (%)"
              type="number"
              value={editSla}
              onChange={(e) => setEditSla(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditDialogOpen(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editGroupName ? "Edit Group" : "Add Group"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="py-4">
            <Input
              label="Group Name"
              placeholder="e.g. Platform Console"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditGroupDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditGroupDialogOpen(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
