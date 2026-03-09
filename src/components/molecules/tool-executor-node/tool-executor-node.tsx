'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn, hexToRgba } from '@/lib/utils';
import { useDnD } from '@/context';
import { DynamicInputConnect, ToolExecutorType } from '@/components/organisms/workflow-editor-form/tool-executor-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';

// Color configuration for Tool Executor node
const NODE_COLOR = '#0891B2';
const NODE_ACTIVE_COLOR = '#0E7490';

// Data type color mapping for visual distinction
const DATA_TYPE_COLORS: Record<string, string> = {
    string: '#10B981',   // green
    number: '#3B82F6',   // blue
    boolean: '#F59E0B',  // amber
    object: '#8B5CF6',   // purple
    array: '#EC4899',    // pink
};

interface ToolExecutorNodeProps {
    id: string;
    data: Record<string, unknown>;
    type?: string;
}

export const ToolExecutorNode: React.FC<ToolExecutorNodeProps> = ({ id, data }) => {
    // Cast data for type safety
    const nodeData = data as ToolExecutorType & { label?: string };
    const [isAnimating, setIsAnimating] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const { setType, setSelectedNodeId, selectedNodeId } = useDnD();

    // Get dynamic input connects from node data
    const dynamicInputConnects = useMemo(() => {
        return (nodeData?.dynamicInputConnects ?? []) as DynamicInputConnect[];
    }, [nodeData?.dynamicInputConnects]);

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

    // Calculate node height based on number of dynamic inputs
    const baseHeight = 88;
    const inputHeight = 24;
    const nodeHeight = dynamicInputConnects.length > 0 
        ? Math.max(baseHeight, 60 + (dynamicInputConnects.length * inputHeight))
        : baseHeight;

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

                {/* Dynamic Input Handles (left side, stacked below the main target) */}
                {dynamicInputConnects.map((input, index) => {
                    const handleColor = DATA_TYPE_COLORS[input.dataType] || NODE_COLOR;
                    const topOffset = 35 + ((index + 1) * inputHeight);
                    
                    return (
                        <TooltipProvider key={input.id}>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '-8px',
                                            top: `${topOffset}px`,
                                        }}
                                    >
                                        <Handle
                                            type="target"
                                            position={Position.Left}
                                            id={`input-${input.id}`}
                                            style={{
                                                position: 'relative',
                                                background: handleColor,
                                                borderRadius: '4px',
                                                border: input.required ? '2px solid white' : 'none',
                                                height: '12px',
                                                width: '8px',
                                                left: 0,
                                                top: 0,
                                                transform: 'none',
                                            }}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[200px]">
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium text-sm">{input.name || 'Unnamed Input'}</p>
                                        <p className="text-xs text-gray-400">Type: {input.dataType}</p>
                                        {input.description && (
                                            <p className="text-xs text-gray-300">{input.description}</p>
                                        )}
                                        {input.required && (
                                            <span className="text-xs text-amber-400">Required</span>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}

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
                        'main-node node node-reusable w-[88px] group relative appearance-none bg-transparent border-0 p-0 cursor-grab active:cursor-grabbing',
                    )}
                    style={{ height: `${nodeHeight}px` }}
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
                            height: `${nodeHeight - 3}px`,
                        }}
                        className={cn(
                            'node-tile rounded-lg w-[85px] border node-border z-20 flex flex-col items-center justify-start pt-3 gap-y-2'
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

                        {/* Dynamic Input Indicators */}
                        {dynamicInputConnects.length > 0 && (
                            <div className="flex flex-col gap-1 w-full px-2 mt-1">
                                {dynamicInputConnects.map((input) => (
                                    <div
                                        key={input.id}
                                        className="flex items-center gap-1 text-[9px] text-white/90 truncate"
                                        title={input.name}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: DATA_TYPE_COLORS[input.dataType] || NODE_COLOR }}
                                        />
                                        <span className="truncate font-medium">
                                            {input.name || 'input'}
                                        </span>
                                        {input.required && (
                                            <span className="text-amber-300">*</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Shadow */}
                    <div
                        style={{ 
                            background: isActive ? NODE_ACTIVE_COLOR : NODE_COLOR,
                            height: `${nodeHeight - 3}px`,
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
