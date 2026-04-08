'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, Rocket, RefreshCw, MoreHorizontal, Check, Loader2, AlertCircle, Package, Server, Shield, Zap } from 'lucide-react';
import { Button, Input, Badge } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/atoms/dialog';
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30">
                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                            </div>
                            <span>Delete Agent</span>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <div className="py-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{row.original.agentName}&quot;</span>?
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                                This action cannot be undone. All configurations and deployment history will be permanently removed.
                            </p>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Agent
                        </Button>
                    </DialogFooter>
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2">
                        {isComplete ? (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Check size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <Loader2 size={16} className="text-blue-600 dark:text-blue-400 animate-spin" />
                            </div>
                        )}
                        <div>
                            <span className="block">{isRedeployment ? 'Re-deploying' : 'Deploying'} Agent</span>
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{agentName}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="py-2">
                        {/* Progress Steps */}
                        <div className="space-y-2">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex items-start gap-x-3 p-3 rounded-lg border transition-all",
                                        step.status === 'in-progress' && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                                        step.status === 'completed' && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
                                        step.status === 'pending' && "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60",
                                        step.status === 'error' && "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                    )}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getStepIcon(step)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            step.status === 'completed' && "text-green-700 dark:text-green-400",
                                            step.status === 'in-progress' && "text-blue-700 dark:text-blue-400",
                                            step.status === 'pending' && "text-gray-500 dark:text-gray-400",
                                            step.status === 'error' && "text-red-700 dark:text-red-400"
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
                        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Deployment Progress</span>
                                <span className={cn(
                                    "font-semibold",
                                    isComplete ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                                )}>
                                    {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full transition-all duration-500 rounded-full",
                                        hasError ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-blue-500"
                                    )}
                                    style={{ width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Completion Message */}
                        {isComplete && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-x-3">
                                    <Check size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                                            Deployment Successful
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                                            Your agent is now live and accessible via the A2A endpoint.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant={isComplete ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => onOpenChange(false)}
                    >
                        {isComplete ? 'Done' : 'Cancel'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Action Cell - Contains dropdown and dialogs with proper state management
const ActionCell = ({ 
    row,
    onEditButtonClick,
    onDelete,
    onDeploy,
    isDeploying,
}: { 
    row: Row<AgentData>;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onDeploy?: (id: string) => void;
    isDeploying?: boolean;
}) => {
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [progressOpen, setProgressOpen] = useState<boolean>(false);
    
    const isHorizon = row.original.agentCategory === AgentCategory.HORIZON;
    const isDeployed = row.original.publishStatus?.isPublished;

    const handleConfirmDeploy = () => {
        setConfirmOpen(false);
        setProgressOpen(true);
        if (onDeploy) {
            onDeploy(row.original.id);
        }
    };

    return (
        <>
            <div className="flex items-center justify-end gap-x-2">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        {/* Deploy/Re-Deploy - Only for Horizon Agents */}
                        {isHorizon && onDeploy && (
                            <>
                                <DropdownMenuItem 
                                    onSelect={(e) => {
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
                                <DropdownMenuSeparator />
                            </>
                        )}
                        
                        {/* Edit */}
                        <DropdownMenuItem onClick={() => onEditButtonClick(row.getValue('id'))}>
                            <Pencil size={16} className="mr-2" />
                            Edit
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Delete */}
                        <DeleteRecord row={row} onDelete={onDelete} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Confirmation Dialog - Rendered outside dropdown */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                {isDeployed ? (
                                    <RefreshCw size={16} className="text-blue-600 dark:text-blue-400" />
                                ) : (
                                    <Rocket size={16} className="text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <span>{isDeployed ? 'Re-deploy Agent' : 'Deploy Agent'}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <div className="py-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isDeployed 
                                    ? <>You are about to re-deploy <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{row.original.agentName}&quot;</span> with the latest configuration changes.</>
                                    : <>You are about to deploy <span className="font-semibold text-gray-900 dark:text-gray-100">&quot;{row.original.agentName}&quot;</span> to the workspace-scoped agents endpoint.</>
                                }
                            </p>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    {isDeployed 
                                        ? 'The agent will be updated in-place. Existing integrations will continue to work with the new configuration.'
                                        : 'Once deployed, the agent will be accessible via A2A protocol and can be called by other agents in the workspace.'
                                    }
                                </p>
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleConfirmDeploy}
                            disabled={isDeploying}
                        >
                            {isDeployed ? 'Re-Deploy Agent' : 'Deploy Agent'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Progress Dialog - Rendered outside dropdown */}
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
                return (
                    <ActionCell
                        row={row}
                        onEditButtonClick={onEditButtonClick}
                        onDelete={onDelete}
                        onDeploy={onDeploy}
                        isDeploying={isDeploying}
                    />
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
