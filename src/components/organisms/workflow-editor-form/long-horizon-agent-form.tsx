/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, SelectableRadioItem, Spinner } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { Compass, FileX, Search, ExternalLink, Trash2 } from 'lucide-react';
import { useDnD } from '@/context';
import { Node, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AgentCategory } from '@/enums';

// Types for Long Horizon Agent
interface LongHorizonAgent {
    id: string;
    agentName: string;
    description: string;
    agentCategory: AgentCategory;
    publishStatus?: {
        isPublished: boolean;
        publishedAt?: string;
    };
}

interface LongHorizonAgentData {
    name?: string;
    agentId?: string;
    agentName?: string;
    description?: string;
}

interface LongHorizonAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

// Mock data for Long Horizon agents - in real implementation, this would come from an API
const useLongHorizonAgents = (workspaceId: string) => {
    const [agents, setAgents] = useState<LongHorizonAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call - in real implementation, fetch from agents API with filter for HORIZON category
        const fetchAgents = async () => {
            setIsLoading(true);
            try {
                // Mock data - replace with actual API call
                const mockAgents: LongHorizonAgent[] = [
                    {
                        id: 'lh-agent-1',
                        agentName: 'Customer Support Agent',
                        description: 'Handles customer inquiries and support tickets autonomously',
                        agentCategory: AgentCategory.HORIZON,
                        publishStatus: { isPublished: true, publishedAt: '2024-01-15' },
                    },
                    {
                        id: 'lh-agent-2',
                        agentName: 'Data Analysis Agent',
                        description: 'Performs complex data analysis tasks over extended periods',
                        agentCategory: AgentCategory.HORIZON,
                        publishStatus: { isPublished: true, publishedAt: '2024-01-20' },
                    },
                    {
                        id: 'lh-agent-3',
                        agentName: 'Research Assistant Agent',
                        description: 'Conducts research and compiles reports autonomously',
                        agentCategory: AgentCategory.HORIZON,
                        publishStatus: { isPublished: false },
                    },
                ];
                setAgents(mockAgents);
            } catch (error) {
                console.error('Failed to fetch Long Horizon agents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAgents();
    }, [workspaceId]);

    return { agents, isLoading, refetch: () => {} };
};

export function LongHorizonAgentForm({ selectedNode, isReadOnly = false }: LongHorizonAgentFormProps) {
    const { wid: workspaceId } = useParams();
    const { setNodes } = useReactFlow();
    const { setSelectedNodeId } = useDnD();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(
        (selectedNode.data as LongHorizonAgentData)?.agentId
    );
    const [tempSelectedAgentId, setTempSelectedAgentId] = useState<string | undefined>();

    const { agents, isLoading, refetch } = useLongHorizonAgents(workspaceId as string);

    const nodeData = selectedNode.data as LongHorizonAgentData;
    const hasSelectedAgent = !!nodeData?.agentId;

    // Filter agents based on search term and only show published ones
    const filteredAgents = useMemo(() => {
        return agents
            .filter(agent => agent.publishStatus?.isPublished)
            .filter(agent =>
                agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [agents, searchTerm]);

    const selectedAgent = useMemo(() => {
        return agents.find(agent => agent.id === selectedAgentId);
    }, [agents, selectedAgentId]);

    const handleOpenDialog = () => {
        setTempSelectedAgentId(selectedAgentId);
        setIsDialogOpen(true);
    };

    const handleSelectAgent = (agent: LongHorizonAgent) => {
        setTempSelectedAgentId(agent.id);
    };

    const handleConfirmSelection = () => {
        const agent = agents.find(a => a.id === tempSelectedAgentId);
        if (agent) {
            setSelectedAgentId(agent.id);
            
            // Update node data
            setNodes((nodes: Node[]) =>
                nodes.map((node: Node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                name: agent.agentName,
                                agentId: agent.id,
                                agentName: agent.agentName,
                                description: agent.description,
                            },
                        };
                    }
                    return node;
                })
            );
            
            toast.success(`Long Horizon Agent "${agent.agentName}" selected`);
        }
        setIsDialogOpen(false);
    };

    const handleRemoveAgent = () => {
        setSelectedAgentId(undefined);
        setNodes((nodes: Node[]) =>
            nodes.map((node: Node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            name: undefined,
                            agentId: undefined,
                            agentName: undefined,
                            description: undefined,
                        },
                    };
                }
                return node;
            })
        );
        toast.success('Long Horizon Agent removed');
    };

    return (
        <div className="flex flex-col gap-y-4">
            {/* Header Section */}
            <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-2">
                    <Compass size={20} className="text-teal-600 dark:text-teal-400" />
                    <p className="text-sm font-medium">Long Horizon Agent</p>
                </div>
                <p className="text-xs text-gray-400">
                    Select a Long Horizon Agent to integrate into your workflow. These agents operate independently and can interact via A2A communication.
                </p>
            </div>

            {/* Selected Agent Display or Add Button */}
            {hasSelectedAgent && selectedAgent ? (
                <div className="border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex flex-col gap-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-x-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                                    <Compass size={20} className="text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium">{selectedAgent.agentName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {selectedAgent.description}
                                    </p>
                                </div>
                            </div>
                            {!isReadOnly && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={handleRemoveAgent}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                        
                        {!isReadOnly && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleOpenDialog}
                                className="w-full"
                            >
                                Change Agent
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <DetailItemInput
                    disabled={isReadOnly}
                    titleIcon={<Compass size={18} className="text-teal-600 dark:text-teal-400" />}
                    title="Add a Long Horizon Agent"
                    description="Select a deployed Long Horizon Agent to use in this workflow"
                    buttonLabel="Select Agent"
                    onClick={handleOpenDialog}
                />
            )}

            {/* Agent Selection Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                            <Compass size={20} className="text-teal-600 dark:text-teal-400" />
                            Select Long Horizon Agent
                        </DialogTitle>
                        <DialogDescription>
                            Choose a deployed Long Horizon Agent to integrate into your workflow.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-y-4 py-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Agent List */}
                        <div className="flex flex-col gap-y-2 max-h-[300px] overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Spinner />
                                    <p className="text-sm text-gray-500 mt-2">Loading agents...</p>
                                </div>
                            ) : filteredAgents.length > 0 ? (
                                filteredAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        onClick={() => handleSelectAgent(agent)}
                                        className={cn(
                                            'flex items-center gap-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors',
                                            tempSelectedAgentId === agent.id
                                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                                            <Compass size={20} className="text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{agent.agentName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {agent.description}
                                            </p>
                                        </div>
                                        {tempSelectedAgentId === agent.id && (
                                            <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <FileX size={32} className="text-gray-400" />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {searchTerm ? 'No agents found matching your search' : 'No deployed Long Horizon Agents available'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmSelection}
                            disabled={!tempSelectedAgentId}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            Select Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
