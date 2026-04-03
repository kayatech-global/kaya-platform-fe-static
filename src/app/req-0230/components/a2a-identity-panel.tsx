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
    toolType: 'REST' | 'MCP' | 'Vector RAG' | 'Graph RAG' | 'Executable' | 'DB Connector';
    skillName?: string;
    hasMissingMeta: boolean;
}

interface A2AIdentityPanelProps {
    agentName?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

const SKILL_TAG_COLORS: Record<string, string> = {
    REST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'REST x2': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    MCP: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'MCP x2': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'Vector RAG': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Graph RAG': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Executable: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'Executable x2': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'DB Connector': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

const MOCK_TOOL_SKILLS: ToolSkillRow[] = [
    { toolName: 'validate-roster-data', toolType: 'Executable', skillName: 'roster_data_validation', hasMissingMeta: false },
    { toolName: 'nppes-credential-verification', toolType: 'REST', skillName: 'nppes_credential_verification', hasMissingMeta: false },
    { toolName: 'caqh-proview-lookup', toolType: 'REST', skillName: 'caqh_proview_provider_lookup', hasMissingMeta: false },
    { toolName: 'pdm-system-mcp', toolType: 'MCP', skillName: 'provider_data_management_system', hasMissingMeta: false },
    { toolName: 'plm-lifecycle-mcp', toolType: 'MCP', skillName: 'provider_lifecycle_management', hasMissingMeta: false },
    { toolName: 'compliance-vector-rag', toolType: 'Vector RAG', skillName: 'healthcare_compliance_knowledge_retrieval', hasMissingMeta: false },
    { toolName: 'provider-network-graph-rag', toolType: 'Graph RAG', skillName: 'provider_network_graph_reasoning', hasMissingMeta: false },
    { toolName: 'roster-db-query', toolType: 'DB Connector', skillName: 'roster_database_query', hasMissingMeta: false },
];

const AGENT_CARD_JSON = {
    schemaVersion: '0.3',
    name: 'Provider Roster Validation Agent',
    description: 'Ingests, validates, and transforms healthcare provider roster data across 50+ input formats. Applies unified validation rules, credential verification via NPPES/CAQH, and maintains immutable audit trail for CMS/NCQA regulatory compliance.',
    url: 'https://kaya.techlabsglobal.com/ws/bgc-workspace/wf/bgc-prv/agents/provider-roster-validation/a2a',
    version: '1.4.0',
    provider: { organization: 'TechLabs Global — BGC Workspace' },
    capabilities: { streaming: true, pushNotifications: true, stateTransitionHistory: true },
    securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        oauth2: { type: 'oauth2', flows: { clientCredentials: { tokenUrl: 'https://kaya.techlabsglobal.com/oauth/token' } } },
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['application/json', 'text/plain'],
    skills: [
        { id: 'validate-roster-data', name: 'Roster Data Validation', toolType: 'KAYA_EXECUTABLE_FUNCTION', tags: ['healthcare', 'validation', 'roster', 'npi', 'taxonomy'], inputModes: ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], outputModes: ['application/json'] },
        { id: 'nppes-credential-verification', name: 'NPPES Credential Verification', toolType: 'KAYA_REST_API_CONNECTOR', tags: ['rest-api', 'nppes', 'credentialing', 'npi'] },
        { id: 'caqh-proview-lookup', name: 'CAQH ProView Provider Lookup', toolType: 'KAYA_REST_API_CONNECTOR', tags: ['rest-api', 'caqh', 'proview', 'credentialing'] },
        { id: 'pdm-system-mcp', name: 'Provider Data Management System', toolType: 'KAYA_MCP_CONNECTOR', tags: ['mcp', 'pdm', 'provider-management', 'reconciliation'] },
        { id: 'plm-lifecycle-mcp', name: 'Provider Lifecycle Management', toolType: 'KAYA_MCP_CONNECTOR', tags: ['mcp', 'lifecycle', 'onboarding', 'termination'] },
        { id: 'compliance-vector-rag', name: 'Healthcare Compliance Knowledge Retrieval', toolType: 'KAYA_VECTOR_RAG', tags: ['vector-rag', 'cms', 'ncqa', 'compliance', 'knowledge-base'] },
        { id: 'provider-network-graph-rag', name: 'Provider Network Graph Reasoning', toolType: 'KAYA_GRAPH_RAG', tags: ['graph-rag', 'network-analysis', 'affiliations', 'coverage-gaps'] },
        { id: 'roster-db-query', name: 'Roster Database Query', toolType: 'KAYA_DB_CONNECTOR', tags: ['database', 'postgresql', 'reconciliation', 'bulk-ops'] },
    ],
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
                                v{AGENT_CARD_JSON.schemaVersion}
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
                        Version: <code className="font-mono">{AGENT_CARD_JSON.version}</code>
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

export function A2AIdentityPanel({ agentName = 'Provider Roster Validation Agent' }: A2AIdentityPanelProps) {
    const [enabled, setEnabled] = useState(true);
    const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
    const uri = 'agent://kaya/bgc-workspace/bgc-prv/provider-roster-validation-v1.4.0';
    const skillTags = ['REST x2', 'MCP x2', 'Vector RAG', 'Graph RAG', 'Executable', 'DB Connector'];

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
