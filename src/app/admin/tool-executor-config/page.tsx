'use client';

import React, { useState } from 'react';
import { Wrench, LayoutGrid, AlertCircle, GitFork, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToolExecutorForm } from './components/tool-executor-form';
import { ToolExecutorCanvasPreview } from './components/tool-executor-canvas-node';
import { DataLineageEntryView } from './components/data-lineage-entry';
import { MOCK_TOOL_CONFIG } from './mock-data';

// ── Tab definition ────────────────────────────────────────────────────────────
const TABS = [
    {
        id: 'form',
        label: 'Configuration Form',
        icon: <Wrench size={14} />,
        description: 'Node name, tool type, REST API config, variable mapping, and error handling.',
    },
    {
        id: 'canvas',
        label: 'Canvas Node',
        icon: <LayoutGrid size={14} />,
        description: 'How the Tool Executor node appears on the workflow canvas.',
    },
    {
        id: 'lineage',
        label: 'Data Lineage',
        icon: <GitFork size={14} />,
        description: 'Execution record card shown in the data lineage explorer.',
    },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Page header ───────────────────────────────────────────────────────────────
const PageHeader = () => (
    <div className="border-b border-border bg-background px-6 py-5 flex flex-col gap-y-2">
        <div className="flex items-center gap-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-600/30 flex items-center justify-center flex-shrink-0">
                <Wrench size={18} className="text-cyan-400" strokeWidth={1.5} />
            </div>
            <div>
                <div className="flex items-center gap-x-2">
                    <h1 className="text-lg font-semibold text-foreground text-balance">
                        Tool Executor Node — Enhanced Configuration
                    </h1>
                    <span className="inline-flex items-center rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                        REQ-017
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                    A workflow node that executes external tools — REST APIs, MCP servers, databases — without an LLM.
                    Configure inputs, map variables, and handle errors deterministically.
                </p>
            </div>
        </div>

        {/* Callout */}
        <div className="flex items-start gap-x-2 mt-1 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <Info size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
                This page is the design reference and interactive preview for REQ-017. Use the tabs below to explore
                each screen: the right-side configuration drawer, the canvas node visual, and the data lineage entry
                card. All data is mocked on the{' '}
                <strong className="text-foreground">&ldquo;Fetch Customer Profile&rdquo;</strong> REST API example.
            </p>
        </div>
    </div>
);

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TabBar = ({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) => (
    <div className="border-b border-border px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="flex items-center gap-x-0" role="tablist">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active === tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'flex items-center gap-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                        active === tab.id
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                    )}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </nav>
    </div>
);

// ── Tab description bar ───────────────────────────────────────────────────────
const TabDescription = ({ tab }: { tab: (typeof TABS)[number] }) => (
    <div className="flex items-center gap-x-2 px-6 py-2.5 bg-secondary/30 border-b border-border">
        <span className="text-muted-foreground">{tab.icon}</span>
        <p className="text-xs text-muted-foreground">{tab.description}</p>
    </div>
);

