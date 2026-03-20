import {
  Layers,
  AlertTriangle,
  Wrench,
  Users,
  AlertCircle,
  CheckCircle,
  Calendar,
  UserPlus,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { adminOverview, activityFeed } from "@/mocks/status-data";
import type { ActivityFeedItem } from "@/models/status";

const overviewCards = [
  {
    label: "Total Components",
    value: adminOverview.totalComponents,
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Active Incidents",
    value: adminOverview.activeIncidents,
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    label: "Scheduled Maintenance",
    value: adminOverview.scheduledMaintenance,
    icon: Wrench,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Total Subscribers",
    value: adminOverview.totalSubscribers,
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
];

const activityIcons: Record<ActivityFeedItem["type"], React.ElementType> = {
  incident_created: AlertCircle,
  incident_updated: Settings,
  incident_resolved: CheckCircle,
  maintenance_scheduled: Calendar,
  subscriber_added: UserPlus,
  component_updated: Layers,
};

const activityColors: Record<ActivityFeedItem["type"], string> = {
  incident_created: "text-orange-500",
  incident_updated: "text-blue-500",
  incident_resolved: "text-green-500",
  maintenance_scheduled: "text-blue-500",
  subscriber_added: "text-violet-500",
  component_updated: "text-gray-500",
};

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
              >
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityFeed.map((item) => {
              const Icon = activityIcons[item.type];
              const color = activityColors[item.type];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3"
                >
                  <Icon size={16} className={`mt-0.5 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {formatRelative(item.timestamp)}
                      </span>
                      {item.actor && (
                        <Badge variant="secondary" size="sm">
                          {item.actor}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
