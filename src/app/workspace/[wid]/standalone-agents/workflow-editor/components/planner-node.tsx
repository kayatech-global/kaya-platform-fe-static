'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Brain } from 'lucide-react';

type PlannerNodeData = { label: string };
type PlannerNodeType = Node<PlannerNodeData, 'planner'>;

const PlannerNode = ({ data }: NodeProps<PlannerNodeType>) => {
    return (
        <div className="relative flex items-center gap-2 rounded-xl border-2 border-blue-500/50 bg-gradient-to-br from-[#0c1a3f] to-[#0d2050] px-4 py-3 shadow-lg shadow-blue-600/10 min-w-[180px]">
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-400 !border-blue-600 !w-3 !h-3"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Brain className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xs font-semibold text-blue-100">{data.label}</p>
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-400 !border-blue-600 !w-3 !h-3"
            />
        </div>
    );
};

export default memo(PlannerNode);
