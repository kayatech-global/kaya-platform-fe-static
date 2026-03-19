'use client';

import React from 'react';
import { Bot, Play, Square, AlertTriangle } from 'lucide-react';
import type { StandaloneAgent } from '../mock-data';

interface StatsBarProps {
    agents: StandaloneAgent[];
}

export const StatsBar = ({ agents }: StatsBarProps) => {
    const total = agents.length;
    const running = agents.filter(a => a.status === 'running').length;
    const stopped = agents.filter(a => a.status === 'stopped').length;
    const errors = agents.filter(a => a.status === 'error').length;

    const stats = [
        { label: 'Total Agents', value: total, icon: Bot, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Running', value: running, icon: Play, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Stopped', value: stopped, icon: Square, color: 'text-gray-400', bg: 'bg-gray-400/10' },
        { label: 'Errors', value: errors, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map(stat => (
                <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3"
                >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
