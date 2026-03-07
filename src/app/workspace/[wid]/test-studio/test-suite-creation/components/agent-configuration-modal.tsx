'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { Button, Textarea, Label, Select } from '@/components';
import { Network, X, PackagePlus, Cable, CheckCircle2, FileCheck, FileSpreadsheet, Columns } from 'lucide-react';
import { useTestStudioWorkflowGraph } from '@/hooks/use-test-studio-workflow-graph';
import type { Node as XYNode } from '@xyflow/react';
import { AgentType } from '@/components/organisms';
import { IAgentTool } from './agent-configuration-step';
import {
    UseFormWatch,
    UseFormSetValue,
    Control,
    UseFormRegister,
    FieldErrors,
    Controller,
} from 'react-hook-form';
import { ITestSuite, TestCaseMethod, AgentToolType } from '../../data-generation';
import { cn, handleNoValue } from '@/lib/utils';
import { GenerateAgentConfigurations } from './generate-agent-configurations';
import { AgentToolConfigurationContainer } from '@/app/workspace/[wid]/test-studio/test-suite-creation/components/agent-tool-configuration-container';
import { CustomWorkflowRenderer } from '@/app/workspace/[wid]/test-studio/test-suite-report-generation/components/custom-workflow-renderer';

// Helper function to check if a column is used in agent field mappings
const isColumnUsedInAgentMappings = (
    header: string,
    currentAgentId: string,
    agentColumnMappings: Record<string, { outputColumn?: string; truthColumn?: string }>
): boolean => {
    return Object.entries(agentColumnMappings).some(([id, mapping]) => {
        if (id === currentAgentId) return false;
        return mapping?.outputColumn === header || mapping?.truthColumn === header;
    });
};

// Helper function to create options for agent field dropdowns
const createOptionsForAgentField = (
    excelHeaders: string[],
    fieldType: 'output' | 'truth',
    currentAgentId: string,
    mainColumns: {
        titleColumn?: string;
        inputColumn?: string;
        mainOutputColumn?: string;
        mainTruthColumn?: string;
    },
    currentAgentMapping: {
        outputColumn?: string;
        truthColumn?: string;
    },
    agentColumnMappings: Record<string, { outputColumn?: string; truthColumn?: string }>
) => {
    return excelHeaders.map((header: string) => {
        const usedInMainConfig = [
            mainColumns.titleColumn,
            mainColumns.inputColumn,
            mainColumns.mainOutputColumn,
            mainColumns.mainTruthColumn,
        ].includes(header);
        
        const usedInCurrentAgentOtherField = 
            fieldType === 'output' 
                ? currentAgentMapping.truthColumn === header
                : currentAgentMapping.outputColumn === header;
        
        const usedInOtherAgents = isColumnUsedInAgentMappings(header, currentAgentId, agentColumnMappings);
        
        return {
            name: header,
            value: header,
            disabled: usedInMainConfig || usedInCurrentAgentOtherField || usedInOtherAgents,
        };
    });
};

type AgentConfigurationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    testCaseIndex: number;
    workflowId: string;
    watch: UseFormWatch<ITestSuite>;
    setValue: UseFormSetValue<ITestSuite>;
    control: Control<ITestSuite>;
    testCaseMethod?: TestCaseMethod;
    register: UseFormRegister<ITestSuite>;
    errors: FieldErrors<ITestSuite>;
    isEdit: boolean;
};

