'use client';

import React from 'react';
import { useWorkspaceOverview } from '../hooks/use-workspace-overview';
import { WorkspaceOverviewSkeleton } from './workspace-overview-skeleton';
import { WorkspaceOverviewHeader } from './workspace-overview-header';
import { WorkspaceOverviewKPICards } from './workspace-overview-kpi-cards';
import { RecentlyModifiedWorkflows } from './recently-modified-workflows';
import { WorkspaceOverviewEmptyState } from './workspace-overview-empty-state';

export const WorkspaceOverviewContainer = () => {
    const {
        isFetching,
        metrics,
        recentlyModifiedWorkflows,
        hasWorkflows,
        workspaceName,
        workspaceDescription,
        permissions,
    } = useWorkspaceOverview();

    if (isFetching) {
        return <WorkspaceOverviewSkeleton />;
    }

    // Empty state when no workflows exist
    if (!hasWorkflows) {
        return (
            <div className="flex flex-col gap-y-6 pt-16">
                <WorkspaceOverviewHeader
                    workspaceName={workspaceName}
                    workspaceDescription={workspaceDescription}
                />
                <WorkspaceOverviewEmptyState type="no-workflows" />
            </div>
        );
    }

    return (
        <div className="workspace-overview-container pt-16 pb-8">
            <div className="flex flex-col gap-y-6">
                {/* Header with breadcrumb */}
                <WorkspaceOverviewHeader
                    workspaceName={workspaceName}
                    workspaceDescription={workspaceDescription}
                />

                {/* Summary KPI Cards */}
                <WorkspaceOverviewKPICards
                    metrics={metrics}
                    permissions={permissions}
                />

                {/* Recently Modified Workflows Tile Grid */}
                <RecentlyModifiedWorkflows
                    workflows={recentlyModifiedWorkflows}
                    canViewTokenUsage={permissions.canViewTokenUsage}
                />
            </div>
        </div>
    );
};
