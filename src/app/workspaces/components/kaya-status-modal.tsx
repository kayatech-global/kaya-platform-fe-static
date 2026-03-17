'use client';

import React, { useState } from 'react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Bell,
    CheckCircle2,
    Cloud,
    Flame,
    KeyRound,
    Layers,
    Lock,
    MailCheck,
    Network,
    RefreshCw,
    Server,
    TrendingUp,
    WifiOff,
    XCircle,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
} from '@/components/atoms/dialog';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Separator } from '@/components/atoms/separator';
import { Switch } from '@/components/atoms/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { Select } from '@/components/atoms/select';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';
type PlatformStatus = 'operational' | 'degraded' | 'outage';
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
type Timeframe = '24h' | '7d' | '30d';
type DigestFrequency = 'daily' | 'weekly' | 'monthly';

interface ServiceUptime {
    '24h': number;
    '7d': number;
    '30d': number;
}

interface Service {
    id: string;
    category: 'application' | 'identity' | 'security' | 'networking' | 'cache' | 'infrastructure';
    name: string;
    exposure: 'External' | 'Internal';
    uptime: ServiceUptime;
    status: ServiceStatus;
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

interface SubscriptionPrefs {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PLATFORM_STATUS: { status: PlatformStatus; timestamp: string; description: string } = {
    status: 'operational',
    timestamp: '2026-03-17T14:32:00Z',
    description: 'All systems operating normally. Last incident resolved 3 days ago.',
};

const MOCK_SERVICES: Service[] = [
    { id: 'admin-api', category: 'application', name: 'Admin API', exposure: 'Internal', uptime: { '24h': 100, '7d': 99.97, '30d': 99.91 }, status: 'operational' },
    { id: 'admin-ui', category: 'application', name: 'Admin UI', exposure: 'External', uptime: { '24h': 100, '7d': 99.99, '30d': 99.95 }, status: 'operational' },
    { id: 'dsm', category: 'application', name: 'Dynamic Subscription Manager', exposure: 'Internal', uptime: { '24h': 98.6, '7d': 97.82, '30d': 98.44 }, status: 'degraded' },
    { id: 'healthfirst', category: 'application', name: 'Healthfirst', exposure: 'External', uptime: { '24h': 100, '7d': 100, '30d': 99.78 }, status: 'operational' },
    { id: 'insights', category: 'application', name: 'Insights', exposure: 'External', uptime: { '24h': 100, '7d': 99.84, '30d': 99.62 }, status: 'operational' },
    { id: 'voice-workflow', category: 'application', name: 'Voice Workflow Engine', exposure: 'Internal', uptime: { '24h': 100, '7d': 99.72, '30d': 99.48 }, status: 'operational' },
    { id: 'workflow-engine', category: 'application', name: 'Workflow Engine', exposure: 'Internal', uptime: { '24h': 100, '7d': 100, '30d': 99.93 }, status: 'operational' },
    { id: 'workflow-triggers', category: 'application', name: 'Workflow Triggers', exposure: 'Internal', uptime: { '24h': 99.1, '7d': 99.55, '30d': 99.17 }, status: 'degraded' },
    { id: 'idp-login', category: 'identity', name: 'IDP Login', exposure: 'External', uptime: { '24h': 100, '7d': 99.99, '30d': 99.96 }, status: 'operational' },
    { id: 'idp-management', category: 'identity', name: 'IDP Management', exposure: 'Internal', uptime: { '24h': 100, '7d': 99.95, '30d': 99.88 }, status: 'operational' },
    { id: 'vault-api', category: 'security', name: 'Vault API', exposure: 'Internal', uptime: { '24h': 100, '7d': 100, '30d': 100 }, status: 'operational' },
    { id: 'vault-cluster', category: 'security', name: 'Vault Cluster', exposure: 'Internal', uptime: { '24h': 100, '7d': 100, '30d': 99.99 }, status: 'operational' },
    { id: 'vault-ui', category: 'security', name: 'Vault UI', exposure: 'Internal', uptime: { '24h': 100, '7d': 99.94, '30d': 99.82 }, status: 'operational' },
    { id: 'dragonfly', category: 'cache', name: 'Dragonfly', exposure: 'Internal', uptime: { '24h': 0, '7d': 71.43, '30d': 91.67 }, status: 'outage' },
    { id: 'istio-ingress', category: 'networking', name: 'Istio Ingress', exposure: 'Internal', uptime: { '24h': 100, '7d': 99.98, '30d': 99.96 }, status: 'operational' },
    { id: 'aws-alb', category: 'networking', name: 'AWS ALB', exposure: 'External', uptime: { '24h': 100, '7d': 100, '30d': 100 }, status: 'operational' },
];

const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'inc-001',
        severity: 'critical',
        services: ['Dragonfly'],
        startTime: '2026-03-17T08:14:00Z',
        status: 'investigating',
        title: 'Dragonfly cache cluster complete outage',
        latestUpdate: 'Cache cluster pods are in CrashLoopBackOff. We have identified a misconfigured PodDisruptionBudget following the 08:00 rolling update. Rollback is in progress. ETA for recovery: 30 min.',
    },
    {
        id: 'inc-002',
        severity: 'high',
        services: ['Dynamic Subscription Manager', 'Workflow Triggers'],
        startTime: '2026-03-17T06:45:00Z',
        status: 'identified',
        title: 'Elevated error rates on DSM & Workflow Triggers',
        latestUpdate: 'Root cause traced to a dependency on the Dragonfly cache. Both services have fallback logic but are experiencing ~2% error rate. No data loss. Services will self-heal once cache is restored.',
    },
    {
        id: 'inc-003',
        severity: 'medium',
        services: ['Insights'],
        startTime: '2026-03-14T22:10:00Z',
        status: 'resolved',
        title: 'Insights dashboard query latency spike',
        latestUpdate: 'Resolved. The spike was caused by a missing index on the analytics_events table. Index has been added and queries are now returning sub-200ms. Closed 2026-03-15T03:47Z.',
    },
    {
        id: 'inc-004',
        severity: 'low',
        services: ['Admin UI'],
        startTime: '2026-03-12T14:00:00Z',
        status: 'resolved',
        title: 'Admin UI login page blank screen on Safari 17',
        latestUpdate: 'A Safari 17-specific CSS rendering issue was patched in v2.14.3. Deployed to production 2026-03-12T16:30Z. All affected users have been notified.',
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });

