'use client';

import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import DashboardDataCardList from '@/components/molecules/dashboard-card-list/dashboard-data-card-list';
import { DataWorkflowModuleData, DataWorkflowModuleTableContainer } from './data-workflow-module-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useDataWorkflowModule } from '@/hooks/use-data-workflow-module';

const mockTableData: DataWorkflowModuleData[] = [
    {
        id: '01',
        connectionName: 'User Login Verify',
        connectorSource: 'AWS',
        lastSync: 'AWS',
    },
    {
        id: '02',
        connectionName: 'Payment Gateway API',
        connectorSource: 'PayPal',
        lastSync: 'AWS',
    },
    {
        id: '03',
        connectionName: 'Product Inventory Sync',
        connectorSource: 'Shopify',
        lastSync: 'AWS',
    },
];

export const DataWorkflowModuleContainer = () => {
    const { dataWorkflowModuleDataCardInfo, activityData, bottomRef, onDataWorkflowModuleFilter } =
        useDataWorkflowModule();
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <DashboardDataCardList data={dataWorkflowModuleDataCardInfo} />
                        {/* This button will open recent activity drawer for small screens */}
                        <div className="w-full flex justify-end my-4">
                            <Button variant={'link'} size={'sm'} onClick={handleClick}>
                                Recent Activities
                            </Button>
                        </div>
                        <DataWorkflowModuleTableContainer
                            dataWorkflowModules={mockTableData}
                            onDataWorkflowModuleFilter={onDataWorkflowModuleFilter}
                        />
                    </div>
                </div>
            </div>
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
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={workflowAuthoringPageHeighInDrawer}
                        />
                    </div>
                }
            />
        </React.Fragment>
    );
};
