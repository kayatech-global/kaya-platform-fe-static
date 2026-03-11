'use client';

import { Spinner } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';

export const WorkspaceOverviewSkeleton = () => {
    const { isMd, isSm, isMobile } = useBreakpoint();

    const SkeletonCard = ({ className = '' }: { className?: string }) => (
        <div
            className={cn(
                'bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                'animate-pulse',
                className
            )}
        />
    );

    const SkeletonChart = ({ className = '', height = 'h-[300px]' }: { className?: string; height?: string }) => (
        <div
            className={cn(
                'bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200 p-6',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                'animate-pulse',
                height,
                className
            )}
        />
    );

    const SkeletonTile = () => (
        <div
            className={cn(
                'bg-[rgba(255,255,255,0.6)] h-[200px] rounded-lg backdrop-blur-[7px] border border-gray-200 p-4',
                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                'animate-pulse'
            )}
        />
    );

    return (
        <div className="relative flex flex-col h-[calc(100vh-160px)]">
            <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-y-2">
                    <Spinner />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loading Workspace Overview
                    </p>
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400 max-w-[300px]">
                        Gathering insights about your workspace health and performance
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-y-6 w-full opacity-30">
                {/* Header area with filter */}
                <div className="flex justify-between items-center">
                    <div className="h-8 w-[200px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-9 w-[150px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>

                {/* KPI Cards - 6 total (Workflows, Executions, Success Rate, Failed, Tokens, Health) */}
                <div
                    className={cn('grid gap-4', {
                        'grid-cols-1': isMobile,
                        'grid-cols-2': isSm,
                        'grid-cols-3': isMd,
                        'grid-cols-6': !isMobile && !isSm && !isMd,
                    })}
                >
                    <SkeletonCard />
                    <SkeletonCard className={cn({ hidden: isMobile })} />
                    <SkeletonCard className={cn({ hidden: isMobile || isSm })} />
                    <SkeletonCard className={cn({ hidden: isMobile || isSm || isMd })} />
                    <SkeletonCard className={cn({ hidden: isMobile || isSm || isMd })} />
                    <SkeletonCard className={cn({ hidden: isMobile || isSm || isMd })} />
                </div>

                {/* Charts Row */}
                <div
                    className={cn('grid gap-6', {
                        'grid-cols-1': isMobile || isSm,
                        'grid-cols-2': !isMobile && !isSm,
                    })}
                >
                    <SkeletonChart />
                    <SkeletonChart />
                </div>

                {/* Token Usage Chart */}
                <SkeletonChart height="h-[250px]" />

                {/* Recently Modified Workflows */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-6 w-[200px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-5 w-[120px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div
                        className={cn('grid gap-4', {
                            'grid-cols-1': isMobile,
                            'grid-cols-2': isSm,
                            'grid-cols-3': !isMobile && !isSm,
                        })}
                    >
                        <SkeletonTile />
                        <SkeletonTile />
                        <SkeletonTile />
                        <SkeletonTile className={cn({ hidden: isMobile || isSm })} />
                        <SkeletonTile className={cn({ hidden: isMobile || isSm })} />
                        <SkeletonTile className={cn({ hidden: isMobile || isSm })} />
                    </div>
                </div>
            </div>
        </div>
    );
};
