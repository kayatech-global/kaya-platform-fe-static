'use client';

import React, { useMemo, useState } from 'react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Bell,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Flame,
    KeyRound,
    Layers,
    Lock,
    MailCheck,
    Network,
    RefreshCw,
    Server,
    WifiOff,
    XCircle,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';
type PlatformStatus = 'operational' | 'degraded' | 'outage';
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

// Per-day history entry
interface DayRecord {
    date: string;         // ISO date "2025-12-01"
    status: ServiceStatus;
    uptime: number;       // 0–100
}

interface Service {
    id: string;
    category: 'application' | 'identity' | 'security' | 'networking' | 'cache' | 'infrastructure';
    displayName: string;
    name: string;
    status: ServiceStatus;
    components: number;
    // daily records keyed by ISO date string
    dailyHistory: Record<string, DayRecord>;
}

interface Incident {
    id: string;
    severity: IncidentSeverity;
    services: string[];
    startTime: string;   // ISO datetime
    status: IncidentStatus;
    title: string;
    latestUpdate: string;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns an array of ISO date strings ("YYYY-MM-DD") for every day in a month */
function daysInMonth(year: number, month: number): string[] {
    const days: string[] = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
        days.push(date.toISOString().slice(0, 10));
        date.setDate(date.getDate() + 1);
    }
    return days;
}

/** Build a full daily record map for Dec 2025 – Mar 2026 */
function buildHistory(
    overrides: Array<{ from: string; to: string; status: ServiceStatus; uptime: number }>,
): Record<string, DayRecord> {
    const allMonths = [
        ...daysInMonth(2025, 12),
        ...daysInMonth(2026, 1),
        ...daysInMonth(2026, 2),
        ...daysInMonth(2026, 3),
    ];
    const map: Record<string, DayRecord> = {};
    for (const d of allMonths) {
        map[d] = { date: d, status: 'operational', uptime: 100 };
    }
    for (const { from, to, status, uptime } of overrides) {
        const start = new Date(from);
        const end = new Date(to);
        const cur = new Date(start);
        while (cur <= end) {
            const k = cur.toISOString().slice(0, 10);
            if (map[k]) map[k] = { date: k, status, uptime };
            cur.setDate(cur.getDate() + 1);
        }
    }
    return map;
}

// ─── Range definitions ────────────────────────────────────────────────────────

interface MonthRange {
    label: string;       // "Dec 2025"
    year: number;
    month: number;       // 1-based
}

const ALL_RANGES: MonthRange[] = [
    { label: 'Dec 2025', year: 2025, month: 12 },
    { label: 'Jan 2026', year: 2026, month: 1 },
    { label: 'Feb 2026', year: 2026, month: 2 },
    { label: 'Mar 2026', year: 2026, month: 3 },
];

// ─── Platform Status ──────────────────────────────────────────────────────────

const PLATFORM_STATUS: { status: PlatformStatus; timestamp: string; description: string } = {
    status: 'operational',
    timestamp: '2026-03-17T14:32:00Z',
    description: 'All systems operating normally. Last incident resolved 3 days ago.',
};

// ─── Mock Services ────────────────────────────────────────────────────────────

