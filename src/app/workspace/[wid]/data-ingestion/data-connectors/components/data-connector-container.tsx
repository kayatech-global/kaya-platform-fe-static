'use client';

import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import DashboardDataCardList from '@/components/molecules/dashboard-card-list/dashboard-data-card-list';
import DataConnectorTable from './data-connector-table';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useDataConnector } from '@/hooks/use-data-connector';

const tableData = [
    {
        connectionName: 'Salesforce Integration',
        connectorSource: 'Salesforce',
        lastSync: '2025-01-08 10:45 AM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'Google Analytics Sync',
        connectorSource: 'Google Analytics',
        lastSync: '2025-01-07 09:30 PM',
        actionCol: 'View',
    },
    {
        connectionName: 'HubSpot Data Sync',
        connectorSource: 'HubSpot',
        lastSync: '2025-01-08 07:15 AM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'Stripe Transactions',
        connectorSource: 'Stripe',
        lastSync: '2025-01-06 03:20 PM',
        actionCol: 'Delete',
    },
    {
        connectionName: 'AWS S3 Backup',
        connectorSource: 'AWS S3',
        lastSync: '2025-01-08 05:45 PM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'Slack Message Logs',
        connectorSource: 'Slack',
        lastSync: '2025-01-05 11:00 AM',
        actionCol: 'View',
    },
    {
        connectionName: 'Zoom Meeting Sync',
        connectorSource: 'Zoom',
        lastSync: '2025-01-07 04:25 PM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'QuickBooks Financial Data',
        connectorSource: 'QuickBooks',
        lastSync: '2025-01-08 09:10 AM',
        actionCol: 'Delete',
    },
    {
        connectionName: 'Google Drive Backup',
        connectorSource: 'Google Drive',
        lastSync: '2025-01-06 01:45 PM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'Microsoft Teams Logs',
        connectorSource: 'Microsoft Teams',
        lastSync: '2025-01-07 08:00 PM',
        actionCol: 'View',
    },
    {
        connectionName: 'GitHub Repository Sync',
        connectorSource: 'GitHub',
        lastSync: '2025-01-08 02:30 PM',
        actionCol: 'Edit',
    },
    {
        connectionName: 'LinkedIn Ads Integration',
        connectorSource: 'LinkedIn Ads',
        lastSync: '2025-01-06 06:20 PM',
        actionCol: 'Delete',
    },
];

export const DataConnectorContainer = () => {
    const { dataConnectorDataCardInfo, activityData, bottomRef, onDataConnectorFilter } =
        useDataConnector();
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
                        <DashboardDataCardList data={dataConnectorDataCardInfo} />
                        {/* This button will open recent activity drawer for small screens */}
                        <div className="w-full flex justify-end my-4">
                            <Button variant={'link'} size={'sm'} onClick={handleClick}>
                                Recent Activities
                            </Button>
                        </div>
                        <DataConnectorTable data={tableData} onDataConnectorFilter={onDataConnectorFilter} />
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

export default DataConnectorContainer;
