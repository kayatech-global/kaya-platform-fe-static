'use client';

import React, { useCallback, useState, useMemo } from 'react';
import '@xyflow/react/dist/style.css';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    NodeProps,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
} from '@xyflow/react';
import {
    Bot,
    Play,
    Square,
    Cpu,
    GitBranch,
    Globe,
    Search,
    ChevronDown,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/atoms/badge';
import { Input } from '@/components';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { ExternalAgentConfigPanel } from './external-agent-config-panel';
import { useRouter, useParams } from 'next/navigation';

/* ─────────────────────────────────────────────
   Custom Node Components
───────────────────────────────────────────── */

const StartNode = ({ data, selected }: NodeProps) => (
    <div className={cn(
        'px-4 py-2.5 rounded-full border-2 bg-green-500/10 min-w-[90px] text-center transition-all',
        selected ? 'border-green-400 shadow-lg shadow-green-500/20' : 'border-green-500/50'
    )}>
        <Handle type="source" position={Position.Right} className="!bg-green-400 !w-2 !h-2" />
        <div className="flex items-center gap-1.5 justify-center">
            <Play size={12} className="text-green-400" />
            <span className="text-xs font-semibold text-green-400">{data.label as string}</span>
        </div>
    </div>
);

const EndNode = ({ data, selected }: NodeProps) => (
    <div className={cn(
        'px-4 py-2.5 rounded-full border-2 bg-red-500/10 min-w-[90px] text-center transition-all',
        selected ? 'border-red-400 shadow-lg shadow-red-500/20' : 'border-red-500/50'
    )}>
        <Handle type="target" position={Position.Left} className="!bg-red-400 !w-2 !h-2" />
        <div className="flex items-center gap-1.5 justify-center">
            <Square size={12} className="text-red-400" />
            <span className="text-xs font-semibold text-red-400">{data.label as string}</span>
        </div>
    </div>
);

const LLMNode = ({ data, selected }: NodeProps) => (
    <div className={cn(
        'px-4 py-3 rounded-xl border-2 bg-blue-500/10 min-w-[140px] transition-all',
        selected ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-blue-500/50'
    )}>
        <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-2 !h-2" />
        <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-2 !h-2" />
        <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded bg-blue-500/20">
                <Cpu size={12} className="text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-400">{data.label as string}</span>
        </div>
        {data.model && (
            <p className="text-[10px] text-muted-foreground font-mono pl-1">{data.model as string}</p>
        )}
    </div>
);

const ExternalAgentNodeComponent = ({ data, selected }: NodeProps) => (
    <div className={cn(
        'px-4 py-3 rounded-xl border-2 bg-cyan-500/10 min-w-[160px] transition-all',
        selected
            ? 'border-cyan-400 shadow-xl shadow-cyan-500/30 ring-1 ring-cyan-400/30'
            : 'border-cyan-500/60 hover:border-cyan-400/80'
    )}>
        <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2" />
        <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2" />
        <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded bg-cyan-500/20">
                <Globe size={12} className="text-cyan-400" />
            </div>
            <span className="text-xs font-semibold text-cyan-400">{data.label as string}</span>
        </div>
        <div className="flex flex-wrap gap-1 pl-1">
            <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 px-1 py-0">
                {data.protocol as string}
            </Badge>
            <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 px-1 py-0">
                {data.mode as string}
            </Badge>
        </div>
        {selected && (
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-gray-900" />
        )}
    </div>
);

const ConditionalNode = ({ data, selected }: NodeProps) => (
    <div className={cn(
        'relative transition-all',
        selected ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''
    )} style={{ width: 80, height: 80 }}>
        <Handle type="target" position={Position.Left} style={{ left: 0 }} className="!bg-amber-400 !w-2 !h-2" />
        <Handle type="source" position={Position.Right} style={{ right: 0 }} className="!bg-amber-400 !w-2 !h-2" />
        <Handle type="source" id="bottom" position={Position.Bottom} className="!bg-amber-400 !w-2 !h-2" />
        <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon
                points="40,4 76,40 40,76 4,40"
                fill="rgba(245,158,11,0.1)"
                stroke={selected ? '#fbbf24' : 'rgba(245,158,11,0.6)'}
                strokeWidth="2"
            />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <GitBranch size={14} className="text-amber-400" />
            <span className="text-[9px] font-semibold text-amber-400 text-center leading-tight">{data.label as string}</span>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Tool Palette Sidebar
───────────────────────────────────────────── */

interface PaletteCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    nodes: { type: string; label: string; icon: React.ElementType; colorClass: string; description: string }[];
}

const PALETTE_CATEGORIES: PaletteCategory[] = [
    {
        id: 'logic',
        label: 'Logic',
        icon: GitBranch,
        nodes: [
            { type: 'startNode', label: 'Start', icon: Play, colorClass: 'text-green-400', description: 'Workflow entry point' },
            { type: 'endNode', label: 'End', icon: Square, colorClass: 'text-red-400', description: 'Workflow exit point' },
            { type: 'conditionalNode', label: 'Conditional', icon: GitBranch, colorClass: 'text-amber-400', description: 'Branch based on condition' },
        ],
    },
    {
        id: 'ai',
        label: 'AI',
        icon: Cpu,
        nodes: [
            { type: 'llmNode', label: 'LLM', icon: Cpu, colorClass: 'text-blue-400', description: 'Language model inference' },
            { type: 'agentNode', label: 'Agent', icon: Bot, colorClass: 'text-violet-400', description: 'Autonomous AI agent' },
        ],
    },
    {
        id: 'integration',
        label: 'Integration',
        icon: Globe,
        nodes: [
            { type: 'apiNode', label: 'API Call', icon: Globe, colorClass: 'text-orange-400', description: 'HTTP/REST API request' },
        ],
    },
    {
        id: 'external',
        label: 'External',
        icon: Bot,
        nodes: [
            { type: 'externalAgentNode', label: 'External Agent', icon: Globe, colorClass: 'text-cyan-400', description: 'Call external agent via A2A / ACP' },
        ],
    },
];

const PaletteCategoryItem = ({ category }: { category: PaletteCategory }) => {
    const [open, setOpen] = useState(true);
    const Icon = category.icon;

    return (
        <div className="border-b border-border pb-3">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-1 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon size={12} />
                    {category.label}
                </div>
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {open && (
                <div className="flex flex-col gap-1 pl-1">
                    {category.nodes.map(node => {
                        const NodeIcon = node.icon;
                        const isExternal = node.type === 'externalAgentNode';
                        return (
                            <div
                                key={node.type}
                                draggable
                                onDragStart={e => e.dataTransfer.setData('nodeType', node.type)}
                                className={cn(
                                    'flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all',
                                    isExternal
                                        ? 'border-cyan-500/40 bg-cyan-500/8 hover:border-cyan-400/60 hover:bg-cyan-500/12'
                                        : 'border-border hover:border-border/80 hover:bg-muted/30'
                                )}
                            >
                                <div className={cn('p-1 rounded', isExternal ? 'bg-cyan-500/15' : 'bg-muted/50')}>
                                    <NodeIcon size={12} className={node.colorClass} />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn('text-xs font-medium', isExternal ? 'text-cyan-400' : 'text-foreground')}>{node.label}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{node.description}</p>
                                </div>
                                {isExternal && (
                                    <Badge variant="outline" className="text-[8px] border-cyan-500/30 text-cyan-400 px-1 py-0 ml-auto flex-shrink-0">
                                        NEW
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */

const INITIAL_NODES: Node[] = [
    {
        id: 'start-1',
        type: 'startNode',
        position: { x: 60, y: 200 },
        data: { label: 'Start' },
    },
    {
        id: 'llm-1',
        type: 'llmNode',
        position: { x: 240, y: 178 },
        data: { label: 'LLM Agent', model: 'gpt-4o' },
    },
    {
        id: 'ext-agent-1',
        type: 'externalAgentNode',
        position: { x: 460, y: 173 },
        data: { label: 'External Agent', protocol: 'A2A', mode: 'sync' },
    },
    {
        id: 'cond-1',
        type: 'conditionalNode',
        position: { x: 700, y: 167 },
        data: { label: 'Route' },
    },
    {
        id: 'end-1',
        type: 'endNode',
        position: { x: 870, y: 200 },
        data: { label: 'End' },
    },
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1', source: 'start-1', target: 'llm-1', animated: true, type: 'smoothstep', style: { stroke: '#4ade80', strokeWidth: 1.5 } },
    { id: 'e2', source: 'llm-1', target: 'ext-agent-1', animated: true, type: 'smoothstep', style: { stroke: '#3abff8', strokeWidth: 1.5 } },
    { id: 'e3', source: 'ext-agent-1', target: 'cond-1', animated: true, type: 'smoothstep', style: { stroke: '#22d3ee', strokeWidth: 1.5 } },
    { id: 'e4', source: 'cond-1', target: 'end-1', animated: true, type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 1.5 } },
];

const WorkflowEditorDemoInner = () => {
    const router = useRouter();
    const params = useParams();
    const wid = params.wid as string;

    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('ext-agent-1');
    const [paletteSearch, setPaletteSearch] = useState('');

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const showConfigPanel = selectedNode?.type === 'externalAgentNode';

    const onConnect = useCallback(
        (connection: Connection) => setEdges(eds => addEdge({ ...connection, animated: true, type: 'smoothstep' }, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const nodeTypes = useMemo(
        () => ({
            startNode: StartNode,
            endNode: EndNode,
            llmNode: LLMNode,
            externalAgentNode: ExternalAgentNodeComponent,
            conditionalNode: ConditionalNode,
        }),
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const nodeType = event.dataTransfer.getData('nodeType');
            if (!nodeType) return;

            const rect = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
            if (!rect) return;

            const position = {
                x: event.clientX - rect.left - 80,
                y: event.clientY - rect.top - 20,
            };

            const newNode: Node = {
                id: `${nodeType}-${Date.now()}`,
                type: nodeType,
                position,
                data: {
                    label: PALETTE_CATEGORIES.flatMap(c => c.nodes).find(n => n.type === nodeType)?.label ?? nodeType,
                    protocol: nodeType === 'externalAgentNode' ? 'A2A' : undefined,
                    mode: nodeType === 'externalAgentNode' ? 'sync' : undefined,
                    model: nodeType === 'llmNode' ? 'gpt-4o' : undefined,
                },
            };
            setNodes(nds => [...nds, newNode]);
        },
        [setNodes]
    );

    const filteredCategories = PALETTE_CATEGORIES.map(cat => ({
        ...cat,
        nodes: cat.nodes.filter(n =>
            !paletteSearch || n.label.toLowerCase().includes(paletteSearch.toLowerCase())
        ),
    })).filter(cat => cat.nodes.length > 0);

    return (
        <div className="h-screen flex flex-col bg-gray-950">
            {/* Header */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-gray-900 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/workspace/${wid}/standalone-agents`)}
                    className="gap-1.5 text-xs text-muted-foreground h-7 px-2"
                >
                    <ArrowLeft size={13} /> Standalone Agents
                </Button>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-sm font-semibold text-foreground">Workflow Editor Demo</span>
                    <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                        REQ-020: External Agent Node
                    </Badge>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="secondary" size="sm" className="h-7 text-xs">Save Draft</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5">
                        <Play size={11} /> Deploy
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Palette */}
                <div className="w-[220px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-border flex flex-col overflow-hidden">
                    <div className="px-3 py-3 border-b border-border">
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search nodes..."
                                value={paletteSearch}
                                onChange={e => setPaletteSearch(e.target.value)}
                                className="pl-7 text-xs h-7"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-600">
                        {filteredCategories.map(cat => (
                            <PaletteCategoryItem key={cat.id} category={cat} />
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-hidden relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.3 }}
                        proOptions={{ hideAttribution: true }}
                        style={{ background: '#0a0f1a' }}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1}
                            color="rgba(255,255,255,0.06)"
                        />
                        <Controls className="[&>button]:bg-gray-800 [&>button]:border-gray-700 [&>button]:text-gray-300 [&>button:hover]:bg-gray-700" />
                        <MiniMap
                            style={{ background: '#111827', border: '1px solid #1f2937' }}
                            nodeColor={() => '#3b7af7'}
                            maskColor="rgba(0,0,0,0.5)"
                        />
                    </ReactFlow>

                    {/* Canvas overlay hint */}
                    {!selectedNodeId && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                            <p className="text-xs text-muted-foreground bg-gray-900/80 px-3 py-1.5 rounded-full border border-border backdrop-blur">
                                Click the cyan <strong className="text-cyan-400">External Agent</strong> node to open its configuration panel
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Config Panel */}
                {showConfigPanel && (
                    <ExternalAgentConfigPanel onClose={() => setSelectedNodeId(null)} />
                )}

                {/* Generic right panel for non-external nodes */}
                {selectedNode && !showConfigPanel && (
                    <div className="w-[260px] flex-shrink-0 bg-white dark:bg-gray-900 border-l border-border p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-muted/50">
                                <Bot size={14} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">{selectedNode.data.label as string}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Node type: <span className="text-foreground font-mono">{selectedNode.type}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Select the <span className="text-cyan-400">External Agent</span> node to see the full A2A/ACP configuration panel.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const WorkflowEditorDemoContainer = () => (
    <ReactFlowProvider>
        <WorkflowEditorDemoInner />
    </ReactFlowProvider>
);