// ── Canvas tab wrapper ────────────────────────────────────────────────────────
const CanvasTab = () => (
    <div className="flex flex-col gap-y-6 p-6 max-w-[720px]">
        <div className="flex flex-col gap-y-1">
            <p className="text-sm font-semibold text-foreground">Node Preview</p>
            <p className="text-xs text-muted-foreground">
                Cyan-600 colour scheme with wrench icon, &ldquo;Tool Executor&rdquo; label, configured tool name as
                subtitle, and decorative left/right handles. Click the node to toggle selection state.
            </p>
        </div>

        <ToolExecutorCanvasPreview toolName={MOCK_TOOL_CONFIG.toolName} />

        {/* Spec table */}
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-secondary/60 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Node Specification</p>
            </div>
            <table className="w-full text-xs">
                <tbody>
                    {[
                        ['Color scheme', 'cyan-600 primary / cyan-700 active'],
                        ['Icon', 'Wrench (Lucide), 36px, stroke-width 1.5'],
                        ['Label', '"Tool Executor"'],
                        ['Subtitle', 'Configured tool name (truncated)'],
                        ['Input handle', '1 × left side — cyan-500 dot'],
                        ['Output handle', '1 × right side — cyan-500 dot'],
                        ['Dimensions', '85 × 85 px tile + 6 px shadow offset'],
                        ['Node type key', 'toolExecutorNode'],
                    ].map(([prop, val]) => (
                        <tr key={prop} className="border-b border-border last:border-0">
                            <td className="px-4 py-2.5 font-medium text-muted-foreground w-[45%]">{prop}</td>
                            <td className="px-4 py-2.5 text-foreground font-mono">{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ── Error schema reference ────────────────────────────────────────────────────
const ErrorSchemaReference = () => (
    <div className="flex flex-col gap-y-3 p-3 rounded-lg bg-gray-950 border border-gray-800">
        <div className="flex items-center gap-x-2">
            <AlertCircle size={13} className="text-red-400" />
            <p className="text-xs font-semibold text-gray-300">Structured Error Output Schema</p>
        </div>
        <pre className="text-[11px] font-mono text-gray-300 leading-relaxed whitespace-pre">{`{
  "errorType":     "HTTP_CLIENT_ERROR | TIMEOUT | PARSE_ERROR | AUTH_ERROR | UNKNOWN",
  "errorMessage":  "string  — human-readable error description",
  "httpStatusCode": 404,        // number | null
  "toolName":      "Fetch Customer Profile",
  "timestamp":     "2025-06-12T09:17:10.909Z",  // ISO 8601
  "success":       false        // always false in error branch
}`}</pre>
        <p className="text-[11px] text-gray-400">
            When &ldquo;Propagate structured error&rdquo; is enabled, downstream nodes access this object via{' '}
            <code className="text-cyan-400">{'{{Variable:tool_exec_error}}'}</code>. When disabled, the workflow halts
            at this node.
        </p>
    </div>
);

// ── Error state tab ───────────────────────────────────────────────────────────
// Note: the error preview section lives inside the form itself.
// This is the standalone reference view.
const ErrorStateTab = () => (
    <div className="flex flex-col gap-y-6 p-6 max-w-[680px]">
        <div className="flex flex-col gap-y-1">
            <p className="text-sm font-semibold text-foreground">Error State Schema Reference</p>
            <p className="text-xs text-muted-foreground">
                The shape of the structured error object emitted when the Tool Executor node fails. Open the
                &ldquo;Configuration Form&rdquo; tab and expand the &ldquo;Error Handling&rdquo; section to see the
                interactive toggle and inline preview.
            </p>
        </div>

        <ErrorSchemaReference />

        {/* Error types table */}
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-secondary/60 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Error Types</p>
            </div>
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-border bg-secondary/30">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">errorType</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">When triggered</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">httpStatusCode</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        ['HTTP_CLIENT_ERROR', '4xx response from target API', '400 – 499'],
                        ['HTTP_SERVER_ERROR', '5xx response from target API', '500 – 599'],
                        ['TIMEOUT', 'Request exceeded configured timeout', 'null'],
                        ['PARSE_ERROR', 'Response body could not be parsed as expected type', 'null'],
                        ['AUTH_ERROR', 'Authentication / authorisation failed', '401 or 403'],
                        ['UNKNOWN', 'Unclassified runtime error', 'null'],
                    ].map(([type, when, code]) => (
                        <tr key={type} className="border-b border-border last:border-0">
                            <td className="px-4 py-2.5 font-mono text-red-400">{type}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{when}</td>
                            <td className="px-4 py-2.5 font-mono text-foreground">{code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ── Page shell ────────────────────────────────────────────────────────────────
export default function ToolExecutorConfigPage() {
    const [activeTab, setActiveTab] = useState<TabId>('form');
    const currentTab = TABS.find(t => t.id === activeTab)!;

    return (
        <div className="dark min-h-screen bg-background flex flex-col">
            <PageHeader />
            <TabBar active={activeTab} onChange={setActiveTab} />
            <TabDescription tab={currentTab} />

            <main className="flex-1 overflow-y-auto" role="main">
                {activeTab === 'form' && (
                    <ToolExecutorForm />
                )}
                {activeTab === 'canvas' && <CanvasTab />}
                {activeTab === 'lineage' && (
                    <div className="p-6">
                        <DataLineageEntryView />
                    </div>
                )}
            </main>
        </div>
    );
}