/**
 * Map uptime percentage to semantic Tailwind color classes that align
 * with the badge atom's own success/warning/destructive palette.
 * No dark: pairs needed — the design system tokens already handle that.
 */
const uptimeColorClass = (pct: number): string => {
    if (pct === 0) return 'text-destructive';
    if (pct < 99) return 'text-amber-600 dark:text-amber-400';
    if (pct < 99.9) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-500';
};

// ─── Status chip config ───────────────────────────────────────────────────────

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

// ─── Platform status banner config ────────────────────────────────────────────
// Use semantic tokens only — no bespoke dark: class pairs.

const platformStatusConfig: Record<
    PlatformStatus,
    { iconColorClass: string; icon: React.ReactNode; label: string; badgeVariant: 'success' | 'warning' | 'destructive' }
> = {
    operational: {
        iconColorClass: 'text-green-600 dark:text-green-500',
        icon: <CheckCircle2 size={16} />,
        label: 'All Systems Operational',
        badgeVariant: 'success',
    },
    degraded: {
        iconColorClass: 'text-amber-600 dark:text-amber-400',
        icon: <AlertTriangle size={16} />,
        label: 'Partial System Degradation',
        badgeVariant: 'warning',
    },
    outage: {
        iconColorClass: 'text-destructive',
        icon: <XCircle size={16} />,
        label: 'Major Outage',
        badgeVariant: 'destructive',
    },
};

// ─── Severity config ──────────────────────────────────────────────────────────

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
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

// ─── Incident status config ───────────────────────────────────────────────────

const incidentStatusBadgeVariant: Record<IncidentStatus, 'destructive' | 'warning' | 'info' | 'success'> = {
    investigating: 'destructive',
    identified: 'warning',
    monitoring: 'info',
    resolved: 'success',
};

const incidentStatusLabel: Record<IncidentStatus, string> = {
    investigating: 'Investigating',
    identified: 'Identified',
    monitoring: 'Monitoring',
    resolved: 'Resolved',
};

// ─── Category icons ───────────────────────────────────────────────────────────

