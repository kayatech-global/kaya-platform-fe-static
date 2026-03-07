'use client';

import { IBatchExecutionSummary } from '@/models/test-studio.model';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/molecules/table/data-table';
import { DataExecutionDetails } from './data-execution-details';
import { formatDistanceStrict } from 'date-fns';
import moment from 'moment';
import { Badge, TruncateCell } from '@/components';
import { Check, X } from 'lucide-react';
import { mockTestExecutionHistories } from '../../mock/test-exeution-mock';
import { useBatchExecutionDetails } from '@/hooks/use-test-executions';
import { TestExecutionType, TestStatus, ExecutionItemStatus } from '@/enums/test-studio-type';

type TestSuiteExecutionsListProps = {
    executions: IBatchExecutionSummary[];
};

// Calculate duration between two dates
const calculateDuration = (startDate: string, endDate: string | null): string => {
    if (!endDate) return 'In Progress';
    try {
        const duration = formatDistanceStrict(new Date(startDate), new Date(endDate));
        return duration;
    } catch {
        return '-';
    }
};

// Calculate duration in milliseconds for sorting
const calculateDurationInMs = (startDate: string, endDate: string | null): number => {
    if (!endDate) return Infinity; // In Progress should be sorted to the end
    try {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return end - start;
    } catch {
        return Infinity;
    }
};

const generateColumns = () => {
    const columns: ColumnDef<IBatchExecutionSummary>[] = [
        {
            accessorKey: 'batchId',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap px-4`}>Execution ID</div>;
            },
            cell({ row, table }) {
                const { batchId, executionType } = row?.original ?? {};
                // Calculate execution number (newest = #1)
                const allRows = table.getSortedRowModel().rows;
                const sortedByDate = [...allRows].sort((a, b) => {
                    const dateA = new Date(a.original.createdAt).getTime();
                    const dateB = new Date(b.original.createdAt).getTime();
                    return dateB - dateA;
                });
                const executionNumber = sortedByDate.findIndex(r => r.original.batchId === batchId) + 1;

                // Determine execution type badge
                const getExecutionTypeBadge = () => {
                    if (executionType === TestExecutionType.FullSuite) {
                        return (
                            <Badge className="bg-blue-100 dark:bg-blue-600 text-blue-500 dark:text-blue-100 text-xs font-bold px-2 py-0.5">
                                FULL SUITE
                            </Badge>
                        );
                    } else if (executionType === TestExecutionType.Partial) {
                        return (
                            <Badge className="bg-amber-100 dark:bg-amber-600 text-amber-600 dark:text-amber-100 text-xs font-bold px-2 py-0.5">
                                PARTIAL
                            </Badge>
                        );
                    }
                    return null;
                };

                return (
                    <div className={`py-2 pl-2 pr-0 flex items-center justify-between gap-2 w-full`}>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">#{executionNumber}</span>
                            <TruncateCell
                                value={batchId}
                                length={30}
                                className="text-xs text-gray-900 dark:text-white"
                            />
                        </div>
                        {getExecutionTypeBadge()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'duration',
            enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const durationA = calculateDurationInMs(rowA.original.createdAt, rowA.original.completedAt);
                const durationB = calculateDurationInMs(rowB.original.createdAt, rowB.original.completedAt);
                return durationA - durationB; // Ascending order: shortest to longest
            },
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Duration</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { createdAt, completedAt } = original;
                const duration = calculateDuration(createdAt, completedAt);
                return <div className={`font-medium`}>{duration}</div>;
            },
        },
        {
            accessorKey: 'createdAt',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Executed At</div>;
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { createdAt } = original;
                return (
                    <div className={`font-medium`}>
                        {createdAt ? moment(createdAt).format('D MMM, YYYY h:mm a') : '-'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap px-4`}>Overall Status</div>;
            },
            cell({ row }) {
                const { passedCount, failedCount, errorCount, testCases, status } = row?.original ?? {};

                // Calculate actual counts from testCases array if available
                let actualPassedCount = passedCount;
                let actualFailedCount = failedCount;
                let actualErrorCount = errorCount;

                if (testCases && testCases.length > 0) {
                    actualPassedCount = testCases.filter(tc => tc.status === ExecutionItemStatus.Passed).length;
                    actualFailedCount = testCases.filter(
                        tc => tc.status === ExecutionItemStatus.Failed || tc.status === ExecutionItemStatus.partial
                    ).length;
                    actualErrorCount = testCases.filter(
                        tc => tc.status === ExecutionItemStatus.Pending || tc.status === ExecutionItemStatus.Running
                    ).length;
                }

                const hasMixed =
                    (actualPassedCount > 0 ? 1 : 0) + (actualFailedCount > 0 ? 1 : 0) + (actualErrorCount > 0 ? 1 : 0) >
                    1;

                return (
                    <div className="px-4">
                        <div className="inline-flex items-center gap-1.5 rounded-full px-1 py-1">
                            {/* Show Passed badge if there are any passed tests */}
                            {actualPassedCount > 0 && (
                                <Badge
                                    variant="success"
                                    testStudio={true}
                                    className="flex items-center gap-1 py-1 px-2"
                                >
                                    {hasMixed && <Check size={12} />}
                                    Passed
                                    <span className="pl-2">{actualPassedCount}</span>
                                </Badge>
                            )}

                            {/* Show Failed badge if there are any failed tests */}
                            {actualFailedCount > 0 && (
                                <Badge variant="error" testStudio={true} className="flex items-center gap-1 py-1 px-2">
                                    {hasMixed && <X size={12} />}
                                    Failed <span className="pl-2">{actualFailedCount}</span>
                                </Badge>
                            )}

                            {/* Show Error badge if there are any error tests */}
                            {actualErrorCount > 0 && (
                                <Badge variant="error" testStudio={true} className="flex items-center gap-1 py-1 px-2">
                                    {hasMixed && <X size={12} />}
                                    Error <span className="pl-2">{actualErrorCount}</span>
                                </Badge>
                            )}

                            {/* Show overall status badge if all tests have same status */}
                            {!hasMixed &&
                                actualPassedCount === 0 &&
                                actualFailedCount === 0 &&
                                actualErrorCount === 0 && (
                                    <Badge variant="secondary" testStudio={true}>
                                        {status || 'Unknown'}
                                    </Badge>
                                )}
                        </div>
                    </div>
                );
            },
        },
    ];
    return columns;
};

