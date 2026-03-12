/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node as FlowNode, Edge, useNodesState, useEdgesState, ReactFlowInstance, OnBeforeDelete } from '@xyflow/react';
import {
    INITIAL_EDGE,
    INITIAL_NODES,
    VisualGraphDataType,
} from '@/app/editor/[wid]/[workflow_id]/components/editor-playground';
import { NODE_LIST } from '@/constants/editor-constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomNodeProps } from '@/components';
import { useDnD } from '@/context';
import { areObjectsEqual } from '@/lib/utils';
import { CustomNodeTypes } from '@/enums';
import { IGuardrailBinding } from '@/models';
import { useApp } from '@/context/app-context';
import { useParams } from 'next/navigation';
import dagre from '@dagrejs/dagre';
import { toast } from 'sonner';
import { useGuardrailBindingQuery } from './use-common';
import { useUndoRedo } from './use-undo-redo';

export const usePlayground = (visualGraphData?: VisualGraphDataType) => {
    const params = useParams();
    const { trigger, recentUsed, setTrigger, setRecentUsed } = useDnD();
    const { triggerGuardrailBinding, guardrailBinding, setGuardrailBinding } = useApp();
    // actual workflow node
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGE);
    const [customNodes, setCustomNodes] = useState<CustomNodeProps[]>([]);
    const [isOpenCommit, setOpenCommit] = useState<boolean>(false);
    const [nodesSaved, setNodeSaved] = useState<FlowNode[]>();
    const [edgesSaved, setEdgesSaved] = useState<Edge[]>();
    const [initialLoad, setInitialLoad] = useState<boolean>(false);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

    // Undo/Redo functionality
    const {
        canUndo,
        canRedo,
        undo: undoFromHistory,
        redo: redoFromHistory,
        takeSnapshot,
        clearHistory,
        pushToRedo,
        pushToUndo,
    } = useUndoRedo({ maxHistorySize: 50 });

    // Track if we're in the middle of undo/redo operation to avoid taking snapshots
    const isUndoRedoOperationRef = useRef(false);
    // Track the previous state for comparison
    const previousStateRef = useRef<{ nodes: FlowNode[]; edges: Edge[] } | null>(null);

    useEffect(() => {
        const allNodes = NODE_LIST.flatMap(category => category.nodes);
        const uniqueNodes = Array.from(new Map(allNodes.map(node => [node.id, node])).values());
        setCustomNodes(uniqueNodes);
    }, []);

    useEffect(() => {
        if (triggerGuardrailBinding && triggerGuardrailBinding > 0) {
            (async () => await refetchGuardrailBinding())();
        }
    }, [triggerGuardrailBinding]);

    const enableCommit = useMemo(() => {
        const fromApi = {
            nodes: visualGraphData?.nodes ?? [],
            edges: visualGraphData?.edges ?? [],
        };
        const fromApp = {
            nodes,
            edges,
        };
        return areObjectsEqual(fromApi, fromApp);
    }, [visualGraphData, nodes, edges]);

    const { status: bindingStatus, refetch: refetchGuardrailBinding } = useGuardrailBindingQuery({
        workflowId: params.workflow_id as string | undefined,
        onSuccess: data => {
            setGuardrailBinding(data);
            updateNodes(nodes, data);
        },
        onError: () => {
            setGuardrailBinding(undefined);
        },
    });

    const isGuardrailBindingCompleted = useMemo(() => {
        return bindingStatus === 'success' || bindingStatus === 'error';
    }, [bindingStatus]);

    const updateNodes = (records: FlowNode[], bindings: IGuardrailBinding[]) => {
        if (records && records.length > 0) {
            const results = records.map(node => {
                if (node?.data?.guardrails) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            guardrails: getFilteredGuardrails(bindings, node?.data?.guardrails as never),
                        },
                    };
                }
                return node;
            });
            setNodes(results);
        } else {
            setNodes(records);
        }
    };

    const getFilteredGuardrails = (bindings: IGuardrailBinding[], data: string[] | undefined) => {
        if (bindings && bindings?.length > 0 && data && data?.length > 0) {
            const results = bindings?.map(x => x.guardrailId);
            const filteredIds = data.filter(id => !results.includes(id));
            return filteredIds?.length > 0 ? filteredIds : undefined;
        } else {
            return data;
        }
    };

    const layoutGraph = (nodes: FlowNode[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: direction });
        g.setDefaultEdgeLabel(() => ({}));

        // Dagre needs width + height for each node
        nodes.forEach(node => {
            g.setNode(node.id, {
                width: node.measured?.width ?? 150,
                height: node.measured?.height ?? 80,
            });
        });

        edges.forEach(edge => {
            g.setEdge(edge.source, edge.target);
        });

        dagre.layout(g); // compute layout

        // Apply computed positions back into nodes
        return nodes.map(node => {
            const nodeWithLayout = g.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithLayout.x - (node.measured?.width ?? 150) / 2,
                    y: nodeWithLayout.y - (node.measured?.height ?? 80) / 2,
                },
            };
        });
    };

    const manageTemplates = (type: CustomNodeTypes, template: any) => {
        if (type && template) {
            let _nodes: FlowNode[] = template?.nodes;
            let _edges: Edge[] = template?.edges;

            const hasVoiceNodes = nodes.some(n => n.type === CustomNodeTypes.voiceNode);

            if (hasVoiceNodes) {
                return { nodes: _nodes, edges: _edges };
            }

            const currentStartNode = nodes.find(n => n.type === CustomNodeTypes.startNode);
            const currentEndNode = nodes.find(n => n.type === CustomNodeTypes.endNode);

            if (currentStartNode) {
                _nodes = _nodes?.filter(n => n.type !== CustomNodeTypes.startNode) ?? [];
                _edges = _edges?.filter(edge => !edge.source.startsWith('start_node-')) ?? [];
            }

            if (currentEndNode) {
                _nodes = _nodes?.filter(n => n.type !== CustomNodeTypes.endNode) ?? [];
                _edges = _edges?.filter(edge => !edge.target.startsWith('end_node-')) ?? [];
            }

            const actualNodes = [...nodes, ..._nodes];
            const actualEdges = [...edges, ..._edges]?.filter(x => x.id !== 'e1-2');

            const laidOutNodes = layoutGraph(actualNodes, actualEdges, 'TB');

            return { nodes: actualNodes?.length > 3 ? laidOutNodes : actualNodes, edges: actualEdges };
        }
        const actualNodes = [...nodes, ...template.nodes];
        const actualEdges = [...edges, ...template.edges];
        const laidOutNodes = layoutGraph(actualNodes, actualEdges, 'TB');

        return { nodes: actualNodes?.length > 3 ? laidOutNodes : actualNodes, edges: actualEdges };
    };

    // const connectFallbackToSelfLearningNodes = () => {
    //     const types = [
    //         CustomNodeTypes.agentNode,
    //         CustomNodeTypes.decisionNode,
    //         CustomNodeTypes.plannerNode,
    //         CustomNodeTypes.rePlannerNode,
    //         CustomNodeTypes.loaderNode,
    //         CustomNodeTypes.cleanerNode,
    //         CustomNodeTypes.wranglerNode,
    //         CustomNodeTypes.reportNode,
    //     ];

    //     const agentNodes = nodes.filter(node => types.includes(node.type as CustomNodeTypes));
    //     const fallbackNodes = nodes.filter(node => node.type === CustomNodeTypes.fallbackNode);

    //     if (agentNodes.length === 0 && fallbackNodes.length === 0) return;

    //     const newFallbackNodes: FlowNode[] = [];
    //     const newEdges: Edge[] = [];
    //     const fallbackNodeIdsToRemove: Set<string> = new Set();

    //     const agentNodeIds = agentNodes.map(n => n.id);

    //     fallbackNodes.forEach(fallback => {
    //         const linkedAgentId = fallback.data?.linkedAgentId as string;
    //         if (!agentNodeIds.includes(linkedAgentId)) {
    //             fallbackNodeIdsToRemove.add(fallback.id);
    //         }
    //     });

    //     agentNodes.forEach(agent => {
    //         // Check if this agent already has a fallback node connected
    //         const alreadyHasFallback = edges.some(
    //             edge => edge.source === agent.id && edge.source.startsWith('fallback_node')
    //         );

    //         const linkedFallback = nodes.find(
    //             node => node.type === CustomNodeTypes.fallbackNode && node.data?.linkedAgentId === agent.id
    //         );

    //         if (agent?.data?.selfLearning) {
    //             if (linkedFallback && !alreadyHasFallback) {
    //                 const edgeId = `xy-edge__${linkedFallback.id}`;
    //                 if (!edges?.find(x => x.id === edgeId) && !newEdges?.find(x => x.id === edgeId)) {
    //                     newEdges.push({
    //                         id: edgeId,
    //                         source: agent.id,
    //                         target: linkedFallback.id,
    //                         type: 'straight',
    //                         animated: true,
    //                     });
    //                 }
    //             } else if (!alreadyHasFallback) {
    //                 const fallbackId = generateNodeId(CustomNodeTypes.fallbackNode);

    //                 const templates = [
    //                     CustomNodeTypes.sequentialAgentTemplate,
    //                     CustomNodeTypes.supervisorAgentTemplate,
    //                     CustomNodeTypes.planExecuteTemplate,
    //                 ];

    //                 const fallbackNodeX = templates.includes(agent?.data?.overrideType as CustomNodeTypes)
    //                     ? agent.position.x - 240
    //                     : agent.position.x - 200;

    //                 const nodeWidth = 88;
    //                 const nodeHeight = 88;
    //                 const padding = 50;
    //                 const verticalSpacing = nodeHeight + padding;

    //                 const fallbackX = agent.position.x - nodeWidth - padding;
    //                 let fallbackY = agent.position.y;

    //                 const isOverlapping = (x: number, y: number) =>
    //                     nodes.some(node => {
    //                         if (node.id === agent.id) return false;
    //                         const dx = Math.abs(node.position.x - x);
    //                         const dy = Math.abs(node.position.y - y);
    //                         return dx < nodeWidth && dy < nodeHeight;
    //                     });

    //                 // Try shifting down until no overlap
    //                 if (templates.includes(agent?.data?.overrideType as CustomNodeTypes)) {
    //                     fallbackY = agent.position.y - 130;
    //                 } else {
    //                     while (isOverlapping(fallbackX, fallbackY)) {
    //                         fallbackY += verticalSpacing;
    //                     }
    //                 }

    //                 // Add fallback node
    //                 const fallbackNode: FlowNode = {
    //                     id: fallbackId,
    //                     type: CustomNodeTypes.fallbackNode,
    //                     position: {
    //                         x: fallbackNodeX,
    //                         y: fallbackY, // You can offset this differently if needed
    //                     },
    //                     data: {
    //                         label: getNodeLabel(CustomNodeTypes.fallbackNode),
    //                         linkedAgentId: agent.id,
    //                     },
    //                 };

    //                 newFallbackNodes.push(fallbackNode);

    //                 // Add edge from fallback to agent
    //                 newEdges.push({
    //                     id: `xy-edge__${fallbackId}`,
    //                     source: agent.id,
    //                     target: fallbackId,
    //                     type: 'straight',
    //                     animated: true,
    //                 });

    //                 // Add age to parent agent
    //                 newEdges.push({
    //                     id: `xy-edge__${fallbackId}-${agent.id}`,
    //                     source: fallbackId,
    //                     target: agent.id,
    //                     type: 'straight',
    //                     animated: true,
    //                 });
    //             }
    //         } else {
    //             const fallbackEdge = edges.find(
    //                 edge =>
    //                     edge.source === agent.id &&
    //                     nodes.find(n => n.id === edge.target)?.type === CustomNodeTypes.fallbackNode
    //             );

    //             if (fallbackEdge) {
    //                 fallbackNodeIdsToRemove.add(fallbackEdge.target);
    //             }
    //         }
    //     });

    //     if (fallbackNodeIdsToRemove.size > 0) {
    //         setNodes(prev => prev.filter(node => !fallbackNodeIdsToRemove.has(node.id)));

    //         setEdges(prev =>
    //             prev.filter(
    //                 edge => !fallbackNodeIdsToRemove.has(edge.source) && !fallbackNodeIdsToRemove.has(edge.target)
    //             )
    //         );
    //     }

    //     if (newFallbackNodes.length > 0) {
    //         setNodes(prev => [...prev, ...newFallbackNodes]);
    //     }

    //     if (newEdges.length > 0) {
    //         setEdges(prev => [...prev, ...newEdges]);
    //     }
    // };

    const onUpdateRecentUsed = (type: CustomNodeTypes) => {
        const selectedNode = customNodes.find(node => node.type === type);
        const alreadyExists = recentUsed.find(node => node.type === type);

        if (!selectedNode || alreadyExists) return;

        const updatedRecentUsed = [...recentUsed];

        if (updatedRecentUsed.length >= 2) {
            updatedRecentUsed.shift();
        }

        updatedRecentUsed.push(selectedNode);

        setRecentUsed(updatedRecentUsed);
    };

    const handleReset = () => {
        if (nodesSaved) {
            // setNodes(nodesSaved);
            updateNodes(nodesSaved, guardrailBinding ?? []);
        }
        if (edgesSaved) {
            setEdges(edgesSaved);
        }
        onViewport();
        Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    const onViewport = (padding = 0.3) => {
        setTimeout(() => {
            if (reactFlowInstance) {
                reactFlowInstance.fitView({ padding });
            }
        }, 0);
    };

    const onBeforeDelete: OnBeforeDelete<FlowNode, Edge> = async props => {
        const deletingPlanner = props?.nodes.find(n => n.type === CustomNodeTypes.plannerNode);
        if (!deletingPlanner) return true; // not deleting planner → allow

        const plannerId = deletingPlanner.id;

        // BFS queue
        const queue = [plannerId];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);

            // If we reach a replanner node → deletion is blocked
            const node = nodes?.find(n => n.id === current);
            if (node?.type === CustomNodeTypes.rePlannerNode) {
                toast.error('Delete Replanner Node before deleting Planner Node');
                return false;
            }

            // Explore neighbors via edges
            const neighbors = edges
                ?.filter(e => e.source === current || e.target === current)
                ?.map(e => (e.source === current ? e.target : e.source));

            queue.push(...neighbors);
        }

        return true; // safe to delete
    };

    /**
     * Takes a snapshot of current state for undo/redo history.
     * Should be called before making changes to nodes/edges.
     */
    const captureSnapshot = useCallback(() => {
        if (!isUndoRedoOperationRef.current) {
            takeSnapshot(nodes, edges);
        }
    }, [nodes, edges, takeSnapshot]);

    /**
     * Handles undo operation - restores previous state from history.
     */
    const handleUndo = useCallback(() => {
        if (!canUndo) return;

        // Save current state to redo stack before undoing
        pushToRedo(nodes, edges);

        isUndoRedoOperationRef.current = true;
        const previousState = undoFromHistory();

        if (previousState) {
            setNodes(previousState.nodes);
            setEdges(previousState.edges);
        }

        // Reset the flag after state is applied
        setTimeout(() => {
            isUndoRedoOperationRef.current = false;
        }, 0);
    }, [canUndo, nodes, edges, pushToRedo, undoFromHistory, setNodes, setEdges]);

    /**
     * Handles redo operation - restores next state from history.
     */
    const handleRedo = useCallback(() => {
        if (!canRedo) return;

        // Save current state to undo stack before redoing
        pushToUndo(nodes, edges);

        isUndoRedoOperationRef.current = true;
        const nextState = redoFromHistory();

        if (nextState) {
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
        }

        // Reset the flag after state is applied
        setTimeout(() => {
            isUndoRedoOperationRef.current = false;
        }, 0);
    }, [canRedo, nodes, edges, pushToUndo, redoFromHistory, setNodes, setEdges]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? event.metaKey : event.ctrlKey;

            if (modifier && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                handleUndo();
            } else if (modifier && event.key === 'z' && event.shiftKey) {
                event.preventDefault();
                handleRedo();
            } else if (modifier && event.key === 'y') {
                event.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    return {
        nodes,
        edges,
        isOpenCommit,
        enableCommit,
        nodesSaved,
        edgesSaved,
        isGuardrailBindingCompleted,
        initialLoad,
        reactFlowInstance,
        canUndo,
        canRedo,
        setReactFlowInstance,
        setInitialLoad,
        setEdgesSaved,
        setNodeSaved,
        setNodes,
        setEdges,
        setOpenCommit,
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
    };
};