const MOCK_SERVICES: Service[] = [
    {
        id: 'admin-ui', category: 'application', displayName: 'KAYA AI Platform', name: 'Admin UI',
        status: 'operational', components: 4,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'workflow-engine', category: 'application', displayName: 'Workflow Builder', name: 'Workflow Engine',
        status: 'operational', components: 3,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'voice-workflow', category: 'application', displayName: 'Voice Agent Service', name: 'Voice Workflow Engine',
        status: 'operational', components: 2,
        dailyHistory: buildHistory([
            { from: '2026-01-14', to: '2026-01-15', status: 'degraded', uptime: 87.3 },
        ]),
    },
    {
        id: 'admin-api', category: 'application', displayName: 'API Gateway', name: 'Admin API',
        status: 'operational', components: 5,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'insights', category: 'application', displayName: 'Insights Service', name: 'Insights',
        status: 'operational', components: 3,
        dailyHistory: buildHistory([
            { from: '2026-03-14', to: '2026-03-15', status: 'degraded', uptime: 74.1 },
        ]),
    },
    {
        id: 'dsm', category: 'application', displayName: 'Dynamic Subscription Manager', name: 'Dynamic Subscription Manager',
        status: 'degraded', components: 2,
        dailyHistory: buildHistory([
            { from: '2025-12-20', to: '2025-12-22', status: 'degraded', uptime: 91.0 },
            { from: '2026-02-07', to: '2026-02-08', status: 'degraded', uptime: 88.5 },
            { from: '2026-03-11', to: '2026-03-17', status: 'degraded', uptime: 82.0 },
        ]),
    },
    {
        id: 'workflow-triggers', category: 'application', displayName: 'Workflow Triggers', name: 'Workflow Triggers',
        status: 'degraded', components: 2,
        dailyHistory: buildHistory([
            { from: '2026-03-13', to: '2026-03-17', status: 'degraded', uptime: 90.4 },
        ]),
    },
    {
        id: 'idp-login', category: 'identity', displayName: 'IDP Login', name: 'IDP Login',
        status: 'operational', components: 2,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'idp-management', category: 'identity', displayName: 'IDP Management', name: 'IDP Management',
        status: 'operational', components: 2,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'vault-api', category: 'security', displayName: 'Vault API', name: 'Vault API',
        status: 'operational', components: 1,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'vault-cluster', category: 'security', displayName: 'Vault Cluster', name: 'Vault Cluster',
        status: 'operational', components: 3,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'vault-ui', category: 'security', displayName: 'Vault UI', name: 'Vault UI',
        status: 'operational', components: 1,
        dailyHistory: buildHistory([
            { from: '2026-01-22', to: '2026-01-22', status: 'maintenance', uptime: 100 },
        ]),
    },
    {
        id: 'dragonfly', category: 'cache', displayName: 'Dragonfly', name: 'Dragonfly',
        status: 'outage', components: 3,
        dailyHistory: buildHistory([
            { from: '2026-02-19', to: '2026-02-21', status: 'degraded', uptime: 68.0 },
            { from: '2026-03-02', to: '2026-03-17', status: 'outage', uptime: 0 },
        ]),
    },
    {
        id: 'istio-ingress', category: 'networking', displayName: 'Istio Ingress Gateway', name: 'Istio Ingress',
        status: 'operational', components: 2,
        dailyHistory: buildHistory([]),
    },
    {
        id: 'aws-alb', category: 'networking', displayName: 'Application Load Balancer', name: 'AWS ALB',
        status: 'operational', components: 2,
        dailyHistory: buildHistory([]),
    },
];

// ─── Mock Incidents ───────────────────────────────────────────────────────────

