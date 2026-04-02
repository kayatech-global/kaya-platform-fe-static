'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronRight,
    CircleCheck,
    CircleFadingArrowUp,
    FileCode2,
    GitBranch,
    GitDiff,
    Info,
    Package,
    ShieldAlert,
    Workflow,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type StepStatus = 'complete' | 'active' | 'pending' | 'warning';

interface ReleaseStep {
    id: string;
    label: string;
    description: string;
    status: StepStatus;
    icon: React.ReactNode;
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */

const RELEASE_STEPS: ReleaseStep[] = [
    {
        id: 'agent-card',
        label: 'Agent Card snapshot',
        description: 'A2A Identity configuration serialised into the release package.',
        status: 'complete',
        icon: <FileCode2 size={13} />,
    },
    {
        id: 'ext-agent-configs',
        label: 'External Agent configs',
        description: 'Remote skill mappings, auth references, and runtime options bundled.',
        status: 'warning',
        icon: <Workflow size={13} />,
    },
    {
        id: 'diff',
        label: 'Diff & change review',
        description: 'Side-by-side comparison of previous vs current release artefacts.',
        status: 'active',
        icon: <GitDiff size={13} />,
    },
    {
        id: 'validation',
        label: 'Schema validation',
        description: 'All A2A card skill IDs validated against connected nodes.',
        status: 'pending',
        icon: <ShieldAlert size={13} />,
    },
    {
        id: 'publish',
        label: 'Release package publish',
        description: 'Immutable release tag created in the registry.',
        status: 'pending',
        icon: <CircleFadingArrowUp size={13} />,
    },
];

const STATUS_STYLES: Record<StepStatus, { dot: string; bg: string; label: string }> = {
    complete: {
        dot: 'bg-green-500',
        bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
        label: 'Complete',
    },
    active: {
        dot: 'bg-blue-500 animate-pulse',
        bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
        label: 'In progress',
    },
    pending: {
        dot: 'bg-gray-300 dark:bg-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700',
        label: 'Pending',
    },
    warning: {
        dot: 'bg-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
        label: 'Needs attention',
    },
};

/* ─── Step Row ───────────────────────────────────────────────────────────────── */

function StepRow({ step }: { step: ReleaseStep }) {
    const [expanded, setExpanded] = useState(false);
    const s = STATUS_STYLES[step.status];

    return (
        <div className={cn('rounded-md border px-3 py-2 transition-colors', s.bg)}>
            <button
                className="w-full flex items-center gap-x-2 text-left"
                onClick={() => setExpanded(p => !p)}
            >
                <span className={cn('w-2 h-2 rounded-full shrink-0', s.dot)} />
                <span className="flex-1 text-[11px] font-medium text-foreground">{step.label}</span>
                <span className="text-[9px] font-medium text-muted-foreground">{s.label}</span>
                {expanded ? (
                    <ChevronDown size={11} className="text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                )}
            </button>
            {expanded && (
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5 pl-4">
                    {step.description}
                </p>
            )}
        </div>
    );
}

/* ─── Diff Preview ───────────────────────────────────────────────────────────── */

const DIFF_LINES = [
    { type: 'removed', text: '  "visibility": "private",' },
    { type: 'added', text: '  "visibility": "public",' },
    { type: 'context', text: '  "schema_version": "0.2.1",' },
    { type: 'removed', text: '  "skills": [ /* 3 skills */ ]' },
    { type: 'added', text: '  "skills": [ /* 5 skills */ ]' },
] as const;

function DiffPreview() {
    return (
        <div className="rounded-md border border-border overflow-hidden">
            <div className="flex items-center gap-x-1.5 px-3 py-1.5 bg-muted border-b border-border">
                <GitDiff size={11} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground">agent.json diff</span>
                <span className="ml-auto text-[9px] text-muted-foreground">v1.3 → v1.4-draft</span>
            </div>
            <div className="bg-gray-950 dark:bg-gray-950 p-2.5 max-h-[130px] overflow-auto">
                {DIFF_LINES.map((line, i) => (
                    <div
                        key={i}
                        className={cn('flex items-start gap-x-1.5 text-[10px] font-mono leading-5', {
                            'text-red-400': line.type === 'removed',
                            'text-green-400': line.type === 'added',
                            'text-gray-400': line.type === 'context',
                        })}
                    >
                        <span className="w-3 shrink-0 select-none opacity-60">
                            {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                        </span>
                        <span>{line.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Main Card ──────────────────────────────────────────────────────────────── */

export function ReleaseManagementSnippet() {
    const [open, setOpen] = useState(true);
    const warningCount = RELEASE_STEPS.filter(s => s.status === 'warning').length;
    const completedCount = RELEASE_STEPS.filter(s => s.status === 'complete').length;

    return (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            {/* Card Header */}
            <button
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center gap-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            >
                <Package size={15} className="shrink-0" />
                <div className="flex-1 text-left">
                    <p className="text-xs font-semibold leading-none">Release Package</p>
                    <p className="text-[10px] opacity-80 mt-0.5">A2A + External Agent configs</p>
                </div>
                <div className="flex items-center gap-x-1.5">
                    {warningCount > 0 && (
                        <span className="flex items-center gap-x-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/30 text-amber-200">
                            <AlertTriangle size={9} />
                            {warningCount}
                        </span>
                    )}
                    <span className="text-[10px] opacity-70">
                        {completedCount}/{RELEASE_STEPS.length}
                    </span>
                    {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </div>
            </button>

            {open && (
                <div className="px-4 py-4 flex flex-col gap-y-4">
                    {/* Info banner */}
                    <div className="flex items-start gap-x-2 px-3 py-2.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <Info size={12} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                            <strong>Agent Cards</strong> and <strong>External Agent</strong> configurations ship as
                            part of workflow release packages. Changes go through diff review and schema validation
                            before publishing.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="flex flex-col gap-y-1.5">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                            Release Steps
                        </p>
                        {RELEASE_STEPS.map(step => (
                            <StepRow key={step.id} step={step} />
                        ))}
                    </div>

                    {/* Warning about missing metadata */}
                    {warningCount > 0 && (
                        <div className="flex items-start gap-x-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                    Action required
                                </p>
                                <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                                    Some External Agent configs have missing skill metadata. Resolve warnings before
                                    initiating a release.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Diff preview */}
                    <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Change Preview
                        </p>
                        <DiffPreview />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(STATUS_STYLES).map(([status, s]) => (
                            <span key={status} className="flex items-center gap-x-1.5 text-[10px] text-muted-foreground">
                                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot.replace(' animate-pulse', ''))} />
                                {s.label}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-x-2 pt-1">
                        <button
                            className="flex-1 flex items-center justify-center gap-x-1.5 h-8 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={warningCount > 0}
                        >
                            <CircleFadingArrowUp size={13} />
                            Begin Release
                        </button>
                        <button className="flex items-center justify-center gap-x-1.5 h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground bg-background hover:bg-muted transition-colors">
                            <GitBranch size={13} />
                            View History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
