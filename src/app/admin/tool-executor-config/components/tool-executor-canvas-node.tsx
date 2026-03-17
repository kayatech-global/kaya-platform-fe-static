'use client';

import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Colour tokens for the Tool Executor node ──────────────────────────────────
const NODE_COLOR = '#0891b2'; // cyan-600
const NODE_ACTIVE_COLOR = '#0e7490'; // cyan-700
const HANDLE_COLOR = '#06b6d4'; // cyan-500 — handle ring

interface ToolExecutorCanvasNodeProps {
    /** Display name of the configured tool, shown as subtitle */
    toolName?: string;
    /** Whether the node is currently selected / active */
    isActive?: boolean;
    /** Additional wrapper class */
    className?: string;
    onClick?: () => void;
}

/**
 * Standalone presentational replica of the Tool Executor node as it appears
 * on the ReactFlow workflow canvas.  Does not import @xyflow/react so it can
 * be rendered safely inside a plain Next.js page without a canvas context.
 */
export const ToolExecutorCanvasNode = ({
    toolName = 'Fetch Customer Profile',
    isActive = false,
    className,
    onClick,
}: ToolExecutorCanvasNodeProps) => {
    const [animating, setAnimating] = useState(false);

    const handleClick = () => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 300);
        onClick?.();
    };

    const bgColor = isActive ? NODE_ACTIVE_COLOR : NODE_COLOR;

    return (
        <div className={cn('flex flex-col items-center gap-y-1 select-none', className)}>
            {/* ── Node body ─────────────────────────────────────────────── */}
            <div className="relative flex items-center">
                {/* Left (target) handle */}
                <div
                    className="absolute -left-3 z-10 w-3 h-3 rounded-full border-2 border-background"
                    style={{ background: HANDLE_COLOR }}
                    title="Input"
                />

                {/* Tile */}
                <button
                    type="button"
                    aria-label="Tool Executor node"
                    onClick={handleClick}
                    className="relative cursor-pointer appearance-none border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {/* Shadow tile */}
                    <div
                        className="absolute top-1 right-[6px] rounded-lg h-[85px] w-[85px] z-0"
                        style={{ background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR, opacity: 0.45 }}
                    />

                    {/* Main tile */}
                    <div
                        className={cn(
                            'relative z-10 w-[85px] h-[85px] rounded-lg border border-white/20 flex flex-col items-center justify-center gap-y-1 transition-transform duration-150',
                            animating && '-translate-y-1 translate-x-1',
                        )}
                        style={{ background: bgColor }}
                    >
                        <Wrench
                            size={36}
                            strokeWidth={1.5}
                            className={cn(
                                'text-white transition-transform duration-300',
                                animating && 'scale-110 -rotate-12',
                            )}
                        />
                    </div>
                </button>

                {/* Right (source) handle */}
                <div
                    className="absolute -right-3 z-10 w-3 h-3 rounded-full border-2 border-background"
                    style={{ background: HANDLE_COLOR }}
                    title="Output"
                />
            </div>

            {/* ── Labels ────────────────────────────────────────────────── */}
            <p className="text-xs font-semibold text-foreground/80 text-center max-w-[100px]">
                Tool Executor
            </p>
            {toolName && (
                <p className="text-[10px] text-muted-foreground text-center max-w-[110px] truncate" title={toolName}>
                    {toolName}
                </p>
            )}
        </div>
    );
};

// ── Canvas Preview Wrapper ─────────────────────────────────────────────────────
// Shows the node inside a mock canvas grid background, similar to ReactFlow.

interface CanvasPreviewProps {
    toolName?: string;
}

export const ToolExecutorCanvasPreview = ({ toolName }: CanvasPreviewProps) => {
    const [active, setActive] = useState(false);

    return (
        <div className="flex flex-col gap-y-4">
            {/* Canvas mock area */}
            <div
                className={cn(
                    'relative w-full rounded-xl border border-border overflow-hidden',
                    'bg-[radial-gradient(circle,_hsl(var(--border))_1px,_transparent_1px)] bg-[length:24px_24px]',
                    'dark:bg-gray-900 dark:[background-image:radial-gradient(circle,_rgba(255,255,255,0.08)_1px,_transparent_1px)]',
                )}
                style={{ height: 260 }}
            >
                {/* Fake upstream node */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-y-1">
                    <div
                        className="w-[85px] h-[85px] rounded-lg border border-white/20 flex items-center justify-center"
                        style={{ background: '#16A249' }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-white">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10,8 16,12 10,16" fill="white" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Start</p>
                </div>

                {/* Connecting edge */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <marker id="arrow-te" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 z" fill="#0891b2" />
                        </marker>
                    </defs>
                    {/* Left node to Tool Executor */}
                    <path
                        d="M 138 130 C 165 130, 185 130, 212 130"
                        stroke="#0891b2"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5 3"
                        markerEnd="url(#arrow-te)"
                    />
                    {/* Tool Executor to right node */}
                    <path
                        d="M 310 130 C 337 130, 357 130, 384 130"
                        stroke="#0891b2"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5 3"
                        markerEnd="url(#arrow-te)"
                    />
                </svg>

                {/* Tool Executor node — centred */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <ToolExecutorCanvasNode
                        toolName={toolName}
                        isActive={active}
                        onClick={() => setActive(v => !v)}
                    />
                </div>

                {/* Fake downstream node */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-y-1">
                    <div
                        className="w-[85px] h-[85px] rounded-lg border border-white/20 flex items-center justify-center"
                        style={{ background: '#DB7706' }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-white">
                            <circle cx="12" cy="12" r="10" />
                            <rect x="7" y="7" width="10" height="10" rx="1" fill="white" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-muted-foreground">End</p>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                Click the node to toggle the active / selected state.
            </p>
        </div>
    );
};