const MOCK_INCIDENTS: Incident[] = [
    // March 2026
    {
        id: 'inc-001', severity: 'critical', services: ['Dragonfly'],
        startTime: '2026-03-17T08:14:00Z', status: 'investigating',
        title: 'Dragonfly cache cluster complete outage',
        latestUpdate: 'Cache cluster pods are in CrashLoopBackOff. We have identified a misconfigured PodDisruptionBudget following the 08:00 rolling update. Rollback is in progress. ETA for recovery: 30 min.',
    },
    {
        id: 'inc-002', severity: 'high', services: ['Dynamic Subscription Manager', 'Workflow Triggers'],
        startTime: '2026-03-17T06:45:00Z', status: 'identified',
        title: 'Elevated error rates on DSM & Workflow Triggers',
        latestUpdate: 'Root cause traced to a dependency on the Dragonfly cache. Both services have fallback logic but are experiencing ~2% error rate. No data loss. Services will self-heal once cache is restored.',
    },
    {
        id: 'inc-003', severity: 'medium', services: ['Insights'],
        startTime: '2026-03-14T22:10:00Z', status: 'resolved',
        title: 'Insights dashboard query latency spike',
        latestUpdate: 'Resolved. The spike was caused by a missing index on the analytics_events table. Index has been added and queries are now returning sub-200ms. Closed 2026-03-15T03:47Z.',
    },
    {
        id: 'inc-004', severity: 'low', services: ['KAYA AI Platform'],
        startTime: '2026-03-12T14:00:00Z', status: 'resolved',
        title: 'Admin UI login page blank screen on Safari 17',
        latestUpdate: 'A Safari 17-specific CSS rendering issue was patched in v2.14.3. Deployed to production 2026-03-12T16:30Z.',
    },
    // February 2026
    {
        id: 'inc-005', severity: 'high', services: ['Dynamic Subscription Manager'],
        startTime: '2026-02-07T11:20:00Z', status: 'resolved',
        title: 'DSM subscription webhook delivery failures',
        latestUpdate: 'Webhook delivery failures traced to a misconfigured retry policy after a config deploy at 11:00. Rollback applied at 12:45. All missed webhooks replayed. Closed 2026-02-08T09:00Z.',
    },
    {
        id: 'inc-006', severity: 'medium', services: ['Dragonfly'],
        startTime: '2026-02-19T03:40:00Z', status: 'resolved',
        title: 'Dragonfly elevated memory usage causing eviction spikes',
        latestUpdate: 'An unoptimized bulk-write job caused memory pressure. The job was terminated and the cache was rehydrated. Memory is back within normal bounds. Closed 2026-02-21T07:12Z.',
    },
    // January 2026
    {
        id: 'inc-007', severity: 'medium', services: ['Voice Agent Service'],
        startTime: '2026-01-14T17:05:00Z', status: 'resolved',
        title: 'Voice agent transcription latency p99 above threshold',
        latestUpdate: 'Upstream speech provider experienced partial degradation. Traffic was rerouted to secondary region. p99 latency returned to normal by 2026-01-15T02:00Z.',
    },
    {
        id: 'inc-008', severity: 'low', services: ['Vault UI'],
        startTime: '2026-01-22T08:00:00Z', status: 'resolved',
        title: 'Vault UI scheduled maintenance window',
        latestUpdate: 'Planned maintenance completed successfully. Certificate rotation and UI dependency upgrades applied. No data loss. Closed 2026-01-22T10:30Z.',
    },
    // December 2025
    {
        id: 'inc-009', severity: 'high', services: ['Dynamic Subscription Manager'],
        startTime: '2025-12-20T15:30:00Z', status: 'resolved',
        title: 'DSM database connection pool exhaustion',
        latestUpdate: 'A batch processing job opened connections without releasing them, exhausting the pool. The job was terminated, pool was reset, and connection limits per job were enforced. Closed 2025-12-22T11:00Z.',
    },
    {
        id: 'inc-010', severity: 'low', services: ['API Gateway'],
        startTime: '2025-12-10T09:15:00Z', status: 'resolved',
        title: 'API Gateway rate limiter false positives',
        latestUpdate: 'A misconfigured rate limit rule triggered false positives for ~0.3% of requests. Rule corrected and deployed. Closed 2025-12-10T11:45Z.',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });

const formatDate = (isoDate: string) =>
    new Date(isoDate + 'T12:00:00Z').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

const uptimeColorClass = (pct: number): string => {
    if (pct === 0) return 'text-destructive';
    if (pct < 99.5) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-500';
};

// Average uptime across a set of DayRecords
const avgUptime = (records: DayRecord[]): number => {
    if (!records.length) return 100;
    return records.reduce((sum, r) => sum + r.uptime, 0) / records.length;
};

// ─── Config maps ──────────────────────────────────────────────────────────────

const platformStatusConfig: Record<
    PlatformStatus,
    {
        heroBg: string;
        heroBorder: string;
        heroIconBg: string;
        iconColor: string;
        icon: React.ReactNode;
        headline: string;
        badgeVariant: 'success' | 'warning' | 'destructive';
    }
