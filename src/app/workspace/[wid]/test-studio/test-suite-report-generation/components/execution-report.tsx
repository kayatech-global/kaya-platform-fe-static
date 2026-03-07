/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { ITestExecutionInputReport, ITestExecutionHistory, IAgentOutput, IExecutionReportData, ITestReport, AgentStepDetail, IAgentEvaluationResult } from '../../data-generation';
import { Button } from '@/components';
import { Dialog, DialogContent, DialogFooter } from '@/components/atoms/dialog';
import { FileChartColumn, Network } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { workflowsList } from '../../mock/workflows-list';
import { generatedTestCases } from '../../mock/generated-test-data-mock';
import {
    ExecutionReportHeader,
    ExecutionMetricsPanel,
    ExecutionAnalysisTab,
    ExecutionTraceTab,
} from '@/components/molecules/execution-report';
import { useExecutionReport } from '@/hooks/use-test-executions';
import { TestStatus, ExecutionItemStatus, EvaluationVerdict } from '@/enums/test-studio-type';

// Helper function to calculate duration between two timestamps
const calculateDuration = (start: string, end: string): string => {
    const startTime = moment(start);
    const endTime = moment(end);
    const duration = moment.duration(endTime.diff(startTime));
    const minutes = Math.floor(duration.asMinutes());
    const seconds = Math.floor(duration.asSeconds()) % 60;

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

// Helper function to build agent step details from outputs or evaluations
// Helper to safely convert values to string for display
const safeStringify = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '[Unable to stringify value]';
    }
};

const buildAgentStepDetails = (
    agentOutputs: IAgentOutput[] | undefined,
    agentEvaluations: IAgentEvaluationResult[] | undefined,
    executionReport: IExecutionReportData,
    agentEvaluationsMap: Map<string, IAgentEvaluationResult>
): AgentStepDetail[] => {
    if (agentOutputs && agentOutputs.length > 0) {
        return agentOutputs.map(agentOutput => {
            const expectedAgent = executionReport.expectedOutputSnapshot?.agentEvaluations?.find(
                (ae) => ae.nodeId === agentOutput.nodeId
            );
            const evaluation = agentEvaluationsMap.get(agentOutput.nodeId || '');

            return {
                agent: agentOutput.agentName,
                agentActualInput: safeStringify(executionReport.inputDataSnapshot?.message),
                agentExpectedOutput: safeStringify(expectedAgent?.expectedOutput),
                agentActualOutput: safeStringify(agentOutput.agent_output),
                agentExpectedGroundTruth: safeStringify(expectedAgent?.expectedAgentBehaviour),
                agentActualGroundTruth: safeStringify(evaluation?.justification),
                toolsInvoked: [],
                status: evaluation?.verdict === EvaluationVerdict.Pass ? TestStatus.Passed : TestStatus.Failed,
                score: evaluation?.total_score || 0,
            };
        });
    }

    if (agentEvaluations && agentEvaluations.length > 0) {
        return agentEvaluations.map(evaluation => {
            const expectedAgent = executionReport.expectedOutputSnapshot?.agentEvaluations?.find(
                (ae) => ae.nodeId === evaluation.nodeId
            );

            return {
                agent: evaluation.agentName,
                agentActualInput: safeStringify(executionReport.inputDataSnapshot?.message),
                agentExpectedOutput: safeStringify(expectedAgent?.expectedOutput),
                agentActualOutput: '',
                agentExpectedGroundTruth: safeStringify(expectedAgent?.expectedAgentBehaviour),
                agentActualGroundTruth: safeStringify(evaluation?.justification),
                status: evaluation?.verdict === EvaluationVerdict.Pass ? TestStatus.Passed : TestStatus.Failed,
                score: evaluation?.total_score || 0,
            };
        });
    }

    return [];
};

// Helper function to get final steps array
const getFinalSteps = (
    agentOutputs: IAgentOutput[] | undefined,
    agentEvaluations: IAgentEvaluationResult[] | undefined
): string[] => {
    if (agentOutputs && agentOutputs.length > 0) {
        return agentOutputs.map(ao => ao.agentName);
    }
    
    if (agentEvaluations && agentEvaluations.length > 0) {
        return agentEvaluations.map(ae => ae.agentName);
    }
    
    return [];
};

