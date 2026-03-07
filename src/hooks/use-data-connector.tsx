import { ActivityProps, DashboardDataCardProps } from '@/components';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { Unplug, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Total Connectors',
        value: 78,
        description: 'Connectors in last 7 days',
        trendValue: 72,
        trendColor: 'green-500',
        Icon: Unplug,
        TrendIcon: TrendingUp,
    },
    {
        title: 'Connectors On GCP',
        value: 50,
        description: 'Connectors on GCP in last 7 d..',
        trendValue: 7,
        trendColor: 'green-500',
        Icon: Unplug,
        TrendIcon: TrendingUp,
    },
    {
        title: 'Connectors On Azure',
        value: 13,
        description: 'Connectors on Azure in last..',
        trendValue: 7,
        trendColor: 'green-500',
        Icon: Unplug,
        TrendIcon: TrendingUp,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Data Connector Added',
        date: '07 Dec 2024',
        colorCode: ActivityColorCode.Purple,
        description: (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Adam Berry added a new data connector on{' '}
                <span style={{ color: ActivityColorCode.Purple }}>GCP Bucket</span>
            </p>
        ),
    },
    {
        title: 'Data Connector Modified',
        date: '06 Dec 2024',
        colorCode: ActivityColorCode.Amber,
        description: (
            <p className="text-sm font-medium text-gray-500">
                Adam Berry updated the data connector{' '}
                <span style={{ color: ActivityColorCode.Amber }}>CITI Workflow</span>
            </p>
        ),
    },
];

export const useDataConnector = () => {
    const [dataConnectorDataCardInfo] = useState<DashboardDataCardProps[]>(
        initWorkspaceDataCardInfo
    );

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onDataConnectorFilter = (filter: unknown) => {
        console.log(filter);
    };

    return {
        dataConnectorDataCardInfo,
        activityData,
        isFetching: false,
        bottomRef: ref,
        onDataConnectorFilter,
    };
};
