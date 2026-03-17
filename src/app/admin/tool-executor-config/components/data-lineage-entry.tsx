'use client';

import React, { useState } from 'react';
import {
    Wrench,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    ArrowRight,
    AlertTriangle,
    Copy,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_LINEAGE_SUCCESS, MOCK_LINEAGE_FAILED, type LineageRecord } from '../mock-data';

// ── Shared display helpers ────────────────────────────────────────────────────
const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date(iso));

const Badge = ({
    children,
    variant,
}: {
    children: React.ReactNode;
    variant: 'success' | 'failed' | 'neutral' | 'cyan';
}) => {
    const cls = {
        success: 'bg-green-500/15 text-green-400 border-green-500/30',
        failed: 'bg-red-500/15 text-red-400 border-red-500/30',
        neutral: 'bg-secondary text-muted-foreground border-border',
        cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    }[variant];
    return (
        <span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold', cls)}>
            {children}
        </span>
    );
};

// ── JSON snippet block with copy ─────────────────────────────────────────────
const JsonBlock = ({ value }: { value: unknown }) => {
    const [copied, setCopied] = useState(false);
    const text = JSON.stringify(value, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="relative rounded-md bg-gray-950 border border-gray-800 overflow-hidden">
            <button
                type="button"
                onClick={handleCopy}
                className="absolute top-2 right-2 flex items-center gap-x-1 text-[10px] text-gray-400 hover:text-gray-200 transition-colors z-10"
                aria-label="Copy JSON"
            >
                {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                {copied ? 'Copied' : 'Copy'}
            </button>
            <pre className="p-3 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto whitespace-pre">
                {text}
            </pre>
        </div>
    );
};

// ── Expandable detail block ───────────────────────────────────────────────────
const DetailBlock = ({
    label,
    children,
    defaultOpen = true,
}: {
    label: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-secondary/60 hover:bg-secondary/80 transition-colors"
                aria-expanded={open}
            >
                <p className="text-xs font-semibold text-foreground">{label}</p>
                {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
            </button>
            {open && <div className="px-4 py-3">{children}</div>}
        </div>
    );
};

// ── Individual lineage card ───────────────────────────────────────────────────
const LineageCard = ({ record }: { record: LineageRecord }) => {
    const isSuccess = record.status === 'SUCCESS';

    return (
        <div
            className={cn(
                'rounded-xl border overflow-hidden flex flex-col',
                isSuccess ? 'border-green-500/30' : 'border-red-500/30',
            )}
        >
            {/* ── Card header ───────────────────────────────────────────── */}
            <div
                className={cn(
                    'flex items-center justify-between px-5 py-4',
                    isSuccess
                        ? 'bg-green-500/5 dark:bg-green-500/10'
                        : 'bg-red-500/5 dark:bg-red-500/10',
                )}
            >
                <div className="flex items-center gap-x-3">
                    {/* Node type icon */}
                    <div
                        className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            'bg-cyan-600/20 border border-cyan-600/30',
                        )}
                    >
                        <Wrench size={18} className="text-cyan-400" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col gap-y-0.5">
                        <div className="flex items-center gap-x-2">
                            <p className="text-sm font-semibold text-foreground">{record.toolName}</p>
                            <Badge variant="cyan">Tool Executor</Badge>
                        </div>
                        <div className="flex items-center gap-x-2 flex-wrap gap-y-1">
                            <Badge variant="neutral">Node Type: {record.nodeType}</Badge>
                            <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
                            <span className="text-xs text-muted-foreground font-mono">{record.id}</span>
                        </div>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex flex-col items-end gap-y-1.5 flex-shrink-0 ml-4">
                    <div className="flex items-center gap-x-1.5">
                        {isSuccess ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                        ) : (
                            <XCircle size={16} className="text-red-400" />
                        )}
                        <Badge variant={isSuccess ? 'success' : 'failed'}>{record.status}</Badge>
                    </div>
                    <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        <span>{record.durationMs} ms</span>
                    </div>
                </div>
            </div>

            {/* ── Meta row ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-x-4 px-5 py-2.5 bg-secondary/40 border-t border-border flex-wrap gap-y-1.5">
                <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                    <Clock size={11} />
                    <span>Executed at {formatDate(record.executedAt)}</span>
                </div>
                <ArrowRight size={11} className="text-muted-foreground hidden sm:block" />
                <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                    <span>Tool:</span>
                    <span className="font-medium text-foreground">{record.toolName}</span>
                </div>
            </div>

            {/* ── Expandable detail sections ────────────────────────────── */}
            <div className="flex flex-col gap-y-3 px-5 py-4">
                {/* Input params */}
                <DetailBlock label="Input Parameters">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {Object.entries(record.inputParams).map(([k, v]) => (
                            <div key={k} className="flex flex-col gap-y-0.5">
                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
                                    {k}
                                </span>
                                <span className="text-xs text-foreground font-mono break-all">{v}</span>
                            </div>
                        ))}
                    </div>
                </DetailBlock>

                {/* Output */}
                {isSuccess && record.output && (
                    <DetailBlock label="Output">
                        <JsonBlock value={record.output} />
                    </DetailBlock>
                )}

                {/* Error details */}
                {!isSuccess && record.errorDetails && (
                    <DetailBlock label="Error Details">
                        <div className="flex flex-col gap-y-3">
                            <div className="flex items-start gap-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25">
                                <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col gap-y-0.5">
                                    <p className="text-xs font-semibold text-red-300">
                                        {record.errorDetails.errorType}
                                        {record.errorDetails.httpStatusCode !== null && (
                                            <span className="ml-2 font-normal text-red-400/80">
                                                HTTP {record.errorDetails.httpStatusCode}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-red-200/80">{record.errorDetails.errorMessage}</p>
                                </div>
                            </div>
                            <JsonBlock value={record.errorDetails} />
                        </div>
                    </DetailBlock>
                )}
            </div>
        </div>
    );
};

// ── Public export: renders both success and failed records ────────────────────
export const DataLineageEntryView = () => {
    const [activeRecord, setActiveRecord] = useState<'success' | 'failed'>('success');

    const record = activeRecord === 'success' ? MOCK_LINEAGE_SUCCESS : MOCK_LINEAGE_FAILED;

    return (
        <div className="flex flex-col gap-y-5 max-w-[720px]">
            {/* Record switcher */}
            <div className="flex items-center gap-x-1 p-1 rounded-lg bg-secondary border border-border w-fit">
                {(['success', 'failed'] as const).map(s => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setActiveRecord(s)}
                        className={cn(
                            'px-4 py-1.5 rounded-md text-xs font-semibold transition-colors capitalize',
                            activeRecord === s
                                ? s === 'success'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-red-600 text-white'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {s === 'success' ? 'Success run' : 'Failed run'}
                    </button>
                ))}
            </div>

            <LineageCard record={record} />
        </div>
    );
};
