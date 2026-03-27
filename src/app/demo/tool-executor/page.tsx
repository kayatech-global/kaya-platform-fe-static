'use client';

import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { ToolExecutorForm } from '@/components/organisms/workflow-editor-form/tool-executor-form';
import { NodeType } from '@/enums';
import { DnDProvider } from '@/context';

// Mock node for demo purposes
const mockNode = {
    id: 'tool_executor_node-b23ceead-1d89-417b-8311-d9b43d30d0e5',
    type: NodeType.TOOL_EXECUTOR,
    position: { x: 0, y: 0 },
    data: {
        name: 'API Data Fetcher',
        description: 'Fetches user data from multiple APIs',
        toolCategory: 'APIs',
        selectedTools: [
            { id: 'api-1', name: 'Get User Profile', type: 'APIs' },
            { id: 'api-2', name: 'Get User Orders', type: 'APIs' },
        ],
        inputRequestStructures: {
            'api-1': '{\n  "user_id": "{{Variable:uid}}",\n  "include_metadata": true\n}',
            'api-2': '{\n  "user_id": "{{Variable:uid}}",\n  "limit": 10\n}',
        },
    },
};

// Mock functions
const mockUpdateNodeData = (nodeId: string, data: Record<string, unknown>) => {
    console.log('[Demo] updateNodeData called:', nodeId, data);
};

const mockOnSaveClick = () => {
    console.log('[Demo] onSaveClick called');
};

const mockOnDeleteNode = () => {
    console.log('[Demo] onDeleteNode called');
};

export default function ToolExecutorDemoPage() {
    const [selectedNode] = useState(mockNode);

    return (
        <DnDProvider>
            <ReactFlowProvider>
                <div className="min-h-screen bg-gray-900 flex">
                    {/* Left side - placeholder for workflow canvas */}
                    <div className="flex-1 bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#0891B2]/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#0891B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-medium text-gray-200 mb-2">Workflow Canvas</h2>
                            <p className="text-sm">Tool Executor Node Selected</p>
                        </div>
                    </div>

                    {/* Right side - Tool Executor Form */}
                    <div className="w-[420px] border-l border-gray-700 bg-[rgb(31,41,55)] overflow-y-auto">
                        <ToolExecutorForm
                            selectedNode={selectedNode as any}
                            updateNodeData={mockUpdateNodeData}
                            onSaveClick={mockOnSaveClick}
                            onDeleteNode={mockOnDeleteNode}
                            isReadOnly={false}
                        />
                    </div>
                </div>
            </ReactFlowProvider>
        </DnDProvider>
    );
}
