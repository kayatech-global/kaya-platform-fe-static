"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Checkbox } from "@/components/atoms/checkbox";
import { PublicLayout } from "@/components/status/public-layout";
import { cn } from "@/lib/utils";
import { componentGroups } from "@/mocks/status-data";
import type { SeverityThreshold } from "@/models/status";

const severityOptions: { label: string; value: SeverityThreshold; description: string }[] = [
  { label: "All", value: "all", description: "Get notified for all incidents" },
  { label: "Major", value: "major", description: "Only major and critical incidents" },
  { label: "Critical", value: "critical", description: "Only critical incidents" },
];

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    componentGroups.map((g) => g.id)
  );
  const [severity, setSeverity] = useState<SeverityThreshold>("all");
  const [submitted, setSubmitted] = useState(false);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && selectedGroups.length > 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            You&apos;re subscribed!
          </h1>
          <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
            We&apos;ve sent a confirmation email to <strong>{email}</strong>.
            Please verify your email to start receiving status updates.
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
            Subscribe to Updates
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified when something goes wrong or maintenance is scheduled.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leadingIcon={<Mail size={16} />}
            required
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
              Severity Threshold
            </p>
            <div className="flex gap-2">
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSeverity(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-3 text-left transition-colors",
                    severity === opt.value
                      ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20"
                      : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                  )}
                >
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>
      </div>
    </PublicLayout>
  );
}
