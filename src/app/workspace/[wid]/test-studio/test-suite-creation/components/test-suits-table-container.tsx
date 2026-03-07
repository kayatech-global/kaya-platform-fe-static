'use client';

import { Badge, Button, Input } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { ColumnDef } from '@tanstack/react-table';
import { ITestSuite, ITestSuiteListItem, ITestDataSet, TestType } from '../../data-generation';
import { handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Pencil, Trash2, Eye } from 'lucide-react';
import React, { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { AddTestItemsModal } from './add-test-items-modal';
import { useTestStudioWorkflowGraph } from '@/hooks/use-test-studio-workflow-graph';
import {TestSuitView} from "../../test-suite-report-generation/components/test-suit-view";

type IDataGenerationTableContainerProps = {
    testSuits: ITestSuiteListItem[];
    handleCreate: () => void;
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    handleSearchByTestSuiteName: (data: ITestSuite) => void;
    refetchTestSuits: () => void;
    fetchTestSuiteForView: (id: string) => Promise<Partial<ITestSuite> | null>;
};

const generateColumns = (
    getTestTypeBadge: (type: TestType) => ReactNode,
    handleEdit: (id: string) => void,
    handleDelete: (id: string) => void,
    handleView: (test: ITestSuiteListItem) => void
) => {
    const columns: ColumnDef<ITestSuiteListItem>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Test Suite Name</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { name } = original;
                return <div className={`font-medium `}>{handleNoValue(name)}</div>;
            },
        },
        {
            accessorKey: 'workflowName',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Workflow Name</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { workflowName } = original;
                return <div className={`font-medium `}>{handleNoValue(workflowName)}</div>;
            },
        },
        {
            accessorKey: 'description',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold truncate`}>Description</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { description } = original;
                return <div className={`font-medium `}>{handleNoValue(description)}</div>;
            },
        },
        {
            accessorKey: 'id',
            enableSorting: false,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { id } = original;
                return (
                    <div className="flex items-center gap-x-4">
                        <Eye size={18} onClick={() => handleView(original)} className="cursor-pointer" />
                        <Pencil size={18} onClick={() => handleEdit(id)} className="cursor-pointer" />
                        <DeleteRecords data={original} handleDelete={handleDelete} />
                    </div>
                );
            },
        },
    ];
    return columns;
};

const TEST_TYPE_VARIANT_MAP: Record<TestType, "info" | "warning" | "success" | "secondary"> = {
    [TestType.Smoke]: "info",
    [TestType.Sanity]: "secondary",
    [TestType.Integration]: "warning",
    [TestType.Regression]: "success",
};

const getTestTypeBadge = (type: TestType): ReactNode => {
    const variant = TEST_TYPE_VARIANT_MAP[type] ?? "secondary";
    return <Badge variant={variant} testStudio={true}>{type}</Badge>;
};

const DeleteRecords = ({ data, handleDelete }: { data: ITestSuiteListItem; handleDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const onConfirmDelete = () => {
        handleDelete(data.id);
        setOpen(false);
    };

    return (
        <>
            <Trash2 size={18} className="cursor-pointer" onClick={() => setOpen(true)} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            No
                        </Button>
                        <Button variant={'primary'} size="sm" onClick={onConfirmDelete}>
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const TestSuitsTableContainer = (props: IDataGenerationTableContainerProps) => {
    const { testSuits, handleCreate, handleEdit, handleDelete, handleSearchByTestSuiteName, refetchTestSuits, fetchTestSuiteForView } = props;
    const { isMobile } = useBreakpoint();
    const { register, handleSubmit } = useForm<ITestSuite>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<ITestSuite|undefined>(undefined);

    // Fetch workflow graph for selected test
    const { workflowVisual} = useTestStudioWorkflowGraph(selectedTest?.workflowId);


    // Add Items Modal state
    const [addItemsModalOpen, setAddItemsModalOpen] = useState(false);

    const onHandleSubmit = (data: ITestSuite) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            handleSearchByTestSuiteName(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const handleView = useCallback(async (testListItem: ITestSuiteListItem) => {
        const fullData = await fetchTestSuiteForView(testListItem.id);
        if (fullData) {
            setSelectedTest(fullData as ITestSuite);
            setViewDrawerOpen(true);
        }
    }, [fetchTestSuiteForView]);



    // Handle saving updated inputs from Add Items modal
    const handleSaveTestItems = (
        newInputs: ITestDataSet[],
        newAgentOutputFields?: Record<string, { expectedOutput: string; expectedBehaviour: string; instruction?: string }[]>
    ) => {
        if (selectedTest && globalThis.window !== undefined) {
            // Get existing inputs - ensure it's an array
            const existingInputs = Array.isArray(selectedTest.testDataSets) ? selectedTest.testDataSets : [];
            const existingInputCount = existingInputs.length;

            // Append new inputs to existing ones
            const allInputs = [...existingInputs, ...newInputs];

            // Merge agent output fields - ensure it's an object
            const mergedAgentOutputFields =
                selectedTest.agentOutputFields && typeof selectedTest.agentOutputFields === 'object'
                    ? { ...selectedTest.agentOutputFields }
                    : {};


            if (newAgentOutputFields) {
                // For each agent, append new output fields to existing ones
                Object.keys(newAgentOutputFields).forEach(agentId => {
                    const existingFields = Array.isArray(mergedAgentOutputFields[agentId])
                        ? mergedAgentOutputFields[agentId]
                        : [];
                    const newFields = Array.isArray(newAgentOutputFields[agentId]) ? newAgentOutputFields[agentId] : [];

                    // Initialize the merged array with existing fields
                    mergedAgentOutputFields[agentId] = [...existingFields];

                    // Ensure the array has placeholders for all existing inputs
                    while (mergedAgentOutputFields[agentId].length < existingInputCount) {
                        mergedAgentOutputFields[agentId].push({ expectedOutput: '', expectedBehaviour: '', instruction: '' });
                    }
                    // Append new fields to existing fields
                    mergedAgentOutputFields[agentId] = [...mergedAgentOutputFields[agentId], ...newFields];
                });
            }

            // Update localStorage
            const testSuites = localStorage.getItem('testSuites');
            if (testSuites) {
                const parsed = JSON.parse(testSuites);
                const updatedSuites = parsed.map((test: ITestSuite) =>
                    test.id === selectedTest.id
                        ? {
                              ...test,
                              inputs: allInputs,
                              agentOutputFields: mergedAgentOutputFields,
                          }
                        : test
                );
                localStorage.setItem('testSuites', JSON.stringify(updatedSuites));
            }

            // Update the selected test state to trigger re-render
            setSelectedTest(prev => ({
                ...prev!,
                testDataSets: allInputs,
                agentOutputFields: mergedAgentOutputFields,
            }));

            // Close the modal
            setAddItemsModalOpen(false);

            // Refresh the history data from localStorage without page reload
            refetchTestSuits();
        }
    };

    const columns = useMemo(
        () => generateColumns(getTestTypeBadge, handleEdit, handleDelete, handleView),
        [handleEdit, handleDelete, handleView]
    );

    return (
        <>
            <div className="grid gap-8">
                <div className="w-100 custom-overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={testSuits}
                        searchColumnName="workflow"
                        showFooter
                        defaultPageSize={isMobile ? 5 : 10}
                        showTableSearch={false}
                        manualSpan={true}
                        tableHeader={
                            <div className="w-full">
                                <div className="flex justify-between items-center w-full">
                                    <Input
                                        placeholder="Search by Test Suite Name"
                                        className="max-w-sm"
                                        {...register('search')}
                                        onKeyUp={handleSubmit(onHandleSubmit)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Button size={'sm'} onClick={handleCreate}>
                                            New Test Suite
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
            <TestSuitView
                appDrawerOpen={viewDrawerOpen}
                setAppDrawerOpen={setViewDrawerOpen}
                onClick={() => setViewDrawerOpen(false)}
                selectedTest={selectedTest}
                testSuitWorkflowGraph={workflowVisual}
            />
            <AddTestItemsModal
                isOpen={addItemsModalOpen}
                onClose={() => setAddItemsModalOpen(false)}
                testData={selectedTest || null}
                onSave={handleSaveTestItems}
            />
        </>
    );
};
