"use client";

import { useState, useMemo } from "react";
import { Download, Send, Search, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Card,
  CardContent,
} from "@/components/atoms/card";
import { subscribers, componentGroups } from "@/mocks/status-data";

const groupNameMap = Object.fromEntries(
  componentGroups.map((g) => [g.id, g.name])
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 15;

export default function SubscribersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.id.includes(search)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Subscribers
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Download size={14} />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Send size={14} />}
          >
            Broadcast
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leadingIcon={<Search size={16} />}
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} subscriber{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Verified
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Severity
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Components
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginated.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {sub.email}
                    </td>
                    <td className="px-4 py-3">
                      {sub.verified ? (
                        <CheckCircle
                          size={16}
                          className="text-green-500"
                        />
                      ) : (
                        <XCircle
                          size={16}
                          className="text-gray-300 dark:text-gray-600"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          sub.severityThreshold === "critical"
                            ? "destructive"
                            : sub.severityThreshold === "major"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {sub.severityThreshold}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sub.componentGroups.slice(0, 3).map((gid) => (
                          <Badge
                            key={gid}
                            variant="outline"
                            size="sm"
                          >
                            {groupNameMap[gid] ?? gid}
                          </Badge>
                        ))}
                        {sub.componentGroups.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{sub.componentGroups.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(sub.subscribedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
