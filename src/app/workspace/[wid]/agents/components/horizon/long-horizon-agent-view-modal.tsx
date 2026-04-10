'use client';

import React, { useState } from 'react';
import { Eye, Activity, Fingerprint, Info, Clock, Calendar, Server, Play, Square, AlertTriangle, Search, Download, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/atoms/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';
import { AgentCategory, IHorizonConfig, IPublishStatus } from '@/models';

// Agent data for viewing
export interface LongHorizonAgentViewData {
    id: string;
    agentName: string;
    agentDescription: string;
    llmId?: string;
    agentCategory: AgentCategory;
    publishStatus?: IPublishStatus;
    horizonConfig?: IHorizonConfig;
}

interface LongHorizonAgentViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent: LongHorizonAgentViewData | null;
}

// Mock log data for monitoring
interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    source: string;
    taskId?: string;
}

const generateMockLogs = (): LogEntry[] => {
    const now = new Date();
    const logs: LogEntry[] = [];
    const sources = ['agent-runtime', 'task-executor', 'a2a-handler', 'skill-processor', 'memory-manager'];
    const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug'];
    const messages = [
        { level: 'info', msg: 'Agent initialized successfully' },
        { level: 'info', msg: 'Task received from A2A endpoint' },
        { level: 'info', msg: 'Executing skill: data_analysis' },
        { level: 'debug', msg: 'Memory checkpoint saved' },
        { level: 'info', msg: 'Task completed successfully' },
        { level: 'warn', msg: 'High memory usage detected (78%)' },
        { level: 'info', msg: 'Processing incoming request' },
        { level: 'error', msg: 'Connection timeout to external service' },
        { level: 'info', msg: 'Retry attempt 1/3 for external call' },
        { level: 'info', msg: 'External call succeeded on retry' },
        { level: 'debug', msg: 'Cache hit for embeddings lookup' },
        { level: 'info', msg: 'Streaming response initiated' },
        { level: 'info', msg: 'Webhook notification sent' },
        { level: 'warn', msg: 'Rate limit approaching (85/100 requests)' },
        { level: 'info', msg: 'Agent scaling up: 2 -> 3 instances' },
        { level: 'debug', msg: 'Health check passed' },
        { level: 'info', msg: 'New task queued for processing' },
        { level: 'error', msg: 'Skill execution failed: invalid input format' },
        { level: 'info', msg: 'Error handled gracefully, returning fallback response' },
        { level: 'info', msg: 'Session state persisted to storage' },
    ];

    // Generate 50 log entries over the last 24 hours
    for (let i = 0; i < 50; i++) {
        const hoursAgo = Math.random() * 24;
        const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        const msgData = messages[Math.floor(Math.random() * messages.length)];
        
        logs.push({
            id: `log-${i}`,
            timestamp: timestamp.toISOString(),
            level: msgData.level as LogEntry['level'],
            message: msgData.msg,
            source: sources[Math.floor(Math.random() * sources.length)],
            taskId: Math.random() > 0.5 ? `task-${Math.random().toString(36).substr(2, 9)}` : undefined,
        });
    }

    // Sort by timestamp descending (newest first)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Metrics data
interface MetricData {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const mockMetrics: MetricData[] = [
    { label: 'Total Tasks (24h)', value: '1,247', change: '+12%', trend: 'up' },
    { label: 'Avg. Response Time', value: '234ms', change: '-8%', trend: 'down' },
    { label: 'Success Rate', value: '99.2%', change: '+0.3%', trend: 'up' },
    { label: 'Active Instances', value: '3', change: '0', trend: 'neutral' },
];

// Overview Tab Component
const OverviewTab = ({ agent }: { agent: LongHorizonAgentViewData }) => {
    const config = agent.horizonConfig;
    const deploymentStatus = agent.publishStatus?.isPublished ? 'Running' : 'Stopped';
    
    // Mock data for display
    const mockData = {
        intelligenceSource: 'GPT-4 Turbo',
        version: config?.identity?.version || '1.0.0',
        deploymentDate: agent.publishStatus?.publishedAt || new Date().toISOString(),
        skills: config?.skills?.map(s => s.name) || ['Data Analysis', 'Report Generation', 'Email Drafting'],
        hostingModel: config?.deploy?.hostingModel === 'managed' ? 'Managed (KAYA Internal)' : 'External (AgentCore)',
        runtime: config?.deploy?.runtime || 'python312',
    };

    return (
        <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Info size={16} className="text-gray-500" />
                    Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Agent Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.agentName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Intelligence Source</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{mockData.intelligenceSource}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{agent.agentDescription || 'No description provided'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{mockData.version}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Deployment Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(mockData.deploymentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Agent Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {mockData.skills.map((skill, idx) => (
                        <Badge 
                            key={idx} 
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Deployment Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Server size={16} className="text-gray-500" />
                    Deployment Information
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                            <div className="flex items-center gap-2">
                                {deploymentStatus === 'Running' ? (
                                    <>
                                        <Play size={14} className="text-green-500 fill-green-500" />
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Running</span>
                                    </>
                                ) : deploymentStatus === 'Stopped' ? (
                                    <>
                                        <Square size={14} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stopped</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Error</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hosting Model</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{mockData.hostingModel}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Runtime</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{mockData.runtime}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// A2A Identity Tab Component
const A2AIdentityTab = ({ agent }: { agent: LongHorizonAgentViewData }) => {
    const config = agent.horizonConfig;
    const identity = config?.identity;
    
    // Mock A2A Identity data
    const mockA2AData = {
        displayName: identity?.displayName || agent.agentName,
        description: identity?.description || agent.agentDescription,
        version: identity?.version || '1.0.0',
        a2aUri: identity?.a2aUri || `agent://kaya/workspace/${agent.agentName.toLowerCase().replace(/\s+/g, '-')}-v1`,
        endpointUrl: identity?.endpointUrl || `https://api.kaya.ai/a2a/agents/${agent.id}`,
        discoveryLocation: identity?.discoveryLocation || `https://api.kaya.ai/.well-known/agent-card/${agent.id}`,
        a2aVisibility: identity?.a2aVisibility || 'private',
        defaultInputModes: identity?.defaultInputModes || ['text/plain', 'application/json'],
        defaultOutputModes: identity?.defaultOutputModes || ['application/json', 'text/plain'],
        authSchemes: identity?.authSchemes || [{ type: 'bearer' }],
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6 py-4">
            {/* A2A URI */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Fingerprint size={16} className="text-gray-500" />
                    A2A Identity
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">A2A URI</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-blue-600 dark:text-blue-400 flex-1 truncate">
                                {mockA2AData.a2aUri}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(mockA2AData.a2aUri)}
                                className="h-7 px-2"
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Endpoint URL</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 flex-1 truncate">
                                {mockA2AData.endpointUrl}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(mockA2AData.endpointUrl)}
                                className="h-7 px-2"
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Discovery Location</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 flex-1 truncate">
                                {mockA2AData.discoveryLocation}
                            </code>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(mockA2AData.discoveryLocation)}
                                className="h-7 px-2"
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visibility & Auth */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
                    <Badge 
                        variant="secondary"
                        className={cn(
                            mockA2AData.a2aVisibility === 'public' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}
                    >
                        {mockA2AData.a2aVisibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Authentication</p>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {mockA2AData.authSchemes[0]?.type?.toUpperCase() || 'NONE'}
                    </Badge>
                </div>
            </div>

            {/* IO Modes */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Input/Output Modes</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Input Modes</p>
                        <div className="flex flex-wrap gap-1">
                            {mockA2AData.defaultInputModes.map((mode, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {mode}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Output Modes</p>
                        <div className="flex flex-wrap gap-1">
                            {mockA2AData.defaultOutputModes.map((mode, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {mode}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Logging & Monitoring Tab Component
const LoggingMonitoringTab = ({ agent }: { agent: LongHorizonAgentViewData }) => {
    const [logs] = useState<LogEntry[]>(generateMockLogs());
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<'1h' | '6h' | '24h' | '7d' | 'custom'>('24h');
    const [levelFilter, setLevelFilter] = useState<'all' | LogEntry['level']>('all');

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              log.source.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    const getLevelBadgeClass = (level: LogEntry['level']) => {
        switch (level) {
            case 'error':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'warn':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'info':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'debug':
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-4 py-4">
            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-3">
                {mockMetrics.map((metric, idx) => (
                    <div 
                        key={idx}
                        className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{metric.value}</span>
                            {metric.change && (
                                <span className={cn(
                                    'text-xs font-medium',
                                    metric.trend === 'up' && 'text-green-600 dark:text-green-400',
                                    metric.trend === 'down' && 'text-red-600 dark:text-red-400',
                                    metric.trend === 'neutral' && 'text-gray-500'
                                )}>
                                    {metric.change}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Time Range:</span>
                    <div className="flex gap-1">
                        {(['1h', '6h', '24h', '7d'] as const).map(range => (
                            <Button
                                key={range}
                                variant={dateRange === range ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setDateRange(range)}
                            >
                                {range}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Level:</span>
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value as any)}
                        className="h-7 px-2 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                        <option value="all">All</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
                <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                    <RefreshCw size={12} />
                    <span className="text-xs">Refresh</span>
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 gap-1">
                    <Download size={12} />
                    <span className="text-xs">Export</span>
                </Button>
            </div>

            {/* Log Entries */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <div className="col-span-2">Timestamp</div>
                        <div className="col-span-1">Level</div>
                        <div className="col-span-2">Source</div>
                        <div className="col-span-7">Message</div>
                    </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                    {filteredLogs.slice(0, 30).map((log) => (
                        <div 
                            key={log.id}
                            className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                            <div className="grid grid-cols-12 gap-2 text-xs">
                                <div className="col-span-2 text-gray-500 dark:text-gray-400 font-mono">
                                    {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </div>
                                <div className="col-span-1">
                                    <Badge variant="secondary" className={cn('text-[10px] px-1.5', getLevelBadgeClass(log.level))}>
                                        {log.level.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="col-span-2 text-gray-600 dark:text-gray-400 truncate">
                                    {log.source}
                                </div>
                                <div className="col-span-7 text-gray-800 dark:text-gray-200">
                                    {log.message}
                                    {log.taskId && (
                                        <span className="ml-2 text-gray-400 dark:text-gray-500 font-mono">
                                            [{log.taskId}]
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Showing {Math.min(filteredLogs.length, 30)} of {filteredLogs.length} log entries
            </p>
        </div>
    );
};

// Main Modal Component
export const LongHorizonAgentViewModal = ({ open, onOpenChange, agent }: LongHorizonAgentViewModalProps) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!agent) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30">
                            <Eye size={20} className="text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <span className="block">{agent.agentName}</span>
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Long Horizon Agent Details</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogBody className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="overview" className="gap-1.5">
                                <Info size={14} />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="a2a-identity" className="gap-1.5">
                                <Fingerprint size={14} />
                                A2A Identity
                            </TabsTrigger>
                            <TabsTrigger value="logging" className="gap-1.5">
                                <Activity size={14} />
                                Logging & Monitoring
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-y-auto">
                            <TabsContent value="overview">
                                <OverviewTab agent={agent} />
                            </TabsContent>
                            <TabsContent value="a2a-identity">
                                <A2AIdentityTab agent={agent} />
                            </TabsContent>
                            <TabsContent value="logging">
                                <LoggingMonitoringTab agent={agent} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
};
