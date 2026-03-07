import React, { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IFormFieldGroup {
    children: ReactNode;
    showSeparator?: boolean;
    title: string;
    description?: string;
    tooltipMessage?: ReactNode;
    className?: string;
    labelClassName?: string;
    switchControl?: ReactNode;
    isDestructive?: boolean;
}

export const FormFieldGroup = ({
    title,
    description,
    children,
    showSeparator = true,
    tooltipMessage,
    className,
    labelClassName,
    switchControl,
    isDestructive,
}: IFormFieldGroup) => {
    return (
        <>
            {showSeparator && <hr className="col-span-2 sm:col-span-2 dark:border-gray-700" />}
            <div
                className={cn(
                    'relative border rounded-md col-span-2 px-4 pt-4 pb-6 mb-3',
                    className,
                    {
                        'border-red-300 dark:border-red-300': isDestructive,
                        'border-gray-300 dark:border-gray-600': !isDestructive,
                    }
                )}
            >
                <div className={cn('p-1 absolute top-[-14px] left-3 bg-white dark:bg-gray-800 pr-2', labelClassName)}>
                    <p
                        className={cn('text-sm font-medium flex items-center gap-2', {
                            'text-red-500 dark:text-red-500': isDestructive,
                            'text-gray-700 dark:text-gray-200': !isDestructive,
                        })}
                    >
                        {switchControl} {title}
                        {tooltipMessage && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} />
                                    </TooltipTrigger>
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        {tooltipMessage}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </p>
                </div>
                <div className="flex flex-col gap-y-3">
                    <p className="text-[13px] font-normal text-gray-600 dark:text-gray-300">{description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">{children}</div>
                </div>
            </div>
        </>
    );
};
