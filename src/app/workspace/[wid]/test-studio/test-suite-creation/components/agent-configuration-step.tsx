'use client';
import type { Node as XYNode } from '@xyflow/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { ITestStudioFormProps, TestCaseMethod, AgentToolType, ITestSuite } from '../../data-generation';
import { cn } from '@/lib/utils';
import { Cable, FileUp, Network, PackagePlus, Settings, X } from 'lucide-react';
import { AgentType } from '@/components/organisms';
import { Button } from '@/components';
import { ToolsAccordion } from './tools-accordion';
import { GenerateAgentConfigurations } from './generate-agent-configurations';
import { GenerateTestDataModal } from './generate-test-data-modal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import FileUploader from '@/components/atoms/file-uploader';
import { useTestStudioWorkflowGraph } from '@/hooks/use-test-studio-workflow-graph';
import { AutoAgentConfigurationForm } from './auto-agent-configuration-form';
import { ManualAgentConfigurationForm } from './manual-agent-configuration-form';
import { UploadAgentConfigurationForm } from './upload-agent-configuration-form';
export type IAgentTool = {
    id: string;
    label: string;
    type: AgentToolType;
    description?: string;
};

type AgentOutputField = { expectedOutput: string; expectedBehaviour: string; instruction?: string };
import {
    CustomWorkflowRenderer
} from '@/app/workspace/[wid]/test-studio/test-suite-report-generation/components/custom-workflow-renderer';
type AgentConfigurationStepProps = ITestStudioFormProps & {
    isModalFullscreen?: boolean;
    testCaseMethod?: TestCaseMethod;
    agentOutputFields?: Record<string, AgentOutputField[]>;
    setAgentOutputFields?: React.Dispatch<React.SetStateAction<Record<string, AgentOutputField[]>>>;
    agentNames?: string[];
    setAgentNames?: React.Dispatch<React.SetStateAction<string[]>>;
    agentIds?: string[];
    setAgentIds?: React.Dispatch<React.SetStateAction<string[]>>;
    testConfiguration?: Partial<ITestSuite>;
    agentOutputsConfig?: Record<string, unknown>;
};

