'use client';

import React from 'react';
import { Bot, ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { AgentStatusBadge } from './agent-status-badge';
import type { StandaloneAgent } from '../mock-data';

interface AgentCardProps {
    agent: StandaloneAgent;
    onClick: (id: string) => void;
}

export const AgentCard = ({ agent, onClick }: AgentCardProps) => {
    const frameworkLabel = agent.framework === 'pi-agents' ? 'PI Agents' : 'OpenClaw';
    const deployedDate = new Date(agent.lastDeployed).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            onClick={() => onClick(agent.id)}
            className="group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Bot className="h-5 w-5 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {agent.name}
                        </h3>
                        <Badge variant="outline" size="sm" className="mt-1 text-xs">
                            {frameworkLabel}
                        </Badge>
                    </div>
                </div>
                <AgentStatusBadge status={agent.status} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {agent.description}
            </p>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-mono">{agent.a2aEndpoint}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{deployedDate}</span>
                    </div>
                    <span className="font-mono">v{agent.version}</span>
                </div>
            </div>
        </div>
    );
};
