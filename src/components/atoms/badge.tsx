import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Static badge styles
const badgeVariants = cva('inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border', {
    variants: {
        variant: {
            default: 'bg-blue-100 text-blue-800 border-transparent',
            secondary: 'bg-gray-100 text-gray-800 border-transparent',
            outline: 'bg-white text-gray-800 border-gray-300',
            warning: 'bg-amber-100 text-amber-800 border-transparent',
            destructive: 'bg-red-100 text-red-800 border-transparent',
            success: 'bg-green-100 text-green-800 border-transparent',
            info: 'bg-sky-100 text-sky-800 border-transparent',
            error: 'bg-red-100 text-red-800 border-transparent',
            critical: 'bg-red-400 text-white border-transparent',
            dark: 'bg-gray-800 text-white border-transparent',
        },
        size: {
            sm: 'text-xs px-2 py-0.5',
            md: 'text-sm px-3 py-1',
            lg: 'text-sm px-4 py-2',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'sm',
    },
});

// New Test Studio badge styles
const testStudioBadgeVariants = cva('inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
            success: 'border-transparent bg-green-100 text-green-600',
            secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
            destructive: 'border-transparent bg-red-100 text-red-600 shadow hover:bg-destructive/80 !shadow-none',
            outline: 'text-foreground',
            warning: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
            critical: 'bg-red-400 text-white',
            info: 'border-transparent bg-blue-100 text-blue-700 dark:bg-[#91B5FD]/10 dark:text-blue-400',
            error: 'border-transparent bg-red-100 text-red-700 dark:bg-[#EF4343]/20 dark:text-red-400',
            dark: 'bg-gray-800 text-white border-transparent',
        },
        size: {
            sm: 'text-xs px-2 py-0.5',
            md: 'text-sm px-3 py-1',
            lg: 'text-sm px-4 py-2',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'sm',
    },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    /**
     * Use Test Studio specific badge styling.
     */
    testStudio?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, size, testStudio = false, ...props }, ref) => {
        const variantStyles = testStudio
            ? testStudioBadgeVariants({ variant, size })
            : badgeVariants({ variant, size });

        return <div ref={ref} className={cn(variantStyles, className)} {...props} />;
    }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
