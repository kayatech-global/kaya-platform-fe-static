'use client';

import React from 'react';
import { Card, CardContent } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandaloneAgent, AgentStatus } from '../mock-data';
import { useRouter, useParams } from 'next/navigation';

interface StandaloneAgentCardProps {
    agent: StandaloneAgent;
}

const statusConfig: Record<AgentStatus, { label: string; dotClass: string; badgeClass: string }> = {
    running: {
        label: 'Running',
        dotClass: 'bg-green-400 animate-pulse',
        badgeClass: 'bg-green-500/15 text-green-400 border-green-500/30',
    },
    stopped: {
        label: 'Stopped',
        dotClass: 'bg-gray-400',
        badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    },
    error: {
        label: 'Error',
        dotClass: 'bg-red-400 animate-pulse',
        badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    deploying: {
        label: 'Deploying',
        dotClass: 'bg-amber-400 animate-pulse',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
};

const frameworkConfig: Record<string, { class: string }> = {
    'PI Agents': { class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    'OpenClaw': { class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

export const StandaloneAgentCard = ({ agent }: StandaloneAgentCardProps) => {
    const router = useRouter();
    const params = useParams();
    const wid = params.wid as string;
    const status = statusConfig[agent.status];
    const framework = frameworkConfig[agent.framework] ?? { class: '' };

    const handleClick = () => {
        router.push(`/workspace/${wid}/standalone-agents/${agent.id}`);
    };

    return (
        <Card
            onClick={handleClick}
            className={cn(
                'border border-border bg-card cursor-pointer group transition-all duration-200',
                'hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5'
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', status.dotClass)} />
                        <h3 className="text-sm font-semibold text-foreground truncate">{agent.name}</h3>
                    </div>
                    <ChevronRight
                        size={16}
                        className="text-muted-foreground flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {agent.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className={cn('text-xs px-2 py-0.5 border', framework.class)}>
                        {agent.framework}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs px-2 py-0.5 border', status.badgeClass)}>
                        {status.label}
                    </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>Last active: {agent.lastActive}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        <span className="text-foreground/70 font-medium">Model:</span> {agent.model}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
