'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Eye, ListFilter } from 'lucide-react';
import { Button, Input, TruncateCell } from '@/components';
import { Badge } from '@/components/atoms/badge';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { AgentStatusBadge } from './agent-status-badge';
import { CreationWizard } from './creation-wizard';
import { mockAgents } from '../mock-data';
import type { StandaloneAgent, AgentFramework, AgentStatus } from '../mock-data';

interface AgentFilterData {
    search?: string;
    framework?: AgentFramework | 'all';
    status?: AgentStatus | 'all';
}

const DeleteRecord = ({ row, onDelete }: { row: Row<StandaloneAgent>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="cursor-pointer" variant="link" size="icon" onClick={() => setOpen(true)}>
                            <Trash2 size={18} className="text-gray-500 dark:text-gray-200" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center">
                        Delete Agent
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete this agent?
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

const generateColumns = (
    onView: (id: string) => void,
    onDelete: (id: string) => void
): ColumnDef<StandaloneAgent>[] => [
    {
        accessorKey: 'name',
        enableSorting: true,
        header: () => <div className="w-full text-left">Agent Name</div>,
        cell: ({ row }) => <div>{handleNoValue(row.getValue('name'))}</div>,
    },
    {
        accessorKey: 'description',
        enableSorting: false,
        header: () => <div className="w-full text-left">Description</div>,
        cell: ({ row }) => (
            <div>
                <TruncateCell value={handleNoValue(row.getValue('description')) as string} length={40} />
            </div>
        ),
    },
    {
        accessorKey: 'framework',
        enableSorting: true,
        header: () => <div className="w-full text-left">Framework</div>,
        cell: ({ row }) => {
            const fw = row.getValue('framework') as AgentFramework;
            return (
                <Badge variant="outline" size="sm">
                    {fw === 'kaya-agent' ? 'Kaya Agent' : 'OpenClaw'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'status',
        enableSorting: true,
        header: () => <div className="w-full text-left">Status</div>,
        cell: ({ row }) => <AgentStatusBadge status={row.getValue('status') as AgentStatus} />,
    },
    {
        accessorKey: 'a2aEndpoint',
        enableSorting: false,
        header: () => <div className="w-full text-left">Endpoint</div>,
        cell: ({ row }) => (
            <div className="font-mono text-xs">
                <TruncateCell value={handleNoValue(row.getValue('a2aEndpoint')) as string} length={35} />
            </div>
        ),
    },
    {
        accessorKey: 'version',
        enableSorting: true,
        header: () => <div className="w-full text-left">Version</div>,
        cell: ({ row }) => <span className="font-mono text-xs">v{row.getValue('version')}</span>,
    },
    {
        accessorKey: 'id',
        enableSorting: false,
        header: () => <div className="w-full text-left"></div>,
        cell: ({ row }) => (
            <div className="flex items-center gap-x-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="text-gray-500 cursor-pointer dark:text-gray-200 bg-transparent border-none p-0 inline-flex"
                                onClick={() => onView(row.original.id)}
                                aria-label="View Agent"
                            >
                                <Eye size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                            View Agent
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DeleteRecord row={row} onDelete={onDelete} />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="text-gray-500 cursor-pointer dark:text-gray-200 bg-transparent border-none p-0 inline-flex"
                                onClick={() => onView(row.original.id)}
                                aria-label="Edit Agent"
                            >
                                <Pencil size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                            Edit Agent
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
    },
];

const AgentFilter = ({
    frameworkFilter,
    statusFilter,
    onApply,
}: {
    frameworkFilter: AgentFramework | 'all';
    statusFilter: AgentStatus | 'all';
    onApply: (framework: AgentFramework | 'all', status: AgentStatus | 'all') => void;
}) => {
    const [open, setOpen] = useState(false);
    const [fw, setFw] = useState(frameworkFilter);
    const [st, setSt] = useState(statusFilter);

    const handleApply = () => {
        onApply(fw, st);
        setOpen(false);
    };

    const handleClear = () => {
        setFw('all');
        setSt('all');
        onApply('all', 'all');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary" leadingIcon={<ListFilter />}>
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="bottom" align="end">
                <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Framework</label>
                        <select
                            value={fw}
                            onChange={e => setFw(e.target.value as AgentFramework | 'all')}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Frameworks</option>
                            <option value="kaya-agent">Kaya Agent</option>
                            <option value="openclaw">OpenClaw</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Status</label>
                        <select
                            value={st}
                            onChange={e => setSt(e.target.value as AgentStatus | 'all')}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                        >
                            <option value="all">All Statuses</option>
                            <option value="running">Running</option>
                            <option value="stopped">Stopped</option>
                            <option value="error">Error</option>
                            <option value="deploying">Deploying</option>
                        </select>
                    </div>
                    <div className="flex self-end mt-2 gap-2">
                        <Button variant="secondary" size="sm" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleApply}>
                            Apply Filter
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const AgentListingContainer = () => {
    const router = useRouter();
    const params = useParams();
    const [search, setSearch] = useState('');
    const [frameworkFilter, setFrameworkFilter] = useState<AgentFramework | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
    const [wizardOpen, setWizardOpen] = useState(false);
    const { register, handleSubmit } = useForm<AgentFilterData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const filteredAgents = useMemo(() => {
        return mockAgents.filter(agent => {
            const matchesSearch =
                agent.name.toLowerCase().includes(search.toLowerCase()) ||
                agent.description.toLowerCase().includes(search.toLowerCase());
            const matchesFramework = frameworkFilter === 'all' || agent.framework === frameworkFilter;
            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
            return matchesSearch && matchesFramework && matchesStatus;
        });
    }, [search, frameworkFilter, statusFilter]);

    const handleAgentClick = (agentId: string) => {
        router.push(`/workspace/${params.wid}/standalone-agents/${agentId}`);
    };

    const handleDelete = (agentId: string) => {
        console.log('Delete agent:', agentId);
    };

    const handleSearch = (data: AgentFilterData) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(() => {
            setSearch(data.search ?? '');
        }, 500);
        setDebounceTimer(timer);
    };

    const handleFilterApply = (framework: AgentFramework | 'all', status: AgentStatus | 'all') => {
        setFrameworkFilter(framework);
        setStatusFilter(status);
    };

    const columns = generateColumns(handleAgentClick, handleDelete);

    const agentCount = `${filteredAgents.length} of ${mockAgents.length} agents`;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div className="dashboard-left-section flex flex-col w-full">
                    <div className="grid gap-8">
                        <div className="w-100 custom-overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={filteredAgents}
                                searchColumnName="name"
                                showFooter
                                defaultPageSize={10}
                                showTableSearch={false}
                                manualSpan={true}
                                tableHeader={
                                    <div className="w-full">
                                        <div className="flex justify-between items-center w-full">
                                            <Input
                                                {...register('search')}
                                                placeholder="Search by Agent Name"
                                                className="max-w-sm"
                                                onKeyUp={handleSubmit(handleSearch)}
                                            />
                                            <AgentFilter
                                                frameworkFilter={frameworkFilter}
                                                statusFilter={statusFilter}
                                                onApply={handleFilterApply}
                                            />
                                            <div className="flex ml-2">
                                                <Button size="sm" onClick={() => setWizardOpen(true)}>
                                                    Create Agent
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end w-full mt-2">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {agentCount}
                                            </p>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <CreationWizard open={wizardOpen} onOpenChange={setWizardOpen} />
        </div>
    );
};