> = {
    operational: {
        heroBg: 'bg-green-50 dark:bg-green-950/30',
        heroBorder: 'border-green-200 dark:border-green-800',
        heroIconBg: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
        icon: <CheckCircle2 size={28} />,
        headline: "We're fully operational",
        badgeVariant: 'success',
    },
    degraded: {
        heroBg: 'bg-amber-50 dark:bg-amber-950/30',
        heroBorder: 'border-amber-200 dark:border-amber-800',
        heroIconBg: 'bg-amber-100 dark:bg-amber-900/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        icon: <AlertTriangle size={28} />,
        headline: 'Partial system degradation',
        badgeVariant: 'warning',
    },
    outage: {
        heroBg: 'bg-red-50 dark:bg-red-950/30',
        heroBorder: 'border-red-200 dark:border-red-800',
        heroIconBg: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-destructive',
        icon: <XCircle size={28} />,
        headline: 'Major outage in progress',
        badgeVariant: 'destructive',
    },
};

const serviceStatusBadgeVariant: Record<ServiceStatus, 'success' | 'warning' | 'destructive' | 'info'> = {
    operational: 'success',
    degraded: 'warning',
    outage: 'destructive',
    maintenance: 'info',
};

const serviceStatusLabel: Record<ServiceStatus, string> = {
    operational: 'Operational',
    degraded: 'Degraded',
    outage: 'Outage',
    maintenance: 'Maintenance',
};

const historySegmentClass: Record<ServiceStatus, string> = {
    operational: 'bg-green-500',
    degraded:    'bg-amber-400',
    outage:      'bg-red-500',
    maintenance: 'bg-blue-400',
};

const severityBadgeVariant: Record<IncidentSeverity, 'critical' | 'destructive' | 'warning' | 'info'> = {
    critical: 'critical',
    high: 'destructive',
    medium: 'warning',
    low: 'info',
};

const severityIcon: Record<IncidentSeverity, React.ReactNode> = {
    critical: <Flame size={11} />,
    high: <AlertCircle size={11} />,
    medium: <AlertTriangle size={11} />,
    low: <Activity size={11} />,
};

const severityLabel: Record<IncidentSeverity, string> = {
    critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
};

const incidentStatusBadgeVariant: Record<IncidentStatus, 'destructive' | 'warning' | 'info' | 'success'> = {
    investigating: 'destructive', identified: 'warning', monitoring: 'info', resolved: 'success',
};

const incidentStatusLabel: Record<IncidentStatus, string> = {
    investigating: 'Investigating', identified: 'Identified', monitoring: 'Monitoring', resolved: 'Resolved',
};

const categoryIcons: Record<Service['category'], React.ReactNode> = {
    application:    <Layers size={11} />,
    identity:       <KeyRound size={11} />,
    security:       <Lock size={11} />,
    networking:     <Network size={11} />,
    cache:          <Zap size={11} />,
    infrastructure: <Server size={11} />,
};

const categoryLabels: Record<Service['category'], string> = {
    application: 'Application', identity: 'Identity', security: 'Security',
    networking: 'Networking', cache: 'Cache', infrastructure: 'Infrastructure',
};

// ─── Range Selector ───────────────────────────────────────────────────────────

interface RangeSelectorProps {
    ranges: MonthRange[];
    activeIndex: number;
    onPrev: () => void;
    onNext: () => void;
}

const RangeSelector = ({ ranges, activeIndex, onPrev, onNext }: RangeSelectorProps) => {
    const active = ranges[activeIndex];
    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0"
                aria-label="Previous month"
                onClick={onPrev}
                disabled={activeIndex === 0}
            >
                <ChevronLeft size={15} />
            </Button>
            <span className="text-xs text-muted-foreground px-1 min-w-[80px] text-center">
                {active.label}
            </span>
            <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0"
                aria-label="Next month"
                onClick={onNext}
                disabled={activeIndex === ranges.length - 1}
            >
                <ChevronRight size={15} />
            </Button>
        </div>
    );
};

