'use client';

import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { mockMonitoringMetrics } from '../../mock-data';

const formatHour = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const metricCards = [
    {
        label: 'Total Requests (24h)',
        value: mockMonitoringMetrics.reduce((sum, m) => sum + m.requestCount, 0).toLocaleString(),
        icon: Activity,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        label: 'Avg Response Time',
        value: `${Math.round(mockMonitoringMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / mockMonitoringMetrics.length)}ms`,
        icon: Clock,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
];

export const MonitoringTab = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {metricCards.map(card => (
                    <div
                        key={card.label}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Request Count</h4>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={mockMonitoringMetrics}>
                            <defs>
                                <linearGradient id="requestGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B7AF7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B7AF7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="timestamp" tickFormatter={formatHour} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                                labelFormatter={formatHour}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Area type="monotone" dataKey="requestCount" stroke="#3B7AF7" fill="url(#requestGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Avg Response Time (ms)</h4>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={mockMonitoringMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="timestamp" tickFormatter={formatHour} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                                labelFormatter={formatHour}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Line type="monotone" dataKey="avgResponseTime" stroke="#F59F0A" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