export const AgentConfigurationModal = (props: AgentConfigurationModalProps) => {
    const {
        isOpen,
        onClose,
        testCaseIndex,
        workflowId,
        watch,
        setValue,
        testCaseMethod = TestCaseMethod.Manual,
        register,
        isEdit,
    } = props;
    const { workflowVisual, isLoading: isLoadingWorkflow } = useTestStudioWorkflowGraph(workflowId);

    // Local state for UI
    const [currentSelectedNode, setCurrentSelectedNode] = useState<XYNode | undefined>();
    const [agent, setAgent] = useState<AgentType | null | undefined>();
    const [tools, setTools] = useState<IAgentTool[]>([]);
    const [selectedTools, setSelectedTools] = useState<IAgentTool[]>([]);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isOpenGenerate, setIsOpenGenerate] = useState(false);

    // Watch agentSelectedTools for tool selection persistence
    const agentSelectedTools = watch('agentSelectedTools') ?? {};

    // Snapshot of form fields taken when the modal opens — used to restore on cancel
    const snapshotRef = useRef<{
        testDataSets: ITestSuite['testDataSets'];
        agentColumnMappings: ITestSuite['agentColumnMappings'];
        agentSelectedTools: ITestSuite['agentSelectedTools'];
        toolMockConfigs: ITestSuite['toolMockConfigs'];
    } | null>(null);

    // Reset selection when modal closes or index changes
    useEffect(() => {
        if (!isOpen) {
            setCurrentSelectedNode(undefined);
            setAgent(null);
            setIsDetailsOpen(false);
        }
    }, [isOpen]);

    // Ref for the commit function exposed by AgentToolConfigurationContainer.
    // Calling it flushes local toggle state to the form before Done closes the modal.
    const toolConfigCommitRef = useRef<(() => void) | null>(null);

    // Take a deep-cloned snapshot when the modal opens.
    // Deep clone is required because RHF mutates nested form values in place,
    // so a shallow reference would be corrupted by subsequent setValue calls.
    useEffect(() => {
        if (isOpen) {
            snapshotRef.current = {
                testDataSets: JSON.parse(JSON.stringify(watch('testDataSets') ?? [])),
                agentColumnMappings: JSON.parse(JSON.stringify(watch('agentColumnMappings') ?? {})),
                agentSelectedTools: JSON.parse(JSON.stringify(watch('agentSelectedTools') ?? {})),
                toolMockConfigs: JSON.parse(JSON.stringify(watch('toolMockConfigs') ?? [])),
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Construct tools list when agent changes
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

        const formattedRags: IAgentTool[] =
            rags
                ?.filter(rag => rag.id)
                .map(rag => ({
                    id: rag.id!,
                    label: rag.name,
                    type: AgentToolType.RAG,
                    description: rag.description,
                })) ?? [];

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

    // Hydrate selectedTools from persisted state when agent or tools change
    useEffect(() => {
        const agentId = currentSelectedNode?.id;
        if (agent && agentId && tools.length > 0) {
            const savedTools = agentSelectedTools[agentId] ?? [];
            // Filter tools that match saved IDs
            const restoredSelection = tools.filter(t => savedTools.includes(t.id));
            if (restoredSelection.length > 0 || savedTools.length > 0) {
                setSelectedTools(restoredSelection);
            } else {
                setSelectedTools([]);
            }
        } else if (agent) {
            // If tools list is empty or agent just selected without tools
            setSelectedTools([]);
        }
    }, [agent, tools]); // Intentionally omitting agentSelectedTools to avoid loops

    // Persist selectedTools to form state when selection changes
    useEffect(() => {
        const agentId = currentSelectedNode?.id;
        if (!agent || !agentId) return;
        // Don't save when tools are still loading - prevents race condition
        // where empty selection overwrites saved data during agent switch
        if (tools.length === 0) return;

        const currentIds = selectedTools.map(t => t.id);
        const savedIds = agentSelectedTools[agentId] ?? [];

        // Check for difference to avoid unnecessary writes
        const isDifferent = currentIds.length !== savedIds.length || !currentIds.every(id => savedIds.includes(id));

        if (isDifferent) {
            const updated = {
                ...agentSelectedTools,
                [agentId]: currentIds,
            };
            // Use setValue to update the form state
            setValue('agentSelectedTools', updated, { shouldDirty: true });
        }
    }, [selectedTools, agent, setValue, tools.length]); // Intentionally omitting agentSelectedTools

    const handleNodeClick = useCallback((node?: XYNode) => {
        if (!node?.id) {
            setCurrentSelectedNode(undefined);
            setAgent(undefined);
            setIsDetailsOpen(false);
            return;
        }

        // Only handle agent/decision nodes
        if (node.type?.includes('agent') || node.type?.includes('decision')) {
            setCurrentSelectedNode(node);
            setAgent(node.data as AgentType);
            setIsDetailsOpen(true);
        }
    }, []);

    const watchedInputs = watch('testDataSets') ?? [];

    // Helper to get current values
    const currentAgentId = currentSelectedNode?.id;
    const currentAgentName = agent?.name ?? '';

    // Get or create agent evaluation and return its index
    const getOrCreateAgentEvaluationIndex = (): number => {
        if (!currentAgentId) return -1;

        const testDataSets = [...(watch('testDataSets') ?? [])];

        // Ensure testDataSet exists at index
        if (!testDataSets[testCaseIndex]) {
            testDataSets[testCaseIndex] = {
                input: {message:''},
                expectedBehaviour: '',
                expectedOutput: '',
                agentEvaluations: [],
            };
        }

        // Ensure agentEvaluations array exists
        testDataSets[testCaseIndex].agentEvaluations ??= [];

        const existingIndex = testDataSets[testCaseIndex].agentEvaluations.findIndex(
            ae => ae.nodeId === currentAgentId
        );

        if (existingIndex >= 0) {
            return existingIndex;
        }

        // Create new evaluation entry
        testDataSets[testCaseIndex].agentEvaluations.push({
            nodeId: currentAgentId,
            agentName: currentAgentName,
            expectedBehaviour: '',
            expectedOutput: '',
            toolMockSelections: [],
        });

        setValue('testDataSets', testDataSets, { shouldDirty: true });
        return testDataSets[testCaseIndex].agentEvaluations.length - 1;
    };

    // Get evaluation index for register path
    const evaluationIndex = currentAgentId ? getOrCreateAgentEvaluationIndex() : -1;

    // Build register field paths
    const getFieldPath = (field: 'expectedOutput' | 'expectedBehaviour') => {
        return `testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.${field}` as const;
    };

    // Helper function to render workflow content
    const renderWorkflowContent = () => {
        if (isLoadingWorkflow || (workflowId && !workflowVisual)) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading workflow...</p>
                </div>
            );
        }
        
        if (workflowVisual) {
            return (
                <CustomWorkflowRenderer
                    graphData={workflowVisual}
                    workflowId={workflowId}
                    onClickNode={handleNodeClick}
                />
            );
        }
        
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No workflow data available</p>
            </div>
        );
    };

    const renderAutoFields = () => {
        if (!currentAgentId || evaluationIndex < 0) return null;

        // Build auto field paths (uses index 0 for auto mode, but evaluationIndex for the agent)
        const getAutoFieldPath = (field: 'expectedOutput' | 'expectedBehaviour') => {
            return `testDataSets.0.agentEvaluations.${evaluationIndex}.${field}` as const;
        };

        return (
            <div key={`auto-agent-config-${currentAgentId}`} className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 mt-4">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <Label htmlFor={`autoExpectedOutput-${currentAgentId}`} className="text-xs">
                                Sample Output
                            </Label>
                        </div>
                        <p className="text-xs font-normal text-gray-400 mt-2 pb-3">
                            Provide an example of the expected agent output. The AI uses this as a sample to generate
                            realistic expected outputs for each test case.
                        </p>
                        <Textarea
                            key={`autoExpectedOutput-${currentAgentId}-${evaluationIndex}`}
                            {...register(getAutoFieldPath('expectedOutput'))}
                            placeholder="Describe how the agent is expected to reply (e.g., 'Agent should identify the invalid format and ask for a correct ID')."
                            rows={3}
                            className="text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <FileCheck size={14} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <Label htmlFor={`autoGroundTruth-${currentAgentId}`} className="text-xs">
                                Expected Agent Behaviour
                            </Label>
                        </div>
                        <p className="text-xs font-normal text-gray-400 mt-2 pb-3">
                            Provide an example of the expected agent behavior. The AI uses this as a sample to generate
                            appropriate expected agent behavior for each test case.
                        </p>
                        <Textarea
                            key={`autoExpectedBehaviour-${currentAgentId}-${evaluationIndex}`}
                            {...register(getAutoFieldPath('expectedBehaviour'))}
                            placeholder="Provide the factual correct answer or policy reference (e.g., 'Order IDs must start with ORD- followed by digits')."
                            rows={3}
                            className="text-xs"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderUploadFields = () => {
        const agentId = currentSelectedNode?.id;
        if (!agentId) return null;

        const excelHeaders = watch('excelHeaders') ?? [];
        
        // Watch all column selections from main upload config
        const titleColumn = watch('titleColumn');
        const inputColumn = watch('inputColumn');
        const mainOutputColumn = watch('outputColumn');
        const mainTruthColumn = watch('truthColumn');
        
        // Watch all agent column mappings
        const agentColumnMappings = watch('agentColumnMappings') ?? {};
        const currentAgentMapping = agentColumnMappings[agentId] ?? {};
        
        // Prepare main columns object for helper function
        const mainColumns = {
            titleColumn,
            inputColumn,
            mainOutputColumn,
            mainTruthColumn,
        };
        
        // Get options with disabled state using helper functions
        const outputOptions = createOptionsForAgentField(
            excelHeaders,
            'output',
            agentId,
            mainColumns,
            currentAgentMapping,
            agentColumnMappings
        );
        
        const truthOptions = createOptionsForAgentField(
            excelHeaders,
            'truth',
            agentId,
            mainColumns,
            currentAgentMapping,
            agentColumnMappings
        );

        return (
            <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Cable size={16} />
                    <span>Column Mapping Configuration</span>
                </div>
                <p className="text-xs font-normal text-gray-400 mt-2 pb-3">
                    Map columns from your uploaded file to this specific agent&apos;s validation fields. This allows you
                    to verify each agent&apos;s output and behavior independently using data from your dataset.
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2 mt-5">
                            <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FileSpreadsheet size={14} className="text-green-600 dark:text-green-400" />
                            </div>
                            <Label className="text-xs">
                                Exp. Output Column <span className="text-red-500">*</span>
                            </Label>
                        </div>
                        <p className="text-xs font-normal text-gray-400 mt-2 pb-3">
                            Select the column containing expected outputs for this agent. These values will be used to
                            validate the agent&apos;s responses during test execution.
                        </p>
                        <Controller
                            key={`output-${agentId}`}
                            name={`agentColumnMappings.${agentId}.outputColumn`}
                            control={props.control}
                            defaultValue=""
                            render={({ field }) => (
                                <Select
                                    options={outputOptions}
                                    value={field.value || ''}
                                    onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                        const value = typeof val === 'string' ? val : val?.target?.value ?? '';
                                        field.onChange(value);
                                    }}
                                    hasClear={!!field.value}
                                    onClear={() => field.onChange('')}
                                    placeholder="Select column"
                                    className="h-8 text-xs text-gray-900 dark:text-gray-100"
                                />
                            )}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2 mt-5">
                            <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Columns size={14} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <Label className="text-xs">Expected Agent behaviour</Label>
                        </div>
                        <p className="text-xs font-normal text-gray-400 mt-2 pb-3">
                            Select the column containing business rules or policy references for this agent. This
                            validates that the agent&apos;s reasoning and decision-making align with your requirements.
                        </p>
                        <Controller
                            key={`truth-${agentId}`}
                            name={`agentColumnMappings.${agentId}.truthColumn`}
                            control={props.control}
                            defaultValue=""
                            render={({ field }) => (
                                <Select
                                    options={truthOptions}
                                    value={field.value || ''}
                                    onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                        const value = typeof val === 'string' ? val : val?.target?.value ?? '';
                                        field.onChange(value);
                                    }}
                                    hasClear={!!field.value}
                                    onClear={() => field.onChange('')}
                                    placeholder="Select column"
                                    className="h-8 text-xs text-gray-900 dark:text-gray-100"
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        );
    };
    // Cancel: restore all fields to the snapshot taken when the modal opened, then close
    const handleCancel = () => {
        if (snapshotRef.current) {
            setValue('testDataSets', snapshotRef.current.testDataSets);
            setValue('agentColumnMappings', snapshotRef.current.agentColumnMappings);
            setValue('agentSelectedTools', snapshotRef.current.agentSelectedTools);
            setValue('toolMockConfigs', snapshotRef.current.toolMockConfigs);
        }
        onClose();
    };

    // Done: flush deferred toggle state (un-mocked tools) then close
    const handleDone = () => {
        toolConfigCommitRef.current?.();
        onClose();
    };
    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b dark:border-gray-700">
                    <DialogTitle>Configure Agent Output (Test Case #{testCaseIndex + 1})</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid grid-cols-12">
                    {/* Left Side: Graph */}
                    <div className={cn('relative border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900', isDetailsOpen ? 'col-span-6' : 'col-span-12')}>
                        {renderWorkflowContent()}
                    </div>

                    {/* Right Side: Details Panel */}
                    {isDetailsOpen && (
                        <div className="col-span-6 flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden">
                            {/* Panel Header */}
                            <div className="flex items-start justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="size-9 min-w-9 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                                        <Network className="text-blue-600 dark:text-blue-400" size={16} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="font-medium text-sm truncate dark:text-gray-100">{agent?.name || 'Unknown Agent'}</p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {handleNoValue(agent?.description, 'No description')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                <div className="space-y-3 pr-2">
                                    {(() => {
                                        if (testCaseMethod === TestCaseMethod.Auto && !isEdit) return renderAutoFields();
                                        if (testCaseMethod === TestCaseMethod.Upload && !isEdit) return renderUploadFields();
                                        return (
                                        // Manual mode: Show simple inputs for the specific test case
                                        // key forces re-mount when switching agents so register binds to the correct field path
                                        <div key={`agent-config-${currentAgentId}`} className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 mt-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                <Cable size={16} />
                                                <span>Output Configuration</span>
                                            </div>
                                            <p className="text-xs font-normal text-gray-400 mt-2 mb-3">
                                                Define what this specific agent should output and how it should behave.
                                                These expectations are validated independently from the overall workflow
                                                output, enabling granular testing of each agent&apos;s output and
                                                behaviour.
                                            </p>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 mb-2 mt-6">
                                                        <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                            <CheckCircle2
                                                                size={14}
                                                                className="text-blue-600 dark:text-blue-400"
                                                            />
                                                        </div>
                                                        <Label className="text-xs">
                                                            Expected Output
                                                        </Label>
                                                    </div>
                                                    <p className="text-xs font-normal text-gray-400 mt-2 pb-4">
                                                        Define what this agent should respond with when processing the
                                                        test input. This is validated separately from the
                                                        workflow&apos;s final output, allowing you to verify that each
                                                        agent performs correctly within the workflow chain.
                                                    </p>
                                                    {evaluationIndex >= 0 && (
                                                        <Textarea
                                                            key={`expectedOutput-${currentAgentId}-${evaluationIndex}`}
                                                            {...register(getFieldPath('expectedOutput'))}
                                                            placeholder="Describe how the agent is expected to reply (e.g., 'Agent should identify the invalid format and ask for a correct ID')."
                                                            className="text-xs min-h-[120px]"
                                                        />
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 mb-2 mt-6">
                                                        <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                            <FileCheck
                                                                size={14}
                                                                className="text-amber-600 dark:text-amber-400"
                                                            />
                                                        </div>
                                                        <Label className="text-xs">Expected Agent Behaviour</Label>
                                                    </div>
                                                    <p className="text-xs font-normal text-gray-400 mt-2 pb-4">
                                                        Specify the expected agent behaviour. Use this to verify the
                                                        agent&apos;s reasoning and decision making ability.
                                                    </p>
                                                    {evaluationIndex >= 0 && (
                                                        <Textarea
                                                            key={`expectedBehaviour-${currentAgentId}-${evaluationIndex}`}
                                                            {...register(getFieldPath('expectedBehaviour'))}
                                                            placeholder="Provide the factual correct answer or policy reference (e.g., 'Order IDs must start with ORD- followed by digits')."
                                                            className="text-xs min-h-[120px]"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })()}
                                </div>
                                {/* Tools Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <PackagePlus size={16} />
                                        <span>Input Data Connect Mocking</span>
                                    </div>
                                    <p className="text-xs font-normal text-gray-400 mt-2 mb-3">
                                        Configure mock responses for this agent&apos;s Data Connectors. When a mock is
                                        enabled, the test uses the mock data instead of calling the actual service.
                                        Leave disabled to test with actual Data Connector responses.
                                    </p>
                                    {
                                        tools.length>0? (
                                            <AgentToolConfigurationContainer
                                                key={`tool-config-${currentSelectedNode?.id}-${evaluationIndex}`}
                                                tools={tools}
                                                watch={watch}
                                                setValue={setValue}
                                                testCaseIndex={testCaseIndex}
                                                agentId={currentSelectedNode?.id ?? ''}
                                                evaluationIndex={evaluationIndex}
                                                onCommitRef={toolConfigCommitRef}
                                            />
                                        ):(
                                            <div className={"flex rounded-md border-2 border-dashed h-[100px] w-full items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-500"}>
                                                <span>
                                                    No tools available for this agent
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t dark:border-gray-700 p-4">
                    <Button onClick={handleDone}>Done</Button>
                </DialogFooter>

                <GenerateAgentConfigurations
                    selectedTools={selectedTools}
                    agent={agent}
                    isOpen={isOpenGenerate}
                    setIsOpen={setIsOpenGenerate}
                    inputs={[watchedInputs[testCaseIndex]]}
                    customInputIndex={testCaseMethod === TestCaseMethod.Auto || testCaseMethod === TestCaseMethod.Upload ? 0 : testCaseIndex}
                    testCaseMethod={testCaseMethod}
                    selectedAgentId={currentSelectedNode?.id || null}
                    watch={watch}
                    setValue={setValue}
                />
            </DialogContent>
        </Dialog>
    );
};
