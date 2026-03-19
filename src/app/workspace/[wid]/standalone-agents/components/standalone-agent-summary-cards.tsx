'use client';

import React from 'react';
import { Card, CardContent } from '@/components/atoms/card';
import { Bot, Play, Square, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandaloneAgent } from '../mock-data';

interface SummaryCardsProps {
    agents: StandaloneAgent[];
}

export const StandaloneAgentSummaryCards = ({ agents }: SummaryCardsProps) => {
    const total = agents.length;
    const running = agents.filter(a => a.status === 'running').length;
    const stopped = agents.filter(a => a.status === 'stopped').length;
    const errors = agents.filter(a => a.status === 'error').length;
    const deploying = agents.filter(a => a.status === 'deploying').length;

    const cards = [
        {
            label: 'Total Agents',
            value: total,
            icon: Bot,
            colorClass: 'text-blue-400',
            bgClass: 'bg-blue-500/10',
            borderClass: 'border-blue-500/20',
        },
        {
            label: 'Running',
            value: running,
            icon: Play,
            colorClass: 'text-green-400',
            bgClass: 'bg-green-500/10',
            borderClass: 'border-green-500/20',
        },
        {
            label: 'Stopped',
            value: stopped,
            icon: Square,
            colorClass: 'text-gray-400',
            bgClass: 'bg-gray-500/10',
            borderClass: 'border-gray-500/20',
        },
        {
            label: 'Errors',
            value: errors,
            icon: AlertTriangle,
            colorClass: 'text-red-400',
            bgClass: 'bg-red-500/10',
            borderClass: 'border-red-500/20',
        },
        {
            label: 'Deploying',
            value: deploying,
            icon: Loader2,
            colorClass: 'text-amber-400',
            bgClass: 'bg-amber-500/10',
            borderClass: 'border-amber-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map(card => {
                const Icon = card.icon;
                return (
                    <Card
                        key={card.label}
                        className={cn(
                            'border bg-card',
                            card.borderClass
                        )}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {card.label}
                                </span>
                                <div className={cn('p-1.5 rounded-md', card.bgClass)}>
                                    <Icon size={14} className={card.colorClass} />
                                </div>
                            </div>
                            <p className={cn('text-3xl font-bold', card.colorClass)}>{card.value}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
