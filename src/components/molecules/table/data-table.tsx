/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    Header,
    PaginationState,
    ExpandedState,
    getExpandedRowModel,
    Row,
    Table as ITable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button, Input, Spinner } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ChevronDown, ChevronRight, ChevronUp, FileX } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onTableSearch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    tableHeader?: React.ReactNode;
    showTableSearch?: boolean;
    page?: number;
    searchColumnName?: string;
    width?: number | 'container-width' | 'content-width';
    showHeader?: boolean;
    showFooter?: boolean;
    headerClassNames?: string;
    dataRowClassNames?: string | ((row: Row<TData>) => string);
    tableClassNames?: string;
    defaultPageSize?: number;
    onPageChange?: (page: number) => void;
    renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
    expandedRowClassName?: string;
    expandedRowCellClassName?: string;
    manualSpan?: boolean;
    tableContainerRef?: React.RefObject<HTMLDivElement>;
    hideTableHeader?: boolean;
    enableColgroup?: boolean;
    enableExpandByRowClick?: boolean;
    expandedColumnWidth?: any;
    totalPages?: number;
    isManualPagination?: boolean;
    hideExpandedColumn?: boolean;
    loadingData?: boolean;
    // getRowClassName?: (row: Row<TData>) => string;
    onTableInit?: (table: ITable<TData>) => void;
    onRowExpandCollapse?: (rowId: string, expanded: boolean, data: Row<TData>) => void;
    tableBodyCellClassNames?: string;
    initialExpandedState?: ExpandedState;
}

