'use client';

import React, { useState } from 'react';
import {
    Wrench,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Code2,
    Rows3,
    AlertCircle,
    Globe,
    ListFilter,
    AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/atoms/switch';
import {
    MOCK_TOOL_CONFIG,
    WORKFLOW_VARIABLES,
    ERROR_SCHEMA_PREVIEW,
    type HttpMethod,
    type MappingMode,
    type KeyValuePair,
    type VariableMapping,
    type ToolType,
    type ToolExecutorNodeConfig,
} from '../mock-data';

// ── Local primitives (avoid importing full shadcn barrel to keep file clean) ──
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={cn('text-xs font-medium text-muted-foreground', className)}>{children}</label>
);

const Section = ({
    title,
    icon,
    children,
    className,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('border border-border rounded-lg p-4 flex flex-col gap-y-4', className)}>
        <div className="flex items-center gap-x-2">
            <div className="w-6 h-6 flex items-center justify-center text-cyan-500">{icon}</div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        {children}
    </div>
);

const TextInput = ({
    value,
    onChange,
    placeholder,
    className,
    readOnly,
    mono,
}: {
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    mono?: boolean;
}) => (
    <input
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
            'w-full rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors',
            mono && 'font-mono',
            readOnly && 'opacity-60 cursor-default',
            className,
        )}
    />
);

const SelectInput = ({
    value,
    onChange,
    options,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    className?: string;
}) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
            'rounded-md border border-border bg-secondary text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none cursor-pointer',
            className,
        )}
    >
        {options.map(o => (
            <option key={o.value} value={o.value}>
                {o.label}
            </option>
        ))}
    </select>
);

const HTTP_METHODS: { label: string; value: HttpMethod }[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
];

const TOOL_TYPES: { label: string; value: ToolType }[] = [
    { label: 'REST API', value: 'REST_API' },
    { label: 'MCP Server', value: 'MCP' },
    { label: 'Database', value: 'DATABASE' },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
    string: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    number: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    boolean: 'bg-green-500/15 text-green-400 border-green-500/30',
    object: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    array: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

// ── Variable interpolation inline preview ────────────────────────────────────
const UrlPreview = ({ url }: { url: string }) => {
    const parts = url.split(/({{Variable:[^}]+}})/g);
    return (
        <p className="text-xs text-muted-foreground font-mono mt-1 break-all leading-relaxed">
            {parts.map((part, i) =>
                part.startsWith('{{Variable:') ? (
                    <span key={i} className="text-cyan-400 font-semibold">
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                ),
            )}
        </p>
    );
};

// ── Key-Value table (headers / query params) ─────────────────────────────────
const KVTable = ({
    pairs,
    onChange,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
}: {
    pairs: KeyValuePair[];
    onChange: (pairs: KeyValuePair[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
}) => {
    const update = (idx: number, field: 'key' | 'value', val: string) => {
        const next = [...pairs];
        next[idx] = { ...next[idx], [field]: val };
        onChange(next);
    };

    const remove = (idx: number) => onChange(pairs.filter((_, i) => i !== idx));

    const add = () => onChange([...pairs, { key: '', value: '' }]);

    return (
        <div className="flex flex-col gap-y-2">
            {pairs.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_28px] gap-x-2 items-center">
                    <Label>Key</Label>
                    <Label>Value</Label>
                    <span />
                </div>
            )}
            {pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_28px] gap-x-2 items-center">
                    <TextInput
                        value={pair.key}
                        onChange={v => update(i, 'key', v)}
                        placeholder={keyPlaceholder}
                        mono
                    />
                    <TextInput
                        value={pair.value}
                        onChange={v => update(i, 'value', v)}
                        placeholder={valuePlaceholder}
                        mono
                    />
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove row"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="flex items-center gap-x-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors w-fit"
            >
                <Plus size={12} />
                Add row
            </button>
        </div>
    );
};

