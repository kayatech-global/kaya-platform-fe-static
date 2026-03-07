'use client';

import React, { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Trash2, Pencil, EyeIcon } from 'lucide-react';
import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TruncateCell } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';

export interface PromptTemplateData {
    id: string;
    promptKey: string;
    promptDescription: string;
    prompt: string;
    search?: string;
    isReadOnly?: boolean;
}

interface PromptTemplateTableContainerProps {
    promptTemplates: PromptTemplateData[];
    onPromptTemplateFilter: (filter: PromptTemplateData | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    showPromptModel: (id: string) => void;
    onRecentActivity: () => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<PromptTemplateData>; onDelete: (id: string) => void }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleDelete = () => {
        onDelete(row.original.id);
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

const generateColumns = (
    onEditButtonClick: (id: string) => void,
    onDelete: (id: string) => void,
    showPromptModel: (id: string) => void
) => {
    const columns: ColumnDef<PromptTemplateData>[] = [
        {
            accessorKey: 'promptKey',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Prompt Key</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('promptKey'))}</div>;
            },
        },
        {
            accessorKey: 'promptDescription',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Prompt Description</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('promptDescription')) as string} length={35} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'prompt',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Prompt</div>;
            },
            cell({ row }) {
                return (
                    <div>
                        <TruncateCell value={handleNoValue(row.getValue('prompt')) as string} length={35} />
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <EyeIcon
                                        size={18}
                                        className="text-gray-500 cursor-pointer dark:text-gray-200"
                                        onClick={() => showPromptModel(row.getValue('id'))}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side="left" align="center">
                                    View prompt
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

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

export const PromptTemplateTableContainer = ({
    promptTemplates,
    onPromptTemplateFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    showPromptModel,
    onRecentActivity,
}: PromptTemplateTableContainerProps) => {
    const { register, handleSubmit } = useForm<PromptTemplateData>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: PromptTemplateData) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onPromptTemplateFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete, showPromptModel);
    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={promptTemplates}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Prompt Key"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Prompt Template
                            </Button>
                            <Button variant={'link'} size={'sm'} onClick={onRecentActivity} className="hidden">
                                Recent Activities
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
