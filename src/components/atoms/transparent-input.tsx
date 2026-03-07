import * as React from 'react';

import { cn, renderIcon } from '@/lib/utils';

interface TransparentInputProps extends React.ComponentProps<'input'> {
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    optOutDarkTheme?: boolean;
}

const TransparentInput = React.forwardRef<HTMLInputElement, TransparentInputProps>(
    ({ className, type, leadingIcon, trailingIcon, optOutDarkTheme, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                {renderIcon(leadingIcon, 20, 'text-gray-100 absolute left-[14px] dark:text-gray-300')}
                <input
                    type={type}
                    className={cn(
                        'transparent-input flex h-11 w-full rounded-lg border-input py-1 text-gray-100 text-md font-regular shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-100 placeholder:font-regular placeholder:text-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        { 'px-10': leadingIcon !== undefined },
                        { 'px-3': leadingIcon === undefined },
                        {
                            'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:placeholder:text-gray-300':
                                !optOutDarkTheme,
                        },
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {renderIcon(trailingIcon, 20, 'text-gray-100 absolute right-[14px]')}
            </div>
        );
    }
);

TransparentInput.displayName = 'TransparentInput';

export { TransparentInput };
