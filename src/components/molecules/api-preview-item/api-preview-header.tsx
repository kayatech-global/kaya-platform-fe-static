'use client';

import React from 'react';
import { Button } from '@/components';
import { cn } from '@/lib/utils';

type ApiPreviewHeaderProps = {
    foundCount: number;
    selectedCount: number;
    testedCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    title?: string;
    className?: string;
};

export function ApiPreviewHeader({
    foundCount,
    selectedCount,
    testedCount,
    onSelectAll,
    onDeselectAll,
    title = 'API Preview',
    className,
}: Readonly<ApiPreviewHeaderProps>) {
    const disabled = foundCount === 0;
    return (
        <div
            className={cn(
                'grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800',
                className
            )}
        >
            <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Found {foundCount} API{foundCount !== 1 ? '(s)' : ''}
                    <span className="mx-2">•</span>
                    {selectedCount} selected
                    <span className="mx-2">•</span>
                    {testedCount} tested
                </p>
            </div>
            <div className="grid grid-flow-col auto-cols-max items-center gap-4">
                <Button type="button" variant="link" size="sm" onClick={onSelectAll} className="text-primary" disabled={disabled}>
                    Select All
                </Button>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={onDeselectAll}
                    className="text-muted-foreground hover:text-muted-foreground"
                    disabled={disabled}
                >
                    Deselect All
                </Button>
            </div>
        </div>
    );
}

export default ApiPreviewHeader;
