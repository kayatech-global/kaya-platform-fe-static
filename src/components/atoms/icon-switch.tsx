'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';

const IconSwitch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
        label?: string;
        icon?: React.ReactNode;
        onEdit?: () => void;
    }
>(({ className, label, icon, onEdit, ...props }, ref) => (
    <div
        className={cn(
            'group flex items-center gap-2 bg-gray-300 dark:bg-gray-500 rounded-full hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors',
            props.checked ? 'w-[180px]' : 'w-[150px]'
        )}
    >
        <SwitchPrimitives.Root
            ref={ref}
            className={cn(
                'relative inline-flex h-[30px] w-[150px] items-center justify-between rounded-full border-2 border-transparent shadow-sm outline-none text-xs font-medium transition-colors',
                'text-white dark:text-gray-950',
                'bg-gray-400 dark:bg-gray-600',
                'data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600',
                className
            )}
            {...props}
        >
            <span
                key={label}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
            >
                <div className={'p-1'}>{icon}</div>
                <div>{label}</div>
            </span>
            <SwitchPrimitives.Thumb className="block size-[28px]  rounded-full bg-white dark:bg-gray-200 shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[122px]" />
        </SwitchPrimitives.Root>
        {onEdit && props.checked && (
            <button
                disabled={!props.checked}
                onClick={onEdit}
                className="p-1.5 rounded "
                aria-label="Edit video mode settings"
                type="button"
            >
                <Edit size={16} className="text-gray-600 dark:text-gray-300 pr-1" />
            </button>
        )}
    </div>
));

IconSwitch.displayName = SwitchPrimitives.Root.displayName;
export { IconSwitch };
