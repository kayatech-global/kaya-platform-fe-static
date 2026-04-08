'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Rocket, RefreshCw, MoreHorizontal, Check, Loader2, AlertCircle, Package, Server, Shield, Zap } from 'lucide-react';
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

// Deployment steps
interface DeploymentStep {
    id: string;
    label: string;
    description: string;
    icon: typeof Package;
    status: 'pending' | 'in-progress' | 'completed' | 'error';
}

const initialDeploymentSteps: DeploymentStep[] = [
    { id: 'validate', label: 'Validating Configuration', description: 'Checking agent configuration and dependencies', icon: Shield, status: 'pending' },
    { id: 'build', label: 'Building Agent Package', description: 'Packaging agent with runtime and dependencies', icon: Package, status: 'pending' },
    { id: 'provision', label: 'Provisioning Resources', description: 'Setting up compute and networking resources', icon: Server, status: 'pending' },
    { id: 'deploy', label: 'Deploying Agent', description: 'Deploying agent to A2A endpoint', icon: Rocket, status: 'pending' },
    { id: 'verify', label: 'Verifying Deployment', description: 'Running health checks and verification', icon: Zap, status: 'pending' },
];

const DeleteRecord = ({ row, onDelete }: { row: Row<AgentData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                disabled={row.original.isReadOnly}
                className="text-red-600 dark:text-red-400"
            >
                <Trash2 size={16} className="mr-2" />
                Delete
            </DropdownMenuItem>
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

// Deployment Progress Dialog
const DeploymentProgressDialog = ({
    open,
    onOpenChange,
    agentName,
    isRedeployment,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agentName: string;
    isRedeployment: boolean;
}) => {
    const [steps, setSteps] = useState<DeploymentStep[]>(initialDeploymentSteps);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Simulate deployment progress
    useEffect(() => {
        if (!open) {
            // Reset when dialog closes
            setSteps(initialDeploymentSteps);
            setCurrentStepIndex(0);
            setIsComplete(false);
            setHasError(false);
            return;
        }

        const progressStep = () => {
            setSteps(prev => prev.map((step, idx) => {
                if (idx < currentStepIndex) return { ...step, status: 'completed' as const };
                if (idx === currentStepIndex) return { ...step, status: 'in-progress' as const };
                return { ...step, status: 'pending' as const };
            }));
        };

        progressStep();

        const timer = setTimeout(() => {
            if (currentStepIndex < steps.length - 1) {
                setSteps(prev => prev.map((step, idx) => 
                    idx === currentStepIndex ? { ...step, status: 'completed' as const } : step
                ));
                setCurrentStepIndex(prev => prev + 1);
            } else if (currentStepIndex === steps.length - 1) {
                setSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })));
                setIsComplete(true);
            }
        }, 1500 + Math.random() * 1000);

        return () => clearTimeout(timer);
    }, [open, currentStepIndex, steps.length]);

    const getStepIcon = (step: DeploymentStep) => {
        const Icon = step.icon;
        switch (step.status) {
            case 'completed':
                return <Check size={16} className="text-green-500" />;
            case 'in-progress':
                return <Loader2 size={16} className="text-blue-500 animate-spin" />;
            case 'error':
                return <AlertCircle size={16} className="text-red-500" />;
            default:
                return <Icon size={16} className="text-gray-400" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2">
                        {isComplete ? (
                            <Check size={20} className="text-green-500" />
                        ) : (
                            <Loader2 size={20} className="text-blue-500 animate-spin" />
                        )}
                        <span>{isRedeployment ? 'Re-deploying' : 'Deploying'} {agentName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-3">
                        {steps.map((step, idx) => (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-start gap-x-3 p-3 rounded-lg transition-colors",
                                    step.status === 'in-progress' && "bg-blue-50 dark:bg-blue-900/20",
                                    step.status === 'completed' && "bg-green-50 dark:bg-green-900/10",
                                    step.status === 'pending' && "opacity-50"
                                )}
                            >
                                <div className="mt-0.5">
                                    {getStepIcon(step)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        step.status === 'completed' && "text-green-700 dark:text-green-400",
                                        step.status === 'in-progress' && "text-blue-700 dark:text-blue-400",
                                        step.status === 'pending' && "text-gray-500 dark:text-gray-400"
                                    )}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Deployment Progress</span>
                            <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-500 rounded-full",
                                    hasError ? "bg-red-500" : "bg-green-500"
                                )}
                                style={{ width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Completion Message */}
                    {isComplete && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                                Deployment Successful
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                Your agent is now live and accessible via the A2A endpoint.
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant={isComplete ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        {isComplete ? 'Done' : 'Cancel'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
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
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [progressOpen, setProgressOpen] = useState<boolean>(false);
    const isDeployed = row.original.publishStatus?.isPublished;

    const handleDeploy = () => {
        setConfirmOpen(false);
        setProgressOpen(true);
        onDeploy(row.original.id);
    };

    return (
        <>
            <DropdownMenuItem
                onClick={(e) => {
                    e.preventDefault();
                    setConfirmOpen(true);
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

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
                            <Button variant={'secondary'} size="sm" onClick={() => setConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant={'primary'} 
                                size="sm" 
                                onClick={handleDeploy}
                                disabled={isDeploying}
                            >
                                {isDeployed ? 'Re-Deploy' : 'Deploy'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Progress Dialog */}
            <DeploymentProgressDialog
                open={progressOpen}
                onOpenChange={setProgressOpen}
                agentName={row.original.agentName}
                isRedeployment={!!isDeployed}
            />
        </>
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
                    <div className="flex items-center justify-end gap-x-2">
                        {/* Action Dropdown - Order: Deploy/Re-Deploy, Edit, Delete */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-200" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                {/* Deploy/Re-Deploy - Only for Horizon Agents */}
                                {isHorizon && onDeploy && (
                                    <>
                                        <DeployDialog 
                                            row={row} 
                                            onDeploy={onDeploy} 
                                            isDeploying={isDeploying}
                                        />
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                
                                {/* Edit */}
                                <DropdownMenuItem
                                    onClick={() => onEditButtonClick(row.getValue('id'))}
                                >
                                    <Pencil size={16} className="mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Delete */}
                                <DeleteRecord row={row} onDelete={onDelete} />
                            </DropdownMenuContent>
                        </DropdownMenu>
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
