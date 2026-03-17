'use client';

import React, { useState } from 'react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Bell,
    CheckCircle2,
    ChevronDown,
    Cloud,
    Database,
    Flame,
    Globe,
    KeyRound,
    Layers,
    Lock,
    MailCheck,
    Network,
    RefreshCw,
    Server,
    ShieldCheck,
    TrendingUp,
    WifiOff,
    XCircle,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';

// ─── Types ───────────────────────────────────────────────────────────────────

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
    {
        id: 'admin-api',
        category: 'application',
        name: 'Admin API',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 99.97, '30d': 99.91 },
        status: 'operational',
    },
    {
        id: 'admin-ui',
        category: 'application',
        name: 'Admin UI',
        exposure: 'External',
        uptime: { '24h': 100, '7d': 99.99, '30d': 99.95 },
        status: 'operational',
    },
    {
        id: 'dsm',
        category: 'application',
        name: 'Dynamic Subscription Manager',
        exposure: 'Internal',
        uptime: { '24h': 98.6, '7d': 97.82, '30d': 98.44 },
        status: 'degraded',
    },
    {
        id: 'healthfirst',
        category: 'application',
        name: 'Healthfirst',
        exposure: 'External',
        uptime: { '24h': 100, '7d': 100, '30d': 99.78 },
        status: 'operational',
    },
    {
        id: 'insights',
        category: 'application',
        name: 'Insights',
        exposure: 'External',
        uptime: { '24h': 100, '7d': 99.84, '30d': 99.62 },
        status: 'operational',
    },
    {
        id: 'voice-workflow',
        category: 'application',
        name: 'Voice Workflow Engine',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 99.72, '30d': 99.48 },
        status: 'operational',
    },
    {
        id: 'workflow-engine',
        category: 'application',
        name: 'Workflow Engine',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 100, '30d': 99.93 },
        status: 'operational',
    },
    {
        id: 'workflow-triggers',
        category: 'application',
        name: 'Workflow Triggers',
        exposure: 'Internal',
        uptime: { '24h': 99.1, '7d': 99.55, '30d': 99.17 },
        status: 'degraded',
    },
    {
        id: 'idp-login',
        category: 'identity',
        name: 'IDP Login',
        exposure: 'External',
        uptime: { '24h': 100, '7d': 99.99, '30d': 99.96 },
        status: 'operational',
    },
    {
        id: 'idp-management',
        category: 'identity',
        name: 'IDP Management',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 99.95, '30d': 99.88 },
        status: 'operational',
    },
    {
        id: 'vault-api',
        category: 'security',
        name: 'Vault API',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 100, '30d': 100 },
        status: 'operational',
    },
    {
        id: 'vault-cluster',
        category: 'security',
        name: 'Vault Cluster',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 100, '30d': 99.99 },
        status: 'operational',
    },
    {
        id: 'vault-ui',
        category: 'security',
        name: 'Vault UI',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 99.94, '30d': 99.82 },
        status: 'operational',
    },
    {
        id: 'dragonfly',
        category: 'cache',
        name: 'Dragonfly',
        exposure: 'Internal',
        uptime: { '24h': 0, '7d': 71.43, '30d': 91.67 },
        status: 'outage',
    },
    {
        id: 'istio-ingress',
        category: 'networking',
        name: 'Istio Ingress',
        exposure: 'Internal',
        uptime: { '24h': 100, '7d': 99.98, '30d': 99.96 },
        status: 'operational',
    },
    {
        id: 'aws-alb',
        category: 'networking',
        name: 'AWS ALB',
        exposure: 'External',
        uptime: { '24h': 100, '7d': 100, '30d': 100 },
        status: 'operational',
    },
];

