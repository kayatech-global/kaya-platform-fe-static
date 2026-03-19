'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    type OnSelectionChangeParams,
    BackgroundVariant,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StartNode from './start-node';
import PlannerNode from './planner-node';
import ExternalAgentNode from './external-agent-node';
import EndNode from './end-node';
import { ConfigPanel } from './config-panel';

const initialNodes: Node[] = [
    {
        id: 'start-1',
        type: 'start',
        position: { x: 50, y: 200 },
        data: { label: 'Start' },
    },
    {
        id: 'planner-1',
        type: 'planner',
        position: { x: 280, y: 195 },
        data: { label: 'Planner Agent' },
    },
    {
        id: 'external-1',
        type: 'externalAgent',
        position: { x: 560, y: 185 },
        data: {
            label: 'Customer Support Agent',
            protocol: 'a2a',
            endpointUrl: 'https://agents.kaya.ai/a2a/customer-support',
            status: 'connected',
        },
    },
    {
        id: 'end-1',
        type: 'end',
        position: { x: 870, y: 200 },
        data: { label: 'End' },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e-start-planner',
        source: 'start-1',
        target: 'planner-1',
        animated: true,
        style: { stroke: '#4ade80', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80' },
    },
    {
        id: 'e-planner-external',
        source: 'planner-1',
        target: 'external-1',
        animated: true,
        style: { stroke: '#3abff8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3abff8' },
    },
    {
        id: 'e-external-end',
        source: 'external-1',
        target: 'end-1',
        animated: true,
        style: { stroke: '#f87272', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f87272' },
    },
];

const nodeTypes = {
    start: StartNode,
    planner: PlannerNode,
    externalAgent: ExternalAgentNode,
    end: EndNode,
};

export const WorkflowCanvas = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [panelOpen, setPanelOpen] = useState(false);

    const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        const selectedNode = params.nodes.find(n => n.type === 'externalAgent');
        setPanelOpen(!!selectedNode);
    }, []);

    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    return (
        <div className="flex h-full">
            <div className="flex-1 bg-gray-900">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onSelectionChange={onSelectionChange}
                    nodeTypes={nodeTypes}
                    proOptions={proOptions}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    defaultEdgeOptions={{ type: 'smoothstep' }}
                    className="bg-gray-900"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#374151"
                    />
                    <Controls className="!bg-gray-800 !border-gray-700 !rounded-lg [&>button]:!bg-gray-700 [&>button]:!border-gray-600 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-600" />
                    <MiniMap
                        className="!bg-gray-800 !border-gray-700 !rounded-lg"
                        nodeColor={() => '#0DA2E7'}
                        maskColor="rgba(0,0,0,0.5)"
                    />
                </ReactFlow>
            </div>
            <ConfigPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
        </div>
    );
};
