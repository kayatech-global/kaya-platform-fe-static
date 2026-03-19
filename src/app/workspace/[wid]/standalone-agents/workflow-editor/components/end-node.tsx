'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Square } from 'lucide-react';

type EndNodeData = { label: string };
type EndNodeType = Node<EndNodeData, 'end'>;

const EndNode = ({ data }: NodeProps<EndNodeType>) => {
    return (
        <div className="relative flex items-center gap-2 rounded-xl border-2 border-red-500/50 bg-gradient-to-br from-[#2e0a0a] to-[#3a0d0d] px-4 py-3 shadow-lg shadow-red-600/10 min-w-[140px]">
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-red-400 !border-red-600 !w-3 !h-3"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                <Square className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-xs font-semibold text-red-100">{data.label}</p>
        </div>
    );
};

export default memo(EndNode);
