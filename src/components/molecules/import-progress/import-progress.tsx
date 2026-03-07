'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/atoms/progress';

type ImportProgressProps = {
    className?: string;
    title?: string; // e.g., "Importing..."
    subtitle?: string; // optional small helper text
    progress?: number; // 0-100
    gifSrc?: string; // public path to gif
    completedGifSrc?: string; // public path to gif shown at 100%
    titleClassName?: string; // custom styles for title (e.g., success color)
    isError?: boolean; // if true, show error state
    isWarning?: boolean; // if true, show warning state (e.g., all duplicates)
};

export function ImportProgress({
    className,
    title = 'Importing...',
    subtitle,
    progress = 0,
    gifSrc = '/png/download_blue.gif',
    completedGifSrc = '/png/completed.gif',
    titleClassName,
    isError,
    isWarning,
}: Readonly<ImportProgressProps>) {
    const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const isCompleted = safeProgress >= 100;
    const displayGif = isCompleted ? completedGifSrc || gifSrc : gifSrc;
    return (
        <div className={cn('w-full max-w-xl mx-auto text-center', className)}>
            <div className="flex flex-col items-center gap-2">
                <Image
                    src={(() => {
                        if (isError || isWarning) return '/png/error.gif';
                        return displayGif;
                    })()}
                    alt={isCompleted ? 'Completed' : 'Importing'}
                    width={150}
                    height={150}
                    priority
                />
                <div className="space-y-1">
                    <div className={cn('text-base font-semibold', isError ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-gray-100', !isError && titleClassName)}>
                        {isError ? 'An unexpected error occurred' : title}
                    </div>
                    {subtitle && !isError && <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
                </div>
                {safeProgress < 100 && !isError && (
                    <div className="w-full">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                            <span>Progress</span>
                            <span>{safeProgress}%</span>
                        </div>
                        <Progress value={safeProgress} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImportProgress;
