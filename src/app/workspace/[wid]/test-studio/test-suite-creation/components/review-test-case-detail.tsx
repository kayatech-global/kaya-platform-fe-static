/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Box, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/atoms/input';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { cn } from '@/lib/utils';
import { ITestDataSet, ITestSuite, IToolMockConfig, TestCaseMethod } from '../../data-generation';
import { ReviewTestCaseDataFields } from './review-test-case-data-fields';
import { ReviewTestCaseAgents } from './review-test-case-agents';

export interface IAgentToolCall {
    toolName: string;
    called: boolean;
    reason: string;
    mockResponse: any;
}

export interface IAgentData {
    id: string;
    name: string;
    output: string;
    groundTruth: string;
    index: number;
    evaluationIndex: number;
    toolCalls?: IAgentToolCall[];
}

export interface IToolData {
    key: string;
    toolName: string;
    output: string;
}

type ReviewTestCaseDetailProps = {
    selectedItem?: ITestDataSet,
    selectedTestCaseIndex: number,
    isUpload: boolean,
    agentNames: string[],
    toolsData?: IToolMockConfig[],
    control?: Control<ITestSuite>,
    testCaseMethod?: string,
    onRegenerate?: () => void,
    isRegenerating?: boolean,
    errors?: null | Error
};

export const ReviewTestCaseDetail = ({
    selectedItem,
    selectedTestCaseIndex,
    isUpload,
    agentNames,
    toolsData,
    control,
    testCaseMethod,
    onRegenerate,
    isRegenerating = false,
    errors
}: ReviewTestCaseDetailProps) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(() => {
        setIsEditingTitle(false);
    }, [selectedTestCaseIndex]);

    return (
        <div className="w-[80%] bg-white dark:bg-gray-900 flex flex-col h-full overflow-hidden relative">
            {/* Decorative Top Gradient */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/40 dark:from-indigo-950/20 to-transparent pointer-events-none" />

            {selectedItem ? (
                <>
                    <div className="flex gap-x-3 py-3 border-b dark:border-gray-700 px-3 group bg-blue-600 dark:bg-blue-700 shrink-0 relative z-20">
                        <div className="flex items-center">
                            <span className="text-xs text-white">
                                {selectedItem.displayId}
                            </span>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1">
                                {isEditingTitle && !isUpload && control ? (
                                    <Controller
                                        name={`testDataSets.${selectedTestCaseIndex}.name`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                autoFocus
                                                onBlur={e => {
                                                    field.onChange(e); // Ensure value is updated
                                                    setIsEditingTitle(false);
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                className="text-3xl font-bold text-white tracking-tight border-none shadow-none p-0 h-auto rounded-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-gray-300 px-1 bg-transparent placeholder:text-gray-300 w-full"
                                                placeholder="Test Case Title"
                                            />
                                        )}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 text-3xl font-bold text-white tracking-tight cursor-text border border-transparent hover:border-gray-200 rounded px-1 transition-colors text-left bg-transparent w-full"
                                        onClick={() => !isUpload && control && setIsEditingTitle(true)}
                                        aria-label="Edit test case title"
                                    >
                                        <span className="flex-1 text-left">{selectedItem.name ?? 'Untitled'}</span>
                                        {!isUpload && control && !isEditingTitle && (
                                            <span className="inline-flex p-1 hover:bg-blue-200 rounded text-white hover:text-blue-600 transition-colors" aria-hidden>
                                                <Edit2 className="h-5 w-5 shrink-0" />
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        {testCaseMethod === TestCaseMethod.Auto && (
                            <Button variant="secondary" size="sm" onClick={onRegenerate} disabled={isRegenerating}>
                                <RefreshCw className={cn('mr-2 h-4 w-4', isRegenerating && 'animate-spin')} />
                                {isRegenerating ? 'Regenerating...' : 'Re-Generate'}
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 relative overflow-y-scroll">
                        {isRegenerating && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300">
                                {/* Optional: Add spinner or text here if desired, but button has it */}
                            </div>
                        )}
                        <ScrollArea className="h-30 w-full z-10">
                            <div className="space-y-8 pb-20 pt-6">
                                {/* Level 1: Test Case Summary */}
                                <div className="space-y-6">
                                    <div className="px-8">
                                        {/* Test Case Data */}
                                        <ReviewTestCaseDataFields
                                            key={selectedTestCaseIndex}
                                            selectedItem={selectedItem}
                                            selectedTestCaseIndex={selectedTestCaseIndex}
                                            isUpload={isUpload}
                                            control={control}
                                        />
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                                {/* Level 2: Agents */}
                                <div className="px-8">
                                    <ReviewTestCaseAgents
                                        key={selectedTestCaseIndex}
                                        agentNames={agentNames}
                                        selectedTestCase={selectedItem}
                                        toolsData={toolsData}
                                        selectedTestCaseIndex={selectedTestCaseIndex}
                                        isUpload={isUpload}
                                        control={control}
                                    />
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/30 dark:bg-gray-800/30">
                    <Box className="h-12 w-12 text-gray-200 dark:text-gray-600 mb-3" />
                    {errors ? (
                        <div className="flex flex-col items-center gap-3">
                        <span className="text-red-400 font-bold">
                            Failed to generate test cases.
                        </span>
                            <Button variant="secondary" size="sm" onClick={onRegenerate} disabled={isRegenerating}>
                                <RefreshCw className={cn('mr-2 h-4 w-4', isRegenerating && 'animate-spin')} />
                                {isRegenerating ? 'Regenerating...' : 'Re-Generate'}
                            </Button>
                        </div>
                        // <p className="text-sm font-medium text-center px-8 mt-4">{errors.message}</p>
                    ) : (
                        <p className="text-sm font-medium">Select a test case to view details</p>
                    )}
                </div>
            )}
        </div>
    );
};
