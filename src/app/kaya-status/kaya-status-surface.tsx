'use client';

import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Select } from '@/components/atoms/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';
type PlatformStatus = 'operational' | 'degraded' | 'outage';
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

interface ServiceUptime {
    '24h': number;
    '7d': number;
    '30d': number;
}

interface Service {
    id: string;
    category: 'application' | 'identity' | 'security' | 'networking' | 'cache' | 'infrastructure';
    displayName: string;
    name: string;
    uptime: ServiceUptime;
    status: ServiceStatus;
    components: number;
    history: ServiceStatus[];
}

interface Incident {
    id: string;
    severity: IncidentSeverity;
    services: string[];
    startTime: string;
    status: IncidentStatus;
    title: string;
    latestUpdate: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PLATFORM_STATUS: { status: PlatformStatus; timestamp: string; description: string } = {
    status: 'operational',
    timestamp: '2026-03-17T14:32:00Z',
    description: 'All systems operating normally. Last incident resolved 3 days ago.',
};

// 40-segment history arrays — most recent segment last (right-most)
const MOCK_SERVICES: Service[] = [
    {
        id: 'admin-ui', category: 'application', displayName: 'KAYA AI Platform', name: 'Admin UI',
        uptime: { '24h': 100, '7d': 99.99, '30d': 99.95 }, status: 'operational', components: 4,
        history: Array(38).fill('operational').concat(['operational', 'operational']),
    },
    {
        id: 'workflow-engine', category: 'application', displayName: 'Workflow Builder', name: 'Workflow Engine',
        uptime: { '24h': 100, '7d': 100, '30d': 99.93 }, status: 'operational', components: 3,
        history: Array(37).fill('operational').concat(['operational', 'operational', 'operational']),
    },
    {
        id: 'voice-workflow', category: 'application', displayName: 'Voice Agent Service', name: 'Voice Workflow Engine',
        uptime: { '24h': 100, '7d': 99.72, '30d': 99.48 }, status: 'operational', components: 2,
        history: [...Array(30).fill('operational'), 'degraded', 'degraded', ...Array(8).fill('operational')],
    },
    {
        id: 'admin-api', category: 'application', displayName: 'API Gateway', name: 'Admin API',
        uptime: { '24h': 100, '7d': 99.97, '30d': 99.91 }, status: 'operational', components: 5,
        history: Array(40).fill('operational'),
    },
    {
        id: 'insights', category: 'application', displayName: 'Insights Service', name: 'Insights',
        uptime: { '24h': 100, '7d': 99.84, '30d': 99.62 }, status: 'operational', components: 3,
        history: [...Array(28).fill('operational'), 'degraded', 'degraded', 'degraded', ...Array(9).fill('operational')],
    },
    {
        id: 'dsm', category: 'application', displayName: 'Dynamic Subscription Manager', name: 'Dynamic Subscription Manager',
        uptime: { '24h': 98.6, '7d': 97.82, '30d': 98.44 }, status: 'degraded', components: 2,
        history: [...Array(33).fill('operational'), 'degraded', 'degraded', 'degraded', 'degraded', 'degraded', 'degraded', 'degraded'],
    },
    {
        id: 'workflow-triggers', category: 'application', displayName: 'Workflow Triggers', name: 'Workflow Triggers',
        uptime: { '24h': 99.1, '7d': 99.55, '30d': 99.17 }, status: 'degraded', components: 2,
        history: [...Array(35).fill('operational'), 'degraded', 'degraded', 'degraded', 'degraded', 'degraded'],
    },
    {
        id: 'idp-login', category: 'identity', displayName: 'IDP Login', name: 'IDP Login',
        uptime: { '24h': 100, '7d': 99.99, '30d': 99.96 }, status: 'operational', components: 2,
        history: Array(40).fill('operational'),
    },
    {
        id: 'idp-management', category: 'identity', displayName: 'IDP Management', name: 'IDP Management',
        uptime: { '24h': 100, '7d': 99.95, '30d': 99.88 }, status: 'operational', components: 2,
        history: [...Array(39).fill('operational'), 'operational'],
    },
    {
        id: 'vault-api', category: 'security', displayName: 'Vault API', name: 'Vault API',
        uptime: { '24h': 100, '7d': 100, '30d': 100 }, status: 'operational', components: 1,
        history: Array(40).fill('operational'),
    },
    {
        id: 'vault-cluster', category: 'security', displayName: 'Vault Cluster', name: 'Vault Cluster',
        uptime: { '24h': 100, '7d': 100, '30d': 99.99 }, status: 'operational', components: 3,
        history: Array(40).fill('operational'),
    },
    {
        id: 'vault-ui', category: 'security', displayName: 'Vault UI', name: 'Vault UI',
        uptime: { '24h': 100, '7d': 99.94, '30d': 99.82 }, status: 'operational', components: 1,
        history: [...Array(38).fill('operational'), 'maintenance', 'operational'],
    },
    {
        id: 'dragonfly', category: 'cache', displayName: 'Dragonfly', name: 'Dragonfly',
        uptime: { '24h': 0, '7d': 71.43, '30d': 91.67 }, status: 'outage', components: 3,
        history: [
            ...Array(22).fill('operational'),
            'degraded', 'degraded',
            'outage', 'outage', 'outage', 'outage', 'outage',
            'outage', 'outage', 'outage', 'outage', 'outage',
            'outage', 'outage', 'outage', 'outage', 'outage',
            'outage',
        ],
    },
    {
        id: 'istio-ingress', category: 'networking', displayName: 'Istio Ingress Gateway', name: 'Istio Ingress',
        uptime: { '24h': 100, '7d': 99.98, '30d': 99.96 }, status: 'operational', components: 2,
        history: Array(40).fill('operational'),
    },
    {
        id: 'aws-alb', category: 'networking', displayName: 'Application Load Balancer', name: 'AWS ALB',
        uptime: { '24h': 100, '7d': 100, '30d': 100 }, status: 'operational', components: 2,
        history: Array(40).fill('operational'),
    },
];

const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'inc-001', severity: 'critical', services: ['Dragonfly'],
        startTime: '2026-03-17T08:14:00Z', status: 'investigating',
        title: 'Dragonfly cache cluster complete outage',
        latestUpdate:
            'Cache cluster pods are in CrashLoopBackOff. We have identified a misconfigured PodDisruptionBudget following the 08:00 rolling update. Rollback is in progress. ETA for recovery: 30 min.',
    },
    {
        id: 'inc-002', severity: 'high', services: ['Dynamic Subscription Manager', 'Workflow Triggers'],
        startTime: '2026-03-17T06:45:00Z', status: 'identified',
        title: 'Elevated error rates on DSM & Workflow Triggers',
        latestUpdate:
            'Root cause traced to a dependency on the Dragonfly cache. Both services have fallback logic but are experiencing ~2% error rate. No data loss. Services will self-heal once cache is restored.',
    },
    {
        id: 'inc-003', severity: 'medium', services: ['Insights'],
        startTime: '2026-03-14T22:10:00Z', status: 'resolved',
        title: 'Insights dashboard query latency spike',
        latestUpdate:
            'Resolved. The spike was caused by a missing index on the analytics_events table. Index has been added and queries are now returning sub-200ms. Closed 2026-03-15T03:47Z.',
    },
    {
        id: 'inc-004', severity: 'low', services: ['KAYA AI Platform'],
        startTime: '2026-03-12T14:00:00Z', status: 'resolved',
        title: 'Admin UI login page blank screen on Safari 17',
        latestUpdate:
            'A Safari 17-specific CSS rendering issue was patched in v2.14.3. Deployed to production 2026-03-12T16:30Z. All affected users have been notified.',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    });

