'use client';

import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

// Types
interface WorkflowAgent {
    id: string;
    name: string;
    consumed: number;
    budgetLimit: number | null;
}

interface Workflow {
    id: string;
    name: string;
    agentCount: number;
    status: 'Active' | 'Paused' | 'Inactive';
    tier: 'T1 (Low)' | 'T2 (Medium)' | 'T3 (High)';
    consumed: number;
    budgetLimit: number | null;
    agents: WorkflowAgent[];
}

// Mock data
const mockWorkflows: Workflow[] = [
    {
        id: 'wf-1',
        name: 'Invoice Processing',
        agentCount: 3,
        status: 'Active',
        tier: 'T2 (Medium)',
        consumed: 150000,
        budgetLimit: 200000,
        agents: [
            { id: 'a1', name: 'OCR Agent', consumed: 50000, budgetLimit: 75000 },
            { id: 'a2', name: 'Validation Agent', consumed: 60000, budgetLimit: 70000 },
            { id: 'a3', name: 'Processing Agent', consumed: 40000, budgetLimit: 55000 },
        ],
    },
    {
        id: 'wf-2',
        name: 'Expense Approval',
        agentCount: 1,
        status: 'Active',
        tier: 'T1 (Low)',
        consumed: 85000,
        budgetLimit: 100000,
        agents: [
            { id: 'a4', name: 'Approval Agent', consumed: 85000, budgetLimit: 100000 },
        ],
    },
    {
        id: 'wf-3',
        name: 'Audit Compliance',
        agentCount: 0,
        status: 'Paused',
        tier: 'T1 (Low)',
        consumed: 45000,
        budgetLimit: null,
        agents: [],
    },
    {
        id: 'wf-4',
        name: 'Payroll Sync',
        agentCount: 0,
        status: 'Active',
        tier: 'T3 (High)',
        consumed: 45000,
        budgetLimit: 50000,
        agents: [],
    },
];

// Utility functions
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

const getUtilization = (consumed: number, limit: number | null): number | null => {
    if (limit === null || limit === 0) return null;
    return Math.round((consumed / limit) * 100);
};

const getUtilizationColor = (utilization: number | null): string => {
    if (utilization === null) return 'bg-gray-300';
    if (utilization >= 95) return 'bg-red-500';
    if (utilization >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
};

const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'secondary' => {
    switch (status) {
        case 'Active':
            return 'success';
        case 'Paused':
            return 'warning';
        default:
            return 'secondary';
    }
};

const getTierBadgeClass = (tier: string): string => {
    if (tier.includes('Low')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (tier.includes('Medium')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (tier.includes('High')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-700';
};

// Consumption Progress Bar Component
const ConsumptionBar: React.FC<{ consumed: number; limit: number | null }> = ({ consumed, limit }) => {
    const segments = [
        { color: 'bg-blue-500', percentage: 40 },
        { color: 'bg-green-500', percentage: 35 },
        { color: 'bg-purple-500', percentage: 25 },
    ];

    return (
        <div className="flex h-1.5 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {segments.map((segment, index) => (
                <div
                    key={index}
                    className={cn(segment.color, 'h-full')}
                    style={{ width: `${segment.percentage}%` }}
                />
            ))}
        </div>
    );
};

// Utilization Bar Component
const UtilizationBar: React.FC<{ utilization: number | null }> = ({ utilization }) => {
    if (utilization === null) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
    }

    const barColor = getUtilizationColor(utilization);

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10">{utilization}%</span>
            <div className="h-2 w-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                    className={cn(barColor, 'h-full rounded-full transition-all')}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                />
            </div>
        </div>
    );
};

// Workflow Row Component
const WorkflowRow: React.FC<{
    workflow: Workflow;
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ workflow, isExpanded, onToggle }) => {
    const utilization = getUtilization(workflow.consumed, workflow.budgetLimit);

    return (
        <>
            <tr
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={onToggle}
            >
                {/* Workflow Name */}
                <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                            {isExpanded ? (
                                <ChevronDown className="size-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="size-4 text-gray-500" />
                            )}
                        </button>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Users className="size-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {workflow.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {workflow.agentCount} {workflow.agentCount === 1 ? 'agent' : 'agents'}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Status & Tier */}
                <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                        <Badge variant={getStatusBadgeVariant(workflow.status)} size="sm">
                            {workflow.status}
                        </Badge>
                        <span className={cn(
                            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md',
                            getTierBadgeClass(workflow.tier)
                        )}>
                            {workflow.tier}
                        </span>
                    </div>
                </td>

                {/* Consumed (CEED) */}
                <td className="py-4 px-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                            {formatNumber(workflow.consumed)}
                        </span>
                        <ConsumptionBar consumed={workflow.consumed} limit={workflow.budgetLimit} />
                    </div>
                </td>

                {/* Budget Limit */}
                <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                        {workflow.budgetLimit !== null ? formatNumber(workflow.budgetLimit) : 'Unlimited'}
                    </span>
                </td>

                {/* Utilization */}
                <td className="py-4 px-4">
                    <UtilizationBar utilization={utilization} />
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-center">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle settings click
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Workflow settings"
                    >
                        <SlidersHorizontal className="size-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </td>
            </tr>

            {/* Expanded Agent Details */}
            {isExpanded && workflow.agents.length > 0 && (
                <tr className="bg-gray-50 dark:bg-gray-800/30">
                    <td colSpan={6} className="py-4 px-4 pl-20">
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Agent-Level Credits
                            </h4>
                            <div className="grid gap-2">
                                {workflow.agents.map((agent) => {
                                    const agentUtilization = getUtilization(agent.consumed, agent.budgetLimit);
                                    return (
                                        <div
                                            key={agent.id}
                                            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                                        >
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {agent.name}
                                            </span>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Consumed</span>
                                                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                                        {formatNumber(agent.consumed)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Limit</span>
                                                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                                                        {agent.budgetLimit ? formatNumber(agent.budgetLimit) : 'Unlimited'}
                                                    </p>
                                                </div>
                                                <UtilizationBar utilization={agentUtilization} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// Main Page Component
const WorkflowCreditManagementPage: React.FC = () => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (workflowId: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(workflowId)) {
                newSet.delete(workflowId);
            } else {
                newSet.add(workflowId);
            }
            return newSet;
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Workflow Level Credit Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage budgets per workflow. Click a workflow to view its iFlow profile and agent-level credits.
                </p>
            </div>

            {/* Main Card */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Workspace Workflows
                    </CardTitle>
                    <CardDescription>
                        Manage budgets and monitor CEED consumption per workflow.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Workflow Name
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status & Tier
                                    </th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Consumed (CEED)
                                    </th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Budget Limit
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Utilization
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockWorkflows.map((workflow) => (
                                    <WorkflowRow
                                        key={workflow.id}
                                        workflow={workflow}
                                        isExpanded={expandedRows.has(workflow.id)}
                                        onToggle={() => toggleRow(workflow.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkflowCreditManagementPage;
