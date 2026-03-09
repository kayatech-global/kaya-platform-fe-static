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
    Textarea,
    Label,
    Select,
} from '@/components/atoms';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { AgentType, API, ExecutableFunction } from './agent-form';
import { Plus, X, Cable, Trash2, GripVertical } from 'lucide-react';

// Types for Parameter/Response Mapping
interface MappingItem {
    id: string;
    paramName: string;
    value: string;
}

// Types for Dynamic Input Connect
export interface DynamicInputConnect {
    id: string;
    name: string;
    description?: string;
    dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    defaultValue?: string;
}

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
    // Dynamic Input Connects
    dynamicInputConnects?: DynamicInputConnect[];
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

// Data type options for dynamic input connects
const DATA_TYPE_OPTIONS = [
    { name: 'String', value: 'string' },
    { name: 'Number', value: 'number' },
    { name: 'Boolean', value: 'boolean' },
    { name: 'Object', value: 'object' },
    { name: 'Array', value: 'array' },
];

// Dynamic Input Connect Component
interface DynamicInputConnectSectionProps {
    items: DynamicInputConnect[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: keyof DynamicInputConnect, value: string | boolean) => void;
    disabled?: boolean;
}

const DynamicInputConnectSection: React.FC<DynamicInputConnectSectionProps> = ({
    items,
    onAdd,
    onRemove,
    onUpdate,
    disabled = false,
}) => {
    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <Cable size={20} className="text-cyan-600 dark:text-cyan-400" />
                        <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                            Dynamic Input Connects
                        </p>
                    </div>
                    <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                        Add dynamic input handles that will appear on the node for receiving data from other nodes
                    </p>
                </div>
            </div>

            {/* List of dynamic input connects */}
            <div className="flex flex-col gap-y-3">
                {items.length === 0 ? (
                    <div className="flex items-center justify-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No dynamic inputs added yet
                        </p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex flex-col gap-y-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30"
                        >
                            {/* Header with index and delete button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-x-2">
                                    <GripVertical size={16} className="text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                        Input {index + 1}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={disabled}
                                    onClick={() => onRemove(item.id)}
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>

                            {/* Input fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Name"
                                    placeholder="input_name"
                                    value={item.name}
                                    onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                                    disabled={disabled}
                                />
                                <Select
                                    label="Data Type"
                                    options={DATA_TYPE_OPTIONS}
                                    currentValue={item.dataType}
                                    onChange={(e) => onUpdate(item.id, 'dataType', e.target.value)}
                                    disabled={disabled}
                                />
                            </div>

                            <Input
                                label="Description"
                                placeholder="Describe this input"
                                value={item.description || ''}
                                onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                                disabled={disabled}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Default Value"
                                    placeholder="Optional default"
                                    value={item.defaultValue || ''}
                                    onChange={(e) => onUpdate(item.id, 'defaultValue', e.target.value)}
                                    disabled={disabled}
                                />
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={item.required}
                                            onChange={(e) => onUpdate(item.id, 'required', e.target.checked)}
                                            disabled={disabled}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-200">
                                            Required
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add button */}
            <Button
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={onAdd}
                className="w-fit"
            >
                <Plus size={16} className="mr-1" />
                Add Input Connect
            </Button>
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
    // Dynamic Input Connects state
    const [dynamicInputConnects, setDynamicInputConnects] = useState<DynamicInputConnect[]>([]);

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // Generate unique ID for mapping items
    const generateId = () => `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        setDynamicInputConnects(data?.dynamicInputConnects ?? []);
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
        dynamicInputConnects: (dynamicInputConnects?.length ?? 0) > 0 ? dynamicInputConnects : undefined,
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
        dynamicInputConnects,
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

    // Dynamic Input Connect handlers
    const handleAddDynamicInputConnect = () => {
        const newConnect: DynamicInputConnect = {
            id: generateId(),
            name: '',
            description: '',
            dataType: 'string',
            required: false,
            defaultValue: '',
        };
        setDynamicInputConnects(prev => [...prev, newConnect]);
    };

    const handleRemoveDynamicInputConnect = (id: string) => {
        setDynamicInputConnects(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateDynamicInputConnect = (id: string, field: keyof DynamicInputConnect, value: string | boolean) => {
        setDynamicInputConnects(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
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
                            enabledCategories={[InputConnectKey.API]}
                        />
<SelectedInputConnects data={selectedInputConnectData} />
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
        </React.Fragment>
    );
};
