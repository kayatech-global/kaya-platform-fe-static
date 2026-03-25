'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Server,
    Cloud,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    XCircle,
    AlertCircle,
    Clock,
    Cpu,
    Timer,
    MapPin,
    Shield,
    Activity,
    Workflow,
    Tag,
    Variable,
    ExternalLink,
    TrendingUp,
    BarChart3,
    Zap,
} from 'lucide-react';
import { Button } from '@/components';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { cn } from '@/lib/utils';
import { mockExecutionRuntimes, mockLinkedWorkflows } from '@/mocks/execution-runtimes-data';

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        active: {
            label: 'Active',
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
            icon: <CheckCircle2 size={14} />,
        },
        provisioning: {
            label: 'Provisioning',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            icon: <Loader2 size={14} className="animate-spin" />,
        },
        error: {
            label: 'Error',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            icon: <XCircle size={14} />,
        },
        inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
            icon: <AlertCircle size={14} />,
        },
    };

    const { label, className, icon } = config[status] || config['inactive'];

    return (
        <Badge variant="outline" className={cn('gap-1.5 font-medium text-sm px-3 py-1', className)}>
            {icon}
            {label}
        </Badge>
    );
};

const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
}) => (
    <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">{icon}</div>
            </div>
        </CardContent>
    </Card>
);

