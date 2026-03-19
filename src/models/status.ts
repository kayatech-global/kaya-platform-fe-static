// ─── Status Page Types ───────────────────────────────────────────────

export type ComponentStatus =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "major-outage"
  | "maintenance";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export type IncidentImpact = "minor" | "major" | "critical";

export type UptimeDayStatus =
  | "operational"
  | "degraded"
  | "partial-outage"
  | "major-outage"
  | "maintenance"
  | "no-data";

export type SeverityThreshold = "all" | "major" | "critical";

// ─── Component Models ────────────────────────────────────────────────

export interface StatusComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  description?: string;
  mappedService?: string;
  healthCheckUrl?: string;
  pollingIntervalSeconds?: number;
  failureThreshold?: number;
}

export interface ComponentGroup {
  id: string;
  name: string;
  status: ComponentStatus;
  components: StatusComponent[];
  uptimeData: UptimeDay[];
}

export interface UptimeDay {
  date: string; // ISO date string
  status: UptimeDayStatus;
  uptimePercent: number;
}

// ─── Incident Models ─────────────────────────────────────────────────

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  message: string;
  createdAt: string; // ISO datetime string
  author?: string;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  impact: IncidentImpact;
  affectedComponents: string[]; // component IDs
  affectedComponentNames: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

// ─── Maintenance Models ──────────────────────────────────────────────

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  affectedComponents: string[];
  affectedComponentNames: string[];
  status: "scheduled" | "in-progress" | "completed";
}

// ─── Subscriber Models ───────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  componentGroups: string[]; // group IDs
  severityThreshold: SeverityThreshold;
  verified: boolean;
  subscribedAt: string;
}

// ─── Health Check Models ─────────────────────────────────────────────

export interface HealthCheckResult {
  componentId: string;
  componentName: string;
  groupName: string;
  status: ComponentStatus;
  lastCheck: string;
  responseTimeMs: number;
  consecutiveFailures: number;
  healthCheckUrl: string;
  autoIncidentEnabled: boolean;
}

// ─── Escalation Models ───────────────────────────────────────────────

export interface EscalationContact {
  id: string;
  email: string;
  name: string;
  order: number;
}

export interface EscalationRule {
  id: string;
  incidentImpact: IncidentImpact;
  delayMinutes: number;
  contacts: EscalationContact[];
}

// ─── SLA Report Models ──────────────────────────────────────────────

export type SlaStatus = "met" | "breached";

export type NetworkAccess = "public" | "private-k8s";

export interface SlaTarget {
  componentId: string;
  componentName: string;
  groupName: string;
  slaTargetPercent: number;
  actualUptimePercent: number;
  status: SlaStatus;
}

export interface SlaBreachDetail {
  componentId: string;
  componentName: string;
  slaTargetPercent: number;
  actualUptimePercent: number;
  breachDurationMinutes: number;
  correlatedIncidentId: string;
  correlatedIncidentTitle: string;
}

export interface MttrMttdStats {
  mttrMinutes: number;
  mttdMinutes: number;
  incidentsAnalyzed: number;
  periodLabel: string;
}

export interface SlaReportData {
  periodStart: string;
  periodEnd: string;
  targets: SlaTarget[];
  breaches: SlaBreachDetail[];
  mttrMttd: MttrMttdStats;
  totalComponents: number;
  componentsMeetingSla: number;
  componentsBreached: number;
  averageUptimePercent: number;
}

// ─── Component Baseline Config ──────────────────────────────────────

export interface ComponentBaselineConfig {
  componentId: string;
  baselineResponseTimeMs: number;
  pollingIntervalMinutes: number;
  networkAccess: NetworkAccess;
}

// ─── Escalation Expectations ────────────────────────────────────────

export interface EscalationExpectations {
  acknowledgementMinutes: number;
  firstResponseMinutes: number;
  updateCadenceMinutes: number;
}

// ─── Admin Dashboard ─────────────────────────────────────────────────

export interface AdminOverview {
  totalComponents: number;
  activeIncidents: number;
  scheduledMaintenance: number;
  totalSubscribers: number;
}

export interface ActivityFeedItem {
  id: string;
  type: "incident_created" | "incident_updated" | "incident_resolved" | "maintenance_scheduled" | "subscriber_added" | "component_updated";
  message: string;
  timestamp: string;
  actor?: string;
}

// ─── Overall Status Helpers ──────────────────────────────────────────

export const STATUS_PRIORITY: Record<ComponentStatus, number> = {
  "major-outage": 4,
  "partial-outage": 3,
  "degraded": 2,
  "maintenance": 1,
  "operational": 0,
};

export function getOverallStatus(groups: ComponentGroup[]): ComponentStatus {
  let worst: ComponentStatus = "operational";
  for (const group of groups) {
    if (STATUS_PRIORITY[group.status] > STATUS_PRIORITY[worst]) {
      worst = group.status;
    }
  }
  return worst;
}

export function getGroupStatus(components: StatusComponent[]): ComponentStatus {
  let worst: ComponentStatus = "operational";
  for (const comp of components) {
    if (STATUS_PRIORITY[comp.status] > STATUS_PRIORITY[worst]) {
      worst = comp.status;
    }
  }
  return worst;
}

export const STATUS_LABELS: Record<ComponentStatus, string> = {
  operational: "Operational",
  degraded: "Degraded Performance",
  "partial-outage": "Partial Outage",
  "major-outage": "Major Outage",
  maintenance: "Under Maintenance",
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export const IMPACT_LABELS: Record<IncidentImpact, string> = {
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};
