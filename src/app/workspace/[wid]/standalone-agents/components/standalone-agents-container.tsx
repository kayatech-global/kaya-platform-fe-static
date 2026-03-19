'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Search,
    Plus,
    Bot,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Clock,
    Filter,
    RefreshCw,
    ChevronRight,
    Cpu,
    MemoryStick,
    Activity,
    Users,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/atoms';
import { cn } from '@/lib/utils';
import {
    MOCK_STANDALONE_AGENTS,
    StandaloneAgent,
    StandaloneAgentStatus,
    AgentFramework,
} from '../mock-data';
import { CreateAgentWizard } from './create-agent-wizard';

const StatusIcon = ({ status }: { status: StandaloneAgentStatus }) => {
    switch (status) {
        case 'running':
            return <CheckCircle2 size={14} className="text-green-500" />;
        case 'stopped':
            return <XCircle size={14} className="text-gray-400" />;
        case 'error':
            return <AlertCircle size={14} className="text-red-500" />;
        case 'deploying':
            return <Loader2 size={14} className="text-blue-500 animate-spin" />;
        case 'pending':
            return <Clock size={14} className="text-amber-500" />;
    }
};

const StatusBadge = ({ status }: { status: StandaloneAgentStatus }) => {
    const map: Record<StandaloneAgentStatus, string> = {
        running: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        stopped: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        deploying: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return (
        <span className={cn('flex items-center gap-x-1 px-2 py-0.5 rounded-full text-xs font-medium', map[status])}>
            <StatusIcon status={status} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const UsageBar = ({ value, color }: { value: number; color: string }) => (
    <div className="flex items-center gap-x-2 w-full">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
                className={cn('h-full rounded-full transition-all', color)}
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{value}%</span>
    </div>
);

const AgentCard = ({ agent, wid }: { agent: StandaloneAgent; wid: string }) => (
    <Link href={`/workspace/${wid}/standalone-agents/${agent.id}`}>
        <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-y-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-x-3">
                    <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        agent.framework === 'PI Agents'
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-purple-100 dark:bg-purple-900/40'
                    )}>
                        <Bot size={20} className={agent.framework === 'PI Agents' ? 'text-blue-600' : 'text-purple-600'} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{agent.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{agent.description}</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Status + framework */}
            <div className="flex items-center justify-between">
                <StatusBadge status={agent.status} />
                <div className="flex items-center gap-x-2">
                    <span className={cn(
                        'text-xs px-2 py-0.5 rounded font-medium',
                        agent.framework === 'PI Agents'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                    )}>
                        {agent.framework}
                    </span>
                    <span className="text-xs text-gray-400">v{agent.version}</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-x-1 text-gray-500 mb-1">
                        <Activity size={10} />
                        <span>Sessions</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-100 font-semibold">
                        {agent.activeSessions} active
                    </p>
                    <p className="text-gray-400">{agent.totalSessions.toLocaleString()} total</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center gap-x-1 text-gray-500 mb-1">
                        <Clock size={10} />
                        <span>Avg Response</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-100 font-semibold">
                        {agent.avgResponseTimeMs > 0 ? `${agent.avgResponseTimeMs}ms` : '—'}
                    </p>
                    <p className={cn('text-xs', agent.errorRate > 5 ? 'text-red-500' : 'text-gray-400')}>
                        {agent.errorRate}% errors
                    </p>
                </div>
            </div>

            {/* Resource usage */}
            {agent.status === 'running' && (
                <div className="flex flex-col gap-y-1.5">
                    <div className="flex items-center gap-x-2">
                        <Cpu size={10} className="text-gray-400 flex-shrink-0" />
                        <UsageBar
                            value={agent.cpuUsage}
                            color={agent.cpuUsage > 80 ? 'bg-red-500' : agent.cpuUsage > 60 ? 'bg-amber-500' : 'bg-blue-500'}
                        />
                    </div>
                    <div className="flex items-center gap-x-2">
                        <MemoryStick size={10} className="text-gray-400 flex-shrink-0" />
                        <UsageBar
                            value={agent.memoryUsage}
                            color={agent.memoryUsage > 80 ? 'bg-red-500' : agent.memoryUsage > 60 ? 'bg-amber-500' : 'bg-green-500'}
                        />
                    </div>
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
                {agent.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                <span>{agent.cluster} / {agent.namespace}</span>
                <span>{agent.replicas} replica{agent.replicas !== 1 ? 's' : ''}</span>
            </div>
        </div>
    </Link>
);

const STATUSES: (StandaloneAgentStatus | 'all')[] = ['all', 'running', 'stopped', 'deploying', 'error'];
const FRAMEWORKS: (AgentFramework | 'all')[] = ['all', 'PI Agents', 'OpenClaw'];

export const StandaloneAgentsContainer = () => {
    const params = useParams();
    const wid = params?.wid as string ?? '';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StandaloneAgentStatus | 'all'>('all');
    const [frameworkFilter, setFrameworkFilter] = useState<AgentFramework | 'all'>('all');
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const filtered = useMemo(() => {
        return MOCK_STANDALONE_AGENTS.filter(a => {
            const matchSearch =
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.description.toLowerCase().includes(search.toLowerCase()) ||
                a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
            const matchStatus = statusFilter === 'all' || a.status === statusFilter;
            const matchFramework = frameworkFilter === 'all' || a.framework === frameworkFilter;
            return matchSearch && matchStatus && matchFramework;
        });
    }, [search, statusFilter, frameworkFilter]);

    const counts = useMemo(() => ({
        running: MOCK_STANDALONE_AGENTS.filter(a => a.status === 'running').length,
        stopped: MOCK_STANDALONE_AGENTS.filter(a => a.status === 'stopped').length,
        error: MOCK_STANDALONE_AGENTS.filter(a => a.status === 'error').length,
        deploying: MOCK_STANDALONE_AGENTS.filter(a => a.status === 'deploying').length,
        total: MOCK_STANDALONE_AGENTS.length,
    }), []);

    return (
        <div className="flex flex-col gap-y-6 pb-8">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Standalone Agents</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Deploy and manage independently running AI agents (REQ-020)
                    </p>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button variant="secondary" size="sm" leadingIcon={<RefreshCw size={14} />}>
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        leadingIcon={<Plus size={14} />}
                        onClick={() => setIsWizardOpen(true)}
                    >
                        New Agent
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Agents', value: counts.total, color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800' },
                    { label: 'Running', value: counts.running, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Stopped / Error', value: counts.stopped + counts.error, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Deploying', value: counts.deploying, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map(card => (
                    <div key={card.label} className={cn('rounded-xl p-3 flex flex-col gap-y-1', card.bg)}>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex-1 min-w-[200px] max-w-xs">
                    <Input
                        placeholder="Search agents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        leadingIcon={<Search size={14} />}
                    />
                </div>
                <div className="flex items-center gap-x-1">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mr-1">Status:</span>
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                'px-2.5 py-1 text-xs rounded-full border transition-colors capitalize',
                                statusFilter === s
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-x-1">
                    <span className="text-xs text-gray-500 mr-1">Framework:</span>
                    {FRAMEWORKS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFrameworkFilter(f)}
                            className={cn(
                                'px-2.5 py-1 text-xs rounded-full border transition-colors',
                                frameworkFilter === f
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-500">
                Showing {filtered.length} of {counts.total} agents
            </p>

            {/* Agent Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bot size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No agents found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(agent => (
                        <AgentCard key={agent.id} agent={agent} wid={wid} />
                    ))}
                </div>
            )}

            {isWizardOpen && (
                <CreateAgentWizard
                    open={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                />
            )}
        </div>
    );
};
