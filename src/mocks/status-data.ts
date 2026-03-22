import type {
  ComponentGroup,
  Incident,
  MaintenanceWindow,
  Subscriber,
  HealthCheckResult,
  EscalationContact,
  AdminOverview,
  ActivityFeedItem,
  UptimeDay,
  UptimeDayStatus,
  SeverityThreshold,
  SlaReportData,
  ComponentBaselineConfig,
  EscalationExpectations,
} from "@/models/status";

// ─── Helpers ─────────────────────────────────────────────────────────

function generateUptimeData(daysCount: number, degradedDays: number[] = [], outageDays: number[] = [], maintenanceDays: number[] = []): UptimeDay[] {
  const days: UptimeDay[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    let status: UptimeDayStatus = "operational";
    let uptimePercent = 99.95 + Math.random() * 0.05;

    if (degradedDays.includes(i)) {
      status = "degraded";
      uptimePercent = 98.5 + Math.random() * 1.0;
    } else if (outageDays.includes(i)) {
      status = "partial-outage";
      uptimePercent = 95.0 + Math.random() * 3.0;
    } else if (maintenanceDays.includes(i)) {
      status = "maintenance";
      uptimePercent = 99.0 + Math.random() * 0.5;
    }

    days.push({ date: dateStr, status, uptimePercent: parseFloat(uptimePercent.toFixed(2)) });
  }
  return days;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── Component Groups ────────────────────────────────────────────────

export const componentGroups: ComponentGroup[] = [
  {
    id: "platform-console",
    name: "Platform Console",
    status: "operational",
    components: [
      { id: "web-app", name: "Web Application", status: "operational", failureThreshold: 3 },
      { id: "platform-api", name: "Platform API", status: "operational", failureThreshold: 3 },
      { id: "auth-sso", name: "Authentication & SSO", status: "operational", failureThreshold: 2 },
    ],
    uptimeData: generateUptimeData(90, [72], [], [45]),
  },
  {
    id: "workflow-execution",
    name: "Workflow Execution",
    status: "degraded",
    components: [
      { id: "workflow-engine", name: "Workflow Engine", status: "degraded", failureThreshold: 2 },
      { id: "triggers-scheduling", name: "Triggers & Scheduling", status: "operational", failureThreshold: 3 },
      { id: "workflow-builder", name: "Workflow Builder", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [0, 1, 15, 42], [30], []),
  },
  {
    id: "voice-ai",
    name: "Voice AI",
    status: "operational",
    components: [
      { id: "voice-engine", name: "Voice Engine", status: "operational", failureThreshold: 2 },
      { id: "telephony-twilio", name: "Telephony (Twilio)", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [60], [], []),
  },
  {
    id: "messaging-events",
    name: "Messaging & Events",
    status: "operational",
    components: [
      { id: "event-subscription-mgr", name: "Event Subscription Manager", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [], [55], []),
  },
  {
    id: "analytics-insights",
    name: "Analytics & Insights",
    status: "operational",
    components: [
      { id: "insights-engine", name: "Insights Engine", status: "operational", failureThreshold: 3 },
      { id: "metrics-dashboards", name: "Metrics & Dashboards", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [25], [], []),
  },
  {
    id: "licensing-activation",
    name: "Licensing & Activation",
    status: "operational",
    components: [
      { id: "license-portal", name: "License Portal", status: "operational", failureThreshold: 3 },
      { id: "license-api", name: "License API", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [], [], [80]),
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    status: "partial-outage",
    components: [
      { id: "database", name: "Database", status: "operational", failureThreshold: 2 },
      { id: "cache-layer", name: "Cache Layer", status: "partial-outage", failureThreshold: 2 },
      { id: "secret-management", name: "Secret Management", status: "operational", failureThreshold: 3 },
    ],
    uptimeData: generateUptimeData(90, [3, 10], [0, 1], [50]),
  },
];

// ─── Active Incidents ────────────────────────────────────────────────

export const activeIncidents: Incident[] = [
  {
    id: "inc-001",
    title: "Elevated latency on Workflow Engine",
    status: "investigating",
    impact: "major",
    affectedComponents: ["workflow-engine"],
    affectedComponentNames: ["Workflow Engine"],
    createdAt: hoursAgo(2),
    updates: [
      {
        id: "upd-001c",
        status: "investigating",
        message: "We are continuing to investigate the root cause of elevated latency. Some workflow executions may take longer than usual to complete. Our engineering team is actively reviewing the distributed tracing data.",
        createdAt: hoursAgo(0.5),
        author: "Engineering Team",
      },
      {
        id: "upd-001b",
        status: "investigating",
        message: "We have identified elevated P99 latency on the Workflow Engine service. The issue appears to be related to increased queue depth in the execution pipeline. Investigating further.",
        createdAt: hoursAgo(1),
        author: "Engineering Team",
      },
      {
        id: "upd-001a",
        status: "investigating",
        message: "We are investigating reports of slow workflow execution times. Some users may experience delays when triggering workflows.",
        createdAt: hoursAgo(2),
        author: "Engineering Team",
      },
    ],
  },
  {
    id: "inc-002",
    title: "Cache Layer partial connectivity issues",
    status: "monitoring",
    impact: "minor",
    affectedComponents: ["cache-layer"],
    affectedComponentNames: ["Cache Layer"],
    createdAt: hoursAgo(5),
    updates: [
      {
        id: "upd-002c",
        status: "monitoring",
        message: "A fix has been deployed and we are monitoring cache hit rates. Performance appears to be recovering. We will continue to monitor for the next 30 minutes before resolving.",
        createdAt: hoursAgo(1),
        author: "Infrastructure Team",
      },
      {
        id: "upd-002b",
        status: "identified",
        message: "The issue has been identified as a misconfigured replica set in one of our Redis clusters. A fix is being prepared and will be deployed shortly.",
        createdAt: hoursAgo(3),
        author: "Infrastructure Team",
      },
      {
        id: "upd-002a",
        status: "investigating",
        message: "We are investigating increased cache miss rates affecting the Cache Layer. Some API responses may be slower than usual.",
        createdAt: hoursAgo(5),
        author: "Infrastructure Team",
      },
    ],
  },
];

// ─── Past Incidents (15) ─────────────────────────────────────────────

export const pastIncidents: Incident[] = [
  {
    id: "inc-003",
    title: "Brief API gateway timeout",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["platform-api"],
    affectedComponentNames: ["Platform API"],
    createdAt: daysAgo(1),
    resolvedAt: daysAgo(1),
    updates: [
      { id: "upd-003b", status: "resolved", message: "The issue has been resolved. API response times have returned to normal.", createdAt: daysAgo(1), author: "Engineering Team" },
      { id: "upd-003a", status: "investigating", message: "We are investigating a brief spike in API gateway timeouts.", createdAt: daysAgo(1), author: "Engineering Team" },
    ],
  },
  {
    id: "inc-004",
    title: "Scheduled database migration caused brief downtime",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["database"],
    affectedComponentNames: ["Database"],
    createdAt: daysAgo(2),
    resolvedAt: daysAgo(2),
    updates: [
      { id: "upd-004b", status: "resolved", message: "Database migration completed successfully. All services are operational.", createdAt: daysAgo(2), author: "DBA Team" },
      { id: "upd-004a", status: "investigating", message: "A scheduled database migration is causing brief connection drops.", createdAt: daysAgo(2), author: "DBA Team" },
    ],
  },
  {
    id: "inc-005",
    title: "Voice Engine audio quality degradation",
    status: "resolved",
    impact: "major",
    affectedComponents: ["voice-engine"],
    affectedComponentNames: ["Voice Engine"],
    createdAt: daysAgo(3),
    resolvedAt: daysAgo(3),
    updates: [
      { id: "upd-005c", status: "resolved", message: "Audio quality has been restored to normal levels. Root cause was a codec configuration drift.", createdAt: daysAgo(3), author: "Voice Team" },
      { id: "upd-005b", status: "identified", message: "Root cause identified: codec configuration drift after a deployment. Rolling back.", createdAt: daysAgo(3), author: "Voice Team" },
      { id: "upd-005a", status: "investigating", message: "We are investigating reports of degraded audio quality on voice calls.", createdAt: daysAgo(3), author: "Voice Team" },
    ],
  },
  {
    id: "inc-006",
    title: "SSO login failures for Google OAuth",
    status: "resolved",
    impact: "major",
    affectedComponents: ["auth-sso"],
    affectedComponentNames: ["Authentication & SSO"],
    createdAt: daysAgo(5),
    resolvedAt: daysAgo(5),
    updates: [
      { id: "upd-006b", status: "resolved", message: "Google OAuth integration has been restored. Certificate was renewed successfully.", createdAt: daysAgo(5), author: "Security Team" },
      { id: "upd-006a", status: "investigating", message: "Some users are unable to log in using Google SSO. Other login methods are unaffected.", createdAt: daysAgo(5), author: "Security Team" },
    ],
  },
  {
    id: "inc-007",
    title: "Insights Engine data processing delay",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["insights-engine"],
    affectedComponentNames: ["Insights Engine"],
    createdAt: daysAgo(7),
    resolvedAt: daysAgo(7),
    updates: [
      { id: "upd-007b", status: "resolved", message: "Data processing pipeline is back to real-time. Backlog has been cleared.", createdAt: daysAgo(7), author: "Data Team" },
      { id: "upd-007a", status: "investigating", message: "Analytics data may show delays of up to 15 minutes.", createdAt: daysAgo(7), author: "Data Team" },
    ],
  },
  {
    id: "inc-008",
    title: "Workflow Builder drag-and-drop glitch",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["workflow-builder"],
    affectedComponentNames: ["Workflow Builder"],
    createdAt: daysAgo(8),
    resolvedAt: daysAgo(8),
    updates: [
      { id: "upd-008b", status: "resolved", message: "Hotfix deployed. Drag-and-drop functionality is working correctly.", createdAt: daysAgo(8), author: "Frontend Team" },
      { id: "upd-008a", status: "investigating", message: "Some users are reporting issues with drag-and-drop in the Workflow Builder.", createdAt: daysAgo(8), author: "Frontend Team" },
    ],
  },
  {
    id: "inc-010",
    title: "License API rate limiting issue",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["license-api"],
    affectedComponentNames: ["License API"],
    createdAt: daysAgo(12),
    resolvedAt: daysAgo(12),
    updates: [
      { id: "upd-010b", status: "resolved", message: "Rate limiter configuration has been corrected.", createdAt: daysAgo(12), author: "Engineering Team" },
      { id: "upd-010a", status: "investigating", message: "Some license validation requests are being incorrectly rate limited.", createdAt: daysAgo(12), author: "Engineering Team" },
    ],
  },
  {
    id: "inc-011",
    title: "Telephony service intermittent call drops",
    status: "resolved",
    impact: "critical",
    affectedComponents: ["telephony-twilio"],
    affectedComponentNames: ["Telephony (Twilio)"],
    createdAt: daysAgo(14),
    resolvedAt: daysAgo(14),
    updates: [
      { id: "upd-011c", status: "resolved", message: "Twilio has confirmed the upstream issue is resolved. Call stability has returned to normal.", createdAt: daysAgo(14), author: "Voice Team" },
      { id: "upd-011b", status: "identified", message: "Twilio has acknowledged an upstream issue affecting SIP trunking in our region.", createdAt: daysAgo(14), author: "Voice Team" },
      { id: "upd-011a", status: "investigating", message: "We are investigating reports of intermittent call drops.", createdAt: daysAgo(14), author: "Voice Team" },
    ],
  },
  {
    id: "inc-012",
    title: "Metrics dashboard rendering failure",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["metrics-dashboards"],
    affectedComponentNames: ["Metrics & Dashboards"],
    createdAt: daysAgo(16),
    resolvedAt: daysAgo(16),
    updates: [
      { id: "upd-012b", status: "resolved", message: "Dashboard rendering issue fixed. A frontend bundle was corrupted during deployment.", createdAt: daysAgo(16), author: "Frontend Team" },
      { id: "upd-012a", status: "investigating", message: "Some dashboards are failing to render charts.", createdAt: daysAgo(16), author: "Frontend Team" },
    ],
  },
  {
    id: "inc-013",
    title: "Event Subscription Manager webhook delays",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["event-subscription-mgr"],
    affectedComponentNames: ["Event Subscription Manager"],
    createdAt: daysAgo(18),
    resolvedAt: daysAgo(18),
    updates: [
      { id: "upd-013b", status: "resolved", message: "Webhook delivery latency has returned to normal after DNS cache refresh.", createdAt: daysAgo(18), author: "Platform Team" },
      { id: "upd-013a", status: "investigating", message: "Webhook deliveries are experiencing delays of up to 5 minutes.", createdAt: daysAgo(18), author: "Platform Team" },
    ],
  },
  {
    id: "inc-014",
    title: "Secret Management vault seal event",
    status: "resolved",
    impact: "critical",
    affectedComponents: ["secret-management"],
    affectedComponentNames: ["Secret Management"],
    createdAt: daysAgo(21),
    resolvedAt: daysAgo(21),
    updates: [
      { id: "upd-014c", status: "resolved", message: "Vault has been unsealed and all secrets are accessible. Auto-unseal policy has been updated.", createdAt: daysAgo(21), author: "Security Team" },
      { id: "upd-014b", status: "identified", message: "Vault automatically sealed due to a network partition. Initiating unseal procedure.", createdAt: daysAgo(21), author: "Security Team" },
      { id: "upd-014a", status: "investigating", message: "Secret Management service is returning 503 errors. Applications may fail to retrieve secrets.", createdAt: daysAgo(21), author: "Security Team" },
    ],
  },
  {
    id: "inc-015",
    title: "Trigger scheduling timezone calculation bug",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["triggers-scheduling"],
    affectedComponentNames: ["Triggers & Scheduling"],
    createdAt: daysAgo(24),
    resolvedAt: daysAgo(24),
    updates: [
      { id: "upd-015b", status: "resolved", message: "Timezone calculation logic has been corrected. Scheduled triggers are firing at the correct times.", createdAt: daysAgo(24), author: "Engineering Team" },
      { id: "upd-015a", status: "investigating", message: "Some scheduled triggers are firing at incorrect times for non-UTC timezones.", createdAt: daysAgo(24), author: "Engineering Team" },
    ],
  },
  {
    id: "inc-016",
    title: "License Portal UI intermittent 500 errors",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["license-portal"],
    affectedComponentNames: ["License Portal"],
    createdAt: daysAgo(26),
    resolvedAt: daysAgo(26),
    updates: [
      { id: "upd-016b", status: "resolved", message: "Memory leak in the portal backend has been patched. Service is stable.", createdAt: daysAgo(26), author: "Engineering Team" },
      { id: "upd-016a", status: "investigating", message: "Some users are seeing 500 errors when accessing the License Portal.", createdAt: daysAgo(26), author: "Engineering Team" },
    ],
  },
  {
    id: "inc-017",
    title: "Web Application CDN cache invalidation failure",
    status: "resolved",
    impact: "minor",
    affectedComponents: ["web-app"],
    affectedComponentNames: ["Web Application"],
    createdAt: daysAgo(28),
    resolvedAt: daysAgo(28),
    updates: [
      { id: "upd-017b", status: "resolved", message: "CDN cache has been fully invalidated. Users are seeing the latest version of the application.", createdAt: daysAgo(28), author: "DevOps Team" },
      { id: "upd-017a", status: "investigating", message: "Some users are seeing stale content after the latest deployment.", createdAt: daysAgo(28), author: "DevOps Team" },
    ],
  },
];

// ─── Scheduled Maintenance ───────────────────────────────────────────

export const scheduledMaintenance: MaintenanceWindow[] = [
  {
    id: "maint-001",
    title: "Database cluster version upgrade",
    description: "We will be upgrading the primary PostgreSQL cluster from version 15.4 to 16.1. During this window, there may be brief periods of read-only mode (approximately 2-3 minutes) as the failover occurs. All data will be preserved.",
    scheduledStart: daysFromNow(3),
    scheduledEnd: daysFromNow(3),
    affectedComponents: ["database"],
    affectedComponentNames: ["Database"],
    status: "scheduled",
  },
];

// ─── Subscribers (50+) ───────────────────────────────────────────────

const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah", "Ivan", "Julia", "Kevin", "Laura", "Mike", "Nina", "Oscar", "Patricia", "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zach", "Amber", "Brandon", "Chloe", "Derek", "Elena", "Felix", "Grace", "Henry", "Iris", "Jack", "Karen", "Leo", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Rose", "Sean", "Tara", "Uri", "Vera", "Will", "Xena", "Yuki", "Zara"];
const domains = ["acme.com", "globex.io", "initech.co", "waystar.org", "piedpiper.dev", "hooli.com", "stark.io", "wayne.co", "oscorp.dev", "umbrella.io"];
const groupIds = ["platform-console", "workflow-execution", "voice-ai", "messaging-events", "analytics-insights", "licensing-activation", "infrastructure"];
const thresholds: SeverityThreshold[] = ["all", "major", "critical"];

export const subscribers: Subscriber[] = firstNames.map((name, i) => ({
  id: `sub-${String(i + 1).padStart(3, "0")}`,
  email: `${name.toLowerCase()}@${domains[i % domains.length]}`,
  componentGroups: groupIds.filter((_, gi) => (i + gi) % 3 === 0 || gi === 0),
  severityThreshold: thresholds[i % thresholds.length],
  verified: i % 7 !== 0, // ~85% verified
  subscribedAt: daysAgo(Math.floor(Math.random() * 90)),
}));

// ─── Health Check Data ───────────────────────────────────────────────

export const healthChecks: HealthCheckResult[] = componentGroups.flatMap((group) =>
  group.components.map((comp) => ({
    componentId: comp.id,
    componentName: comp.name,
    groupName: group.name,
    status: comp.status,
    lastCheck: hoursAgo(Math.random() * 0.01), // just now-ish
    responseTimeMs: comp.status === "operational" ? Math.floor(20 + Math.random() * 80) : comp.status === "degraded" ? Math.floor(200 + Math.random() * 300) : Math.floor(500 + Math.random() * 2000),
    consecutiveFailures: comp.status === "operational" ? 0 : comp.status === "degraded" ? Math.floor(Math.random() * 3) : Math.floor(3 + Math.random() * 5),
    autoIncidentEnabled: true,
  }))
);

// ─── Escalation Config ───────────────────────────────────────────────

export const escalationContacts: EscalationContact[] = [
  { id: "esc-c-1", email: "oncall-primary@kaya.io", name: "Primary On-Call", order: 1 },
  { id: "esc-c-2", email: "oncall-secondary@kaya.io", name: "Secondary On-Call", order: 2 },
  { id: "esc-c-3", email: "engineering-lead@kaya.io", name: "Engineering Lead", order: 3 },
  { id: "esc-c-4", email: "vp-engineering@kaya.io", name: "VP Engineering", order: 4 },
  { id: "esc-c-5", email: "cto@kaya.io", name: "CTO", order: 5 },
];

// ─── Admin Overview ──────────────────────────────────────────────────

export const adminOverview: AdminOverview = {
  totalComponents: 16,
  activeIncidents: 2,
  scheduledMaintenance: 1,
  totalSubscribers: subscribers.length,
};

// ─── Activity Feed ───────────────────────────────────────────────────

export const activityFeed: ActivityFeedItem[] = [
  { id: "act-1", type: "incident_created", message: "Incident created: Elevated latency on Workflow Engine", timestamp: hoursAgo(2), actor: "System (Auto-Detection)" },
  { id: "act-2", type: "incident_updated", message: "Incident updated: Cache Layer partial connectivity issues — status changed to Monitoring", timestamp: hoursAgo(1), actor: "Infrastructure Team" },
  { id: "act-3", type: "subscriber_added", message: "New subscriber: zara@umbrella.io verified their email", timestamp: hoursAgo(4), actor: "System" },
  { id: "act-4", type: "maintenance_scheduled", message: "Maintenance scheduled: Database cluster version upgrade (in 3 days)", timestamp: hoursAgo(8), actor: "DBA Team" },
  { id: "act-5", type: "incident_resolved", message: "Incident resolved: Brief API gateway timeout", timestamp: daysAgo(1), actor: "Engineering Team" },
  { id: "act-6", type: "component_updated", message: "Component status updated: Cache Layer changed to Partial Outage", timestamp: hoursAgo(5), actor: "System (Auto-Detection)" },
  { id: "act-7", type: "incident_resolved", message: "Incident resolved: Scheduled database migration caused brief downtime", timestamp: daysAgo(2), actor: "DBA Team" },
  { id: "act-8", type: "subscriber_added", message: "New subscriber: yuki@oscorp.dev subscribed to all components", timestamp: daysAgo(2), actor: "System" },
  { id: "act-9", type: "incident_created", message: "Incident created: Cache Layer partial connectivity issues", timestamp: hoursAgo(5), actor: "System (Auto-Detection)" },
  { id: "act-10", type: "incident_resolved", message: "Incident resolved: Voice Engine audio quality degradation", timestamp: daysAgo(3), actor: "Voice Team" },
];

// ─── Component Baseline Configs ─────────────────────────────────────

const infrastructureComponentIds = new Set(["database", "cache-layer", "secret-management"]);

export const componentBaselineConfigs: ComponentBaselineConfig[] =
  componentGroups.flatMap((g) =>
    g.components.map((c) => ({
      componentId: c.id,
      baselineResponseTimeMs: infrastructureComponentIds.has(c.id) ? 5000 : 15000,
    }))
  );

// ─── SLA Report Mock Data ───────────────────────────────────────────

const allComponents = componentGroups.flatMap((g) =>
  g.components.map((c) => ({ ...c, groupName: g.name }))
);

const slaTargetMap: Record<string, number> = {
  "web-app": 99.9,
  "platform-api": 99.95,
  "auth-sso": 99.9,
  "workflow-engine": 99.95,
  "triggers-scheduling": 99.9,
  "workflow-builder": 99.9,
  "voice-engine": 99.99,
  "telephony-twilio": 99.95,
  "event-subscription-mgr": 99.9,
  "insights-engine": 99.9,
  "metrics-dashboards": 99.9,
  "license-portal": 99.9,
  "license-api": 99.9,
  "database": 99.99,
  "cache-layer": 99.95,
  "secret-management": 99.99,
};

function buildSlaReport(): SlaReportData {
  const targets = allComponents.map((c) => {
    const target = slaTargetMap[c.id] ?? 99.9;
    // Most components meet SLA; cache-layer and workflow-engine breach
    const isBreach = c.id === "cache-layer" || c.id === "workflow-engine";
    const actual = isBreach
      ? parseFloat((target - (0.1 + Math.random() * 0.3)).toFixed(3))
      : parseFloat((target + Math.random() * 0.04).toFixed(3));
    return {
      componentId: c.id,
      componentName: c.name,
      groupName: c.groupName,
      slaTargetPercent: target,
      actualUptimePercent: Math.min(actual, 100),
      status: (isBreach ? "breached" : "met") as "met" | "breached",
    };
  });

  const breaches = targets
    .filter((t) => t.status === "breached")
    .map((t) => ({
      componentId: t.componentId,
      componentName: t.componentName,
      slaTargetPercent: t.slaTargetPercent,
      actualUptimePercent: t.actualUptimePercent,
      breachDurationMinutes: t.componentId === "cache-layer" ? 47 : 23,
      correlatedIncidentId: t.componentId === "cache-layer" ? "inc-002" : "inc-001",
      correlatedIncidentTitle:
        t.componentId === "cache-layer"
          ? "Cache Layer partial connectivity issues"
          : "Elevated latency on Workflow Engine",
    }));

  const metCount = targets.filter((t) => t.status === "met").length;
  const breachCount = targets.filter((t) => t.status === "breached").length;
  const avg = parseFloat(
    (targets.reduce((sum, t) => sum + t.actualUptimePercent, 0) / targets.length).toFixed(3)
  );

  return {
    periodStart: daysAgo(30),
    periodEnd: new Date().toISOString(),
    targets,
    breaches,
    mttrMttd: {
      mttrMinutes: 42,
      mttdMinutes: 8,
      incidentsAnalyzed: 17,
      periodLabel: "Last 30 days",
    },
    totalComponents: targets.length,
    componentsMeetingSla: metCount,
    componentsBreached: breachCount,
    averageUptimePercent: avg,
  };
}

export const slaReportData: SlaReportData = buildSlaReport();

// ─── Escalation Expectations ────────────────────────────────────────

export const escalationExpectations: EscalationExpectations = {
  acknowledgementMinutes: 15,
  firstResponseMinutes: 30,
  updateCadenceMinutes: 60,
};
