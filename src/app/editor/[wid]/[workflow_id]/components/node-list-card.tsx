'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { CustomNodeBase, CustomNodeProps } from '@/components';
import '../../../editor.css';
import { capitalize } from 'lodash';
import { cn } from '@/lib/utils';
import { CustomNodeTypes } from '@/enums';

interface NodeListCardProps {
    icon: string;
    title: string;
    nodes: CustomNodeProps[];
    customClassName?: string;
    onClick?: (nodeType: CustomNodeTypes) => void;
}

export const NodeListCard = ({ icon, title, nodes, customClassName, onClick }: NodeListCardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="node-list-card pb-3 flex flex-col gap-y-5 border-b bottom-gradient-border">
            <div className="node-list-header flex items-center justify-between px-1">
                <div className="node-list-header-title flex items-center gap-x-2">
                    <i className={icon} />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-100">
                        {capitalize(title.split('_').join(' '))}
                    </p>
                </div>
                <ChevronDown size={16} className="cursor-pointer" onClick={handleToggle} />
            </div>
            {isCollapsed && (
                <div
                    className={cn('node-list-body flex justify-start flex-wrap gap-4 w-[215px] pl-2', customClassName)}
                >
                    {nodes.map((node, index) => {
                        return (
                            <div key={index} onClick={() => onClick?.(node.type as CustomNodeTypes)}>
                                <CustomNodeBase {...node} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
