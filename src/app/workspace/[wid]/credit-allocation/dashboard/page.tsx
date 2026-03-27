'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Layers, Activity, AlertCircle, Zap, ChevronDown, ChevronRight, Info } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

// Mock data for the consumption trend chart - By CEED Layer
const consumptionTrendByCEED = [
    { day: 'Mon', Capability: 2000, Data: 1500, Entity: 3000, Execution: 1000 },
    { day: 'Tue', Capability: 3000, Data: 2000, Entity: 4000, Execution: 1500 },
    { day: 'Wed', Capability: 5000, Data: 3500, Entity: 5000, Execution: 2500 },
    { day: 'Thu', Capability: 4000, Data: 3000, Entity: 4500, Execution: 2000 },
    { day: 'Fri', Capability: 3500, Data: 2500, Entity: 4000, Execution: 1800 },
    { day: 'Sat', Capability: 3000, Data: 2200, Entity: 3500, Execution: 1500 },
    { day: 'Sun', Capability: 2800, Data: 2000, Entity: 3200, Execution: 1400 },
];

// Mock data for the consumption trend chart - By Workflow
const consumptionTrendByWorkflow = [
    { day: 'Mon', 'Invoice Processing': 3000, 'Expense Approval': 2500, 'Audit Compliance': 2000 },
    { day: 'Tue', 'Invoice Processing': 3500, 'Expense Approval': 3200, 'Audit Compliance': 3000 },
    { day: 'Wed', 'Invoice Processing': 4000, 'Expense Approval': 4500, 'Audit Compliance': 5000 },
    { day: 'Thu', 'Invoice Processing': 2780, 'Expense Approval': 3908, 'Audit Compliance': 2000 },
    { day: 'Fri', 'Invoice Processing': 2500, 'Expense Approval': 3000, 'Audit Compliance': 2200 },
    { day: 'Sat', 'Invoice Processing': 2800, 'Expense Approval': 3200, 'Audit Compliance': 2500 },
    { day: 'Sun', 'Invoice Processing': 3200, 'Expense Approval': 3800, 'Audit Compliance': 3000 },
];

// Mock data for recent executions
const recentExecutions = [
    {
        id: '1',
        timestamp: 'Today, 10:42 AM',
        workflow: 'Invoice Processing',
        status: 'Completed',
        totalCost: 12,
        ceedProfile: { Entity: 4, Capability: 3, Execution: 3, DataFlow: 2 },
    },
    {
        id: '2',
        timestamp: 'Today, 09:15 AM',
        workflow: 'Expense Approval',
        status: 'Completed',
        totalCost: 8,
        ceedProfile: { Entity: 2, Capability: 2, Execution: 2, DataFlow: 2 },
    },
    {
        id: '3',
        timestamp: 'Yesterday, 04:30 PM',
        workflow: 'Payroll Sync',
        status: 'Failed',
        totalCost: 5,
        ceedProfile: { Entity: 2, Capability: 1, Execution: 1, DataFlow: 1 },
    },
];

