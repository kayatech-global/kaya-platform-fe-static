/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { InputDataConnectContainer } from '@/app/editor/[wid]/[workflow_id]/components/input-data-connect/input-data-connect-container';
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
} from '@/components/atoms';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { AgentType, API, ExecutableFunction } from './agent-form';

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
    // Dynamic input connections - stores the count of input handles
    dynamicInputCount?: number;
    // Input connection mappings
    inputConnections?: { id: string; label: string; sourceNodeId?: string }[];
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
    const [apis, setApis] = useState<API[]>([]);
    const [mcpServers, setMcpServers] = useState<IMCPBody[]>([]);
    const [vectorRags, setVectorRags] = useState<IVectorRag[]>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[]>([]);
    const [selectedConnector, setSelectedConnector] = useState<IConnectorForm[]>([]);
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[]>([]);
    
    // Dynamic input connections state
    const [dynamicInputCount, setDynamicInputCount] = useState<number>(1);
    const [inputConnections, setInputConnections] = useState<{ id: string; label: string; sourceNodeId?: string }[]>([
        { id: 'input-1', label: 'Input 1' }
    ]);

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

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
        setDynamicInputCount(data?.dynamicInputCount ?? 1);
        setInputConnections(data?.inputConnections ?? [{ id: 'input-1', label: 'Input 1' }]);
    }, [selectedNode?.data]);

    useEffect(() => {
        initFormData();
    }, [selectedNode?.data, initFormData]);

    // Construct node data for saving
    const constructNodeData = useCallback(() => ({
        name,
        description,
        apis: apis?.length > 0 ? apis : undefined,
        mcpServers: mcpServers?.length > 0 ? mcpServers : undefined,
        rags: vectorRags?.length > 0 ? vectorRags : undefined,
        knowledgeGraphs: graphRags?.length > 0 ? graphRags : undefined,
        connectors: selectedConnector?.length > 0 ? selectedConnector : undefined,
        executableFunctions: executableFunctions?.length > 0 ? executableFunctions : undefined,
        dynamicInputCount,
        inputConnections,
    }), [
        name,
        description,
        apis,
        mcpServers,
        vectorRags,
        graphRags,
        selectedConnector,
        executableFunctions,
        dynamicInputCount,
        inputConnections,
    ]);

    // Save handler
    const handleSaveNodeData = () => {
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('Tool Executor updated');
        setTrigger((trigger ?? 0) + 1);
    };

    // Add new dynamic input connection
    const handleAddInputConnection = () => {
        const newCount = dynamicInputCount + 1;
        setDynamicInputCount(newCount);
        setInputConnections(prev => [
            ...prev,
            { id: `input-${newCount}`, label: `Input ${newCount}` }
        ]);
    };

    // Remove dynamic input connection
    const handleRemoveInputConnection = (inputId: string) => {
        if (inputConnections.length <= 1) {
            toast.warning('At least one input connection is required');
            return;
        }
        setInputConnections(prev => prev.filter(conn => conn.id !== inputId));
    };

    // Update input connection label
    const handleUpdateInputLabel = (inputId: string, newLabel: string) => {
        setInputConnections(prev => 
            prev.map(conn => conn.id === inputId ? { ...conn, label: newLabel } : conn)
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

                    {/* Dynamic Input Connections Section */}
                    <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-y-1">
                                <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                                    Input Connections
                                </p>
                                <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                    Configure dynamic input handles for this node
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddInputConnection}
                                disabled={isReadOnly}
                            >
                                Add Input
                            </Button>
                        </div>

                        <div className="flex flex-col gap-y-3">
                            {inputConnections.map((connection, index) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center gap-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
                                >
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-semibold">
                                        {index + 1}
                                    </div>
                                    <Input
                                        className="flex-1"
                                        placeholder="Input label"
                                        value={connection.label}
                                        onChange={e => handleUpdateInputLabel(connection.id, e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveInputConnection(connection.id)}
                                        disabled={isReadOnly || inputConnections.length <= 1}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <i className="ri-delete-bin-line text-lg" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-gray-400">
                            {inputConnections.length} input connection{inputConnections.length !== 1 ? 's' : ''} configured
                        </p>
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
                                    Promise.resolve(refetchApiTools()).catch(() => {});
                                },
                            }}
                            mcpSelectorProps={{
                                mcpServers: mcpServers,
                                setMcpServers: setMcpServers,
                                agent: undefined,
                                onRefetch: () => {
                                    Promise.resolve(refetchMcp()).catch(() => {});
                                },
                                isReadonly: isReadOnly,
                                loading: mcpLoading,
                                allMcpTools: allMcpTools as McpToolResponseType[],
                            }}
                            vectorSelectorProps={{
                                agent: undefined,
                                vectorRags: vectorRags,
                                setVectorRags: setVectorRags,
                                allVectorRags: allVectorRags ?? [],
                                vectorRagLoading: vectorRagLoading,
                                isReadonly: isReadOnly,
                                onRefetch: () => {
                                    Promise.resolve(refetchVectorRag()).catch(() => {});
                                },
                            }}
                            graphSelectorProps={{
                                agent: undefined,
                                graphRags: graphRags,
                                setGraphRags: setGraphRags,
                                allGraphRags: allGraphRag ?? [],
                                graphRagLoading: fetchingGraphRag,
                                isReadonly: isReadOnly,
                                onRefetch: () => {
                                    Promise.resolve(refetchGraphRag()).catch(() => {});
                                },
                            }}
                            connectorSelectorProps={{
                                agent: undefined,
                                connectors: selectedConnector,
                                isMultiple: true,
                                setConnectors: setSelectedConnector,
                                allConnectors: allConnectors ?? [],
                                isReadonly: isReadOnly,
                                onRefetch: () => {
                                    Promise.resolve(refetchConnectors()).catch(() => {});
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
                                    Promise.resolve(refetchExecutableFunctions()).catch(() => {});
                                },
                            }}
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
