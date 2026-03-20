'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { AgentStatusBadge } from '../../components/agent-status-badge';
import { Play, Square, RotateCw, ExternalLink, Copy, Bot } from 'lucide-react';
import type { StandaloneAgent } from '../../mock-data';

interface OverviewTabProps {
    agent: StandaloneAgent;
}

export const OverviewTab = ({ agent }: OverviewTabProps) => {
    const frameworkLabel = agent.framework === 'kaya-agent' ? 'Kaya Agent' : 'OpenClaw';
    const deployedDate = new Date(agent.lastDeployed).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/10">
                            <Bot className="h-7 w-7 text-sky-500" />
                        </div>
                        <div>
                            <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
                        </div>
                    </div>
                    <AgentStatusBadge status={agent.status} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Framework</p>
                            <Badge variant="outline">{frameworkLabel}</Badge>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">A2A Endpoint</p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">
                                    {agent.a2aEndpoint}
                                </code>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Version</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">v{agent.version}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Intelligence Source</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                {agent.llmProvider} / {agent.llmModel}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Session Mode</p>
                            <Badge variant="info" size="sm">
                                {agent.sessionMode.replace(/-/g, ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Deployed</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{deployedDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Deployment Info</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cluster</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{agent.cluster}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CPU Limit</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{agent.cpuLimit}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Memory Limit</p>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{agent.memoryLimit}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tools</p>
                    <div className="flex flex-wrap gap-1.5">
                        {agent.tools.map(tool => (
                            <Badge key={tool} variant="secondary" size="sm">{tool}</Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="flex gap-3">
                    {agent.status === 'running' ? (
                        <Button variant="secondary" size="sm" leadingIcon={<Square className="h-4 w-4" />}>
                            Stop Agent
                        </Button>
                    ) : (
                        <Button variant="primary" size="sm" leadingIcon={<Play className="h-4 w-4" />}>
                            Start Agent
                        </Button>
                    )}
                    <Button variant="secondary" size="sm" leadingIcon={<RotateCw className="h-4 w-4" />}>
                        Redeploy
                    </Button>
                    <Button variant="ghost" size="sm" leadingIcon={<ExternalLink className="h-4 w-4" />}>
                        Open A2A Endpoint
                    </Button>
                </div>
            </div>
        </div>
    );
};
