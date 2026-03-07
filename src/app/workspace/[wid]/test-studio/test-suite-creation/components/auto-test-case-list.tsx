import React, { useState } from 'react';
import { Controller, Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { Textarea } from '@/components/atoms/textarea';
import { ITestSuite } from '../../data-generation';
import { Button, FormFieldGroup } from '@/components';
import { ChevronDown, ChevronRight, Network, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';
import BulkVariableConfigModal from "./bulk-variable-config-modal";
import { VariableData } from '@/app/workspace/[wid]/variables/components/variable-table-container';
import {IVariableDefinitions} from "@/hooks/use-generate-synthetic-data";

interface AutoTestCaseListProps {
    control: Control<ITestSuite, unknown>;
    setValue: UseFormSetValue<ITestSuite>;
    onConfigureAgents?: () => void;
    variables: VariableData[];
}

export const AutoTestCaseList = ({ control, setValue, onConfigureAgents, variables }: AutoTestCaseListProps) => {
    const [variableModalOpen, setVariableModalOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const autoInputCount =
        useWatch({
            control,
            name: 'autoInputCount',
        }) || 1;

    const autoVariables = useWatch({
        control,
        name: 'autoVariables',
    }) || [];

    const autoScenario =
        useWatch({
            control,
            name: 'autoScenario',
        }) || '';

    const autoSampleInput =
        useWatch({
            control,
            name: 'autoSampleInput',
        }) || '';

    // Save bulk variable config directly to ITestSuite.autoVariables
    const handleApplyVariables = (variablesMap:IVariableDefinitions[]) => {
        setValue('autoVariables', variablesMap , { shouldDirty: true });
    };

    // Build initial data for modal from autoVariables
    const getInitialDataForModal = () => {
        const data: Record<string, { values: string[]; isStrict: boolean }> = {};
        if (autoVariables && autoVariables.length > 0) {
            autoVariables.forEach(v => {
                data[v.key] = {
                    values: Array.isArray(v.allowedValues) ? v.allowedValues: [],
                    isStrict: v.strict,
                };
            });
        }
        return data;
    };

    const getUniqueVariableCount = () => {
        return autoVariables?.length || 0;
    };

    const uniqueVariableCount = getUniqueVariableCount();
    const allConfiguredVariables = getInitialDataForModal();

    return (
        <div
            className={cn(
                'w-full flex flex-col gap-2 mb-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 border transition-all duration-200',
                isCollapsed
                    ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    : 'border-gray-200 dark:border-gray-700'
            )}
        >
            {/* Header Row */}
            <div
                className={cn(
                    'flex items-center justify-between transition-all duration-200',
                    !isCollapsed && 'pb-2 border-b border-gray-100 dark:border-gray-700 mb-2'
                )}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div className="flex flex-col gap-0.5 shrink-0">
                        <span className="text-[10px] h-3 uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                            Configuration
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Auto Generation</span>
                    </div>

                    {isCollapsed && autoScenario && (
                        <div className="ml-4 flex-1 min-w-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate italic">{autoScenario}</p>
                        </div>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="flex gap-0 relative px-2">
                    {/* Vertical Timeline Line */}
                    <div
                        className="absolute left-7 top-10 w-0.5 bg-gradient-to-b from-green-300 via-blue-300 to-blue-500 dark:from-green-600 dark:via-blue-600 dark:to-blue-700 z-0"
                        style={{ height: 'calc(100% - 90px)' }}
                    ></div>

                    <div className="flex flex-col gap-6 w-full">
                        {/* Step 1: Test Case Fields Section */}
                        <div className="flex items-start gap-4 mb-4 relative z-10">
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
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Define the auto-generation parameters including scenario, sample inputs, and
                                    expected behaviors
                                </p>
                            </div>
                        </div>

                        {/* Content Area with Padding */}
                        <div className="ml-14 flex flex-col gap-6">
                            <Controller
                                name="autoScenario"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Please enter the Scenario',
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex-1 items-center gap-2">
                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                Scenario
                                            </span>
                                            <span className="text-red-500 text-xs">*</span>
                                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                                Describe the test scenario you want to validate in natural language. The
                                                AI will use this description to generate multiple relevant test cases.
                                                Be specific about the conditions, user intent, or edge cases you want to
                                                cover.
                                            </p>
                                        </div>
                                        <Textarea
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="(e.g., 'Handling invalid order IDs during refund request')."
                                            className="min-h-[140px]"
                                            isDestructive={!!fieldState.error?.message}
                                            supportiveText={fieldState.error?.message}
                                        />
                                    </div>
                                )}
                            />
                            <FormFieldGroup title="Sample Input" showSeparator={false} >
                                <div className="relative w-auto col-span-1 sm:col-span-2">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Input Message <span className="text-red-500 text-xs">*</span>
                                    </h4>
                                    <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                        Provide an example of what a user might say or submit. The AI uses this as a
                                        sample to generate realistic input variations for your test cases.
                                    </p>
                                    <div className="w-full">
                                        <Controller
                                            name="autoSampleInput"
                                            control={control}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: 'Please enter the Sample Input',
                                                },
                                            }}
                                            render={({ field, fieldState }) => (
                                                <Textarea
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    placeholder="(e.g., 'My order ID is ABC-123')."
                                                    className="min-h-[140px]"
                                                    isDestructive={!!fieldState.error?.message}
                                                    supportiveText={fieldState.error?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-5"></div>
                                    <div className="flex flex-col items-center gap-3">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            Input Variables
                                        </h4>
                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400 text-center">
                                            Define variables by clicking on &apos;Configure Variables&apos; button
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={
                                                    uniqueVariableCount > 0 ? 'flex items-center gap-2' : 'hidden'
                                                }
                                            >
                                                {uniqueVariableCount > 0 && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50 cursor-help transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                        Variables
                                                                    </span>
                                                                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-sm px-1">
                                                                        {uniqueVariableCount}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[360px] break-all">
                                                                <div className="flex flex-col gap-2">
                                                                    <span className="font-semibold border-b pb-1 mb-1 text-xs">
                                                                        Configuration Variables
                                                                    </span>
                                                                    {Object.entries(allConfiguredVariables).map(
                                                                        ([label, data]) => {
                                                                            const vals = (data.values || []).filter(
                                                                                v =>
                                                                                    typeof v !== 'undefined' &&
                                                                                    String(v).trim() !== ''
                                                                            );
                                                                            return (
                                                                                <div key={label} className="text-xs">
                                                                                    <div className="flex items-center justify-between gap-4">
                                                                                        <span className="font-medium text-gray-500">
                                                                                            {label}
                                                                                        </span>
                                                                                        <span className="font-semibold">
                                                                                            {vals.length} values
                                                                                        </span>
                                                                                    </div>
                                                                                    {vals.length > 0 && (
                                                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                                                            {vals.map((vv, idx) => (
                                                                                                <span
                                                                                                    key={`${label}-${idx}`}
                                                                                                    className="px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 text-[10px]"
                                                                                                >
                                                                                                    {String(vv)}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                            <span
                                                className={cn('text-gray-300', uniqueVariableCount > 0 ? '' : 'hidden')}
                                            >
                                                |
                                            </span>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={300}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => setVariableModalOpen(true)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            {/* <Variable size={16} className="text-white" /> */}
                                                            <span className="text-xs font-medium">
                                                                Configure Variables
                                                            </span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>
                                                            Define variables in bulk to be applied across the generated
                                                            test cases.
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            </FormFieldGroup>
                            <Controller
                                name="autoOutput"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Please enter the Sample Output ',
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex-1 items-center gap-2">
                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                Sample Output
                                            </span>
                                            <span className="text-red-500 text-xs">*</span>
                                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                                Provide an example of the workflow output according to the sample input
                                                provided. The AI uses this as a sample to generate appropriate expected
                                                outputs for each test case.
                                            </p>
                                        </div>
                                        <Textarea
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="(e.g., 'Agent should identify the invalid format and ask for a correct ID')."
                                            className="min-h-[140px]"
                                            isDestructive={!!fieldState.error?.message}
                                            supportiveText={fieldState.error?.message}
                                        />
                                    </div>
                                )}
                            />
                            <Controller
                                name="autoGroundTruth"
                                control={control}
                                rules={{
                                    required: {
                                        value: true,
                                        message: 'Please enter the Expected Workflow Behaviour ',
                                    },
                                }}
                                render={({ field, fieldState }) => (
                                    <div className="flex-2 flex-col gap-1.5">
                                        <div className="flex-1 items-center gap-2">
                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                Expected Workflow Behaviour
                                            </span>
                                            <span className="text-red-500 text-xs">*</span>
                                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                                Provide an example of the expected workflow behaviour according to the
                                                sample input provided. The AI uses this as a sample to generate
                                                appropriate expected workflow behaviour for each test case.
                                            </p>
                                        </div>
                                        <Textarea
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            placeholder="(e.g., 'Order IDs must start with ORD- followed by digits')."
                                            className="min-h-[140px]"
                                            isDestructive={!!fieldState.error?.message}
                                            supportiveText={fieldState.error?.message}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        {/* Step 2: Configure Agents Section */}
                        {onConfigureAgents && (
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
                                            Configure samples of individual agent behaviors, tool mocking, and expected
                                            outputs for the auto-generated test cases
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onConfigureAgents?.()}
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                                    >
                                        <Network size={16} className="text-white" />
                                        <span className="text-xs font-medium">Configure Agent Output</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <BulkVariableConfigModal
                isOpen={variableModalOpen}
                setOpen={setVariableModalOpen}
                variables={variables}
                onApplyVariables={handleApplyVariables}
                autoInputCount={autoInputCount}
                initialData={autoVariables}
                testCaseMessage={autoSampleInput}
            />
        </div>
    );
};
