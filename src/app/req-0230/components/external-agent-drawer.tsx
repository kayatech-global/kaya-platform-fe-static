'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Badge,
    Input,
    Switch,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import {
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronRight,
    Copy,
    Info,
    Loader2,
    RefreshCw,
    Search,
    ShieldCheck,
    Wifi,
    X,
    XCircle,
    CheckCircle2,
    Bot,
    ArrowRight,
    Clock,
    RotateCcw,
    Globe,
    ArrowRightLeft,
    Code2,
    Activity,
    Play,
    Eye,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type ToolType = 'REST' | 'MCP' | 'Vector RAG' | 'Graph RAG' | 'Executable' | 'OpenAPI';
type IOMode = 'sync' | 'stream' | 'async';
type AuthScheme = 'none' | 'bearer' | 'oauth2';
type RetryStrategy = 'none' | 'linear' | 'exponential';
type ExecutionMode = 'synchronous' | 'asynchronous';

interface RemoteSkill {
    id: string;
    name: string;
    toolType: ToolType;
    description: string;
    tags: string[];
    ioModes: IOMode[];
}

/* ─── Mock data ──────────────────────────────────────────────────────────────── */

const MOCK_SKILLS: RemoteSkill[] = [
    {
        id: 'web_search',
        name: 'web_search',
        toolType: 'REST',
        description: 'Searches the public web and returns ranked results with snippets.',
        tags: ['search', 'retrieval'],
        ioModes: ['sync', 'stream'],
    },
    {
        id: 'knowledge_retrieval',
        name: 'knowledge_retrieval',
        toolType: 'Vector RAG',
        description: 'Retrieves semantically similar passages from the primary knowledge store.',
        tags: ['rag', 'embedding'],
        ioModes: ['sync'],
    },
    {
        id: 'graph_query',
        name: 'graph_query',
        toolType: 'Graph RAG',
        description: 'Executes Cypher-like queries against the connected graph database.',
        tags: ['graph', 'structured'],
        ioModes: ['sync', 'async'],
    },
    {
        id: 'mcp_filesystem',
        name: 'mcp_filesystem',
        toolType: 'MCP',
        description: 'Reads and writes files via the MCP filesystem tool server.',
        tags: ['mcp', 'filesystem'],
        ioModes: ['sync'],
    },
    {
        id: 'summarise',
        name: 'summarise',
        toolType: 'Executable',
        description: 'Produces structured summaries from long-form input text.',
        tags: ['nlp', 'text'],
        ioModes: ['sync', 'stream'],
    },
];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const SKILL_TAG_COLORS: Record<string, string> = {
    REST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    MCP: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'Vector RAG': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Graph RAG': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Executable: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    OpenAPI: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

const IO_MODE_LABELS: Record<IOMode, string> = {
    sync: 'Sync',
    stream: 'Stream',
    async: 'Async',
};

function SectionHeader({
    label,
    children,
    open,
    onToggle,
}: {
    label: string;
    children?: React.ReactNode;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-2 text-left group"
        >
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
            </span>
            <div className="flex items-center gap-x-2">
                {children}
                {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
            </div>
        </button>
    );
}

function LabeledField({
    label,
    required,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-1">
                <label className="text-xs font-medium text-foreground">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {hint && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button>
                                    <Info size={11} className="text-muted-foreground hover:text-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[180px]">
                                <p className="text-[11px] leading-relaxed">{hint}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {children}
        </div>
    );
}

/* ─── Fetch Card Section ─────────────────────────────────────────────────────── */

type FetchState = 'idle' | 'loading' | 'success' | 'error';

function FetchCardSection({
    url,
    setUrl,
    fetchState,
    onFetch,
    schemaVersion,
}: {
    url: string;
    setUrl: (v: string) => void;
    fetchState: FetchState;
    onFetch: () => void;
    schemaVersion?: string;
}) {
    return (
        <div className="flex flex-col gap-y-3">
            <LabeledField
                label="Agent Card URL"
                required
                hint="URL pointing to the remote agent's .well-known/agent.json endpoint"
            >
                <div className="flex items-center gap-x-2">
                    <input
                        className="flex-1 h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="https://api.example.com/.well-known/agent.json"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                    <button
                        onClick={onFetch}
                        disabled={!url || fetchState === 'loading'}
                        className={cn(
                            'shrink-0 flex items-center gap-x-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors',
                            'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        {fetchState === 'loading' ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <RefreshCw size={12} />
                        )}
                        Fetch Card
                    </button>
                </div>
            </LabeledField>

            {fetchState === 'success' && (
                <div className="flex items-center gap-x-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={13} className="text-green-600 dark:text-green-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-green-700 dark:text-green-400">
                            Agent card fetched successfully
                        </p>
                        <p className="text-[10px] text-green-600/80 dark:text-green-500/80">5 skills discovered</p>
                    </div>
                    {schemaVersion && (
                        <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                            schema v{schemaVersion}
                        </span>
                    )}
                </div>
            )}

            {fetchState === 'error' && (
                <div className="flex items-center gap-x-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <XCircle size={13} className="text-red-500 shrink-0" />
                    <div>
                        <p className="text-[11px] font-medium text-red-700 dark:text-red-400">Failed to fetch card</p>
                        <p className="text-[10px] text-red-600/80 dark:text-red-500/80">
                            Endpoint unreachable or schema mismatch (expected v0.2.x)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Skills Selector ────────────────────────────────────────────────────────── */

function SkillsSelector({
    skills,
    selectedIds,
    onToggle,
}: {
    skills: RemoteSkill[];
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = skills.filter(
        s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-y-2">
            {/* Search */}
            <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    className="w-full h-7 pl-7 pr-2 rounded-md border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Search skills..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Selected chips */}
            {selectedIds.size > 0 && (
                <div className="flex flex-wrap gap-1">
                    {[...selectedIds].map(id => {
                        const skill = skills.find(s => s.id === id);
                        return skill ? (
                            <span
                                key={id}
                                className="inline-flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            >
                                <ArrowRight size={9} className="opacity-60" />
                                {skill.name}
                                <button
                                    onClick={() => onToggle(id)}
                                    className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100"
                                >
                                    <X size={9} />
                                </button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}

            {/* List */}
            <div className="flex flex-col divide-y divide-border rounded-md border border-border overflow-hidden max-h-[240px] overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">No skills match</div>
                ) : (
                    filtered.map(skill => {
                        const selected = selectedIds.has(skill.id);
                        return (
                            <button
                                key={skill.id}
                                onClick={() => onToggle(skill.id)}
                                className={cn(
                                    'flex items-start gap-x-2.5 px-3 py-2 text-left transition-colors w-full',
                                    selected
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'bg-background hover:bg-muted/40'
                                )}
                            >
                                <div
                                    className={cn(
                                        'mt-0.5 flex-none w-4 h-4 rounded border flex items-center justify-center',
                                        selected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-border bg-background'
                                    )}
                                >
                                    {selected && <Check size={9} className="text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-x-1.5 flex-wrap gap-y-0.5">
                                        <span className="text-[11px] font-medium text-foreground font-mono">
                                            {skill.name}
                                        </span>
                                        <span
                                            className={cn(
                                                'inline-flex px-1.5 py-0 rounded text-[9px] font-medium',
                                                SKILL_TAG_COLORS[skill.toolType]
                                            )}
                                        >
                                            {skill.toolType}
                                        </span>
                                        {skill.ioModes.map(m => (
                                            <span
                                                key={m}
                                                className="inline-flex items-center gap-x-0.5 px-1 py-0 rounded text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                            >
                                                {m === 'stream' && <Wifi size={8} />}
                                                {IO_MODE_LABELS[m]}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                        {skill.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {skill.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="text-[9px] px-1 rounded bg-muted text-muted-foreground"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
            {selectedIds.size > 0 && (
                <p className="text-[10px] text-muted-foreground">
                    {selectedIds.size} skill{selectedIds.size !== 1 ? 's' : ''} selected &rarr; become output ports
                </p>
            )}
        </div>
    );
}

/* ─── Auth Panel ─────────────────────────────────────────────────────────────── */

function AuthPanel({
    scheme,
    setScheme,
}: {
    scheme: AuthScheme;
    setScheme: (s: AuthScheme) => void;
}) {
    const [secretRef, setSecretRef] = useState('');
    const [clientId, setClientId] = useState('');
    const [tokenUrl, setTokenUrl] = useState('');

    const tabs: { value: AuthScheme; label: string }[] = [
        { value: 'none', label: 'None' },
        { value: 'bearer', label: 'Bearer' },
        { value: 'oauth2', label: 'OAuth2' },
    ];

    return (
        <div className="flex flex-col gap-y-3">
            {/* Scheme selector */}
            <div className="flex items-center rounded-md border border-border overflow-hidden text-[11px] font-medium w-fit">
                {tabs.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setScheme(t.value)}
                        className={cn('px-3 py-1.5 transition-colors', {
                            'bg-blue-600 text-white': scheme === t.value,
                            'bg-background text-muted-foreground hover:bg-muted': scheme !== t.value,
                        })}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {scheme === 'bearer' && (
                <LabeledField
                    label="Secret Reference"
                    hint="Reference to a Vault secret holding the bearer token, e.g. vault:prod/external-agent-token"
                >
                    <div className="flex items-center gap-x-0">
                        <span className="flex items-center px-2.5 h-8 text-[11px] bg-muted border border-r-0 border-border rounded-l-md text-muted-foreground font-mono shrink-0">
                            vault:
                        </span>
                        <input
                            className="flex-1 h-8 rounded-r-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="prod/my-agent-token"
                            value={secretRef}
                            onChange={e => setSecretRef(e.target.value)}
                        />
                    </div>
                </LabeledField>
            )}

            {scheme === 'oauth2' && (
                <div className="flex flex-col gap-y-2.5">
                    <LabeledField label="Token URL" required>
                        <input
                            className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="https://auth.example.com/oauth/token"
                            value={tokenUrl}
                            onChange={e => setTokenUrl(e.target.value)}
                        />
                    </LabeledField>
                    <LabeledField label="Client ID" required>
                        <input
                            className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="client_id"
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                        />
                    </LabeledField>
                    <LabeledField
                        label="Client Secret"
                        hint="Reference to Vault secret for the OAuth2 client secret"
                    >
                        <div className="flex items-center gap-x-0">
                            <span className="flex items-center px-2.5 h-8 text-[11px] bg-muted border border-r-0 border-border rounded-l-md text-muted-foreground font-mono shrink-0">
                                vault:
                            </span>
                            <input
                                className="flex-1 h-8 rounded-r-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="prod/oauth2-client-secret"
                            />
                        </div>
                    </LabeledField>
                </div>
            )}

            {scheme === 'none' && (
                <div className="flex items-center gap-x-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        No authentication configured. Ensure the remote agent endpoint is publicly accessible or
                        network-scoped.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Runtime Options ────────────────────────────────────────────────────────── */

function RuntimeOptions() {
    const [streaming, setStreaming] = useState(true);
    const [timeout, setTimeout_] = useState(30);
    const [retry, setRetry] = useState<RetryStrategy>('linear');
    const [executionMode, setExecutionMode] = useState<ExecutionMode>('synchronous');
    const [pollingInterval, setPollingInterval] = useState(5);

    const retryOptions: { value: RetryStrategy; label: string }[] = [
        { value: 'none', label: 'No retry' },
        { value: 'linear', label: 'Linear backoff' },
        { value: 'exponential', label: 'Exponential backoff' },
    ];

    const branchBadges = [
        { label: 'onSuccess', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
        { label: 'onError', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
        { label: 'onTimeout', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    ];

    return (
        <div className="flex flex-col gap-y-3.5">
            {/* Execution Mode */}
            <div className="flex flex-col gap-y-1.5">
                <div className="flex items-center gap-x-1.5">
                    <span className="text-xs font-medium text-foreground">Execution Mode</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button>
                                    <Info size={11} className="text-muted-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[180px]">
                                <p className="text-[11px]">
                                    Sync: wait for response. Async: receive job_id and poll for completion.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setExecutionMode('synchronous')}
                        className={cn(
                            'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                            executionMode === 'synchronous'
                                ? 'bg-blue-600 text-white'
                                : 'bg-background text-muted-foreground hover:bg-muted'
                        )}
                    >
                        Synchronous
                    </button>
                    <button
                        type="button"
                        onClick={() => setExecutionMode('asynchronous')}
                        className={cn(
                            'flex-1 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border',
                            executionMode === 'asynchronous'
                                ? 'bg-blue-600 text-white'
                                : 'bg-background text-muted-foreground hover:bg-muted'
                        )}
                    >
                        Asynchronous
                    </button>
                </div>
            </div>

            {executionMode === 'asynchronous' && (
                <div className="flex flex-col gap-y-1 pl-2 border-l-2 border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Polling Interval</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{pollingInterval}s</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={60}
                        step={1}
                        value={pollingInterval}
                        onChange={e => setPollingInterval(Number(e.target.value))}
                        className="w-full h-1.5 accent-blue-600 cursor-pointer"
                    />
                </div>
            )}

            {/* Streaming */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-1.5">
                    <Wifi size={12} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Streaming</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button>
                                    <Info size={11} className="text-muted-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[180px]">
                                <p className="text-[11px]">
                                    Enable SSE / chunked streaming from the remote agent. Only available if the
                                    agent card declares streaming support.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Switch checked={streaming} onCheckedChange={setStreaming} className="scale-75 origin-right" />
            </div>

            {/* Timeout slider */}
            <div className="flex flex-col gap-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-1.5">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">Timeout Limit</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{timeout}s</span>
                </div>
                <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={timeout}
                    onChange={e => setTimeout_(Number(e.target.value))}
                    className="w-full h-1.5 accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>5s</span>
                    <span>300s</span>
                </div>
            </div>

            {/* Retry strategy */}
            <div className="flex flex-col gap-y-1.5">
                <div className="flex items-center gap-x-1.5">
                    <RotateCcw size={12} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Retry Logic</span>
                </div>
                <select
                    value={retry}
                    onChange={e => setRetry(e.target.value as RetryStrategy)}
                    className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {retryOptions.map(o => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Branch targets */}
            <div className="flex flex-col gap-y-1.5 pt-2 border-t border-border">
                <span className="text-xs font-medium text-foreground">Branch Targets</span>
                <div className="flex flex-wrap gap-1.5">
                    {branchBadges.map(b => (
                        <span
                            key={b.label}
                            className={cn(
                                'inline-flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default',
                                b.color
                            )}
                        >
                            <ArrowRight size={9} />
                            {b.label}
                        </span>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Connect downstream nodes to these branch ports in the canvas.
                </p>
            </div>
        </div>
    );
}

/* ─── Discovery Configuration ───────────────────────────────────────────────── */

function DiscoveryConfiguration() {
    const [autoDiscovery, setAutoDiscovery] = useState(false);
    const [discoveryInterval, setDiscoveryInterval] = useState(60);

    return (
        <div className="flex flex-col gap-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-1.5">
                    <Globe size={12} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Auto-Discovery</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button>
                                    <Info size={11} className="text-muted-foreground" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[180px]">
                                <p className="text-[11px]">
                                    Periodically refresh the Agent Card to detect new skills or endpoint changes.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Switch checked={autoDiscovery} onCheckedChange={setAutoDiscovery} className="scale-75 origin-right" />
            </div>
            {autoDiscovery && (
                <div className="flex flex-col gap-y-1 pl-2 border-l-2 border-sky-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Refresh Interval</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{discoveryInterval} min</span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={1440}
                        step={5}
                        value={discoveryInterval}
                        onChange={e => setDiscoveryInterval(Number(e.target.value))}
                        className="w-full h-1.5 accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>5 min</span>
                        <span>24 hrs</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Task Mapping ──────────────────────────────────────────────────────────── */

function TaskMappingPanel() {
    const [methodName, setMethodName] = useState('execute_task');
    const [inputSchema, setInputSchema] = useState('{\n  "prompt": "{{workflow.user_query}}"\n}');
    const [outputMapping, setOutputMapping] = useState('result.data');

    return (
        <div className="flex flex-col gap-y-3">
            {/* Method Name */}
            <LabeledField
                label="Method Name"
                hint="The JSON-RPC method the agent supports (e.g., execute_task, generate_report)"
            >
                <input
                    className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="execute_task"
                    value={methodName}
                    onChange={e => setMethodName(e.target.value)}
                />
            </LabeledField>

            {/* Input Schema */}
            <LabeledField
                label="Input Schema (JSON)"
                hint='Map workflow variables to agent params using {{workflow.variable}} syntax'
            >
                <div className="relative">
                    <Code2 size={12} className="absolute left-2.5 top-2 text-muted-foreground" />
                    <textarea
                        className="w-full rounded-md border border-border bg-background pl-7 pr-2.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        placeholder={'{\n  "prompt": "{{workflow.user_query}}"\n}'}
                        rows={4}
                        value={inputSchema}
                        onChange={e => setInputSchema(e.target.value)}
                    />
                </div>
            </LabeledField>

            {/* Output Mapping */}
            <LabeledField
                label="Output Mapping"
                hint="JSONPath to extract from agent result (e.g., result.data, response.output)"
            >
                <input
                    className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="result.data"
                    value={outputMapping}
                    onChange={e => setOutputMapping(e.target.value)}
                />
            </LabeledField>
        </div>
    );
}

/* ─── Advanced Monitoring ───────────────────────────────────────────────────── */

function MonitoringPanel({ agentCardUrl }: { agentCardUrl: string }) {
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    const testConnection = async () => {
        setTestStatus('testing');
        setTestMessage('');
        // Simulate async test
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTestStatus('success');
        setTestMessage('Agent is A2A-compliant and reachable. Schema version 0.2.1 detected.');
    };

    const openInspector = () => {
        if (agentCardUrl) {
            window.open(agentCardUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="flex flex-col gap-y-3">
            {/* Test Connection */}
            <div className="flex flex-col gap-y-2">
                <span className="text-xs text-muted-foreground">Capability Check</span>
                <button
                    onClick={testConnection}
                    disabled={testStatus === 'testing' || !agentCardUrl}
                    className="w-full h-8 flex items-center justify-center gap-x-2 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                    {testStatus === 'testing' ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : testStatus === 'success' ? (
                        <CheckCircle2 size={12} className="text-green-500" />
                    ) : testStatus === 'error' ? (
                        <AlertCircle size={12} className="text-red-500" />
                    ) : (
                        <Play size={12} />
                    )}
                    Test Connection
                </button>
                {testMessage && (
                    <div className={cn(
                        'flex items-start gap-x-2 px-3 py-2 rounded-md text-[11px]',
                        testStatus === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                    )}>
                        {testStatus === 'success' ? (
                            <CheckCircle2 size={12} className="shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                        )}
                        <span>{testMessage}</span>
                    </div>
                )}
            </div>

            {/* A2A Inspector Link */}
            <div className="flex flex-col gap-y-2">
                <span className="text-xs text-muted-foreground">A2A Inspector</span>
                <button
                    onClick={openInspector}
                    disabled={!agentCardUrl}
                    className="w-full h-8 flex items-center justify-center gap-x-2 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                    <Eye size={12} />
                    View Raw Agent Card
                    <ExternalLink size={10} className="ml-auto" />
                </button>
                <p className="text-[10px] text-muted-foreground">Opens the agent&apos;s JSON card for debugging and inspection.</p>
            </div>
        </div>
    );
}

/* ─── Validation Banners ─────────────────────────────────────────────────────── */

function ValidationBanners({
    schemaMismatch,
    missingCredentials,
}: {
    schemaMismatch: boolean;
    missingCredentials: boolean;
}) {
    if (!schemaMismatch && !missingCredentials) return null;
    return (
        <div className="flex flex-col gap-y-2">
            {schemaMismatch && (
                <div className="flex items-start gap-x-2 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            Schema version mismatch
                        </p>
                        <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                            Remote agent card reports schema v0.1.x. This workflow requires v0.2.x or higher.
                            Skill signatures may be incompatible.
                        </p>
                    </div>
                </div>
            )}
            {missingCredentials && (
                <div className="flex items-start gap-x-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <ShieldCheck size={13} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                            Missing credentials
                        </p>
                        <p className="text-[10px] text-red-700/80 dark:text-red-500/80 leading-relaxed">
                            Bearer token secret reference is empty. The node will fail at runtime without valid auth.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Main Drawer ────────────────────────────────────────────────────────────── */

interface ExternalAgentDrawerProps {
    onClose?: () => void;
}

export function ExternalAgentDrawer({ onClose }: ExternalAgentDrawerProps) {
    // Card fetch state
    const [cardUrl, setCardUrl] = useState('');
    const [fetchState, setFetchState] = useState<FetchState>('idle');
    const [schemaVersion, setSchemaVersion] = useState<string | undefined>();

    // Basic fields
    const [friendlyName, setFriendlyName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');

    // Skills
    const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

    // Auth
    const [authScheme, setAuthScheme] = useState<AuthScheme>('bearer');

    // Section open states
    const [sectionsOpen, setSectionsOpen] = useState({
        discovery: true,
        skills: true,
        taskMapping: false,
        auth: true,
        runtime: false,
        monitoring: false,
    });

    // Banners
    const [schemaMismatch] = useState(false);
    const [missingCreds] = useState(false);

    const toggleSection = (key: keyof typeof sectionsOpen) => {
        setSectionsOpen(p => ({ ...p, [key]: !p[key] }));
    };

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleFetch = () => {
        setFetchState('loading');
        // Simulate async fetch
        setTimeout(() => {
            if (cardUrl.includes('error')) {
                setFetchState('error');
            } else {
                setFetchState('success');
                setSchemaVersion('0.2.1');
                setFriendlyName(prev => prev || 'External Research Agent');
                setDescription(prev => prev || 'Autonomous research and synthesis agent via A2A protocol.');
            }
        }, 1200);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-x-2">
                    <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <Bot size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground leading-none">External Agent</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">A2A node configuration</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors"
                    >
                        <X size={15} className="text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-y-5 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">

                {/* Validation banners */}
                <ValidationBanners schemaMismatch={schemaMismatch} missingCredentials={missingCreds} />

                {/* Fetch Card */}
                <FetchCardSection
                    url={cardUrl}
                    setUrl={setCardUrl}
                    fetchState={fetchState}
                    onFetch={handleFetch}
                    schemaVersion={schemaVersion}
                />

                {/* Basic info */}
                <div className="flex flex-col gap-y-3">
                    <LabeledField label="Friendly Name" required>
                        <input
                            className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="e.g. Research Agent"
                            value={friendlyName}
                            onChange={e => setFriendlyName(e.target.value)}
                        />
                    </LabeledField>
                    <LabeledField label="Description">
                        <textarea
                            className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            placeholder="What does this agent do?"
                            rows={2}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </LabeledField>
                    <div className="flex items-start gap-x-3">
                        <LabeledField label="Icon URL" hint="Publicly accessible image URL for the node icon">
                            <input
                                className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="https://example.com/icon.svg"
                                value={iconUrl}
                                onChange={e => setIconUrl(e.target.value)}
                            />
                        </LabeledField>
                        {/* Icon preview */}
                        <div className="shrink-0 mt-5">
                            <div className="w-9 h-9 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
                                {iconUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={iconUrl}
                                        alt="icon preview"
                                        className="w-full h-full object-contain"
                                        onError={e => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Bot size={16} className="text-muted-foreground" />
                                )}
                            </div>
                        </div>
                    </div>
                    {schemaVersion && (
                        <LabeledField label="Schema Version">
                            <div className="h-8 flex items-center px-2.5 rounded-md border border-border bg-muted text-xs font-mono text-muted-foreground">
                                {schemaVersion}
                                <span className="ml-2 text-[10px] text-muted-foreground">(read-only)</span>
                            </div>
                        </LabeledField>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Discovery Configuration (NEW) */}
                <div>
                    <SectionHeader
                        label="Discovery Configuration"
                        open={sectionsOpen.discovery}
                        onToggle={() => toggleSection('discovery')}
                    >
                        <Globe size={13} className="text-sky-500" />
                    </SectionHeader>
                    {sectionsOpen.discovery && (
                        <div className="mt-2">
                            <DiscoveryConfiguration />
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Remote Skills */}
                <div>
                    <SectionHeader
                        label={`Remote Skills${selectedSkills.size > 0 ? ` (${selectedSkills.size})` : ''}`}
                        open={sectionsOpen.skills}
                        onToggle={() => toggleSection('skills')}
                    />
                    {sectionsOpen.skills && (
                        <div className="mt-2">
                            {fetchState === 'success' ? (
                                <SkillsSelector
                                    skills={MOCK_SKILLS}
                                    selectedIds={selectedSkills}
                                    onToggle={toggleSkill}
                                />
                            ) : (
                                <div className="flex items-center gap-x-2 px-3 py-3 rounded-md border border-dashed border-border text-[11px] text-muted-foreground">
                                    <RefreshCw size={12} className="opacity-50" />
                                    Fetch an agent card to discover available skills
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Task Mapping (NEW) */}
                <div>
                    <SectionHeader
                        label="Task Mapping"
                        open={sectionsOpen.taskMapping}
                        onToggle={() => toggleSection('taskMapping')}
                    >
                        <ArrowRightLeft size={13} className="text-emerald-500" />
                    </SectionHeader>
                    {sectionsOpen.taskMapping && (
                        <div className="mt-2">
                            <TaskMappingPanel />
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Auth */}
                <div>
                    <SectionHeader
                        label="Authentication"
                        open={sectionsOpen.auth}
                        onToggle={() => toggleSection('auth')}
                        >
                        <ShieldCheck size={13} className="text-green-500" />
                    </SectionHeader>
                    {sectionsOpen.auth && (
                        <div className="mt-2">
                            <AuthPanel scheme={authScheme} setScheme={setAuthScheme} />
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Runtime */}
                <div>
                    <SectionHeader
                        label="Runtime & Execution"
                        open={sectionsOpen.runtime}
                        onToggle={() => toggleSection('runtime')}
                    />
                    {sectionsOpen.runtime && (
                        <div className="mt-2">
                            <RuntimeOptions />
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Advanced Monitoring (NEW) */}
                <div>
                    <SectionHeader
                        label="Advanced Monitoring"
                        open={sectionsOpen.monitoring}
                        onToggle={() => toggleSection('monitoring')}
                    >
                        <Activity size={13} className="text-rose-500" />
                    </SectionHeader>
                    {sectionsOpen.monitoring && (
                        <div className="mt-2">
                            <MonitoringPanel agentCardUrl={cardUrl} />
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 px-4 py-3 border-t border-border flex items-center justify-between gap-x-2">
                <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onClose}
                >
                    Discard
                </button>
                <div className="flex items-center gap-x-2">
                    <button className="h-8 px-3 rounded-md border border-border text-xs font-medium text-foreground bg-background hover:bg-muted transition-colors">
                        Validate
                    </button>
                    <button className="h-8 px-3 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">
                        Apply Node
                    </button>
                </div>
            </div>
        </div>
    );
}
