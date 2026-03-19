'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Bot } from 'lucide-react';

export type ExternalAgentNodeData = {
    label: string;
    protocol: 'a2a' | 'acp';
    endpointUrl: string;
    status: 'connected' | 'disconnected';
};

type ExternalAgentNodeType = Node<ExternalAgentNodeData, 'externalAgent'>;

const ExternalAgentNode = ({ data, selected }: NodeProps<ExternalAgentNodeType>) => {
    return (
        <div
            className={`
                relative px-4 py-3 rounded-xl border-2 min-w-[200px] shadow-lg transition-all
                ${selected
                    ? 'border-sky-400 shadow-sky-400/20 shadow-xl'
                    : 'border-sky-600/50 shadow-sky-600/10'
                }
                bg-gradient-to-br from-[#0c2d3f] to-[#0a3a4a]
            `}
        >
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-sky-400 !border-sky-600 !w-3 !h-3"
            />
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/30">
                    <Bot className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-sky-100">{data.label}</p>
                    <p className="text-[10px] text-sky-400/70 font-mono uppercase tracking-wider mt-0.5">
                        {data.protocol.toUpperCase()} Agent
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-12">
                <span className={`h-1.5 w-1.5 rounded-full ${data.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-[10px] text-sky-300/60">
                    {data.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-sky-400 !border-sky-600 !w-3 !h-3"
            />
        </div>
    );
};

export default memo(ExternalAgentNode);
