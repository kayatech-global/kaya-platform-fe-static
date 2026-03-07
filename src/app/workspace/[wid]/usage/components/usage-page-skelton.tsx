import { Spinner } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React from 'react';

export const UsagePageSkelton = () => {
    const { isXl, isLg, isMd, isSm, isXxLg, isMobile } = useBreakpoint();
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="absolute z-50 flex items-center flex-col gap-y-2">
                <Spinner />
                <p>Analyzing Your Data</p>
                <p className="text-xs text-center text-gray-700 dark:text-gray-300 z-50 w-[350px]">
                    Hang tight! We are analyzing the latest usage data to provide you with valuable insights
                </p>
            </div>

            <div
                className={cn('dashboard-data-card-list w-full flex justify-between', {
                    'gap-x-4': isMd || isSm || isMobile,
                })}
            >
                <div
                    className={cn(
                        'w-[308px] dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse'
                    )}
                />
                <div
                    className={cn(
                        'w-[308px] dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse'
                    )}
                />
                <div
                    className={cn(
                        'w-[308px] dashboard-data-card bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse',
                        { hidden: isMobile }
                    )}
                />
            </div>
            <div className={cn('flex mt-9 items-center gap-x-3 w-full')}>
                <div
                    className={cn(
                        'h-[365px] dashboard-data-card bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse',
                        {
                            'w-[418px]': isXxLg,
                            'w-[350px]': isXl,
                            'w-[320px]': isLg,
                            'w-[420px]': isMd,
                            'w-full': isMobile,
                        }
                    )}
                />
                <div
                    className={cn(
                        'h-[365px] dashboard-data-card bg-[rgba(255,255,255,0.6)]  rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse',
                        {
                            'w-[418px]': !isXl,
                            'w-[350px]': isXl,
                            'w-[320px]': isLg,
                            'w-[420px]': isMd,
                            hidden: isSm || isMobile,
                        }
                    )}
                />
                <div
                    className={cn(
                        'h-[365px] dashboard-data-card bg-[rgba(255,255,255,0.6)]  rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse',
                        { 'w-[418px]': !isXl, 'w-[350px]': isXl, 'w-[320px]': isLg, hidden: isMd || isMobile }
                    )}
                />
            </div>
            <div className="flex mt-9 items-center gap-x-3 w-full">
                <div
                    className={cn(
                        'w-full h-[240px] dashboard-data-card bg-[rgba(255,255,255,0.6)]  rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                        'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                        'animate-pulse'
                    )}
                />
            </div>
        </div>
    );
};
