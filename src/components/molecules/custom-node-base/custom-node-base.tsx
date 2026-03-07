'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { cn, hexToRgba } from '@/lib/utils';
import { CustomHandle } from '../custom-handle/custom-handle';
import { useDnD } from '@/context';
import { Edge, Node } from '@xyflow/react';
import { CustomNodeTypes } from '@/enums';

type handleConfig = {
    showTarget: boolean;
    showSource: boolean;
};

export interface CustomNodeProps {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    title?: string;
    showTitle?: boolean;
    type: CustomNodeTypes;
    showInteractions?: boolean;
    isActive?: boolean;
    hidden?: boolean;
    color: string;
    activeColor?: string;
    icon: string;
    handleConfig?: handleConfig;
    isTemplate?: boolean;
    iconType?: 'icon' | 'svg' | 'png';
    templateFlow?: { nodes: Node[]; edges: Edge[] };
    customTitle?: string;
    hoverCard?: ReactNode;
    lineageStep?: number;
}

export const CustomNodeBase = ({
    id,
    title,
    color,
    activeColor = color,
    icon,
    type,
    handleConfig,
    showTitle = false,
    showInteractions = true,
    iconType = 'icon',
    customTitle,
    hoverCard,
    lineageStep,
}: CustomNodeProps) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isActive, setIsActive] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setType, setSelectedNodeId, selectedNodeId } = useDnD();

    const handleClick = () => {
        if (!showInteractions) return;
        setSelectedNodeId?.(id);
        setIsAnimating(true);
        // Reset after animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    };

    const handleDragStart = (event: React.DragEvent<HTMLElement>) => {
        setType(type);
        event.dataTransfer.effectAllowed = 'move';
        if (!showInteractions) return;
        setIsAnimating(true);
    };

    const handleDragEnd = () => {
        if (!showInteractions) return;
        // Reset animation state when drag ends
        setIsAnimating(false);
    };

    useEffect(() => {
        if (selectedNodeId === id) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [selectedNodeId]);

    // Icon animation variants
    const iconAnimationVariants = {
        idle: { scale: 1, rotate: 0 },
        animate: { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0], transition: { duration: 0.3 } },
    };

    return (
        <div className="flex flex-col items-center gap-y-1">
            {/* this part will only visible in the data lineage to show the steps */}
            <p className="text-md font-semibold">{lineageStep}</p>
            <div className="main-node-container flex flex-col items-center gap-y-1 relative group">
                {handleConfig && (
                    <>
                        {handleConfig.showSource && (
                            <CustomHandle type="source" color={isActive ? activeColor : color} />
                        )}
                        {handleConfig.showTarget && (
                            <CustomHandle type="target" color={isActive ? activeColor : color} />
                        )}
                    </>
                )}

                <button
                    type="button"
                    tabIndex={0}
                    draggable
                    className={cn('main-node node node-reusable w-[88px] h-[88px] group relative appearance-none bg-transparent border-0 p-0 cursor-grab active:cursor-grabbing')}
                    onClick={handleClick}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick();
                        }
                    }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    style={{
                        filter: isActive ? `drop-shadow(-3px 3px 12px ${hexToRgba(color)})` : undefined,
                    }}
                >
                    {showInteractions ? (
                        <motion.div
                            style={{ background: isActive ? activeColor : color }}
                            className={cn(
                                'node-tile rounded-lg h-[85px] w-[85px] border node-border z-20 flex items-center justify-center'
                            )}
                            initial={{ top: 0, left: 0 }}
                            animate={{
                                top: isAnimating ? 5 : 0,
                                left: isAnimating ? -5 : 0,
                                position: 'relative',
                            }}
                            transition={{ duration: 0.1, ease: 'easeOut' }}
                        >
                            {iconType === 'icon' && (
                                <motion.i
                                    className={cn(icon)}
                                    variants={iconAnimationVariants}
                                    animate={isAnimating ? 'animate' : 'idle'}
                                />
                            )}
                            {iconType === 'png' && (
                                <motion.img
                                    src={icon}
                                    alt="icon-for-node"
                                    className="w-[52px]"
                                    variants={iconAnimationVariants}
                                    animate={isAnimating ? 'animate' : 'idle'}
                                />
                            )}
                        </motion.div>
                    ) : (
                        <div
                            style={{ background: color }}
                            className="node-tile rounded-lg h-[85px] w-[85px] border node-border z-20 flex items-center justify-center"
                        >
                            {iconType === 'icon' && <i className={icon} />}
                            {iconType === 'png' && <img src={icon} alt="icon-for-node" className="w-[52px]" />}
                        </div>
                    )}
                    <div
                        style={{ background: isActive ? activeColor : color }}
                        className={cn(
                            'shadow-node-tile rounded-lg h-[85px] w-[85px] z-10 absolute top-1 right-[6px]'
                        )}
                    />
                </button>

                {/* Hover card */}
                {hoverCard}
            </div>
            {showTitle && (
                <p
                    className={cn('text-xs font-semibold text-gray-600 dark:text-gray-200 max-w-[100px] text-center', {
                        'max-w-[88px] text-center text-foreground opacity-80 truncate': customTitle,
                        'opacity-100': isActive,
                    })}
                >
                    {customTitle ?? title}
                </p>
            )}
        </div>
    );
};
