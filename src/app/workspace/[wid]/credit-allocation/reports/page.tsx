'use client';

import React, { useState } from 'react';
import { Download, FileText, ChevronDown, Wallet, TrendingUp } from 'lucide-react';
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

// Mock data for metric cards based on filter
const getMetricData = (filter: FilterPeriod) => {
    const data = {
        'last24h': { available: 495000, consumed: 5000 },
        'last7d': { available: 465000, consumed: 35000 },
        'last30d': { available: 350000, consumed: 150000 },
        'last7m': { available: 200000, consumed: 300000 },
    };
    return data[filter];
};

// Mock data for Consumption Trend - By CEED Layer
const getCEEDTrendData = (filter: FilterPeriod) => {
    const multiplier = {
        'last24h': 0.15,
        'last7d': 0.5,
        'last30d': 1,
        'last7m': 3,
    }[filter];

    const baseData = [
        { day: 'Mon', capability: Math.round(2500 * multiplier), data: Math.round(1500 * multiplier), entity: Math.round(3500 * multiplier), execution: Math.round(800 * multiplier) },
        { day: 'Tue', capability: Math.round(3000 * multiplier), data: Math.round(2000 * multiplier), entity: Math.round(4000 * multiplier), execution: Math.round(1000 * multiplier) },
        { day: 'Wed', capability: Math.round(4200 * multiplier), data: Math.round(3500 * multiplier), entity: Math.round(5500 * multiplier), execution: Math.round(1500 * multiplier) },
        { day: 'Thu', capability: Math.round(3500 * multiplier), data: Math.round(2800 * multiplier), entity: Math.round(4800 * multiplier), execution: Math.round(1200 * multiplier) },
        { day: 'Fri', capability: Math.round(2800 * multiplier), data: Math.round(2200 * multiplier), entity: Math.round(4200 * multiplier), execution: Math.round(1000 * multiplier) },
        { day: 'Sat', capability: Math.round(3200 * multiplier), data: Math.round(2500 * multiplier), entity: Math.round(4500 * multiplier), execution: Math.round(1300 * multiplier) },
        { day: 'Sun', capability: Math.round(3800 * multiplier), data: Math.round(3000 * multiplier), entity: Math.round(5000 * multiplier), execution: Math.round(1400 * multiplier) },
    ];
    return baseData;
};

// Mock data for Consumption Trend - By Workflow
const getWorkflowTrendData = (filter: FilterPeriod) => {
    const multiplier = {
        'last24h': 0.15,
        'last7d': 0.5,
        'last30d': 1,
        'last7m': 3,
    }[filter];

    const baseData = [
        { day: 'Mon', claimsProcessing: Math.round(3500 * multiplier), customerSupport: Math.round(2500 * multiplier), invoiceProcessing: Math.round(1800 * multiplier), dataValidation: Math.round(1200 * multiplier) },
        { day: 'Tue', claimsProcessing: Math.round(4500 * multiplier), customerSupport: Math.round(3500 * multiplier), invoiceProcessing: Math.round(2200 * multiplier), dataValidation: Math.round(1500 * multiplier) },
        { day: 'Wed', claimsProcessing: Math.round(6000 * multiplier), customerSupport: Math.round(4500 * multiplier), invoiceProcessing: Math.round(3000 * multiplier), dataValidation: Math.round(2000 * multiplier) },
        { day: 'Thu', claimsProcessing: Math.round(4800 * multiplier), customerSupport: Math.round(3800 * multiplier), invoiceProcessing: Math.round(2500 * multiplier), dataValidation: Math.round(1800 * multiplier) },
        { day: 'Fri', claimsProcessing: Math.round(4000 * multiplier), customerSupport: Math.round(3200 * multiplier), invoiceProcessing: Math.round(2200 * multiplier), dataValidation: Math.round(1500 * multiplier) },
        { day: 'Sat', claimsProcessing: Math.round(4500 * multiplier), customerSupport: Math.round(3500 * multiplier), invoiceProcessing: Math.round(2400 * multiplier), dataValidation: Math.round(1700 * multiplier) },
        { day: 'Sun', claimsProcessing: Math.round(5200 * multiplier), customerSupport: Math.round(4000 * multiplier), invoiceProcessing: Math.round(2800 * multiplier), dataValidation: Math.round(1900 * multiplier) },
    ];
    return baseData;
};

