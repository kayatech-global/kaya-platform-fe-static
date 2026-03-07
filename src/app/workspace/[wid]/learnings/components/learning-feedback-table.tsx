/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {useState, useEffect} from 'react';
import {ColumnDef, Row} from '@tanstack/react-table';
import DataTable from '@/components/molecules/table/data-table';
import {Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TruncateCell} from '@/components';
import {
    CheckCircle2,
    Clock,
    Eye,
    Loader2,
    Trash2,
    XCircle,
    Link2
} from 'lucide-react';
import {IFeedbackLearning, IFeedbackLearningMetadata, ILearningAgent} from '@/models';
import {handleNoValue} from '@/lib/utils';
import {toast} from 'sonner';
import {LearningFeedbackEditForm} from './learning-feedback-edit-form';
import {FeedbackViewDialog} from './feedback-view-dialog';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import {useAuth} from "@/context";
import {useSearchParams} from 'next/navigation';

interface LearningFeedbackTableProps {
    agentRow: Row<ILearningAgent>;
    approveAsync: (params: {
        feedbackId: string;
        workflowVariables?: Record<string, any>;
        comment?: string;
    }) => Promise<any>;
    approvingFeedback: boolean;
    rejectAsync: (params: { feedbackId: string; comment?: string }) => Promise<any>;
    rejectingFeedback: boolean;
    deleteAsync: (feedbackId: string) => Promise<any>;
    deletingFeedback: boolean;
    updateAsync: (params: {
        feedbackId: string;
        data: {
            feedback: string;
            rationale?: string;
            metadata: IFeedbackLearningMetadata;
            mustLearn: boolean,
            approvalStatus: string;
            comment: string
        };
    }) => Promise<any>;
    updatingFeedback: boolean;
    unlinkAsync: (feedbackId: string) => Promise<any>;
    unlinkingFeedback: boolean;
}

interface GenerateFeedbackColumnsParams {
    onEdit: (feedback: IFeedbackLearning, shouldScrollToLinked?: boolean) => void;
    onDelete: (feedbackId: string) => void;
    onExpand: (feedback: IFeedbackLearning) => void;
    approvingFeedback: boolean;
    deletingFeedback: boolean;
    approvingId: string | null;
    deletingId: string | null;
    isWorkspaceAdmin: boolean;
}

