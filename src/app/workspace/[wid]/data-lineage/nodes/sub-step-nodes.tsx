'use client';

import { Handle, Position } from '@xyflow/react';
import React from 'react';

export enum LineageSubStepExplanationType {
    VECTORRAG = 'VECTORRAG',
    GRAPHRAG = 'GRAPHRAG',
}

interface SubStepNodeProps {
    iconColor: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IconComponent: React.ComponentType<any>;
    justify?: string;
    data?: { name?: string };
    type?: LineageSubStepExplanationType | string;
}

const SubStepNode: React.FC<SubStepNodeProps> = ({
    iconColor,
    IconComponent,
    justify = 'justify-start',
    data,
    type,
}) => {
    const label =
        type === LineageSubStepExplanationType.VECTORRAG
            ? 'VECTOR RAG'
            : type === LineageSubStepExplanationType.GRAPHRAG
            ? 'GRAPH RAG'
            : type ?? '-';

    return (
        <div
            className={`min-w-[200px] max-w-[320px] w-fit h-[80px] bg-gray-800 flex gap-x-3 ${justify} items-center rounded-md px-3 py-2`}
        >
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 rounded-full" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 rounded-full" />

            {/* Icon */}
            <div
                className={`${iconColor} min-w-[55px] !w-[55px] !h-[55px] rounded-md flex items-center justify-center flex-shrink-0`}
            >
                <IconComponent size={32} className="text-white" />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-y-2 min-w-0 flex-1">
                <p className="text-sm text-white leading-tight truncate" title={data?.name ?? '-'}>
                    {data?.name ?? '-'}
                </p>
                <div className="border border-gray-600 px-2 py-1 rounded-md w-fit">
                    <p className="text-xs text-gray-300">{label}</p>
                </div>
            </div>
        </div>
    );
};

export default SubStepNode;
