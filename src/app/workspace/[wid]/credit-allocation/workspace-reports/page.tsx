'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { BarChart2, ChevronDown, ChevronRight } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// CEED color mapping
const CEED_COLORS = {
    entity: '#3B82F6',      // Blue
    execution: '#22C55E',   // Green
    capabilities: '#14B8A6', // Teal
    dataFlow: '#8B5CF6',    // Purple
};

// Mock data for Consumption by Workflow (Horizontal Stacked Bar)
const workflowConsumptionData = [
    { name: 'Invoice Processing', entity: 25000, execution: 30000, capabilities: 15000, dataFlow: 10000 },
    { name: 'Expense Approval', entity: 20000, execution: 25000, capabilities: 12000, dataFlow: 8000 },
    { name: 'Audit Compliance', entity: 15000, execution: 18000, capabilities: 10000, dataFlow: 7000 },
    { name: 'Payroll Sync', entity: 12000, execution: 15000, capabilities: 8000, dataFlow: 5000 },
];

// Mock data for Daily Consumption Trends (Vertical Stacked Bar)
const dailyTrendsData = [
    { day: 'Mon', entity: 1200, execution: 1500, capabilities: 800, dataFlow: 500 },
    { day: 'Tue', entity: 1400, execution: 1800, capabilities: 900, dataFlow: 600 },
    { day: 'Wed', entity: 1100, execution: 1400, capabilities: 700, dataFlow: 450 },
    { day: 'Thu', entity: 1600, execution: 2000, capabilities: 1000, dataFlow: 700 },
    { day: 'Fri', entity: 1300, execution: 1600, capabilities: 850, dataFlow: 550 },
    { day: 'Sat', entity: 800, execution: 1000, capabilities: 500, dataFlow: 300 },
    { day: 'Sun', entity: 600, execution: 800, capabilities: 400, dataFlow: 250 },
];

// Mock data for Monthly Summary
const monthlySummaryData = [
    {
        id: '1',
        month: 'March 2026 (MTD)',
        entity: 50000,
        capability: 25000,
        execution: 40000,
        data: 20800,
        totalCredits: 135800,
        rawIFT: '136M',
        iftBreakdown: {
            entity: 50000000,
            capability: 25000000,
            execution: 40000000,
            data: 20800000,
        },
    },
    {
        id: '2',
        month: 'February 2026',
        entity: 48000,
        capability: 23000,
        execution: 38000,
        data: 19500,
        totalCredits: 128500,
        rawIFT: '129M',
        iftBreakdown: {
            entity: 48000000,
            capability: 23000000,
            execution: 38000000,
            data: 19500000,
        },
    },
    {
        id: '3',
        month: 'January 2026',
        entity: 45000,
        capability: 22000,
        execution: 36000,
        data: 18000,
        totalCredits: 121000,
        rawIFT: '121M',
        iftBreakdown: {
            entity: 45000000,
            capability: 22000000,
            execution: 36000000,
            data: 18000000,
        },
    },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {entry.name === 'dataFlow' ? 'Data Flow' : entry.name}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Legend component
const ChartLegend = () => (
    <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CEED_COLORS.capabilities }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Capabilities</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CEED_COLORS.dataFlow }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Data Flow</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CEED_COLORS.entity }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Entity</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CEED_COLORS.execution }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Execution</span>
        </div>
    </div>
);

export default function WorkspaceReportsPage() {
    const [activeView, setActiveView] = useState<'workflows' | 'agents'>('workflows');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Workspace Reports
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Credit consumption breakdown for <span className="font-semibold">Finance Automation</span>
                        </p>
                    </div>
                </div>

                {/* Segmented Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveView('workflows')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeView === 'workflows'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Workflows
                    </button>
                    <button
                        onClick={() => setActiveView('agents')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeView === 'agents'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Agents
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption by Workflow - Horizontal Stacked Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Consumption by Workflow (CEED Breakdown)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={workflowConsumptionData}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis 
                                        type="number" 
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                        domain={[0, 80000]}
                                    />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        width={120}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="entity" stackId="a" fill={CEED_COLORS.entity} name="entity" />
                                    <Bar dataKey="execution" stackId="a" fill={CEED_COLORS.execution} name="execution" />
                                    <Bar dataKey="capabilities" stackId="a" fill={CEED_COLORS.capabilities} name="capabilities" />
                                    <Bar dataKey="dataFlow" stackId="a" fill={CEED_COLORS.dataFlow} name="dataFlow" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <ChartLegend />
                    </CardContent>
                </Card>

                {/* Daily Consumption Trends - Vertical Stacked Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daily Consumption Trends (CEED)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dailyTrendsData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                    <YAxis 
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                        domain={[0, 6000]}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="entity" stackId="a" fill={CEED_COLORS.entity} name="entity" />
                                    <Bar dataKey="execution" stackId="a" fill={CEED_COLORS.execution} name="execution" />
                                    <Bar dataKey="capabilities" stackId="a" fill={CEED_COLORS.capabilities} name="capabilities" />
                                    <Bar dataKey="dataFlow" stackId="a" fill={CEED_COLORS.dataFlow} name="dataFlow" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <ChartLegend />
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Monthly Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Detailed Monthly Summary</CardTitle>
                    <CardDescription>Expand rows to see iFT equivalents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="w-10 py-3 px-2"></th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Month</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Entity</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Capability</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Execution</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total Credits</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Raw iFT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlySummaryData.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <tr 
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                            onClick={() => toggleRow(row.id)}
                                        >
                                            <td className="py-4 px-2">
                                                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                                    {expandedRows.has(row.id) ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {row.month}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                                {row.entity.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                                {row.capability.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                                {row.execution.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                                {row.data.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right font-bold text-purple-600 dark:text-purple-400">
                                                {row.totalCredits.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-right text-gray-500 dark:text-gray-400">
                                                {row.rawIFT}
                                            </td>
                                        </tr>
                                        {/* Expanded Row Content */}
                                        {expandedRows.has(row.id) && (
                                            <tr>
                                                <td colSpan={8} className="bg-gray-50 dark:bg-gray-800/30 p-4">
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                                Entity iFT
                                                            </p>
                                                            <p className="text-lg font-semibold" style={{ color: CEED_COLORS.entity }}>
                                                                {row.iftBreakdown.entity.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                                Capability iFT
                                                            </p>
                                                            <p className="text-lg font-semibold" style={{ color: CEED_COLORS.capabilities }}>
                                                                {row.iftBreakdown.capability.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                                Execution iFT
                                                            </p>
                                                            <p className="text-lg font-semibold" style={{ color: CEED_COLORS.execution }}>
                                                                {row.iftBreakdown.execution.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                                Data iFT
                                                            </p>
                                                            <p className="text-lg font-semibold" style={{ color: CEED_COLORS.dataFlow }}>
                                                                {row.iftBreakdown.data.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