const generateFeedbackColumns = (params: GenerateFeedbackColumnsParams): ColumnDef<IFeedbackLearning>[] => {
    const {
        onEdit,
        onDelete,
        onExpand,
        approvingFeedback,
        deletingFeedback,
        approvingId,
        deletingId,
        isWorkspaceAdmin,
    } = params;
    const columns: ColumnDef<IFeedbackLearning>[] = [
        {
            accessorKey: 'feedback',
            enableSorting: false,
            meta: {
                align: 'text-left',
                width: 250,
            },
            header() {
                return <div className="text-left">Feedback</div>;
            },
            cell({row}) {
                const groupItemsCount = row.original.groupItems?.length || 0;
                const isGrouped = groupItemsCount > 0;
                return (
                    <div className="flex items-start gap-2">
                        <div className="max-w-[250px] line-clamp-2 break-words flex-1" title={handleNoValue(row.getValue('feedback')) as string}>
                            <TruncateCell value={handleNoValue(row.getValue('feedback')) as string} length={50} />

                        </div>
                        {isGrouped && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-700 shadow-sm whitespace-nowrap border-2 border-purple-700 dark:border-purple-500 hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(row.original, true);
                                                }}
                                            >
                                            <Link2 className="h-4 w-4 dark:text-white font-bold"/>
                                            <span className="text-sm font-bold dark:text-white">
                                                {groupItemsCount}
                                            </span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-gray-900 text-white">
                                        <p className="font-medium">Grouped Feedback</p>
                                        <p className="text-xs">{groupItemsCount} linked item{groupItemsCount === 1 ? '' : 's'}</p>
                                        <p className="text-xs mt-1 text-gray-300">Click to view linked items</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'rationale',
            enableSorting: false,
            meta: {
                align: 'text-left',
                width: '500px',
            },
            header() {
                return <div className="text-left">Rationale</div>;
            },
            cell({row}) {
                return <div title={handleNoValue(row.getValue('rationale')) as string}><TruncateCell value={handleNoValue(row.getValue('rationale')) as string} length={50} /></div>;
            },
        },
        {
            accessorKey: 'metadata',
            enableSorting: false,
            meta: {
                align: 'text-left',
                width: 200,
            },
            header() {
                return <div className="text-left">Applicable Criteria / Tags</div>;
            },
            cell({row}) {
                const metadata = row.getValue('metadata') as IFeedbackLearningMetadata;
                return (
                    <div className="max-w-[200px] line-clamp-2 break-words font-mono text-xs">
                        <TruncateCell value={handleNoValue(JSON.stringify(metadata)) as string} length={50} />;
                    </div>
                );
            },
        },
        {
            accessorKey: 'feedbackStatus',
            enableSorting: false,
            meta: {
                align: 'text-center',
                width: 150,
            },
            header() {
                return <div className="text-center">Approval Status</div>;
            },
            cell({row}) {
                const status = row.getValue('feedbackStatus') as string;
                const getStatusDisplay = () => {
                    switch (status?.toLowerCase()) {
                        case 'authored':
                            return (
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-4 w-4"/>
                                    <span>Approved</span>
                                </div>
                            );
                        case 'declined':
                            return (
                                <div className="flex items-center justify-center gap-2 text-red-600">
                                    <XCircle className="h-4 w-4"/>
                                    <span>Rejected</span>
                                </div>
                            );
                        case 'pending':
                            return (
                                <div className="flex items-center justify-center gap-2 text-yellow-600">
                                    <Clock className="h-4 w-4"/>
                                    <span>Pending</span>
                                </div>
                            );
                        default:
                            return <div className="text-center">-</div>;
                    }
                };
                return getStatusDisplay();
            },
        },
        {
            id: 'approvedBy',
            enableSorting: false,
            meta: {
                align: 'text-left',
                width: 100,
            },
            header() {
                return <div className="text-left">Approved/Rejected By</div>;
            },
            cell({row}) {
                const feedback = row.original;
                const approvedBy = feedback.approvedBy;
                return <TruncateCell value={handleNoValue(approvedBy) as string} length={50} />;
            },
        }
    ];
    if (isWorkspaceAdmin) {
        columns.push(
            {
                id: 'actions',
                enableSorting: false,
                meta: {
                    align: 'text-right',
                    width: 150,
                    sticky: 'right',
                },
                header() {
                    return <div className="text-right pr-4">Actions</div>;
                },
                cell({row}) {
                    const feedbackId = row.original.id;
                    const isApproving = approvingFeedback && approvingId === feedbackId;
                    const isDeleting = deletingFeedback && deletingId === feedbackId;
                    return (
                        <div className="flex items-center justify-center gap-2 pr-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8"
                                onClick={() => onEdit(row.original)}
                                disabled={isDeleting || isApproving || row.original.feedbackStatus?.toLowerCase() !== 'pending' || row.original.isReadOnly || !row.original.canAuthor}
                            >
                                Review
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-1"
                                            onClick={() => onExpand(row.original)}
                                        >
                                            <Eye className="h-4 w-4 text-blue-500"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Feedback</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600"
                                            onClick={() => onDelete(feedbackId)}
                                            disabled={isDeleting || isApproving}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 text-red-600 animate-spin"/>
                                            ) : (
                                                <Trash2 className="h-4 w-4"/>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
            }
        )
    } else {
        columns.push(
            {
                id: 'actions',
                enableSorting: false,
                meta: {
                    align: 'text-right',
                    width: 150,
                    sticky: 'right',
                },
                header() {
                    return <div className="text-right pr-4">Actions</div>;
                },
                cell({row}) {
                    return (
                        <div className="flex items-center justify-center gap-2 pr-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 gap-1"
                                            onClick={() => onExpand(row.original)}
                                        >
                                            <Eye className="h-4 w-4"/>
                                            View
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Feedback</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
            }
        )
    }
    return columns;
};

export const LearningFeedbackTable = ({
                                          agentRow,
                                          approveAsync,
                                          approvingFeedback,
                                          rejectAsync,
                                          rejectingFeedback,
                                          deleteAsync,
                                          deletingFeedback,
                                          updateAsync,
                                          updatingFeedback,
                                          unlinkAsync,
                                          unlinkingFeedback,
                                      }: LearningFeedbackTableProps) => {
    const agent = agentRow.original;
    const feedbacks = [...(agent.feedbacks ?? [])].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState<IFeedbackLearning | null>(null);
    const [viewingFeedback, setViewingFeedback] = useState<IFeedbackLearning | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
    const [scrollToLinkedItems, setScrollToLinkedItems] = useState(false);
    const {isWorkspaceAdmin} = useAuth();
    const searchParams = useSearchParams();

    const handleApprove = async (feedbackId: string, comment?: string) => {
        try {
            setApprovingId(feedbackId);
            await approveAsync({feedbackId, comment: comment});
            toast.success('Feedback approved successfully');
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to approve feedback');
        } finally {
            setApprovingId(null);
        }
    };

    const handleReject = async (feedbackId: string, comment?: string) => {
        try {
            setApprovingId(feedbackId); // Reusing approvingId for spinner locally if needed or add new state
            // Better to use deleteAsync loading state logic or add new state for rejectingId
            // But since we have rejectingFeedback boolean from props, we can rely on that for button disabled state
            // Let's use a local state to identify WHICH item is rejecting if we wanted row-level loading.
            // For now, mirroring handleApprove structure.
            await rejectAsync({feedbackId, comment: comment});
            toast.success('Feedback rejected successfully');
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to reject feedback');
        }
    };

    const handleEdit = (feedback: IFeedbackLearning, shouldScrollToLinked = false) => {
        setEditingFeedback(feedback);
        setScrollToLinkedItems(shouldScrollToLinked);
        setIsEditOpen(true);
    };

    // Auto-open review modal if feedbackId is in URL query params
    useEffect(() => {
        const feedbackId = searchParams.get('feedbackId');
        if (feedbackId) {
            const feedback = feedbacks.find(f => f.id === feedbackId);
            if (feedback && !isEditOpen && feedback.feedbackStatus?.toLowerCase() === 'pending') {
                handleEdit(feedback);
            }
        }
    }, [searchParams]);

    const handleExpand = (feedback: IFeedbackLearning) => {
        setViewingFeedback(feedback);
        setIsViewOpen(true);
    };
    const handleEditSubmit = async (data: {
        feedback: string;
        rationale?: string;
        metadata: IFeedbackLearningMetadata;
        mustLearn: boolean;
        approvalStatus: string;
        comment: string;
    }) => {
        if (!editingFeedback) return;

        try {
            await updateAsync({
                feedbackId: editingFeedback.id,
                data,
            });
            toast.success('Feedback updated successfully');
            setIsEditOpen(false);
            setEditingFeedback(null);
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to update feedback');
        }
    };

    const handleDeleteClick = (feedbackId: string) => {
        setFeedbackToDelete(feedbackId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!feedbackToDelete) return;

        try {
            setDeletingId(feedbackToDelete);
            await deleteAsync(feedbackToDelete);
            toast.success('Feedback deleted successfully');
            setIsDeleteDialogOpen(false);
            setFeedbackToDelete(null);
        } catch (error: any) {
            toast.error(error?.message ?? 'Failed to delete feedback');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteDialogOpen(false);
        setFeedbackToDelete(null);
    };

    const feedbackColumns = generateFeedbackColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
        onExpand: handleExpand,
        approvingFeedback,
        deletingFeedback,
        approvingId,
        deletingId,
        isWorkspaceAdmin,
    });
    const supportingDocument = Array.isArray(editingFeedback?.supportingFile) && editingFeedback.supportingFile.length > 0
        ? editingFeedback.supportingFile[0]
        : undefined
    return (
        <>
            <div className="w-full bg-white dark:bg-gray-700 p-4 overflow-x-auto isolate">
                <DataTable
                    columns={feedbackColumns}
                    data={feedbacks}
                    searchColumnName="feedback"
                    showFooter={true}
                    showTableSearch={false}
                    defaultPageSize={10}
                    showHeader={false}
                    enableColgroup={true}
                />
            </div>
            <LearningFeedbackEditForm
                isOpen={isEditOpen}
                setOpen={(open) => {
                    setIsEditOpen(open);
                    if (!open) {
                        setScrollToLinkedItems(false);
                    }
                }}
                feedbackData={editingFeedback}
                onSubmit={handleEditSubmit}
                isUpdating={updatingFeedback}
                onApprove={handleApprove}
                isApproving={approvingFeedback}
                onReject={handleReject}
                isRejecting={rejectingFeedback}
                onUnlink={unlinkAsync}
                isUnlinking={unlinkingFeedback}
                supportingDocument={supportingDocument}
                scrollToLinkedItems={scrollToLinkedItems}
            />
            <FeedbackViewDialog isOpen={isViewOpen} setOpen={setIsViewOpen} feedback={viewingFeedback} />
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={handleDeleteCancel} disabled={deletingFeedback}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletingFeedback}>
                            {deletingFeedback ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
