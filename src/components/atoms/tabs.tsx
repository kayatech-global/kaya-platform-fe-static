'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
            className
        )}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
            className
        )}
        {...props}
    />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

// eslint-disable-next-line react/display-name
const DraggableTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
    const containerRef = React.useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [hasOverflow, setHasOverflow] = React.useState(false);

    // Check if there's overflow content that needs scrolling
    React.useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current) {
                const { scrollWidth, clientWidth } = containerRef.current;
                setHasOverflow(scrollWidth > clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [props.children]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (containerRef.current && hasOverflow) {
            setIsDragging(true);
            setStartX(e.pageX - containerRef.current.offsetLeft);
            setScrollLeft(containerRef.current.scrollLeft);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();

        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Add touch event support
    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current && hasOverflow) {
            setIsDragging(true);
            setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
            setScrollLeft(containerRef.current.scrollLeft);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const x = e.touches[0].pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!containerRef.current || !hasOverflow) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            containerRef.current.scrollLeft -= 50;
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            containerRef.current.scrollLeft += 50;
        }
    };

    return (
        <div
            role="region"
            aria-label="Draggable tabs"
            className={cn(
                'rounded-lg bg-muted relative', // Apply the background to the container
                hasOverflow ? 'cursor-grab' : '',
                isDragging ? 'cursor-grabbing' : '',
                'select-none overflow-hidden' // Add overflow-hidden to contain the background
            )}
        >
            <button
                type="button"
                ref={containerRef}
                aria-label="Scrollable tabs area"
                className="overflow-x-auto scrollbar-hide w-full text-left border-0 bg-transparent p-0"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleKeyDown}
                style={{
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <TabsPrimitive.List
                    ref={ref}
                    className={cn(
                        'inline-flex h-9 items-center justify-start p-1 text-muted-foreground',
                        'min-w-full w-max',
                        className
                    )}
                    {...props}
                />
            </button>
        </div>
    );
});
TabsList.displayName = 'TabsList';

// Custom CSS for hiding scrollbars on WebKit browsers
const injectScrollbarHideStyles = () => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }
};

// Call once when the component is first used
if (typeof window !== 'undefined') {
    injectScrollbarHideStyles();
}

export { DraggableTabsList };
