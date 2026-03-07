import * as React from 'react';

import { cn, renderIcon } from '@/lib/utils';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { Info } from 'lucide-react';
import { SmallSpinner } from './spinner';

interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    labelInfo?: string | React.ReactNode;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    containerClassName?: string;
    helperInfo?: string | React.ReactNode;
    trailingIconClass?: string;
    loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            label,
            labelInfo,
            supportiveText,
            leadingIcon,
            trailingIcon,
            isDestructive = false,
            containerClassName,
            helperInfo,
            trailingIconClass,
            loading = false,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn('flex flex-col items-start gap-y-[6px] w-full', containerClassName)}>
                <div className="flex flex-col items-start gap-y-[6px] w-full">
                    {label && (
                        <Label
                            className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1"
                            htmlFor={props.id}
                        >
                            {label}
                            {labelInfo && (
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                    {labelInfo}
                                </span>
                            )}
                            {helperInfo && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={13} />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center" className="max-w-[250px]">
                                        {helperInfo}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </Label>
                    )}
                    <div className="relative flex items-center w-full">
                        {renderIcon(leadingIcon, 16, 'text-gray-500 absolute left-[10px] dark:text-gray-300')}
                        <input
                            type={type}
                            className={cn(
                                'flex items-center h-9 w-full bg-white rounded-lg border border-gray-300 px-[14px] py-2 pb-[10px] text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300',
                                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                                'focus-visible:outline-none focus-visible:ring-4 focus:border-blue-300 focus-visible:ring-[#DCE7FE] dark:focus:border-blue-900 dark:focus:focus-visible:ring-[#2f436f58]',
                                'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700',
                                { 'pl-8': leadingIcon !== undefined },
                                { 'pr-12': trailingIcon !== undefined },
                                {
                                    ' !border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                        isDestructive,
                                },
                                className
                            )}
                            ref={ref}
                            {...props}
                        />
                        {loading && (
                            <div className="absolute -right-1 bottom-[26px]">
                                <SmallSpinner />
                            </div>
                        )}
                        {renderIcon(trailingIcon, 16, `${trailingIconClass ?? 'text-gray-500'} absolute right-[14px]`)}
                    </div>
                </div>
                {supportiveText && (
                    <p
                        className={cn('text-xs font-normal', {
                            'text-red-500 dark:text-red-500': isDestructive,
                            'text-gray-500 dark:text-gray-300': !isDestructive,
                        })}
                    >
                        {supportiveText}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