const categoryIcons: Record<Service['category'], React.ReactNode> = {
    application: <Layers size={12} />,
    identity: <KeyRound size={12} />,
    security: <Lock size={12} />,
    networking: <Network size={12} />,
    cache: <Zap size={12} />,
    infrastructure: <Server size={12} />,
};

const categoryLabels: Record<Service['category'], string> = {
    application: 'Application',
    identity: 'Identity',
    security: 'Security',
    networking: 'Networking',
    cache: 'Cache',
    infrastructure: 'Infrastructure',
};

// ─── Service Card ─────────────────────────────────────────────────────────────

const ServiceCard = ({ service, timeframe }: { service: Service; timeframe: Timeframe }) => {
    const pct = service.uptime[timeframe];

    return (
        <Card>
            <CardContent className="p-4 flex flex-col gap-3">
                {/* Name + status badge */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-foreground leading-snug truncate">
                            {service.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            {categoryIcons[service.category]}
                            <span className="text-xs">{categoryLabels[service.category]}</span>
                        </div>
                    </div>
                    <Badge variant={serviceStatusBadgeVariant[service.status]} size="sm">
                        {serviceStatusLabel[service.status]}
                    </Badge>
                </div>

                <Separator />

                {/* Exposure + uptime */}
                <div className="flex items-center justify-between">
                    <Badge
                        variant={service.exposure === 'External' ? 'default' : 'secondary'}
                        size="sm"
                    >
                        {service.exposure}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-muted-foreground" />
                        <span className={cn('text-xs font-semibold tabular-nums', uptimeColorClass(pct))}>
                            {pct === 100 ? '100%' : `${pct.toFixed(2)}%`}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Incident Row ─────────────────────────────────────────────────────────────

const IncidentRow = ({ incident }: { incident: Incident }) => (
    <Card>
        <CardContent className="p-4 flex flex-col gap-3">
            {/* Header: severity + title */}
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

            {/* Affected services */}
            <div className="flex flex-wrap gap-1.5">
                {incident.services.map(svc => (
                    <Badge key={svc} variant="secondary" size="sm">
                        {svc}
                    </Badge>
                ))}
            </div>

            {/* Latest DevOps update */}
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
                {incident.latestUpdate}
            </p>
        </CardContent>
    </Card>
);

// ─── Uptime Tab ───────────────────────────────────────────────────────────────

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

const UptimeTab = () => {
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const ps = platformStatusConfig[PLATFORM_STATUS.status];

    return (
        <div className="flex flex-col gap-5">
            {/* Platform status banner — uses Card + semantic tokens only */}
            <Card>
                <CardHeader className="p-4 pb-0">
                    <div className="flex items-center gap-2">
                        {/* Icon in a muted chip — same treatment as workspace icon chips */}
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted border border-border">
                            <span className={ps.iconColorClass}>{ps.icon}</span>
                        </div>
                        <CardTitle className="text-sm font-semibold text-foreground">{ps.label}</CardTitle>
                        <Badge variant={ps.badgeVariant} size="sm" className="ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            Live
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                    <CardDescription className="text-xs">{PLATFORM_STATUS.description}</CardDescription>
                    <CardDescription className="text-xs mt-0.5">
                        Last updated: {formatTimestamp(PLATFORM_STATUS.timestamp)}
                    </CardDescription>
                </CardContent>
            </Card>

            {/* Timeframe picker — secondary (active) vs ghost (inactive), matching workspace filter pill pattern */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">Show uptime for:</span>
                <div className="flex gap-1">
                    {TIMEFRAMES.map(tf => (
                        <Button
                            key={tf.value}
                            size="sm"
                            variant={timeframe === tf.value ? 'secondary' : 'ghost'}
                            onClick={() => setTimeframe(tf.value)}
                            className="h-7 px-3 text-xs"
                        >
                            {tf.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Service grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_SERVICES.map(service => (
                    <ServiceCard key={service.id} service={service} timeframe={timeframe} />
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
            {/* Filter — uses the shared Select atom, same as workspace forms */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground shrink-0">Filter by status:</span>
                <Select
                    options={INCIDENT_FILTER_OPTIONS}
                    value={filter}
                    onChange={e => setFilter(e.target.value as IncidentFilter)}
                    containerClassName="!w-[200px]"
                />
            </div>

            {/* Incident list or empty state */}
            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-3 py-12">
                        {/* Muted icon chip — no bespoke green circle */}
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

const SubscriptionPanel = () => {
    const [prefs, setPrefs] = useState<SubscriptionPrefs>({ daily: false, weekly: true, monthly: false });
    const [saved, setSaved] = useState(false);
    const email = 'mock@example.com';

    const toggle = (key: DigestFrequency) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const OPTIONS: { key: DigestFrequency; label: string }[] = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
    ];

    return (
        // Card wrapper gives the subscription panel the same surface treatment
        // as other workspace form panels (bg-card, border-border, shadow).
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {/* Label + email */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Bell size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                            Email Digest
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Receive status digests at{' '}
                        <span className="font-medium text-primary">{email}</span>
                    </p>

                    {/* Toggle switches — shared Switch atom with label, same as workspace form toggles */}
                    <div className="flex items-center gap-5 flex-wrap">
                        {OPTIONS.map(({ key, label }) => (
                            <label
                                key={key}
                                htmlFor={`digest-${key}`}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Switch
                                    id={`digest-${key}`}
                                    checked={prefs[key]}
                                    onCheckedChange={() => toggle(key)}
                                />
                                <span className="text-xs font-medium text-foreground select-none">{label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Save CTA — secondary when saved (disabled), primary otherwise */}
                    <Button
                        size="sm"
                        variant={saved ? 'secondary' : 'primary'}
                        onClick={handleSave}
                        disabled={saved}
                        leadingIcon={saved ? <MailCheck size={13} /> : undefined}
                        className="ml-auto"
                    >
                        {saved ? 'Preferences saved' : 'Save preferences'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16">
            {/* Muted icon chip — no bespoke red circle */}
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center">
                <WifiOff size={22} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-foreground">Status endpoint unavailable</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                    We could not reach the KAYA status service. This may be a transient network issue.
                </p>
            </div>
            <Button
                size="sm"
                variant="secondary"
                leadingIcon={<RefreshCw size={13} />}
                onClick={onRetry}
            >
                Retry
            </Button>
        </CardContent>
    </Card>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface KayaStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const KayaStatusModal = ({ open, onOpenChange }: KayaStatusModalProps) => {
    const [hasError] = useState(false);

    const openIncidentCount = MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[unset] w-[min(95vw,960px)] max-h-[90vh] overflow-hidden flex flex-col p-0"
                autoClose
            >
                {/* Header — uses the DialogHeader atom; includes border-b from the atom itself */}
                <DialogHeader className="shrink-0 px-6 pt-5 pb-4 flex-row items-center justify-between gap-4 space-y-0">
                    <div className="flex items-center gap-3">
                        {/* Icon chip — bg-muted + border-border, same as workspace icon treatments */}
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                            <Cloud size={15} className="text-muted-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-foreground">
                                KAYA Platform Status
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Infrastructure &amp; service health — super admin view
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs + scrollable body + footer all in DialogBody */}
                <DialogBody className="flex flex-col flex-1 overflow-hidden px-0 pb-0">
                    <Tabs defaultValue="uptime" className="flex flex-col flex-1 overflow-hidden">
                        {/*
                         * TabsList: uses the atom's default rounded-lg bg-muted pill style.
                         * Wrapped in a px-6 container to align with the header inset.
                         */}
                        <div className="px-6 py-3 border-b border-border shrink-0">
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
                        </div>

                        {/* Scrollable content region */}
                        <div className="overflow-y-auto flex-1 px-6 py-5 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                            {hasError ? (
                                <ErrorState onRetry={() => {}} />
                            ) : (
                                <>
                                    <TabsContent value="uptime" className="mt-0">
                                        <UptimeTab />
                                    </TabsContent>
                                    <TabsContent value="incidents" className="mt-0">
                                        <IncidentsTab />
                                    </TabsContent>
                                </>
                            )}
                        </div>

                        {/* Subscription footer — inside DialogFooter atom for consistent border-t + padding */}
                        <DialogFooter className="shrink-0 px-6 py-4 block">
                            <SubscriptionPanel />
                        </DialogFooter>
                    </Tabs>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
};

export default KayaStatusModal;
