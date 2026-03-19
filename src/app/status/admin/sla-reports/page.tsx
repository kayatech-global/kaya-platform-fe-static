"use client";

import { useState } from "react";
import {
  FileBarChart,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Layers,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
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
import { slaReportData } from "@/mocks/status-data";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SlaReportsPage() {
  const [periodStart, setPeriodStart] = useState(
    new Date(slaReportData.periodStart).toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date(slaReportData.periodEnd).toISOString().split("T")[0]
  );
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const report = slaReportData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart size={20} className="text-violet-600" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            SLA Reports
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} />}>
            Export PDF
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} />}>
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Mail size={14} />}
            onClick={() => setEmailOpen(true)}
          >
            Email Report
          </Button>
        </div>
      </div>

      {/* Date Range & Generate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <Input
              label="Period Start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              containerClassName="w-48"
            />
            <Input
              label="Period End"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              containerClassName="w-48"
            />
            <Button variant="primary" size="sm" leadingIcon={<Search size={14} />}>
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40">
                <Layers size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {report.totalComponents}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Components
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {report.componentsMeetingSla}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Meeting SLA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/40">
                <XCircle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {report.componentsBreached}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Breached
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/40">
                <TrendingUp size={18} className="text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {report.averageUptimePercent}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Average Uptime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MTTR / MTTD Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock size={20} className="mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.mttrMttd.mttrMinutes} min
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MTTR (Mean Time to Resolution)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Search size={20} className="mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.mttrMttd.mttdMinutes} min
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MTTD (Mean Time to Detect)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle size={20} className="mx-auto mb-1 text-violet-500" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.mttrMttd.incidentsAnalyzed}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Incidents Analyzed ({report.mttrMttd.periodLabel})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SLA Targets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Component
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Group
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                    SLA Target
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                    Actual Uptime
                  </th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {report.targets.map((t) => (
                  <tr key={t.componentId}>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                      {t.componentName}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                      {t.groupName}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-mono text-gray-700 dark:text-gray-300">
                      {t.slaTargetPercent}%
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right text-xs font-mono font-semibold",
                        t.status === "met"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {t.actualUptimePercent}%
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {t.status === "met" ? (
                        <Badge variant="success" size="sm">Met</Badge>
                      ) : (
                        <Badge variant="destructive" size="sm">Breached</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Breach Details */}
      {report.breaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-700 dark:text-red-400">
              Breach Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Component
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                      SLA Target
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                      Actual
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                      Breach Duration
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Correlated Incident
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {report.breaches.map((b) => (
                    <tr key={b.componentId}>
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                        {b.componentName}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-mono text-gray-700 dark:text-gray-300">
                        {b.slaTargetPercent}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                        {b.actualUptimePercent}%
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-700 dark:text-gray-300">
                        {b.breachDurationMinutes} min
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" size="sm">
                            {b.correlatedIncidentId}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                            {b.correlatedIncidentTitle}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Report Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Email SLA Report</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 py-4">
            <Input
              label="Recipient Email"
              type="email"
              placeholder="name@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The SLA report for {formatDate(report.periodStart)} &ndash;{" "}
              {formatDate(report.periodEnd)} will be sent as a PDF attachment.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEmailOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEmailOpen(false)}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
