import type { Node as XYNode } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { IDataLineageSessionExecution, IDataLineageViewStep, IDataLineageVisualGraph } from '@/models';
import { useTheme } from '@/theme';
import { ReactFlow, useNodesState, ConnectionLineType, Controls, Background, useEdgesState } from '@xyflow/react';
import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';
import { DataLineageNode } from '../nodes/data-lineage-nodes';
import { StepDetailsPanel } from './step-details-panel';
import { CustomNodeTypes, LineageSubStepExplanationType, SessionViewType } from '@/enums';

const BACKGROUND_STYLE: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 4,
};

const BACKGROUND_STYLE_DARK: React.CSSProperties = {
    background: '#111827',
    borderRadius: 4,
};

interface IDataLineageGraphRendererProps {
    graphData?: IDataLineageVisualGraph;
    steps?: IDataLineageViewStep[];
    activeTab: SessionViewType | string;
    selectedExecution: IDataLineageSessionExecution | undefined;
    handleAddTab: (tabName: string, content: IDataLineageVisualGraph | undefined) => void;
    workflowId?: string;
}

export const DataLineageGraphRenderer = ({
    graphData,
    steps,
    activeTab,
    selectedExecution,
    handleAddTab,
    workflowId,
}: IDataLineageGraphRendererProps) => {
    const [nodes, , onNodesChange] = useNodesState(graphData?.nodes ?? []);
    const [edges, , onEdgesChange] = useEdgesState(graphData?.edges ?? []);
    const [selectedNode, setSelectedNode] = useState<XYNode | undefined>();

    const { theme } = useTheme();

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
            [CustomNodeTypes.subflowNode]: DataLineageNode,
            [CustomNodeTypes.iteratorNode]: DataLineageNode,
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

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    return (
        <div className="relative flow-main-wrapper h-full w-full rounded-none flex gap-x-1 bg-gray-200 dark:bg-gray-700 ">
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
                onNodeClick={(_, node) => {
                    setSelectedNode(node);
                }}
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
            {selectedNode &&
                selectedNode.type !== CustomNodeTypes.startNode &&
                selectedNode.type !== CustomNodeTypes.endNode && (
                    <StepDetailsPanel
                        activeTab={activeTab}
                        steps={steps ?? []}
                        graphData={graphData}
                        selectedNode={selectedNode}
                        selectedExecution={selectedExecution}
                        handleAddTab={handleAddTab}
                        workflowId={workflowId}
                    />
                )}
        </div>
    );
};
