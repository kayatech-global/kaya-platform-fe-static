'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil } from 'lucide-react';
import { Button, Input, TruncateCell } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { IGuardrailModelConfig } from '@/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { GUARDRAIL_MODEL_PROVIDER_OPTIONS, GUARDRAIL_MODEL_TYPE_OPTIONS } from '@/constants';

interface GuardrailsModelConfigurationTableContainerProps {
    GuardrailsModelConfigurations: IGuardrailModelConfig[];
    onGuardrailsModelConfigFilter: (filter: IGuardrailModelConfig | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<IGuardrailModelConfig>; onDelete: (id: string) => void }) => {
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
    const columns: ColumnDef<IGuardrailModelConfig>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Name</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell
                            value={handleNoValue(row.getValue('name')) as string}
                            length={100}
                        />
                    </div>
                );
            },
        },
        {
            accessorKey: 'GuardrailType',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Guardrail Type</div>;
            },
            cell({ row }) {
                const value = GUARDRAIL_MODEL_TYPE_OPTIONS?.find(x => x.value === row?.original?.guardrailType)?.name;
                return <div>{handleNoValue(value)}</div>;
            },
        },
        {
            accessorKey: 'provider',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Guardrail Model Provider</div>;
            },
            cell({ row }) {
                const value = GUARDRAIL_MODEL_PROVIDER_OPTIONS?.flatMap(x => x.options)?.find(
                    x => x.value === row.getValue('provider')
                )?.name;
                return <div>{handleNoValue(value)}</div>;
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

export const GuardrailsModelConfigurationTableContainer = ({
    GuardrailsModelConfigurations,
    onGuardrailsModelConfigFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
}: GuardrailsModelConfigurationTableContainerProps) => {
    const { register, handleSubmit } = useForm<IGuardrailModelConfig>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: IGuardrailModelConfig) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onGuardrailsModelConfigFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={GuardrailsModelConfigurations}
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
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Guardrail Model
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