// Wrapper component to fetch batch details and transform for Summary section
const ExecutionDetailsWrapper = ({ batchId }: { batchId: string }) => {
    const { batchDetails, isLoading } = useBatchExecutionDetails(batchId);

    // Use mock data for test cases table
    const mockIndex = 0;
    const mockExecutionDetails = mockTestExecutionHistories[mockIndex];

    if (isLoading || !batchDetails) {
        return (
            <div className="p-4 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Loading execution details...</p>
                </div>
            </div>
        );
    }

    const testCases = batchDetails.testCases || [];
    const actualPassedCount = testCases.filter(tc => tc.status === ExecutionItemStatus.Passed).length;
    // Treat PARTIAL as FAILED
    const actualFailedCount = testCases.filter(
        tc => tc.status === ExecutionItemStatus.Failed || tc.status === ExecutionItemStatus.partial
    ).length;

    const actualErrorCount = testCases.filter(
        tc =>
            tc.status !== ExecutionItemStatus.Passed &&
            tc.status !== ExecutionItemStatus.Failed &&
            tc.status !== ExecutionItemStatus.partial
    ).length;
    const totalCount = testCases.length || batchDetails.executionCount;

    // Test Cases Table data Mapping - use mock data for report fields
    const transformedInputReport = testCases.map((tc, index) => {
        // Get mock report data (cycle through mock data if we have more test cases than mock data)
        const mockIndex = index % mockExecutionDetails.report.inputReport.length;
        const mockReportData = mockExecutionDetails.report.inputReport[mockIndex];

        return {
            ...mockReportData, // Include all mock data fields (groundTruth, agentOutput, steps, etc.)
            id: tc.executionId || `test-${tc.testDataSetIndex}`,
            input: tc.testDataSetName || `Test Case ${tc.testDataSetIndex + 1}`,
            status: tc.status === ExecutionItemStatus.Passed ? TestStatus.Passed : TestStatus.Failed,
            executionId: tc.executionId,
        };
    });

    const transformedExecution = {
        ...mockExecutionDetails,
        report: {
            ...mockExecutionDetails.report,
            summary: batchDetails.suiteSummary || 'No Summary has been generated for this execution.',
            resultCount: {
                total: totalCount,
                passed: actualPassedCount,
                failed: actualFailedCount + actualErrorCount, 
                skipped: 0, 
            },

            inputReport: transformedInputReport,
        },
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
            <DataExecutionDetails execution={transformedExecution} />
        </div>
    );
};

export const TestSuiteExecutionsList = (props: TestSuiteExecutionsListProps) => {
    const { executions } = props;
    const columns = generateColumns();

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Execution History</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {executions.length} Executions
                </span>
            </div>
            <DataTable
                showHeader={false}
                columns={columns}
                data={executions}
                showFooter={true}
                defaultPageSize={10}
                showTableSearch={false}
                manualSpan={true}
                renderExpandedRow={row => {
                    const batchId = row.original.batchId;
                    return <ExecutionDetailsWrapper batchId={batchId} />;
                }}
            />
        </div>
    );
};
