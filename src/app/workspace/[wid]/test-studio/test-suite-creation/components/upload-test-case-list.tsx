'use client';

import React, { useMemo } from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import {
    Button,
    Select,
    Label,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    FormFieldGroup,
} from '@/components';
import { FileText, Network } from 'lucide-react';
import { ITestSuite } from '../../data-generation';
import { IVariableOption } from '@/models';
import { cn } from '@/lib/utils';

type InputVariablesConfigProps = {
    uploadVariables?: IVariableOption[];
    onConfigureClick: () => void;
};

const InputVariablesConfig = ({ uploadVariables, onConfigureClick }: InputVariablesConfigProps) => {
    const hasVariables = (uploadVariables?.length ?? 0) > 0;
    return (
        <div className="flex flex-col items-center gap-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Input Variables</h4>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400 text-center">
                You can define variables by clicking on &apos;Configure Variables&apos; button
            </p>
            <div className="flex items-center gap-2">
                <div className={cn('flex items-center gap-2', !hasVariables && 'hidden')}>
                    {hasVariables && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50 cursor-help transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                                        <span className="text-[10px] font-bold uppercase tracking-tight">
                                            Variables
                                        </span>
                                        <span className="bg-blue-100 text-blue-600 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-sm px-1">
                                            {uploadVariables?.length ?? 0}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px] break-all">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold border-b pb-1 mb-1 text-xs">
                                            Configuration Variables
                                        </span>
                                        {uploadVariables?.map((v: IVariableOption, i: number) => (
                                            <div
                                                key={v.id ?? `${v.label}-${i}`}
                                                className="text-xs flex justify-between gap-4"
                                            >
                                                <span className="font-medium text-gray-400">{v.label}</span>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    ↳ {String(v.value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <span className={cn('text-gray-300', !hasVariables && 'hidden')}>|</span>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onConfigureClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <span className="text-xs font-medium">Configure Variables</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Define and manage variables for the uploaded dataset.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

// Helper function to check if a column should be disabled
const isColumnDisabled = (
    header: string,
    currentField: string,
    selectedColumns: Record<string, string | undefined>
): boolean => {
    return Object.entries(selectedColumns).some(
        ([field, value]) => field !== currentField && value === header
    );
};

// Helper function to create options with disabled state
const createOptionsForField = (
    excelHeaders: string[],
    currentField: 'title' | 'input' | 'output' | 'truth',
    selectedColumns: {
        title?: string;
        input?: string;
        output?: string;
        truth?: string;
    }
) => {
    return excelHeaders.map((header: string) => ({
        name: header,
        value: header,
        disabled: isColumnDisabled(header, currentField, selectedColumns),
    }));
};

interface UploadTestCaseListProps {
    control: Control<ITestSuite>;
    excelHeaders: string[];
    uploadVariables?: IVariableOption[];
    agentIds?: string[];
    onConfigureVariables: () => void;
    onConfigureAgents: () => void;
}

export const UploadTestCaseList = ({
    control,
    excelHeaders,
    uploadVariables,
    agentIds,
    onConfigureVariables,
    onConfigureAgents,
}: UploadTestCaseListProps) => {
    // Watch all column selections
    const titleColumn = useWatch({ control, name: 'titleColumn' });
    const inputColumn = useWatch({ control, name: 'inputColumn' });
    const outputColumn = useWatch({ control, name: 'outputColumn' });
    const truthColumn = useWatch({ control, name: 'truthColumn' });

    // Get selected columns object
    const selectedColumns = useMemo(
        () => ({
            title: titleColumn,
            input: inputColumn,
            output: outputColumn,
            truth: truthColumn,
        }),
        [titleColumn, inputColumn, outputColumn, truthColumn]
    );

    // Get options for each field
    const titleOptions = useMemo(
        () => createOptionsForField(excelHeaders, 'title', selectedColumns),
        [excelHeaders, selectedColumns]
    );

    const inputOptions = useMemo(
        () => createOptionsForField(excelHeaders, 'input', selectedColumns),
        [excelHeaders, selectedColumns]
    );

    const outputOptions = useMemo(
        () => createOptionsForField(excelHeaders, 'output', selectedColumns),
        [excelHeaders, selectedColumns]
    );

    const truthOptions = useMemo(
        () => createOptionsForField(excelHeaders, 'truth', selectedColumns),
        [excelHeaders, selectedColumns]
    );

    return (
        <fieldset className="border border-gray-300 rounded-lg p-3 mt-2">
            <legend className="text-xs px-2 text-gray-500">Map Data set</legend>

            <div className="flex gap-0 relative">
                {/* Vertical Timeline Line */}
                <div
                    className="absolute left-5 top-10 w-0.5 bg-gradient-to-b from-green-300 via-blue-300 to-blue-500 dark:from-green-600 dark:via-blue-600 dark:to-blue-700 z-0"
                    style={{ height: 'calc(100% - 90px)' }}
                ></div>

                <div className="flex flex-col gap-4 w-full">
                    {/* Step 1: Map Dataset Fields Section */}
                    <div className="flex items-start gap-4 mb-2 relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
                                <FileText size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Test Case Configuration
                                </h3>
                                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                    Step 1
                                </span>
                            </div>
                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2 w-[90%]">
                                Match columns from your uploaded Excel/CSV file to the required test case fields.
                                Each dropdown shows the column names from your file. This mapping tells the system
                                which data to use for inputs, expected outputs, and Expected workflow behavior.
                            </p>
                        </div>
                    </div>

                    {/* Fields Section - Flex Column Layout */}
                    <div className="ml-14 flex flex-col gap-8 mb-3">
                        <div className="flex flex-col gap-1 w-full">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                Select the column from your uploaded file that contains the test case titles or
                                names. This column will be used to identify each test case in the review screen. If
                                no column is selected, default titles will be used.
                            </p>
                            <Controller
                                name="titleColumn"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <Select
                                        options={titleOptions}
                                        value={field.value || ''}
                                        onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                            const value = typeof val === 'string' ? val : val?.target?.value || '';
                                            field.onChange(value);
                                        }}
                                        hasClear={!!field.value}
                                        onClear={() => field.onChange('')}
                                        placeholder="Select data"
                                        className="border rounded-md px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    />
                                )}
                            />
                        </div>
                        <FormFieldGroup title="Input" showSeparator={false}>
                            <div className="relative w-auto col-span-1 sm:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Input Message <span className="text-red-500">*</span>
                                </h4>
                                <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                    Select the column from your uploaded file that contains the test inputs. This
                                    column should have the messages or data that will be sent to the workflow during
                                    test execution.
                                </p>
                                <div className="w-full">
                                    <Controller
                                        name="inputColumn"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <Select
                                                options={inputOptions}
                                                value={field.value || ''}
                                                onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                                    const value = typeof val === 'string' ? val : val?.target?.value || '';
                                                    field.onChange(value);
                                                }}
                                                hasClear={!!field.value}
                                                onClear={() => field.onChange('')}
                                                placeholder="Select data"
                                                className="border rounded-md px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-5"></div>
                                <InputVariablesConfig
                                    uploadVariables={uploadVariables}
                                    onConfigureClick={onConfigureVariables}
                                />
                            </div>
                        </FormFieldGroup>
                        <div className="flex flex-col gap-1 w-full">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Expected Output <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                Select the column that contains the expected workflow responses. These values will be
                                compared against actual outputs during test execution to determine pass/fail status.
                            </p>
                            <Controller
                                name="outputColumn"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <Select
                                        options={outputOptions}
                                        value={field.value || ''}
                                        onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                            const value = typeof val === 'string' ? val : val?.target?.value || '';
                                            field.onChange(value);
                                        }}
                                        hasClear={!!field.value}
                                        onClear={() => field.onChange('')}
                                        placeholder="Select data"
                                        className="border rounded-md px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    />
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Expected workflow behavior <span className="text-red-500">*</span>
                            </Label>
                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                {`Select the column containing factual references or business rules for
                                validation. This is optional but helps verify that the workflow's reasoning aligns
                                with your policies and compliance requirements.`}
                            </p>
                            <Controller
                                name="truthColumn"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <Select
                                        options={truthOptions}
                                        value={field.value || ''}
                                        onChange={(val: string | React.ChangeEvent<HTMLSelectElement>) => {
                                            const value = typeof val === 'string' ? val : val?.target?.value || '';
                                            field.onChange(value);
                                        }}
                                        hasClear={!!field.value}
                                        onClear={() => field.onChange('')}
                                        placeholder="Select data"
                                        className="border rounded-md px-2 py-1 w-full text-gray-900 dark:text-gray-100"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Step 2: Agent Configuration Section */}
                    <div className="mt-6 flex items-start gap-4 relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-md relative">
                                <Network size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="flex justify-between items-start w-full">
                            <div className="flex flex-col gap-1 mb-1">
                                <div className="flex gap-2 items-center">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Agent Level Configuration
                                    </h3>
                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                        Step 2
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Configure individual agent behaviors, tool mocking, and expected outputs for the
                                    uploaded dataset
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onConfigureAgents}
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                            >
                                <Network size={16} className="text-white" />
                                <span className="text-xs font-medium">Configure Agent Output</span>
                            </Button>
                        </div>
                    </div>

                    {/* Agent Mapping Section */}
                    <div className="mt-4 border-t pt-3" style={{ display: 'none' }}>
                        <div className="flex items-center justify-end">
                            {agentIds && agentIds.length > 0 && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={onConfigureAgents}
                                    type="button"
                                >
                                    <Network size={16} />
                                    <span className="text-xs font-medium hover:text-blue-600 hover:underline">
                                        Configure Agents
                                    </span>
                                </Button>
                            )}
                        </div>
                        {(!agentIds || agentIds.length === 0) && (
                            <p className="text-xs text-gray-500 italic mt-1">
                                No agents detected in this workflow configuration.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </fieldset>
    );
};
