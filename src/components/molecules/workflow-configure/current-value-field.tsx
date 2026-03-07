import React from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface ICurrentValueFieldProps {
    value: string | null | undefined;
}

export const CurrentValueField = ({ value }: ICurrentValueFieldProps) => {
    const hasValue = value !== '' && value !== null && value !== undefined;

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            toast.success('Value copied to clipboard');
        }
    };

    return (
        <div className="flex flex-col gap-y-1">
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Current Value</p>

            <div
                className={`flex items-center gap-x-1 px-3 rounded-md h-9 max-h-9 group
                    ${hasValue ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}
                `}
            >
                {/* Dot */}
                <span
                    className={`
                        text-[28px] mb-[2px]
                        ${hasValue ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}
                    `}
                >
                    •
                </span>

                {/* Value or placeholder */}
                <div className="flex items-center gap-x-2 min-w-0 flex-1">
                    <p
                        className={`
                        text-sm truncate
                        ${hasValue ? 'text-green-600 dark:text-green-700' : 'text-gray-500 dark:text-gray-500 italic'}
                    `}
                    >
                        {hasValue ? value : 'No current value'}
                    </p>
                </div>
                {hasValue && (
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-green-200 dark:hover:bg-green-800/50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Copy value"
                    >
                        <Copy size={14} className="text-green-600 dark:text-green-700" />
                    </button>
                )}
            </div>
        </div>
    );
};
