'use client';

import { Button, Input, Select } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import DataTable from '@/components/molecules/table/data-table';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn, handleNoValue } from '@/lib/utils';
import { ConnectorType, IConnectorForm } from '@/models';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ListFilter, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, UseFormRegister, UseFormReset, UseFormWatch, UseFormHandleSubmit } from 'react-hook-form';

interface ConnectorsTableContainerProps {
    connectors: IConnectorForm[];
    onFilter: (filter: IConnectorForm | null) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRecentActivity: () => void;
}

const DeleteRecord = ({ row, onDelete }: { row: Row<IConnectorForm>; onDelete: (id: string) => void }) => {
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
// Filter popover component, following the pattern in llm-configuration-table-container.tsx
const ConnectorsFilter = ({
    register,
    reset,
    watch,
    handleSubmit,
    onFilter,
}: {
    register: UseFormRegister<IConnectorForm>;
    reset: UseFormReset<IConnectorForm>;
    watch: UseFormWatch<IConnectorForm>;
    handleSubmit: UseFormHandleSubmit<IConnectorForm>;
    onFilter: (filter: IConnectorForm | null) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [maxDistance, setMaxDistance] = useState(0);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const distanceToTop = buttonRect.top;
        const distanceToBottom = viewportHeight - buttonRect.bottom;
        const maxDist = Math.max(distanceToTop, distanceToBottom);
        setMaxDistance(maxDist - 20);
    };

    const onHandleSubmit = (data: IConnectorForm) => {
        onFilter(data);
        setOpen(false);
    };

    const clearFilter = () => {
        reset({ search: watch('search'), name: '', description: '', type: ConnectorType.Empty });
        onFilter({ search: watch('search') } as IConnectorForm);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="flex gap-x-2">
                <PopoverTrigger asChild>
                    <Button variant="secondary" leadingIcon={<ListFilter />} onClick={handleButtonClick}>
                        Filter
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent
                className={cn(
                    'w-72 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500'
                )}
                style={{ maxHeight: `${maxDistance}px` }}
                side="bottom"
                align="end"
            >
                <div className="space-y-2 flex flex-col gap-y-3">
                    <Select
                        {...register('type')}
                        placeholder="Select a Type"
                        options={[
                            { name: 'Pega', value: 'Pega' },
                            { name: 'Database', value: 'Database' },
                        ]}
                        currentValue={watch('type')}
                    />
                    <div className="flex items-center justify-end mt-3 gap-x-2">
                        <Button variant={'secondary'} onClick={clearFilter}>
                            Clear
                        </Button>
                        <Button onClick={handleSubmit(onHandleSubmit)}>Apply Filter</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const generateColumns = (onEditButtonClick: (id: string) => void, onDelete: (id: string) => void) => {
    const columns: ColumnDef<IConnectorForm>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Connector Name</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('name'))}</div>;
            },
        },
        {
            accessorKey: 'type',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Type</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('type'))}</div>;
            },
        },
        {
            accessorKey: 'description',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Description</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('description'))}</div>;
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

export const ConnectorsTableContainer = ({
    connectors,
    onFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onRecentActivity,
}: ConnectorsTableContainerProps) => {
    const { register, handleSubmit, reset, watch } = useForm<IConnectorForm>({
        mode: 'onChange',
        defaultValues: { type: ConnectorType.Empty },
    });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: IConnectorForm) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
            onFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={connectors}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Connector Name"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <ConnectorsFilter
                                register={register}
                                reset={reset}
                                watch={watch}
                                handleSubmit={handleSubmit}
                                onFilter={onFilter}
                            />
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New Connector
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
