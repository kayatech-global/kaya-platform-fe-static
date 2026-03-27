/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { InputDataConnectContainer } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-container';
import { InputConnectKey } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-modal';
import { SelectedInputConnects } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/selected-input-connects';
import {
    IConnectorForm,
    IGraphRag,
    IVectorRag,
} from '@/models';
import {
    Button,
    Input,
    Select,
    Textarea,
} from '@/components/atoms';
import PlatformMonacoEditor from '@/components/molecules/platform-monaco-editor/platform-monaco-editor';
import { IntellisenseCategory } from '@/components/molecules/platform-monaco-editor/types';
import { OptionModel } from '@/components/atoms/select';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { AgentType, API, ExecutableFunction } from './agent-form';
import {
    GripVertical,
    FileJson2,
    ChevronDown,
    ChevronRight,
    Maximize2,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToolExecutorType = {
    name?: string;
    description?: string;
    toolCategory?: InputConnectKey;
    apis?: API[];
    mcpServers?: IMCPBody[];
    executableFunctions?: ExecutableFunction[];
    rags?: IVectorRag[];
    knowledgeGraphs?: IGraphRag[];
    connectors?: IConnectorForm[];
    responseDataMapping?: Record<string, string>;
};

interface ToolExecutorFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

type CurrentToolEntry = {
    id: string;
    name: string;
    data: any;
};

type ApiToolResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: any;
};

type ExecutableFunctionResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    configurations: any;
    isReadOnly?: boolean;
};

type McpToolResponseType = {
    id: string;
    name: string;
    toolId: string;
    isReadOnly?: boolean;
    description: string;
    configurations: any;
};

// ─── Category Config ─────────────────────────────────────────────────────────

const TOOL_CATEGORIES: {
    key: InputConnectKey;
    label: string;
    badgeLabel: string;
    placeholder: string;
    emptyLabel: string;
}[] = [
    {
        key: InputConnectKey.API,
        label: 'APIs',
        badgeLabel: 'API',
        placeholder: '{\n  "id": "Variable:uid",\n  "name": "Variable:label"\n}',
        emptyLabel: 'APIs',
    },
    {
        key: InputConnectKey.MCP_SERVER,
        label: 'MCP Servers',
        badgeLabel: 'MCP',
        placeholder: '{\n  "query": "Variable:user_input"\n}',
        emptyLabel: 'MCP Servers',
    },
    {
        key: InputConnectKey.VECTOR_RAG,
        label: 'Vector RAGs',
        badgeLabel: 'RAG',
        placeholder: '{\n  "query": "Variable:search_term",\n  "top_k": 5\n}',
        emptyLabel: 'Vector RAGs',
    },
    {
        key: InputConnectKey.GRAPH_RAG,
        label: 'Graph RAGs',
        badgeLabel: 'Graph',
        placeholder: '{\n  "question": "Variable:user_query"\n}',
        emptyLabel: 'Graph RAGs',
    },
    {
        key: InputConnectKey.CONNECTOR,
        label: 'Connectors',
        badgeLabel: 'Connector',
        placeholder: '{\n  "param1": "Variable:value1"\n}',
        emptyLabel: 'Connectors',
    },
    {
        key: InputConnectKey.EXECUTABLE_FUNCTIONS,
        label: 'Functions',
        badgeLabel: 'Fn',
        placeholder: '{\n  "input": "Variable:data"\n}',
        emptyLabel: 'Functions',
    },
];

const CATEGORY_OPTIONS: OptionModel[] = TOOL_CATEGORIES.map(c => ({
    name: c.label,
    value: c.key,
}));

// ─── Component ───────────────────────────────────────────────────────────────

