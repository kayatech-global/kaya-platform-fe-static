import { Spinner } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps {
    hasCards?: boolean;
    hasRecentActivity?: boolean;
}

export const PlatformConfigurationSuiteSkeleton = ({ hasCards = true, hasRecentActivity = true }: SkeletonProps) => {
    const { isMd, isSm, isMobile } = useBreakpoint();

    return (
        <div className="relative flex flex-col items-center justify-center h-[calc(100vh-160px)]">
            <div className="absolute z-50 flex items-center flex-col gap-y-2">
                <Spinner />
                <p>Analyzing Your Data</p>
                <p className="text-xs text-center text-gray-700 dark:text-gray-300 z-50 sm:w-[350px]">
                    Hang tight! We are analyzing the latest usage data to provide you with valuable insights
                </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-x-9 w-full h-full">
                <div className="flex flex-col w-full h-full gap-y-2 sm:gap-y-9">
                    {hasCards && (
                        <>
                            <div
                                className={cn('dashboard-data-card-list w-full flex gap-x-20', {
                                    'gap-x-4': isMd || isSm || isMobile,
                                })}
                            >
                                <div
                                    className={cn(
                                        'w-full dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                        'animate-pulse'
                                    )}
                                />
                                <div
                                    className={cn(
                                        'w-full dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 hidden sm:flex flex-col gap-y-[10px]',
                                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                        'animate-pulse'
                                    )}
                                />
                                <div
                                    className={cn(
                                        'w-full dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 hidden sm:flex flex-col gap-y-[10px]',
                                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                        'animate-pulse',
                                        { hidden: isMobile }
                                    )}
                                />
                            </div>
                            {hasRecentActivity && (
                                <div className="w-full flex justify-end">
                                    <span
                                        className={cn(
                                            'w-[150px] bg-[rgba(255,255,255,0.6)] h-[12px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col',
                                            'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                            'animate-pulse'
                                        )}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <div className="w-full h-full">
                        <div
                            className={cn(
                                'w-full h-full dashboard-data-card bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col',
                                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                'animate-pulse'
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