const uptimeColorClass = (pct: number): string => {
    if (pct === 0) return 'text-destructive';
    if (pct < 99.5) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-500';
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

// Maps a history segment status → tailwind bg classes
const historySegmentClass: Record<ServiceStatus, string> = {
    operational: 'bg-green-500 dark:bg-green-500',
    degraded:    'bg-amber-400 dark:bg-amber-400',
    outage:      'bg-red-500 dark:bg-red-500',
    maintenance: 'bg-blue-400 dark:bg-blue-400',
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

// ─── ServiceRow ───────────────────────────────────────────────────────────────

const ServiceRow = ({ service, timeframe }: { service: Service; timeframe: '24h' | '7d' | '30d' }) => {
    const pct = service.uptime[timeframe];
    const uptimeLabel = timeframe === '24h' ? '24H UPTIME' : timeframe === '7d' ? '7D UPTIME' : '30D UPTIME';

    return (
        <div className={cn(
            'group flex items-center gap-4 px-4 py-3 rounded-lg border border-border',
            'bg-card hover:bg-muted/50 transition-all duration-150',
            'cursor-default',
        )}>
            {/* Service name + category */}
            <div className="flex flex-col gap-0.5 min-w-0 w-52 shrink-0">
                <span
                    className="text-sm font-medium text-foreground truncate leading-snug"
                    title={service.displayName}
                >
                    {service.displayName}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                    {categoryIcons[service.category]}
                    <span className="text-[11px]">{categoryLabels[service.category]}</span>
                    <span className="text-[11px] text-muted-foreground/60">
                        · {service.components} {service.components === 1 ? 'component' : 'components'}
                    </span>
                </div>
            </div>

            {/* History timeline */}
            <div
                className="flex items-center gap-px flex-1 min-w-0 overflow-hidden"
                role="img"
                aria-label={`${service.displayName} uptime history`}
            >
                {service.history.map((seg, i) => (
                    <span
                        key={i}
                        className={cn(
                            'inline-block h-8 rounded-sm flex-1 min-w-[2px] transition-opacity',
                            'group-hover:opacity-90',
                            historySegmentClass[seg],
                        )}
                        aria-label={seg}
                    />
                ))}
            </div>

            {/* Status + uptime */}
            <div className="flex flex-col items-end gap-1 shrink-0 w-28 text-right">
                <Badge variant={serviceStatusBadgeVariant[service.status]} size="sm">
                    {serviceStatusLabel[service.status]}
                </Badge>
                <div className="flex flex-col items-end gap-0">
                    <span className={cn('text-sm font-semibold tabular-nums', uptimeColorClass(pct))}>
                        {pct === 100 ? '100%' : `${pct.toFixed(2)}%`}
                    </span>
                    <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        {uptimeLabel}
                    </span>
                </div>
            </div>
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
                    <Badge key={svc} variant="secondary" size="sm">
                        {svc}
                    </Badge>
                ))}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
                {incident.latestUpdate}
            </p>
        </CardContent>
    </Card>
);

