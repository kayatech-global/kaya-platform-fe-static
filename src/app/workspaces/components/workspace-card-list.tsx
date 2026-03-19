import React, { useState, useCallback } from 'react';
import { InfoIcon } from 'lucide-react';
import { Button, TruncateCell } from '@/components';
import WorkspaceCard, { WorkspaceCardProps, GovernanceBadge } from '@/components/molecules/workspace-card/workspace-card';
import { cn, isNullOrEmpty } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useAuth } from '@/context';
import { RoleType } from '@/enums';
import { IGroupWorkspace, IOption } from '@/models';
import { ResourceQuotasDialog } from './governance-dialogs';

// Total available credits (mock - in production this would come from an API)
const TOTAL_AVAILABLE_CREDITS = 100000;

// Mock utilized credits per workspace (in production this would come from API)
function getUtilizedCredits(workspaceId: string): number {
    const hash = String(workspaceId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash * 13) % 3000;
}

// Mock governance badges based on workspace - in production this would come from API
function getGovernanceBadges(workspaceId: number | string, workspaceName: string | undefined): GovernanceBadge[] {
    const badges: GovernanceBadge[] = [];
    
    // Safely handle undefined/null workspaceName
    const safeName = typeof workspaceName === 'string' ? workspaceName.toLowerCase() : '';
    
    if (safeName.includes('alpha') || safeName.includes('dev')) {
        badges.push({ label: 'Dev', variant: 'dev' });
    } else if (safeName.includes('beta') || safeName.includes('staging')) {
        badges.push({ label: 'Staging', variant: 'staging' });
    } else {
        badges.push({ label: 'Production', variant: 'production' });
    }

    const idNum = typeof workspaceId === 'number' ? workspaceId : parseInt(String(workspaceId), 10) || 0;
    const quotaPercentage = (idNum * 17) % 100;
    if (quotaPercentage > 70) {
        badges.push({ label: `Quotas: ${quotaPercentage}%`, variant: 'quota' });
    }

    if ((idNum % 3) !== 0) {
        badges.push({ label: 'Compliant', variant: 'compliant' });
    } else {
        badges.push({ label: 'Review Required', variant: 'warning' });
    }

    return badges;
}

export interface WorkspaceCardListProps {
    metadataOption: IOption | null;
    data: IGroupWorkspace[] | WorkspaceCardProps[];
    isFetching: boolean;
    isSuccess: boolean;
    page: number;
    totalPages: number;
    hasFilters: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onHandleEdit: (workspaceId: number | string) => void;
    onHandleDelete: (workspaceId: number | string) => void;
}

function EmptyWorkspace() {
    return (
        <div
            className="flex w-full items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            role="alert"
        >
            <InfoIcon className="shrink-0 inline w-4 h-4 me-3" />
            <div className="text-center">
                {"We couldn't find any workspaces matching your search. Try a different name or clear your filters to see all results"}
            </div>
        </div>
    );
}

function NoAccessMessage() {
    return (
        <div
            className="flex w-full items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            role="alert"
        >
            <InfoIcon className="shrink-0 inline w-4 h-4 me-3" />
            <div className="text-center">
                Sorry, you have not been assigned any workspace on KAYA AI Platform. Please contact your admin for access
            </div>
        </div>
    );
}

interface WorkspaceCardGridProps {
    data: WorkspaceCardProps[];
    isSuccess: boolean;
    hasFilters?: boolean;
    cardWidth?: string;
    onHandleEdit: (workspaceId: number | string) => void;
    onHandleDelete: (workspaceId: number | string) => void;
    onOpenCreditBudgetDialog: (workspaceId: string | number, workspaceName?: string) => void;
    workspaceBudgets: Record<string, number>;
}

function WorkspaceCardGrid({
    data,
    isSuccess,
    hasFilters,
    cardWidth,
    onHandleEdit,
    onHandleDelete,
    onOpenCreditBudgetDialog,
    workspaceBudgets,
}: WorkspaceCardGridProps) {
    const { user, isSuperAdmin } = useAuth();
    const workspaces = user?.user?.workspaces;

    if (!data || data.length === 0) {
        if (!isSuccess) {
            return null;
        }
        if (hasFilters) {
            return <EmptyWorkspace />;
        }
        return <NoAccessMessage />;
    }

    const renderedCards: React.ReactNode[] = [];

    for (let i = 0; i < data.length; i++) {
        const workspace = data[i];
        const wsUuid = String(workspace.uuid || '');
        const wsId = String(workspace.id || '');
        
        const isWorkspaceAdmin = workspaces?.some(
            (ws) => ws.id === workspace.id && ws.roles.includes(RoleType.WORKSPACE_ADMIN)
        );

        const governanceBadges = getGovernanceBadges(workspace.id, workspace.name);
        const allocatedBudget = workspaceBudgets[wsUuid] || 0;
        const utilizedCredits = allocatedBudget > 0 ? getUtilizedCredits(wsUuid) : 0;
        const remainingBudget = allocatedBudget - utilizedCredits;

        renderedCards.push(
            <WorkspaceCard
                key={`card-${wsUuid || wsId}-${i}`}
                id={workspace.id}
                uuid={workspace.uuid}
                name={workspace.name}
                description={workspace.description}
                metadata={workspace.metadata}
                createdAt={workspace.createdAt}
                avatars={workspace.avatars}
                showOptions={isSuperAdmin || isWorkspaceAdmin}
                cardWidth={cardWidth}
                governanceBadges={governanceBadges}
                allocatedBudget={allocatedBudget}
                remainingBudget={allocatedBudget > 0 ? remainingBudget : undefined}
                onDeleteClick={onHandleDelete}
                onEditClick={onHandleEdit}
                onAllocateCreditBudget={(id) => onOpenCreditBudgetDialog(id, workspace.name)}
            />
        );
    }

    return <>{renderedCards}</>;
}

