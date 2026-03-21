'use client';

import React, { useState } from 'react';
import { Download, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components';
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

// Mock data for Consumption by Workspace (horizontal bar chart)
const workspaceConsumptionData = [
    { name: 'Finance Automation', capabilities: 45000, dataFlow: 80000, entity: 120000, execution: 75000 },
    { name: 'Customer Support Bot', capabilities: 60000, dataFlow: 95000, entity: 100000, execution: 65000 },
    { name: 'Legal Document Review', capabilities: 15000, dataFlow: 25000, entity: 35000, execution: 20000 },
    { name: 'Internal HR Tools', capabilities: 20000, dataFlow: 30000, entity: 25000, execution: 15000 },
];

// Mock data for Daily Consumption Trends (vertical bar chart)
const dailyConsumptionData = [
    { day: 'Mon', capabilities: 800, dataFlow: 1200, entity: 1500, execution: 1000 },
    { day: 'Tue', capabilities: 1000, dataFlow: 1400, entity: 1800, execution: 1200 },
    { day: 'Wed', capabilities: 900, dataFlow: 1300, entity: 1600, execution: 1100 },
    { day: 'Thu', capabilities: 1100, dataFlow: 1500, entity: 2000, execution: 1300 },
    { day: 'Fri', capabilities: 1200, dataFlow: 1600, entity: 2200, execution: 1400 },
    { day: 'Sat', capabilities: 600, dataFlow: 900, entity: 1100, execution: 700 },
    { day: 'Sun', capabilities: 500, dataFlow: 800, entity: 1000, execution: 600 },
];

// Mock data for Monthly Summary
const monthlySummaryData = [
    {
        id: 1,
        month: 'February 2026 (MTD)',
        entity: 105000,
        capability: 85000,
        execution: 110000,
        data: 65000,
        totalCredits: 365000,
        rawIFT: '365M',
        costEst: 1825.00,
        entityIFT: 105000000,
        capabilityIFT: 85000000,
        executionIFT: 110000000,
        dataIFT: 65000000,
    },
    {
        id: 2,
        month: 'January 2026',
        entity: 180000,
        capability: 150000,
        execution: 210000,
        data: 120000,
        totalCredits: 660000,
        rawIFT: '660M',
        costEst: 3300.00,
        entityIFT: 180000000,
        capabilityIFT: 150000000,
        executionIFT: 210000000,
        dataIFT: 120000000,
    },
    {
        id: 3,
        month: 'December 2025',
        entity: 165000,
        capability: 140000,
        execution: 195000,
        data: 100000,
        totalCredits: 600000,
        rawIFT: '600M',
        costEst: 3000.00,
        entityIFT: 165000000,
        capabilityIFT: 140000000,
        executionIFT: 195000000,
        dataIFT: 100000000,
    },
];

// CEED Colors
const COLORS = {
    capabilities: '#14B8A6', // Teal
    dataFlow: '#A855F7',     // Purple
    entity: '#3B82F6',       // Blue
    execution: '#22C55E',    // Green
};

export default function ReportsPage() {
    const [expandedRows, setExpandedRows] = useState<number[]>([1]); // First row expanded by default

    const toggleRow = (id: number) => {
        setExpandedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
                <div className="flex items-center gap-3">
                    {/* Environment Dropdown */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Environment:</span>
                        <button className="flex items-center gap-1 text-gray-400">
                            All Environments
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Export Buttons */}
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumption by Workspace (CEED Breakdown) - Horizontal Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Consumption by Workspace (CEED Breakdown)
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            layout="vertical"
                            data={workspaceConsumptionData}
                            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" tickFormatter={(value) => value.toLocaleString()} />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Bar dataKey="capabilities" stackId="a" fill={COLORS.capabilities} name="Capabilities" />
                            <Bar dataKey="dataFlow" stackId="a" fill={COLORS.dataFlow} name="Data Flow" />
                            <Bar dataKey="entity" stackId="a" fill={COLORS.entity} name="Entity" />
                            <Bar dataKey="execution" stackId="a" fill={COLORS.execution} name="Execution" />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.capabilities }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Capabilities</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.dataFlow }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Data Flow</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.entity }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Entity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.execution }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Execution</span>
                        </div>
                    </div>
                </div>

                {/* Daily Consumption Trends (CEED) - Vertical Stacked Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Daily Consumption Trends (CEED)
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={dailyConsumptionData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(value) => value.toLocaleString()} />
                            <Tooltip formatter={(value: number) => value.toLocaleString()} />
                            <Bar dataKey="capabilities" stackId="a" fill={COLORS.capabilities} name="Capabilities" />
                            <Bar dataKey="dataFlow" stackId="a" fill={COLORS.dataFlow} name="Data Flow" />
                            <Bar dataKey="entity" stackId="a" fill={COLORS.entity} name="Entity" />
                            <Bar dataKey="execution" stackId="a" fill={COLORS.execution} name="Execution" />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.capabilities }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Capabilities</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.dataFlow }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Data Flow</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.entity }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Entity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.execution }} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Execution</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Monthly Summary
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 w-8"></th>
                                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Month</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Entity</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Capability</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Execution</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Data</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Total Credits</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Raw iFT</th>
                                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Cost (Est.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummaryData.map((row) => (
                                <React.Fragment key={row.id}>
                                    {/* Main Row */}
                                    <tr 
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        onClick={() => toggleRow(row.id)}
                                    >
                                        <td className="py-3 px-2">
                                            {expandedRows.includes(row.id) ? (
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {row.month}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {row.entity.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {row.capability.toLocaleString()}
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
                                        <td className="py-3 px-4 text-sm text-right text-gray-400">
                                            {row.rawIFT}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                                            ${row.costEst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    {/* Expanded Row - iFT Breakdown */}
                                    {expandedRows.includes(row.id) && (
                                        <tr>
                                            <td colSpan={9} className="bg-gray-50 dark:bg-gray-700/30 py-4 px-6">
                                                <div className="grid grid-cols-4 gap-4">
                                                    {/* Entity iFT Card */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                            ENTITY iFT
                                                        </p>
                                                        <p className="text-xl font-bold" style={{ color: COLORS.entity }}>
                                                            {row.entityIFT.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {/* Capability iFT Card */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                            CAPABILITY iFT
                                                        </p>
                                                        <p className="text-xl font-bold" style={{ color: COLORS.capabilities }}>
                                                            {row.capabilityIFT.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {/* Execution iFT Card */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                            EXECUTION iFT
                                                        </p>
                                                        <p className="text-xl font-bold" style={{ color: COLORS.execution }}>
                                                            {row.executionIFT.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {/* Data iFT Card */}
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                            DATA iFT
                                                        </p>
                                                        <p className="text-xl font-bold" style={{ color: COLORS.dataFlow }}>
                                                            {row.dataIFT.toLocaleString()}
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
            </div>
        </div>
    );
}
