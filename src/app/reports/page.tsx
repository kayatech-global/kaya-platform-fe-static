'use client';

import React, { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronRight, Wallet, TrendingUp } from 'lucide-react';
import { Button } from '@/components';
import { Card } from '@/components/atoms/card';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

// Filter options
type FilterPeriod = 'last24h' | 'last7d' | 'last30d' | 'last7m';

// Static credit data - these values don't change with filter
const creditData = {
    available: 850000,
    consumed: 150000,
};

// Generate X-axis labels based on filter
const generateTimeLabels = (filter: FilterPeriod): string[] => {
    switch (filter) {
        case 'last24h':
            // Hours of the day
            return Array.from({ length: 24 }, (_, i) => {
                const hour = i;
                if (hour === 0) return '12 AM';
                if (hour === 12) return '12 PM';
                return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
            });
        case 'last7d':
            // Days of the week
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        case 'last30d':
            // Days of the month
            return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
        case 'last7m':
            // Last 7 months
            const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            const currentMonth = new Date().getMonth(); // 0-11
            const result = [];
            for (let i = 6; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                result.push(months[monthIndex]);
            }
            return result;
        default:
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
};

// Mock data for Consumption Trend - By CEED Layer
const getCEEDTrendData = (filter: FilterPeriod) => {
    const labels = generateTimeLabels(filter);
    const multiplier = {
        'last24h': 0.05,
        'last7d': 0.5,
        'last30d': 0.15,
        'last7m': 3,
    }[filter];

    return labels.map((label, index) => {
        // Add some variation based on index
        const variation = 0.7 + (Math.sin(index * 0.5) * 0.3) + (Math.random() * 0.2);
        return {
            label,
            capability: Math.round(5500 * multiplier * variation),
            data: Math.round(3500 * multiplier * variation),
            entity: Math.round(7500 * multiplier * variation),
            execution: Math.round(1200 * multiplier * variation),
        };
    });
};

// Mock data for Consumption Trend - By Workspace
const getWorkspaceTrendData = (filter: FilterPeriod) => {
    const labels = generateTimeLabels(filter);
    const multiplier = {
        'last24h': 0.05,
        'last7d': 0.5,
        'last30d': 0.15,
        'last7m': 3,
    }[filter];

    return labels.map((label, index) => {
        // Add some variation based on index
        const variation = 0.7 + (Math.sin(index * 0.5) * 0.3) + (Math.random() * 0.2);
        return {
            label,
            financeAutomation: Math.round(7500 * multiplier * variation),
            customerSupport: Math.round(5500 * multiplier * variation),
            legalReview: Math.round(2800 * multiplier * variation),
            hrTools: Math.round(1500 * multiplier * variation),
        };
    });
};

// Mock data for Monthly Summary
const getMonthlySummaryData = (filter: FilterPeriod) => {
    const multiplier = {
        'last24h': 0.03,
        'last7d': 0.25,
        'last30d': 1,
        'last7m': 7,
    }[filter];

    return [
        {
            id: 1,
            workspaceName: 'Finance Automation',
            capability: Math.round(85000 * multiplier),
            entity: Math.round(105000 * multiplier),
            execution: Math.round(110000 * multiplier),
            data: Math.round(65000 * multiplier),
            totalCredits: Math.round(365000 * multiplier),
        },
        {
            id: 2,
            workspaceName: 'Customer Support Bot',
            capability: Math.round(150000 * multiplier),
            entity: Math.round(180000 * multiplier),
            execution: Math.round(210000 * multiplier),
            data: Math.round(120000 * multiplier),
            totalCredits: Math.round(660000 * multiplier),
        },
        {
            id: 3,
            workspaceName: 'Legal Document Review',
            capability: Math.round(40000 * multiplier),
            entity: Math.round(55000 * multiplier),
            execution: Math.round(65000 * multiplier),
            data: Math.round(35000 * multiplier),
            totalCredits: Math.round(195000 * multiplier),
        },
        {
            id: 4,
            workspaceName: 'Internal HR Tools',
            capability: Math.round(25000 * multiplier),
            entity: Math.round(35000 * multiplier),
            execution: Math.round(45000 * multiplier),
            data: Math.round(20000 * multiplier),
            totalCredits: Math.round(125000 * multiplier),
        },
    ];
};

// CEED Colors
const COLORS = {
    capabilities: '#14B8A6', // Teal
    dataFlow: '#A855F7',     // Purple
    entity: '#3B82F6',       // Blue
    execution: '#22C55E',    // Green
};

// Workspace Colors
const WORKSPACE_COLORS = {
    financeAutomation: '#22C55E',   // Green
    customerSupport: '#3B82F6',     // Blue
    legalReview: '#A855F7',         // Purple
    hrTools: '#F59E0B',             // Amber
};

export default function ReportsPage() {
    const [filter, setFilter] = useState<FilterPeriod>('last30d');
    const [chartView, setChartView] = useState<'ceed' | 'workspace'>('ceed');
    
    const ceedTrendData = getCEEDTrendData(filter);
    const workspaceTrendData = getWorkspaceTrendData(filter);
    const monthlySummaryData = getMonthlySummaryData(filter);

    const filterOptions: { value: FilterPeriod; label: string }[] = [
        { value: 'last24h', label: 'Last 24 Hours' },
        { value: 'last7d', label: 'Last 7 Days' },
        { value: 'last30d', label: 'Last 30 Days' },
        { value: 'last7m', label: 'Last 7 Months' },
    ];

    const handleExportCSV = () => {
        // CSV export logic
        const headers = ['Workspace Name', 'Capability', 'Entity', 'Execution', 'Data', 'Total Credits'];
        const rows = monthlySummaryData.map(row => [
            row.workspaceName,
            row.capability,
            row.entity,
            row.execution,
            row.data,
            row.totalCredits
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-${filter}.csv`;
        a.click();
    };

    const handleExportPDF = () => {
        // In a real implementation, this would use a PDF library
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
                <div className="flex items-center gap-3">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterPeriod)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            {filterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {/* Export Buttons */}
                    <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleExportCSV}>
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="secondary" size="sm" className="flex items-center gap-2" onClick={handleExportPDF}>
                        <FileText className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>



            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Credits Card */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Available Credits</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {creditData.available.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Remaining credits balance</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                            <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </Card>

                {/* Consumed Credits Card */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Consumed Credits</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {creditData.consumed.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Used to date</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Total Consumption Trend Chart with Tabs */}
            <Card className="p-6 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Consumption Trend
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Daily credit consumption breakdown.</p>
                    </div>
                    {/* Toggle Tabs */}
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setChartView('ceed')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                chartView === 'ceed'
                                    ? 'bg-blue-50 text-blue-600 border-r border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
                            By CEED Layer
                        </button>
                        <button
                            onClick={() => setChartView('workspace')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                chartView === 'workspace'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
                            By Workspace
                        </button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                    {chartView === 'ceed' ? (
                        <AreaChart data={ceedTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCapability" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.capabilities} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.capabilities} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.execution} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.execution} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorEntity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.entity} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.entity} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorExecution" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.dataFlow} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.dataFlow} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={filter === 'last30d' ? 4 : filter === 'last24h' ? 3 : 0} />
                            <YAxis tickFormatter={(value) => value.toLocaleString()} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Area type="monotone" dataKey="capability" stackId="1" stroke={COLORS.capabilities} fill="url(#colorCapability)" name="Capability" />
                            <Area type="monotone" dataKey="data" stackId="1" stroke={COLORS.execution} fill="url(#colorData)" name="Data" />
                            <Area type="monotone" dataKey="entity" stackId="1" stroke={COLORS.entity} fill="url(#colorEntity)" name="Entity" />
                            <Area type="monotone" dataKey="execution" stackId="1" stroke={COLORS.dataFlow} fill="url(#colorExecution)" name="Execution" />
                        </AreaChart>
                    ) : (
                        <AreaChart data={workspaceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKSPACE_COLORS.financeAutomation} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKSPACE_COLORS.financeAutomation} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKSPACE_COLORS.customerSupport} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKSPACE_COLORS.customerSupport} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorLegal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKSPACE_COLORS.legalReview} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKSPACE_COLORS.legalReview} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKSPACE_COLORS.hrTools} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKSPACE_COLORS.hrTools} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={filter === 'last30d' ? 4 : filter === 'last24h' ? 3 : 0} />
                            <YAxis tickFormatter={(value) => value.toLocaleString()} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Area type="monotone" dataKey="financeAutomation" stackId="1" stroke={WORKSPACE_COLORS.financeAutomation} fill="url(#colorFinance)" name="Finance Automation" />
                            <Area type="monotone" dataKey="customerSupport" stackId="1" stroke={WORKSPACE_COLORS.customerSupport} fill="url(#colorCustomer)" name="Customer Support" />
                            <Area type="monotone" dataKey="legalReview" stackId="1" stroke={WORKSPACE_COLORS.legalReview} fill="url(#colorLegal)" name="Legal Review" />
                            <Area type="monotone" dataKey="hrTools" stackId="1" stroke={WORKSPACE_COLORS.hrTools} fill="url(#colorHR)" name="HR Tools" />
                        </AreaChart>
                    )}
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                    {chartView === 'ceed' ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.capabilities }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Capability</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.execution }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Data</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.entity }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Entity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.dataFlow }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Execution</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKSPACE_COLORS.financeAutomation }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Finance Automation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKSPACE_COLORS.customerSupport }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Customer Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKSPACE_COLORS.legalReview }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Legal Review</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKSPACE_COLORS.hrTools }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">HR Tools</span>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Credit Summary Table */}
            <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Credit Summary
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Workspace Name</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Capability</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Entity</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Execution</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Data</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Total Credits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummaryData.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.workspaceName}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                        {row.capability.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                        {row.entity.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                        {row.execution.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                        {row.data.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-semibold text-purple-600">
                                        {row.totalCredits.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
