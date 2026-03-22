"use client";

import { useState } from "react";
import { Checkbox } from "@/components/atoms/checkbox";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { PublicLayout } from "@/components/status/public-layout";
import { cn } from "@/lib/utils";
import { componentGroups } from "@/mocks/status-data";
import { AlertTriangle, Save, Trash2, CheckCircle } from "lucide-react";
import type { SeverityThreshold } from "@/models/status";

const severityOptions: { label: string; value: SeverityThreshold }[] = [
  { label: "All", value: "all" },
  { label: "Major", value: "major" },
  { label: "Critical", value: "critical" },
];

export default function ManageSubscriptionPage() {
  // Mock current preferences
  const [email] = useState("alice@acme.com");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    "platform-console",
    "workflow-execution",
    "infrastructure",
  ]);
  const [severity, setSeverity] = useState<SeverityThreshold>("all");
  const [saved, setSaved] = useState(false);
  const [showUnsubConfirm, setShowUnsubConfirm] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (unsubscribed) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <CheckCircle size={32} className="text-gray-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Unsubscribed
          </h1>
          <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
            You have been unsubscribed from all status notifications. You can
            always re-subscribe from the status page.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Manage Subscription
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update your notification preferences or unsubscribe.
          </p>
        </div>

        {/* Email display */}
        <Input
          label="Email Address"
          value={email}
          disabled
          readOnly
        />

        {/* Component groups */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
            Component Groups
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {componentGroups.map((group) => (
              <label
                key={group.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                  selectedGroups.includes(group.id)
                    ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                )}
              >
                <Checkbox
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={() => toggleGroup(group.id)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {group.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity threshold */}
        <div className="space-y-3">
          <label
            htmlFor="severity"
            className="text-sm font-medium text-gray-700 dark:text-gray-100"
          >
            Severity Threshold
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as SeverityThreshold);
              setSaved(false);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          >
            {severityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Save size={14} />}
            onClick={handleSave}
          >
            {saved ? "Saved!" : "Save Preferences"}
          </Button>

          {!showUnsubConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Trash2 size={14} />}
              onClick={() => setShowUnsubConfirm(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Unsubscribe
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle size={14} />
                <span>Are you sure?</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setUnsubscribed(true)}
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUnsubConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
