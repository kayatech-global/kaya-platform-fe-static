/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { InputDataConnectContainer } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-container';
import { SelectedInputConnects } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/selected-input-connects';
import { InputConnectKey } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-modal';
import {
    IConnectorForm,
    IGraphRag,
    IVectorRag,
} from '@/models';
import {
    Button,
    Input,
    Textarea,
    Label,
} from '@/components/atoms';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { AgentType, API, ExecutableFunction } from './agent-form';
import { Plus, X, GripVertical, FileJson2, ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';
import PlatformMonacoEditor from '@/components/molecules/platform-monaco-editor/platform-monaco-editor';
import { IntellisenseCategory } from '@/components/molecules/platform-monaco-editor/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';

// Types for Parameter/Response Mapping
interface MappingItem {
    id: string;
    paramName: string;
    value: string;
}

// Tool item with its request structure mapping
interface ToolItem {
    id: string;
    name: string;
    category: InputConnectKey;
}

// TOOL_CATEGORIES configuration with badge labels
const TOOL_CATEGORIES: {
    key: InputConnectKey;
    label: string;
    badgeLabel: string;
    placeholder: string;
    emptyLabel: string;
}[] = [
    { key: InputConnectKey.API, label: 'APIs', badgeLabel: 'API', placeholder: '{\n  "endpoint": "{{Variable:api_endpoint}}",\n  "params": {}\n}', emptyLabel: 'APIs' },
    { key: InputConnectKey.MCP_SERVER, label: 'MCP Servers', badgeLabel: 'MCP', placeholder: '{\n  "server": "{{Variable:mcp_server}}",\n  "config": {}\n}', emptyLabel: 'MCP Servers' },
    { key: InputConnectKey.VECTOR_RAG, label: 'Vector RAGs', badgeLabel: 'RAG', placeholder: '{\n  "query": "{{Variable:search_query}}",\n  "topK": 5\n}', emptyLabel: 'Vector RAGs' },
    { key: InputConnectKey.GRAPH_RAG, label: 'Graph RAGs', badgeLabel: 'Graph', placeholder: '{\n  "query": "{{Variable:graph_query}}",\n  "depth": 2\n}', emptyLabel: 'Graph RAGs' },
    { key: InputConnectKey.CONNECTOR, label: 'Connectors', badgeLabel: 'Connector', placeholder: '{\n  "connector": "{{Variable:connector_id}}",\n  "action": ""\n}', emptyLabel: 'Connectors' },
    { key: InputConnectKey.EXECUTABLE_FUNCTIONS, label: 'Functions', badgeLabel: 'Fn', placeholder: '{\n  "function": "{{Variable:function_name}}",\n  "args": []\n}', emptyLabel: 'Functions' },
];

// Types for Tool Executor
export type ToolExecutorType = {
    name?: string;
    description?: string;
    apis?: API[];
    mcpServers?: IMCPBody[];
    executableFunctions?: ExecutableFunction[];
    rags?: IVectorRag[];
    knowledgeGraphs?: IGraphRag[];
    connectors?: IConnectorForm[];
    // Parameter and Response mappings
    parameterMapping?: MappingItem[];
    responseMapping?: MappingItem[];
    // Tool-specific request structure mappings
    toolRequestMapping?: Record<string, string>;
};

interface ToolExecutorFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

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

// Reusable Mapping Input Component
interface MappingInputProps {
    label: string;
    description?: string;
    items: MappingItem[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: 'paramName' | 'value', newValue: string) => void;
    disabled?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
}

const MappingInput: React.FC<MappingInputProps> = ({
    label,
    description,
    items,
    onAdd,
    onRemove,
    onUpdate,
    disabled = false,
    namePlaceholder = 'Parameter Name',
    valuePlaceholder = 'Value',
}) => {
    return (
        <div className="flex flex-col items-start gap-y-[6px] w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">{label}</Label>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
            )}

            {items.map((item) => (
                <div
                    key={item.id}
                    className="w-full flex flex-col sm:flex-row gap-2 mb-2"
                >
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                            placeholder={namePlaceholder}
                            value={item.paramName}
                            onChange={(e) => onUpdate(item.id, 'paramName', e.target.value)}
                            disabled={disabled}
                        />
                        <Input
                            placeholder={valuePlaceholder}
                            value={item.value}
                            onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
                            disabled={disabled}
                        />
                    </div>
                    <div className="mt-1.5">
                        <Button
                            className="w-full sm:w-max"
                            disabled={disabled}
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(item.id)}
                        >
                            <X />
                        </Button>
                    </div>
                </div>
            ))}

            <div className="mb-2">
                <Button size="sm" disabled={disabled} onClick={onAdd}>
                    <span className="flex gap-2">
                        <Plus /> Add
                    </span>
                </Button>
            </div>
        </div>
    );
};

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
    // Form state
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [apis, setApis] = useState<API[] | undefined>([]);
    const [mcpServers, setMcpServers] = useState<IMCPBody[] | undefined>([]);
    const [vectorRags, setVectorRags] = useState<IVectorRag[] | undefined>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[] | undefined>([]);
    const [selectedConnector, setSelectedConnector] = useState<IConnectorForm[] | undefined>([]);
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[] | undefined>([]);

    // Parameter and Response Mapping state
    const [parameterMapping, setParameterMapping] = useState<MappingItem[]>([]);
    const [responseMapping, setResponseMapping] = useState<MappingItem[]>([]);

    // Tool request structure mapping state
    const [responseDataMapping, setResponseDataMapping] = useState<Record<string, string>>({});

    // Tool card UI state
    const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [maximizedTool, setMaximizedTool] = useState<ToolItem | null>(null);
    const [toolCategory, setToolCategory] = useState<InputConnectKey | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // Generate unique ID for mapping items
    const generateId = () => `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Demo intellisense data
    const intellisenseData: IntellisenseCategory[] = useMemo(() => [
        {
            name: 'Variables',
            options: [
                { label: 'api_endpoint', value: 'Variable:api_endpoint' },
                { label: 'search_query', value: 'Variable:search_query' },
                { label: 'user_input', value: 'Variable:user_input' },
                { label: 'context', value: 'Variable:context' },
            ],
        },
        {
            name: 'Metadata',
            options: [
                { label: 'timestamp', value: 'Metadata:timestamp' },
                { label: 'session_id', value: 'Metadata:session_id' },
            ],
        },
    ], []);

    // Compute current tools from all selected input connects
    const currentTools = useMemo<ToolItem[]>(() => {
        const tools: ToolItem[] = [];
        
        apis?.forEach((api, idx) => {
            tools.push({
                id: api.id || `api-${idx}`,
                name: api.name || `API ${idx + 1}`,
                category: InputConnectKey.API,
            });
        });
        
        mcpServers?.forEach((mcp, idx) => {
            tools.push({
                id: mcp.id || `mcp-${idx}`,
                name: mcp.name || `MCP Server ${idx + 1}`,
                category: InputConnectKey.MCP_SERVER,
            });
        });
        
        vectorRags?.forEach((rag, idx) => {
            tools.push({
                id: rag.id || `rag-${idx}`,
                name: rag.name || `Vector RAG ${idx + 1}`,
                category: InputConnectKey.VECTOR_RAG,
            });
        });
        
        graphRags?.forEach((rag, idx) => {
            tools.push({
                id: rag.id || `graphrag-${idx}`,
                name: rag.name || `Graph RAG ${idx + 1}`,
                category: InputConnectKey.GRAPH_RAG,
            });
        });
        
        selectedConnector?.forEach((connector, idx) => {
            tools.push({
                id: connector.id || `connector-${idx}`,
                name: connector.name || `Connector ${idx + 1}`,
                category: InputConnectKey.CONNECTOR,
            });
        });
        
        executableFunctions?.forEach((fn, idx) => {
            tools.push({
                id: fn.id || `fn-${idx}`,
                name: fn.name || `Function ${idx + 1}`,
                category: InputConnectKey.EXECUTABLE_FUNCTIONS,
            });
        });
        
        return tools;
    }, [apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions]);

    // Set default tool category when tools change
    useEffect(() => {
        if (currentTools.length > 0 && !toolCategory) {
            setToolCategory(currentTools[0].category);
        }
    }, [currentTools, toolCategory]);

    // Initialize form with node data
    const initFormData = useCallback(() => {
        const data = selectedNode?.data as ToolExecutorType;

        setName(data?.name ?? '');
        setDescription(data?.description ?? '');
        setApis(data?.apis ?? []);
        setMcpServers(data?.mcpServers ?? []);
        setVectorRags(data?.rags ?? []);
        setGraphRags(data?.knowledgeGraphs ?? []);
        setSelectedConnector(data?.connectors ?? []);
        setExecutableFunctions(data?.executableFunctions ?? []);
        setParameterMapping(data?.parameterMapping ?? []);
        setResponseMapping(data?.responseMapping ?? []);
        setResponseDataMapping(data?.toolRequestMapping ?? {});
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    // Construct node data for saving
    const constructNodeData = useCallback(() => ({
        name,
        description,
        apis: (apis?.length ?? 0) > 0 ? apis : undefined,
        mcpServers: (mcpServers?.length ?? 0) > 0 ? mcpServers : undefined,
        rags: (vectorRags?.length ?? 0) > 0 ? vectorRags : undefined,
        knowledgeGraphs: (graphRags?.length ?? 0) > 0 ? graphRags : undefined,
        connectors: (selectedConnector?.length ?? 0) > 0 ? selectedConnector : undefined,
        executableFunctions: (executableFunctions?.length ?? 0) > 0 ? executableFunctions : undefined,
        parameterMapping: (parameterMapping?.length ?? 0) > 0 ? parameterMapping : undefined,
        responseMapping: (responseMapping?.length ?? 0) > 0 ? responseMapping : undefined,
        toolRequestMapping: Object.keys(responseDataMapping).length > 0 ? responseDataMapping : undefined,
    }), [
        name,
        description,
        apis,
        mcpServers,
        vectorRags,
        graphRags,
        selectedConnector,
        executableFunctions,
        parameterMapping,
        responseMapping,
        responseDataMapping,
    ]);

    // Save handler
    const handleSaveNodeData = () => {
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('Tool Executor updated');
        setTrigger((trigger ?? 0) + 1);
    };

    // Parameter Mapping handlers
    const handleAddParameterMapping = () => {
        setParameterMapping(prev => [...prev, { id: generateId(), paramName: '', value: '' }]);
    };

    const handleRemoveParameterMapping = (id: string) => {
        setParameterMapping(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateParameterMapping = (id: string, field: 'paramName' | 'value', newValue: string) => {
        setParameterMapping(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: newValue } : item)
        );
    };

    // Response Mapping handlers
    const handleAddResponseMapping = () => {
        setResponseMapping(prev => [...prev, { id: generateId(), paramName: '', value: '' }]);
    };

    const handleRemoveResponseMapping = (id: string) => {
        setResponseMapping(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateResponseMapping = (id: string, field: 'paramName' | 'value', newValue: string) => {
        setResponseMapping(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: newValue } : item)
        );
    };

    // Tool card handlers
    const toggleExpand = (toolId: string) => {
        setExpandedTools(prev => {
            const newSet = new Set(prev);
            if (newSet.has(toolId)) {
                newSet.delete(toolId);
            } else {
                newSet.add(toolId);
            }
            return newSet;
        });
    };

    const handleToolMappingChange = (toolId: string, value: string) => {
        setResponseDataMapping(prev => ({
            ...prev,
            [toolId]: value,
        }));
    };

    const handleToolEditorBlur = (toolId: string) => {
        // Validate JSON on blur
        const value = responseDataMapping[toolId];
        if (value && value.trim()) {
            try {
                // Remove variable placeholders temporarily for JSON validation
                const sanitized = value.replaceAll(/\{\{[^}]+\}\}/g, '"placeholder"');
                JSON.parse(sanitized);
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[toolId];
                    return newErrors;
                });
            } catch {
                setValidationErrors(prev => ({
                    ...prev,
                    [toolId]: 'Invalid JSON format',
                }));
            }
        }
    };

    // Drag and drop handlers
    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIndex !== null && dragIndex !== dropIndex) {
            // Reorder logic would go here
            // For demo purposes, we just reset the drag state
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // Get category config for a tool
    const getCategoryConfig = (category: InputConnectKey) => {
        return TOOL_CATEGORIES.find(c => c.key === category);
    };

    // Selected input connect data for display
    const selectedInputConnectData = useMemo(() => ({
        apis: apis ?? [],
        mcpServers: mcpServers as any,
        rags: vectorRags ?? [],
        knowledgeGraphs: graphRags ?? [],
        connectors: selectedConnector ?? [],
        executableFunctions: executableFunctions ?? [],
    } as AgentType), [apis, mcpServers, vectorRags, graphRags, selectedConnector, executableFunctions]);

    const isLoading = fetchingApiTools || fetchingMcp || fetchingGraphRag || fetchingConnectors || vectorRagLoading;

    // Get category-specific index for badge
    const getCategoryIndex = (tool: ToolItem, index: number) => {
        const categoryTools = currentTools.filter(t => t.category === tool.category);
        return categoryTools.findIndex(t => t.id === tool.id) + 1;
    };

    return (
        <React.Fragment>
            {/* Loading state */}
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden: !isLoading,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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
                    {/* Basic Information Section */}
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
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Input Data Connect Section - Reusing existing components */}
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
                                onRefetch: () => {
                                    Promise.resolve(refetchApiTools()).catch(() => { });
                                },
                            }}
                            mcpSelectorProps={{
                                mcpServers: mcpServers || [],
                                setMcpServers: setMcpServers,
                                agent: undefined,
                                onRefetch: () => {
                                    Promise.resolve(refetchMcp()).catch(() => { });
                                },
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
                                onRefetch: () => {
                                    Promise.resolve(refetchVectorRag()).catch(() => { });
                                },
                            }}
                            graphSelectorProps={{
                                agent: undefined,
                                graphRags: graphRags || [],
                                setGraphRags: setGraphRags,
                                allGraphRags: allGraphRag ?? [],
                                graphRagLoading: fetchingGraphRag,
                                isReadonly: isReadOnly,
                                onRefetch: () => {
                                    Promise.resolve(refetchGraphRag()).catch(() => { });
                                },
                            }}
                            connectorSelectorProps={{
                                agent: undefined,
                                connectors: selectedConnector || [],
                                isMultiple: true,
                                setConnectors: setSelectedConnector,
                                allConnectors: allConnectors ?? [],
                                isReadonly: isReadOnly,
                                onRefetch: () => {
                                    Promise.resolve(refetchConnectors()).catch(() => { });
                                },
                                onConnectorsChange: connector => setSelectedConnector(connector),
                            }}
                            executableSelectorProps={{
                                agent: undefined,
                                functions: executableFunctions,
                                setFunctions: setExecutableFunctions,
                                allExecutableFunctions: allExecutableFunctions as ExecutableFunctionResponseType[],
                                isReadonly: isReadOnly,
                                functionLoading: executableFunctionsLoading,
                                onRefetch: () => {
                                    Promise.resolve(refetchExecutableFunctions()).catch(() => { });
                                },
                            }}
                        />
                        <SelectedInputConnects data={selectedInputConnectData} />
                    </div>

                    {/* Tool Cards Section - Input Request Structure */}
                    {currentTools.length > 0 && (
                        <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
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

                            {/* Tool Cards */}
                            <div className="flex flex-col gap-y-2">
                                {currentTools.map((tool, index) => {
                                    const isExpanded = expandedTools.has(tool.id);
                                    const isDragging = dragIndex === index;
                                    const isDragOver = dragOverIndex === index && dragIndex !== index;
                                    const categoryConfig = getCategoryConfig(tool.category);
                                    const error = validationErrors[tool.id];

                                    return (
                                        <div
                                            key={tool.id}
                                            draggable={!isReadOnly && currentTools.length > 1}
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
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
                                                        {categoryConfig?.badgeLabel ?? ''} {getCategoryIndex(tool, index)}
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

                                            {/* Expanded Editor Section */}
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
                        </div>
                    )}

                    {/* Parameter Mapping Section */}
                    <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                        <div className="flex flex-col gap-y-1">
                            <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                                Parameter Mapping
                            </p>
                            <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                Define parameter mappings for the tool executor
                            </p>
                        </div>

                        <MappingInput
                            label="Parameters"
                            description="Map parameter names to their values"
                            items={parameterMapping}
                            onAdd={handleAddParameterMapping}
                            onRemove={handleRemoveParameterMapping}
                            onUpdate={handleUpdateParameterMapping}
                            disabled={isReadOnly}
                            namePlaceholder="param_name"
                            valuePlaceholder="value"
                        />
                    </div>

                    {/* Response Mapping Section */}
                    <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                        <div className="flex flex-col gap-y-1">
                            <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                                Response Mapping
                            </p>
                            <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                Define response mappings for the tool executor output
                            </p>
                        </div>

                        <MappingInput
                            label="Response Fields"
                            description="Map response field names to their values"
                            items={responseMapping}
                            onAdd={handleAddResponseMapping}
                            onRemove={handleRemoveResponseMapping}
                            onUpdate={handleUpdateResponseMapping}
                            disabled={isReadOnly}
                            namePlaceholder="field_name"
                            valuePlaceholder="value"
                        />
                    </div>

                    {/* Form Actions */}
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

            {/* Maximized Tool Editor Dialog */}
            <Dialog open={!!maximizedTool} onOpenChange={() => setMaximizedTool(null)}>
                <DialogContent className="max-w-[800px] h-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {maximizedTool && (
                                <div className="flex items-center gap-x-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                        {getCategoryConfig(maximizedTool.category)?.badgeLabel}
                                    </span>
                                    <span>{maximizedTool.name}</span>
                                </div>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {maximizedTool && (
                        <div className="flex-1 h-[500px]">
                            <PlatformMonacoEditor
                                value={(responseDataMapping[maximizedTool.id] ?? '').replaceAll(/\{\{|\}\}/g, '')}
                                onChange={(val) => handleToolMappingChange(maximizedTool.id, val)}
                                onBlur={() => handleToolEditorBlur(maximizedTool.id)}
                                intellisenseData={intellisenseData}
                                onRefetchVariables={async () => {}}
                                placeholder={getCategoryConfig(maximizedTool.category)?.placeholder}
                                helperInfo="Map fields to workflow variables. Type @ to insert a variable."
                                height="h-[450px]"
                                isDestructive={!!validationErrors[maximizedTool.id]}
                                supportiveText={validationErrors[maximizedTool.id]}
                                disabled={isReadOnly}
                                enableCategoryIcon
                                language="custom-sql"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};
