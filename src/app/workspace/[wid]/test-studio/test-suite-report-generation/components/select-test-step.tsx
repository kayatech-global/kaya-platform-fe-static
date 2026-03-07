import { Info, Layers2, Network, TestTubeDiagonal } from 'lucide-react';
import { Select, TruncateCell } from '@/components';
import { useTestSuite } from '@/hooks/use-test-suite';
import { useExecutionConfiguration } from '@/hooks/use-test-execution';
import { useEffect, useState } from 'react';
import { ITestSuite, ITestDataSet } from '../../data-generation';
import { ColumnDef } from '@tanstack/react-table';
import { handleNoValue } from '@/lib/utils';
import DataTable from '@/components/molecules/table/data-table';
import { Checkbox } from '@/components/atoms/checkbox';

const generateColumns = (
    selectedIndices: Set<number>,
    onToggleSelect: (index: number) => void,
    onToggleSelectAll: () => void,
    totalCount: number
) => {
    const allSelected = totalCount > 0 && selectedIndices.size === totalCount;
    const someSelected = selectedIndices.size > 0 && selectedIndices.size < totalCount;

    const columns: ColumnDef<ITestDataSet>[] = [
        {
            id: 'select',
            enableSorting: false,
            meta: {
                width: 50,
                align: 'text-center',
            },
            header() {
                return (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={allSelected}
                            ref={el => {
                                if (el) {
                                    (el as HTMLButtonElement).dataset.indeterminate = someSelected ? 'true' : 'false';
                                }
                            }}
                            className={someSelected ? 'opacity-50' : ''}
                            onCheckedChange={onToggleSelectAll}
                        />
                    </div>
                );
            },
            cell({ row }) {
                const index = row.index;
                return (
                    <div className="flex items-center justify-center">
                        <Checkbox checked={selectedIndices.has(index)} onCheckedChange={() => onToggleSelect(index)} />
                    </div>
                );
            },
        },
        {
            accessorFn: (row) => row.input?.message || '',
            id: 'input',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Input</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { input } = original;
                return (
                    <div className="font-medium">
                        <TruncateCell value={handleNoValue(input.message) as string} length={50} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'expectedBehaviour',
            enableSorting: true,
            header() {
                return (
                    <div className={`w-full text-left font-semibold whitespace-nowrap`}>
                        Expected Workflow Behaviour
                    </div>
                );
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { expectedBehaviour } = original;
                return (
                    <div className="font-medium">
                        <TruncateCell value={handleNoValue(expectedBehaviour) as string} length={50} />
                    </div>
                );
            },
        },
    ];
    return columns;
};

type SelectTestStepProps = {
    initialTestId?: string;
    triggerExecute?: number;
    onStateChange?: (testSuiteId: string, testCaseCount: number) => void;
    onExecutionStart?: (sessionId: string) => void;
};

export const SelectTestStep = ({
    initialTestId,
    triggerExecute,
    onStateChange,
    onExecutionStart,
}: SelectTestStepProps) => {
    const { allTestSuits, isLoadingTestSuits, fetchTestSuiteForView } = useTestSuite();
    const {
        selectedTestSuiteId,
        selectedIndices,
        setSelectedTestSuiteId,
        setTotalTestCaseCount,
        handleToggleTestCase,
        handleToggleAll,
        handleSubmit,
        handleExecute,
        errors,
        setValue,
        executionSessionId,
    } = useExecutionConfiguration();

    const [currentTest, setCurrentTest] = useState<ITestSuite | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Initialize with initialTestId if provided
    useEffect(() => {
        if (initialTestId && !selectedTestSuiteId) {
            setSelectedTestSuiteId(initialTestId);
            setValue('testSuiteId', initialTestId);
        }
    }, [initialTestId, selectedTestSuiteId, setSelectedTestSuiteId, setValue]);

    // Notify parent of state changes
    useEffect(() => {
        if (onStateChange) {
            onStateChange(selectedTestSuiteId, selectedIndices.size);
        }
    }, [selectedTestSuiteId, selectedIndices, onStateChange]);

    // Notify parent when execution starts
    useEffect(() => {
        if (executionSessionId && onExecutionStart) {
            onExecutionStart(executionSessionId);
        }
    }, [executionSessionId, onExecutionStart]);

    // Execute when triggerExecute changes
    useEffect(() => {
        if (triggerExecute && triggerExecute > 0 && selectedIndices.size > 0) {
            handleSubmit(formData => {
                handleExecute(formData);
            })();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerExecute]);

    // Fetch full test suite details when selected
    useEffect(() => {
        let isMounted = true;

        const fetchDetails = async () => {
            if (selectedTestSuiteId) {
                setIsLoadingDetails(true);
                setCurrentTest(null);
                try {
                    const fullTestSuite = await fetchTestSuiteForView(selectedTestSuiteId);
                    if (isMounted && fullTestSuite) {
                        setCurrentTest(fullTestSuite as ITestSuite);
                        // Auto-select all test cases
                        const totalCount = (fullTestSuite as ITestSuite).testDataSets?.length ?? 0;
                        setTotalTestCaseCount(totalCount);
                        if (totalCount > 0) {
                            // Use setTimeout to avoid state update during render
                            setTimeout(() => {
                                handleToggleAll(totalCount);
                            }, 0);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching test suite details:', error);
                    if (isMounted) {
                        setCurrentTest(null);
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingDetails(false);
                    }
                }
            } else {
                setCurrentTest(null);
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [selectedTestSuiteId, fetchTestSuiteForView, handleToggleAll]);

    const columns = generateColumns(
        selectedIndices,
        handleToggleTestCase,
        () => handleToggleAll(currentTest?.testDataSets?.length ?? 0),
        currentTest?.testDataSets?.length ?? 0
    );

    return (
        <div className="space-y-4 text-sm">
            <Select
                key={`test-suite-select-${initialTestId || 'new'}-${allTestSuits?.length || 0}`}
                label="Test Suite"
                placeholder={
                    isLoadingTestSuits 
                        ? 'Fetching Data...' 
                        : (!allTestSuits || allTestSuits.length === 0)
                            ? 'There is no Test suite available. Please create one'
                            : 'Please select a test suite'
                }
                options={allTestSuits?.map(data => {
                    return {
                        name: data?.name,
                        value: data?.id,
                    };
                })}
                defaultValue={selectedTestSuiteId || initialTestId || ""}
                currentValue={selectedTestSuiteId}
                onChange={e => {
                    const value = e?.target?.value;
                    setSelectedTestSuiteId(value);
                    setValue('testSuiteId', value, { shouldValidate: true });
                }}
                supportiveText={errors.testSuiteId?.message}
                isDestructive={!!errors.testSuiteId}
                disabled={isLoadingTestSuits || !allTestSuits || allTestSuits.length === 0}
            />

            {isLoadingDetails && (
                <div className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-800 h-[250px] border border-dashed border-gray-300 dark:border-gray-500">
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <TestTubeDiagonal className="text-blue-500 stroke-[1px] mb-4 animate-pulse" size={30} />
                        <p>Loading test suite details...</p>
                    </div>
                </div>
            )}

            {!currentTest && !isLoadingDetails && selectedTestSuiteId && (
                <div className="w-full p-3 rounded-md bg-red-50 dark:bg-red-800 h-[250px] border border-dashed border-red-300 dark:border-red-500">
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <TestTubeDiagonal className="text-red-500 stroke-[1px] mb-4" size={30} />
                        <p className="text-red-600 dark:text-red-800 font-medium">Failed to load test suite</p>
                        <p className="text-gray-400 dark:text-gray-700 text-sm text-center">
                            Unable to fetch test suite details. Please try again.
                        </p>
                    </div>
                </div>
            )}

            {!currentTest && !isLoadingDetails && !selectedTestSuiteId && (
                <div className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-900 h-[250px] border border-dashed border-gray-300 dark:border-gray-500">
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <TestTubeDiagonal className="text-blue-500 stroke-[1px] mb-4 " size={30} />
                        <p>Select a Test Suite to Preview</p>
                        <p className="text-gray-400 dark:text-gray-700 text-sm text-center">
                            Please select a test suite from the list above to 

                            view its preview and details.
                        </p>
                    </div>
                </div>
            )}

            {currentTest && (
                <div className="w-full rounded-md bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-500">
                    <div className="border-b dark:border-gray-500 grid grid-cols-2">
                        <div className="flex flex-col gap-2 border-r dark:border-gray-500 p-3 ">
                            <div className="flex items-center gap-[6px]">
                                <TestTubeDiagonal size={14} className='dark:text-blue-300'/>
                                <p className="text-xs text-gray-500 dark:text-blue-300">Test Name</p>
                            </div>
                            {currentTest?.name}
                        </div>
                        <div className="flex flex-col gap-2 p-3 ">
                            <div className="flex items-center gap-[6px]">
                                <Layers2 size={14} className='dark:text-blue-300'/>
                                <p className="text-xs text-gray-500 dark:text-blue-300">Test Type</p>
                            </div>
                            {currentTest?.testCaseMethod
                                ? currentTest.testCaseMethod.charAt(0).toUpperCase() + currentTest.testCaseMethod.slice(1)
                                : '-'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2  p-3 border-b dark:border-gray-500">
                        <div className="flex items-center gap-[6px]">
                            <Info size={14} className='dark:text-blue-300'/>
                            <p className="text-xs text-gray-500 dark:text-blue-300">Description</p>
                        </div>
                        {currentTest?.description}
                    </div>
                    <div className="flex flex-col gap-2  p-3 border-b dark:border-gray-500">
                        <div className="flex items-center gap-[6px]">
                            <Network size={14} className='dark:text-blue-300'/>
                            <p className="text-xs text-gray-500 dark:text-blue-300">Workflow Name</p>
                        </div>
                        <div>{currentTest?.workflowName || currentTest?.workflowId || '-'}</div>
                    </div>
                    <div className="custom-overflow-x-auto p-3">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-500 dark:text-blue-300">Select test cases to execute</p>
                            <p className="text-xs font-medium text-blue-600">
                                {selectedIndices.size} of {currentTest?.testDataSets?.length ?? 0} selected
                            </p>
                        </div>
                        <DataTable
                            columns={columns}
                            data={currentTest?.testDataSets ?? []}
                            searchColumnName="Test"
                            showFooter
                            defaultPageSize={5}
                            showTableSearch={false}
                            manualSpan={true}
                            showHeader={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
 