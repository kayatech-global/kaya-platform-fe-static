import React from 'react';
import { Bot, Database, Wrench } from 'lucide-react';
import { Control } from 'react-hook-form';
import { ITestDataSet, ITestSuite, IToolMockConfig } from '../../data-generation';
import { EditableField } from './editable-field';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/molecules/table/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/atoms/dialog';
import { truncate } from 'lodash';

interface ReviewTestCaseAgentsProps {
    agentNames: string[];
    selectedTestCase?: ITestDataSet;
    toolsData?: IToolMockConfig[];
    selectedTestCaseIndex: number;
    isUpload: boolean;
    control?: Control<ITestSuite>;
}

export const ReviewTestCaseAgents = ({
    agentNames,
    selectedTestCase,
    toolsData,
    selectedTestCaseIndex,
    isUpload,
    control,
}: ReviewTestCaseAgentsProps) => {
    if (!agentNames || agentNames.length === 0) {
        if (!isUpload) {
            return (
                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center">
                    <Bot className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No agents configured for this test.</p>
                </div>
            );
        }
        return null;
    }
    const getToolResponse = (toolId?: string, scenarioId?: string) => {
        if (toolsData) {
            const tool = toolsData.find(tool => tool.id === toolId);
            if (tool?.id == toolId && tool?.scenarios?.length) {
                const config = tool.scenarios?.find(scenario => scenario.id === scenarioId)?.config;
                return config || '';
            }
        }
        return '';
    };

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                Review Agents Configurations
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {selectedTestCase?.agentEvaluations?.length == 0 && (
                    <div
                        className={
                            'flex rounded-md border-2 border-dashed h-[100px] w-full items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-500'
                        }
                    >
                        <span>No Agent configurations available for this test case</span>
                    </div>
                )}
                {selectedTestCase?.agentEvaluations?.map((agent, idx) => (
                    <div key={agent.nodeId ?? agent.agentName ?? `agent-${idx}`} className="relative">
                        {/* Timeline Line */}
                        {/*{idx !== selectedTestCase.length - 1 && (*/}
                        {/*    <div className="absolute left-[19px] top-8 bottom-[-16px] w-px bg-blue-600" />*/}
                        {/*)}*/}

                        <div className="flex gap-4">
                            {/* Icon Column */}
                            <div className="flex flex-col items-center">
                                <div className="z-10 bg-white dark:bg-gray-900 p-1">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                                        <i className="ri-robot-3-fill" />
                                    </div>
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 space-y-4 px-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-shadow">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-none">
                                            {agent.agentName}
                                        </h3>
                                    </div>
                                </div>

                                {/* Agent Fields */}
                                <div className="space-y-4">
                                    <EditableField
                                        name={`testDataSets.${selectedTestCaseIndex}.agentEvaluations.${idx}.expectedOutput`}
                                        label="Expected Output"
                                        value={agent.expectedOutput}
                                        readOnly={isUpload || !control}
                                        control={control}
                                        placeholder="No output generated"
                                        icon={<Bot className="h-4 w-4" />}
                                        defaultExpanded={true}
                                    />

                                    <EditableField
                                        name={`testDataSets.${selectedTestCaseIndex}.agentEvaluations.${idx}.expectedBehaviour`}
                                        label="Expected Agent Behavior"
                                        value={agent.expectedBehaviour}
                                        readOnly={isUpload || !control}
                                        control={control}
                                        placeholder="No expected agent behavior provided"
                                        icon={<Database className="h-4 w-4" />}
                                        defaultExpanded={true}
                                    />

                                    {/* Tool Calls Section */}
                                    {agent.toolMockSelections && agent.toolMockSelections.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 pb-3">
                                                <Wrench className="h-4 w-4" />
                                                <span>Data connector responses</span>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                                <Table className="text-sm">
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="px-3 py-2 border">
                                                                Data connector
                                                            </TableHead>
                                                            {/* <TableHead className="px-3 py-2">Status</TableHead>
                                                            <TableHead className="px-3 py-2">Reason</TableHead> */}
                                                            <TableHead className="px-8 py-2 border">
                                                                Mock Response
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {agent.toolMockSelections.map((toolCall, toolIdx) => (
                                                            <TableRow
                                                                key={
                                                                    toolCall.toolId ??
                                                                    toolCall.toolName ??
                                                                    `tool-${toolIdx}`
                                                                }
                                                                role="data-row"
                                                                className={
                                                                    toolIdx % 2 === 0
                                                                        ? 'bg-white dark:bg-gray-800'
                                                                        : 'bg-gray-50/50 dark:bg-gray-700/50'
                                                                }
                                                            >
                                                                <TableCell className="px-3 py-3 text-gray-800 dark:text-gray-200 border">
                                                                    {toolCall.toolName}
                                                                </TableCell>
                                                                {/* <TableCell className="px-3 py-2">
                                                                    {toolCall.called ? (
                                                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                                            <Check className="h-4 w-4" />
                                                                            <span className="text-xs">Called</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-red-500">
                                                                            <X className="h-4 w-4" />
                                                                            <span className="text-xs">Not Called</span>
                                                                        </span>
                                                                    )}
                                                                </TableCell> */}
                                                                {/* <TableCell className="px-3 py-2 text-gray-600">
                                                                    <TruncateCell value={toolCall.reason} length={30} />
                                                                </TableCell> */}
                                                                <TableCell className="px-8 py-3 text-gray-600 dark:text-gray-400 border">
                                                                    <div className="flex items-center gap-2">
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <button
                                                                                    type="button"
                                                                                    className="hover:underline text-left"
                                                                                >
                                                                                    {truncate(
                                                                                        getToolResponse(
                                                                                            toolCall.toolId,
                                                                                            toolCall.selectedScenarioId
                                                                                        ),
                                                                                        { length: 120 }
                                                                                    )}
                                                                                </button>
                                                                            </DialogTrigger>
                                                                            <DialogContent className="max-w-2xl max-h-[80vh]">
                                                                                <DialogHeader>
                                                                                    <DialogTitle>
                                                                                        Scenario - {toolCall.toolName}
                                                                                    </DialogTitle>
                                                                                </DialogHeader>
                                                                                <DialogBody className="max-h-[60vh] pb-3">
                                                                                    <pre className="text-sm overflow-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-md border dark:border-gray-700 h-full ">
                                                                                        {getToolResponse(
                                                                                            toolCall.toolId,
                                                                                            toolCall.selectedScenarioId
                                                                                        )}
                                                                                    </pre>
                                                                                </DialogBody>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tools Section */}
                                    {/*<ReviewAgentTools toolsData={toolsData} isUpload={isUpload} control={control} />*/}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
