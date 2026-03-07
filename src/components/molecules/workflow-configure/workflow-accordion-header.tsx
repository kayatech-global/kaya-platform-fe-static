import { getFieldLabel } from '@/utils/field-label-converter';
import React from 'react';

interface IWorkflowAccordionHeader {
    id: string;
    name: string;
    type: string;
    fieldCount: number;
    toggleAccordion: (id: string) => void;
    isOpen: boolean;
    configuredCount: number;
    hasErrors: boolean;
}

export const WorkflowAccordionHeader = ({
    id,
    name,
    type,
    fieldCount,
    toggleAccordion,
    isOpen,
    hasErrors,
    configuredCount,
}: IWorkflowAccordionHeader) => {
    return (
        <button
            type="button"
            onClick={() => toggleAccordion(id)}
            className="w-full flex items-center justify-between px-2 py-1 bg-blue-100 dark:bg-gray-800 hover:bg-blue-200 dark:hover:bg-gray-750 transition-colors"
        >
            <div className="flex items-center gap-1 py-1">
                {/* Chevron */}
                <i
                    className={`ri-arrow-${isOpen ? 'down' : 'right'}-s-line 
            text-gray-600 dark:text-gray-400 transition-transform`}
                />
                <div className="h-6 flex items-center gap-2">
                    {/* Type badge */}
                    <div className="w-fit text-xs px-2 py-0.5 rounded-lg bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                        {getFieldLabel(type)}
                    </div>

                    {/* Main title */}
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-[2px]">{name}</span>
                </div>
                <span className="text-gray-400 pl-4 font-light">|</span>
                <div className="flex items-center gap-1">
                    {/* Dot */}
                    <span
                        className={`
            text-lg
            ${(() => {
                if (hasErrors) return 'text-red-500';
                if (configuredCount === fieldCount) return 'text-green-600';
                return 'text-gray-700 dark:text-gray-600';
            })()}
        `}
                    >
                        •
                    </span>

                    {/* Progress */}
                    <span className="text-xs text-gray-700 dark:text-gray-400">
                        {configuredCount}/{fieldCount} configured
                    </span>
                </div>
            </div>
        </button>
    );
};
