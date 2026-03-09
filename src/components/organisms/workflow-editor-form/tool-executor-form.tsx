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
} from '@/components/atoms';
import { useDnD } from '@/context';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { AgentType, API, ExecutableFunction } from './agent-form';
import { FileJson2, Maximize2, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import MonacoEditor, { IntellisenseCategory } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';

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
    responseDataMapping?: Record<string, string>;
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
    const [apis, setApis] = useState<API[] | undefined>([]);
    const [mcpServers, setMcpServers] = useState<IMCPBody[] | undefined>([]);
    const [vectorRags, setVectorRags] = useState<IVectorRag[] | undefined>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[] | undefined>([]);
    const [selectedConnector, setSelectedConnector] = useState<IConnectorForm[] | undefined>([]);
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[] | undefined>([]);
    const [responseDataMapping, setResponseDataMapping] = useState<Record<string, string>>({});
    const [maximizedApi, setMaximizedApi] = useState<{ id: string; name: string } | null>(null);
    const [expandedApiId, setExpandedApiId] = useState<string | null>(null);

    const { trigger, setSelectedNodeId, setTrigger, workflowVariables } = useDnD();
    const { updateNodeData } = useReactFlow();

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
        setResponseDataMapping(data?.responseDataMapping ?? {});
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
        responseDataMapping: Object.keys(responseDataMapping).length > 0 ? responseDataMapping : undefined,
    }), [
        name, description, apis, mcpServers, vectorRags, graphRags,
        selectedConnector, executableFunctions, responseDataMapping,
    ]);

    const handleSaveNodeData = () => {
        updateNodeData(selectedNode.id, constructNodeData());
        toast.success('Tool Executor updated');
        setTrigger((trigger ?? 0) + 1);
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

    // Intellisense data for Monaco editor — sourced from workflow variables
    const intellisenseData: IntellisenseCategory[] = useMemo(() => {
        const variableOptions = (workflowVariables ?? []).map((v) => ({
            label: v.name,
            value: `Variable:${v.name}`,
        }));

        return [
            {
                name: 'Variables',
                options: variableOptions,
            },
        ];
    }, [workflowVariables]);

    const handleRefetchVariables = async () => {
        // Can be enhanced to refetch dynamic variables
    };

    const handleApiMappingChange = (apiId: string, value: string) => {
        setResponseDataMapping(prev => ({
            ...prev,
            [apiId]: value,
        }));
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
            <div className="group flex flex-col h-[calc(100vh-270px)]">
                <div
                    className={cn(
                        'tool-executor-form pr-1 flex flex-col gap-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        { hidden: isLoading }
                    )}
                >
                    {/* Input Data Connect Section */}
                    <div className="flex flex-col gap-y-2 pb-4 bottom-gradient-border">
                        <InputDataConnectContainer
                            agent={undefined}
                            enabledCategories={[InputConnectKey.API]}
                            apiSelectorProps={{
                                agent: undefined,
                                apis: apis,
                                setApis: setApis,
                                allApiTools: allApiTools as ApiToolResponseType[],
                                isReadonly: isReadOnly,
                                apiLoading: apiLoading,
                                hideEditButton: true,
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

                    {/* Response Data Mapping Section */}
                    <div className="flex flex-col gap-y-4 pb-4 bottom-gradient-border">
                        <div className="flex items-center gap-x-2">
                            <FileJson2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                            <div className="flex flex-col gap-y-1">
                                <p className="text-md font-medium text-gray-700 dark:text-gray-100">
                                    Input Request Structure
                                </p>
                                <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                                    JSON mirroring previous node output. Use Variable:name for values. Type @ to insert variables.
                                </p>
                            </div>
                        </div>

                        {(!apis || apis.length === 0) ? (
                            <div className="flex items-center justify-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No APIs selected. Add APIs above to configure response mappings.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-y-2">
                                {apis.map((api, index) => {
                                    const apiKey = api.id || `api-${index}`;
                                    const isExpanded = expandedApiId === apiKey;
                                    return (
                                        <div key={apiKey} className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 overflow-hidden">
                                            <button
                                                type="button"
                                                className="flex items-center justify-between p-3 w-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                onClick={() => setExpandedApiId(isExpanded ? null : apiKey)}
                                            >
                                                <div className="flex items-center gap-x-2">
                                                    {isExpanded ? (
                                                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                                                    ) : (
                                                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                                                    )}
                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                        API {index + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                                        {api.name || 'Unnamed API'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-x-1" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                        onClick={() => setMaximizedApi({ id: apiKey, name: api.name || 'Unnamed API' })}
                                                        title="Maximize editor"
                                                    >
                                                        <Maximize2 size={14} />
                                                    </Button>
                                                </div>
                                            </button>
                                            {isExpanded && (
                                                <div className="px-3 pb-3">
                                                    <MonacoEditor
                                                        value={responseDataMapping[apiKey] || ''}
                                                        onChange={(value) => handleApiMappingChange(apiKey, value)}
                                                        intellisenseData={intellisenseData}
                                                        onRefetchVariables={handleRefetchVariables}
                                                        placeholder={`{\n  "result": @response,\n  "userId": @userId\n}`}
                                                        helperInfo="Type @ to trigger intellisense"
                                                        height="h-[150px]"
                                                        hasEnhance={false}
                                                        disabled={isReadOnly}
                                                        enableCategoryIcon={true}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Maximized Editor Modal */}
                        <Dialog open={!!maximizedApi} onOpenChange={(open) => !open && setMaximizedApi(null)}>
                            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                                <DialogHeader className="flex-shrink-0">
                                    <DialogTitle className="flex items-center gap-x-2">
                                        <FileJson2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>Response Data Mapping - {maximizedApi?.name}</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 min-h-0">
                                    {maximizedApi && (
                                        <MonacoEditor
                                            value={responseDataMapping[maximizedApi.id] || ''}
                                            onChange={(value) => handleApiMappingChange(maximizedApi.id, value)}
                                            intellisenseData={intellisenseData}
                                            onRefetchVariables={handleRefetchVariables}
                                            placeholder={`{\n  "result": @response,\n  "userId": @userId,\n  "data": {\n    "field1": @firstName,\n    "field2": @lastName\n  }\n}`}
                                            helperInfo="Type @ to trigger intellisense and select from available variables"
                                            height="h-full"
                                            hasEnhance={false}
                                            disabled={isReadOnly}
                                            enableCategoryIcon={true}
                                        />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                </div>

                {/* Form Actions - Fixed at bottom */}
                <div className="tool-executor-form-footer flex-shrink-0 flex gap-x-3 justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData}>
                        Save
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
};
