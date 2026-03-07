/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ITestExecutionInputReport, TestStatus, AgentStepDetail } from '../../data-generation';
import { Network, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { ExecutionStepLinearGraph } from '@/components/organisms';
import {
    ExecutionStepTimelineMarker,
    ExecutionStepInputOutput,
    ToolExecutionsPanel,
} from '@/components/molecules/execution-steps';
import { ExecutionStepBadge } from '@/components/atoms';
import { ExecutionStepBadgeType } from '@/enums/component-type';
import { parseExecutionLineage, IExecutionLineageStep } from '../../utils/execution-lineage-parser';
import { IDataLineageVisualGraph } from '@/models';

type ExecutionStepsBreakdownProps = {
    report: ITestExecutionInputReport;
    showGraphOnly?: boolean;
    showStepsOnly?: boolean;
    matchingTestCase?: any;
};

export const ExecutionStepsBreakdown = ({
    report,
    showGraphOnly,
    showStepsOnly,
    matchingTestCase,
}: ExecutionStepsBreakdownProps) => {
    // Parse execution lineage from API response
    let executionLineageData: IDataLineageVisualGraph | null = null;
    if (report?.executionLineage && Array.isArray(report.executionLineage) && report.executionLineage.length > 0) {
        const parsedData = parseExecutionLineage(report.executionLineage as IExecutionLineageStep[]);
        if (parsedData.nodes.length > 0) {
            executionLineageData = parsedData;
        }
    }

    if (showGraphOnly) {
        return (
            <div className="w-full h-full">
                {executionLineageData ? (
                    <ExecutionStepLinearGraph graphData={executionLineageData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        No execution lineage data available for this workflow.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-md mb-4">
            {/* Execution Steps Graph Section - Only show if not in steps-only modes */}
            {!showStepsOnly && (
                <div className="mt-2 mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Network size={16} className="text-blue-600 dark:text-blue-400" />
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Agent Flow Execution</p>
                    </div>
                    <div className="h-[200px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                        {executionLineageData ? (
                            <ExecutionStepLinearGraph graphData={executionLineageData} />
                        ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                No execution lineage data available for this workflow.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Step Details / Timeline */}
            <div className="space-y-4">
                {report?.steps && report.steps.length > 0 ? (
                    report.steps.map((step, i) => {
                        const agentStep: AgentStepDetail = report.agentStepDetails?.[i] || ({} as AgentStepDetail);
                        // Use real score from API or default to 0
                        const currentScore = agentStep.score ?? 0;
                        // Use real status from API
                        const agentStatus = agentStep.status ?? TestStatus.Failed;

                        // Find the agent's actual stepIndex from executionLineage
                        const agentLineageStep = report.executionLineage?.find(
                            (lineageStep: any) => 
                                lineageStep.entityType === 'AGENT' && 
                                (lineageStep.stepName?.toLowerCase().includes(step.toLowerCase()) || 
                                 lineageStep.entityName?.toLowerCase().includes(step.toLowerCase()))
                        );
                       
                        const agentStepIndex = agentLineageStep?.stepIndex ?? i;

                        // Extract tool executions for this step from executionLineage
                        let toolExecutions = report.executionLineage?.filter(
                            (lineageStep: any) => 
                                lineageStep.entityType === 'TOOL' && lineageStep.stepIndex === agentStepIndex
                        ) || [];

                        // If no tools found with agentStepIndex,
                        if (toolExecutions.length === 0 && !agentLineageStep) {
                            toolExecutions = report.executionLineage?.filter(
                                (lineageStep: any) => 
                                    lineageStep.entityType === 'TOOL' && lineageStep.stepIndex === (i + 1)
                            ) || [];
                        }

                        return (
                            <div key={`step-${step}-${i}`} className="flex gap-4">
                                {/* Timeline Line */}
                                <ExecutionStepTimelineMarker
                                    stepNumber={i + 1}
                                    isLast={i === (report.steps?.length || 0) - 1}
                                />

                                {/* Content Card */}
                                <Accordion type="single" collapsible className="w-full pb-6">
                                    <AccordionItem
                                        value={`step-${i}`}
                                        className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
                                    >
                                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" >
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                                        {step}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                        <TrendingUp size={12} />
                                                        <ExecutionStepBadge
                                                            score={currentScore}
                                                            type={ExecutionStepBadgeType.Score}
                                                        />
                                                    </div>

                                                    <ExecutionStepBadge
                                                        score={agentStatus === TestStatus.Passed ? 100 : 0}
                                                        type={ExecutionStepBadgeType.Status}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-5 pb-5 pt-0" forceMount>
                                            <ExecutionStepInputOutput agentStep={agentStep} />

                                            {/* Tool Execution Section - Use real backend data */}
                                            {toolExecutions.length > 0 && (
                                                <ToolExecutionsPanel
                                                    toolExecutions={toolExecutions}
                                                    stepIndex={i}
                                                />
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            No agent execution steps found for this workflow
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
