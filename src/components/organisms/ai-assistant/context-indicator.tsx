'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { SmallSpinner } from '@/components/atoms/spinner';
import { RiBuilding2Line, RiFolderLine, RiGitBranchLine, RiRobot2Line, RiMapPinLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { PlatformContext } from './use-assistant-context';

interface ContextIndicatorProps {
    context: PlatformContext | null;
    isLoading: boolean;
}

export const ContextIndicator: React.FC<ContextIndicatorProps> = ({ context, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <SmallSpinner classNames="relative right-auto h-3 w-3" />
                <span>Detecting context...</span>
            </div>
        );
    }

    if (!context) {
        return <div className="text-xs text-gray-500 dark:text-gray-400">Context unavailable</div>;
    }

    const getContextIcon = () => {
        switch (context.level) {
            case 'enterprise':
                return RiBuilding2Line;
            case 'workspace':
                return RiFolderLine;
            case 'workflow':
                return RiGitBranchLine;
            case 'agent':
                return RiRobot2Line;
            default:
                return RiMapPinLine;
        }
    };

    const getContextLabel = () => {
        switch (context.level) {
            case 'enterprise':
                return 'Enterprise';
            case 'workspace':
                return `${context.workspaceName || 'Workspace'}`;
            case 'workflow':
                return `${context.workflowName || 'Workflow'}`;
            case 'agent':
                return `${context.agentName || 'Agent'}`;
            default:
                return 'Unknown';
        }
    };

    const getContextColor = () => {
        switch (context.level) {
            case 'enterprise':
                return 'blue';
            case 'workspace':
                return 'green';
            case 'workflow':
                return 'purple';
            case 'agent':
                return 'orange';
            default:
                return 'gray';
        }
    };

    const IconComponent = getContextIcon();
    const color = getContextColor();

    return (
        <div className="flex items-center gap-2">
            <Badge
                variant="secondary"
                className={cn(
                    'text-xs px-2 py-0.5 flex items-center gap-1',
                    color === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                    color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    color === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                    color === 'orange' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                    color === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                )}
            >
                <IconComponent className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{getContextLabel()}</span>
            </Badge>

            {context.metadata?.section && typeof context.metadata.section === 'string' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                    {context.metadata.section}
                </span>
            )}
        </div>
    );
};
