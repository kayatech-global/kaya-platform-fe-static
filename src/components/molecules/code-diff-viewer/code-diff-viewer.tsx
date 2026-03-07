'use client';
import React, { useEffect, useRef, useState } from 'react';
import DiffViewer, { DiffMethod } from 'react-diff-viewer';
import { useTheme } from '@/theme';
import './styles.css';

interface ICodeDiffViewerProps {
    currentChanges: string;
    incomingChanges: string;
}

export const CodeDiffViewer = ({ currentChanges, incomingChanges }: ICodeDiffViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(300); // default fallback
    const { theme } = useTheme();

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
        <div ref={containerRef} style={{ height, overflowY: 'auto' }} className="react-diff-viewer">
            <DiffViewer
                leftTitle="Current version"
                rightTitle="Incoming version"
                oldValue={currentChanges}
                newValue={incomingChanges}
                splitView={true}
                useDarkTheme={theme === 'dark'}
                styles={{
                    diffContainer: { fontSize: '10px', margin: 0, height: '10px' },
                    titleBlock: {
                        color: theme === 'dark' ? '#ffffff' : '#374151',
                    },
                }}
                compareMethod={DiffMethod.WORDS}
            />
        </div>
    );
};