// ── Variable Mapping Row ──────────────────────────────────────────────────────
const MappingRow = ({
    mapping,
    onChange,
}: {
    mapping: VariableMapping;
    onChange: (m: VariableMapping) => void;
}) => {
    const badgeCls = TYPE_BADGE_COLORS[mapping.param.type] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30';

    return (
        <div className="grid grid-cols-[160px_72px_1fr] gap-x-3 items-center py-2 border-b border-border last:border-0">
            {/* Param name + required star */}
            <div className="flex flex-col gap-y-0.5 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {mapping.param.name}
                    {mapping.param.required && (
                        <span className="text-red-400 ml-0.5" aria-label="required">
                            *
                        </span>
                    )}
                </p>
                <p className="text-[10px] text-muted-foreground truncate" title={mapping.param.description}>
                    {mapping.param.description}
                </p>
            </div>

            {/* Type badge */}
            <span
                className={cn(
                    'inline-flex items-center justify-center text-[10px] font-semibold rounded border px-2 py-0.5 w-fit',
                    badgeCls,
                )}
            >
                {mapping.param.type}
            </span>

            {/* Mode toggle + input */}
            <div className="flex items-center gap-x-2 min-w-0">
                <button
                    type="button"
                    title={mapping.mode === 'variable' ? 'Switch to static value' : 'Switch to variable'}
                    onClick={() =>
                        onChange({ ...mapping, mode: (mapping.mode === 'variable' ? 'static' : 'variable') as MappingMode })
                    }
                    className={cn(
                        'flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border transition-colors',
                        mapping.mode === 'variable'
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                            : 'bg-secondary border-border text-muted-foreground hover:text-foreground',
                    )}
                >
                    {mapping.mode === 'variable' ? '{{Var}}' : 'Static'}
                </button>
                {mapping.mode === 'variable' ? (
                    <select
                        value={mapping.variableRef}
                        onChange={e => onChange({ ...mapping, variableRef: e.target.value })}
                        className="flex-1 min-w-0 rounded-md border border-border bg-secondary text-foreground text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer font-mono"
                    >
                        <option value="">— pick variable —</option>
                        {WORKFLOW_VARIABLES.map(v => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                ) : (
                    <TextInput
                        value={mapping.staticValue}
                        onChange={v => onChange({ ...mapping, staticValue: v })}
                        placeholder="Enter static value"
                        className="flex-1 min-w-0 text-xs py-1.5"
                        mono
                    />
                )}
            </div>
        </div>
    );
};

// ── Error state preview section ───────────────────────────────────────────────
const ErrorStatePreview = ({ propagate, onToggle }: { propagate: boolean; onToggle: () => void }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/60">
                <div className="flex items-center gap-x-2">
                    <AlertCircle size={15} className="text-red-400" />
                    <p className="text-sm font-semibold text-foreground">Error Handling</p>
                </div>
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse error section' : 'Expand error section'}
                >
                    {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
            </div>

            {expanded && (
                <div className="px-4 py-4 flex flex-col gap-y-4">
                    {/* Propagate toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                Propagate structured error to downstream nodes
                            </p>
                            <p className="text-xs text-muted-foreground">
                                When enabled, downstream nodes receive the full error object instead of halting.
                            </p>
                        </div>
                        <Switch checked={propagate} onCheckedChange={onToggle} aria-label="Propagate error" />
                    </div>

                    {/* Error shape preview */}
                    {propagate && (
                        <div className="flex flex-col gap-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Error object shape
                            </p>
                            <div className="rounded-md bg-gray-950 border border-gray-800 p-3 overflow-x-auto">
                                <pre className="text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre">
                                    {`{
  "errorType":     "${ERROR_SCHEMA_PREVIEW.errorType}",
  "errorMessage":  "string  // human-readable description",
  "httpStatusCode": ${ERROR_SCHEMA_PREVIEW.httpStatusCode},
  "toolName":      "string  // name of the tool that failed",
  "timestamp":     "string  // ISO 8601",
  "success":       false
}`}
                                </pre>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Access via{' '}
                                <code className="text-cyan-400 font-mono">{'{{Variable:tool_exec_error}}'}</code> in
                                downstream node prompt or condition.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main form ─────────────────────────────────────────────────────────────────
export const ToolExecutorForm = () => {
    const [config, setConfig] = useState<ToolExecutorNodeConfig>(MOCK_TOOL_CONFIG);
    const [rawJsonMode, setRawJsonMode] = useState(false);
    const [additionalTools, setAdditionalTools] = useState<string[]>([]);

    // ── helpers ──────────────────────────────────────────────────────────────
    const setRestConfig = (patch: Partial<typeof config.restApiConfig>) =>
        setConfig(c => ({ ...c, restApiConfig: { ...c.restApiConfig, ...patch } }));

    const setMapping = (idx: number, m: VariableMapping) =>
        setConfig(c => {
            const next = [...c.inputMappings];
            next[idx] = m;
            return { ...c, inputMappings: next };
        });

    const rawJson = JSON.stringify(
        Object.fromEntries(
            config.inputMappings.map(m => [
                m.param.name,
                m.mode === 'variable' ? m.variableRef : m.staticValue,
            ]),
        ),
        null,
        2,
    );

    return (
        <div className="flex flex-col gap-y-5 p-5 max-w-[680px]">
            {/* ── Node Identity ─────────────────────────────────────────── */}
            <Section title="Node Identity" icon={<Wrench size={15} />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-y-1.5">
                        <Label>Node name</Label>
                        <TextInput
                            value={config.nodeName}
                            onChange={v => setConfig(c => ({ ...c, nodeName: v }))}
                            placeholder="e.g. fetch_customer_profile"
                            mono
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Used as the variable prefix for outputs:{' '}
                            <code className="text-cyan-400 font-mono">{'{{Variable:<node_name>.*}}'}</code>
                        </p>
                    </div>
                    <div className="flex flex-col gap-y-1.5">
                        <Label>Tool type</Label>
                        <SelectInput
                            value={config.toolType}
                            onChange={v => setConfig(c => ({ ...c, toolType: v as ToolType }))}
                            options={TOOL_TYPES}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Add another tool CTA */}
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                        {additionalTools.length === 0
                            ? 'Running in single-tool mode'
                            : `${additionalTools.length + 1} tools configured (multi-tool mode)`}
                    </p>
                    <button
                        type="button"
                        onClick={() => setAdditionalTools(t => [...t, ''])}
                        className="flex items-center gap-x-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                        <Plus size={12} />
                        Add another tool
                    </button>
                </div>
                {additionalTools.map((_, i) => (
                    <div key={i} className="flex items-center gap-x-2">
                        <SelectInput
                            value="REST_API"
                            onChange={() => {}}
                            options={TOOL_TYPES}
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => setAdditionalTools(t => t.filter((__, j) => j !== i))}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove tool"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </Section>

            {/* ── REST API Config (shown when toolType === REST_API) ───── */}
            {config.toolType === 'REST_API' && (
                <Section title="REST API Configuration" icon={<Globe size={15} />}>
                    {/* URL + method */}
                    <div className="flex flex-col gap-y-1.5">
                        <Label>Endpoint URL</Label>
                        <div className="flex items-center gap-x-2">
                            <SelectInput
                                value={config.restApiConfig.method}
                                onChange={v => setRestConfig({ method: v as HttpMethod })}
                                options={HTTP_METHODS}
                                className="w-24 flex-shrink-0"
                            />
                            <TextInput
                                value={config.restApiConfig.url}
                                onChange={v => setRestConfig({ url: v })}
                                placeholder="https://api.example.com/v1/..."
                                className="flex-1"
                                mono
                            />
                        </div>
                        <UrlPreview url={config.restApiConfig.url} />
                    </div>

                    {/* Headers */}
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex items-center gap-x-1.5">
                            <ListFilter size={12} className="text-muted-foreground" />
                            <Label>Headers</Label>
                        </div>
                        <KVTable
                            pairs={config.restApiConfig.headers}
                            onChange={headers => setRestConfig({ headers })}
                            keyPlaceholder="Header name"
                            valuePlaceholder="Header value"
                        />
                    </div>

                    {/* Query params */}
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex items-center gap-x-1.5">
                            <ListFilter size={12} className="text-muted-foreground" />
                            <Label>Query Parameters</Label>
                        </div>
                        <KVTable
                            pairs={config.restApiConfig.queryParams}
                            onChange={queryParams => setRestConfig({ queryParams })}
                            keyPlaceholder="Param name"
                            valuePlaceholder="Param value"
                        />
                    </div>

                    {/* Request body (shown for non-GET) */}
                    {config.restApiConfig.method !== 'GET' && (
                        <div className="flex flex-col gap-y-1.5">
                            <div className="flex items-center gap-x-1.5">
                                <AlignLeft size={12} className="text-muted-foreground" />
                                <Label>Request Body (JSON)</Label>
                            </div>
                            <textarea
                                value={config.restApiConfig.requestBody}
                                onChange={e => setRestConfig({ requestBody: e.target.value })}
                                placeholder={'{\n  "key": "value"\n}'}
                                rows={5}
                                className="w-full rounded-md border border-border bg-secondary text-foreground text-xs font-mono px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
                            />
                        </div>
                    )}
                </Section>
            )}

            {/* ── Variable Mapping ──────────────────────────────────────── */}
            <Section title="Input Parameter Mapping" icon={<Rows3 size={15} />}>
                {/* Mode toggle */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Map each tool input to a workflow variable or static value.
                    </p>
                    <button
                        type="button"
                        onClick={() => setRawJsonMode(v => !v)}
                        className={cn(
                            'flex items-center gap-x-1.5 text-xs font-medium rounded-md px-3 py-1.5 border transition-colors',
                            rawJsonMode
                                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                                : 'bg-secondary border-border text-muted-foreground hover:text-foreground',
                        )}
                        aria-label="Toggle raw JSON mode"
                    >
                        <Code2 size={12} />
                        {rawJsonMode ? 'Visual mode' : 'Advanced / Raw JSON'}
                    </button>
                </div>

                {rawJsonMode ? (
                    <div className="flex flex-col gap-y-1.5">
                        <Label>Raw JSON mapping</Label>
                        <textarea
                            value={rawJson}
                            rows={8}
                            readOnly
                            className="w-full rounded-md border border-border bg-gray-950 text-gray-300 text-xs font-mono px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none opacity-90"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Read-only in this preview. In production, this editor is fully editable (Monaco).
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Column headers */}
                        <div className="grid grid-cols-[160px_72px_1fr] gap-x-3 pb-2 border-b border-border">
                            <Label>Parameter</Label>
                            <Label>Type</Label>
                            <Label>Value / Variable</Label>
                        </div>
                        {config.inputMappings.map((m, i) => (
                            <MappingRow key={m.param.name} mapping={m} onChange={updated => setMapping(i, updated)} />
                        ))}
                    </div>
                )}
            </Section>

            {/* ── Error Handling ────────────────────────────────────────── */}
            <ErrorStatePreview
                propagate={config.propagateError}
                onToggle={() => setConfig(c => ({ ...c, propagateError: !c.propagateError }))}
            />

            {/* ── Save footer ───────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-x-2 pt-2">
                <button
                    type="button"
                    className="rounded-md border border-border bg-secondary text-foreground text-sm px-4 py-2 hover:bg-muted transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 transition-colors flex items-center gap-x-1.5"
                >
                    <Wrench size={14} />
                    Save Configuration
                </button>
            </div>
        </div>
    );
};
