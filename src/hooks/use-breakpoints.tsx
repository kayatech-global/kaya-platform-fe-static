'use client';
import { useEffect, useState } from 'react';

interface BreakpointHookProps {
    maxWidth?: number;
}

const breakpoints = {
    mobile: 640,
    sm: 1024,
    md: 1280,
    lg: 1366,
    xl: 1440,
    xxlg: 1920,
};

const getBreakpoint = (width: number): string => {
    if (width < breakpoints.mobile) return 'mobile';
    if (width >= breakpoints.mobile && width <= breakpoints.sm) return 'sm';
    if (width >= breakpoints.sm && width <= breakpoints.md) return 'md';
    if (width >= breakpoints.md && width <= breakpoints.lg) return 'lg';
    if (width >= breakpoints.lg && width <= breakpoints.xl) return 'xl';
    if (width >= breakpoints.xl && width <= breakpoints.xxlg) return 'xxlg';
    return 'xl';
};

export const useBreakpoint = (props?: BreakpointHookProps) => {
    const [isWidthReached, setWidthReached] = useState(false);

    // SSR-safe initialization - default to 'xl' and update on client
    const [breakpoint, setBreakpoint] = useState<string>('xl');

    useEffect(() => {
        const handleResize = () => {
            const newBreakpoint = getBreakpoint(window.innerWidth);
            setBreakpoint(newBreakpoint);
            if (props?.maxWidth) {
                setWidthReached(props?.maxWidth >= window.outerWidth);
            } else {
                setWidthReached(false);
            }
        };

        // Set initial value on mount
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [props?.maxWidth]);

    return {
        isMobile: breakpoint === 'mobile',
        isSm: breakpoint === 'sm',
        isMd: breakpoint === 'md',
        isLg: breakpoint === 'lg',
        isXl: breakpoint === 'xl',
        isXxLg: breakpoint === 'xxlg',
        isWidthReached,
    };
};
