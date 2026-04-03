'use client';

import React, { useEffect, useState } from 'react';

import { Input } from '@/components';
import { NodeListCard } from './node-list-card';
import { Search } from 'lucide-react';
import { NODE_LIST, NodeListTypeDef } from '@/constants/editor-constants';
import { useDnD } from '@/context';
import { ReleaseManagementSnippet } from './release-management-snippet';

export const ToolPanel = () => {
    const { recentUsed } = useDnD();
    const [searchTerm, setSearchTerm] = useState('');
    const [nodeList, setNodeList] = useState<NodeListTypeDef[]>();

    useEffect(() => {
        const updatedNodeList = NODE_LIST.map(category => {
            if (category.category === 'recent_used') {
                return {
                    ...category,
                    nodes: recentUsed,
                };
            }
            return category;
        });

        if (searchTerm === '') {
            setNodeList(updatedNodeList);
        } else {
            const filteredList = updatedNodeList
                .map(category => ({
                    ...category,
                    nodes: category.nodes.filter(node => node.title?.toLowerCase().includes(searchTerm.toLowerCase())),
                }))
                .filter(category => category.nodes.length > 0); // Remove empty categories

            setNodeList(filteredList);
        }
    }, [searchTerm, recentUsed]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="w-fit bg-white dark:bg-gray-900 rounded pl-3 py-3 pr-[4px] overflow-y-clip">
            <div className="flex flex-col gap-y-6">
                <Input placeholder="Search nodes" trailingIcon={<Search />} onChange={handleChange} />
                <div className="group">
                    <div className="flex flex-col gap-y-6 h-[calc(100vh-220px)] overflow-y-auto pb-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                        {nodeList?.map((nl) => {
                            return <NodeListCard key={nl.category} title={nl.category} icon={nl.icon} nodes={nl.nodes} />;
                        })}
                    </div>
                </div>
                {/* Release Management Snippet */}
                <div className="mt-auto pt-3 pr-3">
                    <ReleaseManagementSnippet
                        hasA2AConfig={false}
                        hasExternalAgents={false}
                        onBeginRelease={() => {
                            // This would trigger the release workflow
                            console.log('Begin release workflow');
                        }}
                        onViewHistory={() => {
                            // This would open release history
                            console.log('View release history');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
