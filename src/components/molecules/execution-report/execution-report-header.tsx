'use client';
import { Label } from '@/components';
import { Workflow, Hash, Timer, Calendar } from 'lucide-react';
import { TestStatus } from '@/app/workspace/[wid]/test-studio/data-generation';
import { ExecutionStatusBadge } from '@/components/atoms/execution-status-badge';
import { TruncateCell } from '@/components/atoms/truncate-cell';
import moment from 'moment';

type ExecutionReportHeaderProps = {
    status: TestStatus;
    workflowName: string;
    executionId?: string;
    duration?: string;
    date?: string | Date;
};

export const ExecutionReportHeader = ({
    status,
    workflowName,
    executionId,
    duration,
    date,
}: ExecutionReportHeaderProps) => {
    const formattedDate = date ? moment(date).format('D MMM, YYYY [|] h:mm a') : '-';

    return (
        <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-8 py-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                    </Label>
                    <div className="flex items-center gap-3">
                        <ExecutionStatusBadge status={status} className="text-[11px] h-6 px-3" />
                    </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Workflow Info */}
                <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workflow
                    </Label>
                    <div className="flex items-center gap-2">
                        <Workflow size={16} className="text-blue-600 dark:text-blue-400" />
                        <TruncateCell 
                            value={workflowName} 
                            length={35} 
                            className="text-sm font-bold text-gray-900 dark:text-gray-200"
                            isDefault={false}
                            side="bottom"
                        />
                    </div>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Execution ID */}
                <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Execution ID
                    </Label>
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono text-[11px]">
                            {executionId?.split('-')[0] ?? '...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 pr-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                        <Timer size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-500">Duration</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{duration ?? '2s'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                        <Calendar size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500">Date & Time</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{formattedDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
