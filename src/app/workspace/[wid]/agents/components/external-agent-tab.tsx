'use client';

import React, { useState, useMemo } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Plus, Eye, Globe, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Button, Input } from '@/components';
import { Badge } from '@/components/atoms/badge';
import DataTable from '@/components/molecules/table/data-table';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/atoms/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { ExternalAgentFormDialog } from './external-agent-form-dialog';

export type ExternalAgentProtocol = 'a2a' | 'acp';
export type ExternalAgentAuthMode = 'none' | 'bearer' | 'apikey' | 'oauth' | 'jwt';
export type ExternalAgentConnectionStatus = 'reachable' | 'unreachable' | 'auth_error' | 'unknown';

export interface ExternalAgentDefinition {
    id: string;
    name: string;
    description: string;
    protocol: ExternalAgentProtocol;
    endpointUrl: string;
    authMode: ExternalAgentAuthMode;
    agentCardUrl?: string;
    acpAgentName?: string;
    executionMode: 'sync' | 'async_wait' | 'async_fire_forget';
    sessionMode: 'single' | 'per-workflow' | 'per-execution';
    connectionStatus: ExternalAgentConnectionStatus;
    lastTestedAt?: string;
    lastInvokedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const MOCK_EXTERNAL_AGENTS: ExternalAgentDefinition[] = [
    {
        id: 'ext-001',
        name: 'OpenAI Assistant',
        description: 'GPT-4 powered assistant via OpenAI A2A endpoint',
        protocol: 'a2a',
        endpointUrl: 'https://api.openai.com/v1/a2a',
        authMode: 'bearer',
        agentCardUrl: 'https://api.openai.com/.well-known/agent.json',
        executionMode: 'sync',
        sessionMode: 'per-execution',
        connectionStatus: 'reachable',
        lastTestedAt: '2026-03-19T10:00:00Z',
        lastInvokedAt: '2026-03-19T08:30:00Z',
        createdAt: '2026-03-01T12:00:00Z',
        updatedAt: '2026-03-15T14:00:00Z',
    },
    {
        id: 'ext-002',
        name: 'Langchain Research Agent',
        description: 'External research agent running on Langchain Serve',
        protocol: 'acp',
        endpointUrl: 'https://langchain-agent.acme.io/api/v1',
        authMode: 'apikey',
        acpAgentName: 'research-agent',
        executionMode: 'async_wait',
        sessionMode: 'per-workflow',
        connectionStatus: 'reachable',
        lastTestedAt: '2026-03-18T16:00:00Z',
        lastInvokedAt: '2026-03-18T14:22:00Z',
        createdAt: '2026-02-20T09:00:00Z',
        updatedAt: '2026-03-10T11:30:00Z',
    },
    {
        id: 'ext-003',
        name: 'AutoGen Task Planner',
        description: 'Microsoft AutoGen multi-agent orchestrator via A2A',
        protocol: 'a2a',
        endpointUrl: 'https://autogen.contoso.com/a2a',
        authMode: 'oauth',
        agentCardUrl: 'https://autogen.contoso.com/.well-known/agent.json',
        executionMode: 'async_wait',
        sessionMode: 'single',
        connectionStatus: 'auth_error',
        lastTestedAt: '2026-03-17T09:00:00Z',
        createdAt: '2026-03-05T08:00:00Z',
        updatedAt: '2026-03-17T09:00:00Z',
    },
    {
        id: 'ext-004',
        name: 'Internal Compliance Checker',
        description: 'Internal compliance validation agent (no auth, dev only)',
        protocol: 'acp',
        endpointUrl: 'http://compliance-agent.internal:8080',
        authMode: 'none',
        acpAgentName: 'compliance-checker',
        executionMode: 'sync',
        sessionMode: 'per-execution',
        connectionStatus: 'unreachable',
        lastTestedAt: '2026-03-16T11:00:00Z',
        createdAt: '2026-03-10T15:00:00Z',
        updatedAt: '2026-03-16T11:00:00Z',
    },
];

const ConnectionStatusBadge = ({ status }: { status: ExternalAgentConnectionStatus }) => {
    const config: Record<ExternalAgentConnectionStatus, { label: string; className: string; icon: React.ReactNode }> = {
        reachable: { label: 'Reachable', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <Wifi className="h-3 w-3" /> },
        unreachable: { label: 'Unreachable', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <WifiOff className="h-3 w-3" /> },
        auth_error: { label: 'Auth Error', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertTriangle className="h-3 w-3" /> },
        unknown: { label: 'Unknown', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: <Globe className="h-3 w-3" /> },
    };
    const c = config[status];
    return (
        <Badge className={cn('flex items-center gap-x-1 text-[10px] font-medium px-2 py-0.5 rounded-full', c.className)}>
            {c.icon}
            {c.label}
        </Badge>
    );
};

const DeleteRecord = ({ row, onDelete }: { row: Row<ExternalAgentDefinition>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="cursor-pointer" variant="link" size="icon" onClick={() => setOpen(true)}>
                            <Trash2 size={18} className="text-gray-500 dark:text-gray-200" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Delete</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete &quot;{row.original.name}&quot;?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>No</Button>
                        <Button variant="destructive" size="sm" onClick={() => { onDelete(row.original.id); setOpen(false); }}>Yes, Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const ExternalAgentTab = () => {
    const [agents, setAgents] = useState<ExternalAgentDefinition[]>(MOCK_EXTERNAL_AGENTS);
    const [search, setSearch] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editAgent, setEditAgent] = useState<ExternalAgentDefinition | undefined>();
    const [viewAgent, setViewAgent] = useState<ExternalAgentDefinition | undefined>();

    const filtered = useMemo(() => {
        if (!search) return agents;
        const lower = search.toLowerCase();
        return agents.filter(a => a.name.toLowerCase().includes(lower) || a.description.toLowerCase().includes(lower));
    }, [agents, search]);

    const handleDelete = (id: string) => {
        setAgents(prev => prev.filter(a => a.id !== id));
    };

    const columns: ColumnDef<ExternalAgentDefinition>[] = useMemo(() => [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Name</div>;
            },
            cell: ({ row }) => (
                <div className="flex flex-col gap-y-0.5">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{row.original.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{row.original.description}</span>
                </div>
            ),
        },
        {
            accessorKey: 'protocol',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Protocol</div>;
            },
            cell: ({ row }) => (
                <Badge className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded',
                    row.original.protocol === 'a2a' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                    {row.original.protocol.toUpperCase()}
                </Badge>
            ),
        },
        {
            accessorKey: 'authMode',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Auth</div>;
            },
            cell: ({ row }) => <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{row.original.authMode === 'apikey' ? 'API Key' : row.original.authMode === 'oauth' ? 'OAuth 2.0' : row.original.authMode}</span>,
        },
        {
            accessorKey: 'executionMode',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Execution</div>;
            },
            cell: ({ row }) => {
                const labels: Record<string, string> = { sync: 'Sync (SSE)', async_wait: 'Async Wait', async_fire_forget: 'Fire & Forget' };
                return <span className="text-xs text-gray-600 dark:text-gray-300">{labels[row.original.executionMode]}</span>;
            },
        },
        {
            accessorKey: 'actions',
            enableSorting: false,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-x-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="link" size="icon" onClick={() => setViewAgent(row.original)}>
                                    <Eye size={16} className="text-gray-500 dark:text-gray-200" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">View</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="link" size="icon" onClick={() => { setEditAgent(row.original); setShowCreateDialog(true); }}>
                                    <Pencil size={16} className="text-gray-500 dark:text-gray-200" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Edit</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <DeleteRecord row={row} onDelete={handleDelete} />
                </div>
            ),
        },
    ], []);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={filtered}
                showTableSearch={false}
                showFooter
                manualSpan={true}
                defaultPageSize={10}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            placeholder="Search External Agent"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size="sm" onClick={() => { setEditAgent(undefined); setShowCreateDialog(true); }}>
                                <Plus className="h-4 w-4 mr-1" />
                                New External Agent
                            </Button>
                        </div>
                    </div>
                }
            />
            <ExternalAgentFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                agent={editAgent}
                onSave={(agent) => {
                    if (editAgent) {
                        setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
                    } else {
                        setAgents(prev => [...prev, agent]);
                    }
                    setShowCreateDialog(false);
                    setEditAgent(undefined);
                }}
            />
            {/* View Agent Detail Dialog */}
            <Dialog open={!!viewAgent} onOpenChange={(open) => { if (!open) setViewAgent(undefined); }}>
                <DialogContent className="max-w-lg !gap-0">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{viewAgent?.name}</span>
                                {viewAgent && (
                                    <Badge className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded',
                                        viewAgent.protocol === 'a2a' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    )}>
                                        {viewAgent.protocol.toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    {viewAgent && (
                        <DialogBody className="py-4 flex flex-col gap-y-4">
                            {viewAgent.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{viewAgent.description}</p>
                            )}

                            {/* Connection & Status */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ConnectionStatusBadge status={viewAgent.connectionStatus} />
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                                    {viewAgent.lastTestedAt && (
                                        <span>Tested: {new Date(viewAgent.lastTestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    )}
                                    {viewAgent.lastInvokedAt && (
                                        <span>Invoked: {new Date(viewAgent.lastInvokedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    )}
                                </div>
                            </div>

                            {/* Configuration Grid */}
                            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                                {[
                                    { label: 'Authentication', value: viewAgent.authMode === 'apikey' ? 'API Key' : viewAgent.authMode === 'oauth' ? 'OAuth 2.0' : viewAgent.authMode === 'jwt' ? 'JWT' : viewAgent.authMode.charAt(0).toUpperCase() + viewAgent.authMode.slice(1) },
                                    { label: 'Execution Mode', value: { sync: 'Sync (SSE)', async_wait: 'Async Wait', async_fire_forget: 'Fire & Forget' }[viewAgent.executionMode] },
                                    { label: 'Session Mode', value: viewAgent.sessionMode.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
                                ].map(item => (
                                    <div key={item.label} className="flex flex-col gap-y-0.5">
                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{item.label}</span>
                                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Endpoint Details */}
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                <div className="p-3">
                                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Endpoint URL</span>
                                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all select-all">{viewAgent.endpointUrl}</p>
                                </div>
                                {viewAgent.agentCardUrl && (
                                    <div className="p-3">
                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Agent Card URL</span>
                                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all select-all">{viewAgent.agentCardUrl}</p>
                                    </div>
                                )}
                                {viewAgent.acpAgentName && (
                                    <div className="p-3">
                                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">ACP Agent Name</span>
                                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1">{viewAgent.acpAgentName}</p>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                                <div>
                                    <span className="uppercase tracking-wide text-[10px] font-medium">Created</span>
                                    <p className="text-gray-600 dark:text-gray-400 mt-0.5">{new Date(viewAgent.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <span className="uppercase tracking-wide text-[10px] font-medium">Last Updated</span>
                                    <p className="text-gray-600 dark:text-gray-400 mt-0.5">{new Date(viewAgent.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-1">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        const agent = viewAgent;
                                        setViewAgent(undefined);
                                        setEditAgent(agent);
                                        setShowCreateDialog(true);
                                    }}
                                    leadingIcon={<Pencil className="h-3.5 w-3.5" />}
                                >
                                    Edit
                                </Button>
                            </div>
                        </DialogBody>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
