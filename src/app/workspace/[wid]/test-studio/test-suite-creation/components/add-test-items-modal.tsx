/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '@/components/atoms/dialog';
import { Button } from '@/components';
import { RadioGroup } from '@/components/atoms/radio-group';
import RadioCard from '@/components/molecules/radio-card/radio-card';
import { ITestSuite, ITestDataSet } from '../../data-generation';
import { useForm } from 'react-hook-form';
import { DatasetConfigurationsStep } from './dataset-configurations-step';
import { TestCaseMethod } from '@/enums/test-studio-type';

type AddTestItemsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    testData: ITestSuite | null;
    onSave: (
        updatedInputs: ITestDataSet[],
        agentOutputFields?: Record<
            string,
            { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]
        >
    ) => void;
};

export const AddTestItemsModal = ({ isOpen, onClose, testData, onSave }: AddTestItemsModalProps) => {
    const [isModalFullscreen, setIsModalFullscreen] = useState<boolean>(false);

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        reset,
        getValues,
        formState: { errors, isValid },
    } = useForm<ITestSuite>({
        defaultValues: {
            testDataSets: [],
            testCaseMethod: TestCaseMethod.Manual,
            autoInputCount: 1,
            autoScenario: '',
            autoSampleInput: '',
            autoOutput: '',
            autoGroundTruth: '',
            uploadedFile: null,
            uploadedFileName: '',
            excelHeaders: [],
            inputColumn: '',
            outputColumn: '',
            truthColumn: '',
            // Ensure workflow details are present for AgentConfigurationStep
            workflowId: testData?.workflowId ?? '',
            workflowName: testData?.workflowName ?? '',
            name: testData?.name ?? '',
            description: testData?.description ?? '',
        },
    });

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            const method = TestCaseMethod.Manual; // Default to manual when adding new items
            reset({
                ...testData, // Bring in all testData props including workflowId
                testDataSets: method === TestCaseMethod.Manual ? [{ input: {}, expectedOutput: '', expectedBehaviour: '' }] : [],
                testCaseMethod: method,
                autoInputCount: 1,
                autoScenario: '',
                autoSampleInput: '',
                autoOutput: '',
                autoGroundTruth: '',
                uploadedFile: null,
                uploadedFileName: '',
                uploadedFileSize: 0,
                uploadedFileData: '',
                excelHeaders: [],
                inputColumn: '',
                outputColumn: '',
                truthColumn: '',
            });
        }
    }, [isOpen, reset, testData]);

    const testCaseMethod = watch('testCaseMethod');
    const inputs = watch('testDataSets') || [];

    // Derived config objects for steps
    const testConfiguration = useMemo(
        () => ({
            name: watch('name'),
            workflowType: watch('workflowType'),
            workflowId: watch('workflowId'),
            workflowName: watch('workflowName'),
            description: watch('description'),
            externalWorkflowUrl: watch('externalWorkflowUrl'),
        }),
        [watch]
    );

    // Handle Save/Submit logic (adapted from original component)
    const handleSaveClick = handleSubmit(async data => {
        const currentMethod = data.testCaseMethod;
        const uploadedFile = data.uploadedFile;
        const inputColumn = data.inputColumn;
        const outputColumn = data.outputColumn;
        const truthColumn = data.truthColumn;
        const agentSampleSelections = data.agentSampleSelections || {};

        if (currentMethod === TestCaseMethod.Upload && uploadedFile) {
            try {
                // Read Excel file
                const fileData = data.uploadedFileData ?? (await uploadedFile.arrayBuffer());

                const workbook = XLSX.read(fileData, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet);

                // Extract test inputs based on column mappings
                const newInputs: ITestDataSet[] = jsonData
                    .map((row: Record<string, unknown>) => ({
                        input: { message: String(row[inputColumn || ''] ?? '') },
                        expectedOutput: String(row[outputColumn || ''] ?? ''),
                        expectedBehaviour: String(row[truthColumn || ''] ?? ''),
                    }))
                    .filter(row => row.input || row.expectedOutput || row.expectedBehaviour);

                // Build agent output fields based on agent sample selections
                const newAgentOutputFields: Record<
                    string,
                    { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]
                > = {};

                // Populate with Excel data
                Object.keys(agentSampleSelections).forEach(agentId => {
                    const selection = agentSampleSelections[agentId];
                    if (selection && (selection.output || selection.expectedBehaviour)) {
                        newAgentOutputFields[agentId] = jsonData.map((row: Record<string, unknown>) => ({
                            expectedOutput: String(row[selection.output] ?? ''),
                            expectedBehaviour: String(row[selection.expectedBehaviour] ?? ''),
                            instruction: selection.instruction ? String(row[selection.instruction] ?? '') : '',
                        }));
                    } else {
                        // Fallback empty
                        newAgentOutputFields[agentId] = jsonData.map(() => ({
                            expectedOutput: '',
                            expectedBehaviour: '',
                            instruction: '',
                        }));
                    }
                });

                onSave(newInputs, newAgentOutputFields);
                onClose();
            } catch{
                alert('Failed to parse Excel file. Please check the file format.');
            }
        } else {
            // Auto or Manual - both pass testDataSets and agentOutputFields
            onSave(data.testDataSets || [], data.agentOutputFields);
            onClose();
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={
                    isModalFullscreen
                        ? 'custom-drawer-content !w-full !h-full max-w-none m-0'
                        : 'custom-drawer-content !w-full max-w-full max-h-[100vh] flex flex-col'
                }
            >
                <DialogHeader>
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle>
                            <div className="flex items-center gap-2">
                                <span>Add Test Cases</span>
                            </div>
                        </DialogTitle>
                        <button
                            onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors mr-8"
                            aria-label={isModalFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        ></button>
                    </div>
                </DialogHeader>

                <DialogBody className="overflow-auto flex-1 p-0 px-4">
                    <div className="h-full px-4 py-2">
                        {/* Test Case Method Selection */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    How would you like to create the Test cases?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select a method to create test cases. You can manually input your cases, get
                                    leverage AI for automatic generation, or import an existing Excel file.
                                </p>
                            </div>
                            <RadioGroup
                                value={testCaseMethod}
                                onValueChange={value =>
                                    setValue('testCaseMethod', value as TestCaseMethod)
                                }
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-3">
                                    <RadioCard
                                        value="manual"
                                        label="Manually Define"
                                        description="You can manually configure the required test case inputs one by one."
                                        checked={testCaseMethod === TestCaseMethod.Manual}
                                        isInline={true}
                                    />
                                    <RadioCard
                                        value="auto"
                                        label="Auto Generate"
                                        description="You can automatically generate test cases using AI, based on your requirements."
                                        checked={testCaseMethod === TestCaseMethod.Auto}
                                        isInline={true}
                                    />
                                    <RadioCard
                                        value="upload"
                                        label="File Upload"
                                        description="You can upload an Excel file containing the test cases in bulk. "
                                        checked={testCaseMethod === TestCaseMethod.Upload}
                                        isInline={true}
                                    />
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Dataset Configuration Content */}
                        <DatasetConfigurationsStep
                            isOpen={isOpen}
                            setIsOpen={() => {}}
                            isEdit={false}
                            register={register}
                            handleSubmit={handleSubmit}
                            control={control}
                            watch={watch}
                            setValue={setValue}
                            reset={reset}
                            errors={errors}
                            isValid={isValid}
                            fields={inputs as any[]}
                            append={(() => {}) as any}
                            remove={(() => {}) as any}
                            getValues={getValues}
                            isModalFullscreen={isModalFullscreen}
                            setIsModalFullscreen={setIsModalFullscreen}
                            testConfiguration={testConfiguration}
                        />
                    </div>
                </DialogBody>

                <DialogFooter className="border-t bg-gray-50 px-6 py-4">
                    <div className="flex justify-end items-center w-full gap-2">
                        <Button variant={'secondary'} size={'sm'} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button size={'sm'} onClick={handleSaveClick}>
                            Add Items
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
