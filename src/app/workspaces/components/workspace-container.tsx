'use client';

import { useWorkspaceContainer } from '@/hooks/use-workspace-container';
import React, { useRef, useState } from 'react';
import WorkspaceListHeader from './workspace-list-header';
import WorkspaceCardList from './workspace-card-list';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { Button } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import WorkspaceContainerSkeleton from './workspace-container-skeleton';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { Globe, Info, Layers, AlertTriangle, UserPlus } from 'lucide-react';

const activityData = [
    {
        title: 'New Workspace Added',
        date: '07 Dec 2024',
        colorCode: ActivityColorCode.Purple,
        description: (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Adam Berry added a new Workspace called{' '}
                <span style={{ color: ActivityColorCode.Purple }}>Human Resource KAYA</span>
            </p>
        ),
    },
    {
        title: 'Workspace Modified',
        date: '06 Dec 2024',
        colorCode: ActivityColorCode.Amber,
        description: (
            <p className="text-sm font-medium text-gray-500">
                Adam Berry updated the Workspace{' '}
                <span style={{ color: ActivityColorCode.Amber }}>Project Collaboration Hub</span>
            </p>
        ),
    },
];

const WorkspaceContainer = () => {
    const metricPageRef = useRef<HTMLDivElement | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [metricPageHeighInDrawer, setMetricPageHeighInDrawer] = useState<number | undefined>(undefined);

    const {
        fetchingEnvironment,
        environmentData,
        workspaces,
        page,
        totalPages,
        isFetching,
        isSuccess,
        metadata,
        metadataOption,
        openNewWorkspaceForm,
        workspaceId,
        fetchingMetadata,
        hasFilters,
        setMetadataOption,
        setWorkspaceId,
        setOpenNewWorkspaceForm,
        onHandleDelete,
        onFilter,
        onPageUpdate,
        refetchEnvironment,
        refetchMetadata,
    } = useWorkspaceContainer();
    const { isMobile } = useBreakpoint();

    const handleClick = () => {
        setMetricPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleEdit = (workspaceId: number | string) => {
        setWorkspaceId(workspaceId);
        setOpenNewWorkspaceForm(true);
    };

    if (!isSuccess || fetchingEnvironment || fetchingMetadata) {
        return <WorkspaceContainerSkeleton />;
    }

    // Mock governance stats - in production these would come from an API
    const governanceStats = {
        totalWorkspaces: workspaces?.length || 0,
        policyViolations: 2,
        pendingAccessRequests: 5,
    };

    return (
        <React.Fragment>
            {/* Governance Overview Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-6">
                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Workspaces</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{governanceStats.totalWorkspaces}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Policy Violations</span>
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{governanceStats.policyViolations}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <UserPlus size={16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Pending Access</span>
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{governanceStats.pendingAccessRequests}</span>
                        </div>
                    </div>
                </div>

                {/* Right side: Recent Activities & Environment */}
                <div className="flex items-center gap-4">
                    <Button variant={'link'} size={'sm'} onClick={handleClick}>
                        Recent Activities
                    </Button>
                    <span className="flex items-center gap-1 bg-blue-100 rounded-sm py-1 px-4">
                        {environmentData?.isValid ? (
                            <>
                                <Globe size={16} className="text-blue-600 dark:text-blue-600" />
                                <span className="flex items-center gap-1 text-xs font-normal text-blue-600 dark:text-blue-600 mt-[1px]">
                                    <span>Current environment:</span>
                                    <span className="font-bold">{environmentData?.data}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <Info size={16} className="text-blue-600 dark:text-blue-600" />
                                <span className="text-xs font-normal text-blue-600 dark:text-blue-600 mt-[1px]">
                                    No environment has been configured
                                </span>
                            </>
                        )}
                    </span>
                </div>
            </div>
            <div ref={metricPageRef} className="realms-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div className={cn('realm-container flex flex-col gap-y-9 w-[972px]', { 'w-full px-4': isMobile })}>
                        <div>
                            <WorkspaceListHeader
                                metadataOption={metadataOption}
                                openNewWorkspaceForm={openNewWorkspaceForm}
                                setOpenNewWorkspaceForm={setOpenNewWorkspaceForm}
                                workspaceId={workspaceId}
                                metadataCollection={metadata}
                                setWorkspaceId={setWorkspaceId}
                                setMetadataOption={setMetadataOption}
                                onFilter={onFilter}
                                onPageUpdate={onPageUpdate}
                                refetchEnvironment={refetchEnvironment}
                                refetchMetadata={refetchMetadata}
                            />
                            <WorkspaceCardList
                                metadataOption={metadataOption}
                                data={workspaces}
                                page={page}
                                totalPages={totalPages}
                                isFetching={isFetching}
                                isSuccess={isSuccess}
                                hasFilters={hasFilters}
                                onNext={() => onPageUpdate(page + 1)}
                                onPrevious={() => onPageUpdate(page - 1)}
                                onHandleDelete={(workspaceId: number | string) => onHandleDelete(workspaceId)}
                                onHandleEdit={(workspaceId: number | string) => handleEdit(workspaceId)}
                            />
                        </div>
                    </div>
                </div>
            </div>{' '}
            {/* Recent activities will be shown in the below drawer on small screens */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed data={activityData} activityBodyHeight={metricPageHeighInDrawer} />
                    </div>
                }
            />
        </React.Fragment>
    );
};

export default WorkspaceContainer;