// ─── ServiceRow ───────────────────────────────────────────────────────────────

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    date: string;
    status: ServiceStatus;
    uptime: number;
}

const ServiceRow = ({ service, days }: { service: Service; days: string[] }) => {
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false, x: 0, y: 0, date: '', status: 'operational', uptime: 100,
    });

    const records = days.map(d => service.dailyHistory[d] ?? { date: d, status: 'operational' as ServiceStatus, uptime: 100 });
    const pct = avgUptime(records);

    // Derive current status from the last day in the range
    const latestRecord = records[records.length - 1];
    const currentStatus = latestRecord?.status ?? service.status;

    const handleBarMouseEnter = (e: React.MouseEvent<HTMLSpanElement>, record: DayRecord) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            date: record.date,
            status: record.status,
            uptime: record.uptime,
        });
    };

    const handleBarMouseLeave = () => {
        setTooltip(t => ({ ...t, visible: false }));
    };

    return (
        <div className={cn(
            'group flex items-center gap-4 px-4 py-3 rounded-lg border border-border',
            'bg-card hover:bg-muted/50 transition-all duration-150 cursor-default',
        )}>
            {/* Service name + category — no components count */}
            <div className="flex flex-col gap-0.5 w-52 shrink-0 min-w-0">
                <span
                    className="text-sm font-medium text-foreground truncate leading-snug"
                    title={service.displayName}
                >
                    {service.displayName}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                    {categoryIcons[service.category]}
                    <span className="text-[11px]">{categoryLabels[service.category]}</span>
                </div>
            </div>

            {/* History timeline — one bar per day in selected month */}
            <div
                className="flex items-center gap-px flex-1 min-w-0 overflow-hidden"
                role="img"
                aria-label={`${service.displayName} uptime history`}
            >
                {records.map((rec, i) => (
                    <span
                        key={i}
                        className={cn(
                            'inline-block h-8 rounded-[2px] flex-1 min-w-[2px] transition-opacity',
                            'hover:opacity-75',
                            historySegmentClass[rec.status],
                        )}
                        aria-label={`${formatDate(rec.date)}: ${serviceStatusLabel[rec.status]}, ${rec.uptime === 100 ? '100' : rec.uptime.toFixed(1)}% uptime`}
                        onMouseEnter={e => handleBarMouseEnter(e, rec)}
                        onMouseLeave={handleBarMouseLeave}
                    />
                ))}
            </div>

            {/* Status + uptime for the selected month */}
            <div className="flex flex-col items-end gap-1 shrink-0 w-28 text-right">
                <Badge variant={serviceStatusBadgeVariant[currentStatus]} size="sm">
                    {serviceStatusLabel[currentStatus]}
                </Badge>
                <span className={cn('text-sm font-semibold tabular-nums', uptimeColorClass(pct))}>
                    {pct === 100 ? '100%' : `${pct.toFixed(2)}%`}
                </span>
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Uptime
                </span>
            </div>

            {/* Floating tooltip — rendered via fixed positioning */}
            {tooltip.visible && (
                <div
                    className={cn(
                        'fixed z-50 pointer-events-none',
                        'bg-popover border border-border rounded-md shadow-md px-3 py-2',
                        'text-xs text-popover-foreground min-w-[160px]',
                        '-translate-x-1/2 -translate-y-full',
                    )}
                    style={{ left: tooltip.x, top: tooltip.y }}
                    role="tooltip"
                >
                    <p className="font-semibold text-foreground mb-0.5">{formatDate(tooltip.date)}</p>
                    <p className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full', historySegmentClass[tooltip.status])} />
                        {serviceStatusLabel[tooltip.status]}
                    </p>
                    <p className={cn('tabular-nums mt-0.5', uptimeColorClass(tooltip.uptime))}>
                        {tooltip.uptime === 100 ? '100%' : `${tooltip.uptime.toFixed(1)}%`} uptime
                    </p>
                </div>
            )}
        </div>
    );
};

