/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
    ReactFlow,
    addEdge,
    useReactFlow,
    Connection,
    Node as FlowNode,
    Edge,
    EdgeChange,
    NodeChange,
    ConnectionLineType,
    Controls,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { Node } from '@/components/molecules/custom-node-base/node/node';
import { useAuth, useDnD } from '@/context';
import { IWorkflowVariable, ISharedItem, IWorkflowTypes } from '@/models';
import { EditorHeader } from './editor-header';
import { $fetch, FetchError, logger } from '@/utils';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    generateDynamicPlanExecuteTemplate,
    generateDynamicSequentialAgentTemplate,
    generateDynamicSingleAgentTemplate,
    generateDynamicSupervisorAgentTemplate,
    voiceAgentTemplate,
} from '@/constants/editor-constants';
import { useTheme } from '@/theme';
import EdgePopup from './edge-popup';
import useToolParser from '@/hooks/use-transformed-payloads';
import { Category, Variable, VariablePayload } from '@/hooks/use-condition-completion';
import { cn, toFunctionName } from '@/lib/utils';
import config from '@/config/environment-variables';
import { usePlayground } from '@/hooks/use-playground';
import { WorkflowCommit } from './commit/workflow-commit';
import { CustomNodeTypes } from '@/enums';
import { promptService } from '@/services';

export interface EditorPlaygroundRef {
    onRefetch: () => Promise<void>;
}

export interface VisualGraphDataType {
    nodes: FlowNode[];
    edges: Edge[];
    variables: IWorkflowVariable;
}

interface EditorPlaygroundProps {
    visualGraphData?: VisualGraphDataType;
    workflowName?: string;
    version?: string;
    isReadOnly?: boolean;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    initialSnapshot: {
        nodes: FlowNode[];
        edges: Edge[];
    } | null;
    hasChanges: boolean;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

type VisualGraphData = {
    nodes: FlowNode[];
    edges: Edge[];
    variables: IWorkflowVariable;
};

type GraphContainer = {
    visualGraphData: VisualGraphData;
};

// Constants
const BACKGROUND_STYLE: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 4,
};

const BACKGROUND_STYLE_DARK: React.CSSProperties = {
    background: '#111827',
    borderRadius: 4,
};

export const INITIAL_NODES: FlowNode[] = [
    {
        id: 'start-node-1',
        position: { x: 50, y: 50 },
        type: CustomNodeTypes.startNode,
        data: { label: 'Start' },
    },
];

export const INITIAL_EDGE: Edge[] = [
    {
        id: 'e1-2',
        source: '1',
        target: '',
        animated: true,
        type: 'smoothstep',
    },
];

const updateWorkflow = async (data: GraphContainer, workspaceId: string, id: string) => {
    const response = await $fetch<GraphContainer>(
        `/workspaces/${workspaceId}/workflows/${id}/actions/draft`,
        {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'x-workspace-id': workspaceId,
            },
        },
        {
            denyRedirectOnForbidden: true,
        }
    );

    // Invalidate the cache for the workflow
    await clearWorkflowCache(id);

    return response.data;
};

