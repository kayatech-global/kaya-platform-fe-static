'use client';

import React, { useEffect, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn, hexToRgba } from '@/lib/utils';
import { useDnD } from '@/context';

// Color configuration for Tool Executor node
const NODE_COLOR = '#0891B2';
const NODE_ACTIVE_COLOR = '#0E7490';

interface ToolExecutorNodeData {
    name?: string;
    label?: string;
}

interface ToolExecutorNodeProps {
    id: string;
    data: Record<string, unknown>;
    type?: string;
}

export const ToolExecutorNode: React.FC<ToolExecutorNodeProps> = ({ id, data }) => {
    const nodeData = data as ToolExecutorNodeData;
    const [isAnimating, setIsAnimating] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const { setType, setSelectedNodeId, selectedNodeId } = useDnD();

    const handleClick = () => {
        setSelectedNodeId?.(id);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleDragStart = (event: React.DragEvent<HTMLElement>) => {
        setType?.('tool_executor_node');
        event.dataTransfer.effectAllowed = 'move';
        setIsAnimating(true);
    };

    const handleDragEnd = () => {
        setIsAnimating(false);
    };

    useEffect(() => {
        setIsActive(selectedNodeId === id);
    }, [selectedNodeId, id]);

    // Icon animation variants
    const iconAnimationVariants = {
        idle: { scale: 1, rotate: 0 },
        animate: { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0], transition: { duration: 0.3 } },
    };

    const nodeHeight = 88;

    return (
        <div className="flex flex-col items-center gap-y-1">
            <div className="main-node-container flex flex-col items-center gap-y-1 relative group">
                {/* Default Target Handle (left side) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="default-target"
                    style={{
                        background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR,
                        borderRadius: '8px',
                        border: 'none',
                        height: '16px',
                        width: '12px',
                        left: '-4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                />

                {/* Source Handle (right side) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="default-source"
                    style={{
                        background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR,
                        borderRadius: '8px',
                        border: 'none',
                        height: '16px',
                        width: '12px',
                        right: '2px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                />

                <button
                    type="button"
                    tabIndex={0}
                    draggable
                    className={cn(
                        'main-node node node-reusable w-[88px] h-[88px] group relative appearance-none bg-transparent border-0 p-0 cursor-grab active:cursor-grabbing',
                    )}
                    onClick={handleClick}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick();
                        }
                    }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <motion.div
                        style={{
                            background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR,
                            height: '85px',
                        }}
                        className={cn(
                            'node-tile rounded-lg w-[85px] border node-border z-20 flex items-center justify-center'
                        )}
                        initial={{ top: 0, left: 0 }}
                        animate={{
                            top: isAnimating ? 5 : 0,
                            left: isAnimating ? -5 : 0,
                            position: 'relative',
                            filter: isActive ? `drop-shadow(-3px 3px 12px ${hexToRgba(NODE_COLOR)})` : undefined,
                        }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                    >
                        {/* Main Icon */}
                        <motion.i
                            className="ri-tools-fill text-[40px] antialiased text-white"
                            variants={iconAnimationVariants}
                            animate={isAnimating ? 'animate' : 'idle'}
                        />

                    </motion.div>

                    {/* Shadow */}
                    <div
                        style={{
                            background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR,
                            height: '85px',
                        }}
                        className={cn(
                            'shadow-node-tile rounded-lg w-[85px] z-10 absolute top-1 right-[6px]'
                        )}
                    />
                </button>
            </div>

            {/* Node Title */}
            <p
                className={cn(
                    'text-xs font-semibold text-gray-600 dark:text-gray-200 max-w-[100px] text-center',
                    {
                        'max-w-[88px] text-center text-foreground opacity-80 truncate': nodeData?.name,
                        'opacity-100': isActive,
                    }
                )}
            >
                {nodeData?.name ?? 'Tool Executor'}
            </p>
        </div>
    );
};

export default ToolExecutorNode;
