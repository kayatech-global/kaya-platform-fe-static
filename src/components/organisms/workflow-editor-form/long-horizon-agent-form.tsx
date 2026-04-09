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
import { FileX, Compass } from 'lucide-react';
import { useDnD } from '@/context';
import { Node, useReactFlow } from '@xyflow/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { AgentCategory } from '@/models/horizon-agent.model';
import { agentService } from '@/services';
import { useQuery } from 'react-query';

// Types for Long Horizon Agent
interface LongHorizonAgent {
    id: string;
    name: string;
    description: string;
    agentCategory?: AgentCategory;
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

interface LongHorizonAgentListContentProps {
    readonly isFetching: boolean;
    readonly searchTerm: string;
    readonly agentsList: LongHorizonAgent[] | undefined;
    readonly sortedAgentsList: ReadonlyArray<LongHorizonAgent>;
    readonly selectedAgentId: string | undefined;
    readonly selectedAgentIdFromList: string | undefined;
    readonly onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly onSelectAgent: (agent: LongHorizonAgent) => void;
}

function LongHorizonAgentListContent({
    isFetching,
    searchTerm,
    agentsList,
    sortedAgentsList,
    selectedAgentId,
    selectedAgentIdFromList,
    onSearch,
    onSelectAgent,
}: LongHorizonAgentListContentProps) {
    if (isFetching) {
        return (
            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                <Spinner />
                <p className="w-[300px] text-center">Just a moment, we&apos;re checking for Long Horizon Agents...</p>
            </div>
        );
    }
    return (
        <>
            <Input className="w-full" placeholder="Agent name" onChange={onSearch} />
            {agentsList && agentsList.length > 0 ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                    {sortedAgentsList?.map(agent => (
                        <SelectableRadioItem
                            key={agent.id}
                            id={agent.id}
                            label={agent.name}
                            description={agent.description}
                            isChecked={
                                selectedAgentId === agent?.id &&
                                selectedAgentIdFromList === agent.description?.toLowerCase()
                            }
                            imagePath="/png/nodes/agent.png"
                            handleClick={() => onSelectAgent(agent)}
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm ? (
                            <>No results found</>
                        ) : (
                            <>
                                No Long Horizon Agents have been
                                <br /> configured
                            </>
                        )}
                    </p>
                </div>
            )}
        </>
    );
}

export function LongHorizonAgentForm({ selectedNode, isReadOnly = false }: LongHorizonAgentFormProps) {
    const { wid: workspaceId } = useParams();
    const { setNodes } = useReactFlow();
    const { setSelectedNodeId } = useDnD();
    
    const [openModal, setOpenModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<LongHorizonAgent | undefined>(undefined);
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
    const [selectedAgentIdFromList, setSelectedAgentIdFromList] = useState<string | undefined>(undefined);
    const [longHorizonAgentsList, setLongHorizonAgentsList] = useState<LongHorizonAgent[] | undefined>(undefined);

    const nodeData = selectedNode.data as LongHorizonAgentData;

    // Mock data for Long Horizon agents (for demo purposes)
    const MOCK_LONG_HORIZON_AGENTS: LongHorizonAgent[] = [
        {
            id: 'lha-001',
            name: 'Customer Support Agent',
            description: 'Handles customer inquiries and support tickets autonomously',
            agentCategory: AgentCategory.HORIZON,
            publishStatus: { isPublished: true },
        },
        {
            id: 'lha-002',
            name: 'Data Processing Agent',
            description: 'Processes and transforms large datasets in the background',
            agentCategory: AgentCategory.HORIZON,
            publishStatus: { isPublished: true },
        },
        {
            id: 'lha-003',
            name: 'Email Campaign Agent',
            description: 'Manages and executes email marketing campaigns',
            agentCategory: AgentCategory.HORIZON,
            publishStatus: { isPublished: true },
        },
        {
            id: 'lha-004',
            name: 'Report Generation Agent',
            description: 'Generates periodic business reports and analytics',
            agentCategory: AgentCategory.HORIZON,
            publishStatus: { isPublished: true },
        },
    ];

    // Fetch Long Horizon agents from API
    const { data: allAgents, isFetching, isFetched, refetch } = useQuery(
        ['long-horizon-agents', workspaceId],
        async () => {
            try {
                const response = await agentService.get(workspaceId as string);
                // Filter only HORIZON category agents that are published
                const apiAgents = (response as any[])?.filter((agent: any) => 
                    agent.agentCategory === AgentCategory.HORIZON && 
                    agent.publishStatus?.isPublished
                ) || [];
                
                // Combine API agents with mock data for demo
                return [...apiAgents, ...MOCK_LONG_HORIZON_AGENTS];
            } catch (error) {
                // If API fails, return mock data only
                console.log('[v0] API failed, returning mock data only:', error);
                return MOCK_LONG_HORIZON_AGENTS;
            }
        },
        {
            enabled: !!workspaceId,
            refetchOnWindowFocus: false,
            retry: false, // Don't retry failed requests
        }
    );

    // Format agents for display
    const formatAgent = (agents: any[]): LongHorizonAgent[] => {
        return agents?.map((agent: any) => ({
            id: agent.id,
            name: agent.agentName || agent.name || '',
            description: agent.description || '',
            agentCategory: agent.agentCategory,
            publishStatus: agent.publishStatus,
        })) || [];
    };

    // Set agents list when data is fetched
    useEffect(() => {
        if (allAgents) {
            const formattedAgents = formatAgent(allAgents);
            setLongHorizonAgentsList(formattedAgents);
        }
    }, [allAgents]);

    // Initialize from node data
    useEffect(() => {
        if (nodeData?.agentId && nodeData?.agentName) {
            setSelectedAgent({
                id: nodeData.agentId,
                name: nodeData.agentName,
                description: nodeData.description || '',
            });
            setSelectedAgentId(nodeData.agentId);
            setSelectedAgentIdFromList(nodeData.description?.toLowerCase());
        }
    }, [nodeData?.agentId, nodeData?.agentName, nodeData?.description]);

    // Sort and filter agents based on search
    const sortedAgentsList = useMemo(() => {
        if (!longHorizonAgentsList) return [];
        return longHorizonAgentsList
            .filter(agent => 
                agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [longHorizonAgentsList, searchTerm]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectAgent = (agent: LongHorizonAgent) => {
        setSelectedAgentId(agent.id);
        setSelectedAgentIdFromList(agent.description?.toLowerCase());
    };

    const handleApplyAgent = () => {
        const agent = longHorizonAgentsList?.find(a => a.id === selectedAgentId);
        if (agent) {
            setSelectedAgent(agent);
            
            // Update node data
            setNodes((nodes: Node[]) =>
                nodes.map((node: Node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                name: agent.name,
                                agentId: agent.id,
                                agentName: agent.name,
                                description: agent.description,
                            },
                        };
                    }
                    return node;
                })
            );
            
            toast.success(`Long Horizon Agent "${agent.name}" selected`);
        }
        setOpenModal(false);
    };

    const handleChange = () => {
        setOpenModal(true);
        if (isFetched) {
            refetch();
        }
    };

    const handleRemove = () => {
        setSelectedAgent(undefined);
        setSelectedAgentId(undefined);
        setSelectedAgentIdFromList(undefined);
        
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

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (cancel) setOpenModal(false);
        else setOpenModal(open);
    };

    return (
        <>
            <DetailItemInput
                label="Long Horizon Agent"
                values={
                    selectedAgent
                        ? [
                              {
                                  title: selectedAgent.name,
                                  description: selectedAgent.description || '',
                                  imagePath: '/png/nodes/agent.png',
                              },
                          ]
                        : undefined
                }
                imagePath="/png/select_reusable_agent.png"
                imageType="png"
                imageWidth="80"
                description='Select a Long Horizon Agent to integrate into your workflow. Click "Add a Long Horizon Agent" to see available agents.'
                footer={
                    selectedAgent ? (
                        <div className="w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange} disabled={isReadOnly}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove} disabled={isReadOnly}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="link"
                            disabled={isReadOnly}
                            onClick={() => {
                                setOpenModal(true);
                                if (isFetched) {
                                    refetch();
                                }
                            }}
                        >
                            Add a Long Horizon Agent
                        </Button>
                    )
                }
            />
            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4">
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    Long Horizon Agents
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            <LongHorizonAgentListContent
                                isFetching={isFetching}
                                searchTerm={searchTerm}
                                agentsList={longHorizonAgentsList}
                                sortedAgentsList={sortedAgentsList}
                                selectedAgentId={selectedAgentId}
                                selectedAgentIdFromList={selectedAgentIdFromList}
                                onSearch={handleSearch}
                                onSelectAgent={handleSelectAgent}
                            />
                        </div>
                    </DialogDescription>
                    <DialogFooter className="p-4 pt-0">
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={handleApplyAgent}
                            disabled={!selectedAgentId}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