function WorkspaceCardList({
    metadataOption,
    data,
    isFetching,
    page,
    totalPages,
    isSuccess,
    hasFilters,
    onNext,
    onPrevious,
    onHandleEdit,
    onHandleDelete,
}: WorkspaceCardListProps) {
    const [workspaceId, setWorkspaceId] = useState<number | string | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);
    
    const [creditBudgetDialogOpen, setCreditBudgetDialogOpen] = useState(false);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | number>('');
    const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string>('');
    const [workspaceBudgets, setWorkspaceBudgets] = useState<Record<string, number>>({});

    const onDeleteClick = (id: number | string) => {
        setWorkspaceId(id);
        setOpen(true);
    };

    const handleDelete = () => {
        setOpen(false);
        onHandleDelete(workspaceId as number | string);
        setWorkspaceId(undefined);
    };

    const openCreditBudgetDialog = useCallback((wsId: string | number, wsName?: string) => {
        setSelectedWorkspaceId(wsId);
        setSelectedWorkspaceName(wsName || '');
        setCreditBudgetDialogOpen(true);
    }, []);

    const closeCreditBudgetDialog = useCallback(() => {
        setCreditBudgetDialogOpen(false);
        setSelectedWorkspaceId('');
        setSelectedWorkspaceName('');
    }, []);

    const handleSaveBudget = useCallback((wsId: string | number, allocatedBudget: number) => {
        setWorkspaceBudgets((prev) => ({
            ...prev,
            [String(wsId)]: allocatedBudget,
        }));
    }, []);

    const totalAllocated = Object.values(workspaceBudgets).reduce((sum, val) => sum + val, 0);
    const remainingCredits = TOTAL_AVAILABLE_CREDITS - totalAllocated;

    return (
        <div className="bg-white rounded-b-lg dark:bg-[#1F2937] flex flex-col border border-gray-200 shadow-sm dark:border-gray-800 overflow-hidden overflow-y-auto">
            <div
                className={cn('gap-x-4 gap-y-5 px-4 py-4', {
                    'flex flex-wrap': data?.length === 0 || isNullOrEmpty(metadataOption?.value) || isFetching,
                    'grid grid-cols-3': data?.length > 0 && isNullOrEmpty(metadataOption?.value),
                    'flex flex-col': data?.length > 0 && !isNullOrEmpty(metadataOption?.value) && !isFetching,
                })}
            >
                {isFetching ? (
                    <>
                        {[0, 1, 2].map((item) => (
                            <div
                                key={`skeleton-${item}`}
                                className={cn(
                                    'realm-card !w-[300px] min-h-[180px] h-fit bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                                    'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                    'animate-pulse'
                                )}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {isNullOrEmpty(metadataOption?.value) ? (
                            <WorkspaceCardGrid
                                data={data as WorkspaceCardProps[]}
                                isSuccess={isSuccess}
                                hasFilters={hasFilters}
                                onHandleDelete={onDeleteClick}
                                onHandleEdit={onHandleEdit}
                                onOpenCreditBudgetDialog={openCreditBudgetDialog}
                                workspaceBudgets={workspaceBudgets}
                            />
                        ) : (
                            <>
                                {(data as IGroupWorkspace[])?.length > 0 ? (
                                    (data as IGroupWorkspace[])?.map((item, index) => (
                                        <div key={`group-${item.metadataValue || index}`}>
                                            <TruncateCell
                                                length={90}
                                                value={item.metadataValue}
                                                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4"
                                            />
                                            <div className="grid grid-cols-3 gap-x-4 gap-y-5 p-4 rounded-lg bg-gray-100 dark:bg-gray-900">
                                                <WorkspaceCardGrid
                                                    data={item.workspaces}
                                                    isSuccess={isSuccess}
                                                    cardWidth="!w-[290px]"
                                                    onHandleDelete={onDeleteClick}
                                                    onHandleEdit={onHandleEdit}
                                                    onOpenCreditBudgetDialog={openCreditBudgetDialog}
                                                    workspaceBudgets={workspaceBudgets}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyWorkspace />
                                )}
                            </>
                        )}

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

                        <ResourceQuotasDialog
                            open={creditBudgetDialogOpen}
                            onOpenChange={(isOpen) => !isOpen && closeCreditBudgetDialog()}
                            workspaceId={selectedWorkspaceId}
                            workspaceName={selectedWorkspaceName}
                            totalAvailableCredits={remainingCredits + (workspaceBudgets[String(selectedWorkspaceId)] || 0)}
                            currentAllocatedBudget={workspaceBudgets[String(selectedWorkspaceId)] || 0}
                            onSave={handleSaveBudget}
                        />
                    </>
                )}
            </div>
            {isNullOrEmpty(metadataOption?.value) && (
                <div className="flex items-center justify-between bg-gray-100 border-t border-t-gray-300 px-6 pt-3 pb-4 rounded-b-lg dark:bg-gray-800 dark:border-t-gray-800 mt-auto">
                    <div className="flex items-center gap-x-3">
                        <Button variant="secondary" size="sm" disabled={1 >= page} onClick={onPrevious}>
                            Previous
                        </Button>
                        <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={onNext}>
                            Next
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600 font-medium dark:text-gray-300">{`Page ${page} of ${totalPages}`}</p>
                </div>
            )}
        </div>
    );
}

export default WorkspaceCardList;
