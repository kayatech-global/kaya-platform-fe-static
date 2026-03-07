'use client';

import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

interface LoadingPlaceholderProps {
    text: string;
    className?: string;
    size?: number;
    width?: number;
    height?: number;
}

export const LoadingPlaceholder = ({
    text,
    className,
    size = 25,
    width = 25,
    height = 25,
}: LoadingPlaceholderProps) => {
    return (
        <div
            className={cn(
                'w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full',
                className
            )}
        >
            <LoaderCircle
                className="animate-spin"
                size={size}
                width={width}
                height={height}
                absoluteStrokeWidth={undefined}
            />
            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">{text}</p>
        </div>
    );
};