const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'inc-001',
        severity: 'critical',
        services: ['Dragonfly'],
        startTime: '2026-03-17T08:14:00Z',
        status: 'investigating',
        title: 'Dragonfly cache cluster complete outage',
        latestUpdate:
            'Cache cluster pods are in CrashLoopBackOff. We have identified a misconfigured PodDisruptionBudget following the 08:00 rolling update. Rollback is in progress. ETA for recovery: 30 min.',
    },
    {
        id: 'inc-002',
        severity: 'high',
        services: ['Dynamic Subscription Manager', 'Workflow Triggers'],
        startTime: '2026-03-17T06:45:00Z',
        status: 'identified',
        title: 'Elevated error rates on DSM & Workflow Triggers',
        latestUpdate:
            'Root cause traced to a dependency on the Dragonfly cache. Both services have fallback logic but are experiencing ~2% error rate. No data loss. Services will self-heal once cache is restored.',
    },
    {
        id: 'inc-003',
        severity: 'medium',
        services: ['Insights'],
        startTime: '2026-03-14T22:10:00Z',
        status: 'resolved',
        title: 'Insights dashboard query latency spike',
        latestUpdate:
            'Resolved. The spike was caused by a missing index on the analytics_events table. Index has been added and queries are now returning sub-200ms. Closed 2026-03-15T03:47Z.',
    },
    {
        id: 'inc-004',
        severity: 'low',
        services: ['Admin UI'],
        startTime: '2026-03-12T14:00:00Z',
        status: 'resolved',
        title: 'Admin UI login page blank screen on Safari 17',
        latestUpdate:
            'A Safari 17-specific CSS rendering issue was patched in v2.14.3. Deployed to production 2026-03-12T16:30Z. All affected users have been notified.',
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

const uptimeColor = (pct: number): string => {
    if (pct === 0) return 'text-red-400';
    if (pct < 99) return 'text-amber-400';
    if (pct < 99.9) return 'text-amber-300';
    return 'text-green-400';
};

const statusColors: Record<ServiceStatus, { bg: string; text: string; dot: string; label: string }> = {
    operational: {
        bg: 'bg-green-500/15',
        text: 'text-green-400',
        dot: 'bg-green-400',
        label: 'Operational',
    },
    degraded: {
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        label: 'Degraded',
    },
    outage: {
        bg: 'bg-red-500/15',
        text: 'text-red-400',
        dot: 'bg-red-400',
        label: 'Outage',
    },
    maintenance: {
        bg: 'bg-sky-500/15',
        text: 'text-sky-400',
        dot: 'bg-sky-400',
        label: 'Maintenance',
    },
};

const platformStatusConfig: Record<PlatformStatus, { bg: string; border: string; text: string; icon: React.ReactNode; label: string }> = {
    operational: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        icon: <CheckCircle2 size={20} className="text-green-400 shrink-0" />,
        label: 'All Systems Operational',
    },
    degraded: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        icon: <AlertTriangle size={20} className="text-amber-400 shrink-0" />,
        label: 'Partial System Degradation',
    },
    outage: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: <XCircle size={20} className="text-red-400 shrink-0" />,
        label: 'Major Outage',
    },
};

const severityConfig: Record<IncidentSeverity, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
    critical: {
        icon: <Flame size={14} />,
        label: 'Critical',
        color: 'text-red-400',
        bg: 'bg-red-500/15',
    },
    high: {
        icon: <AlertCircle size={14} />,
        label: 'High',
        color: 'text-amber-400',
        bg: 'bg-amber-500/15',
    },
    medium: {
        icon: <AlertTriangle size={14} />,
        label: 'Medium',
        color: 'text-amber-300',
        bg: 'bg-amber-400/10',
    },
    low: {
        icon: <Activity size={14} />,
        label: 'Low',
        color: 'text-sky-400',
        bg: 'bg-sky-500/15',
    },
};

const incidentStatusConfig: Record<IncidentStatus, { label: string; color: string }> = {
    investigating: { label: 'Investigating', color: 'text-red-400' },
    identified: { label: 'Identified', color: 'text-amber-400' },
    monitoring: { label: 'Monitoring', color: 'text-sky-400' },
    resolved: { label: 'Resolved', color: 'text-green-400' },
};

