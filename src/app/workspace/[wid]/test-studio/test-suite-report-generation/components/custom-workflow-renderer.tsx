/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Node as XYNode } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { IDataLineageVisualGraph } from '@/models';
import { useTheme } from '@/theme';
import { ReactFlow, useNodesState, useEdgesState, ConnectionLineType, Controls, Background } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';

import { CustomNodeTypes, LineageSubStepExplanationType } from '@/enums';
import { DataLineageNode } from '@/app/workspace/[wid]/data-lineage/nodes/data-lineage-nodes';

const BACKGROUND_STYLE: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 4,
};

const BACKGROUND_STYLE_DARK: React.CSSProperties = {
    background: '#111827',
    borderRadius: 4,
};

interface ICustomWorkflowRendererProps {
    graphData?: IDataLineageVisualGraph;
    workflowId?: string;
    onClickNode?: (node: XYNode | undefined) => void;
}

export const CustomWorkflowRenderer = ({ graphData, workflowId, onClickNode }: ICustomWorkflowRendererProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(graphData?.nodes ?? []);
    const [edges, , onEdgesChange] = useEdgesState(graphData?.edges ?? []);
    const [selectedNode, setSelectedNode] = useState<XYNode | undefined>();
    const [, setOpenSheet] = useState(false);

    useEffect(() => {
        if (graphData?.nodes?.length) {
            setNodes(graphData.nodes);
        }
    }, [graphData?.nodes]);

    useEffect(() => {
        onClickNode?.(selectedNode);
    }, [selectedNode]);

    const { theme } = useTheme();

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
        }),
        []
    );

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleNodeClick = (_: any, node: XYNode) => {
        if (node.type === CustomNodeTypes.startNode || node.type === CustomNodeTypes.endNode) {
            return;
        }

        setSelectedNode(node);
        setOpenSheet(true);
    };

    return (
        <div className="relative flow-main-wrapper h-full w-full flex gap-x-1 rounded-none bg-gray-200 dark:bg-gray-700">
            <ReactFlow
                proOptions={{ hideAttribution: true }}
                style={theme === 'light' ? BACKGROUND_STYLE : BACKGROUND_STYLE_DARK}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onDragOver={handleDragOver}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 1 }}
                onNodeClick={handleNodeClick}
                nodesDraggable={false}
            >
                <Controls
                    className={cn('workflow-editor-controls', {
                        'workflow-editor-comp-light': theme === 'light',
                        'workflow-editor-comp-dark': theme === 'dark',
                    })}
                />
                <Background />
            </ReactFlow>

            {/* <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetContent side="right" className="w-[380px]">
                    <SheetHeader>
                        <SheetTitle>Workflow Info</SheetTitle>
                        <SheetDescription>
                            Node Clicked: <strong>{selectedNode?.id}</strong>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Workflow ID:</span>
                            <div className="mt-1 p-2 rounded bg-gray-100 dark:bg-gray-800">{workflowId ?? 'N/A'}</div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet> */}
        </div>
    );
};