// Mock data for Monthly Summary (by Workflow)
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
            workflowName: 'Claims Processing Workflow',
            capability: Math.round(45000 * multiplier),
            entity: Math.round(55000 * multiplier),
            execution: Math.round(60000 * multiplier),
            data: Math.round(35000 * multiplier),
            totalCredits: Math.round(195000 * multiplier),
        },
        {
            id: 2,
            workflowName: 'Customer Support Bot',
            capability: Math.round(35000 * multiplier),
            entity: Math.round(42000 * multiplier),
            execution: Math.round(48000 * multiplier),
            data: Math.round(28000 * multiplier),
            totalCredits: Math.round(153000 * multiplier),
        },
        {
            id: 3,
            workflowName: 'Invoice Processing',
            capability: Math.round(25000 * multiplier),
            entity: Math.round(32000 * multiplier),
            execution: Math.round(38000 * multiplier),
            data: Math.round(22000 * multiplier),
            totalCredits: Math.round(117000 * multiplier),
        },
        {
            id: 4,
            workflowName: 'Data Validation Pipeline',
            capability: Math.round(18000 * multiplier),
            entity: Math.round(24000 * multiplier),
            execution: Math.round(28000 * multiplier),
            data: Math.round(16000 * multiplier),
            totalCredits: Math.round(86000 * multiplier),
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

// Workflow Colors
const WORKFLOW_COLORS = {
    claimsProcessing: '#22C55E',   // Green
    customerSupport: '#3B82F6',     // Blue
    invoiceProcessing: '#A855F7',   // Purple
    dataValidation: '#F59E0B',      // Amber
};

export default function WorkspaceReportsPage() {
    const [filter, setFilter] = useState<FilterPeriod>('last30d');
    const [chartView, setChartView] = useState<'ceed' | 'workflow'>('ceed');
    
    const metricData = getMetricData(filter);
    const ceedTrendData = getCEEDTrendData(filter);
    const workflowTrendData = getWorkflowTrendData(filter);
    const monthlySummaryData = getMonthlySummaryData(filter);

    const filterOptions: { value: FilterPeriod; label: string }[] = [
        { value: 'last24h', label: 'Last 24 Hours' },
        { value: 'last7d', label: 'Last 7 Days' },
        { value: 'last30d', label: 'Last 30 Days' },
        { value: 'last7m', label: 'Last 7 Months' },
    ];

    const handleExportCSV = () => {
        const headers = ['Workflow Name', 'Capability', 'Entity', 'Execution', 'Data', 'Total Credits'];
        const rows = monthlySummaryData.map(row => [
            row.workflowName,
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
        a.download = `workspace-reports-${filter}.csv`;
        a.click();
    };

    const handleExportPDF = () => {
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
                                {metricData.available.toLocaleString()}
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
                                {metricData.consumed.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Used to date</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Consumption Trend Chart with Tabs */}
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
                            onClick={() => setChartView('workflow')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                chartView === 'workflow'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
                            By Workflow
                        </button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                    {chartView === 'ceed' ? (
                        <AreaChart data={ceedTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCapabilityWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.capabilities} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.capabilities} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorDataWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.execution} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.execution} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorEntityWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.entity} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.entity} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorExecutionWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.dataFlow} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.dataFlow} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(value) => value.toLocaleString()} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Area type="monotone" dataKey="capability" stackId="1" stroke={COLORS.capabilities} fill="url(#colorCapabilityWs)" name="Capability" />
                            <Area type="monotone" dataKey="data" stackId="1" stroke={COLORS.execution} fill="url(#colorDataWs)" name="Data" />
                            <Area type="monotone" dataKey="entity" stackId="1" stroke={COLORS.entity} fill="url(#colorEntityWs)" name="Entity" />
                            <Area type="monotone" dataKey="execution" stackId="1" stroke={COLORS.dataFlow} fill="url(#colorExecutionWs)" name="Execution" />
                        </AreaChart>
                    ) : (
                        <AreaChart data={workflowTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorClaimsWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKFLOW_COLORS.claimsProcessing} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKFLOW_COLORS.claimsProcessing} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorCustomerWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKFLOW_COLORS.customerSupport} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKFLOW_COLORS.customerSupport} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorInvoiceWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKFLOW_COLORS.invoiceProcessing} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKFLOW_COLORS.invoiceProcessing} stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorValidationWs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={WORKFLOW_COLORS.dataValidation} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={WORKFLOW_COLORS.dataValidation} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(value) => value.toLocaleString()} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Area type="monotone" dataKey="claimsProcessing" stackId="1" stroke={WORKFLOW_COLORS.claimsProcessing} fill="url(#colorClaimsWs)" name="Claims Processing" />
                            <Area type="monotone" dataKey="customerSupport" stackId="1" stroke={WORKFLOW_COLORS.customerSupport} fill="url(#colorCustomerWs)" name="Customer Support" />
                            <Area type="monotone" dataKey="invoiceProcessing" stackId="1" stroke={WORKFLOW_COLORS.invoiceProcessing} fill="url(#colorInvoiceWs)" name="Invoice Processing" />
                            <Area type="monotone" dataKey="dataValidation" stackId="1" stroke={WORKFLOW_COLORS.dataValidation} fill="url(#colorValidationWs)" name="Data Validation" />
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
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKFLOW_COLORS.claimsProcessing }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Claims Processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKFLOW_COLORS.customerSupport }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Customer Support</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKFLOW_COLORS.invoiceProcessing }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Invoice Processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: WORKFLOW_COLORS.dataValidation }} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Data Validation</span>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Monthly Summary Table */}
            <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Monthly Summary
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Workflow Name
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Capability
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Entity
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Execution
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Data
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                    Total Credits
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummaryData.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                >
                                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                                        {row.workflowName}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                        {row.capability.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                        {row.entity.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                        {row.execution.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                        {row.data.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                        {row.totalCredits.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                                    Total
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {monthlySummaryData.reduce((sum, row) => sum + row.capability, 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {monthlySummaryData.reduce((sum, row) => sum + row.entity, 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {monthlySummaryData.reduce((sum, row) => sum + row.execution, 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                    {monthlySummaryData.reduce((sum, row) => sum + row.data, 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                                    {monthlySummaryData.reduce((sum, row) => sum + row.totalCredits, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
        </div>
    );
}
