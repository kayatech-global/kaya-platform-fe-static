import React, { useState } from 'react';
import { Button, FormFieldGroup, Input } from '@/components';
import { X, ChevronDown, ChevronRight, Network, FileText, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { TestCaseMethod, ITestSuite } from '../../data-generation';
import { get } from 'lodash';
import {
    Controller,
    Control,
    FieldErrors,
    UseFieldArrayRemove,
    FieldArrayWithId,
    UseFormSetValue,
    UseFormGetValues,
    useWatch,
} from 'react-hook-form';
import { Textarea } from '@/components/atoms/textarea';
import VariableConfigModal from '@/app/workspace/[wid]/workflows/workflow-authoring/components/variable-config-modal';
import { IVariableOption } from '@/models';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';
import { cn } from '@/lib/utils';
import { VariableData } from '@/app/workspace/[wid]/variables/components/variable-table-container';

interface ManualTestCaseListProps {
    fields: FieldArrayWithId<ITestSuite, 'testDataSets', 'id'>[];
    control: Control<ITestSuite, unknown>;
    errors: FieldErrors<ITestSuite>;
    remove: UseFieldArrayRemove;
    setValue: UseFormSetValue<ITestSuite>;
    getValues: UseFormGetValues<ITestSuite>;
    onConfigureAgents?: (index: number) => void;
    variables:VariableData[];
    testCaseMethod?:string; // this is required since Every generation method is using ManualTescaselist when Editing
}

export const ManualTestCaseList = ({
    fields,
    control,
    errors,
    remove,
    setValue,
    onConfigureAgents,
    variables,
    testCaseMethod,
}: ManualTestCaseListProps) => {
    const [variableModalOpen, setVariableModalOpen] = useState(false);
    const [activeVariableIndex, setActiveVariableIndex] = useState<number | null>(null);
    const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set());
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const handleConfirmDelete = () => {
        if (deleteIndex !== null) {
            remove(deleteIndex);
            setDeleteIndex(null);
        }
    };

    const prefix = (() => {
        if (testCaseMethod === TestCaseMethod.Auto) return 'G';
        if (testCaseMethod === TestCaseMethod.Upload) return 'U';
        return 'M';
    })();
    // Watch all inputs to ensure reactivity for variables and previews
    const monitoredInputs = useWatch({
        control,
        name: 'testDataSets',
    });

    const handleOpenVariableModal = (index: number) => {
        setActiveVariableIndex(index);
        setVariableModalOpen(true);
    };

    const handleApplyVariables = (value: IVariableOption[] | undefined) => {
        if (activeVariableIndex !== null && value) {
            setValue(`testDataSets.${activeVariableIndex}.input.variables`, value);
        }
    };

    const toggleCollapse = (index: number) => {
        setCollapsedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const currentVariables =
        activeVariableIndex !== null ? monitoredInputs?.[activeVariableIndex]?.input.variables : undefined;


    return (
        <>
            {fields.map((item, index: number) => {
                // Get variables for this specific item from the watched inputs
                const itemVariables = monitoredInputs?.[index]?.input.variables;
                const variableCount = itemVariables?.length || 0;
                const isCollapsed = collapsedIndices.has(index);
                const itemTitle = monitoredInputs?.[index]?.name;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            'w-full flex flex-col gap-2 mb-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800 border transition-all duration-200',
                            isCollapsed
                                ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                : 'border-gray-200 dark:border-gray-700'
                        )}
                    >
                        <div className="flex flex-col gap-4">
                            {/* Header Row */}
                            <div
                                className={cn(
                                    'flex items-center justify-between transition-all duration-200',
                                    !isCollapsed && 'pb-2 border-b border-gray-100 dark:border-gray-700'
                                )}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleCollapse(index)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    >
                                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                    </button>

                                    <div className="flex flex-col gap-0.5 shrink-0">
                                        <span className="text-[10px] h-3 uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                                            Iteration
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            #{prefix}{index + 1}
                                        </span>
                                    </div>

                                    {isCollapsed && (
                                        <div className="ml-2 flex-1 min-w-0">
                                            <p
                                                className={cn(
                                                    'truncate',
                                                    itemTitle
                                                        ? 'text-sm font-semibold text-gray-900 dark:text-gray-100'
                                                        : 'text-xs italic text-gray-400 dark:text-gray-500'
                                                )}
                                            >
                                                {itemTitle || 'Untitled'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteIndex(index)}
                                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        type="button"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Inputs Section */}
                            {!isCollapsed && (
                                <div className="flex gap-0 relative">
                                    {/* Vertical Timeline Line */}
                                    <div
                                        className="absolute left-5 top-10 w-0.5 bg-gradient-to-b from-green-300 via-blue-300 to-blue-500 dark:from-green-600 dark:via-blue-600 dark:to-blue-700 z-0 h-[calc(100%-90px)]"
                                    ></div>

                                    <div className="flex flex-col gap-4 w-full">
                                        {/* Step 1: Test Case Fields Section */}
                                        <div className="flex items-start gap-4 mb-1 relative z-10">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
                                                    <FileText size={20} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 pb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        Test Case Configuration
                                                    </h3>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                        Step 1
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                    Define the input, Expected output and Expected workflow behaviour
                                                    for the test case
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content Area with Padding */}
                                        <div className="ml-14 flex flex-col gap-4">
                                            <Controller
                                                name={`testDataSets.${index}.name`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: 'Please enter the Title',
                                                    },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                                Title
                                                            </span>
                                                            <span className="text-red-500 text-xs">*</span>
                                                        </div>
                                                        <Input
                                                            placeholder="Enter test case title"
                                                            {...field}
                                                            value={field.value || ''}
                                                            isDestructive={!!fieldState.error?.message}
                                                            supportiveText={fieldState.error?.message}
                                                        />
                                                    </div>
                                                )}
                                            />
                                            <FormFieldGroup title="Input" showSeparator={false} className="w-full">
                                                <div className="relative w-auto col-span-1 sm:col-span-2">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                                        Input Message <span className="text-red-500 test-xs">*</span>
                                                    </h4>
                                                    <p className="text-sm font-normal text-gray-400 mt-0 mb-3">
                                                        {`Enter the test input that will be sent to the workflow. This
                                                        represents what a real user might say or submit. Use natural
                                                        language or structured data depending on your workflow's input
                                                        requirements`}
                                                    </p>
                                                    <div className="w-full mb-3">
                                                        <Controller
                                                            name={`testDataSets.${index}.input.message`}
                                                            control={control}
                                                            rules={{
                                                                required: { value: true, message: 'Please enter the Input' },
                                                            }}
                                                            render={({ field }) => (
                                                                <div className="w-full">
                                                                    <Textarea
                                                                        value={field.value || ''}
                                                                        onChange={field.onChange}
                                                                        onBlur={field.onBlur}
                                                                        placeholder="Provide a concrete example of what the user might say (e.g., 'My order ID is ABC-123')."
                                                                        className="min-h-[140px]"
                                                                        isDestructive={
                                                                            !!get(
                                                                                errors,
                                                                                `testDataSets.${index}.input?.message`
                                                                            )
                                                                        }
                                                                        supportiveText={
                                                                            (get(
                                                                                errors,
                                                                                `testDataSets.${index}.input?.message`
                                                                            ) as unknown as string) || undefined
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="border-t border-gray-200 dark:border-gray-700 my-5"></div>
                                                    <div className="flex flex-col items-center gap-3">
                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            Input Variables
                                                        </h4>
                                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400 text-center">
                                                            You can define variables by clicking on &apos;Configure
                                                            Variables&apos; button
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={
                                                                    variableCount > 0
                                                                        ? 'flex items-center gap-2'
                                                                        : 'hidden'
                                                                }
                                                            >
                                                                {variableCount > 0 && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50 cursor-help transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                                        Variables
                                                                                    </span>
                                                                                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-sm px-1">
                                                                                        {variableCount}
                                                                                    </span>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="max-w-[300px] break-all">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="font-semibold border-b pb-1 mb-1 text-xs">
                                                                                        Configuration Variables
                                                                                    </span>
                                                                                    {itemVariables?.map(
                                                                                        (
                                                                                            v: IVariableOption,
                                                                                            i: number
                                                                                        ) => (
                                                                                            <div
                                                                                                key={v.id ?? `${v.label}-${i}`}
                                                                                                className="text-xs flex justify-between gap-4"
                                                                                            >
                                                                                                <span className="font-medium text-gray-400">
                                                                                                    {v.label}
                                                                                                </span>
                                                                                                <span className="font-semibold">
                                                                                                    {String(v.value)}
                                                                                                </span>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    'text-gray-300',
                                                                    variableCount > 0 ? '' : 'hidden'
                                                                )}
                                                            >
                                                                |
                                                            </span>
                                                            <TooltipProvider>
                                                                <Tooltip delayDuration={300}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleOpenVariableModal(index)
                                                                            }
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
                                                                            Define and manage variables specific to this
                                                                            test case.
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                </div>
                                            </FormFieldGroup>
                                            <Controller
                                                name={`testDataSets.${index}.expectedOutput`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: 'Please enter the Expected Output',
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex-1 items-center gap-2">
                                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                                Expected Output
                                                            </span>
                                                            <span className="text-red-500 text-xs">*</span>
                                                            <p className="text-sm font-normal text-gray-400 mt-2 mb-2">
                                                                Define expected workflow output for the input provided.
                                                                This is used to validate the actual workflow output.
                                                            </p>
                                                        </div>
                                                        <Textarea
                                                            value={field.value || ''}
                                                            onChange={field.onChange}
                                                            onBlur={field.onBlur}
                                                            placeholder="(e.g., 'Agent should identify the invalid format and ask for a correct ID')."
                                                            className="min-h-[140px]"
                                                            isDestructive={
                                                                !!get(
                                                                    errors,
                                                                    `testDataSets.${index}.expectedOutput?.message`
                                                                )
                                                            }
                                                            supportiveText={
                                                                (get(
                                                                    errors,
                                                                    `testDataSets.${index}.expectedOutput?.message`
                                                                ) as unknown as string) || undefined
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name={`testDataSets.${index}.expectedBehaviour`}
                                                control={control}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: 'Please enter the Expected Behaviour',
                                                    },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex-1 items-center gap-2">
                                                            <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
                                                                Expected Workflow Behaviour
                                                            </span>
                                                            <span className="text-red-500 text-xs">*</span>
                                                            <p className="text-sm font-normal text-gray-400  mt-2 mb-2">
                                                                {/*Specify the expected workflow behaviour. This will help to validate decision make align with*/}
                                                                {`Specify the expected workflow behaviour. This helps
                                                                validate the workflow's actual reasoning and decision
                                                                making process.`}
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
                                                            Configure individual agent behaviors, tool mocking, and
                                                            expected outputs for the test case
                                                        </p>
                                                    </div>

                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => onConfigureAgents(index)}
                                                        type="button"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                                                    >
                                                        <Network size={16} className="text-white" />
                                                        <span className="text-xs font-medium">
                                                            Configure Agent Output
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <VariableConfigModal
                isOpen={variableModalOpen}
                isLoading={false}
                variables={variables}
                currentVariable={currentVariables}
                setOpen={setVariableModalOpen}
                onApplyVariables={value => handleApplyVariables(value as IVariableOption[])}
            />
            <Dialog open={deleteIndex !== null} onOpenChange={open => { if (!open) setDeleteIndex(null); }}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this test case?
                            </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant="outline" type="button" onClick={() => setDeleteIndex(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
