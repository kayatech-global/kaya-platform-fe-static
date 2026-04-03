'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { A2AIdentityPanel } from './components/a2a-identity-panel';
import { ExternalAgentDrawer } from './components/external-agent-drawer';
import { ReleaseManagementSnippet } from './components/release-management-snippet';
import {
    Bot,
    ChevronDown,
    CircleFadingArrowUp,
    GitBranch,
    LayoutGrid,
    Maximize2,
    Minus,
    Moon,
    Plus,
    Settings,
    Sun,
    Workflow,
    ZapOff,
    Play,
    Network,
    ArrowRight,
    Layers,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type ActivePanel = 'agent-builder' | 'external-agent' | null;
type Tab = 'a2a' | 'config' | 'tools';
type Theme = 'light' | 'dark';

/* ─── Mock Workflow Canvas ───────────────────────────────────────────────────── */

interface MockNode {
    id: string;
    label: string;
    type: 'start' | 'agent' | 'external' | 'end';
    x: number;
    y: number;
}

const MOCK_NODES: MockNode[] = [
    { id: 'start', label: 'Start', type: 'start', x: 40, y: 130 },
    { id: 'agent1', label: 'Research & Synthesis Agent', type: 'agent', x: 160, y: 100 },
    { id: 'ext1', label: 'External Research Agent', type: 'external', x: 340, y: 100 },
    { id: 'agent2', label: 'Report Generator', type: 'agent', x: 520, y: 130 },
    { id: 'end', label: 'End', type: 'end', x: 680, y: 130 },
];

const NODE_COLORS: Record<MockNode['type'], string> = {
    start: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
    agent: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
    external: 'bg-violet-100 border-violet-300 dark:bg-violet-900/30 dark:border-violet-700',
    end: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700',
};

const NODE_ICON_COLORS: Record<MockNode['type'], string> = {
    start: 'text-green-600 dark:text-green-400',
    agent: 'text-blue-600 dark:text-blue-400',
    external: 'text-violet-600 dark:text-violet-400',
    end: 'text-red-500 dark:text-red-400',
};

function MockCanvas({
    selectedNodeId,
    onSelectNode,
}: {
    selectedNodeId: string | null;
    onSelectNode: (id: string, type: MockNode['type']) => void;
}) {
    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
            {/* Grid background */}
            <svg
                className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Connector lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {MOCK_NODES.slice(0, -1).map((node, i) => {
                    const next = MOCK_NODES[i + 1];
                    const x1 = `${node.x + 14}%`;
                    const y1 = '50%';
                    const x2 = `${next.x - 2}%`;
                    const y2 = '50%';
                    return (
                        <line
                            key={node.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            className="text-gray-400 dark:text-gray-600"
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            <div className="relative flex items-center gap-x-8 z-10">
                {MOCK_NODES.map(node => (
                    <button
                        key={node.id}
                        onClick={() => onSelectNode(node.id, node.type)}
                        className={cn(
                            'flex flex-col items-center gap-y-1.5 rounded-xl border-2 px-4 py-3 min-w-[100px] max-w-[130px] shadow-sm transition-all duration-150',
                            NODE_COLORS[node.type],
                            selectedNodeId === node.id
                                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-105'
                                : 'hover:scale-102 hover:shadow-md'
                        )}
                    >
                        <div
                            className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                node.type === 'agent' && 'bg-blue-200/60 dark:bg-blue-900/40',
                                node.type === 'external' && 'bg-violet-200/60 dark:bg-violet-900/40',
                                node.type === 'start' && 'bg-green-200/60 dark:bg-green-900/40',
                                node.type === 'end' && 'bg-red-200/60 dark:bg-red-900/40'
                            )}
                        >
                            {node.type === 'start' && <Play size={14} className={NODE_ICON_COLORS[node.type]} />}
                            {node.type === 'agent' && <Bot size={14} className={NODE_ICON_COLORS[node.type]} />}
                            {node.type === 'external' && <Network size={14} className={NODE_ICON_COLORS[node.type]} />}
                            {node.type === 'end' && <ZapOff size={14} className={NODE_ICON_COLORS[node.type]} />}
                        </div>
                        <span
                            className={cn(
                                'text-[10px] font-medium text-center leading-tight',
                                NODE_ICON_COLORS[node.type]
                            )}
                        >
                            {node.label}
                        </span>
                        {node.type === 'external' && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-200 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-semibold">
                                A2A
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Canvas controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-x-1">
                {[
                    { icon: <Plus size={12} />, label: 'Zoom in' },
                    { icon: <Minus size={12} />, label: 'Zoom out' },
                    { icon: <Maximize2 size={12} />, label: 'Fit view' },
                    { icon: <LayoutGrid size={12} />, label: 'Grid' },
                ].map(ctrl => (
                    <button
                        key={ctrl.label}
                        aria-label={ctrl.label}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
                    >
                        {ctrl.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Agent Builder Right Panel ──────────────────────────────────────────────── */

function AgentBuilderPanel({
    activeTab,
    setActiveTab,
}: {
    activeTab: Tab;
    setActiveTab: (t: Tab) => void;
}) {
    const tabs: { value: Tab; label: string }[] = [
        { value: 'config', label: 'Config' },
        { value: 'tools', label: 'Tools' },
        { value: 'a2a', label: 'A2A Identity' },
    ];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Panel header */}
            <div className="flex items-center gap-x-2 px-3 py-2.5 border-b border-border shrink-0">
                <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Bot size={13} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">Research & Synthesis Agent</p>
                    <p className="text-[9px] text-muted-foreground">Agent node</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                            'flex-1 py-2 text-[11px] font-medium transition-colors relative',
                            activeTab === tab.value
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                        {tab.value === 'a2a' && (
                            <span className="ml-1 inline-flex items-center px-1 py-0 rounded text-[8px] font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                                NEW
                            </span>
                        )}
                        {activeTab === tab.value && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                {activeTab === 'config' && (
                    <div className="flex flex-col gap-y-3">
                        <div className="flex flex-col gap-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">Node name</label>
                            <div className="h-7 rounded-md border border-border bg-background px-2 text-xs flex items-center text-foreground">
                                Research & Synthesis Agent
                            </div>
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">LLM Model</label>
                            <div className="h-7 rounded-md border border-border bg-background px-2 text-xs flex items-center justify-between text-foreground">
                                <span>GPT-4o mini</span>
                                <ChevronDown size={11} className="text-muted-foreground" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground">Prompt Template</label>
                            <div className="h-7 rounded-md border border-border bg-background px-2 text-xs flex items-center justify-between text-foreground">
                                <span>Research System Prompt v2</span>
                                <ChevronDown size={11} className="text-muted-foreground" />
                            </div>
                        </div>
                        <div className="p-3 rounded-md bg-muted/50 text-[11px] text-muted-foreground">
                            Configure advanced settings in the Config tab. Switch to A2A Identity to expose this agent via
                            the Agent-to-Agent protocol.
                        </div>
                    </div>
                )}

                {activeTab === 'tools' && (
                    <div className="flex flex-col gap-y-2">
                        {['search-api', 'rag-store-primary', 'mcp-server-tools', 'graph-db-connector'].map(t => (
                            <div
                                key={t}
                                className="flex items-center gap-x-2 px-2.5 py-2 rounded-md border border-border bg-background"
                            >
                                <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <Layers size={10} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-[11px] font-medium font-mono text-foreground flex-1">{t}</span>
                                <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">Active</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'a2a' && <A2AIdentityPanel agentName="Research & Synthesis Agent" />}
            </div>
        </div>
    );
}

/* ─── Workspace Header ───────────────────────────────────────────────────────── */

function WorkspaceHeader({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
    return (
        <header className="flex items-center gap-x-3 px-4 h-12 border-b border-border bg-background shrink-0 z-20">
            {/* Logo */}
            <div className="flex items-center gap-x-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                    <Workflow size={14} className="text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">KAYA</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold">
                    Workflow Builder
                </span>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-x-1 text-[11px] text-muted-foreground">
                <span>Workspace</span>
                <ArrowRight size={10} />
                <span>AI Research Suite</span>
                <ArrowRight size={10} />
                <span className="text-foreground font-medium">Research Pipeline v1.4-draft</span>
            </div>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">
                    Draft
                </span>
                <button className="flex items-center gap-x-1.5 h-7 px-3 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    <GitBranch size={12} />
                    Save
                </button>
                <button className="flex items-center gap-x-1.5 h-7 px-3 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">
                    <CircleFadingArrowUp size={12} />
                    Publish
                </button>
                <button
                    onClick={toggleTheme}
                    className="w-7 h-7 flex items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                </button>
                <button
                    className="w-7 h-7 flex items-center justify-center rounded border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Settings"
                >
                    <Settings size={13} />
                </button>
            </div>
        </header>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function REQ0230Page() {
    const [theme, setTheme] = useState<Theme>('light');
    const [activePanel, setActivePanel] = useState<ActivePanel>('agent-builder');
    const [activeTab, setActiveTab] = useState<Tab>('a2a');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('agent1');
    const [showExternalDrawer, setShowExternalDrawer] = useState(false);

    const handleSelectNode = (id: string, type: MockNode['type']) => {
        setSelectedNodeId(id);
        if (type === 'external') {
            setActivePanel(null);
            setShowExternalDrawer(true);
        } else if (type === 'agent') {
            setShowExternalDrawer(false);
            setActivePanel('agent-builder');
        } else {
            setShowExternalDrawer(false);
            setActivePanel(null);
        }
    };

    return (
        <div className={cn('flex flex-col h-screen bg-background text-foreground', theme === 'dark' && 'dark')}>
            <WorkspaceHeader theme={theme} toggleTheme={() => setTheme(p => (p === 'light' ? 'dark' : 'light'))} />

            {/* Body */}
            <div className="flex flex-1 min-h-0">
                {/* Left sidebar — node panel hint */}
                <aside className="w-[200px] shrink-0 border-r border-border bg-background flex flex-col py-3 px-2.5 gap-y-3 hidden lg:flex overflow-y-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground px-1">
                        Nodes
                    </p>

                    {/* Agent nodes section */}
                    <div className="flex flex-col gap-y-1">
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-0.5">
                            Agents
                        </p>
                        {[
                            { label: 'Agent Node', icon: <Bot size={12} />, color: 'text-blue-500' },
                            { label: 'External Agent', icon: <Network size={12} />, color: 'text-violet-500', badge: 'A2A' },
                            { label: 'Voice Agent', icon: <Bot size={12} />, color: 'text-sky-500' },
                        ].map(n => (
                            <div
                                key={n.label}
                                className="flex items-center gap-x-2 px-2 py-1.5 rounded-md border border-border bg-background cursor-grab hover:bg-muted transition-colors"
                            >
                                <span className={cn('shrink-0', n.color)}>{n.icon}</span>
                                <span className="text-[10px] text-foreground flex-1">{n.label}</span>
                                {n.badge && (
                                    <span className="text-[8px] px-1 py-0 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold">
                                        {n.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* Release management snippet */}
                    <ReleaseManagementSnippet />
                </aside>

                {/* Canvas */}
                <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-950 relative">
                    <MockCanvas selectedNodeId={selectedNodeId} onSelectNode={handleSelectNode} />

                    {/* Node type legend */}
                    <div className="absolute top-3 left-3 flex items-center gap-x-3 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-sm">
                        {[
                            { color: 'bg-green-400', label: 'Start / End' },
                            { color: 'bg-blue-400', label: 'Agent' },
                            { color: 'bg-violet-400', label: 'External Agent (A2A)' },
                        ].map(l => (
                            <span key={l.label} className="flex items-center gap-x-1.5 text-[10px] text-muted-foreground">
                                <span className={cn('w-2 h-2 rounded-full', l.color)} />
                                {l.label}
                            </span>
                        ))}
                    </div>

                    {/* Click hint */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-[10px] text-muted-foreground shadow-sm pointer-events-none">
                        Click a node to open its configuration panel
                    </div>
                </main>

                {/* Right panel — Agent Builder or External Agent Drawer */}
                {(activePanel === 'agent-builder' || showExternalDrawer) && (
                    <aside className="w-[320px] shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
                        {activePanel === 'agent-builder' && !showExternalDrawer && (
                            <AgentBuilderPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                        )}
                        {showExternalDrawer && (
                            <ExternalAgentDrawer
                                onClose={() => {
                                    setShowExternalDrawer(false);
                                    setSelectedNodeId(null);
                                }}
                            />
                        )}
                    </aside>
                )}
            </div>

            {/* Bottom status bar */}
            <footer className="flex items-center justify-between px-4 h-7 border-t border-border bg-background shrink-0">
                <div className="flex items-center gap-x-3">
                    <span className="flex items-center gap-x-1 text-[10px] text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Workflow valid
                    </span>
                    <span className="text-[10px] text-muted-foreground">5 nodes · 4 edges</span>
                    <span className="text-[10px] text-muted-foreground">REQ-0230</span>
                </div>
                <div className="flex items-center gap-x-3">
                    <span className="text-[10px] text-muted-foreground">A2A schema v0.2.1</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">2 skills need metadata</span>
                </div>
            </footer>
        </div>
    );
}
