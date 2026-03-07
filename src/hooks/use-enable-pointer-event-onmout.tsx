'use client';

import { useEffect } from 'react';

export function useEnablePointerEventsOnMount() {
    useEffect(() => {
        // Save previous value
        const previous = document.body.style.pointerEvents;

        // Enable pointer events
        document.body.style.pointerEvents = 'all';

        // Restore on unmount
        return () => {
            document.body.style.pointerEvents = previous;
        };
    }, []);
}