const DataTable = <TData, TValue>({
    columns,
    data,
    onTableSearch,
    tableHeader,
    showTableSearch = true,
    page,
    searchColumnName,
    width,
    headerClassNames,
    dataRowClassNames,
    tableClassNames,
    showHeader = true,
    showFooter = false,
    defaultPageSize = 10,
    onPageChange,
    renderExpandedRow,
    expandedRowClassName,
    expandedRowCellClassName,
    manualSpan = false,
    tableContainerRef,
    hideTableHeader = false,
    enableColgroup = false,
    enableExpandByRowClick = true,
    expandedColumnWidth,
    totalPages,
    isManualPagination = false,
    hideExpandedColumn = false,
    loadingData = false,
    // getRowClassName,
    onTableInit,
    onRowExpandCollapse,
    tableBodyCellClassNames,
    initialExpandedState,
}: DataTableProps<TData, TValue>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>(initialExpandedState || {});
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const pagination = React.useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    );

    const renderExpandCell = React.useCallback(
        ({ row }: { row: Row<TData> }) => {
            const children = (row.original as { children?: unknown[] })?.children;
            const hasChildren = (children?.length ?? 0) > 0;
            const icon = row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
            ) : (
                <ChevronRight className="h-4 w-4" />
            );
            if (enableExpandByRowClick) {
                return (
                    <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                        {icon}
                    </Button>
                );
            }
            if (!hasChildren) return null;
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6"
                    onClick={() => row.toggleExpanded()}
                >
                    {icon}
                </Button>
            );
        },
        [enableExpandByRowClick]
    );

    // Add expand column if renderExpandedRow is provided
    const tableColumns = React.useMemo(() => {
        if (!renderExpandedRow || hideExpandedColumn) return columns;

        const expandColumn: ColumnDef<TData> = {
            id: 'expand',
            size: 40,
            meta: {
                width: expandedColumnWidth || 40,
            },
            header: () => null,
            cell: renderExpandCell,
        };

        return [expandColumn, ...columns];
    }, [columns, expandedColumnWidth, renderExpandedRow, hideExpandedColumn, renderExpandCell]);

    const handleExpandedChange = (updater: ExpandedState | ((old: ExpandedState) => ExpandedState)) => {
        setExpanded(old => {
            const newState = typeof updater === 'function' ? updater(old) : updater;

            const oldKeys = Object.keys(old);
            const newKeys = Object.keys(newState);

            try {
                if (!table || table.getRowModel().rows.length === 0) {
                    return newState;
                }

                newKeys.forEach(key => {
                    if (key && !oldKeys.includes(key)) {
                        const row = table?.getRow?.(key.toString());
                        if (row) setTimeout(() => onRowExpandCollapse?.(key, true, row), 0);
                    }
                });

                oldKeys.forEach(key => {
                    if (key && !newKeys.includes(key)) {
                        const row = table?.getRow?.(key.toString());
                        if (row) setTimeout(() => onRowExpandCollapse?.(key, false, row), 0);
                    }
                });
            } catch {
                return newState;
            }

            return newState;
        });
    };

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: handleExpandedChange,
        state: {
            sorting,
            columnFilters,
            pagination,
            expanded,
        },
        onPaginationChange: setPagination,
        manualPagination: isManualPagination,
        ...(isManualPagination ? { pageCount: totalPages ?? -1 } : { getPaginationRowModel: getPaginationRowModel() }),
    });

    function countColumns<T extends { columns?: T[] }>(columns: T[]): number {
        let count = 0;

        columns.forEach(column => {
            if (column.columns && Array.isArray(column.columns)) {
                count += countColumns(column.columns);
            } else {
                count += 1;
            }
        });

        if (typeof renderExpandedRow !== 'undefined') {
            count += 1;
        }

        return count;
    }

    const handleExternalSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        onTableSearch?.(event);
    };

    const handlePageChange = (newPage: number) => {
        table.setPageIndex(newPage);
        onPageChange?.(newPage);
    };

    useEffect(() => {
        if (page) {
            table.setPageIndex(page);
        }
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (onTableInit) {
            onTableInit(table);
        }
    }, [table]);

    // Update expanded state when initialExpandedState changes
    useEffect(() => {
        if (initialExpandedState && Object.keys(initialExpandedState).length > 0) {
            setExpanded(initialExpandedState);
        }
    }, [initialExpandedState]);

    const getHeaderSpan = (header: Header<TData, unknown>): number => {
        if (header.subHeaders && header.subHeaders.length > 0) {
            return header.subHeaders.reduce((acc, subHeader) => acc + getHeaderSpan(subHeader), 0);
        }
        return 1;
    };

    const renderSortingIcon = (header: Header<TData, unknown>) => {
        if (!header.column.getCanSort()) return null;

        if (header.column.getIsSorted() === 'asc') {
            return <ChevronUp className="ml-2 h-4 w-4" />;
        } else if (header.column.getIsSorted() === 'desc') {
            return <ChevronDown className="ml-2 h-4 w-4" />;
        }
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    };

    const renderHeaderCell = (header: Header<TData, unknown>): React.ReactNode => {
        const colSpan = getHeaderSpan(header);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const align = (header.column.columnDef.meta as any)?.align;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _width = (header.column.columnDef.meta as any)?.width;
        let rowSpan = 1;

        if (manualSpan) {
            const columnRelativeDepth = header.depth - header.column.depth;
            if (columnRelativeDepth > 1) {
                return null;
            }
            if (header.isPlaceholder) {
                const leafs = header.getLeafHeaders();
                rowSpan = leafs[leafs.length - 1].depth - header.depth;
            }
        }

        const sticky = (header.column.columnDef.meta as any)?.sticky;

        return (
            <TableHead
                key={header.id}
                colSpan={manualSpan ? header.colSpan : colSpan}
                {...(manualSpan && { rowSpan })}
                className={cn(
                    align ?? 'text-center',
                    'border-r dark:border-b dark:border-b-gray-700 dark:border-r-gray-700',
                    'bg-gray-100 dark:bg-gray-800',
                    header.column.getCanSort() && (!header.isPlaceholder || manualSpan) && 'cursor-pointer select-none',
                    manualSpan ? '' : 'last:border-r-0',
                    sticky === 'right' && 'sticky right-0 z-20 shadow-[inset_1px_0_0_0_#e5e7eb] dark:shadow-[inset_1px_0_0_0_#4b5563]'
                )}
                onClick={
                    header.column.getCanSort() && (!header.isPlaceholder || manualSpan)
                        ? header.column.getToggleSortingHandler()
                        : undefined
                }
                {...(_width && {
                    style: { width: _width },
                })}
            >
                <div className={cn('flex gap-2', align === 'text-left' ? '' : 'items-center justify-center')}>
                    {(() => {
                        if (manualSpan) return flexRender(header.column.columnDef.header, header.getContext());
                        if (header.isPlaceholder) return null;
                        return flexRender(header.column.columnDef.header, header.getContext());
                    })()}
                    {header.column.getCanSort() && (!header.isPlaceholder || manualSpan) && renderSortingIcon(header)}
                </div>
            </TableHead>
        );
    };

    return (
        <div
            ref={tableContainerRef}
            style={{ width: `${width}px` }}
            className={cn(
                'data-table bg-white border border-gray-200 shadow-sm rounded-lg dark:bg-gray-700 dark:border-gray-700',
                { 'w-max': width === 'content-width', 'w-full': width === 'container-width' }
            )}
        >
            {showHeader && (
                <div className="data-table-header rounded-[8px_8px_0_0] px-6 py-3 border-b border-b-gray-300 flex justify-between items-center min-h-[60px] dark:bg-gray-800 dark:border-b-gray-700">
                    {showTableSearch && (
                        <Input
                            placeholder="Filter..."
                            value={(() => {
                                if (onTableSearch) return searchTerm;
                                return (table.getColumn(searchColumnName ?? '')?.getFilterValue() as string) ?? '';
                            })()}
                            onChange={event =>
                                onTableSearch
                                    ? handleExternalSearch(event)
                                    : table.getColumn(searchColumnName ?? '')?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                    )}
                    {tableHeader && <div className="data-table-header-custom w-full flex gap-x-3">{tableHeader}</div>}
                </div>
            )}
            <div>
                <Table className={tableClassNames}>
                    {!hideTableHeader && (
                        <TableHeader className={headerClassNames}>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => renderHeaderCell(header))}
                                </TableRow>
                            ))}
                        </TableHeader>
                    )}
                    {enableColgroup && (
                        <colgroup>
                            {table.getFlatHeaders().map(headerGroup => {
                                const width = (headerGroup.column.columnDef.meta as any)?.width;
                                return (
                                    <col
                                        key={headerGroup.id}
                                        {...(width && {
                                            style: { width },
                                        })}
                                        style={{ width }}
                                    />
                                );
                            })}
                        </colgroup>
                    )}
                    <TableBody>
                        {loadingData ? (
                            <TableRow className={cn(dataRowClassNames)} role="data-row">
                                <TableCell
                                    colSpan={countColumns(columns as any)}
                                    className="text-center py-6 border-r last:border-r-0"
                                >
                                    <div className="flex items-center flex-col gap-y-2">
                                        <Spinner />
                                        <span>Loading</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        className={cn(
                                            typeof dataRowClassNames === 'function'
                                                ? dataRowClassNames(row)
                                                : dataRowClassNames,
                                            {
                                                'cursor-pointer': !!renderExpandedRow,
                                            }
                                        )}
                                        onClick={() => {
                                            if (renderExpandedRow && enableExpandByRowClick) {
                                                row.toggleExpanded();
                                            }
                                        }}
                                        role="data-row"
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map(cell => {
                                            const cellSticky = (cell.column.columnDef.meta as any)?.sticky;
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        'border-r last:border-r-0',
                                                        tableBodyCellClassNames,
                                                        cellSticky === 'right' && 'sticky right-0 z-10 bg-white dark:bg-gray-900 shadow-[inset_1px_0_0_0_#e5e7eb] dark:shadow-[inset_1px_0_0_0_#4b5563]'
                                                    )}
                                                    title={typeof cell.getValue() === 'string' ? cell.getValue() as string : undefined}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                    {row.getIsExpanded() && renderExpandedRow && (
                                        <TableRow className={expandedRowClassName}>
                                            <TableCell
                                                className={expandedRowCellClassName}
                                                colSpan={row.getVisibleCells().length}
                                            >
                                                {renderExpandedRow(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow className="dark:bg-gray-900">
                                {/* disable eslint here since column def can be generic */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <TableCell colSpan={countColumns(columns as any)} className="text-center">
                                    <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4">
                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                        <p className="text-sm text-gray-500 dark:text-gray-300">No results found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {showFooter && (
                <div className="flex items-center justify-between bg-gray-100 border-t border-t-gray-300 px-6 pt-3 pb-4 rounded-b-lg dark:bg-gray-800 dark:border-t-gray-800">
                    <div className="flex items-center gap-x-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                    {table.getPageCount() > 0 && (
                        <p className="text-sm text-gray-600 font-medium dark:text-gray-300">{`Page ${
                            table.getState().pagination.pageIndex + 1
                        } of ${table.getPageCount()}`}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataTable;