// ─── Incident Row ─────────────────────────────────────────────────────────────

const IncidentRow = ({ incident }: { incident: Incident }) => (
    <Card>
        <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <Badge
                    variant={severityBadgeVariant[incident.severity]}
                    size="sm"
                    className="shrink-0 flex items-center gap-1 mt-0.5"
                >
                    {severityIcon[incident.severity]}
                    {severityLabel[incident.severity]}
                </Badge>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">{incident.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Badge variant={incidentStatusBadgeVariant[incident.status]} size="sm">
                            {incidentStatusLabel[incident.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(incident.startTime)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {incident.services.map(svc => (
                    <Badge key={svc} variant="secondary" size="sm">{svc}</Badge>
                ))}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
                {incident.latestUpdate}
            </p>
        </CardContent>
    </Card>
);

// ─── Uptime Tab ───────────────────────────────────────────────────────────────

const UptimeTab = ({ rangeIndex, onPrev, onNext }: { rangeIndex: number; onPrev: () => void; onNext: () => void }) => {
    const ps = platformStatusConfig[PLATFORM_STATUS.status];
    const range = ALL_RANGES[rangeIndex];
    const days = useMemo(() => daysInMonth(range.year, range.month), [range]);

    return (
        <div className="flex flex-col gap-5">
            {/* Hero status card */}
            <div className={cn('rounded-xl border p-5 flex items-center gap-4', ps.heroBg, ps.heroBorder)}>
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', ps.heroIconBg)}>
                    <span className={ps.iconColor}>{ps.icon}</span>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-foreground">{ps.headline}</h2>
                    <p className="text-sm text-muted-foreground">{PLATFORM_STATUS.description}</p>
                    <p className="text-xs text-muted-foreground/70">
                        Last updated: {formatTimestamp(PLATFORM_STATUS.timestamp)}
                    </p>
                </div>
                <Badge variant={ps.badgeVariant} size="sm" className="flex items-center gap-1.5 shrink-0 self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Live
                </Badge>
            </div>

            {/* System status header with range selector */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold text-foreground">System status</span>
                <RangeSelector
                    ranges={ALL_RANGES}
                    activeIndex={rangeIndex}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </div>

            {/* Vertical service list */}
            <div className="flex flex-col gap-2">
                {MOCK_SERVICES.map(service => (
                    <ServiceRow key={service.id} service={service} days={days} />
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-1 pb-2">
                {(['operational', 'degraded', 'outage', 'maintenance'] as ServiceStatus[]).map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className={cn('w-3 h-3 rounded-sm', historySegmentClass[s])} />
                        <span className="text-[11px] text-muted-foreground capitalize">{serviceStatusLabel[s]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Incidents Tab ────────────────────────────────────────────────────────────

type IncidentFilter = 'all' | IncidentStatus;

const INCIDENT_FILTER_OPTIONS = [
    { name: 'All Incidents', value: 'all' },
    { name: 'Investigating', value: 'investigating' },
    { name: 'Identified', value: 'identified' },
    { name: 'Monitoring', value: 'monitoring' },
    { name: 'Resolved', value: 'resolved' },
];

const IncidentsTab = ({ rangeIndex, onPrev, onNext }: { rangeIndex: number; onPrev: () => void; onNext: () => void }) => {
    const [filter, setFilter] = useState<IncidentFilter>('all');
    const range = ALL_RANGES[rangeIndex];

    // Filter incidents to those that started within the selected month
    const inRange = useMemo(() => {
        const startOfMonth = new Date(range.year, range.month - 1, 1);
        const endOfMonth   = new Date(range.year, range.month, 0, 23, 59, 59);
        return MOCK_INCIDENTS.filter(i => {
            const t = new Date(i.startTime);
            return t >= startOfMonth && t <= endOfMonth;
        });
    }, [range]);

    const filtered = inRange.filter(i => filter === 'all' || i.status === filter);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">Filter by status:</span>
                    <Select
                        options={INCIDENT_FILTER_OPTIONS}
                        value={filter}
                        onChange={e => setFilter(e.target.value as IncidentFilter)}
                        containerClassName="!w-[200px]"
                    />
                </div>
                <RangeSelector
                    ranges={ALL_RANGES}
                    activeIndex={rangeIndex}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-12">
                        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No incidents found</p>
                        <p className="text-xs text-muted-foreground">
                            {inRange.length === 0
                                ? `No incidents were recorded in ${range.label}.`
                                : 'No incidents match the selected filter.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(incident => (
                        <IncidentRow key={incident.id} incident={incident} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Subscription Panel ───────────────────────────────────────────────────────

const FREQUENCY_OPTIONS = [
    { name: 'Daily', value: 'daily' },
    { name: 'Weekly', value: 'weekly' },
    { name: 'Monthly', value: 'monthly' },
];

const SubscriptionPanel = () => {
    const [email, setEmail] = useState('');
    const [frequency, setFrequency] = useState('weekly');
    const [subscribed, setSubscribed] = useState(false);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Bell size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                            Status Digest
                        </span>
                        <span className="text-xs text-muted-foreground">
                            — receive email summaries of platform health
                        </span>
                    </div>

                    {subscribed ? (
                        <div className="flex flex-wrap items-center gap-3 ml-auto">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MailCheck size={13} className="text-green-600 dark:text-green-500" />
                                <span>
                                    Subscribed at{' '}
                                    <span className="font-medium text-foreground">{email}</span>
                                    {' '}({frequency})
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setSubscribed(false); setEmail(''); }}
                                className="h-7 text-xs text-muted-foreground"
                            >
                                Unsubscribe
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-end gap-2 ml-auto">
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                containerClassName="!w-[220px]"
                                leadingIcon={<Bell size={14} />}
                            />
                            <Select
                                options={FREQUENCY_OPTIONS}
                                value={frequency}
                                onChange={e => setFrequency(e.target.value)}
                                containerClassName="!w-[130px]"
                            />
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => { if (email) setSubscribed(true); }}
                                disabled={!email}
                            >
                                Subscribe
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center">
                <WifiOff size={22} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-foreground">Status endpoint unavailable</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                    We could not reach the KAYA status service. This may be a transient network issue.
                </p>
            </div>
            <Button size="sm" variant="secondary" leadingIcon={<RefreshCw size={13} />} onClick={onRetry}>
                Retry
            </Button>
        </CardContent>
    </Card>
);

// ─── KayaStatusSurface ────────────────────────────────────────────────────────

const KayaStatusSurface = () => {
    const [hasError] = useState(false);
    const [rangeIndex, setRangeIndex] = useState(ALL_RANGES.length - 1); // default to most recent
    const openIncidentCount = MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length;

    const handlePrev = () => setRangeIndex(i => Math.max(0, i - 1));
    const handleNext = () => setRangeIndex(i => Math.min(ALL_RANGES.length - 1, i + 1));

    return (
        <div className="flex flex-col gap-5 w-full">
            {hasError ? (
                <ErrorState onRetry={() => {}} />
            ) : (
                <>
                    <SubscriptionPanel />

                    <Tabs defaultValue="uptime" className="flex flex-col gap-5">
                        <TabsList>
                            <TabsTrigger value="uptime">Uptime</TabsTrigger>
                            <TabsTrigger value="incidents" className="flex items-center gap-2">
                                Incidents
                                {openIncidentCount > 0 && (
                                    <Badge variant="warning" size="sm">{openIncidentCount}</Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="uptime" className="mt-0">
                            <UptimeTab
                                rangeIndex={rangeIndex}
                                onPrev={handlePrev}
                                onNext={handleNext}
                            />
                        </TabsContent>

                        <TabsContent value="incidents" className="mt-0">
                            <IncidentsTab
                                rangeIndex={rangeIndex}
                                onPrev={handlePrev}
                                onNext={handleNext}
                            />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default KayaStatusSurface;
