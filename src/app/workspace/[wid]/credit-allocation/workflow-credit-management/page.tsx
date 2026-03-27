'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronRight,
    ChevronDown,
    SlidersHorizontal,
    Users,
    Bot,
    Brain,
    Database,
    Check,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

// Types
interface CEEDBreakdown {
    entity: number;
    capability: number;
    execution: number;
    dataFlow: number;
}

interface WorkflowAgent {
    id: string;
    name: string;
    type: 'Orchestrator' | 'Worker' | 'Specialist';
    model: string;
    intelligenceTier: 'HIGH INTELLIGENCE' | 'STANDARD INTELLIGENCE';
    consumed: number;
    budgetLimit: number | null;
    icon: 'brain' | 'database' | 'bot';
}

interface Workflow {
    id: string;
    name: string;
    agentCount: number;
    status: 'Active' | 'Paused' | 'Inactive';
    tier: 'T1 (Low)' | 'T2 (Medium)' | 'T3 (High)';
    consumed: number;
    budgetLimit: number | null;
    ceedBreakdown: CEEDBreakdown;
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
        ceedBreakdown: {
            entity: 50000,
            capability: 40000,
            execution: 40000,
            dataFlow: 20000,
        },
        agents: [
            { id: 'a1', name: 'Invoice Classifier', type: 'Orchestrator', model: 'GPT-4 Turbo', intelligenceTier: 'HIGH INTELLIGENCE', consumed: 80000, budgetLimit: null, icon: 'brain' },
            { id: 'a2', name: 'Data Extractor', type: 'Worker', model: 'Claude 3.5 Sonnet', intelligenceTier: 'HIGH INTELLIGENCE', consumed: 60000, budgetLimit: null, icon: 'database' },
            { id: 'a3', name: 'Validation Bot', type: 'Specialist', model: 'GPT-3.5 Turbo', intelligenceTier: 'STANDARD INTELLIGENCE', consumed: 10000, budgetLimit: null, icon: 'bot' },
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
        ceedBreakdown: {
            entity: 30000,
            capability: 25000,
            execution: 20000,
            dataFlow: 10000,
        },
        agents: [
            { id: 'a4', name: 'Approval Agent', type: 'Worker', model: 'GPT-4 Turbo', intelligenceTier: 'HIGH INTELLIGENCE', consumed: 85000, budgetLimit: 100000, icon: 'brain' },
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
        ceedBreakdown: {
            entity: 15000,
            capability: 12000,
            execution: 10000,
            dataFlow: 8000,
        },
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
        ceedBreakdown: {
            entity: 18000,
            capability: 12000,
            execution: 10000,
            dataFlow: 5000,
        },
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

const getAgentTypeColor = (type: string): string => {
    switch (type) {
        case 'Orchestrator':
            return 'text-purple-600 dark:text-purple-400';
        case 'Worker':
            return 'text-blue-600 dark:text-blue-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
};

const getAgentIcon = (icon: string) => {
    switch (icon) {
        case 'brain':
            return <Brain className="size-4 text-purple-600 dark:text-purple-400" />;
        case 'database':
            return <Database className="size-4 text-blue-600 dark:text-blue-400" />;
        case 'bot':
            return <Bot className="size-4 text-gray-600 dark:text-gray-400" />;
        default:
            return <Bot className="size-4 text-gray-600 dark:text-gray-400" />;
    }
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

// CEED Card Component
const CEEDCard: React.FC<{ label: string; value: number; dotColor: string }> = ({ label, value, dotColor }) => (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{formatNumber(value)}</span>
    </div>
);

// Inline Budget Edit Component
const InlineBudgetEdit: React.FC<{
    currentBudget: number | null;
    onSave: (newBudget: number | null) => void;
    onCancel: () => void;
}> = ({ currentBudget, onSave, onCancel }) => {
    const [value, setValue] = useState<string>(currentBudget?.toString() || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSave = () => {
        const numValue = value.trim() === '' ? null : parseInt(value, 10);
        onSave(numValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={handleKeyDown}
                placeholder="Unlimited"
                className="w-24 px-2 py-1 text-sm font-mono text-right border border-purple-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
                type="button"
                onClick={handleSave}
                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                aria-label="Save"
            >
                <Check className="size-4 text-green-600" />
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                aria-label="Cancel"
            >
                <X className="size-4 text-red-600" />
            </button>
        </div>
    );
};

// Workflow Row Component
const WorkflowRow: React.FC<{
    workflow: Workflow;
    isExpanded: boolean;
    onToggle: () => void;
    onBudgetChange: (workflowId: string, newBudget: number | null) => void;
    onAgentBudgetChange: (workflowId: string, agentId: string, newBudget: number | null) => void;
}> = ({ workflow, isExpanded, onToggle, onBudgetChange, onAgentBudgetChange }) => {
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
    const utilization = getUtilization(workflow.consumed, workflow.budgetLimit);

    return (
        <>
            <tr
                className={cn(
                    'border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors',
                    isExpanded ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
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
                            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md w-fit',
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
                    {isEditingBudget ? (
                        <InlineBudgetEdit
                            currentBudget={workflow.budgetLimit}
                            onSave={(newBudget) => {
                                onBudgetChange(workflow.id, newBudget);
                                setIsEditingBudget(false);
                            }}
                            onCancel={() => setIsEditingBudget(false)}
                        />
                    ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                            {workflow.budgetLimit !== null ? formatNumber(workflow.budgetLimit) : 'Unlimited'}
                        </span>
                    )}
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
                            setIsEditingBudget(true);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Edit budget"
                    >
                        <SlidersHorizontal className="size-4 text-gray-500 dark:text-gray-400" />
                    </button>
                </td>
            </tr>

            {/* Expanded Section */}
            {isExpanded && (
                <tr>
                    <td colSpan={6} className="p-0">
                        <div className="border-l-4 border-l-purple-600 bg-white dark:bg-gray-900">
                            {/* iFlow Profile Summary */}
                            <div className="px-6 py-5">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Text Area */}
                                    <div className="flex-shrink-0 lg:w-64">
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            IFLOW PROFILE SUMMARY
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Detailed credit breakdown based on CEED methodology.
                                        </p>
                                    </div>

                                    {/* Right: CEED Grid */}
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <CEEDCard label="Entity" value={workflow.ceedBreakdown.entity} dotColor="bg-blue-500" />
                                        <CEEDCard label="Capability" value={workflow.ceedBreakdown.capability} dotColor="bg-teal-500" />
                                        <CEEDCard label="Execution" value={workflow.ceedBreakdown.execution} dotColor="bg-green-500" />
                                        <CEEDCard label="Data Flow" value={workflow.ceedBreakdown.dataFlow} dotColor="bg-purple-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-700" />

                            {/* Agent Architecture */}
                            {workflow.agents.length > 0 && (
                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Bot className="size-4 text-gray-500" />
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            AGENT ARCHITECTURE
                                        </h4>
                                    </div>

                                    {/* Agent Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left">
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Agent</th>
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Model & API Tier</th>
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Consumed</th>
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Budget</th>
                                                    <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Utilization</th>
                                                    <th className="py-2 px-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {workflow.agents.map((agent) => {
                                                    const agentUtilization = getUtilization(agent.consumed, agent.budgetLimit);
                                                    return (
                                                        <tr key={agent.id} className="border-t border-gray-100 dark:border-gray-800">
                                                            <td className="py-3 px-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800">
                                                                        {getAgentIcon(agent.icon)}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {agent.name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={cn('text-sm font-medium', getAgentTypeColor(agent.type))}>
                                                                    {agent.type}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 w-fit">
                                                                        {agent.model}
                                                                    </span>
                                                                    <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                                                                        {agent.intelligenceTier}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3 text-right">
                                                                <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                                                    {formatNumber(agent.consumed)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-right">
                                                                {editingAgentId === agent.id ? (
                                                                    <InlineBudgetEdit
                                                                        currentBudget={agent.budgetLimit}
                                                                        onSave={(newBudget) => {
                                                                            onAgentBudgetChange(workflow.id, agent.id, newBudget);
                                                                            setEditingAgentId(null);
                                                                        }}
                                                                        onCancel={() => setEditingAgentId(null)}
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                        {agent.budgetLimit !== null ? formatNumber(agent.budgetLimit) : 'Unlimited'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3 text-center">
                                                                {agentUtilization !== null ? (
                                                                    <UtilizationBar utilization={agentUtilization} />
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingAgentId(agent.id);
                                                                    }}
                                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                                    aria-label="Edit agent budget"
                                                                >
                                                                    <SlidersHorizontal className="size-4 text-gray-400" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
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
    const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);

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

    const handleWorkflowBudgetChange = (workflowId: string, newBudget: number | null) => {
        setWorkflows((prev) =>
            prev.map((wf) =>
                wf.id === workflowId ? { ...wf, budgetLimit: newBudget } : wf
            )
        );
    };

    const handleAgentBudgetChange = (workflowId: string, agentId: string, newBudget: number | null) => {
        setWorkflows((prev) =>
            prev.map((wf) =>
                wf.id === workflowId
                    ? {
                          ...wf,
                          agents: wf.agents.map((agent) =>
                              agent.id === agentId ? { ...agent, budgetLimit: newBudget } : agent
                          ),
                      }
                    : wf
            )
        );
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
                                        
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {workflows.map((workflow) => (
                                    <WorkflowRow
                                        key={workflow.id}
                                        workflow={workflow}
                                        isExpanded={expandedRows.has(workflow.id)}
                                        onToggle={() => toggleRow(workflow.id)}
                                        onBudgetChange={handleWorkflowBudgetChange}
                                        onAgentBudgetChange={handleAgentBudgetChange}
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
