'use client';

import React, {useEffect, useState} from 'react';
import {
    BrainCircuit,
    CheckCircle2,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    XCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components';
import { IFeedbackLearning } from '@/models';
import { cn, handleNoValue } from '@/lib/utils';
import moment from 'moment';

interface FeedbackViewDialogProps {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    feedback: IFeedbackLearning | null;
}

interface StatusBadgeProps {
    readonly status: string;
}

interface SupportingDocumentContentProps {
    readonly document: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const normalized = status?.toLowerCase();
    if (normalized === 'authored') {
        return (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Approved</span>
            </div>
        );
    }
    if (normalized === 'declined') {
        return (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Rejected</span>
            </div>
        );
    }
    if (normalized === 'pending') {
        return (
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 dark:bg-gray-100 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Pending</span>
            </div>
        );
    }
    return null;
}

function SupportingDocumentContent({ document }: SupportingDocumentContentProps) {
    const isDataUri = document.startsWith('data:');
    const isImage = isDataUri && document.startsWith('data:image');
    const isExcel = isDataUri
        ? document.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          document.startsWith('data:application/vnd.ms-excel')
        : true; // raw base64 assumed excel per requirement
    const downloadHref = isDataUri
        ? document
        : `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${document}`;

    if (isImage) {
        return (
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 relative group">
                <img
                    src={document}
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">{document.substring(0, 30)}...</span>
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
}

export const FeedbackViewDialog = ({ isOpen, setOpen, feedback }: FeedbackViewDialogProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { __additional: additionalMetdata, ...metadata } = feedback?.metadata ?? {};
    const [isGroup, setIsGroup] = useState<boolean>(false)
    const supportingDocument =
        Array.isArray(feedback?.supportingFile) && feedback.supportingFile.length > 0
            ? feedback.supportingFile[0]
            : undefined;

    useEffect(() => {
        if(feedback){
            setIsGroup(feedback.groupItems && feedback.groupItems.length > 0);
        }
    }, [feedback]);
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="p-10 max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Feedback Details</DialogTitle>
                            <DialogDescription>Complete information about this feedback entry</DialogDescription>

                            {isGroup && (
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                    Generated Feedback Group
                                </span>
                            )}
                        </div>
                        {feedback && (
                            <div className="flex items-center gap-2">
                                <StatusBadge status={feedback.feedbackStatus ?? ''} />
                            </div>
                        )}
                    </div>
                </DialogHeader>
                {feedback && (
                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                        <div className="space-y-6 py-4">
                            {/* Learning Summary Description */}
                            {feedback.learningSummary && (
                                <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-gray-200 flex items-center gap-2">
                                        <BrainCircuit size={16} />
                                        Learning Summary
                                    </h3>
                                    <p className="text-sm text-blue-800 dark:text-gray-300 leading-relaxed">
                                        {isExpanded || feedback.learningSummary.length <= 200
                                            ? feedback.learningSummary
                                            : `${feedback.learningSummary.substring(0, 200)}...`}
                                    </p>
                                    {feedback.learningSummary.length > 200 && (
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

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Feedback Request Reason
                                    </h3>
                                    {isGroup && (
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                        {handleNoValue(feedback.feedbackRequestReason)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Feedback</h3>
                                    {isGroup && (
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                        {handleNoValue(feedback.feedback)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rationale</h3>
                                    {isGroup && (
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                        {handleNoValue(feedback.rationale)}
                                    </p>
                                </div>
                            </div>

                            {feedback.context && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Context</h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                                            {feedback.context}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Applicable Criteria / Tags
                                    </h3>
                                    {isGroup && (
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            Generated
                                        </span>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words font-mono">
                                        {metadata ? JSON.stringify(metadata, null, 2) : '-'}
                                    </pre>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Additional Metadata
                                </h3>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words font-mono">
                                        {additionalMetdata ? JSON.stringify(additionalMetdata, null, 2) : '-'}
                                    </pre>
                                </div>
                            </div>

                            <fieldset>
                                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300" id="supporting-document-label">
                                    Supporting Document Submitted
                                </legend>
                                {supportingDocument ? (
                                    <div className="mt-2 text-sm">
                                        <SupportingDocumentContent document={supportingDocument} />
                                    </div>
                                ) : (
                                    <div className="mt-2 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center">
                                        <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            No supporting document submitted
                                        </span>
                                    </div>
                                )}
                            </fieldset>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {feedback.feedbackStatus?.toLowerCase() === 'declined' ? 'Rejected By' : 'Approved By'}
                                    </h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {feedback.approvedBy ? feedback.approvedBy : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {feedback.feedbackStatus?.toLowerCase() === 'declined' ? 'Rejected At' : 'Approved At'}
                                    </h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {feedback.approvedAt
                                                ? moment(feedback.approvedAt).format('YYYY-MM-DD HH:mm:ss')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {feedback.feedbackStatus?.toLowerCase() === 'declined'
                                            ? 'Rejected Comment'
                                            : 'Approved Comment'}
                                    </h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {feedback.approvalComment ? feedback.approvalComment : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/*if group items present consider it as a group and hide provided by details*/}
                            {(!isGroup)&& (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Provided By</h3>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {feedback.createdBy ? feedback.createdBy : 'EXTERNAL SYSTEM'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Provided At</h3>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {moment(feedback.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Updated By</h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {feedback.updatedBy ? feedback.updatedBy : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Updated At</h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">
                                            {moment(feedback.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
