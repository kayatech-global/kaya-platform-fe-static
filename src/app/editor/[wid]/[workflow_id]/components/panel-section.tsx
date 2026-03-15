'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelSectionProps {
    title: string;
    isConfigured?: boolean;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * Collapsible section for the right-side editor panel.
 * Shows a green checkmark badge when the section is configured,
 * and a grey dot when it is empty/unconfigured.
 */
export const PanelSection = ({
    title,
    isConfigured = false,
    defaultOpen = false,
    children,
    className,
}: PanelSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn('border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden', className)}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-x-2 min-w-0">
                    {/* Status badge */}
                    {isConfigured ? (
                        <CheckCircle2
                            className="shrink-0 text-green-500"
                            size={14}
                            aria-label="Configured"
                        />
                    ) : (
                        <Circle
                            className="shrink-0 text-gray-300 dark:text-gray-600"
                            size={14}
                            aria-label="Not configured"
                        />
                    )}
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                        {title}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={cn(
                        'shrink-0 text-gray-400 transition-transform duration-200',
                        { 'rotate-180': isOpen }
                    )}
                />
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-3 pb-3 pt-3 bg-white dark:bg-gray-900">
                    {children}
                </div>
            )}
        </div>
    );
};
