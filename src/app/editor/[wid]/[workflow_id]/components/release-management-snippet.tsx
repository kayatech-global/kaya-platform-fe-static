'use client';

import React, { useState } from 'react';
import {
    Button,
    Badge,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/atoms';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronUp,
    Package,
    FileJson,
    Link2,
    FileCode,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ExternalLink,
    GitBranch,
    History,
} from 'lucide-react';

interface ReleaseStep {
    id: string;
    label: string;
    description: string;
    status: 'complete' | 'pending' | 'warning' | 'current';
    icon: React.ReactNode;
}

interface ReleaseManagementSnippetProps {
    hasA2AConfig?: boolean;
    hasExternalAgents?: boolean;
    onBeginRelease?: () => void;
    onViewHistory?: () => void;
}

export const ReleaseManagementSnippet = ({
    hasA2AConfig = false,
    hasExternalAgents = false,
    onBeginRelease,
    onViewHistory,
}: ReleaseManagementSnippetProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

    // Determine release steps based on configuration
    const releaseSteps: ReleaseStep[] = [
        {
            id: 'agent-card',
            label: 'Agent Card Snapshot',
            description: 'Capture current A2A identity configuration and skill mappings',
            status: hasA2AConfig ? 'complete' : 'pending',
            icon: <FileJson className="w-3 h-3" />,
        },
        {
            id: 'external-agents',
            label: 'External Agent Configs',
            description: 'Bundle external agent connections and authentication settings',
            status: hasExternalAgents ? 'complete' : 'pending',
            icon: <Link2 className="w-3 h-3" />,
        },
        {
            id: 'diff-review',
            label: 'Diff Review',
            description: 'Review changes between current and previous release',
            status: 'current',
            icon: <FileCode className="w-3 h-3" />,
        },
        {
            id: 'validation',
            label: 'Schema Validation',
            description: 'Validate A2A schema compatibility and credential references',
            status: hasA2AConfig || hasExternalAgents ? 'pending' : 'complete',
            icon: <CheckCircle2 className="w-3 h-3" />,
        },
        {
            id: 'publish',
            label: 'Publish Package',
            description: 'Create versioned release package with all configurations',
            status: 'pending',
            icon: <Package className="w-3 h-3" />,
        },
    ];

    const completedSteps = releaseSteps.filter(s => s.status === 'complete').length;
    const hasWarnings = releaseSteps.some(s => s.status === 'warning');
    const progress = Math.round((completedSteps / releaseSteps.length) * 100);

    const getStatusColor = (status: ReleaseStep['status']) => {
        switch (status) {
            case 'complete':
                return 'text-green-400';
            case 'pending':
                return 'text-gray-400';
            case 'warning':
                return 'text-amber-400';
            case 'current':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBg = (status: ReleaseStep['status']) => {
        switch (status) {
            case 'complete':
                return 'bg-green-500/10';
            case 'pending':
                return 'bg-gray-500/10';
            case 'warning':
                return 'bg-amber-500/10';
            case 'current':
                return 'bg-blue-500/10';
            default:
                return 'bg-gray-500/10';
        }
    };

    const toggleStep = (stepId: string) => {
        setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-violet-500/10 hover:from-blue-500/20 hover:to-violet-500/20 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Release Package</span>
                    {hasWarnings && (
                        <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30"
                        >
                            Action Required
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 flex flex-col gap-3">
                    {/* Info banner */}
                    <div className="flex items-start gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <GitBranch className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                Release Management
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                                Agent Cards and External Agent configurations are bundled into workflow release packages with diff and validation steps.
                            </span>
                        </div>
                    </div>

                    {/* Release steps */}
                    <div className="flex flex-col gap-1">
                        {releaseSteps.map((step, index) => (
                            <Collapsible
                                key={step.id}
                                open={expandedSteps[step.id]}
                                onOpenChange={() => toggleStep(step.id)}
                            >
                                <CollapsibleTrigger className="w-full">
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                                            'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                                            expandedSteps[step.id] && 'bg-gray-50 dark:bg-gray-800/50'
                                        )}
                                    >
                                        {/* Status indicator */}
                                        <div
                                            className={cn(
                                                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                                                getStatusBg(step.status)
                                            )}
                                        >
                                            <span className={cn(getStatusColor(step.status))}>{step.icon}</span>
                                        </div>

                                        {/* Step info */}
                                        <div className="flex-1 text-left">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                {step.label}
                                            </span>
                                        </div>

                                        {/* Status badge */}
                                        <div className="flex items-center gap-1">
                                            {step.status === 'complete' && (
                                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                            )}
                                            {step.status === 'pending' && <Clock className="w-3 h-3 text-gray-400" />}
                                            {step.status === 'warning' && (
                                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                            )}
                                            {step.status === 'current' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                            )}
                                            <ChevronDown
                                                className={cn(
                                                    'w-3 h-3 text-gray-400 transition-transform',
                                                    expandedSteps[step.id] && 'rotate-180'
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="ml-7 pl-2 pr-2 pb-2 border-l-2 border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                                            {step.description}
                                        </p>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>

                    {/* Mock diff preview (collapsed by default) */}
                    {(hasA2AConfig || hasExternalAgents) && (
                        <div className="p-2 bg-gray-900 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-gray-400">agent.json</span>
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    +3 -1
                                </Badge>
                            </div>
                            <div className="text-[10px] font-mono leading-relaxed">
                                <div className="text-green-400">+ &quot;skills&quot;: [&quot;data_analysis&quot;, ...]</div>
                                <div className="text-green-400">+ &quot;streaming&quot;: true</div>
                                <div className="text-red-400">- &quot;version&quot;: &quot;0.9.0&quot;</div>
                                <div className="text-green-400">+ &quot;version&quot;: &quot;1.0.0&quot;</div>
                            </div>
                        </div>
                    )}

                    {/* Action required banner */}
                    {hasWarnings && (
                        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="text-[10px] text-amber-300">
                                Some steps require attention before release
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7 gap-1"
                            onClick={onViewHistory}
                        >
                            <History className="w-3 h-3" />
                            History
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 text-xs h-7 gap-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
                                        onClick={onBeginRelease}
                                    >
                                        <Package className="w-3 h-3" />
                                        Begin Release
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Start the release packaging workflow
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReleaseManagementSnippet;
