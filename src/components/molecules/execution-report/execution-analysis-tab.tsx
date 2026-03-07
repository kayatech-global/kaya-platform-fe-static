'use client';

import { FileChartColumn, Workflow, Target, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components';
import { cn } from '@/lib/utils';
import { ITestExecutionInputReport, TestStatus } from '@/app/workspace/[wid]/test-studio/data-generation';

type ExecutionAnalysisTabProps = {
    report: ITestExecutionInputReport;
    inputValue?: string;
};

const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

export const ExecutionAnalysisTab = ({ report, inputValue }: ExecutionAnalysisTabProps) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-2">Execution Analysis</h3>
            {/* Input Data */}
            <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm p-4 w-full">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                        <FileChartColumn size={14} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Input Data</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                    {inputValue || report.input || 'No input data available.'}
                </p>
            </div>

            {/* Output Comparison Group */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        Output Comparison
                    </div>
                    {report.score !== undefined && (
                        <div
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1',
                                getScoreColor(report.score || 0)
                            )}
                        >
                            <span>Semantic Similarity:</span>
                            <span>{report.score}%</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Actual Output */}
                    <div
                        className={cn(
                            'rounded-md border shadow-sm p-4 w-full',
                            report.status === TestStatus.Failed ? 'bg-white dark:bg-gray-900 border-red-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-gray-900 border-blue-200 dark:border-gray-700'
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3 pb-1">
                            <div
                                className={cn(
                                    'p-1 rounded-md',
                                    report.status === TestStatus.Failed ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                )}
                            >
                                <Workflow size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Actual Output</span>
                            {report.status === TestStatus.Failed && (
                                <Badge variant="error" className="text-[10px] h-5">
                                    Mismatch
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            <p>{report.actualOutput || report.agentOutput || 'No output generated.'}</p>
                        </div>
                    </div>

                    {/* Expected Output */}
                    <div
                        className={cn(
                            'rounded-md border shadow-sm p-4 w-full',
                            report.status === TestStatus.Failed ? 'bg-white dark:bg-gray-900 border-green-200 dark:border-gray-700' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3 pb-1">
                            <div
                                className={cn(
                                    'p-1 rounded-md',
                                    report.status === TestStatus.Failed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                )}
                            >
                                <Target size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Expected Output</span>
                            {report.status === TestStatus.Failed && (
                                <Badge variant="success" className="text-[10px] h-5">
                                    Expected
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            <p>{report.expectedOutput || 'No expected output defined.'}</p>
                        </div>
                    </div>
                </div>

                {/* Output Difference Rationale */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className={cn('rounded-md border shadow-sm p-4 w-full bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 col-span-2')}>
                        <div className="flex items-center gap-2 mb-3 pb-1">
                            <div className={cn('p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400')}>
                                <ArrowRightLeft size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Output Differance Rationale</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            <p>{report.outputDifferenceRationale || 'No output difference rationale available.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ground Truth Comparison Group */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-gray-500 dark:text-white uppercase tracking-wider">
                        Expected Behaviour Comparison
                    </div>
                    {report.groundTruthScore !== undefined && (
                        <div
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1',
                                getScoreColor(report.groundTruthScore || 0)
                            )}
                        >
                            <span>Context Relevance:</span>
                            <span>{report.groundTruthScore}%</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Actual Ground Truth */}
                    <div className="bg-blue-50 dark:bg-gray-900 rounded-md border border-blue-200 dark:border-gray-700 shadow-sm p-4 w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                                <FileChartColumn size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Actual workflow Behaviour</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            {report.actualGroundTruth || 'No actual ground truth available.'}
                        </p>
                    </div>

                    {/* Expected Ground Truth */}
                    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm p-4 w-full">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                                <Target size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Expected Behaviour</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            {report.groundTruth || 'No expected ground truth defined.'}
                        </p>
                    </div>
                </div>

                {/* Behaviour Difference Rationale */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className={cn('rounded-md border shadow-sm p-4 w-full bg-white dark:bg-gray-900 border-blue-200 dark:border-gray-700 col-span-2')}>
                        <div className="flex items-center gap-2 mb-3 pb-1">
                            <div className={cn('p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400')}>
                                <ArrowRightLeft size={14} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">Behaviour Differance Rationale</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            <p>{report.behaviourDifferenceRationale || 'No behaviour difference rationale available.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
