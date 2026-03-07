'use client';

import React, { useState } from 'react';
import { FileText, ListChecks, Network } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { Button } from '@/components';
import { ITestDataSet, ITestSuite, IToolMockConfig, TestCaseMethod } from '../../data-generation';
import { IVariableOption } from '@/models';
import { Control, useWatch } from 'react-hook-form';
import { useExcelUpload } from '@/hooks/use-excel-upload';
import { ReviewTestCaseList } from './review-test-case-list';
import { ReviewTestCaseDetail } from './review-test-case-detail';

type ReviewTestDataModalProps = {
    isOpen: boolean;
    setIsOpenAction: (open: boolean) => void;
    inputs: ITestDataSet[];
    workflowName?: string;
    agentOutputFields?: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>;
    agentNames?: string[];
    agentIds?: string[];
    testName?: string;
    // Control for binding
    control?: Control<ITestSuite>;
    onCreateAction?: (
        data: ITestDataSet[],
        agentFields?: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>
    ) => void;
    isEdit?: boolean;
    onUpdateAction?: (
        data: ITestDataSet[],
        agentFields?: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>
    ) => void;
    setDrawerOpen?: (open: boolean) => void;
    // Extra props for file upload mapping
    testCaseMethod?: string;
    uploadedFile?: File | null;
    titleColumn?: string;
    inputColumn?: string;
    outputColumn?: string;
    truthColumn?: string;
    agentColumnMappings?: Record<string, { outputColumn?: string; truthColumn?: string }>;
    toolOutputDefinitions?: IToolMockConfig[];
    uploadVariables?: IVariableOption[];
};

