'use client';

import React from 'react';
import { Button } from '@/components/atoms/button';
import {
    RiBarChart2Line,
    RiAlertLine,
    RiSettings3Line,
    RiLineChartLine,
    RiFlashlightLine,
    RiTeamLine,
    RiPulseLine,
    RiMoneyDollarCircleLine,
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { PlatformContext } from './use-assistant-context';

interface QuickActionsProps {
    context: PlatformContext;
    onActionClick: (action: string) => void;
}

interface QuickAction {
    icon: React.ElementType;
    label: string;
    action: string;
    color: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ context, onActionClick }) => {
    const getQuickActions = (): QuickAction[] => {
        switch (context.level) {
            case 'enterprise':
                return [
                    {
                        icon: RiTeamLine,
                        label: 'Workspace Overview',
                        action: 'Show me a summary of all my workspaces and their current status',
                        color: 'blue',
                    },
                    {
                        icon: RiMoneyDollarCircleLine,
                        label: 'Usage & Costs',
                        action: 'What are my current usage levels and costs across the platform?',
                        color: 'green',
                    },
                    {
                        icon: RiAlertLine,
                        label: 'Recent Issues',
                        action: 'Show me any recent errors or issues across all workspaces',
                        color: 'red',
                    },
                    {
                        icon: RiLineChartLine,
                        label: 'Performance Trends',
                        action: 'Analyze performance trends across my enterprise',
                        color: 'purple',
                    },
                ];

            case 'workspace':
                return [
                    {
                        icon: RiPulseLine,
                        label: 'Workflow Status',
                        action: 'Show me the status of all workflows in this workspace',
                        color: 'blue',
                    },
                    {
                        icon: RiAlertLine,
                        label: 'Recent Failures',
                        action: 'Which workflows failed in the last 24 hours and why?',
                        color: 'red',
                    },
                    {
                        icon: RiBarChart2Line,
                        label: 'Usage Analytics',
                        action: 'Show me usage statistics and costs for this workspace',
                        color: 'green',
                    },
                    {
                        icon: RiFlashlightLine,
                        label: 'Optimize Performance',
                        action: 'Suggest ways to optimize performance and reduce costs',
                        color: 'orange',
                    },
                ];

            case 'workflow':
                return [
                    {
                        icon: RiPulseLine,
                        label: 'Execution Analysis',
                        action: 'Analyze the performance of recent executions for this workflow',
                        color: 'blue',
                    },
                    {
                        icon: RiAlertLine,
                        label: 'Debug Issues',
                        action: 'Help me debug any configuration or execution issues',
                        color: 'red',
                    },
                    {
                        icon: RiSettings3Line,
                        label: 'Config Review',
                        action: 'Review my workflow configuration for potential improvements',
                        color: 'gray',
                    },
                    {
                        icon: RiLineChartLine,
                        label: 'Optimization Tips',
                        action: 'Suggest optimizations to improve speed and reduce costs',
                        color: 'green',
                    },
                ];

            case 'agent':
                return [
                    {
                        icon: RiSettings3Line,
                        label: 'Configuration Check',
                        action: 'Review my agent configuration and suggest improvements',
                        color: 'blue',
                    },
                    {
                        icon: RiBarChart2Line,
                        label: 'Performance Analysis',
                        action: "Analyze this agent's token usage and response times",
                        color: 'green',
                    },
                    {
                        icon: RiFlashlightLine,
                        label: 'Prompt Optimization',
                        action: 'Help me optimize my prompts for better performance',
                        color: 'orange',
                    },
                    {
                        icon: RiAlertLine,
                        label: 'Common Issues',
                        action: 'Check for common configuration issues and how to fix them',
                        color: 'red',
                    },
                ];

            default:
                return [];
        }
    };

    const actions = getQuickActions();

    if (actions.length === 0) return null;

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30';
            case 'green':
                return 'text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30';
            case 'red':
                return 'text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30';
            case 'orange':
                return 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/30';
            case 'purple':
                return 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 dark:hover:bg-purple-900/30';
            default:
                return 'text-gray-600 bg-gray-50 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700';
        }
    };

    return (
        <div className="px-4 pb-4 border-b dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Quick actions for {context.level === 'enterprise' ? 'your platform' : context.level}:
            </div>

            <div className="grid grid-cols-2 gap-2">
                {actions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => onActionClick(action.action)}
                            className={cn(
                                'h-auto p-3 flex flex-col gap-2 text-left items-start',
                                'border border-transparent hover:border-current',
                                'transition-all duration-200',
                                getColorClasses(action.color)
                            )}
                        >
                            <IconComponent className="h-5 w-5" />
                            <span className="text-xs font-medium leading-tight">{action.label}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};
