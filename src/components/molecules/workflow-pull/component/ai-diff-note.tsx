'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MarkdownText } from '../../mardown-text/markdown-text';

interface AIDiffNoteProps {
    aiNote: string;
}

export const AIDiffNote = ({ aiNote }: AIDiffNoteProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(300); // default fallback

    useEffect(() => {
        if (!containerRef.current) return;

        // Create observer
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const parentHeight = entry.contentRect.height;
                setHeight(parentHeight);
            }
        });

        // Observe parent
        observer.observe(containerRef.current.parentElement ?? document.body);

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} style={{ height, overflowY: 'auto' }}>
            <div
                className="bg-gray-white dark:bg-gray-800 rounded-lg p-4 prose prose-sm max-w-none dark:prose-invert
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:text-xs [&_p]:leading-relaxed
            [&_p:first-child]:text-sm [&_p:first-child]:font-medium"
            >
                <MarkdownText>{aiNote}</MarkdownText>
            </div>
        </div>
    );
};
