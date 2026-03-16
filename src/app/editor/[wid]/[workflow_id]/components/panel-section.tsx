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
    /** Controlled mode: parent decides if this section is open */
    isOpen?: boolean;
    /** Controlled mode: parent handles toggle */
    onToggle?: () => void;
}

/**
 * Collapsible section for the right-side editor panel.
 * Supports both controlled (isOpen + onToggle) and uncontrolled (defaultOpen) modes.
 * Shows a green checkmark badge when configured, grey dot when empty.
 */
export const PanelSection = ({
    title,
    isConfigured = false,
    defaultOpen = false,
    children,
    className,
    isOpen: controlledIsOpen,
    onToggle,
}: PanelSectionProps) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : internalOpen;

    const handleToggle = () => {
        if (isControlled && onToggle) {
            onToggle();
        } else {
            setInternalOpen(prev => !prev);
        }
    };

    return (
        <div className={cn('border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shrink-0', className)}>
            {/* Trigger */}
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-x-2 min-w-0">
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

            {/* Content — max-h prevents expanded sections from dominating layout */}
            {isOpen && (
                <div className="px-3 pb-3 pt-3 bg-white dark:bg-gray-900 max-h-[50vh] overflow-y-auto">
                    {children}
                </div>
            )}
        </div>
    );
};
