'use client';

import { RadioList, RadioListItem } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { IOption } from '@/models';
import { RadioGroupProps } from '@radix-ui/react-radio-group';
import React from 'react';

interface InputProps extends RadioGroupProps {
    options: IOption[];
    itemClassName?: string;
}

const RadioChips = React.forwardRef<HTMLInputElement, InputProps>(
    ({ options, className, itemClassName, ...props }, ref) => {
        return (
            <RadioList ref={ref} {...props} className={cn('flex', className)}>
                {options?.map((item) => {
                    return (
                        <RadioListItem
                            key={item.value}
                            value={item.value}
                            disabled={item.disabled}
                            className={cn(
                                'w-max antialiased cursor-pointer disabled:cursor-auto inline-flex justify-center items-center gap-x-2 font-semibold transition-all duration-50 ease-in-out bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-300 drop-shadow-sm outline-none disabled:bg-white disabled:border-gray-200 disabled:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:text-gray-600 dark:focus:ring-gray-500 h-9 px-[14px] py-2 text-sm data-[state=checked]:!bg-blue-700 data-[state=checked]:text-white',
                                itemClassName
                            )}
                        >
                            {item.label}
                        </RadioListItem>
                    );
                })}
            </RadioList>
        );
    }
);
RadioChips.displayName = 'RadioChips';

export { RadioChips };
