'use client';

import { useState } from 'react';
import { IGuardrailSetup } from '@/models';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Button, Input, TruncateCell } from '@/components';
import { Pencil, Trash2 } from 'lucide-react';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';

type GuardrailsTableContainerProps = {
    guardrails: IGuardrailSetup[];
    onGuardrailsFilter: (filter: IGuardrailSetup | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
};

const DeleteRecord = ({ row, onDelete }: { row: Row<IGuardrailSetup>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id as string);
        setOpen(false);
    };

    return (
        <>
            <Button
                className={`w-full sm:w-max ${row.original.isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
                disabled={row.original.isReadOnly}
            >
                <Trash2
                    size={18}
                    className={cn('', {
                        'text-gray-300 dark:text-gray-600': row.original.isReadOnly,
                        'text-gray-500 dark:text-gray-200': !row.original.isReadOnly,
                    })}
                />
            </Button>
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
                        <Button variant={'primary'} size="sm" onClick={handleDelete}>
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const generateColumns = (onEditButtonClick: (id: string) => void, onDelete: (id: string) => void) => {
    const columns: ColumnDef<IGuardrailSetup>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('name'))}</div>;
            },
        },
        {
            accessorKey: 'description',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Description</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('description')) as string} length={80} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'id',
            enableSorting: false,
            header() {
                return <div className="w-full text-left"></div>;
            },
            cell({ row }) {
                return (
                    <div className="flex items-center gap-x-4">
                        <DeleteRecord row={row} onDelete={onDelete} />
                        <Pencil
                            size={18}
                            className="text-gray-500 cursor-pointer dark:text-gray-200"
                            onClick={() => onEditButtonClick(row.getValue('id'))}
                        />
                    </div>
                );
            },
        },
    ];
    return columns;
};

export const GuardrailsTableContainer = ({
    guardrails,
    onGuardrailsFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
}: GuardrailsTableContainerProps) => {
    const { register, handleSubmit } = useForm<IGuardrailSetup>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: IGuardrailSetup) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onGuardrailsFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);
    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={guardrails}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Name"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Guardrail
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
