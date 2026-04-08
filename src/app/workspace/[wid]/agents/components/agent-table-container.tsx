'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Rocket, RefreshCw, MoreHorizontal } from 'lucide-react';
import { Button, Input, Badge } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { ISelfLearning, AgentCategory, IPublishStatus } from '@/models';

export interface AgentData {
    id: string;
    agentName: string;
    agentDescription: string;
    llmId: string | undefined;
    slmId: string | undefined;
    search?: string;
    isReadOnly?: boolean;
    selfLearning?: ISelfLearning;
    agentCategory?: AgentCategory;
    publishStatus?: IPublishStatus;
}

interface AgentTableContainerProps {
    agents: AgentData[];
    onAgentFilter: (filter: AgentData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRecentActivity: () => void;
    onDeploy?: (id: string) => void;
    isDeploying?: boolean;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<AgentData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <Button
                className={`w-full sm:w-max ${row.original.isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
                disabled={row.original.isReadOnly}
            >
                <Trash2
                    size={18}
                    className={cn('', {
                        'text-gray-300 dark:text-gray-600': row.original.isReadOnly,
                        'text-gray-500 dark:text-gray-200': !row.original.isReadOnly,
                    })}
                />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            No
                        </Button>
                        <Button variant={'primary'} size="sm" onClick={handleDelete}>
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

// Deploy Confirmation Dialog
const DeployDialog = ({ 
    row, 
    onDeploy, 
    isDeploying 
}: { 
    row: Row<AgentData>; 
    onDeploy: (id: string) => void;
    isDeploying?: boolean;
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const isDeployed = row.original.publishStatus?.isPublished;

    const handleDeploy = () => {
        onDeploy(row.original.id);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                disabled={row.original.isReadOnly || isDeploying}
            >
                {isDeployed ? (
                    <>
                        <RefreshCw size={16} className="mr-2" />
                        Re-Deploy
                    </>
                ) : (
                    <>
                        <Rocket size={16} className="mr-2" />
                        Deploy
                    </>
                )}
            </DropdownMenuItem>
            <DialogContent className="overflow-y-auto max-h-[80%]">
                <DialogHeader>
                    <DialogTitle>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {isDeployed 
                                ? 'Re-deploy this Horizon Agent?' 
                                : 'Deploy this Horizon Agent?'
                            }
                        </p>
                    </DialogTitle>
                </DialogHeader>
                <div className="p-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {isDeployed 
                            ? `This will re-deploy "${row.original.agentName}" to the workspace-scoped agents endpoint with the latest configuration changes.`
                            : `This will deploy "${row.original.agentName}" to the workspace-scoped agents endpoint, making it callable via the workspace identity.`
                        }
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant={'primary'} 
                            size="sm" 
                            onClick={handleDeploy}
                            disabled={isDeploying}
                        >
                            {isDeploying ? 'Deploying...' : (isDeployed ? 'Re-Deploy' : 'Deploy')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const generateColumns = (
    onEditButtonClick: (id: string) => void, 
    onDelete: (id: string) => void,
    onDeploy?: (id: string) => void,
    isDeploying?: boolean
) => {
    const columns: ColumnDef<AgentData>[] = [
        {
            accessorKey: 'agentName',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Agent Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('agentName'))}</div>;
            },
        },
        {
            accessorKey: 'agentCategory',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Type</div>;
            },
            cell({ row }) {
                const category = row.original.agentCategory;
                const publishStatus = row.original.publishStatus;
                const isHorizon = category === AgentCategory.HORIZON;
                
                return (
                    <div className="flex items-center gap-x-2">
                        <Badge 
                            variant={isHorizon ? 'default' : 'secondary'}
                            className={cn(
                                'text-xs',
                                isHorizon 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            )}
                        >
                            {isHorizon ? 'Horizon' : 'Reusable'}
                        </Badge>
                        {isHorizon && publishStatus?.isPublished && (
                            <Badge 
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                                Deployed
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'agentDescription',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Agent Description</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('agentDescription'))}</div>;
            },
        },
        {
            accessorKey: 'id',
            enableSorting: false,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell({ row }) {
                const isHorizon = row.original.agentCategory === AgentCategory.HORIZON;
                
                return (
                    <div className="flex items-center gap-x-2">
                        <DeleteRecord row={row} onDelete={onDelete} />
                        <Pencil
                            size={18}
                            className="text-gray-500 cursor-pointer dark:text-gray-200"
                            onClick={() => onEditButtonClick(row.getValue('id'))}
                        />
                        {/* Deploy/Re-Deploy action menu for Horizon Agents only */}
                        {isHorizon && onDeploy && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="link" size="icon" className="h-8 w-8">
                                        <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-200" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DeployDialog 
                                        row={row} 
                                        onDeploy={onDeploy} 
                                        isDeploying={isDeploying}
                                    />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onEditButtonClick(row.getValue('id'))}
                                    >
                                        <Pencil size={16} className="mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const AgentTableContainer = ({
    agents,
    onAgentFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onRecentActivity,
    onDeploy,
    isDeploying,
}: AgentTableContainerProps) => {
    const { register, handleSubmit } = useForm<AgentData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: AgentData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onAgentFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete, onDeploy, isDeploying);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={agents}
                searchColumnName="agent"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search Agent"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Agent
                            </Button>
                            <Button variant={'link'} size={'sm'} onClick={onRecentActivity} className="hidden">
                                Recent Activities
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
