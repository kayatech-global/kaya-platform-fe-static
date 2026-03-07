import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn, renderIcon } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

const buttonVariants = cva(
    'w-max antialiased cursor-pointer disabled:cursor-auto inline-flex justify-center items-center gap-x-2 rounded-lg font-semibold transition-all duration-50 ease-in-out',
    {
        variants: {
            variant: {
                default:
                    'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 drop-shadow-sm focus:ring-2 outline-none focus:outline-none focus:ring-2 focus:outline-none focus:ring-blue-300 disabled:bg-blue-200 disabled:border-blue-200 dark:disabled:bg-gray-500 dark:disabled:border-gray-600 dark:disabled:text-gray-400 dark:focus:ring-blue-600',
                primary:
                    'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 drop-shadow-sm focus:ring-2 outline-none focus:outline-none focus:ring-2 focus:outline-none focus:ring-blue-300 disabled:bg-blue-200 disabled:border-blue-200 dark:disabled:bg-gray-500 dark:disabled:border-gray-600 dark:disabled:text-gray-400 dark:focus:ring-blue-600',
                secondary:
                    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-300 drop-shadow-sm focus:ring-2 outline-none focus:outline-none focus:ring-2 focus:outline-none focus:ring-gray-200 disabled:bg-white disabled:border-gray-200 disabled:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:text-gray-600 dark:focus:ring-gray-500',
                'semi-secondary':
                    'text-blue-700 hover:bg-blue-50 disabled:text-gray-300 focus:ring-2 outline-none focus:outline-none focus:ring-blue-200',
                ghost: 'text-gray-500 hover:bg-gray-50 disabled:text-gray-300 focus:ring-2 outline-none focus:outline-none focus:ring-gray-200',
                destructive:
                    'bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 drop-shadow-sm focus:ring-2 outline-none focus:outline-none focus:ring-2 focus:outline-none focus:ring-red-300 disabled:bg-red-200 disabled:border-red-200',
                link: '!w-fit !h-fit !p-0 text-blue-700 hover:text-blue-800 disabled-text-gray-300 focus:ring-0 outline-none',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground  disabled:opacity-[50%]',
            },
            size: {
                sm: 'h-9 px-[14px] py-2 text-sm',
                md: 'h-10 px-4 py-[10px] text-sm',
                lg: 'h-11 px-[18px] py-[10px] text-md',
                xl: 'h-12 px-5 py-3 text-md',
                xxl: 'h-16 px-7 py-4 text-lg',
                icon: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            leadingIcon,
            trailingIcon,
            children,
            disabled,
            asChild = false,
            loading = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                disabled={disabled || loading}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {loading ? (
                    <LoaderCircle
                        className={cn('animate-spin', {
                            'text-white': variant === 'primary' || variant === 'destructive',
                        })}
                        size={16}
                        width={16}
                        height={16}
                        absoluteStrokeWidth={undefined}
                    />
                ) : (
                    renderIcon(leadingIcon, 16)
                )}
                {children}
                {!loading && renderIcon(trailingIcon, 16)}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
