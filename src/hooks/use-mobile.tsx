import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isMobile;
}

export const useIsHorizontalScrollable = (ref: React.RefObject<HTMLDivElement>): boolean => {
    const [isHorizontalScrollable, setIsHorizontalScrollable] = React.useState<boolean>(false);
    const [width, setWidth] = React.useState<unknown>();
    const [outerWidth, setOuterWidth] = React.useState<unknown>();

    React.useEffect(() => {
        const manage = (innerWidth: number, outerWidth: number) => {
            setWidth(innerWidth);
            setOuterWidth(outerWidth);
        };
        window.addEventListener('resize', () => manage(window.innerWidth, window.outerWidth));
        if (ref.current) {
            const element = ref.current;
            const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
            setIsHorizontalScrollable(hasHorizontalOverflow);
        }
        return () => window.removeEventListener('resize', () => manage(window.innerWidth, window.outerWidth));
    }, [width, outerWidth]);

    return isHorizontalScrollable;
};
