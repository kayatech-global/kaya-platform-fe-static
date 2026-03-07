'use client';
import { NodeListCard } from '@/app/editor/[wid]/[workflow_id]/components';
import { Input } from '@/components/atoms';
import { NODE_LIST, NodeListTypeDef } from '@/constants/editor-constants';
import { useDnD } from '@/context';
import { CustomNodeTypes } from '@/enums';

import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface NodeListModalBodyProps {
    addChildToGroup: (nodeType: CustomNodeTypes) => void;
    allowedNodes?: CustomNodeTypes[];
}

export const NodeListModalBody = ({ allowedNodes, addChildToGroup }: NodeListModalBodyProps) => {
    const { recentUsed } = useDnD();
    const [searchTerm, setSearchTerm] = useState('');
    const [nodeList, setNodeList] = useState<NodeListTypeDef[]>();

    useEffect(() => {
        const hasAllowedFilter = allowedNodes && allowedNodes.length > 0;

        const updatedNodeList = NODE_LIST.filter(category => category.category !== 'template')
            .map(category => {
                const baseNodes = category.category === 'recent_used' ? recentUsed : category.nodes;

                const allowedFilteredNodes = hasAllowedFilter
                    ? baseNodes.filter(node => allowedNodes.includes(node.type))
                    : baseNodes;

                const searchFilteredNodes =
                    searchTerm === ''
                        ? allowedFilteredNodes
                        : allowedFilteredNodes.filter(node =>
                              node.title?.toLowerCase().includes(searchTerm.toLowerCase())
                          );

                return {
                    ...category,
                    nodes: searchFilteredNodes,
                };
            })
            .filter(category => category.nodes.length > 0);

        setNodeList(updatedNodeList);
    }, [searchTerm, recentUsed, allowedNodes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded py-3 overflow-y-auto max-h-[70vh] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
            <div className="flex flex-col gap-y-6">
                <Input placeholder="Search nodes" trailingIcon={<Search />} onChange={handleChange} />
                <div className="group">
                    <div className="flex flex-col gap-y-6 px-2 pb-6">
                        {nodeList?.map((nl, index) => {
                            return (
                                <NodeListCard
                                    onClick={addChildToGroup}
                                    customClassName="node-list-body flex justify-start flex-wrap gap-4 w-full"
                                    key={index}
                                    title={nl.category}
                                    icon={nl.icon}
                                    nodes={nl.nodes}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
