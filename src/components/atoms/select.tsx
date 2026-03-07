import * as React from 'react';

import { cn, renderIcon } from '@/lib/utils';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { X, Info } from 'lucide-react';

export interface OptionModel {
    name: string;
    value: string | number;
    disabled?: boolean;
    isHidden?: boolean;
    meta?: unknown;
}

interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    hasClear?: boolean;
    isVault?: boolean;
    onClear?: () => void;
    containerClassName?: string;
    helperInfo?: string;
}

const Select = React.forwardRef<HTMLSelectElement, InputProps>(
    (
        {
            className,
            label,
            supportiveText,
            leadingIcon,
            trailingIcon,
            isDestructive = false,
            placeholder,
            options,
            currentValue,
            hasClear = false,
            disabled,
            isVault,
            defaultValue,
            onClear,
            containerClassName,
            helperInfo,
            value,
            ...props
        },
        ref
    ) => {
        const selectOptions = React.useMemo(() => {
            if (options?.length > 0 && placeholder) {
                return [{ name: placeholder, value: '' }, ...options];
            } else if (options?.length === 0 && placeholder) {
                return [{ name: placeholder, value: '' }];
            }
            return options;
        }, [options, placeholder]);

        const onValueClear = () => {
            if (!disabled && onClear) {
                onClear();
            }
        };

        return (
            <div className={cn('flex flex-col items-start gap-y-[6px] w-full', containerClassName)}>
                <div className="flex flex-col items-start gap-y-[6px] w-full">
                    {label && (
                        <Label
                            className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1"
                            htmlFor={props.id}
                        >
                            {label}
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
                        <select
                            className={cn(
                                'flex items-center h-9 w-full bg-white rounded-lg border border-gray-300 px-[14px] py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300',
                                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                                'focus-visible:outline-none focus-visible:ring-4 focus:border-blue-300 focus-visible:ring-[#DCE7FE] dark:focus:border-blue-900 dark:focus:focus-visible:ring-[#2f436f58]',
                                'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700',
                                { 'pl-8': leadingIcon !== undefined },
                                {
                                    ' !border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                        isDestructive,
                                },
                                {
                                    'opacity-80':
                                        (value === '' || value === undefined || value === null) && 
                                        (currentValue === '' || currentValue === undefined || currentValue === null),
                                },
                                className
                            )}
                            ref={ref}
                            disabled={disabled}
                            {...(value === undefined ? { defaultValue } : { value })}
                            {...props}
                        >
                            {selectOptions.map((value) => {
                                const displayName =
                                    value.name && value.name.length > 70 ? value.name.slice(0, 57) + '...' : value.name;
                                return (
                                    <option
                                        key={value.value}
                                        value={value.value}
                                        title={value.name}
                                        {...((value.value === '' || value.disabled) && {
                                            disabled: true,
                                        })}
                                    >
                                        {displayName}
                                    </option>
                                );
                            })}
                        </select>
                        {hasClear && 
                         ((value !== '' && value !== undefined) || 
                          (currentValue !== '' && currentValue !== undefined)) && (
                            <X
                                size={16}
                                strokeWidth={2}
                                className={cn('shrink-1 text-gray-500 absolute', {
                                    'right-[35px]': !isVault && trailingIcon,
                                    'right-[20px]': !isVault && !trailingIcon,
                                    'right-[55px]': isVault,
                                })}
                                onClick={onValueClear}
                            ></X>
                        )}
                        {renderIcon(trailingIcon, 16, 'text-gray-500 absolute right-[14px]')}
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
Select.displayName = 'Select';

export { Select };
