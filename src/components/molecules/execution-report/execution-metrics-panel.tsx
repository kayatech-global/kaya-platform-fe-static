'use client';
import { Zap, Coins, BrainCircuit, Lightbulb } from 'lucide-react';
import { ITestExecutionInputReport } from '@/app/workspace/[wid]/test-studio/data-generation';
import { getSecureRandom } from '@/lib/utils';
import { ExecutionMetricCard } from '@/components/atoms/execution-metric-card';

type ExecutionMetricsPanelProps = {
    report: ITestExecutionInputReport;
};

export const ExecutionMetricsPanel = ({ report }: ExecutionMetricsPanelProps) => {
    const tokenUsage = report.tokens ?? Math.floor(getSecureRandom() * (100000 - 10000) + 1) + 10000;

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">Metrics & Insights</h3>
            <div className="grid grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <ExecutionMetricCard
                    icon={Zap}
                    iconColor="text-blue-600"
                    bgColor="bg-blue-50"
                    title="Latency"
                    value={report.totalLatency ? `${report.totalLatency}s` : '-'}
                    subtitle={
                        <>
                            ({report.ragLatency ?? 0}s RAG / {report.llmLatency ?? 0}s LLM)
                        </>
                    }
                    tooltip="Total time taken to execute the workflow from start to finish. Lower latency indicates better performance."
                />

                <ExecutionMetricCard
                    icon={Coins}
                    iconColor="text-green-600"
                    bgColor="bg-green-50"
                    title="Token Usage"
                    value={tokenUsage}
                    subtitle="Tokens used for this execution"
                    tooltip="Total tokens consumed across all LLM calls during execution. Higher usage increases cost."
                />

                <ExecutionMetricCard
                    icon={BrainCircuit}
                    iconColor="text-amber-600"
                    bgColor="bg-amber-50"
                    title="Overall Score"
                    value={report.score === undefined ? '-' : `${report.score}%`}
                    subtitle="Semantic Match (vs Expected)"
                    tooltip="Semantic match between actual and expected output. A higher percentage indicates the response closely matches expectations."
                />
            </div>

            {/* AI Insights */}
            {report.aiInsights && (
                <div className="flex flex-col gap-4 my-3 border-t border-b border-gray-200 dark:border-gray-700 py-5 pb-6">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">Execution Summary</h3>
                    <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4 flex gap-3">
                        <div className="mt-0.5 text-blue-600 dark:text-blue-500">
                            <Lightbulb size={18} />
                        </div>
                        <p className="text-sm text-blue-600 font-medium dark:text-blue-300 leading-relaxed">{report.aiInsights}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
