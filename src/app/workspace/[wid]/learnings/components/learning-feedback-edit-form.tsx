'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {BrainCircuit, Info, FileText, Download, FileSpreadsheet, Expand, Link2Off} from 'lucide-react';
import { Button, Checkbox, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { IFeedbackLearning, IFeedbackLearningMetadata } from '@/models';
import { FeedbackViewDialog } from './feedback-view-dialog';
import { toast } from 'sonner';
import moment from "moment/moment";

interface IFeedbackEditForm {
    feedback: string;
    rationale?: string;
    metadata: string;
    mustLearn: boolean;
    approvalStatus: string;
    comment: string;
}

interface LearningFeedbackEditFormProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    feedbackData: IFeedbackLearning | null;
    onSubmit: (data: {
        feedback: string;
        rationale?: string;
        metadata: IFeedbackLearningMetadata;
        mustLearn: boolean;
        approvalStatus: string;
        comment: string;
    }) => Promise<void>;
    isUpdating: boolean;
    onApprove: (feedbackId: string, comment?: string) => Promise<void>;
    isApproving: boolean;
    onReject: (feedbackId: string, comment?: string) => Promise<void>;
    isRejecting: boolean;
    onUnlink: (feedbackId: string) => Promise<void>;
    isUnlinking: boolean;
    supportingDocument?: string;
    scrollToLinkedItems?: boolean;
}

