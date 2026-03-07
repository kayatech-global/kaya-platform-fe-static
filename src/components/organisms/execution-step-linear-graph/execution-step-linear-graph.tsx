import type { Node as XYNode, Edge as XYEdge } from '@xyflow/react';
import { IDataLineageVisualGraph } from '@/models';
import { useTheme } from '@/theme';
import { ReactFlow, useNodesState, ConnectionLineType, Background, useEdgesState } from '@xyflow/react';
import React, { useEffect } from 'react';
import '@xyflow/react/dist/style.css';
import { DataLineageNode } from '@/app/workspace/[wid]/data-lineage/nodes/data-lineage-nodes';
import { CustomNodeTypes, LineageSubStepExplanationType } from '@/enums';
import dagre from '@dagrejs/dagre';

const BACKGROUND_STYLE: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 4,
};

const BACKGROUND_STYLE_DARK: React.CSSProperties = {
    background: '#111827',
    borderRadius: 4,
};

// Define widths and heights for specific node types
const NODE_WIDTH_SMALL = 88;
const NODE_WIDTH_LARGE = 320;
const NODE_HEIGHT_SMALL = 80;
const NODE_HEIGHT_LARGE = 88;

const getLayoutedElements = (nodes: XYNode[], edges: XYEdge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set horizontal layout
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 });

    nodes.forEach(node => {
        let width = NODE_WIDTH_SMALL; // Default width
        let height = NODE_HEIGHT_LARGE; // Default height

        if (Object.values(LineageSubStepExplanationType).includes(node.type as LineageSubStepExplanationType)) {
            width = NODE_WIDTH_LARGE;
            height = NODE_HEIGHT_SMALL;
        }

        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map(node => {
        const nodeWithPosition = dagreGraph.node(node.id);

        let width = NODE_WIDTH_SMALL;
        let height = NODE_HEIGHT_LARGE;
        if (Object.values(LineageSubStepExplanationType).includes(node.type as LineageSubStepExplanationType)) {
            width = NODE_WIDTH_LARGE;
            height = NODE_HEIGHT_SMALL;
        }

        return {
            ...node,
            position: {
                x: nodeWithPosition.x - width / 2,
                y: nodeWithPosition.y - height / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

interface ExecutionStepLinearGraphProps {
    graphData?: IDataLineageVisualGraph;
}

export const ExecutionStepLinearGraph = ({ graphData }: ExecutionStepLinearGraphProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [nodes, setNodes, onNodesChange] = useNodesState<XYNode>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [edges, setEdges, onEdgesChange] = useEdgesState<XYEdge>([]);

    const { theme } = useTheme();

    useEffect(() => {
        if (graphData?.nodes && graphData.edges) {
            // Add sequential labels to edges
            const labeledEdges = graphData.edges.map((edge, index) => ({
                ...edge,
                label: `${index + 1}`,
                labelStyle: { fill: '#1f2937', fontWeight: 600, fontSize: 11 },
                labelBgStyle: { fill: '#eff6ff', rx: 4, ry: 4, stroke: '#bfdbfe', strokeWidth: 1 },
                labelBgPadding: [6, 2] as [number, number],
                labelBgBorderRadius: 4,
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(graphData.nodes, labeledEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [graphData, setNodes, setEdges]);

    // Register custom node types
    const nodeTypes = React.useMemo(
        () => ({
            [CustomNodeTypes.startNode]: DataLineageNode,
            [CustomNodeTypes.endNode]: DataLineageNode,
            [CustomNodeTypes.agentNode]: DataLineageNode,
            [CustomNodeTypes.decisionNode]: DataLineageNode,
            [CustomNodeTypes.plannerNode]: DataLineageNode,
            [CustomNodeTypes.rePlannerNode]: DataLineageNode,
            [CustomNodeTypes.voiceNode]: DataLineageNode,
            [CustomNodeTypes.loaderNode]: DataLineageNode,
            [CustomNodeTypes.cleanerNode]: DataLineageNode,
            [CustomNodeTypes.wranglerNode]: DataLineageNode,
            [CustomNodeTypes.reportNode]: DataLineageNode,
            [LineageSubStepExplanationType.API]: DataLineageNode,
            [LineageSubStepExplanationType.LLM]: DataLineageNode,
            [LineageSubStepExplanationType.SLM]: DataLineageNode,
            [LineageSubStepExplanationType.STS]: DataLineageNode,
            [LineageSubStepExplanationType.GRAPHRAG]: DataLineageNode,
            [LineageSubStepExplanationType.VECTORRAG]: DataLineageNode,
            [LineageSubStepExplanationType.MCP]: DataLineageNode,
            [LineageSubStepExplanationType.DATABASE_CONNECTOR]: DataLineageNode,
            [LineageSubStepExplanationType.EXECUTABLE_FUNCTION]: DataLineageNode,
        }),
        []
    );

    // Tooltip state
    const [tooltip, setTooltip] = React.useState<{ content: string; x: number; y: number } | null>(null);

    const onEdgeMouseEnter = (event: React.MouseEvent, edge: XYEdge) => {
        if (edge.data?.tooltipContent) {
            // Safely convert tooltipContent to string
            const content = typeof edge.data.tooltipContent === 'string' 
                ? edge.data.tooltipContent 
                : JSON.stringify(edge.data.tooltipContent);
            
            setTooltip({
                content,
                x: event.clientX, // We might need relative coordinates, but let's try fixed first or use event.nativeEvent
                y: event.clientY,
            });
        } else {
            // Fallback for demo if no specific data
            const labelText = typeof edge.label === 'string' || typeof edge.label === 'number' 
                ? String(edge.label) 
                : 'Transfer';
            
            setTooltip({
                content: `Step ${labelText}: Data Transfer`,
                x: event.clientX,
                y: event.clientY,
            });
        }
    };

    const onEdgeMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="relative flow-main-wrapper h-full w-full rounded-none flex gap-x-1 bg-gray-200 dark:bg-gray-700 ">
            {tooltip && (
                <div
                    className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity"
                    style={{ left: tooltip.x, top: tooltip.y - 10 }}
                >
                    {tooltip.content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-900" />
                </div>
            )}
            <ReactFlow
                proOptions={{ hideAttribution: true }}
                style={theme === 'light' ? BACKGROUND_STYLE : BACKGROUND_STYLE_DARK}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                onEdgeMouseEnter={onEdgeMouseEnter}
                onEdgeMouseLeave={onEdgeMouseLeave}
            >
                {/* <Controls
                    className={cn('workflow-editor-controls', {
                        'workflow-editor-comp-light': theme === 'light',
                        'workflow-editor-comp-dark': theme === 'dark',
                    })}
                /> */}
                <Background />
            </ReactFlow>
        </div>
    );
};
