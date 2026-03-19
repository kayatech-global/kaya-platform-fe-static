'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const generateTimeData = (key: string, base: number, variance: number) =>
    Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        [key]: Math.max(0, Math.round(base + (Math.random() - 0.5) * variance)),
    }));

const requestData = generateTimeData('requests', 42, 30);
const latencyData = generateTimeData('latency', 320, 200);
const errorData = generateTimeData('errors', 1.2, 2);
const cpuData = generateTimeData('cpu', 35, 25);
const memoryData = generateTimeData('memory', 55, 20);

const CHART_CONFIG = {
    grid: { stroke: 'rgba(255,255,255,0.04)' },
    axis: { tick: { fontSize: 10, fill: '#6b7280' } },
    tooltip: {
        contentStyle: {
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 6,
            fontSize: 11,
        },
        labelStyle: { color: '#9ca3af' },
    },
};

interface MetricCardProps {
    title: string;
    value: string;
    delta?: string;
    deltaPositive?: boolean;
    children: React.ReactNode;
}

const MetricCard = ({ title, value, delta, deltaPositive, children }: MetricCardProps) => (
    <Card className="border-border">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
                {delta && (
                    <span className={`text-[10px] font-medium ${deltaPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {delta}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
            <ResponsiveContainer width="100%" height={80}>
                {children as React.ReactElement}
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

export const MonitoringTab = () => {
    return (
        <div className="flex flex-col gap-6">
            <p className="text-xs text-muted-foreground">Showing metrics for the last 24 hours. Data refreshes every 30 seconds.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard title="Request Rate" value="847 req/hr" delta="+12% vs yesterday" deltaPositive>
                    <BarChart data={requestData} barSize={4}>
                        <CartesianGrid vertical={false} stroke={CHART_CONFIG.grid.stroke} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip {...CHART_CONFIG.tooltip} />
                        <Bar dataKey="requests" fill="#3b7af7" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </MetricCard>

                <MetricCard title="P95 Latency" value="412ms" delta="+8ms vs yesterday" deltaPositive={false}>
                    <LineChart data={latencyData}>
                        <CartesianGrid stroke={CHART_CONFIG.grid.stroke} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip {...CHART_CONFIG.tooltip} />
                        <Line type="monotone" dataKey="latency" stroke="#f59f0a" strokeWidth={1.5} dot={false} />
                    </LineChart>
                </MetricCard>

                <MetricCard title="Error Rate" value="0.8%" delta="-0.2% vs yesterday" deltaPositive>
                    <AreaChart data={errorData}>
                        <CartesianGrid stroke={CHART_CONFIG.grid.stroke} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip {...CHART_CONFIG.tooltip} />
                        <Area type="monotone" dataKey="errors" stroke="#ef4343" fill="rgba(239,67,67,0.15)" strokeWidth={1.5} />
                    </AreaChart>
                </MetricCard>

                <MetricCard title="CPU Usage" value="38%" delta="stable" deltaPositive>
                    <AreaChart data={cpuData}>
                        <CartesianGrid stroke={CHART_CONFIG.grid.stroke} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip {...CHART_CONFIG.tooltip} />
                        <Area type="monotone" dataKey="cpu" stroke="#21c45d" fill="rgba(33,196,93,0.15)" strokeWidth={1.5} />
                    </AreaChart>
                </MetricCard>

                <MetricCard title="Memory Usage" value="61%" delta="+3% vs yesterday" deltaPositive={false}>
                    <AreaChart data={memoryData}>
                        <CartesianGrid stroke={CHART_CONFIG.grid.stroke} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip {...CHART_CONFIG.tooltip} />
                        <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="rgba(168,85,247,0.15)" strokeWidth={1.5} />
                    </AreaChart>
                </MetricCard>
            </div>

            {/* Full width request chart */}
            <Card className="border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Request Volume — Last 24h</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={requestData}>
                            <CartesianGrid stroke={CHART_CONFIG.grid.stroke} />
                            <XAxis dataKey="time" {...CHART_CONFIG.axis} />
                            <YAxis {...CHART_CONFIG.axis} />
                            <Tooltip {...CHART_CONFIG.tooltip} />
                            <Area
                                type="monotone"
                                dataKey="requests"
                                stroke="#3b7af7"
                                fill="rgba(59,122,247,0.15)"
                                strokeWidth={1.5}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
