'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Network, Maximize2 } from 'lucide-react';
import { Button, Badge } from '@/components';
import { Dialog, DialogContent } from '@/components/atoms/dialog';
import { ITestExecutionInputReport } from '@/app/workspace/[wid]/test-studio/data-generation';
import { ExecutionStepsBreakdown } from '@/app/workspace/[wid]/test-studio/test-suite-report-generation/components/execution-steps-breakdown';

type ExecutionTraceTabProps = {
    report: ITestExecutionInputReport;
    matchingTestCase?: any;
};

export const ExecutionTraceTab = ({ report, matchingTestCase }: ExecutionTraceTabProps) => {
    const [showMaximizedGraph, setShowMaximizedGraph] = useState(false);

    return (
        <>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">Execution Trace</h3>

            {/* Linear Graph Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm relative group">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Network size={16} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Agent Flow Execution</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => setShowMaximizedGraph(true)}
                        title="Maximize Graph"
                    >
                        <Maximize2 size={16} />
                    </Button>
                </div>
                <div className="h-[200px] w-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center p-4">
                    <ExecutionStepsBreakdown report={report} showGraphOnly={true} />
                </div>
            </div>

            {/* Detailed Steps */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Execution Timeline</h3>
                    <Badge variant="outline" className="text-xs font-normal text-gray-500 dark:text-gray-400 dark:border-gray-700">
                        {report?.steps?.length || 0} Step(s)
                    </Badge>
                </div>
                <ExecutionStepsBreakdown
                    report={report}
                    showStepsOnly={true}
                    matchingTestCase={matchingTestCase}
                />
            </div>

            {/* Maximized Graph Dialog */}
            <Dialog open={showMaximizedGraph} onOpenChange={setShowMaximizedGraph}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-6 bg-white dark:bg-gray-800 gap-4">
                    <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                        <div className="flex items-center gap-2">
                            <Network size={20} className="text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Agent Flow Execution (Full View)</h3>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center p-8 overflow-auto">
                        <div className="w-full h-full min-h-[500px]">
                            <ExecutionStepsBreakdown report={report} showGraphOnly={true} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
