'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/atoms/button';
import { WorkflowTile } from './workflow-tile';
import { RecentlyModifiedWorkflow } from '../types/types';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { Workflow, Plus, ArrowRight } from 'lucide-react';

interface RecentlyModifiedWorkflowsProps {
    workflows: RecentlyModifiedWorkflow[];
    canViewTokenUsage: boolean;
}

export const RecentlyModifiedWorkflows: React.FC<RecentlyModifiedWorkflowsProps> = ({
    workflows,
    canViewTokenUsage,
}) => {
    const params = useParams();
    const workspaceId = params.wid as string;
    const { isMobile, isSm } = useBreakpoint();

    // Empty state when no workflows available
    if (!workflows || workflows.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Recently Modified Workflows
                    </h2>
                </div>
                <div
                    className={cn(
                        'flex flex-col items-center justify-center py-12 px-6',
                        'bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
                    )}
                >
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <Workflow size={28} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No workflows available in this workspace yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-[400px] mb-4">
                        Create your first workflow to get started with AI automation.
                    </p>
                    <Link href={`/workspace/${workspaceId}/workflows/workflow-authoring`}>
                        <Button variant="primary" leadingIcon={<Plus size={16} />}>
                            Create New Workflow
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Take only top 6 workflows
    const displayWorkflows = workflows.slice(0, 6);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <h2 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Recently Modified Workflows
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Top {displayWorkflows.length}
                    </span>
                </div>
                <Link href={`/workspace/${workspaceId}/workflows/workflow-authoring`}>
                    <Button variant="link" size="sm" trailingIcon={<ArrowRight size={14} />}>
                        View All Workflows
                    </Button>
                </Link>
            </div>

            {/* Tile Grid */}
            <div
                className={cn('grid gap-4', {
                    'grid-cols-1': isMobile,
                    'grid-cols-2': isSm && !isMobile,
                    'grid-cols-3': !isMobile && !isSm,
                })}
            >
                {displayWorkflows.map((workflow) => (
                    <WorkflowTile
                        key={workflow.id}
                        workflow={workflow}
                        canViewTokenUsage={canViewTokenUsage}
                    />
                ))}
            </div>

            </div>
    );
};
