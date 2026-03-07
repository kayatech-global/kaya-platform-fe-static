'use client';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

export interface ActivityProps {
    title: string;
    description: ReactNode;
    colorCode: ActivityColorCode;
    date: string;
}

const Activity = ({ title, description, colorCode, date }: ActivityProps) => {
    const { isMobile } = useBreakpoint();
    return (
        <div className="single_activity relative w-full flex gap-x-[10px] px-[3px] items-center">
            <div className="indicator-icon relative self-start mt-1 z-50">
                <div className="w-[18.39px] h-[18.39px] rounded-sm rotate-45 bg-gray-200 dark:bg-gray-600" />
                <div
                    style={{ backgroundColor: colorCode }}
                    className="w-[8.73px] h-[8.73px] rounded-sm rotate-45 absolute top-[4px] left-[5px]"
                />
            </div>
            <div className="activity-info flex gap-y-1 flex-col">
                <p className="activity-title text-md font-medium text-gray-700 dark:text-gray-100">{title}</p>
                <div className="activity-description flex items-end gap-x-8">
                    <div className={cn({ 'w-[280px]': !isMobile })}>{description}</div>
                    <p className="activity-date text-xs font-normal whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {date}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Activity;