// ─── Uptime Tab ───────────────────────────────────────────────────────────────

const UptimeTab = () => {
    const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
    const ps = platformStatusConfig[PLATFORM_STATUS.status];

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

            {/* System status header with breadcrumb */}
            <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-sm font-semibold text-foreground">System status</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Previous period">
                        <ChevronLeft size={15} />
                    </Button>
                    <span className="text-xs text-muted-foreground px-1">Dec 2025 – Mar 2026</span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Next period">
                        <ChevronRight size={15} />
                    </Button>
                    <div className="ml-3 flex gap-1 border-l border-border pl-3">
                        {(['24h', '7d', '30d'] as const).map(tf => (
                            <Button
                                key={tf}
                                size="sm"
                                variant={timeframe === tf ? 'secondary' : 'ghost'}
                                onClick={() => setTimeframe(tf)}
                                className="h-7 px-2.5 text-xs"
                            >
                                {tf}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vertical service list */}
            <div className="flex flex-col gap-2">
                {MOCK_SERVICES.map(service => (
                    <ServiceRow key={service.id} service={service} timeframe={timeframe} />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-1 pb-2">
                {(['operational', 'degraded', 'outage', 'maintenance'] as ServiceStatus[]).map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                        <span className={cn('w-3 h-3 rounded-sm', historySegmentClass[s])} />
                        <span className="text-[11px] text-muted-foreground capitalize">{s}</span>
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

const IncidentsTab = () => {
    const [filter, setFilter] = useState<IncidentFilter>('all');
    const filtered = MOCK_INCIDENTS.filter(i => filter === 'all' || i.status === filter);

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0">Filter by status:</span>
                <Select
                    options={INCIDENT_FILTER_OPTIONS}
                    value={filter}
                    onChange={e => setFilter(e.target.value as IncidentFilter)}
                    containerClassName="!w-[200px]"
                />
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-12">
                        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No incidents found</p>
                        <p className="text-xs text-muted-foreground">No incidents match the selected filter.</p>
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

    const handleSubscribe = () => {
        if (!email) return;
        setSubscribed(true);
    };

    const handleUnsubscribe = () => {
        setSubscribed(false);
        setEmail('');
    };

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
                                onClick={handleUnsubscribe}
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
                                onClick={handleSubscribe}
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
    const openIncidentCount = MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length;

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
                                    <Badge variant="warning" size="sm">
                                        {openIncidentCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="uptime" className="mt-0">
                            <UptimeTab />
                        </TabsContent>

                        <TabsContent value="incidents" className="mt-0">
                            <IncidentsTab />
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default KayaStatusSurface;
