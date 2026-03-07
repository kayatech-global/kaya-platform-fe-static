'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';

const toggleGroupItemClasses =
    'flex w-[100px] h-9 items-center justify-center bg-gray-200 leading-4 text-mauve11 first:rounded-l last:rounded-r  focus:z-10  text-black dark:text-white bg-gray-300 dark:bg-gray-800 data-[state=on]:bg-blue-500 dark:data-[state=on]:bg-blue-500';

export interface ToggleGroupItem {
    icon?: React.ReactNode;
    value: string;
    label: string;
}

interface BaseToggleGroupProps {
    items?: ToggleGroupItem[];
    className?: string;
}

type ToggleGroupProps = BaseToggleGroupProps &
    (
        | (React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & { type: 'single' })
        | (React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & { type: 'multiple' })
    );

const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, ToggleGroupProps>(
    ({ className, items, ...props }, ref) => {
        const defaultItems: ToggleGroupItem[] = items || [];

        return (
            <ToggleGroupPrimitive.Root
                className={cn('peer inline-flex space-x-px rounded ', className)}
                {...props}
                ref={ref}
            >
                {defaultItems.map(item => (
                    <ToggleGroupPrimitive.ToggleGroupItem
                        key={item.value}
                        value={item.value}
                        className={toggleGroupItemClasses}
                    >
                        <div className={'p-1'}>{item.icon}</div>
                        {item.label}
                    </ToggleGroupPrimitive.ToggleGroupItem>
                ))}
            </ToggleGroupPrimitive.Root>
        );
    }
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export { ToggleGroup };
