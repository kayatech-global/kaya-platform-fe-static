'use client';

import React, { useState } from 'react';
import {
    Badge,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Switch,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components';
import { cn } from '@/lib/utils';
import {
    Copy,
    Check,
    Info,
    Eye,
    Wifi,
    ShieldCheck,
    AlertTriangle,
    ExternalLink,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface ToolSkillRow {
    toolName: string;
    toolType: 'REST' | 'MCP' | 'Vector RAG' | 'Graph RAG' | 'Executable';
    skillName?: string;
    hasMissingMeta: boolean;
}

interface A2AIdentityPanelProps {
    agentName?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const SKILL_TAG_COLORS: Record<string, string> = {
    REST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    MCP: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'Vector RAG': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Graph RAG': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Executable: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

const MOCK_TOOL_SKILLS: ToolSkillRow[] = [
    { toolName: 'search-api', toolType: 'REST', skillName: 'web_search', hasMissingMeta: false },
    { toolName: 'rag-store-primary', toolType: 'Vector RAG', skillName: 'knowledge_retrieval', hasMissingMeta: false },
    { toolName: 'mcp-server-tools', toolType: 'MCP', skillName: undefined, hasMissingMeta: true },
    { toolName: 'graph-db-connector', toolType: 'Graph RAG', skillName: 'graph_query', hasMissingMeta: false },
    { toolName: 'lambda-processor', toolType: 'Executable', skillName: undefined, hasMissingMeta: true },
];

const AGENT_CARD_JSON = {
    schema_version: '0.2.1',
    agent_id: 'agt_7f3a9c2e',
    name: 'Research & Synthesis Agent',
    description: 'Autonomous agent for multi-source research, synthesis, and structured reporting.',
    skills: [
        { id: 'web_search', type: 'REST', streaming: true, auth_required: false },
        { id: 'knowledge_retrieval', type: 'VectorRAG', streaming: false, auth_required: true },
        { id: 'graph_query', type: 'GraphRAG', streaming: false, auth_required: true },
    ],
    streaming: true,
    auth: { scheme: 'bearer' },
    discovery: { visibility: 'public' },
};

/* ─── Copy Button ────────────────────────────────────────────────────────────── */

function CopyButton({ text, size = 'sm' }: { text: string; size?: 'xs' | 'sm' }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="shrink-0 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Copy to clipboard"
        >
            {copied ? (
                <Check size={size === 'xs' ? 11 : 13} className="text-green-500" />
            ) : (
                <Copy size={size === 'xs' ? 11 : 13} className="text-gray-400" />
            )}
        </button>
    );
}

/* ─── JSON Modal ─────────────────────────────────────────────────────────────── */

function AgentCardModal() {
    const jsonStr = JSON.stringify(AGENT_CARD_JSON, null, 2);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonStr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex items-center gap-x-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <Eye size={13} />
                    View A2A Card
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[580px] p-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <DialogTitle className="text-sm font-semibold text-foreground">
                                Agent Card Preview
                            </DialogTitle>
                            <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400"
                            >
                                v0.2.1
                            </Badge>
                        </div>
                        <div className="flex items-center gap-x-2 mr-6">
                            <span className="flex items-center gap-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                <Wifi size={10} />
                                Streaming
                            </span>
                            <span className="flex items-center gap-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                <ShieldCheck size={10} />
                                Bearer Auth
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {AGENT_CARD_JSON.skills.length} skills
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="relative">
                    <pre className="text-[11px] font-mono leading-relaxed p-5 max-h-[400px] overflow-auto bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
                        {jsonStr}
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 flex items-center gap-x-1 text-[11px] font-medium px-2.5 py-1 rounded bg-white dark:bg-gray-800 border border-border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={11} className="text-green-500" />
                                <span className="text-green-600 dark:text-green-400">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy size={11} className="text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">Copy JSON</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                        Agent ID: <code className="font-mono">{AGENT_CARD_JSON.agent_id}</code>
                    </p>
                    <button className="flex items-center gap-x-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                        <ExternalLink size={11} />
                        Open full spec
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Tool-to-Skill Mapping Table ────────────────────────────────────────────── */

function ToolSkillTable() {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? MOCK_TOOL_SKILLS : MOCK_TOOL_SKILLS.slice(0, 3);

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Tool → Skill Mapping
                </span>
                {MOCK_TOOL_SKILLS.some(r => r.hasMissingMeta) && (
                    <span className="flex items-center gap-x-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        <AlertTriangle size={10} />
                        {MOCK_TOOL_SKILLS.filter(r => r.hasMissingMeta).length} missing metadata
                    </span>
                )}
            </div>
            <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-[11px]">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="text-left px-2.5 py-1.5 font-semibold text-muted-foreground">Tool</th>
                            <th className="text-left px-2.5 py-1.5 font-semibold text-muted-foreground">Type</th>
                            <th className="text-left px-2.5 py-1.5 font-semibold text-muted-foreground">Skill ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((row, i) => (
                            <tr
                                key={row.toolName}
                                className={cn('border-t border-border transition-colors', {
                                    'bg-amber-50/60 dark:bg-amber-900/10': row.hasMissingMeta,
                                    'hover:bg-muted/30': !row.hasMissingMeta,
                                    'hover:bg-amber-50 dark:hover:bg-amber-900/20': row.hasMissingMeta,
                                })}
                            >
                                <td className="px-2.5 py-1.5 font-mono text-foreground">{row.toolName}</td>
                                <td className="px-2.5 py-1.5">
                                    <span
                                        className={cn(
                                            'inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium',
                                            SKILL_TAG_COLORS[row.toolType]
                                        )}
                                    >
                                        {row.toolType}
                                    </span>
                                </td>
                                <td className="px-2.5 py-1.5">
                                    {row.hasMissingMeta ? (
                                        <span className="flex items-center gap-x-1 text-amber-600 dark:text-amber-400 font-medium">
                                            <AlertTriangle size={10} />
                                            Missing metadata
                                        </span>
                                    ) : (
                                        <code className="text-foreground">{row.skillName}</code>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {MOCK_TOOL_SKILLS.length > 3 && (
                <button
                    onClick={() => setExpanded(p => !p)}
                    className="mt-1.5 flex items-center gap-x-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded ? 'Show less' : `Show ${MOCK_TOOL_SKILLS.length - 3} more`}
                </button>
            )}
        </div>
    );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────────── */

export function A2AIdentityPanel({ agentName = 'Research & Synthesis Agent' }: A2AIdentityPanelProps) {
    const [enabled, setEnabled] = useState(true);
    const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
    const uri = 'kaya://agents/agt_7f3a9c2e/.well-known/agent.json';
    const skillTags = ['REST', 'Vector RAG', 'MCP', 'Graph RAG', 'Executable'];

    return (
        <section className="flex flex-col gap-y-4">
            {/* Header */}
            <div className="flex items-center gap-x-2">
                <span className="text-sm font-semibold text-foreground">A2A Identity</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm">
                    NEW
                </span>
            </div>

            {/* Status + CTA row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <span
                        className={cn(
                            'inline-flex items-center gap-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                            enabled
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        )}
                    >
                        <span
                            className={cn('w-1.5 h-1.5 rounded-full', enabled ? 'bg-green-500' : 'bg-gray-400')}
                        />
                        {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                        checked={enabled}
                        onCheckedChange={setEnabled}
                        className="scale-75 origin-left"
                        aria-label="Toggle A2A Identity"
                    />
                </div>
                <AgentCardModal />
            </div>

            {/* URI chip */}
            <div className="flex items-center gap-x-1.5 bg-gray-50 dark:bg-gray-800/60 border border-border rounded-md px-2.5 py-1.5 min-w-0">
                <code className="text-[11px] font-mono text-muted-foreground truncate flex-1">{uri}</code>
                <CopyButton text={uri} size="xs" />
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-1.5">
                {skillTags.map(tag => (
                    <span
                        key={tag}
                        className={cn(
                            'inline-flex px-2 py-0.5 rounded text-[10px] font-medium',
                            SKILL_TAG_COLORS[tag] ?? 'bg-gray-100 text-gray-600'
                        )}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Discovery visibility */}
            <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-x-1.5">
                    <span className="text-xs text-muted-foreground font-medium">Discovery</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button aria-label="Discovery visibility info">
                                    <Info size={12} className="text-muted-foreground hover:text-foreground transition-colors" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[200px]">
                                <p className="text-[11px] leading-relaxed">
                                    <strong>Public</strong> — the agent&apos;s A2A card is listed in the Kaya discovery
                                    registry and visible to other authenticated workspaces.
                                    <br />
                                    <strong>Private</strong> — the card is only resolvable via direct URI.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center rounded-md border border-border overflow-hidden text-[11px] font-medium">
                    {(['Public', 'Private'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setVisibility(v)}
                            className={cn('px-2.5 py-1 transition-colors', {
                                'bg-blue-600 text-white': visibility === v,
                                'bg-background text-muted-foreground hover:bg-muted': visibility !== v,
                            })}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tool → Skill mapping table */}
            <ToolSkillTable />
        </section>
    );
}
