'use client';

import { useState } from 'react';
import { Spinner } from '@/components/atoms/spinner';
import { useDataLineageSession } from '@/hooks/use-data-lineage-session';
import { IDataLineage, IDataLineageSession, IDataLineageSessionExecution, IDataLineageSessionFilter } from '@/models';
import { ColumnDef, Row } from '@tanstack/react-table';
import { formatExecutionTimestamp, handleNoValue, isNullOrEmpty } from '@/lib/utils';
import { Button } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { ExecutionStatusType } from '@/enums';

export interface DataLineageSessionTableProps {
    row: Row<IDataLineage>;
    sessionQueryParams: IDataLineageSessionFilter | undefined;
    selectedRowId: string | null;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedExecution: React.Dispatch<React.SetStateAction<IDataLineageSessionExecution | undefined>>;
    onViewDataLineage: (sessionId: string, executionId: string, workflowId: string) => void;
    setWorkflowId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

interface ExecutionTableProp {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executionsWithSessionId: any[];
    subTableColumns: ColumnDef<IDataLineageSessionExecution>[];
}

const generateColumns = () => {
    const subTableColumns: ColumnDef<IDataLineageSession>[] = [
        {
            accessorKey: 'sessionId',
            enableSorting: false,

            header() {
                return <div className="w-full text-left">Session ID</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('sessionId'))}</div>;
            },
        },
        {
            accessorKey: 'actor',
            header: 'Actor',
            enableSorting: false,
            cell({ row }) {
                return <div className="w-full text-center">{handleNoValue(row.getValue('actor'))}</div>;
            },
        },
        {
            accessorKey: 'startedAt',
            header: 'Start Time',
            enableSorting: false,
            cell({ row }) {
                return (
                    <div className="w-full text-center">
                        {handleNoValue(formatExecutionTimestamp(row.getValue('startedAt'), 'Execution started on'))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'endedAt',
            header: 'End Time',
            enableSorting: false,
            cell({ row }) {
                return (
                    <div className="w-full text-center">
                        {handleNoValue(formatExecutionTimestamp(row.getValue('endedAt'), 'Execution ended on'))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: false,
            cell({ row }) {
                const isFailed = row.original.executions?.some(x => x.status === ExecutionStatusType.FAILED) ?? false;
                return <div className="w-full text-center">{isFailed ? 'Fail' : 'Success'}</div>;
            },
        },
    ];

    return subTableColumns;
};

const generateSubTableColumns = (
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedExecution: React.Dispatch<React.SetStateAction<IDataLineageSessionExecution | undefined>>,
    onViewDataLineage: (sessionId: string, executionId: string, workflowId: string) => void,
    setWorkflowId: React.Dispatch<React.SetStateAction<string | undefined>>
) => {
    const handleCellClick = (row: Row<IDataLineageSessionExecution>) => {
        setWorkflowId(row.original.workflowId as string);
        setSelectedExecution(row.original);
        setIsOpen(true);
        onViewDataLineage(row.original.sessionId as string, row.original.id, row.original.workflowId as string);
        console.log('Row clicked:', row.original);
    };

    const subTableColumns: ColumnDef<IDataLineageSessionExecution>[] = [
        {
            accessorKey: 'id',
            enableSorting: false,

            header() {
                return <div className="w-full text-left">Execution ID</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('id'))}</div>;
            },
        },
        {
            accessorKey: 'startedAt',
            header: 'Start Time',
            enableSorting: false,
            cell({ row }) {
                return (
                    <div className="w-full text-center">
                        {handleNoValue(formatExecutionTimestamp(row.getValue('startedAt'), 'Execution started on'))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'endedAt',
            header: 'End Time',
            enableSorting: false,
            cell({ row }) {
                return (
                    <div className="w-full text-center">
                        {handleNoValue(formatExecutionTimestamp(row.getValue('endedAt'), 'Execution ended on'))}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            enableSorting: false,
            cell({ row }) {
                const isValid = !isNullOrEmpty(row.getValue('status'));
                return (
                    <div className="w-full text-center">
                        {(() => {
                            if (!isValid) return '-';
                            return row.getValue('status') === ExecutionStatusType.FAILED ? 'Fail' : 'Success';
                        })()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: '',
            enableSorting: false,
            cell({ row }) {
                return (
                    <Button onClick={() => handleCellClick(row)} variant={'link'} size={'sm'}>
                        View data lineage
                    </Button>
                );
            },
        },
    ];

    return subTableColumns;
};

const ExecutionTable = ({ executionsWithSessionId, subTableColumns }: ExecutionTableProp) => {
    const [pageSize] = useState<number>(3);
    const [subTablePage, setSubTablePage] = useState<number>(0);

    const paginatedData = executionsWithSessionId.slice(subTablePage * pageSize, subTablePage * pageSize + pageSize);

    return (
        <DataTable
            columns={subTableColumns}
            data={paginatedData}
            showHeader={false}
            showFooter
            defaultPageSize={pageSize}
            page={subTablePage}
            isManualPagination
            onPageChange={setSubTablePage}
            totalPages={Math.ceil(executionsWithSessionId.length / pageSize)}
        />
    );
};

export const DataLineageSessionTable = (props: DataLineageSessionTableProps) => {
    const {
        row,
        setIsOpen,
        setSelectedExecution,
        onViewDataLineage,
        setWorkflowId,
        sessionQueryParams,
        selectedRowId,
    } = props;
    const { isFetching, sessions, defaultPageSize, page, totalPages, setPage } = useDataLineageSession(props);

    console.log(sessionQueryParams, selectedRowId);
    const column = generateColumns();
    const subTableColumns = generateSubTableColumns(setIsOpen, setSelectedExecution, onViewDataLineage, setWorkflowId);

    if (isFetching) {
        return (
            <div className="p-4">
                <div className="flex items-center flex-col gap-y-2">
                    <Spinner />
                    <p>Loading</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <DataTable
                columns={column}
                data={sessions}
                searchColumnName="sessions"
                showFooter
                defaultPageSize={defaultPageSize}
                showTableSearch={false}
                manualSpan={true}
                page={page - 1}
                totalPages={totalPages}
                isManualPagination={true}
                onPageChange={p => setPage(p + 1)}
                showHeader={false}
                renderExpandedRow={exec => {
                    const session = exec.original;
                    const executionsWithSessionId = session.executions.map(execution => ({
                        ...execution,
                        workflowId: row?.original?.id,
                        workflowName: row?.original?.name,
                        sessionId: session.sessionId,
                    }));

                    return (
                        <div className="p-4">
                            <ExecutionTable
                                subTableColumns={subTableColumns}
                                executionsWithSessionId={executionsWithSessionId}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};