export const ToolExecutorForm = ({
    selectedNode,
    isReadOnly,
    allApiTools,
    allMcpTools,
    allGraphRag,
    allVectorRags,
    allConnectors,
    allExecutableFunctions,
    fetchingApiTools,
    fetchingMcp,
    fetchingGraphRag,
    fetchingConnectors,
    apiLoading,
    mcpLoading,
    vectorRagLoading,
    executableFunctionsLoading,
    refetchApiTools,
    refetchMcp,
    refetchGraphRag,
    refetchVectorRag,
    refetchConnectors,
    refetchExecutableFunctions,
}: ToolExecutorFormProps) => {
    // ─── Form State ──────────────────────────────────────────────────────────
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [toolCategory, setToolCategory] = useState<InputConnectKey | null>(null);
    const [apis, setApis] = useState<API[] | undefined>([]);
    const [mcpServers, setMcpServers] = useState<IMCPBody[] | undefined>([]);
    const [vectorRags, setVectorRags] = useState<IVectorRag[] | undefined>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[] | undefined>([]);
    const [selectedConnector, setSelectedConnector] = useState<IConnectorForm[] | undefined>([]);
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[] | undefined>([]);
    const [responseDataMapping, setResponseDataMapping] = useState<Record<string, string>>({});

    // ─── UI State ────────────────────────────────────────────────────────────
    const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
    const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [maximizedTool, setMaximizedTool] = useState<CurrentToolEntry | null>(null);

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // ─── Init ────────────────────────────────────────────────────────────────

    const initFormData = useCallback(() => {
        const data = selectedNode?.data as ToolExecutorType;
        setName(data?.name ?? '');
        setDescription(data?.description ?? '');
        setToolCategory(data?.toolCategory ?? null);
        setApis(data?.apis ?? []);
        setMcpServers(data?.mcpServers ?? []);
        setVectorRags(data?.rags ?? []);
        setGraphRags(data?.knowledgeGraphs ?? []);
        setSelectedConnector(data?.connectors ?? []);
        setExecutableFunctions(data?.executableFunctions ?? []);
        setResponseDataMapping(data?.responseDataMapping ?? {});
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    // ─── Current tools for the selected category ─────────────────────────────

    const currentTools: CurrentToolEntry[] = useMemo(() => {
        if (!toolCategory) return [];
        switch (toolCategory) {
            case InputConnectKey.API:
                return (apis ?? []).map(t => ({ id: t.id, name: t.name, data: t }));
            case InputConnectKey.MCP_SERVER:
                return (mcpServers ?? []).map(t => ({ id: t.id ?? '', name: t.name ?? '', data: t }));
            case InputConnectKey.VECTOR_RAG:
                return (vectorRags ?? []).map(t => ({ id: t.id ?? '', name: t.name ?? '', data: t }));
            case InputConnectKey.GRAPH_RAG:
                return (graphRags ?? []).map(t => ({ id: t.id ?? '', name: t.name ?? '', data: t }));
            case InputConnectKey.CONNECTOR:
                return (selectedConnector ?? []).map(t => ({ id: t.id ?? '', name: t.name, data: t }));
            case InputConnectKey.EXECUTABLE_FUNCTIONS:
                return (executableFunctions ?? []).map(t => ({ id: t.id, name: t.name, data: t }));
            default:
                return [];
        }
    }, [toolCategory, apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions]);

    // ─── Has any tools (for locking category dropdown) ───────────────────────

    const hasTools = currentTools.length > 0;

    const categoryConfig = useMemo(
        () => TOOL_CATEGORIES.find(c => c.key === toolCategory),
        [toolCategory]
    );

    // ─── Clean stale responseDataMapping ─────────────────────────────────────

    useEffect(() => {
        const validIds = new Set(currentTools.map(t => t.id));
        const currentKeys = Object.keys(responseDataMapping);
        const staleKeys = currentKeys.filter(k => !validIds.has(k));
        if (staleKeys.length > 0) {
            const cleaned = { ...responseDataMapping };
            staleKeys.forEach(k => delete cleaned[k]);
            setResponseDataMapping(cleaned);
        }
    }, [currentTools]);

    // ─── Category change handler ─────────────────────────────────────────────

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as InputConnectKey;
        if (val && val !== toolCategory) {
            setToolCategory(val);
        }
    };

    // ─── Drag and Drop ──────────────────────────────────────────────────────

    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            // Reorder the underlying array for the current category
            const reorder = <T,>(arr: T[] | undefined): T[] | undefined => {
                if (!arr || arr.length < 2) return arr;
                const copy = [...arr];
                const [moved] = copy.splice(dragIndex, 1);
                copy.splice(dragOverIndex, 0, moved);
                return copy;
            };

            switch (toolCategory) {
                case InputConnectKey.API: setApis(reorder(apis)); break;
                case InputConnectKey.MCP_SERVER: setMcpServers(reorder(mcpServers)); break;
                case InputConnectKey.VECTOR_RAG: setVectorRags(reorder(vectorRags)); break;
                case InputConnectKey.GRAPH_RAG: setGraphRags(reorder(graphRags)); break;
                case InputConnectKey.CONNECTOR: setSelectedConnector(reorder(selectedConnector)); break;
                case InputConnectKey.EXECUTABLE_FUNCTIONS: setExecutableFunctions(reorder(executableFunctions)); break;
            }
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // ─── Request Structure Handlers ─────────────────────────────────────────

    const handleToolMappingChange = (toolId: string, value: string) => {
        setResponseDataMapping(prev => ({ ...prev, [toolId]: value }));
    };

    const handleToolEditorBlur = (toolId: string) => {
        const raw = responseDataMapping[toolId];
        if (!raw?.trim()) return;
        try {
            const parsed = JSON.parse(raw);
            const formatted = JSON.stringify(parsed, null, 2);
            setResponseDataMapping(prev => ({ ...prev, [toolId]: formatted }));
            setJsonErrors(prev => { const next = { ...prev }; delete next[toolId]; return next; });
        } catch {
            setJsonErrors(prev => ({ ...prev, [toolId]: 'Invalid JSON' }));
        }
    };

    const toggleExpand = (toolId: string) => {
        setExpandedTools(prev => {
            const next = new Set(prev);
            next.has(toolId) ? next.delete(toolId) : next.add(toolId);
            return next;
        });
    };

    // ─── Save ────────────────────────────────────────────────────────────────

    const constructNodeData = useCallback(() => ({
        name,
        description,
        toolCategory: toolCategory ?? undefined,
        apis: (apis?.length ?? 0) > 0 ? apis : undefined,
        mcpServers: (mcpServers?.length ?? 0) > 0 ? mcpServers : undefined,
        rags: (vectorRags?.length ?? 0) > 0 ? vectorRags : undefined,
        knowledgeGraphs: (graphRags?.length ?? 0) > 0 ? graphRags : undefined,
        connectors: (selectedConnector?.length ?? 0) > 0 ? selectedConnector : undefined,
        executableFunctions: (executableFunctions?.length ?? 0) > 0 ? executableFunctions : undefined,
        responseDataMapping: Object.keys(responseDataMapping).length > 0 ? responseDataMapping : undefined,
    }), [name, description, toolCategory, apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions, responseDataMapping]);

    const handleSaveNodeData = () => {
        let hasError = false;
        const errors: Record<string, string> = {};
        currentTools.forEach(tool => {
            const raw = responseDataMapping[tool.id];
            if (raw?.trim()) {
                try { JSON.parse(raw); } catch {
                    errors[tool.id] = 'Invalid JSON';
                    hasError = true;
                }
            }
        });
        setJsonErrors(errors);
        if (hasError) {
            toast.error('Fix JSON errors before saving');
            return;
        }
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('Tool Executor updated');
        setTrigger((trigger ?? 0) + 1);
    };

    // ─── Selected input connect data ─────────────────────────────────────────

    // Only show tools for the selected category in the summary
    const selectedInputConnectData = useMemo(() => ({
        apis: toolCategory === InputConnectKey.API ? (apis ?? []) : [],
        mcpServers: toolCategory === InputConnectKey.MCP_SERVER ? (mcpServers as any) : [],
        rags: toolCategory === InputConnectKey.VECTOR_RAG ? (vectorRags ?? []) : [],
        knowledgeGraphs: toolCategory === InputConnectKey.GRAPH_RAG ? (graphRags ?? []) : [],
        connectors: toolCategory === InputConnectKey.CONNECTOR ? (selectedConnector ?? []) : [],
        executableFunctions: toolCategory === InputConnectKey.EXECUTABLE_FUNCTIONS ? (executableFunctions ?? []) : [],
    } as AgentType), [toolCategory, apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions]);

    const isLoading = fetchingApiTools || fetchingMcp || fetchingGraphRag || fetchingConnectors || vectorRagLoading;

    // ─── Mock intellisense data for demo ─────────────────────────────────────

    // Category names must match use-platform-intellisense lookup keys
    const intellisenseData: IntellisenseCategory[] = useMemo(() => [
        {
            name: 'Variables',
            options: [
                { label: 'user_input', value: 'Variable:user_input' },
                { label: 'customer_id', value: 'Variable:customer_id' },
                { label: 'session_id', value: 'Variable:session_id' },
                { label: 'query', value: 'Variable:query' },
                { label: 'email', value: 'Variable:email' },
                { label: 'timestamp', value: 'Variable:timestamp' },
            ],
        },
        {
            name: 'APIs',
            options: (apis ?? []).map(a => ({ label: a.name, value: `API:${a.name}` })),
        },
        {
            name: 'MCPs',
            options: (mcpServers ?? []).map(m => ({ label: m.name ?? '', value: `MCP:${m.name}` })),
        },
    ], [apis, mcpServers]);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            {/* Loading state */}
            <div className={cn('h-full flex items-center justify-center mt-[30%]', { hidden: !isLoading })}>
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Loading tool executor data...
                    </p>
                </div>
            </div>

            {/* Main form */}
            <div className="group">
                <div
                    className={cn(
                        'tool-executor-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        { hidden: isLoading }
                    )}
                >
                    {/* ═══ Basic Information ═══ */}
                    <div className="flex flex-col gap-y-5 pb-4 bottom-gradient-border">
                        <Input
                            label="Name"
                            placeholder="Name of the tool executor"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={isReadOnly}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Describe what this tool executor does"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* ═══ Tool Category Selector ═══ */}
                    <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                        <div className="relative">
                            <Select
                                label="Tool Category"
                                placeholder="Select tool category"
                                options={CATEGORY_OPTIONS}
                                currentValue={toolCategory ?? ''}
                                onChange={handleCategoryChange}
                                disabled={isReadOnly}
                            />
                        </div>

                        {!toolCategory && (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Select a tool category above to get started.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ═══ Input Data Connect — Single Category Only ═══ */}
                    {toolCategory && (
                        <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                            <InputDataConnectContainer
                                agent={undefined}
                                apiSelectorProps={{
                                    agent: undefined,
                                    apis: apis,
                                    setApis: setApis,
                                    allApiTools: allApiTools as ApiToolResponseType[],
                                    isReadonly: isReadOnly,
                                    apiLoading: apiLoading,
                                    onRefetch: () => { Promise.resolve(refetchApiTools()).catch(() => {}); },
                                }}
                                mcpSelectorProps={{
                                    mcpServers: mcpServers || [],
                                    setMcpServers: setMcpServers,
                                    agent: undefined,
                                    onRefetch: () => { Promise.resolve(refetchMcp()).catch(() => {}); },
                                    isReadonly: isReadOnly,
                                    loading: mcpLoading,
                                    allMcpTools: allMcpTools as McpToolResponseType[],
                                }}
                                vectorSelectorProps={{
                                    agent: undefined,
                                    vectorRags: vectorRags || [],
                                    setVectorRags: setVectorRags,
                                    allVectorRags: allVectorRags ?? [],
                                    vectorRagLoading: vectorRagLoading,
                                    isReadonly: isReadOnly,
                                    onRefetch: () => { Promise.resolve(refetchVectorRag()).catch(() => {}); },
                                }}
                                graphSelectorProps={{
                                    agent: undefined,
                                    graphRags: graphRags || [],
                                    setGraphRags: setGraphRags,
                                    allGraphRags: allGraphRag ?? [],
                                    graphRagLoading: fetchingGraphRag,
                                    isReadonly: isReadOnly,
                                    onRefetch: () => { Promise.resolve(refetchGraphRag()).catch(() => {}); },
                                }}
                                connectorSelectorProps={{
                                    agent: undefined,
                                    connectors: selectedConnector || [],
                                    isMultiple: true,
                                    setConnectors: setSelectedConnector,
                                    allConnectors: allConnectors ?? [],
                                    isReadonly: isReadOnly,
                                    onRefetch: () => { Promise.resolve(refetchConnectors()).catch(() => {}); },
                                    onConnectorsChange: connector => setSelectedConnector(connector),
                                }}
                                executableSelectorProps={{
                                    agent: undefined,
                                    functions: executableFunctions,
                                    setFunctions: setExecutableFunctions,
                                    allExecutableFunctions: allExecutableFunctions as ExecutableFunctionResponseType[],
                                    isReadonly: isReadOnly,
                                    functionLoading: executableFunctionsLoading,
                                    onRefetch: () => { Promise.resolve(refetchExecutableFunctions()).catch(() => {}); },
                                }}
                                enabledCategories={[toolCategory]}
                            />
                            <SelectedInputConnects data={selectedInputConnectData} visibleCategory={toolCategory ?? undefined} />
                        </div>
                    )}

                    {/* ═══ Input Request Structure ═══ */}
                    {toolCategory && (
                        <div className="flex flex-col gap-y-3 pb-4 bottom-gradient-border">
                            <div className="flex flex-col gap-y-0.5">
                                <div className="flex items-center gap-x-2">
                                    <FileJson2 size={18} className="text-gray-500 dark:text-gray-400" />
                                    <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                                        Input Request Structure
                                    </p>
                                </div>
                                <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                    JSON mirroring previous node output. Type @ to insert variables. Saved as {'{{Variable:name}}'}.
                                </p>
                            </div>

                            {currentTools.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FileJson2 size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        No {categoryConfig?.emptyLabel ?? 'tools'} selected.
                                        Add {categoryConfig?.emptyLabel ?? 'tools'} above to configure request structures.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-y-2">
                                    {currentTools.map((tool, index) => {
                                        const isExpanded = expandedTools.has(tool.id);
                                        const isDragging = dragIndex === index;
                                        const isDragOver = dragOverIndex === index && dragIndex !== index;
                                        const error = jsonErrors[tool.id];

                                        return (
                                            <div
                                                key={tool.id}
                                                draggable={!isReadOnly && currentTools.length > 1}
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    'flex flex-col rounded-lg border bg-gray-50 dark:bg-gray-800 overflow-hidden transition-all',
                                                    isDragging
                                                        ? 'opacity-40 border-gray-300 dark:border-gray-600'
                                                        : isDragOver
                                                            ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30'
                                                            : 'border-gray-200 dark:border-gray-700',
                                                )}
                                            >
                                                {/* Tool Header */}
                                                <button
                                                    type="button"
                                                    className="flex items-center justify-between p-3 w-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                    onClick={() => toggleExpand(tool.id)}
                                                >
                                                    <div className="flex items-center gap-x-2">
                                                        {!isReadOnly && currentTools.length > 1 && (
                                                            <div
                                                                className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                onMouseDown={e => e.stopPropagation()}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <GripVertical size={16} />
                                                            </div>
                                                        )}
                                                        {isExpanded ? (
                                                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                                                        ) : (
                                                            <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                                                        )}
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                            {categoryConfig?.badgeLabel ?? ''} {index + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-100 truncate">
                                                            {tool.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-x-1" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            className="h-7 w-7 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                            onClick={() => setMaximizedTool(tool)}
                                                            title="Maximize editor"
                                                        >
                                                            <Maximize2 size={14} />
                                                        </button>
                                                    </div>
                                                </button>

                                                {/* Expanded: Request Structure Editor */}
                                                {isExpanded && (
                                                    <div className="px-3 pb-3">
                                                        <PlatformMonacoEditor
                                                            value={(responseDataMapping[tool.id] ?? '').replaceAll(/\{\{|\}\}/g, '')}
                                                            onChange={(val) => handleToolMappingChange(tool.id, val)}
                                                            onBlur={() => handleToolEditorBlur(tool.id)}
                                                            intellisenseData={intellisenseData}
                                                            onRefetchVariables={async () => {}}
                                                            placeholder={categoryConfig?.placeholder}
                                                            helperInfo="Map fields to workflow variables. Type @ to insert a variable."
                                                            height="h-[150px]"
                                                            isDestructive={!!error}
                                                            supportiveText={error}
                                                            disabled={isReadOnly}
                                                            enableCategoryIcon
                                                            language="custom-sql"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tool count + execution order */}
                            {currentTools.length > 0 && (
                                <div className="flex items-center gap-x-2 text-[10px] text-gray-400 dark:text-gray-500 px-1">
                                    <span>{currentTools.length} {categoryConfig?.emptyLabel ?? 'tools'} configured</span>
                                    {currentTools.length > 1 && (
                                        <>
                                            <span>|</span>
                                            <span>Sequential execution: {currentTools.map((_, i) => i + 1).join(' → ')}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ Form Actions ═══ */}
                    <div className="tool-executor-form-footer flex gap-x-3 justify-end pb-4">
                        <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveNodeData}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            {/* ═══ Maximized Editor Modal ═══ */}
            {maximizedTool && (
                <Dialog open={!!maximizedTool} onOpenChange={() => setMaximizedTool(null)}>
                    <DialogContent className="max-w-[600px] max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle asChild>
                                <div className="flex items-center gap-x-2">
                                    <span className="text-sm font-medium">{maximizedTool.name}</span>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-1 pb-3">
                            <PlatformMonacoEditor
                                value={(responseDataMapping[maximizedTool.id] ?? '').replaceAll(/\{\{|\}\}/g, '')}
                                onChange={(val) => handleToolMappingChange(maximizedTool.id, val)}
                                onBlur={() => handleToolEditorBlur(maximizedTool.id)}
                                intellisenseData={intellisenseData}
                                onRefetchVariables={async () => {}}
                                placeholder={categoryConfig?.placeholder}
                                height="h-[400px]"
                                isDestructive={!!jsonErrors[maximizedTool.id]}
                                supportiveText={jsonErrors[maximizedTool.id]}
                                disabled={isReadOnly}
                                enableCategoryIcon
                                language="custom-sql"
                            />
                            <p className="text-[10px] text-gray-400 mt-2">
                                Type @ to insert variables. Use {'{{Variable:name}}'} syntax for dynamic values.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </React.Fragment>
    );
};