const categoryIcons: Record<Service['category'], React.ReactNode> = {
    application: <Layers size={14} />,
    identity: <KeyRound size={14} />,
    security: <Lock size={14} />,
    networking: <Network size={14} />,
    cache: <Zap size={14} />,
    infrastructure: <Server size={14} />,
};

const categoryLabels: Record<Service['category'], string> = {
    application: 'Application',
    identity: 'Identity',
    security: 'Security',
    networking: 'Networking',
    cache: 'Cache',
    infrastructure: 'Infrastructure',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusChip = ({ status }: { status: ServiceStatus }) => {
    const c = statusColors[status];
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
            {c.label}
        </span>
    );
};

const ServiceCard = ({ service, timeframe }: { service: Service; timeframe: Timeframe }) => {
    const pct = service.uptime[timeframe];
    return (
        <div className="flex flex-col gap-2 bg-gray-800/60 border border-gray-700/60 rounded-lg p-3 hover:bg-gray-800/90 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-medium text-gray-100 leading-snug truncate">{service.name}</span>
                    <div className="flex items-center gap-1 text-gray-500">
                        {categoryIcons[service.category]}
                        <span className="text-xs">{categoryLabels[service.category]}</span>
                    </div>
                </div>
                <StatusChip status={service.status} />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-700/40">
                <span
                    className={cn(
                        'text-xs px-1.5 py-0.5 rounded font-medium',
                        service.exposure === 'External'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-gray-700/60 text-gray-400'
                    )}
                >
                    {service.exposure}
                </span>
                <div className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-gray-500" />
                    <span className={cn('text-xs font-semibold tabular-nums', uptimeColor(pct))}>
                        {pct === 100 ? '100%' : `${pct.toFixed(2)}%`}
                    </span>
                </div>
            </div>
        </div>
    );
};