// Helper function to get final execution lineage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFinalExecutionLineage = (executionLineage: any[] | undefined | null): any[] => {
    if (!executionLineage) {
        return [];
    }

    const hasLineageData = Array.isArray(executionLineage)
        ? executionLineage.length > 0
        : true;

    return hasLineageData ? executionLineage : [];
};

// Helper function to determine test status
const getTestStatus = (testReport: ITestReport | undefined, executionReport: IExecutionReportData, reportScore: number | undefined): TestStatus => {
    // If report is not generated properly or score is undefined, consider it as failed
    if (!testReport || reportScore === undefined) {
        return TestStatus.Failed;
    }
    
    const isPassed = 
        (testReport?.overallStatus === ExecutionItemStatus.Passed || executionReport.status === ExecutionItemStatus.Passed) &&
        testReport?.overallStatus !== ExecutionItemStatus.partial &&
        testReport?.overallStatus !== ExecutionItemStatus.Failed;
    
    return isPassed ? TestStatus.Passed : TestStatus.Failed;
};

type ExecutionReportProps = {
    report: ITestExecutionInputReport;
    execution?: ITestExecutionHistory;
};

export const ExecutionReport = ({ report, execution, inputValue }: ExecutionReportProps & { inputValue?: string }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [executionIdToFetch, setExecutionIdToFetch] = useState<string | null>(null);
    const { executionReport, isLoading } = useExecutionReport(executionIdToFetch);

    // When Report button is clicked, set the execution ID to fetch
    const handleOpenReport = () => {
        setOpen(true);
        // Get executionId from report prop
        if (report.executionId) {
            setExecutionIdToFetch(report.executionId);
        }
    };

    // When modal closes, reset the execution ID to disable the query
    const handleCloseReport = (openState: boolean) => {
        setOpen(openState);
        if (!openState) {
            // Reset execution ID when modal closes to stop any potential refetching
            setTimeout(() => {
                setExecutionIdToFetch(null);
            }, 100);
        }
    };

    const transformedReport = useMemo(() => {
        if (!executionReport) return report;

        const testReport = executionReport.TestReports?.[0];

        const duration =
            executionReport.startedAt && executionReport.completedAt
                ? calculateDuration(executionReport.startedAt, executionReport.completedAt)
                : '0s';

        // Map agent evaluations by nodeId for easier lookup
        const agentEvaluationsMap = new Map(
            testReport?.outputComparisonResult?.agent_evaluations?.map(ae => [ae.nodeId, ae]) || []
        );

        // Get agent outputs and evaluations
        const agentOutputs = executionReport.actualOutput?.agent_outputs;
        const agentEvaluations = testReport?.outputComparisonResult?.agent_evaluations;

        // Build agent step details using helper function
        const agentStepDetails = buildAgentStepDetails(
            agentOutputs,
            agentEvaluations,
            executionReport,
            agentEvaluationsMap
        );

        // Get final steps and execution lineage using helper functions
        const finalSteps = getFinalSteps(agentOutputs, agentEvaluations);
        const finalExecutionLineage = getFinalExecutionLineage(executionReport.executionLineage);

        const reportScore = testReport?.score ? Number.parseInt(testReport.score) : undefined;
        
        return {
            ...report,
            id: executionReport.id,
            status: getTestStatus(testReport, executionReport, reportScore),
            input: executionReport.inputDataSnapshot?.message || report.input,
            executionId: executionReport.id,

            // ANALYSIS TAB - Metrics & Insights
            score: reportScore,
            tokens:
                testReport?.metrics?.inputTokenCount + testReport?.metrics?.outputTokenCount ||
                executionReport.inputTokenCount + executionReport.outputTokenCount,
            totalLatency: testReport?.metrics?.totalLatencyMs
                ? testReport.metrics.totalLatencyMs / 1000
                : executionReport.totalLatencyMs / 1000,
            ragLatency: 0, 
            llmLatency: testReport?.metrics?.totalLatencyMs
                ? testReport.metrics.totalLatencyMs / 1000
                : executionReport.totalLatencyMs / 1000,
            aiInsights: testReport?.summary || '',

            // ANALYSIS TAB - Execution Analysis
            actualOutput: executionReport.actualOutput?.workflow_output || '',
            expectedOutput: executionReport.expectedOutputSnapshot?.expectedOutput || '',
            outputDifferenceRationale: testReport?.outputComparisonResult?.workflow_evaluation?.justification || '',

            // ANALYSIS TAB - Expected Behaviour Comparison
            actualGroundTruth: executionReport.actualOutput?.workflow_reasoning || '', // Actual workflow behavior
            groundTruth: executionReport.expectedOutputSnapshot?.expectedWorkflowBehaviour || '', // Expected workflow behavior
            behaviourDifferenceRationale: testReport?.orchestrationComparisonResult?.evaluation || '',
            groundTruthScore: testReport?.orchestrationComparisonResult?.score,

            // TRACE TAB - Execution Trace & Timeline
            agentStepDetails,
            steps: finalSteps,
            executionLineage: finalExecutionLineage,

            // Header info
            workflow:
                executionReport.workflowName ||
                workflowsList.find(w => w.id === executionReport.workflowId)?.name ||
                'Workflow',
            executedAt: executionReport.startedAt,
            duration,
        } as ITestExecutionInputReport;
    }, [executionReport, report]);

    // Find matching test case from generated test data for tool execution details
    const matchingTestCase = useMemo(() => {
        const inputToMatch = inputValue || transformedReport.input;
        if (!inputToMatch) return null;
        return generatedTestCases.find(
            tc =>
                tc.input.message.toLowerCase().includes(inputToMatch.toLowerCase().slice(0, 50)) ||
                inputToMatch.toLowerCase().includes(tc.input.message.toLowerCase().slice(0, 50))
        );
    }, [inputValue, transformedReport.input]);

    // Get workflow name
    const workflowName = useMemo(() => {
        if (!executionReport) {
            return '-';
        }

        return (
            executionReport.workflowName ||
            workflowsList.find(w => w.id === executionReport.workflowId)?.name ||
            'No Workflow'
        );
    }, [executionReport]);

    return (
        <>
            <Button size={'sm'} className="h-8 text-xs" onClick={handleOpenReport}>
                Report
            </Button>

            <Dialog open={open} onOpenChange={handleCloseReport}>
                <DialogContent className="max-w-[1400px] w-full h-[95vh] flex flex-col p-0 gap-0 bg-gray-50 dark:bg-gray-800 overflow-clip">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">Loading report...</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Dashboard Header */}
                            <ExecutionReportHeader
                                status={transformedReport?.status ?? TestStatus.Failed}
                                workflowName={workflowName}
                                executionId={transformedReport?.executionId || execution?.id}
                                duration={transformedReport?.duration || execution?.executionDuration}
                                date={transformedReport?.executedAt || execution?.createdAt}
                            />

                            <div className="flex-1 overflow-hidden flex flex-col">
                                <Tabs defaultValue="analysis" className="w-full h-full flex flex-col">
                                    <div className="px-8 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
                                        <TabsList className="h-12 bg-transparent p-0 gap-6">
                                            <TabsTrigger
                                                value="analysis"
                                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileChartColumn size={16} /> Analysis
                                                </div>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="trace"
                                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-gray-500 dark:text-gray-400 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Network size={16} /> Trace & Steps
                                                </div>
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-6">
                                        {/* ANALYSIS TAB */}
                                        <TabsContent
                                            value="analysis"
                                            className="m-0 flex flex-col gap-6 justify-start min-h-0"
                                        >
                                            <ExecutionMetricsPanel report={transformedReport} />
                                            <ExecutionAnalysisTab report={transformedReport} inputValue={inputValue} />
                                        </TabsContent>

                                        {/* TRACE TAB */}
                                        <TabsContent value="trace" className="m-0 flex flex-col gap-6 justify-start">
                                            <ExecutionTraceTab
                                                report={transformedReport}
                                                matchingTestCase={matchingTestCase}
                                            />
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>

                            <DialogFooter className="px-8 py-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
                                <Button variant={'secondary'} onClick={() => handleCloseReport(false)}>
                                    Close Report
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
