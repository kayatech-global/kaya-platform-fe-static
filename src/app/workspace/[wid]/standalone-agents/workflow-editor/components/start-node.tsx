'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Play } from 'lucide-react';

type StartNodeData = { label: string };
type StartNodeType = Node<StartNodeData, 'start'>;

const StartNode = ({ data }: NodeProps<StartNodeType>) => {
    return (
        <div className="flex items-center gap-2 rounded-xl border-2 border-green-500/50 bg-gradient-to-br from-[#0a2e1a] to-[#0d3a20] px-4 py-3 shadow-lg shadow-green-600/10 min-w-[140px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <Play className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-xs font-semibold text-green-100">{data.label}</p>
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-green-400 !border-green-600 !w-3 !h-3"
            />
        </div>
    );
};

export default memo(StartNode);