const IncidentRow = ({ incident }: { incident: Incident }) => {
    const sev = severityConfig[incident.severity];
    const stat = incidentStatusConfig[incident.status];

    return (
        <div className="flex flex-col gap-3 bg-gray-800/60 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 mt-0.5', sev.bg, sev.color)}>
                    {sev.icon}
                    {sev.label}
                </span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 leading-snug">{incident.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className={cn('text-xs font-medium', stat.color)}>{stat.label}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-500 text-xs">{formatTimestamp(incident.startTime)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {incident.services.map(svc => (
                    <span key={svc} className="text-xs bg-gray-700/70 text-gray-300 px-2 py-0.5 rounded">
                        {svc}
                    </span>
                ))}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-gray-600 pl-3">
                {incident.latestUpdate}
            </p>
        </div>
    );
};

// ─── Uptime Tab ───────────────────────────────────────────────────────────────

const UptimeTab = () => {
    const [timeframe, setTimeframe] = useState<Timeframe>('24h');
    const ps = platformStatusConfig[PLATFORM_STATUS.status];

    const TIMEFRAMES: Timeframe[] = ['24h', '7d', '30d'];

    return (
        <div className="flex flex-col gap-5">
            {/* Platform status banner */}
            <div className={cn('flex items-start gap-3 rounded-lg border p-4', ps.bg, ps.border)}>
                {ps.icon}
                <div className="flex flex-col gap-0.5">
                    <p className={cn('text-sm font-semibold', ps.text)}>{ps.label}</p>
                    <p className="text-xs text-gray-400">{PLATFORM_STATUS.description}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Last updated: {formatTimestamp(PLATFORM_STATUS.timestamp)}</p>
                </div>
            </div>

            {/* Timeframe pills */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-1">Show uptime for:</span>
                {TIMEFRAMES.map(tf => (
                    <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
                            timeframe === tf
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                        )}
                    >
                        {tf}
                    </button>
                ))}
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

const IncidentsTab = () => {
    const [filter, setFilter] = useState<IncidentFilter>('all');
    const FILTERS: { value: IncidentFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'investigating', label: 'Investigating' },
        { value: 'identified', label: 'Identified' },
        { value: 'monitoring', label: 'Monitoring' },
        { value: 'resolved', label: 'Resolved' },
    ];

    const filtered = MOCK_INCIDENTS.filter(i => filter === 'all' || i.status === filter);

    return (
        <div className="flex flex-col gap-5">
            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border',
                            filter === f.value
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                        )}
                    >
                        {f.label}
                        {f.value !== 'all' && (
                            <span className="ml-1.5 text-gray-500">
                                ({MOCK_INCIDENTS.filter(i => i.status === f.value).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Incident list */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-300">No incidents found</p>
                    <p className="text-xs text-gray-500">No incidents match the selected filter.</p>
                </div>
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
    const [email] = useState('mock@example.com');

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
        <div className="flex flex-col gap-3 border-t border-gray-700/50 pt-4 mt-2">
            <div className="flex items-center gap-2 mb-1">
                <Bell size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Email Digest</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Receive status digests at</span>
                <span className="text-xs font-medium text-blue-400">{email}</span>
                <span className="text-xs text-gray-500">—</span>
                {OPTIONS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => toggle(key)}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                            prefs[key]
                                ? 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                                : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-400'
                        )}
                    >
                        {prefs[key] && <CheckCircle2 size={11} className="text-blue-400" />}
                        {label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saved}
                    className={cn(
                        'ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer',
                        saved
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    )}
                >
                    {saved ? (
                        <>
                            <MailCheck size={12} />
                            Saved
                        </>
                    ) : (
                        'Save preferences'
                    )}
                </button>
            </div>
        </div>
    );
};

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="flex flex-col items-center gap-4 py-16">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <WifiOff size={22} className="text-red-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-semibold text-gray-200">Status endpoint unavailable</p>
            <p className="text-xs text-gray-500 text-center max-w-sm">
                We could not reach the KAYA status service. This may be a transient network issue.
            </p>
        </div>
        <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
        >
            <RefreshCw size={14} />
            Retry
        </button>
    </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

type Tab = 'uptime' | 'incidents';

interface KayaStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const KayaStatusModal = ({ open, onOpenChange }: KayaStatusModalProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('uptime');
    const [hasError] = useState(false);

    const openIncidentCount = MOCK_INCIDENTS.filter(
        i => i.status !== 'resolved'
    ).length;

    const TABS: { id: Tab; label: string; badge?: number }[] = [
        { id: 'uptime', label: 'Uptime' },
        { id: 'incidents', label: 'Incidents', badge: openIncidentCount || undefined },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'max-w-[unset] w-[min(95vw,960px)] max-h-[90vh] overflow-hidden',
                    'bg-gray-900 border border-gray-700/80 text-gray-100 p-0',
                    'flex flex-col'
                )}
                overlayClassname="bg-black/70 backdrop-blur-sm"
            >
                {/* Header */}
                <DialogHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-700/60">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
                                <Cloud size={15} className="text-blue-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-semibold text-gray-100">KAYA Platform Status</DialogTitle>
                                <p className="text-xs text-gray-500 mt-0.5">Infrastructure &amp; service health — super admin view</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs font-medium text-green-400">Live</span>
                            </div>
                        </div>
                    </div>
                    {/* Tab pills */}
                    <div className="flex gap-1 mt-4">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                                    activeTab === tab.id
                                        ? 'bg-gray-700 text-gray-100'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                                )}
                            >
                                {tab.label}
                                {tab.badge !== undefined && (
                                    <span className="bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent">
                    {hasError ? (
                        <ErrorState onRetry={() => {}} />
                    ) : activeTab === 'uptime' ? (
                        <UptimeTab />
                    ) : (
                        <IncidentsTab />
                    )}
                </div>

                {/* Subscription footer */}
                <div className="shrink-0 px-6 pb-5">
                    <SubscriptionPanel />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default KayaStatusModal;
