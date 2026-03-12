'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components';

export const EnterpriseInsightsSkeleton = () => {
    const SkeletonCard = ({ className = '' }: { className?: string }) => (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
                'animate-pulse',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="mt-3 flex items-center gap-x-2">
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );

    const SkeletonChart = ({ className = '', height = 'h-[350px]' }: { className?: string; height?: string }) => (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
                'animate-pulse',
                height,
                className
            )}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                </div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="h-full flex items-end gap-x-2 pb-12">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t"
                        style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {/* Loading overlay */}
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F1F1F1]/80 dark:bg-[#2B3340]/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-y-3">
                    <Spinner />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Loading Enterprise Insights
                    </p>
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400 max-w-[300px]">
                        Aggregating platform-wide metrics and analytics
                    </p>
                </div>
            </div>

            {/* Skeleton content */}
            <div className="pt-6 pb-8 px-8 opacity-30">
                <div className="max-w-[1800px] mx-auto flex flex-col gap-y-6">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="space-y-1">
                                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-x-3">
                            <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* KPI Cards skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>

                    {/* Charts grid skeleton */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <SkeletonChart />
                        <SkeletonChart />
                    </div>

                    {/* Token usage skeleton */}
                    <SkeletonChart height="h-[280px]" />

                    {/* Bottom grid skeleton */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <SkeletonChart height="h-[380px]" />
                        <SkeletonChart height="h-[380px]" />
                    </div>
                </div>
            </div>
        </div>
    );
};
