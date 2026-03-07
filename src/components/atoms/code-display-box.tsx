'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { CodeDisplayBoxVariant } from '@/enums/component-type';

type CodeDisplayBoxProps = {
    icon: LucideIcon;
    title: string;
    content: string;
    variant?: CodeDisplayBoxVariant;
    maxHeight?: string;
};

export const CodeDisplayBox = ({ icon: Icon, title, content, variant = CodeDisplayBoxVariant.Default, maxHeight = '150px' }: CodeDisplayBoxProps) => {
    const borderColor = (() => {
        if (variant === CodeDisplayBoxVariant.Primary) return 'border-blue-200 dark:border-blue-800';
        if (variant === CodeDisplayBoxVariant.Secondary) return 'border-gray-200 dark:border-gray-700';
        return 'border-gray-100 dark:border-gray-700';
    })();
    const iconColor = variant === CodeDisplayBoxVariant.Primary ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400';

    return (
        <div className={cn('bg-white dark:bg-gray-800 rounded-lg p-3 border shadow-sm', borderColor)}>
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={iconColor} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{title}</span>
            </div>
            <div className={cn('bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-100 dark:border-gray-700 overflow-y-auto')} style={{ maxHeight }}>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{content || 'No data available.'}</p>
            </div>
        </div>
    );
};
