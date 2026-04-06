'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Badge } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/atoms/dropdown-menu';
import DataTable from '@/components/molecules/table/data-table';
import { cn, convert_YYYY_MM_DD_HH_MM } from '@/lib/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { 
    Trash2, 
    Edit2,
    MoreHorizontal,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Server,
    Clock,
    Activity,
    RotateCw,
    Rocket
} from 'lucide-react';
import { Runtime, RuntimeStatus } from '../types';
import { renderIcon } from '@/lib/utils';

interface RuntimeTableProps {
    data: Runtime[];
    onNewClick: () => void;
    onEditClick: (id: string) => void;
    onDelete: (id: string) => void;
    onDeploy: (id: string) => void;
    onRedeploy: (id: string) => void;
    onHealthCheck: (id: string) => void;
    onFilter: (search: string) => void;
}

const StatusBadge = ({ status }: { status: RuntimeStatus }) => {
    const config = {
        Deployed: {
            variant: 'success' as const,
            icon: <CheckCircle size={12} className="mr-1" />,
        },
        Queued: {
            variant: 'warning' as const,
            icon: <Clock size={12} className="mr-1" />,
        },
        Error: {
            variant: 'destructive' as const,
            icon: <AlertCircle size={12} className="mr-1" />,
        },
    };

    const { variant, icon } = config[status];

    return (
        <Badge variant={variant} className="flex items-center w-fit">
            {icon}
            {status}
        </Badge>
    );
};

