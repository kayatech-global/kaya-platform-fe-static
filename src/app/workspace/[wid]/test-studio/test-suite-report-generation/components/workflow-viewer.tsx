'use client';
import '@xyflow/react/dist/style.css';
import { ReactFlow, ReactFlowProvider, Background, Controls, Node as FlowNode, Edge } from '@xyflow/react';
import { Node } from '@/components/molecules/custom-node-base/node/node';
import { CustomNodeTypes } from '@/enums';
import { useMemo } from 'react';

interface WorkflowViewerProps {
    nodes: FlowNode[];
    edges: Edge[];
}

function FlowViewer({ nodes, edges }: Readonly<WorkflowViewerProps>) {
    const nodeTypes = useMemo(
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
            [CustomNodeTypes.tradingNode]: Node,
            [CustomNodeTypes.reportNode]: Node,
            [CustomNodeTypes.fallbackNode]: Node,
            [CustomNodeTypes.workflow]: Node,
            [CustomNodeTypes.humanInLoop]: Node,
        }),
        []
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            // attributionPosition="bottom-right"
        >
            <Background />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
}

export default function WorkflowViewer(props: Readonly<WorkflowViewerProps>) {
    return (
        <ReactFlowProvider>
            <div style={{ width: '100%', height: '100%' }}>
                <FlowViewer {...props} />
            </div>
        </ReactFlowProvider>
    );
}
