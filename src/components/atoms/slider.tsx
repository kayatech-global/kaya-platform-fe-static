'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
        showTooltip?: boolean;
    }
>(({ className, value, showTooltip = true, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        value={value}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>

        {value?.map((v, i) => (
            <SliderPrimitive.Thumb
                key={`thumb-${i}-${v}`}
                className="relative bg-white border-blue-600 block h-4 w-4 rounded-full border border-primary/50 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
                {showTooltip && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-white shadow">
                        {v}
                    </span>
                )}
            </SliderPrimitive.Thumb>
        ))}
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