export const ReviewTestDataModal = ({
    isOpen,
    setIsOpenAction,
    inputs,
    agentNames = [],
    agentIds = [],
    testName,
    workflowName,
    control,
    onCreateAction,
    isEdit,
    onUpdateAction,
    setDrawerOpen,
    testCaseMethod,
    uploadedFile,
    titleColumn,
    inputColumn,
    outputColumn,
    truthColumn,
    agentColumnMappings,
    agentOutputFields = {},
    toolOutputDefinitions,
    uploadVariables,
}: ReviewTestDataModalProps) => {
    const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);

    // Use custom hook for Excel upload logic
    const { excelRows, isLoadingFile, fileError } = useExcelUpload(testCaseMethod, uploadedFile);

    // Track any per-test-case variable overrides the user makes in the review step
    const formTestDataSets = useWatch({ control, name: 'testDataSets' }) as { input?: { variables?: IVariableOption[] } }[] | undefined;

    // Normalization Logic for Save/Update
    const getNormalizedInputs = () => {
        let normalizedInputs = inputs ? [...inputs] : [];
        if (testCaseMethod === TestCaseMethod.Upload && Array.isArray(excelRows) && excelRows.length > 0) {
            const titleCol: string = typeof titleColumn === 'string' ? titleColumn : '';
            const inputCol: string = typeof inputColumn === 'string' ? inputColumn : '';
            const outputCol: string = typeof outputColumn === 'string' ? outputColumn : '';
            const truthCol: string = typeof truthColumn === 'string' ? truthColumn : '';

            normalizedInputs = excelRows
                .map((row, idx) => {
                    // If the user explicitly set variables for this row in the review step,
                    // use those overrides; otherwise compute from the Excel column mapping.
                    const formRowVariables = formTestDataSets?.[idx]?.input?.variables;
                    const variables: IVariableOption[] =
                        formRowVariables && formRowVariables.length > 0
                            ? formRowVariables
                            : uploadVariables && uploadVariables.length > 0
                              ? uploadVariables.map(v => ({
                                    label: v.label,
                                    value: v.value ? String(row[String(v.value)] ?? '') : '',
                                    type: v.type,
                                }))
                              : [];
                    return {
                        name: titleCol ? String(row[titleCol] ?? '') : 'Uploaded Test Case',
                        input: { message: String(row[inputCol] ?? ''), variables },
                        expectedOutput: String(row[outputCol] ?? ''),
                        expectedBehaviour: String(row[truthCol] ?? ''),
                    };
                })
                .filter(row => row.input.message || row.expectedOutput || row.expectedBehaviour) as ITestDataSet[];
        }
        return normalizedInputs;
    };

    const getNormalizedAgentFields = () => {
        if (testCaseMethod === TestCaseMethod.Upload && Array.isArray(excelRows) && excelRows.length > 0 && !isEdit) {
            const agentFields: Record<string, { expectedOutput: string; expectedBehaviour: string }[]> = {};

            agentIds.forEach(agentId => {
                const mapping = agentColumnMappings?.[agentId];
                if (mapping) {
                    const outputCol = mapping.outputColumn ?? '';
                    const truthCol = mapping.truthColumn ?? '';

                    agentFields[agentId] = excelRows.map(row => ({
                        expectedOutput: outputCol && row[outputCol] ? String(row[outputCol]) : '',
                        expectedBehaviour: truthCol && row[truthCol] ? String(row[truthCol]) : '',
                    }));
                } else {
                    // Empty defaults if no mapping
                    agentFields[agentId] = excelRows.map(() => ({ expectedOutput: '', expectedBehaviour: '' }));
                }
            });
            return agentFields;
        }
        return agentOutputFields;
    };

    // Builds agentEvaluations for a single upload test case row, combining per-row column
    // mapping data with toolMockSelections from the shared template (testDataSets[0]).
    const buildUploadAgentEvaluations = (
        agentFields: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>,
        templateAgentEvals: ITestDataSet['agentEvaluations'],
        rowIndex: number
    ) => {
        return agentIds.map((agentId, agentIdx) => {
            const templateEval = templateAgentEvals?.find(ae => ae.nodeId === agentId);
            return {
                nodeId: agentId,
                agentName: agentNames[agentIdx] || agentId,
                expectedOutput: agentFields[agentId]?.[rowIndex]?.expectedOutput || '',
                expectedBehaviour: agentFields[agentId]?.[rowIndex]?.expectedBehaviour || '',
                toolMockSelections: templateEval?.toolMockSelections ?? [],
            };
        });
    };

    // Enriches each upload test case with agentEvaluations that include both column
    // mapping data and toolMockSelections from the template at testDataSets[0].
    const enrichUploadInputs = (
        normalizedInputs: ITestDataSet[],
        agentFields: Record<string, { expectedOutput: string; expectedBehaviour: string }[]>
    ): ITestDataSet[] => {
        const templateAgentEvals = inputs?.[0]?.agentEvaluations;
        return normalizedInputs.map((item, idx) => ({
            ...item,
            agentEvaluations: buildUploadAgentEvaluations(agentFields, templateAgentEvals, idx),
        }));
    };

    const handleCreateOrUpdate = () => {
        const rawInputs = getNormalizedInputs();
        const finalAgentFields = getNormalizedAgentFields();

        const finalInputs =
            testCaseMethod === TestCaseMethod.Upload && !isEdit
                ? enrichUploadInputs(rawInputs, finalAgentFields)
                : rawInputs;

        if (isEdit && onUpdateAction) {
            onUpdateAction(finalInputs, finalAgentFields);
        } else if (onCreateAction) {
            onCreateAction(finalInputs, finalAgentFields);
        }
        setIsOpenAction(false);
        if (setDrawerOpen) setDrawerOpen(false);
    };

    // Helper to get display data based on method
    const getDisplayData = () => {
        if (testCaseMethod === TestCaseMethod.Upload && !isEdit) {
            const normalizedInputs = getNormalizedInputs();
            const agentFields = getNormalizedAgentFields();
            return {
                items: enrichUploadInputs(normalizedInputs, agentFields),
                isUpload: true,
            };
        }
        return { items: inputs || [], isUpload: false };
    };

    const { items: displayItems, isUpload } = getDisplayData();
    const selectedItem = displayItems[selectedTestCaseIndex];

    const isSubmitDisabled =
        isLoadingFile ||
        displayItems.some(
            item =>
                !item.input?.message?.trim() ||
                !item.expectedOutput?.trim() ||
                !item.expectedBehaviour?.trim()
        );

    // Prepare Agent Data for Detail View

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpenAction}>
            <DialogContent className="max-w-[85vw] w-full h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader >
                    <DialogTitle className="flex items-center gap-2 ">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Review Test Cases
                    </DialogTitle>
                    {(testName || workflowName) && (
                        <div className="flex items-center gap-4 text-sm text-gray-500 !mt-0 pr-10 pt-3">
                            {testName && (
                                <span className="flex items-center gap-1.5 dark:text-gray-400">
                                    <ListChecks size={14} className="text-blue-600 dark:text-blue-300" />
                                    Test: <span className="font-medium text-gray-900 pl-1 dark:text-gray-200">{testName}</span>
                                </span>
                            )}
                            <span>|</span>
                            {workflowName && (
                                <span className="flex items-center gap-1.5 dark:text-gray-400">
                                    <Network size={14} className="text-green-600" />
                                    Workflow: <span className="font-medium text-gray-900 pl-1 dark:text-gray-200">{workflowName}</span>
                                </span>
                            )}
                        </div>
                    )}
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    <ReviewTestCaseList
                        items={displayItems}
                        selectedTestCaseIndex={selectedTestCaseIndex}
                        setSelectedTestCaseIndex={setSelectedTestCaseIndex}
                        isLoadingFile={isLoadingFile}
                        fileError={fileError}
                        testCaseMethod={testCaseMethod}
                        agentOutputFields={agentOutputFields}
                        agentIds={agentIds}
                    />
                    <ReviewTestCaseDetail
                        selectedItem={selectedItem}
                        selectedTestCaseIndex={selectedTestCaseIndex}
                        isUpload={isUpload}
                        agentNames={agentNames}
                        toolsData={toolOutputDefinitions}
                        control={control}
                        testCaseMethod={testCaseMethod}
                    />
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsOpenAction(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateOrUpdate} disabled={isSubmitDisabled}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