// Metric Card Component
const MetricCard = ({
    title,
    value,
    footer,
    icon: Icon,
    iconBgColor,
    iconColor,
    valueColor = 'text-gray-900 dark:text-gray-100',
    footerColor = 'text-gray-500 dark:text-gray-400',
}: {
    title: string;
    value: string;
    footer: string;
    icon: React.ElementType;
    iconBgColor: string;
    iconColor: string;
    valueColor?: string;
    footerColor?: string;
}) => (
    <Card className="flex-1 min-w-[200px]">
        <CardContent className="p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
                        <Info size={14} className="text-gray-400" />
                    </div>
                    <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                    <p className={`text-xs mt-1 ${footerColor}`}>{footer}</p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconBgColor}`}>
                    <Icon size={24} className={iconColor} />
                </div>
            </div>
        </CardContent>
    </Card>
);

// Segmented Toggle Component
const SegmentedToggle = ({
    options,
    activeOption,
    onToggle,
}: {
    options: string[];
    activeOption: string;
    onToggle: (option: string) => void;
}) => (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {options.map((option) => (
            <button
                key={option}
                onClick={() => onToggle(option)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeOption === option
                        ? 'bg-white dark:bg-gray-700 shadow-sm border border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
                {option}
            </button>
        ))}
    </div>
);

// CEED Deduction Bar Component
const CEEDDeductionBar = ({ profile }: { profile: { Entity: number; Capability: number; Execution: number; DataFlow: number } }) => {
    const total = profile.Entity + profile.Capability + profile.Execution + profile.DataFlow;
    const segments = [
        { key: 'Entity', value: profile.Entity, color: 'bg-blue-500', textColor: 'text-blue-600' },
        { key: 'Capability', value: profile.Capability, color: 'bg-teal-500', textColor: 'text-teal-600' },
        { key: 'Execution', value: profile.Execution, color: 'bg-green-500', textColor: 'text-green-600' },
        { key: 'Data Flow', value: profile.DataFlow, color: 'bg-purple-500', textColor: 'text-purple-600' },
    ];

    return (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">CEED Deduction Profile</span>
                <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Cost Engine Run</span>
            </div>
            <div className="flex h-8 rounded-md overflow-hidden">
                {segments.map((segment) => (
                    <div
                        key={segment.key}
                        className={`${segment.color} flex items-center justify-center text-white text-sm font-semibold`}
                        style={{ width: `${(segment.value / total) * 100}%` }}
                    >
                        {segment.value}
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                {segments.map((segment) => (
                    <div
                        key={segment.key}
                        className="text-center"
                        style={{ width: `${(segment.value / total) * 100}%` }}
                    >
                        <span className={`text-xs font-medium ${segment.textColor}`}>
                            {segment.key} ({Math.round((segment.value / total) * 100)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Execution Row Component
const ExecutionRow = ({
    execution,
    isExpanded,
    onToggle,
}: {
    execution: typeof recentExecutions[0];
    isExpanded: boolean;
    onToggle: () => void;
}) => (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <div
            className="grid grid-cols-[40px_1fr_1fr_120px_120px] items-center py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            onClick={onToggle}
        >
            <div className="flex items-center justify-center">
                {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400" />
                ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                )}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">{execution.timestamp}</div>
            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{execution.workflow}</div>
            <div>
                <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        execution.status === 'Completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                >
                    {execution.status}
                </span>
            </div>
            <div className="text-right text-sm font-bold text-purple-600">{execution.totalCost}</div>
        </div>
        {isExpanded && <CEEDDeductionBar profile={execution.ceedProfile} />}
    </div>
);

// Custom Legend Component for CEED Layer
const CEEDLegend = () => (
    <div className="flex justify-center gap-6 mt-4">
        {[
            { name: 'Capability', color: '#14b8a6' },
            { name: 'Data', color: '#22c55e' },
            { name: 'Entity', color: '#3b82f6' },
            { name: 'Execution', color: '#8b5cf6' },
        ].map((item) => (
            <div key={item.name} className="flex items-center gap-2">
                <svg width="24" height="12" className="flex-shrink-0">
                    <circle cx="6" cy="6" r="4" fill={item.color} />
                    <line x1="10" y1="6" x2="24" y2="6" stroke={item.color} strokeWidth="2" />
                </svg>
                <span className="text-xs" style={{ color: item.color }}>{item.name}</span>
            </div>
        ))}
    </div>
);

// Custom Legend Component for Workflow
const WorkflowLegend = () => (
    <div className="flex justify-center gap-6 mt-4">
        {[
            { name: 'Audit Compliance', color: '#22c55e' },
            { name: 'Expense Approval', color: '#3b82f6' },
            { name: 'Invoice Processing', color: '#8b5cf6' },
        ].map((item) => (
            <div key={item.name} className="flex items-center gap-2">
                <svg width="24" height="12" className="flex-shrink-0">
                    <circle cx="6" cy="6" r="4" fill={item.color} />
                    <line x1="10" y1="6" x2="24" y2="6" stroke={item.color} strokeWidth="2" />
                </svg>
                <span className="text-xs" style={{ color: item.color }}>{item.name}</span>
            </div>
        ))}
    </div>
);

// Custom Tooltip for Workflow view
const WorkflowTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        const workflowColors: Record<string, string> = {
            'Audit Compliance': '#22c55e',
            'Expense Approval': '#3b82f6',
            'Invoice Processing': '#8b5cf6',
        };
        
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                {payload.slice().reverse().map((entry, index) => (
                    <p key={index} className="text-sm font-medium" style={{ color: workflowColors[entry.name] || entry.color }}>
                        {entry.name} : {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function WorkspaceDashboardPage() {
    const [chartView, setChartView] = useState('By CEED Layer');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['1']));

    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Workspace Dashboard</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Budget Period: Jan 1, 2026 - Jan 31, 2026
                </span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Workspace Budget"
                    value="500,000"
                    footer="Available: 175,000"
                    icon={Layers}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                    iconColor="text-purple-600 dark:text-purple-400"
                />
                <MetricCard
                    title="Consumed Credits"
                    value="325,000"
                    footer="65% of budget utilized"
                    icon={Activity}
                    iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <MetricCard
                    title="Critical Alerts"
                    value="3"
                    footer="iFlows >90% utilization"
                    icon={AlertCircle}
                    iconBgColor="bg-red-100 dark:bg-red-900/30"
                    iconColor="text-red-600 dark:text-red-400"
                    valueColor="text-red-600 dark:text-red-400"
                />
                <MetricCard
                    title="Remaining Credits"
                    value="175,000"
                    footer="Available for allocation"
                    icon={Zap}
                    iconBgColor="bg-teal-100 dark:bg-teal-900/30"
                    iconColor="text-teal-600 dark:text-teal-400"
                />
            </div>

            {/* Consumption Trend Chart */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg font-semibold">Consumption Trend</CardTitle>
                        <CardDescription className="text-sm text-gray-500">
                            Daily credit consumption breakdown.
                        </CardDescription>
                    </div>
                    <SegmentedToggle
                        options={['By CEED Layer', 'By Workflow']}
                        activeOption={chartView}
                        onToggle={setChartView}
                    />
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartView === 'By CEED Layer' ? (
                                <AreaChart
                                    data={consumptionTrendByCEED}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorCapability" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorEntity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorExecution" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => value.toLocaleString()}
                                        domain={[0, 16000]}
                                        ticks={[0, 4000, 8000, 12000, 16000]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Execution"
                                        stackId="1"
                                        stroke="#8b5cf6"
                                        fill="url(#colorExecution)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Entity"
                                        stackId="1"
                                        stroke="#3b82f6"
                                        fill="url(#colorEntity)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Data"
                                        stackId="1"
                                        stroke="#22c55e"
                                        fill="url(#colorData)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Capability"
                                        stackId="1"
                                        stroke="#14b8a6"
                                        fill="url(#colorCapability)"
                                    />
                                </AreaChart>
                            ) : (
                                <AreaChart
                                    data={consumptionTrendByWorkflow}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorInvoice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id="colorAudit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => value.toLocaleString()}
                                        domain={[0, 16000]}
                                        ticks={[0, 4000, 8000, 12000, 16000]}
                                    />
                                    <Tooltip content={<WorkflowTooltip />} cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="Invoice Processing"
                                        stackId="1"
                                        stroke="#8b5cf6"
                                        fill="url(#colorInvoice)"
                                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Expense Approval"
                                        stackId="1"
                                        stroke="#3b82f6"
                                        fill="url(#colorExpense)"
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Audit Compliance"
                                        stackId="1"
                                        stroke="#22c55e"
                                        fill="url(#colorAudit)"
                                        activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    {chartView === 'By CEED Layer' ? <CEEDLegend /> : <WorkflowLegend />}
                </CardContent>
            </Card>

            {/* Recent Executions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent Executions (iFlow Detailed)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_1fr_1fr_120px_120px] items-center py-3 px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div></div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Timestamp
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Workflow
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                            Total Cost (Credits)
                        </div>
                    </div>
                    {/* Table Rows */}
                    {recentExecutions.map((execution) => (
                        <ExecutionRow
                            key={execution.id}
                            execution={execution}
                            isExpanded={expandedRows.has(execution.id)}
                            onToggle={() => toggleRow(execution.id)}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