const InfoRow = ({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) => (
    <div className="flex items-start py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="flex items-center gap-2 w-48 flex-shrink-0">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        </div>
        <div className="text-sm text-gray-900 dark:text-gray-100 flex-1">{value}</div>
    </div>
);

export const RuntimeDetailContainer = () => {
    const params = useParams();
    const router = useRouter();
    const runtimeId = params.runtimeId as string;

    const runtime = mockExecutionRuntimes.find((r) => r.id === runtimeId);

    if (!runtime) {
        return (
            <div className="metric-page pb-4">
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle size={48} className="text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Runtime configuration not found</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push(`/workspace/${params.wid}/execution-runtimes`)}
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Runtimes
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="metric-page pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/workspace/${params.wid}/execution-runtimes`)}
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{runtime.name}</h1>
                            <StatusBadge status={runtime.status} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{runtime.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                        Edit Configuration
                    </Button>
                    {runtime.provider === 'aws-agentcore' && runtime.status === 'error' && (
                        <Button size="sm">Retry Provisioning</Button>
                    )}
                </div>
            </div>

            {/* Metrics Cards */}
            {runtime.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        title="Total Executions"
                        value={runtime.metrics.totalExecutions.toLocaleString()}
                        subtitle="All time"
                        icon={<BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />}
                    />
                    <MetricCard
                        title="Success Rate"
                        value={runtime.metrics.successRate > 0 ? `${runtime.metrics.successRate}%` : '-'}
                        subtitle="Last 30 days"
                        icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}
                    />
                    <MetricCard
                        title="Avg Execution Time"
                        value={runtime.metrics.avgExecutionTime > 0 ? `${runtime.metrics.avgExecutionTime}ms` : '-'}
                        subtitle="Last 30 days"
                        icon={<Zap size={20} className="text-amber-600 dark:text-amber-400" />}
                    />
                    <MetricCard
                        title="Linked Workflows"
                        value={runtime.linkedWorkflows}
                        subtitle="Currently assigned"
                        icon={<Workflow size={20} className="text-purple-600 dark:text-purple-400" />}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Configuration Details</CardTitle>
                            <CardDescription>Runtime provider and resource configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <InfoRow
                                label="Provider"
                                icon={runtime.provider === 'kaya-runtime' ? <Server size={14} /> : <Cloud size={14} />}
                                value={
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'gap-1 font-medium text-xs',
                                            runtime.provider === 'kaya-runtime'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                        )}
                                    >
                                        {runtime.provider === 'kaya-runtime' ? 'Kaya Runtime' : 'AWS Bedrock AgentCore'}
                                    </Badge>
                                }
                            />
                            {runtime.region && (
                                <InfoRow label="Region" icon={<MapPin size={14} />} value={runtime.region} />
                            )}
                            {runtime.iamRole && (
                                <InfoRow label="IAM Role" icon={<Shield size={14} />} value={<code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{runtime.iamRole}</code>} />
                            )}
                            {runtime.memory && (
                                <InfoRow label="Memory" icon={<Cpu size={14} />} value={`${runtime.memory} MB`} />
                            )}
                            {runtime.timeout && (
                                <InfoRow
                                    label="Timeout"
                                    icon={<Timer size={14} />}
                                    value={runtime.timeout >= 60 ? `${runtime.timeout / 60} minute(s)` : `${runtime.timeout} seconds`}
                                />
                            )}
                            <InfoRow
                                label="Created"
                                icon={<Clock size={14} />}
                                value={formatDate(runtime.createdAt)}
                            />
                            <InfoRow
                                label="Last Updated"
                                icon={<Clock size={14} />}
                                value={formatDate(runtime.updatedAt)}
                            />
                            {runtime.providerConfig?.runtimeArn && (
                                <InfoRow
                                    label="Runtime ARN"
                                    icon={<ExternalLink size={14} />}
                                    value={<code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">{runtime.providerConfig.runtimeArn}</code>}
                                />
                            )}
                            {runtime.providerConfig?.agentCoreEndpoint && (
                                <InfoRow
                                    label="Endpoint"
                                    icon={<Activity size={14} />}
                                    value={<code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all">{runtime.providerConfig.agentCoreEndpoint}</code>}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Linked Workflows */}
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Linked Workflows</CardTitle>
                            <CardDescription>Workflows currently using this runtime configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {runtime.linkedWorkflows > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {mockLinkedWorkflows.slice(0, runtime.linkedWorkflows).map((wf) => (
                                        <div key={wf.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                                                    <Workflow size={14} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{wf.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {wf.version} &middot; Last run: {formatDate(wf.lastExecuted)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-xs',
                                                    wf.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                )}
                                            >
                                                {wf.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Workflow size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No workflows linked yet</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Assign this runtime to a workflow from the Workflow Builder
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Environment Variables */}
                    {runtime.environmentVariables && runtime.environmentVariables.length > 0 && (
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Variable size={16} />
                                    Environment Variables
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {runtime.environmentVariables.map((env, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                            <code className="text-xs font-medium text-gray-700 dark:text-gray-300">{env.name}</code>
                                            <code className="text-xs text-gray-500 dark:text-gray-400">{env.value}</code>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tags */}
                    {runtime.tags && runtime.tags.length > 0 && (
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Tag size={16} />
                                    Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-2">
                                    {runtime.tags.map((tag, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                        >
                                            {tag.key}: {tag.value}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Provisioning Status (for non-Kaya runtimes) */}
                    {runtime.provider !== 'kaya-runtime' && (
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Activity size={16} />
                                    Provisioning Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {[
                                        {
                                            step: 'IAM Role Validation',
                                            status: runtime.status === 'error' ? 'error' : 'complete',
                                        },
                                        {
                                            step: 'AgentCore Runtime Creation',
                                            status: runtime.status === 'provisioning' ? 'in-progress' : runtime.status === 'error' ? 'error' : 'complete',
                                        },
                                        {
                                            step: 'Network Configuration',
                                            status: runtime.status === 'provisioning' ? 'pending' : runtime.status === 'error' ? 'pending' : 'complete',
                                        },
                                        {
                                            step: 'Health Check Verification',
                                            status: runtime.status === 'active' ? 'complete' : 'pending',
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            {item.status === 'complete' && (
                                                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                            )}
                                            {item.status === 'in-progress' && (
                                                <Loader2 size={16} className="text-amber-500 animate-spin flex-shrink-0" />
                                            )}
                                            {item.status === 'error' && (
                                                <XCircle size={16} className="text-red-500 flex-shrink-0" />
                                            )}
                                            {item.status === 'pending' && (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                            )}
                                            <span
                                                className={cn(
                                                    'text-sm',
                                                    item.status === 'complete'
                                                        ? 'text-gray-700 dark:text-gray-300'
                                                        : item.status === 'error'
                                                          ? 'text-red-600 dark:text-red-400'
                                                          : 'text-gray-500 dark:text-gray-400'
                                                )}
                                            >
                                                {item.step}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Last Execution Info */}
                    {runtime.metrics && runtime.metrics.lastExecutedAt && (
                        <Card className="border border-gray-200 dark:border-gray-700">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Clock size={16} />
                                    Last Execution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {runtime.metrics.lastExecutedAt
                                        ? formatDate(runtime.metrics.lastExecutedAt)
                                        : 'No executions yet'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
