'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Badge } from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogBody } from '@/components/atoms/dialog';
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
    Clock,
    Activity,
    RotateCw,
    Rocket
} from 'lucide-react';
import { Runtime, RuntimeStatus } from '../types';

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideCloseButtonClass="hidden" className="gap-0 max-w-none w-[450px]">
                <DialogHeader className="px-4 py-4 flex flex-row gap-x-3 items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded">
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Delete Runtime
                    </p>
                </DialogHeader>
                <DialogBody className="px-4 py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        This action cannot be undone. The runtime configuration will be permanently removed.
                    </p>
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onConfirm}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

type DeploymentStep = {
    id: string;
    label: string;
    status: 'pending' | 'in-progress' | 'completed' | 'error';
};

const deploymentSteps: Omit<DeploymentStep, 'status'>[] = [
    { id: 'validate', label: 'Validating IAM permissions' },
    { id: 'ecr', label: 'Pulling container image from ECR' },
    { id: 'provision', label: 'Provisioning AgentCore runtime' },
    { id: 'configure', label: 'Applying runtime configuration' },
    { id: 'health', label: 'Running health checks' },
    { id: 'register', label: 'Registering runtime endpoint' },
];

const DeploymentProgressStep = ({ step, index }: { step: DeploymentStep; index: number }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    step.status === 'completed' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    step.status === 'in-progress' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    step.status === 'pending' && "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
                    step.status === 'error' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                )}>
                    {step.status === 'completed' ? (
                        <CheckCircle size={14} />
                    ) : step.status === 'in-progress' ? (
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'error' ? (
                        <AlertCircle size={14} />
                    ) : (
                        index + 1
                    )}
                </div>
                {index < deploymentSteps.length - 1 && (
                    <div className={cn(
                        "w-0.5 h-6 mt-1 transition-all",
                        step.status === 'completed' ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                )}
            </div>
            <div className="flex-1 pt-0.5">
                <p className={cn(
                    "text-sm font-medium transition-colors",
                    step.status === 'completed' && "text-green-600 dark:text-green-400",
                    step.status === 'in-progress' && "text-blue-600 dark:text-blue-400",
                    step.status === 'pending' && "text-gray-400 dark:text-gray-500",
                    step.status === 'error' && "text-red-600 dark:text-red-400"
                )}>
                    {step.label}
                </p>
            </div>
        </div>
    );
};

const DeployConfirmDialog = ({ 
    open, 
    onOpenChange, 
    runtime, 
    onConfirm,
    isRedeploy = false
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    runtime: Runtime; 
    onConfirm: () => void;
    isRedeploy?: boolean;
}) => {
    const [showProgress, setShowProgress] = useState(false);
    const [steps, setSteps] = useState<DeploymentStep[]>(
        deploymentSteps.map(s => ({ ...s, status: 'pending' as const }))
    );
    const [deploymentComplete, setDeploymentComplete] = useState(false);

    // Reset state when dialog closes
    React.useEffect(() => {
        if (!open) {
            setShowProgress(false);
            setDeploymentComplete(false);
            setSteps(deploymentSteps.map(s => ({ ...s, status: 'pending' as const })));
        }
    }, [open]);

    // Simulate deployment progress
    React.useEffect(() => {
        if (showProgress && !deploymentComplete) {
            let currentStep = 0;
            const interval = setInterval(() => {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    // Complete current step
                    if (currentStep > 0 && currentStep <= newSteps.length) {
                        newSteps[currentStep - 1].status = 'completed';
                    }
                    // Start next step
                    if (currentStep < newSteps.length) {
                        newSteps[currentStep].status = 'in-progress';
                    }
                    return newSteps;
                });
                
                currentStep++;
                
                if (currentStep > deploymentSteps.length) {
                    clearInterval(interval);
                    // Mark last step as completed
                    setSteps(prevSteps => {
                        const newSteps = [...prevSteps];
                        newSteps[newSteps.length - 1].status = 'completed';
                        return newSteps;
                    });
                    setDeploymentComplete(true);
                }
            }, 800);

            return () => clearInterval(interval);
        }
    }, [showProgress, deploymentComplete, onConfirm]);

    const handleStartDeploy = () => {
        setShowProgress(true);
    };

    const handleClose = () => {
        // Only allow closing via cancel button (before deployment starts)
        if (!showProgress) {
            onOpenChange(false);
        }
    };

    const handleDone = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent hideCloseButtonClass={showProgress ? "hidden" : "block"} className="gap-0 max-w-none w-[500px]">
                <DialogHeader className="px-4 py-4 flex flex-row gap-x-3 items-center">
                    <div className={cn(
                        "w-8 h-8 flex items-center justify-center rounded",
                        deploymentComplete 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-blue-100 dark:bg-blue-900/30"
                    )}>
                        {deploymentComplete ? (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        ) : (
                            <Rocket size={16} className="text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <p className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        {deploymentComplete 
                            ? 'Deployment Complete' 
                            : (isRedeploy ? 'Re-deploy Runtime' : 'Deploy Runtime')
                        }
                    </p>
                </DialogHeader>
                
                {!showProgress ? (
                    <>
                        <DialogBody className="px-4 py-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Are you sure you want to {isRedeploy ? 're-deploy' : 'deploy'} runtime <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{runtime.name}&quot;</span>?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                {isRedeploy 
                                    ? 'This will refresh the runtime connection and re-apply all configurations.'
                                    : 'This will initialize the runtime and make it available for workflow deployments.'
                                }
                            </p>
                        </DialogBody>
                        <DialogFooter>
                            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleStartDeploy}>
                                {isRedeploy ? 'Re-deploy' : 'Deploy'}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogBody className="px-4 py-6">
                            <div className={cn(
                                "mb-5 p-3 rounded-lg border",
                                deploymentComplete 
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium",
                                    deploymentComplete 
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-blue-700 dark:text-blue-300"
                                )}>
                                    {deploymentComplete 
                                        ? `Runtime "${runtime.name}" has been ${isRedeploy ? 're-deployed' : 'deployed'} successfully!`
                                        : `${isRedeploy ? 'Re-deploying' : 'Deploying'} runtime "${runtime.name}"...`
                                    }
                                </p>
                            </div>
                            <div className="space-y-1">
                                {steps.map((step, index) => (
                                    <DeploymentProgressStep key={step.id} step={step} index={index} />
                                ))}
                            </div>
                        </DialogBody>
                        <DialogFooter>
                            <Button 
                                variant={deploymentComplete ? "primary" : "secondary"} 
                                size="sm" 
                                onClick={handleDone}
                                disabled={!deploymentComplete}
                            >
                                {deploymentComplete ? 'Done' : 'Deploying...'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
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
            <DialogContent hideCloseButtonClass="block" className="gap-0 max-w-none w-[450px]">
                <DialogHeader className="px-4 py-4 flex flex-row gap-x-3 items-center">
                    <div className={cn(
                        "w-8 h-8 flex items-center justify-center rounded",
                        healthStatus === 'healthy' 
                            ? "bg-green-100 dark:bg-green-900/30"
                            : healthStatus === 'unhealthy'
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-blue-100 dark:bg-blue-900/30"
                    )}>
                        {healthStatus === 'healthy' ? (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        ) : healthStatus === 'unhealthy' ? (
                            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                        ) : (
                            <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <p className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        Health Check
                    </p>
                </DialogHeader>
                <DialogBody className="px-4 py-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Runtime
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {runtime.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {healthStatus === 'checking' && (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Checking...</span>
                                </>
                            )}
                            {healthStatus === 'healthy' && (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Healthy</span>
                                </>
                            )}
                            {healthStatus === 'unhealthy' && (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Unhealthy</span>
                                </>
                            )}
                            {healthStatus === 'idle' && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                            )}
                        </div>
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
                </DialogBody>
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
    const [isChecking, setIsChecking] = useState(false);

    const runtime = row.original;
    const isDeployed = runtime.status === 'Deployed';
    const isQueued = runtime.status === 'Queued';

    const handleDelete = () => {
        onDelete(runtime.id);
        setDeleteOpen(false);
    };

    const handleDeploy = () => {
        // The DeployConfirmDialog now handles the deployment progress
        // and calls this callback when complete
        if (isDeployed) {
            onRedeploy(runtime.id);
        } else {
            onDeploy(runtime.id);
        }
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
