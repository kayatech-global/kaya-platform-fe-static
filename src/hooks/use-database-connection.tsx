import { ActivityProps, DashboardDataCardProps } from '@/components';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Triggered',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Credits Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Unplug,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
    {
        title: 'Most credit consumed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Highest Tokens Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: TrendingDownIcon,
        showTrendIcon: true,
    },
    {
        title: 'Highest processing time',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Executed Most in Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Link,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Workflow Execution',
        description: 'Workflow Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Amber,
    },
    {
        title: 'API Execution',
        description: (
            <div>
                API Execution
                {' '}
                <span style={{ color: ActivityColorCode.Purple }}>AWS</span>
            </div>
        ),
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'LLM Execution',
        description: 'LLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export const useDatabaseConnection = () => {
    const [databaseConnectionDataCardInfo] = useState<DashboardDataCardProps[]>(
        initWorkspaceDataCardInfo
    );

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onDatabaseConnectionFilter = (filter: unknown) => {
        console.log(filter);
    };

    return {
        databaseConnectionDataCardInfo,
        activityData,
        isFetching: false,
        bottomRef: ref,
        onDatabaseConnectionFilter,
    };
};
