import { ITestSuiteExecutionGroup } from '@/models/test-studio.model';
import { ColumnDef } from '@tanstack/react-table';
import { handleNoValue } from '@/lib/utils';
import { Button, Input } from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import DataTable from '@/components/molecules/table/data-table';
import { useState, useMemo } from 'react';
import { Play } from 'lucide-react';
import { NewExecutionForm } from './new-execution-form';
import { TestSuiteExecutionsList } from './test-suite-executions-list';

const RunningBadge = () => (
    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap flex items-center w-fit">
        Running{' '}
        <span className="inline-flex text-[13px]">
            <span
                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                style={{ animationDelay: '0s' }}
            >
                .
            </span>
            <span
                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                style={{ animationDelay: '0.2s' }}
            >
                .
            </span>
            <span
                className="animate-[dotFade_1.4s_ease-in-out_infinite]"
                style={{ animationDelay: '0.4s' }}
            >
                .
            </span>
        </span>
    </span>
);

type DataExecutionTableProps = {
    executions: ITestSuiteExecutionGroup[];
    onExecutionComplete?: () => void;
    runningTestSuiteId?: string;
};

const generateColumns = (onExecute: (testSuiteId: string) => void, runningTestSuiteId?: string) => {
    const columns: ColumnDef<ITestSuiteExecutionGroup>[] = [
        {
            accessorKey: 'testSuiteName',
            enableSorting: true,
            header() {
                return (
                    <div className={`w-full text-left font-semibold whitespace-nowrap px-4`}>
                        Executed Test Suite Name
                    </div>
                );
            },
            cell({ row }) {
                const original = row?.original ?? {};
                const { testSuiteName } = original;
                return <div className={`font-medium px-4`}>{handleNoValue(testSuiteName)}</div>;
            },
        },
        {
            accessorKey: 'executions',
            enableSorting: true,
            header() {
                return <div className={`w-full text-left font-semibold whitespace-nowrap`}>Executions</div>;
            },
            cell({ row }) {
                const isRunning = runningTestSuiteId === row.original.testSuiteId;
                const original = row?.original ?? {};
                const { executions } = original;
                return (
                    <div className={`font-medium`}>
                        {isRunning ? (
                            <RunningBadge />
                        ) : (
                            <span>{executions?.length ?? 0} Executions</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            enableSorting: false,
            header: () => <div className="w-full text-left font-semibold whitespace-nowrap">Actions</div>,
            cell: ({ row }) => {
                return (
                    <div className="flex justify-between items-center gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={e => {
                                e.stopPropagation();
                                onExecute(row.original.testSuiteId);
                            }}
                            title="Run Execution"
                            className="px-3 bg-green-500 hover:bg-green-600 text-white border border-green-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-600"
                        >
                            <Play className="h-4 w-4" />
                            Execute
                        </Button>
                    </div>
                );
            },
        },
    ];
    return columns;
};

export const DataExecutionTable = (props: DataExecutionTableProps) => {
    const { isMobile } = useBreakpoint();
    const { executions, onExecutionComplete, runningTestSuiteId } = props;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Filter executions based on search term
    const filteredExecutions = useMemo(() => {
        if (!searchTerm.trim()) {
            return executions;
        }
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        return executions.filter(execution => 
            execution.testSuiteName?.toLowerCase().includes(lowerSearchTerm)
        );
    }, [executions, searchTerm]);

    const columns = generateColumns((testSuiteId: string) => {
        setSelectedTestId(testSuiteId);
        setIsOpen(true);
    }, runningTestSuiteId);

    return (
        <div className="grid gap-8">
            <div className="w-100 custom-overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={filteredExecutions}
                    searchColumnName="Executed Test Suite Name"
                    showFooter
                    defaultPageSize={isMobile ? 5 : 10}
                    showTableSearch={false}
                    manualSpan={true}
                    onRowExpandCollapse={() => {
                        // Handle row expansion/collapse
                    }}
                    tableHeader={
                        <div className="w-full">
                            <div className="flex justify-between items-center w-full">
                                <Input 
                                    placeholder="Search by Executed Test Suite Name" 
                                    className="max-w-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="flex items-center gap-3">
                                    <Button
                                        size={'sm'}
                                        onClick={() => {
                                            setSelectedTestId('');
                                            setIsOpen(true);
                                        }}
                                    >
                                        New Execution
                                    </Button>
                                </div>
                            </div>
                        </div>
                    }
                    renderExpandedRow={row => {
                        // Pass real API data (IBatchExecutionSummary[]) to the execution history table
                        return <TestSuiteExecutionsList executions={row?.original?.executions || []} />;
                    }}
                />
            </div>

            <NewExecutionForm
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                initialTestId={selectedTestId}
                onExecutionComplete={onExecutionComplete}
            />
        </div>
    );
};
