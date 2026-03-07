import React from 'react';
import { Handle, HandleType, Position } from '@xyflow/react';

export interface CustomHandleProps {
    color: string;
    type: HandleType;
    className?: string;
}

export const CustomHandle = ({ color, type }: CustomHandleProps) => {
    const position = type === 'source' ? Position.Right : Position.Left;

    return (
        <Handle
            type={type}
            position={position}
            style={{
                background: color,
                borderRadius: '8px',
                border: 'none',
                height: '16px',
                width: '12px',
                right: type === 'source' ? '2px' : 'unset',
                left: type === 'source' ? 'unset' : '-4px',
            }}
        ></Handle>
    );
};
