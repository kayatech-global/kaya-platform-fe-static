'use client';
import { Stats } from '@/app/workspace/[wid]/usage/types/types';
import { renderIcon } from '@/lib/utils';

import React from 'react';

interface DataVizCardProps {
    icon: React.ReactNode;
    title: string | React.ReactNode;
    subTitle?: string | React.ReactNode;
    stats?: Stats;
    chart: React.ReactNode;
    width?: number;
    height?: number;
}

const DataVizCard = ({ icon, title, subTitle, chart, width, height, stats }: DataVizCardProps) => {
    const defaultWidth = width ?? '100%';
    const defaultHeight = height ?? 'auto';

    return (
        <div
            style={{
                width: typeof width === 'number' ? `${defaultWidth}px` : defaultWidth,
                height: typeof height === 'number' ? `${defaultHeight}px` : defaultHeight,
            }}
            className="data-viz-card-header-container relative flex flex-col gap-y-3 px-4 py-3 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
            <div className="data-viz-card-header flex gap-x-2 flex-start">
                <div className="w-6 h-6 bg-blue-100 flex items-center justify-center rounded-full dark:bg-[rgba(49,111,237,0.3)]">
                    {renderIcon(icon, 12, 'text-blue-600 text-xs w-3')}
                </div>
                <div className="w-full">
                    {typeof title === 'string' ? (
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{title}</p>
                    ) : (
                        <div className="data-viz-card-node w-full">{title}</div>
                    )}
                    {subTitle && typeof subTitle === 'string' ? (
                        <p className="text-xs font-normal text-gray-600 dark:text-gray-400">{subTitle}</p>
                    ) : (
                        <div className="data-viz-card-node-subtitle w-full">{subTitle}</div>
                    )}
                </div>
            </div>
            {stats && (
                <div className="chart-stats pl-8 pb-2">
                    <p className="text-gray-800 text-d-sm font-semibold dark:text-gray-300">{stats.value}</p>
                    <p className="text-gray-600 text-xs font-normal dark:text-gray-400">{stats.statsSubHeading}</p>
                </div>
            )}
            <div className="data-viz-card-chart-container">
                <div>{chart}</div>
            </div>
        </div>
    );
};

export default DataVizCard;