export const AgentConfigurationStep = (props: AgentConfigurationStepProps) => {
    const {
        watch,
        setValue,
        control,
        testCaseMethod = TestCaseMethod.Manual,
        setAgentNames,
        setAgentIds,
    } = props;
    // Always use form state for agentOutputFields
    const watchedAgentOutputFields = watch('agentOutputFields');
    const agentOutputFields = useMemo(
        () => watchedAgentOutputFields ?? {},
        [watchedAgentOutputFields]
    );
    const [currentSelectedNode, setCurrentSelectedNode] = useState<XYNode | undefined>();
    const [agent, setAgent] = useState<AgentType | null | undefined>();
    const [tools, setTools] = useState<IAgentTool[]>([]);
    const [selectedTools, setSelectedTools] = useState<IAgentTool[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenGenerate, setIsOpenGenerate] = useState<boolean>(false);
    const [isOpenUpload, setIsOpenUpload] = useState<boolean>(false);
    const [isOpenTestDataModal, setIsOpenTestDataModal] = useState<boolean>(false);

    const workflowId = watch('workflowId');
    const watchedInputs = watch('testDataSets');
    // Defensive: always use array
    const inputs = useMemo(() => (Array.isArray(watchedInputs) ? watchedInputs : []), [watchedInputs]);
    // Fetch workflow graph based on selected workflowId
    const { workflowVisual, isLoading: isLoadingWorkflow } = useTestStudioWorkflowGraph(workflowId as string);

    // Ensure workflowGraph is always set in form state for saving/viewing
    useEffect(() => {
        if (workflowVisual && setValue) {
            const currentGraph = watch('workflowGraph');
            // Only update if the graph has actually changed to avoid infinite loops
            if (JSON.stringify(currentGraph) !== JSON.stringify(workflowVisual)) {
                setValue('workflowGraph', workflowVisual, { shouldDirty: true });
            }
        }
    }, [workflowVisual, setValue, watch]);
    // Filter out empty inputs (where all fields are empty)
    // Memoize validInputs to keep reference stable for useEffect dependencies
    const validInputs = useMemo(() => {
        return inputs.filter(
            (input: { input?: {message:string}; groundTruth?: string; expectedOutput?: string }) =>
                input.input || input.groundTruth || input.expectedOutput
        );
    }, [inputs]);

    // Step 3 Agent Output fresh fields state
    // Sync agentOutputFields and agentNames with validInputs
    useEffect(() => {
        if (setAgentNames && setAgentIds && workflowVisual?.nodes) {
            const agentNodes = workflowVisual.nodes.filter(
                node => node.type && (node.type.includes('agent') || node.type.includes('decision'))
            );
            const agentNodeNames: string[] = agentNodes.map(node => String(node.data?.name || node.data?.label || '-'));
            const agentNodeIds: string[] = agentNodes.map(node => node.id);

            // Guard: Only update if the lists have actually changed
            if (JSON.stringify(props.agentNames) !== JSON.stringify(agentNodeNames)) {
                setAgentNames(agentNodeNames);
            }
            if (JSON.stringify(props.agentIds) !== JSON.stringify(agentNodeIds)) {
                setAgentIds(agentNodeIds);
            }
        }
    }, [workflowVisual, setAgentNames, setAgentIds, props.agentNames, props.agentIds]);

    // Maintain output fields per agent node id
    useEffect(() => {
        if (workflowVisual?.nodes) {
            const agentNodes = workflowVisual.nodes.filter(
                node => node.type && (node.type.includes('agent') || node.type.includes('decision'))
            );

            const prev = watch('agentOutputFields');
            const updated: Record<string, AgentOutputField[]> = { ...prev };

            agentNodes.forEach(node => {
                if (!updated[node.id] || updated[node.id].length !== validInputs.length) {
                    updated[node.id] = validInputs.map(
                        (_, i) => prev?.[node.id]?.[i] || { expectedOutput: '', expectedBehaviour: '', instruction: '' }
                    );
                }
            });

            Object.keys(updated).forEach(id => {
                if (!agentNodes.find(n => n.id === id)) {
                    delete updated[id];
                }
            });

            setValue('agentOutputFields', updated, { shouldDirty: true });
        }
    }, [workflowVisual, validInputs, setValue]);

    // Track selected agent node id
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    // Auto-select first agent node when agentOutputFields is loaded (e.g., on edit)
    useEffect(() => {
        if (!selectedAgentId && agentOutputFields && Object.keys(agentOutputFields).length > 0) {
            const firstAgentId = Object.keys(agentOutputFields)[0];
            setSelectedAgentId(firstAgentId);
        }
    }, [agentOutputFields, selectedAgentId]);

    // When user clicks agent node, set selectedAgentId
    const handleNodeClick = useCallback((node?: XYNode) => {
        if (!node?.id) {
            setCurrentSelectedNode(undefined);
            setSelectedAgentId(null);
            return;
        }
        setCurrentSelectedNode(node);
        setSelectedAgentId(node.id);
    }, []);

    useEffect(() => {
        if (currentSelectedNode) {
            setIsOpen(true);
            setAgent(currentSelectedNode?.data as AgentType);
        }
    }, [currentSelectedNode]);

    useEffect(() => {
        if (!agent) {
            setTools([]);
            return;
        }

        const { apis, connectors, mcpServers, guardrails, rags, knowledgeGraphs } = agent;

        const formattedApi: IAgentTool[] =
            apis?.map(api => ({
                id: api.id,
                label: api.name,
                type: AgentToolType.Api,
                description: api?.description,
            })) ?? [];

        const formattedConnectors: IAgentTool[] =
            connectors?.map(connector => ({
                id: connector.id as string,
                label: connector.name,
                type: AgentToolType.Connectors,
                description: connector?.description,
            })) ?? [];

        const formattedGuardrails: IAgentTool[] =
            guardrails?.map(guardrail => ({
                id: guardrail,
                label: guardrail,
                type: AgentToolType.Guardrails,
            })) ?? [];

        const formattedMCPs: IAgentTool[] =
            mcpServers?.map(mcp => ({
                id: mcp.id,
                label: mcp.name,
                type: AgentToolType.Mcp,
                description: mcp?.description,
            })) ?? [];
        // vector rags
        const formattedRags: IAgentTool[] =
            rags
                ?.filter(rag => rag.id)
                .map(rag => ({
                    id: rag.id!,
                    label: rag.name,
                    type: AgentToolType.RAG,
                    description: rag.description,
                })) ?? [];

        //graph rag
        const formattedKnowledgeGraphs: IAgentTool[] =
            knowledgeGraphs
                ?.filter(kg => kg.id)
                .map(kg => ({
                    id: kg.id!,
                    label: kg.name,
                    type: AgentToolType.RAG,
                    description: kg.description,
                })) ?? [];

        setTools([
            ...formattedApi,
            ...formattedConnectors,
            ...formattedGuardrails,
            ...formattedMCPs,
            ...formattedRags,
            ...formattedKnowledgeGraphs,
        ]);
    }, [agent]);

    console.log('currentSelectedNode ', currentSelectedNode);
    console.log('agent ', agent);
    return (
        <div
            className={cn('w-full min-h-[600px] mt-4 grid grid-cols-1 gap-4', {
                'grid-cols-12': isOpen,
            })}
        >
            <div className="col-span-5">
                {(() => {
                    if (isLoadingWorkflow) {
                        return (
                            <div className="flex items-center justify-center h-[600px] border rounded-md bg-gray-50">
                                <p className="text-gray-500">Loading workflow...</p>
                            </div>
                        );
                    }
                    if (workflowVisual) {
                        return (
                            <CustomWorkflowRenderer
                                graphData={workflowVisual}
                                workflowId={workflowId}
                                onClickNode={node => handleNodeClick(node)}
                            />
                        );
                    }
                    return (
                        <div className="flex items-center justify-center h-[600px] border rounded-md bg-gray-50">
                            <p className="text-gray-500">Select a workflow to view</p>
                        </div>
                    );
                })()}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        'bg-gray-50 border border-gray-100 shadow-inner col-span-7 rounded-md text-sm flex flex-col'
                    )}
                >
                    <div className="flex items-start justify-between gap-6 w-full overflow-hidden p-4 border-b">
                        <div className="flex items-center gap-3 w-full overflow-hidden">
                            <div className="size-9 min-w-9 bg-blue-100 rounded-md flex items-center justify-center">
                                <Network className="text-blue-600" size={16} />
                            </div>
                            <div className="flex flex-col w-full overflow-hidden">
                                <p>{agent?.name}</p>
                                <p className="truncate text-xs text-gray-500">{agent?.description}</p>
                            </div>
                        </div>

                        <X
                            size={18}
                            className="text-gray-500 cursor-pointer"
                            onClick={() => {
                                setIsOpen(false);
                                setSelectedTools([]);
                            }}
                        />
                    </div>

                    {selectedTools?.length > 0 && (
                        <div className="p-4 border-b flex items-center justify-between">
                            <p className="text-xs">
                                Selected : <span className="font-bold">{selectedTools?.length}</span>
                            </p>

                            <div className="flex items-center gap-2">
                                <Button size={'sm'} leadingIcon={<Settings />} onClick={() => setIsOpenGenerate(true)}>
                                    Tool Config
                                </Button>
                                {/* <Button 
                                    size={'sm'} 
                                    variant={'outline'} 
                                    leadingIcon={<FileUp />}
                                    onClick={() => setIsOpenUpload(true)}
                                >
                                    Upload
                                </Button> */}
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto p-4 space-y-4 max-h-[600px]">
                        <p className="flex items-center gap-2">
                            <PackagePlus size={18} absoluteStrokeWidth={false} className="stroke-[2px]" /> Input Data
                            Connect
                        </p>
                        <ToolsAccordion
                            tools={tools}
                            selectedTools={selectedTools}
                            setSelectedTools={setSelectedTools}
                        />

                        <div className="border-t pt-4 mt-4" />
                        <div className="space-y-3">
                            <p className="flex items-center gap-2 pb-3">
                                <Cable size={18} absoluteStrokeWidth={false} className="stroke-[2px]" /> Agent Outputs
                            </p>
                            <div className="space-y-3 pr-2">
                                {/* Agent output fields are always independent per agent */}
                                {testCaseMethod === TestCaseMethod.Auto && selectedAgentId && (
                                    <AutoAgentConfigurationForm selectedAgentId={selectedAgentId} control={control} />
                                )}
                                {testCaseMethod === TestCaseMethod.Manual && selectedAgentId && (
                                    <ManualAgentConfigurationForm validInputs={validInputs} inputs={inputs} selectedAgentId={selectedAgentId} control={control} />
                                )}
                                {testCaseMethod === TestCaseMethod.Upload && selectedAgentId && (
                                    <UploadAgentConfigurationForm selectedAgentId={selectedAgentId} control={control} watch={watch} />
                                )}
                            </div>
                        </div>

                        {/* Add Sample Output, Ground Truth, Instruction fields here */}
                    </div>
                </div>
            )}

            <GenerateTestDataModal
                isOpen={isOpenTestDataModal}
                setIsOpen={setIsOpenTestDataModal}
                // isFullscreen={isModalFullscreen}
                watch={watch}
            />

            <GenerateAgentConfigurations
                selectedTools={selectedTools}
                agent={agent}
                isOpen={isOpenGenerate}
                setIsOpen={setIsOpenGenerate}
                inputs={validInputs}
                testCaseMethod={testCaseMethod}
                selectedAgentId={selectedAgentId}
                watch={props.watch}
                setValue={props.setValue}
            />

            <Dialog open={isOpenUpload} onOpenChange={setIsOpenUpload}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <FileUp size={20} className="text-blue-500" />
                            <DialogTitle>Upload</DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="px-5 py-4">
                        <FileUploader />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsOpenUpload(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsOpenUpload(false)}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