const DeleteConfirmDialog = ({ 
    open, 
    onOpenChange, 
    runtime, 
    onConfirm 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime; 
    onConfirm: () => void;
}) => {
    const deployedWorkflows = runtime.deployedWorkflows || [];
    const hasDeployedWorkflows = deployedWorkflows.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[80%] max-w-md gap-0">
                <DialogHeader className="px-0 pb-4">
                    <DialogTitle asChild>
                        <div className="px-4 flex items-center gap-x-2">
                            <div className="bg-red-100 flex items-center justify-center w-8 h-8 rounded dark:bg-red-900/30">
                                {renderIcon(<Trash2 />, 16, 'text-red-600 dark:text-red-400')}
                            </div>
                            <div className="text-md font-semibold text-gray-900 dark:text-gray-50">
                                Delete Runtime
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                    </p>
                    
                    {hasDeployedWorkflows ? (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Cannot delete runtime with active workflows
                                    </p>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 mb-3">
                                        The following workflows are deployed to this runtime. Please undeploy them first before deleting the runtime.
                                    </p>
                                    <div className="space-y-2">
                                        {deployedWorkflows.map((workflow) => (
                                            <div 
                                                key={workflow.id}
                                                className="flex items-center justify-between p-2 bg-amber-100 dark:bg-amber-900/30 rounded"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Server className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                        {workflow.name}
                                                    </span>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    v{workflow.version}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            This action cannot be undone. The runtime configuration will be permanently removed.
                        </p>
                    )}
                </div>
                <DialogFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onConfirm}
                        disabled={hasDeployedWorkflows}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DeployConfirmDialog = ({ 
    open, 
    onOpenChange, 
    runtime, 
    onConfirm,
    isDeploying,
    isRedeploy = false
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime; 
    onConfirm: () => void;
    isDeploying: boolean;
    isRedeploy?: boolean;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[80%] max-w-md">
                <DialogHeader>
                    <DialogTitle>{isRedeploy ? 'Re-deploy Runtime' : 'Deploy Runtime'}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to {isRedeploy ? 're-deploy' : 'deploy'} runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {isRedeploy 
                            ? 'This will refresh the runtime connection and re-apply all configurations.'
                            : 'This will initialize the runtime and make it available for workflow deployments.'
                        }
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)} disabled={isDeploying}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={onConfirm} loading={isDeploying}>
                        {isDeploying ? (isRedeploy ? 'Re-deploying...' : 'Deploying...') : (isRedeploy ? 'Re-deploy' : 'Deploy')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const HealthCheckDialog = ({ 
    open, 
    onOpenChange, 
    runtime,
    isChecking
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime;
    isChecking: boolean;
}) => {
    const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'healthy' | 'unhealthy'>('idle');

    React.useEffect(() => {
        if (open && isChecking) {
            setHealthStatus('checking');
            // Simulate health check
            setTimeout(() => {
                setHealthStatus(runtime.status === 'Error' ? 'unhealthy' : 'healthy');
            }, 2000);
        } else if (!open) {
            setHealthStatus('idle');
        }
    }, [open, isChecking, runtime.status]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-h-[80%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Health Check - {runtime.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Runtime Status
                            </span>
                        </div>
                        {healthStatus === 'checking' && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-blue-600">Checking...</span>
                            </div>
                        )}
                        {healthStatus === 'healthy' && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Healthy</span>
                            </div>
                        )}
                        {healthStatus === 'unhealthy' && (
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-600">Unhealthy</span>
                            </div>
                        )}
                        {healthStatus === 'idle' && (
                            <span className="text-sm text-gray-500">-</span>
                        )}
                    </div>

                    {healthStatus === 'healthy' && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Runtime is healthy and responding to requests. All systems operational.
                            </p>
                        </div>
                    )}

                    {healthStatus === 'unhealthy' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Runtime is not responding. Please check your configuration and try re-deploying.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ActionCell = ({ 
    row, 
    onEditClick, 
    onDelete,
    onDeploy,
    onRedeploy,
    onHealthCheck
}: { 
    row: Row<Runtime>; 
    onEditClick: (id: string) => void;
    onDelete: (id: string) => void;
    onDeploy: (id: string) => void;
    onRedeploy: (id: string) => void;
    onHealthCheck: (id: string) => void;
}) => {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deployOpen, setDeployOpen] = useState(false);
    const [healthCheckOpen, setHealthCheckOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const runtime = row.original;
    const isDeployed = runtime.status === 'Deployed';
    const isQueued = runtime.status === 'Queued';

    const handleDelete = () => {
        onDelete(runtime.id);
        setDeleteOpen(false);
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isDeployed) {
            onRedeploy(runtime.id);
        } else {
            onDeploy(runtime.id);
        }
        setIsDeploying(false);
        setDeployOpen(false);
    };

    const handleHealthCheck = () => {
        setIsChecking(true);
        onHealthCheck(runtime.id);
        setHealthCheckOpen(true);
    };

    return (
        <>
            <div className="flex items-center justify-center gap-x-1">
                {/* Deploy or Re-deploy button based on status */}
                {isQueued && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        leadingIcon={<Rocket size={14} />}
                        onClick={() => setDeployOpen(true)}
                    >
                        Deploy
                    </Button>
                )}
                {isDeployed && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        leadingIcon={<RotateCw size={14} />}
                        onClick={() => setDeployOpen(true)}
                    >
                        Re-deploy
                    </Button>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal size={16} className="text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleHealthCheck}>
                            <Activity size={14} className="mr-2" />
                            Health Check
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEditClick(runtime.id)}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => setDeleteOpen(true)}
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <DeleteConfirmDialog 
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                runtime={runtime}
                onConfirm={handleDelete}
            />

            <DeployConfirmDialog
                open={deployOpen}
                onOpenChange={setDeployOpen}
                runtime={runtime}
                onConfirm={handleDeploy}
                isDeploying={isDeploying}
                isRedeploy={isDeployed}
            />

            <HealthCheckDialog
                open={healthCheckOpen}
                onOpenChange={setHealthCheckOpen}
                runtime={runtime}
                isChecking={isChecking}
            />
        </>
    );
};

const generateColumns = (
    onEditClick: (id: string) => void,
    onDelete: (id: string) => void,
    onDeploy: (id: string) => void,
    onRedeploy: (id: string) => void,
    onHealthCheck: (id: string) => void
): ColumnDef<Runtime>[] => [
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Runtime Name</div>,
        accessorKey: 'name',
        cell: ({ row }) => (
            <div 
                className="text-blue-600 cursor-pointer hover:underline font-medium"
                onClick={() => onEditClick(row.original.id)}
            >
                {row.getValue('name')}
            </div>
        ),
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Region</div>,
        accessorKey: 'region',
        cell: ({ row }) => (
            <div className="text-gray-700 dark:text-gray-300">{row.getValue('region')}</div>
        ),
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Status</div>,
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Created</div>,
        accessorKey: 'createdAt',
        cell: ({ row }) => (
            <div className="text-gray-600 dark:text-gray-400">
                {convert_YYYY_MM_DD_HH_MM(row.getValue('createdAt'))}
            </div>
        ),
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-center">Actions</div>,
        accessorKey: 'actions',
        cell: ({ row }) => (
            <ActionCell 
                row={row} 
                onEditClick={onEditClick} 
                onDelete={onDelete}
                onDeploy={onDeploy}
                onRedeploy={onRedeploy}
                onHealthCheck={onHealthCheck}
            />
        ),
    },
];

export const RuntimeTable = ({
    data,
    onNewClick,
    onEditClick,
    onDelete,
    onDeploy,
    onRedeploy,
    onHealthCheck,
    onFilter,
}: RuntimeTableProps) => {
    const { register, handleSubmit } = useForm<{ search: string }>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const onHandleSearch = (formData: { search: string }) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onFilter(formData.search);
        }, 500);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditClick, onDelete, onDeploy, onRedeploy, onHealthCheck);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={data}
                searchColumnName="name"
                showFooter
                defaultPageSize={10}
                showTableSearch={false}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-x-3">
                            <Input
                                {...register('search')}
                                placeholder="Search runtimes..."
                                className="w-[280px]"
                                onKeyUp={handleSubmit(onHandleSearch)}
                            />
                            <Button variant="secondary" size="sm">
                                Filter
                            </Button>
                        </div>
                        <Button size="sm" onClick={onNewClick}>
                            New Runtime
                        </Button>
                    </div>
                }
            />
        </div>
    );
};