const SupportingDocumentPreview = ({ supportingDocument }: { supportingDocument: string }) => {
    const isDataUri = supportingDocument.startsWith('data:');
    let isImage = false;
    let isExcel = false;
    let downloadHref = supportingDocument;

    if (isDataUri) {
        isImage = supportingDocument.startsWith('data:image');
        isExcel =
            supportingDocument.startsWith(
                'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ) || supportingDocument.startsWith('data:application/vnd.ms-excel');
    } else {
        isExcel = true;
        downloadHref = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${supportingDocument}`;
    }

    if (isImage) {
        return (
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 relative group">
                <img
                    src={supportingDocument}
                    alt="Supporting Document"
                    className="max-h-64 rounded-md object-contain border border-gray-100 dark:border-gray-700"
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                        href={downloadHref}
                        download="supporting-document"
                        className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center"
                        title="Download Image"
                    >
                        <Download size={16} />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        'p-2 rounded',
                        isExcel
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    )}
                >
                    {isExcel ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {isExcel ? 'Excel Spreadsheet' : 'Attached Document'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {supportingDocument.substring(0, 30)}...
                    </span>
                </div>
            </div>
            <a
                href={downloadHref}
                download={isExcel ? 'supporting-document.xlsx' : 'supporting-document'}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
                <Download size={14} />
                Download
            </a>
        </div>
    );
};

export const LearningFeedbackEditForm = ({
    isOpen,
    setOpen,
    feedbackData,
    onSubmit,
    isUpdating,
    isApproving,
    isRejecting,
    onUnlink,
    isUnlinking,
    supportingDocument,
    scrollToLinkedItems = false,
}: LearningFeedbackEditFormProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [viewingLinkedItem, setViewingLinkedItem] = useState<IFeedbackLearning | null>(null);
    const [isLinkedItemViewOpen, setIsLinkedItemViewOpen] = useState(false);
    const [unlinkingItemId, setUnlinkingItemId] = useState<string | null>(null);
    const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
    const [showAllLinkedItems, setShowAllLinkedItems] = useState(false);
    const [isGroup, setIsGroup] = useState<boolean>(false)
    const linkedItemsRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isValid },
    } = useForm<IFeedbackEditForm>({
        mode: 'all',
        defaultValues: {
            feedback: '',
            rationale: '',
            metadata: '{}',
            mustLearn: false,
            approvalStatus: '',
            comment: '',
        },
    });

    // Reset form when feedbackData changes
    useEffect(() => {
        if (feedbackData) {
            const metadataStr = JSON.stringify(feedbackData.metadata ?? {}, null, 2);
            reset({
                feedback: feedbackData.feedback ?? '',
                rationale: feedbackData.rationale || undefined,
                metadata: metadataStr,
                mustLearn: feedbackData.mustLearn || false,
            });
            // Reset show all state when feedback changes
            setShowAllLinkedItems(false);
            setIsGroup(feedbackData.groupItems && feedbackData.groupItems.length > 0);
        }
    }, [feedbackData, reset]);

    // Auto-scroll to linked items when form opens via badge click
    useEffect(() => {
        if (isOpen && scrollToLinkedItems && feedbackData?.groupItems && feedbackData.groupItems.length > 0) {
            // Small delay to ensure the drawer is fully rendered
            const timer = setTimeout(() => {
                linkedItemsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Auto-expand all linked items when opened via badge
                setShowAllLinkedItems(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, scrollToLinkedItems, feedbackData]);

    const handleFormSubmit = async (data: IFeedbackEditForm) => {
        // Parse the JSON string back to object
        const parsedMetadata = JSON.parse(data.metadata) as IFeedbackLearningMetadata;
        const trimmedComment = data.comment?.trim();
        await onSubmit({
            feedback: data.feedback,
            rationale: data.rationale,
            metadata: parsedMetadata,
            mustLearn: Boolean(data.mustLearn),
            approvalStatus: approvalStatus,
            comment: trimmedComment ?? '',
        });
    };

    const handleUnlinkConfirm = async () => {
        if (!unlinkingItemId) return;

        try {
            await onUnlink(unlinkingItemId);
            toast.success('Feedback unlinked successfully');
            setIsUnlinkDialogOpen(false);
            setUnlinkingItemId(null);
        } catch {
            toast.error('Failed to unlink feedback');
        }
    };

    const handleUnlinkCancel = () => {
        setIsUnlinkDialogOpen(false);
        setUnlinkingItemId(null);
    };

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content"
            dismissible={false}
            headerIcon={<BrainCircuit />}
            header="Learnings"
            footer={
                <div className="flex justify-between gap-2">
                    <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)} disabled={isUpdating}>
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        {/*don't allow to approve or reject already approved/rejected feedback*/}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        variant={'secondary'}
                                        onClick={() => {
                                            setApprovalStatus('REJECT');
                                            setIsRejectionModalOpen(true);
                                        }}
                                        disabled={
                                            isUpdating ||
                                            isApproving ||
                                            isRejecting ||
                                            feedbackData?.feedbackStatus?.toLowerCase() !== 'pending' ||
                                            !!(feedbackData?.isReadOnly) ||
                                            !feedbackData?.canAuthor
                                        }
                                    >
                                        {(isRejectionModalOpen && isUpdating)? 'Rejecting...' : 'Reject'}
                                    </Button>
                                </TooltipTrigger>
                                {feedbackData?.feedbackStatus?.toLowerCase() !== 'pending' && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You cannot reject feedback that has already been approved or rejected.
                                    </TooltipContent>
                                )}
                                {!!(feedbackData?.isReadOnly) && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You do not have permission to reject this feedback.
                                    </TooltipContent>
                                )}
                                {!(feedbackData?.canAuthor) && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You do not have permission to author this feedback.
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        variant={'secondary'}
                                        disabled={
                                            isUpdating ||
                                            isApproving ||
                                            isRejecting ||
                                            feedbackData?.feedbackStatus?.toLowerCase() !== 'pending' ||
                                            !!(feedbackData?.isReadOnly) ||
                                            !(feedbackData?.canAuthor)
                                        }
                                        onClick={() => {
                                            setApprovalStatus('APPROVE');
                                            setIsApprovalModalOpen(true);
                                        }}
                                    >
                                        {(isApprovalModalOpen && isUpdating) ? 'Approving...' : 'Approve'}
                                    </Button>
                                </TooltipTrigger>
                                {feedbackData?.feedbackStatus?.toLowerCase() !== 'pending' && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You cannot approve feedback that has already been approved or rejected.
                                    </TooltipContent>
                                )}
                                {!!(feedbackData?.isReadOnly) && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You do not have permission to approve this feedback.
                                    </TooltipContent>
                                )}
                                {!(feedbackData?.canAuthor) && (
                                    <TooltipContent side="left" align="center" className="max-w-[400px]">
                                        You do not have permission to author this feedback.
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            }
            content={
                <div className={cn('p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]')}>
                    {/* Learning Summary Description */}
                    {feedbackData?.learningSummary && (
                        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-gray-200 flex items-center gap-2">
                                <BrainCircuit size={16} />
                                Learning Summary
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-gray-300 leading-relaxed">
                                {isExpanded || feedbackData.learningSummary.length <= 200
                                    ? feedbackData.learningSummary
                                    : `${feedbackData.learningSummary.substring(0, 200)}...`}
                            </p>
                            {feedbackData.learningSummary.length > 200 && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    {isExpanded ? 'View less' : 'View more'}
                                </button>
                            )}
                        </div>
                    )}

                    {feedbackData?.feedbackRequestReason && (
                        <div className="space-y-2">

                            <div className="flex items-center gap-1">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Reason for Requesting the Feedback
                                </h3>
                                {isGroup && (
                                    <span
                                        className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Generated </span>
                                )}
                            </div>
                            <Textarea
                                value={feedbackData.feedbackRequestReason}
                                readOnly
                                rows={5}
                                className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    )}

                    {/* Feedback Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Feedback Provided
                            </h3>
                            {isGroup && (
                                <span
                                    className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                            )}
                        </div>
                        <Textarea
                            {...register('feedback', {
                                required: { value: true, message: 'Feedback is required' },
                            })}
                            placeholder="Enter feedback"
                            rows={3}
                            readOnly={!!(feedbackData?.isReadOnly) || !(feedbackData?.canAuthor)}
                            isDestructive={!!errors?.feedback?.message}
                            supportiveText={errors?.feedback?.message}
                        />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Supporting Document Submitted
                        </h3>
                        {supportingDocument ? (
                            <div className="mt-2 text-sm">
                                <SupportingDocumentPreview supportingDocument={supportingDocument} />
                            </div>
                        ) : (
                            <div className="mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
                                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    No supporting document submitted
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Rationale Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Feedback Rationale Provided
                            </h3>
                            {isGroup && (
                                <span
                                    className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                            )}
                        </div>
                        <Textarea
                            {...register('rationale', {
                                required: { value: false, message: 'Rationale is required' },
                            })}
                            placeholder="Enter rationale"
                            rows={5}
                            readOnly={!!(feedbackData?.isReadOnly) || !(feedbackData?.canAuthor)}
                            isDestructive={!!errors?.rationale?.message}
                            supportiveText={errors?.rationale?.message}
                        />
                    </div>

                    {/* Applied Criteria Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Applicable Criteria / Tags
                            </h3>
                            {isGroup && (
                                <span
                                    className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                            )}
                        </div>
                        <Textarea
                            {...register('metadata', {
                                required: { value: true, message: 'Applicable criteria is required' },
                                validate: value => {
                                    try {
                                        JSON.parse(value);
                                        return true;
                                    } catch {
                                        return 'Invalid JSON format';
                                    }
                                },
                            })}
                            placeholder='{"key": "value"}'
                            rows={8}
                            className="font-mono text-sm"
                            readOnly={!!(feedbackData?.isReadOnly) || !(feedbackData?.canAuthor)}
                            isDestructive={!!errors?.metadata?.message}
                            supportiveText={
                                errors?.metadata?.message ?? 'Edit the metadata as JSON. Must be valid JSON format.'
                            }
                        />
                    </div>

                    {/* Must Learn Section */}
                    <div className="space-y-2 hidden">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="mustLearn"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox 
                                        id="mustLearn" 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                        disabled={!!(feedbackData?.isReadOnly) || !(feedbackData?.canAuthor)}
                                    />
                                )}
                            />
                            <label
                                htmlFor="mustLearn"
                                className={cn(
                                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                                    (feedbackData?.isReadOnly || !(feedbackData?.canAuthor)) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                )}
                            >
                                Must Learn
                            </label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center" className="max-w-[400px]">
                                        If enabled, learning is always included in execution; if disabled, it is
                                        triggered by semantic similarity
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {/*<p className="text-xs font-normal">*/}
                        {/*</p>*/}
                    </div>

                    {/* Readonly Information Section */}
                    {(feedbackData?.feedbackRequestReason ||
                        feedbackData?.createdBy ||
                        feedbackData?.updatedBy ||
                        feedbackData?.approvedBy ||
                        feedbackData?.createdAt) && (
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <div className="flex items-center justify-between gap-x-6">
                                {/*if group items present consider it as a group and hide provided by details*/}
                                {((feedbackData?.createdBy ?? feedbackData?.updatedBy ?? feedbackData?.approvedBy) && (feedbackData.groupItems.length === 0)) && (
                                    <div className="space-y-2 w-full">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Provided By
                                        </h3>
                                        <input
                                            type="text"
                                            value={
                                                feedbackData.createdBy ??
                                                feedbackData.updatedBy ??
                                                feedbackData.approvedBy ??
                                                ''
                                            }
                                            readOnly
                                            className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                )}
                                {feedbackData?.createdAt && (
                                    <div className="space-y-2  w-full">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Provided Time
                                        </h3>
                                        <input
                                            type="text"
                                            value={new Date(feedbackData.createdAt).toLocaleString()}
                                            readOnly
                                            className="w-full px-3 py-2 text-sm border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Linked Items Section */}
                    {feedbackData?.groupItems && feedbackData.groupItems.length > 0 && (
                        <div ref={linkedItemsRef} className="space-y-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 scroll-mt-4">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Linked Individual Items ({feedbackData.groupItems.length})
                            </h3>
                            <div className="space-y-3">
                                {(showAllLinkedItems ? feedbackData.groupItems : feedbackData.groupItems.slice(0, 2)).map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-md space-y-3 relative"
                                    >
                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-4 top-3 right-3 items-center gap-1">
                                            <div className="col-span-3">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                                                Feedback:
                                            </span>
                                            </div>
                                            <div className="col-span-1 flex justify-end gap-1 absolute top-3 right-3">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => {
                                                                    setUnlinkingItemId(item.id);
                                                                    setIsUnlinkDialogOpen(true);
                                                                }}
                                                                disabled={isUnlinking}
                                                            >
                                                                <Link2Off
                                                                    className="h-4 w-4  text-red-400 dark:hover:text-gray-300"/>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Unlink Feedback</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => {
                                                                    setViewingLinkedItem(item);
                                                                    setIsLinkedItemViewOpen(true);
                                                                }}
                                                            >
                                                                <Expand
                                                                    className="h-4 w-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"/>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View Full Details</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        {/* Feedback */}
                                        <div className="space-y-1.5 pr-16">
                                            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed line-clamp-2">
                                                {item.feedback}
                                            </p>
                                        </div>

                                        {/* Metadata Tags */}


                                        {/* Additional Info */}
                                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            {item.agentName && (
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold">Agent:</span> {item.agentName}
                                                </span>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">

                                                    <span className="font-semibold">Provided by:</span>{' '}
                                                    {item.createdBy ? item.createdBy : 'EXTERNAL SYSTEM'}
                                                </div>

                                                <div className="space-y-2">

                                                    <span className="font-semibold">Provided at:</span>{' '}
                                                    {moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {feedbackData.groupItems.length > 2 && (
                                <div className="flex justify-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllLinkedItems(!showAllLinkedItems)}
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
                                    >
                                        {showAllLinkedItems
                                            ? 'Show less'
                                            : `Show all (${feedbackData.groupItems.length - 2} more)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Approve Feedback</DialogTitle>
                                <DialogDescription>Add an optional comment for this approval.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 px-4">
                                <Textarea
                                    {...register('comment', {
                                        required: false,
                                        validate: value => {
                                            if (value && value.trim() === '') {
                                                return 'Invalid comment';
                                            }
                                            return true;
                                        }
                                    })}
                                    placeholder="Enter approval comment (optional)"
                                    rows={4}
                                    isDestructive={!!errors?.comment?.message}
                                    supportiveText={errors?.comment?.message}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    disabled={isUpdating}
                                    variant="secondary"
                                    onClick={() => setIsApprovalModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button disabled={!isValid || isUpdating} onClick={handleSubmit(handleFormSubmit)}>
                                    {isUpdating ? 'Approving...' : 'Approve'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Feedback</DialogTitle>
                                <DialogDescription>Add an optional comment for this rejection.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 px-4">
                                <Textarea
                                    {...register('comment', {
                                        required: false,
                                        validate: value => {
                                            if (value && value.trim() === '') {
                                                return 'Invalid comment';
                                            }
                                            return true;
                                        }
                                    })}
                                    placeholder="Enter rejection comment (optional)"
                                    rows={4}
                                    isDestructive={!!errors?.comment?.message}
                                    supportiveText={errors?.comment?.message}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    disabled={isUpdating}
                                    variant="secondary" onClick={() => setIsRejectionModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button disabled={!isValid || isUpdating} onClick={handleSubmit(handleFormSubmit)}>
                                    {isUpdating ? 'Rejecting...' : 'Reject'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <FeedbackViewDialog
                        isOpen={isLinkedItemViewOpen}
                        setOpen={setIsLinkedItemViewOpen}
                        feedback={viewingLinkedItem}
                    />
                    <Dialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Unlink Feedback</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to unlink this feedback? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="secondary" onClick={handleUnlinkCancel} disabled={isUnlinking}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleUnlinkConfirm} disabled={isUnlinking}>
                                    {isUnlinking ? 'Unlinking...' : 'Unlink'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        />
    );
};

export default LearningFeedbackEditForm;
