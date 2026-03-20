'use client';

import React from 'react';
import { 
    Info,
    CreditCard,
    Layers,
    AlertCircle,
    Cpu,
    ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
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

// Mock data for consumption trend chart
const consumptionTrendData = [
    { day: 'Mon', Capabilities: 800, DataFlow: 600, Entity: 1200, Execution: 1500 },
    { day: 'Tue', Capabilities: 1000, DataFlow: 800, Entity: 1400, Execution: 1200 },
    { day: 'Wed', Capabilities: 1200, DataFlow: 700, Entity: 1100, Execution: 1300 },
    { day: 'Thu', Capabilities: 900, DataFlow: 900, Entity: 1300, Execution: 1400 },
    { day: 'Fri', Capabilities: 1100, DataFlow: 600, Entity: 1000, Execution: 1100 },
    { day: 'Sat', Capabilities: 1300, DataFlow: 800, Entity: 1500, Execution: 1600 },
    { day: 'Sun', Capabilities: 1000, DataFlow: 700, Entity: 1200, Execution: 1400 },
];

// Mock data for workspace consumption table
const workspaceConsumptionData = [
    {
        id: '1',
        name: 'Finance Automation',
        status: 'Active',
        totalConsumption: 145000,
        breakdown: { entity: 35, capability: 25, execution: 25, data: 15 },
        utilization: 73,
    },
    {
        id: '2',
        name: 'Customer Support Bot',
        status: 'Active',
        totalConsumption: 320000,
        breakdown: { entity: 40, capability: 20, execution: 30, data: 10 },
        utilization: 64,
    },
    {
        id: '3',
        name: 'HR Onboarding',
        status: 'Active',
        totalConsumption: 89000,
        breakdown: { entity: 30, capability: 30, execution: 20, data: 20 },
        utilization: 45,
    },
    {
        id: '4',
        name: 'Inventory Management',
        status: 'Active',
        totalConsumption: 93200,
        breakdown: { entity: 25, capability: 35, execution: 25, data: 15 },
        utilization: 91,
    },
];

// Metric Card Component
const MetricCard: React.FC<{
    title: string;
    value: string;
    footer: string;
    icon: React.ReactNode;
    iconBgColor: string;
    badge?: string;
}> = ({ title, value, footer, icon, iconBgColor, badge }) => (
    <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                        <Info className="size-3.5 text-gray-400 cursor-help" />
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                        {badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-orange-500 rounded-full uppercase">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{footer}</p>
                </div>
                <div className={`p-3 rounded-full ${iconBgColor}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

// Breakdown Bar Component
const BreakdownBar: React.FC<{
    breakdown: { entity: number; capability: number; execution: number; data: number };
}> = ({ breakdown }) => (
    <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <div 
            className="bg-blue-600" 
            style={{ width: `${breakdown.entity}%` }}
            title={`Entity: ${breakdown.entity}%`}
        />
        <div 
            className="bg-teal-500" 
            style={{ width: `${breakdown.capability}%` }}
            title={`Capability: ${breakdown.capability}%`}
        />
        <div 
            className="bg-green-500" 
            style={{ width: `${breakdown.execution}%` }}
            title={`Execution: ${breakdown.execution}%`}
        />
        <div 
            className="bg-purple-500" 
            style={{ width: `${breakdown.data}%` }}
            title={`Data: ${breakdown.data}%`}
        />
    </div>
);

// Utilization Bar Component
const UtilizationBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const getColor = (pct: number) => {
        if (pct >= 90) return 'bg-red-500';
        if (pct >= 75) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-10 text-right">
                {percentage}%
            </span>
            <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div 
                    className={`h-full rounded-full ${getColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
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

const DashboardPage: React.FC = () => {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Credit Management Dashboard
                </h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Environment:</span>
                    <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                        All Environments
                        <ChevronDown className="size-4" />
                    </button>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Available Balance"
                    value="647,200"
                    footer="of 1,000,000 allocated"
                    badge="Enterprise Pack"
                    icon={<CreditCard className="size-5 text-purple-600" />}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                />
                <MetricCard
                    title="Active Workspaces"
                    value="4"
                    footer="4 total workspaces"
                    icon={<Layers className="size-5 text-blue-600" />}
                    iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <MetricCard
                    title="Critical Alerts"
                    value="0"
                    footer="workspaces >90% utilization"
                    icon={<AlertCircle className="size-5 text-red-500" />}
                    iconBgColor="bg-red-100 dark:bg-red-900/30"
                />
                <MetricCard
                    title="Avg Monthly iFT"
                    value="12.8M"
                    footer="Converted at 1,000 iFT = 1 Credit"
                    icon={<Cpu className="size-5 text-green-600" />}
                    iconBgColor="bg-green-100 dark:bg-green-900/30"
                />
            </div>

            {/* Consumption Trend Chart */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Consumption Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={consumptionTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorExecution" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorEntity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorDataFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2}/>
                                    </linearGradient>
                                    <linearGradient id="colorCapabilities" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    domain={[0, 4000]}
                                    ticks={[0, 1000, 2000, 3000, 4000]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    formatter={(value) => (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                                    )}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Execution" 
                                    stackId="1" 
                                    stroke="#22c55e" 
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
                                    dataKey="DataFlow" 
                                    stackId="1" 
                                    stroke="#a855f7" 
                                    fill="url(#colorDataFlow)" 
                                    name="Data Flow"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Capabilities" 
                                    stackId="1" 
                                    stroke="#14b8a6" 
                                    fill="url(#colorCapabilities)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Total Credit Consumption Table */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Total Credit Consumption</CardTitle>
                            <CardDescription>Credit usage breakdown by workspace.</CardDescription>
                        </div>
                        <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Last 30 Days
                            <ChevronDown className="size-4" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                        Workspace Name
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                        Total Consumption
                                    </th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300 w-48">
                                        Breakdown (Ent | Cap | Exec | Data)
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                        Budget Utilization
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaceConsumptionData.map((workspace) => (
                                    <tr
                                        key={workspace.id}
                                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                                            {workspace.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="success" className="text-xs">
                                                {workspace.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                            {workspace.totalConsumption.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <BreakdownBar breakdown={workspace.breakdown} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end">
                                                <UtilizationBar percentage={workspace.utilization} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;
