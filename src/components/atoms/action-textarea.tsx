/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from './label';
import { Button } from './button';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components';
import { Zap } from 'lucide-react';

interface InputProps extends React.ComponentProps<'textarea'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    actionLabel: string;
    actionClassName?: string;
    onAction: () => void;
    actionDisabled?: boolean;
    tooltipContent?: React.ReactNode;
}

const ActionTextarea = React.forwardRef<HTMLTextAreaElement, InputProps>(
    (
        {
            className,
            label,
            supportiveText,
            isDestructive = false,
            disabled,
            actionLabel,
            actionClassName,
            onFocus,
            onBlur,
            onAction,
            actionDisabled,
            tooltipContent,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = React.useState<boolean>(false);

        const onForceFocus = (e: any) => {
            setFocused(true);
            if (onFocus) {
                onFocus(e);
            }
        };

        const onForceBlur = (e: any) => {
            setFocused(false);
            if (onBlur) {
                onBlur(e);
            }
        };

        return (
            <div className="flex flex-col items-start gap-y-[6px] w-full">
                <div className="flex flex-col items-start gap-y-[6px] w-full">
                    {label && (
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100" htmlFor={props.id}>
                            {label}
                        </Label>
                    )}
                    <div
                        className={cn(
                            'relative w-full rounded-lg border border-gray-300 file:border-0 dark:border-gray-600 shadow-sm transition-colors',
                            'bg-white dark:bg-gray-700 file:bg-transparent',
                            {
                                'outline-none ring-0 border-blue-300 ring-[#DCE7FE] dark:border-blue-900 dark:ring-[#2f436f58]':
                                    focused,
                                '!border-red-300 !ring-[#FEE4E2]': isDestructive,
                                'bg-gray-100 !dark:bg-gray-700 !cursor-not-allowed': disabled,
                            }
                        )}
                    >
                        <textarea
                            className={cn(
                                'flex items-center w-full rounded-t-lg bg-white px-[14px] py-2 pb-[10px] text-sm text-gray-900 transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-300',
                                'resize-none focus:outline-none focus:ring-0 focus:border-transparent',
                                'file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                                'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700',
                                className
                            )}
                            ref={ref}
                            disabled={disabled}
                            {...props}
                            onFocus={onForceFocus}
                            onBlur={onForceBlur}
                        />
                        <div className="flex justify-end px-[14px] py-4">
                            {tooltipContent ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className={cn(
                                                        actionDisabled || disabled ? '' : 'border-blue-600 dark:border-blue-600',
                                                        actionClassName
                                                    )}
                                                    disabled={actionDisabled || disabled}
                                                    onClick={onAction}
                                                >
                                                    <span className="flex items-center gap-x-2">
                                                        <span className="flex justify-center items-center h-[24px] w-[24px] bg-blue-100 rounded-full">
                                                            <Zap size={12} className="text-blue-600" />
                                                        </span>
                                                        <span className="text-blue-600">{actionLabel}</span>
                                                    </span>
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {tooltipContent}
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className={cn(
                                        actionDisabled || disabled ? '' : 'border-blue-600 dark:border-blue-600',
                                        actionClassName
                                    )}
                                    disabled={actionDisabled || disabled}
                                    onClick={onAction}
                                >
                                    <span className="flex items-center gap-x-2">
                                        <span className="flex justify-center items-center h-[24px] w-[24px] bg-blue-100 rounded-full">
                                            <Zap size={12} className="text-blue-600" />
                                        </span>
                                        <span className="text-blue-600">{actionLabel}</span>
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {supportiveText && (
                    <p
                        className={cn('text-xs  font-normal ', {
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
ActionTextarea.displayName = 'ActionTextarea';

export { ActionTextarea };
