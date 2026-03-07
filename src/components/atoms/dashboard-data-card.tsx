import { OverallUsageType } from '@/enums';
import { cn } from '@/lib/utils';
import React from 'react';

export interface DashboardDataCardProps {
    title: string | React.ReactNode;
    tooltipContent?: string;
    value: string | number | React.ReactNode;
    description: string;
    trendValue: string | number;
    trendColor: string;
    Icon: React.ElementType;
    TrendIcon: React.ElementType;
    showTrendIcon?: boolean;
    width?: number;
    type?: OverallUsageType;
    info?: string;
}

const DashboardDataCard: React.FC<DashboardDataCardProps> = ({
    title,
    value,
    description,
    trendValue,
    Icon,
    TrendIcon,
    showTrendIcon = true,
    trendColor,
    width,
}) => {
    return (
        <div
            style={{ width: width ? `${width}px` : '308px' }}
            className={cn(
                'dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700'
            )}
        >
            <div className="flex justify-between">
                <div className="flex flex-col gap-y-1">
                    {typeof title === 'string' ? (
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{title}</p>
                    ) : (
                        <div>{title}</div>
                    )}

                    {typeof value === 'string' || typeof value === 'number' ? (
                        <p className="text-d-md font-semibold text-gray-800 dark:text-gray-300">{value}</p>
                    ) : (
                        value
                    )}
                </div>
                <div className="w-[42px] h-[42px] bg-[rgba(49,111,237,0.3)] rounded-lg flex items-center justify-center dark:rgba(49,111,237,0.2)">
                    <Icon size={24} className="stroke-1 text-blue-700 dark:text-blue-600" />
                </div>
            </div>
            <div className="flex items-center gap-x-2" title={trendValue + ' ' + description}>
                {showTrendIcon && <TrendIcon size={24} className={cn(trendColor)} />}
                <p className="text-sm font-normal text-gray-700 dark:text-gray-300 truncate">
                    <span className={cn('jest-color text-sm font-medium pr-1', trendColor)}>{trendValue}</span>
                    {description}
                </p>
            </div>
        </div>
    );
};

export default DashboardDataCard;
