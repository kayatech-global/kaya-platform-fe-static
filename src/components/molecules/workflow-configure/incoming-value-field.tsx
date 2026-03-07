import React from 'react';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface IIncomingValueFieldProps {
    value: string | null | undefined;
}

export const IncomingValueField = ({ value }: IIncomingValueFieldProps) => {
    const hasValue = value !== '' && value !== null && value !== undefined;

    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value);
            toast.success('Value copied to clipboard');
        }
    };

    return (
        <div className="flex flex-col gap-y-1">
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">Incoming Value</p>

            <div
                className={`
                    flex items-center gap-x-1 px-3 rounded-md h-9 max-h-9 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 group
                    bg-gray-100
                `}
            >
                {/* Icon */}
                <i
                    className={`
                        ri-corner-down-right-fill mb-[2px]
                        ${hasValue ? 'text-gray-400' : 'text-gray-300'}
                    `}
                />

                {/* Text */}
                {/* Text */}
                <div className="flex items-center gap-x-2 min-w-0 flex-1">
                    <p
                        className={`
                        text-sm truncate
                        ${hasValue ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 italic dark:text-gray-300'}
                    `}
                    >
                        {hasValue ? value : 'No incoming value'}
                    </p>
                </div>
                {hasValue && (
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Copy value"
                    >
                        <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                    </button>
                )}
            </div>
        </div>
    );
};