const clearWorkflowCache = async (id: string) => {
    try {
        await fetch(`${config.CHAT_BOT_URL}/workflows/cache/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error clearing workflow cache:', error);
    }
};

const getWorkflowSaveErrorMessage = (error: FetchError): string => {
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
        return 'Failed to save draft. Please try again later.';
    }
    return error?.message ?? 'Failed to save draft. Please try again later.';
};

/**
 * Generates a unique, descriptive ID for a new node
 * Format: {type}-node-{counter}
 */
export const generateNodeId = (nodeType: string): string => {
    // Generate a unique UUID
    const uuid = uuidv4();

    // Create a descriptive ID with the type and UUID
    return `${nodeType}-node-${uuid}`;
};

/**
 * Returns the label for a given node type.
 *
 * @param {CustomNodeTypes} nodeType - The type of the node.
 * @returns {string} The corresponding label for the node type.
 */
export const getNodeLabel = (nodeType: CustomNodeTypes): string => {
    switch (nodeType) {
        case CustomNodeTypes.agentNode:
            return 'Agent';
        case CustomNodeTypes.startNode:
            return 'Start';
        case CustomNodeTypes.decisionNode:
            return 'Decision Agent';
        case CustomNodeTypes.plannerNode:
            return 'Planner Agent';
        case CustomNodeTypes.rePlannerNode:
            return 'Replanner Agent';
        case CustomNodeTypes.voiceNode:
            return 'Voice Agent';
        case CustomNodeTypes.loaderNode:
            return 'Loader Agent';
        case CustomNodeTypes.cleanerNode:
            return 'Cleaner Agent';
        case CustomNodeTypes.wranglerNode:
            return 'Wrangler Agent';
        case CustomNodeTypes.reportNode:
            return 'Report Agent';
        case CustomNodeTypes.fileProcessingAgentNode:
            return 'File Processing Agent';
        case CustomNodeTypes.deepAgentNode:
            return 'Deep Agent';
        case CustomNodeTypes.subflowNode:
            return 'Sub Workflow';
        case CustomNodeTypes.iteratorNode:
            return 'Iterator';
        case CustomNodeTypes.toolExecutorNode:
            return 'Tool Executor';
        default:
            return 'End';
    }
};

const validateVoiceConnection = (
    sourceNode?: FlowNode,
    targetNode?: FlowNode
): { isValid: boolean; message?: string } => {
    if (
        (sourceNode?.type === CustomNodeTypes.voiceNode && targetNode?.type !== CustomNodeTypes.voiceNode) ||
        (targetNode?.type === CustomNodeTypes.voiceNode && sourceNode?.type !== CustomNodeTypes.voiceNode)
    ) {
        return { isValid: false, message: 'Cannot connect Voice Agent nodes with other agent types' };
    }
    return { isValid: true };
};

const validatePlannerConnection = (
    sourceNode?: FlowNode,
    targetNode?: FlowNode
): { isValid: boolean; message?: string } => {
    if (sourceNode?.type !== CustomNodeTypes.plannerNode) return { isValid: true };

    const allowedTargets = [CustomNodeTypes.startNode, CustomNodeTypes.agentNode, CustomNodeTypes.decisionNode];
    if (!allowedTargets.includes(targetNode?.type as CustomNodeTypes)) {
        return { isValid: false, message: 'Planner Node can only connect to Start Node or Agent Node' };
    }
    return { isValid: true };
};

const validateRePlannerConnection = (
    sourceNode?: FlowNode,
    targetNode?: FlowNode
): { isValid: boolean; message?: string } => {
    if (sourceNode?.type === CustomNodeTypes.rePlannerNode) {
        if (
            !(
                targetNode?.type === CustomNodeTypes.agentNode &&
                targetNode?.data?.overrideType === CustomNodeTypes.executionNode
            )
        ) {
            return { isValid: false, message: 'Replanner Node can only connect to Execution Node' };
        }
    } else if (
        targetNode?.type === CustomNodeTypes.rePlannerNode &&
        sourceNode?.data?.overrideType !== CustomNodeTypes.executionNode
    ) {
        return { isValid: false, message: 'Replanner Node can only connect to Execution Node' };
    }
    if (sourceNode?.type === CustomNodeTypes.startNode && targetNode?.type === CustomNodeTypes.rePlannerNode) {
        return { isValid: false, message: 'Replanner Node cannot be connected directly from Start Node' };
    }
    return { isValid: true };
};

const validateExecutionConnection = (
    sourceNode?: FlowNode,
    targetNode?: FlowNode
): { isValid: boolean; message?: string } => {
    if (
        (sourceNode?.type === CustomNodeTypes.agentNode &&
            sourceNode?.data?.overrideType === CustomNodeTypes.executionNode) ||
        (targetNode?.type === CustomNodeTypes.agentNode &&
            targetNode?.data?.overrideType === CustomNodeTypes.executionNode)
    ) {
        const restrictedTargets = [CustomNodeTypes.startNode];
        const targetType = sourceNode?.data?.overrideType === CustomNodeTypes.executionNode ? targetNode : sourceNode;

        if (restrictedTargets.includes(targetType?.type as CustomNodeTypes)) {
            return { isValid: false, message: 'Start Node cannot connect to Execution Node' };
        }

        const allowedTargets = [CustomNodeTypes.plannerNode, CustomNodeTypes.rePlannerNode];
        if (
            !allowedTargets.includes(targetType?.type as CustomNodeTypes) &&
            targetNode?.data?.overrideType === CustomNodeTypes.executionNode
        ) {
            return { isValid: false, message: 'Execution Node can only connect to Planner or Replanner Nodes' };
        }
    }
    return { isValid: true };
};

const validateConnection = (sourceNode?: FlowNode, targetNode?: FlowNode): { isValid: boolean; message?: string } => {
    const validators = [
        validateVoiceConnection,
        validatePlannerConnection,
        validateRePlannerConnection,
        validateExecutionConnection,
    ];

    for (const validator of validators) {
        const result = validator(sourceNode, targetNode);
        if (!result.isValid) return result;
    }

    return { isValid: true };
};

/**
 * EditorPlayground Component
 * A flow diagram editor that allows users to drag and drop custom nodes
 */
export const EditorPlayground = React.forwardRef<EditorPlaygroundRef, EditorPlaygroundProps>(
    (
        {
            visualGraphData,
            workflowName,
            version,
            isReadOnly,
            refetchGraph,
            isDraft,
            availableVersions,
            initialSnapshot,
            hasChanges,
            setHasChanges,
        },
        ref
    ) => {
        // state to track node saving and resets
        const {
            nodes,
            edges,
            isOpenCommit,
            isGuardrailBindingCompleted,
            initialLoad,
            canUndo,
            canRedo,
            setReactFlowInstance,
            setInitialLoad,
            setEdgesSaved,
            setNodeSaved,
            setOpenCommit,
            setNodes,
            setEdges,
            manageTemplates,
            handleReset,
            handleUndo,
            handleRedo,
            captureSnapshot,
            onEdgesChange,
            onNodesChange,
            onUpdateRecentUsed,
            onViewport,
            onBeforeDelete,
            refetchGuardrailBinding,
        } = usePlayground(visualGraphData);
        const { token } = useAuth();
        const { screenToFlowPosition } = useReactFlow();
        const { type, workflowVariables, trigger, setWorkflowVariables, setSharedVariables, setLoadingIntellisense } =
            useDnD();
        const params = useParams();
        const { theme } = useTheme();
        const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
        const [promotedVariables, setPromotedVariables] = useState<Variable[]>([]);
        const { transformToFlatVariables, transformToCategoryStructure } = useToolParser();
        const [completion, setCompletion] = useState<Category[]>([]);
        const [mounted, setMounted] = useState<boolean>(false);
        const promptIds = mounted
            ? Array.from(
                  new Set(
                      nodes
                          ?.filter(x => (x.data?.prompt as { id?: string })?.id)
                          ?.map(x => (x.data?.prompt as { id?: string })?.id)
                  )
              ).filter((id): id is string => id != null)
            : undefined;
        const apiIds = mounted
            ? Array.from(
                  new Set(
                      nodes
                          ?.filter(x => x.data?.apis)
                          ?.flatMap(x => (x.data?.apis as { id: string }[])?.map(y => y.id) ?? [])
                  )
              )
            : undefined;

        const { isLoading: loadingIntellisense, refetch } = useQuery(
            'intellisense',
            () =>
                promptService.intellisense(params.wid as string, {
                    workflowId: params.workflow_id as string,
                    promptIds,
                    apiIds,
                }),
            {
                enabled: !!token && isGuardrailBindingCompleted,
                refetchOnWindowFocus: false,
                onSuccess: data => {
                    const workflowVars = data?.variables?.workflow?.[params.workflow_id as string]?.variables ?? [];
                    const allVariables = [...workflowVars];
                    setWorkflowVariables(allVariables ?? []);
                    setSharedVariables(data?.variables?.shared ?? []);
                    if (!mounted) handleSave(allVariables, true);
                    setMounted(true);
                    const tools = data?.tools?.api?.workflow[params.workflow_id as string];
                    const category = transformToCategoryStructure(tools, allVariables);
                    setCompletion(category);
                    const apiVariables = transformToFlatVariables(tools, allVariables);
                    if (apiVariables?.length) setPromotedVariables(apiVariables);
                },
                onError: () => {
                    console.log('Failed to fetch intellisense');
                },
            }
        );

        useEffect(() => {
            setLoadingIntellisense(loadingIntellisense);
        }, [loadingIntellisense]);

        useEffect(() => {
            if (visualGraphData?.nodes) {
                setNodes(visualGraphData?.nodes);
            }
            if (visualGraphData?.edges) {
                setEdges(visualGraphData?.edges);
            }
        }, [visualGraphData]);

        useEffect(() => {
            if (nodes && trigger) {
                (async () => await refetch())();
            }
        }, [trigger]);

        // Register custom node types
        const nodeTypes = React.useMemo(
            () => ({
                [CustomNodeTypes.startNode]: Node,
                [CustomNodeTypes.endNode]: Node,
                [CustomNodeTypes.agentNode]: Node,
                [CustomNodeTypes.decisionNode]: Node,
                [CustomNodeTypes.plannerNode]: Node,
                [CustomNodeTypes.rePlannerNode]: Node,
                [CustomNodeTypes.voiceNode]: Node,
                [CustomNodeTypes.loaderNode]: Node,
                [CustomNodeTypes.cleanerNode]: Node,
                [CustomNodeTypes.wranglerNode]: Node,
                [CustomNodeTypes.reportNode]: Node,
                [CustomNodeTypes.fileProcessingAgentNode]: Node,
                [CustomNodeTypes.deepAgentNode]: Node,
                [CustomNodeTypes.subflowNode]: Node,
                [CustomNodeTypes.iteratorNode]: Node,
                [CustomNodeTypes.toolExecutorNode]: Node,
                [CustomNodeTypes.externalAgentNode]: Node,
            }),
            []
        );

        const containsVoiceAgentTemplate = (nodes: FlowNode[]): boolean => {
            return nodes.some(node => node.type === CustomNodeTypes.voiceNode);
        };

        // Refs to track if we need to capture a snapshot
        const isDraggingRef = useRef(false);
        const hasSnapshotBeforeDragRef = useRef(false);

        /**
         * Wrapped node change handler that captures snapshots for undo/redo.
         * Captures a snapshot when node dragging starts or when nodes are removed.
         */
        const handleNodesChangeWithUndo = useCallback(
            (changes: NodeChange[]) => {
                // Check for position changes (dragging)
                const hasPositionChange = changes.some(
                    change => change.type === 'position' && change.dragging !== undefined
                );
                const isDragStarting = changes.some(
                    change => change.type === 'position' && change.dragging === true
                );
                const isDragEnding = changes.some(
                    change => change.type === 'position' && change.dragging === false
                );

                // Capture snapshot at the start of a drag operation
                if (isDragStarting && !hasSnapshotBeforeDragRef.current) {
                    captureSnapshot();
                    hasSnapshotBeforeDragRef.current = true;
                    isDraggingRef.current = true;
                }

                // Reset tracking when drag ends
                if (isDragEnding) {
                    hasSnapshotBeforeDragRef.current = false;
                    isDraggingRef.current = false;
                }

                // Check for node removal
                const hasRemoval = changes.some(change => change.type === 'remove');
                if (hasRemoval && !isDraggingRef.current) {
                    captureSnapshot();
                }

                onNodesChange(changes);
            },
            [captureSnapshot, onNodesChange]
        );

        /**
         * Wrapped edge change handler that captures snapshots for undo/redo.
         * Captures a snapshot when edges are removed.
         */
        const handleEdgesChangeWithUndo = useCallback(
            (changes: EdgeChange[]) => {
                // Check for edge removal
                const hasRemoval = changes.some(change => change.type === 'remove');
                if (hasRemoval) {
                    captureSnapshot();
                }

                onEdgesChange(changes);
            },
            [captureSnapshot, onEdgesChange]
        );

        const handleConnect = (connection: Connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);

            const validation = validateConnection(sourceNode, targetNode);
            if (!validation.isValid) {
                toast.error(validation.message);
                return;
            }

            // Capture snapshot before adding edge for undo/redo
            captureSnapshot();
            setEdges(eds => addEdge({ ...connection, animated: true, type: 'straight' }, eds));
        };

        const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        };

        const handleNodeDropValidation = (nodeType: CustomNodeTypes, nodes: FlowNode[]) => {
            const restrictedNodeTypes = [CustomNodeTypes.startNode, CustomNodeTypes.endNode];

            if (restrictedNodeTypes.includes(nodeType)) {
                const existingNodesOfType = nodes.filter(n => n.type === nodeType);

                return {
                    isValidDrop: existingNodesOfType.length === 0,
                    warningMessage: `Only one ${nodeType.split('_').join(' ')} allowed`,
                };
            }

            return {
                isValidDrop: true,
                warningMessage: '',
            };
        };

        const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            // Validate that we have a node type
            if (!type) return;

            const nodeType = type as CustomNodeTypes;

            // Capture snapshot before making changes for undo/redo
            captureSnapshot();

            if (
                nodeType === CustomNodeTypes.singleAgentTemplate ||
                nodeType === CustomNodeTypes.supervisorAgentTemplate ||
                nodeType === CustomNodeTypes.sequentialAgentTemplate ||
                nodeType === CustomNodeTypes.planExecuteTemplate ||
                nodeType === CustomNodeTypes.voiceAgentTemplate
            ) {
                // If dropping a Voice Agent template, always allow (will replace existing)
                if (nodeType === CustomNodeTypes.voiceAgentTemplate) {
                    setNodes([]);
                    setEdges([]);
                    setNodes(voiceAgentTemplate.nodes);
                    setEdges(voiceAgentTemplate.edges);
                    onUpdateRecentUsed(nodeType);
                    onViewport();
                    return;
                }
                // Get the template data based on the node type
                let template;
                switch (nodeType) {
                    case CustomNodeTypes.singleAgentTemplate:
                        template = generateDynamicSingleAgentTemplate();
                        break;
                    case CustomNodeTypes.supervisorAgentTemplate:
                        template = generateDynamicSupervisorAgentTemplate();
                        break;
                    case CustomNodeTypes.sequentialAgentTemplate:
                        template = generateDynamicSequentialAgentTemplate();
                        break;
                    case CustomNodeTypes.planExecuteTemplate:
                        template = generateDynamicPlanExecuteTemplate();
                        break;
                    default:
                        template = { nodes: [], edges: [] };
                        console.warn(`No template defined for node type: ${nodeType}`);
                }
                const results = manageTemplates(nodeType, template);

                // Load the template with Node and Edge
                setNodes(results.nodes);
                setEdges(results.edges);
                onUpdateRecentUsed(nodeType);
                onViewport();
            } else {
                const dropValidationObj = handleNodeDropValidation(nodeType, nodes);

                if (!dropValidationObj?.isValidDrop) {
                    toast.warning(dropValidationObj?.warningMessage);
                    return;
                }
                if (containsVoiceAgentTemplate(nodes) && nodeType !== CustomNodeTypes.voiceNode) {
                    toast.error('Cannot mix other agents with a Voice Agent template');
                    return;
                }
                // Get drop position in flow coordinates
                const position = screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                // Create new node with a descriptive, unique ID
                const newNode: FlowNode = {
                    id: generateNodeId(nodeType),
                    type: nodeType,
                    position,
                    data: {
                        label: getNodeLabel(nodeType),
                    },
                    style:
                        nodeType === CustomNodeTypes.iteratorNode
                            ? {
                                  width: 200,
                                  height: 200,
                              }
                            : undefined,
                };

                // Add node to flow
                setNodes(currentNodes => [...currentNodes, newNode]);
                onUpdateRecentUsed(nodeType);
            }
        };

        const { mutateAsync: mutateCreate, isLoading } = useMutation(
            (data: GraphContainer) => updateWorkflow(data, params.wid as string, params.workflow_id as string),
            {
                onSuccess: () => {
                    toast.success('Workflow saved successfully');
                    setNodeSaved(nodes);
                    setEdgesSaved(edges);
                    refetch();
                    refetchGraph();
                },
                onError: (error: FetchError) => {
                    const errorMessage = getWorkflowSaveErrorMessage(error);
                    toast.error(errorMessage);
                    logger.error('Error saving workflow:', error?.message);
                },
            }
        );

        useMutation(
            (data: GraphContainer) => updateWorkflow(data, params.wid as string, params.workflow_id as string),
            {
                onSuccess: () => {
                    setNodeSaved(nodes);
                    setEdgesSaved(edges);
                },
                onError: (error: FetchError) => {
                    const errorMessage = getWorkflowSaveErrorMessage(error);
                    toast.error(errorMessage);
                    logger.error('Error saving workflow:', error?.message);
                },
            }
        );

        const handleSave = async (workflowVariableItems?: ISharedItem[], privateSave?: boolean) => {
            const selectedVariables: VariablePayload[] = [];

            edges.forEach(edge => {
                const logic = edge.data?.logic as string;
                if (logic) {
                    promotedVariables.forEach((apiField: Variable) => {
                        const variableRegex = new RegExp(String.raw`\b${apiField.name}\b`, 'g');
                        if (variableRegex.test(logic)) {
                            selectedVariables.push({
                                name: `${apiField.parent ? toFunctionName(apiField.parent) + '.' : ''}${apiField.name}`,
                                type: apiField.type,
                                description: apiField.description,
                                default_value: apiField.defaultValue,
                            });
                        }
                    });
                }
            });

            const uniqueVariablesMap = new Map<string, VariablePayload>();
            selectedVariables.forEach(variable => {
                uniqueVariablesMap.set(variable.name, variable);
            });

            const apiVariables = Array.from(uniqueVariablesMap.values());
            const data: IWorkflowVariable = {
                apis: privateSave ? (visualGraphData?.variables?.apis ?? []) : apiVariables,
                workflows:
                    workflowVariableItems ??
                    Array.from(new Map(workflowVariables.map(obj => [obj.id, obj])).values()) ??
                    [],
            };

            const payload = { visualGraphData: { nodes, edges, variables: data } };

            if (privateSave) {
                // await mutatePrivateCreate(payload);
                // comment out for now
            } else {
                await mutateCreate(payload);
            }
        };

        // This should be used when uncomment resetCounterRef useEffect
        // const resetCounterRef = useRef(0); // Persistent reference

        const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
            event.preventDefault();
            setSelectedEdge(edge);
        }, []);

        const handlePopupSubmit = useCallback(
            (logic: string) => {
                if (selectedEdge) {
                    setEdges(eds =>
                        eds.map(ed =>
                            ed.id === selectedEdge.id
                                ? {
                                      ...ed,
                                      data: {
                                          ...ed.data,
                                          logic,
                                      },
                                      label: logic ? '</>' : '',
                                      labelStyle: {
                                          fontSize: 12,
                                          fontWeight: 600,
                                          fill: '#92400e',
                                      },
                                      labelBgStyle: { fill: '#fef3c7', stroke: '#fcd34d' },
                                      labelBgPadding: [6, 4],
                                      labelBgBorderRadius: 5,
                                  }
                                : ed
                        )
                    );
                }
            },
            [selectedEdge, setEdges]
        );

        const handlePopupClose = useCallback(() => {
            setSelectedEdge(null);
        }, []);

        // Removing this useEffect due reset value not updating correctly due to NAN default saving logic
        // useEffect(() => {
        //     if (resetCounterRef.current === 0) {
        //         setNodeSaved(nodes);
        //         setEdgesSaved(edges);
        //         resetCounterRef.current = 1;
        //     }
        // }, []);

        useEffect(() => {
            if (visualGraphData && !initialLoad) {
                setNodeSaved(visualGraphData?.nodes);
                setEdgesSaved(visualGraphData?.edges);
                setInitialLoad(true);
            }
        }, [visualGraphData, initialLoad, setInitialLoad, setNodeSaved, setEdgesSaved]);

        useImperativeHandle(ref, () => ({
            onRefetch: async () => {
                await refetch();
            },
        }));

        return (
            <div className="h-full w-full rounded relative">
                <EditorHeader
                    isLoading={isLoading}
                    isReadOnly={isReadOnly}
                    handleSave={handleSave}
                    handleReset={handleReset}
                    refetchGuardrailBinding={refetchGuardrailBinding}
                    version={version}
                    refetchGraph={refetchGraph}
                    isDraft={isDraft}
                    availableVersions={availableVersions}
                    initialSnapshot={initialSnapshot}
                    nodes={nodes}
                    edges={edges}
                    hasChanges={hasChanges}
                    setHasChanges={setHasChanges}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                />
                <ReactFlow
                    proOptions={{ hideAttribution: true }}
                    style={theme === 'light' ? BACKGROUND_STYLE : BACKGROUND_STYLE_DARK}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChangeWithUndo}
                    onEdgesChange={handleEdgesChangeWithUndo}
                    onConnect={handleConnect}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    nodeTypes={nodeTypes}
                    fitView={true}
                    fitViewOptions={{ padding: 0.3 }}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    onEdgeClick={onEdgeClick}
                    onInit={setReactFlowInstance}
                    onBeforeDelete={onBeforeDelete}
                >
                    <Controls
                        className={cn('workflow-editor-controls', {
                            'workflow-editor-comp-light': theme === 'light',
                            'workflow-editor-comp-dark': theme === 'dark',
                        })}
                    />
                </ReactFlow>
                {selectedEdge && (
                    <EdgePopup
                        onSubmit={handlePopupSubmit}
                        onClose={handlePopupClose}
                        initialValue={(selectedEdge.data?.logic as string) || ''}
                        completion={completion ?? []}
                    />
                )}
                <WorkflowCommit
                    isOpenCommit={isOpenCommit}
                    workflowName={workflowName as string}
                    version={version}
                    setOpenCommit={setOpenCommit}
                    refetchGraph={refetchGraph}
                />
            </div>
        );
    }
);

EditorPlayground.displayName = 'EditorPlayground';
