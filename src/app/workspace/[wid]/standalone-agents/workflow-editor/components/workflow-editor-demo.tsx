'use client';

import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowCanvas } from './workflow-canvas';
import { Bot, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { useRouter, useParams } from 'next/navigation';

export const WorkflowEditorDemo = () => {
    const router = useRouter();
    const params = useParams();

    return (
        <ReactFlowProvider>
            <div className="h-screen flex flex-col bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/workspace/${params.wid}/standalone-agents`)}
                            className="text-gray-400 hover:text-gray-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-sky-400" />
                            <span className="text-sm font-semibold text-gray-100">
                                Workflow Editor — External Agent Node Demo
                            </span>
                        </div>
                        <Badge variant="info" size="sm">Prototype</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">
                            Click the External Agent node to open the configuration panel →
                        </span>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 min-h-0">
                    <WorkflowCanvas />
                </div>
            </div>
        </ReactFlowProvider>
    );
};
