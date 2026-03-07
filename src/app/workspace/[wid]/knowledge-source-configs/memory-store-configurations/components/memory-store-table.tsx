import { Button, Input } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { convert_YYYY_MM_DD_HH_MM, handleNoValue, isNullOrEmpty } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

export interface TableDataType {
    id: string;
    name: string;
    connectorSource: string;
    lastSync: string;
    search?: string;
    isReadOnly?: boolean;
}

interface MemoryStoreTableProps {
    data: TableDataType[];
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const columns: ColumnDef<TableDataType>[] = [
    {
        enableSorting: true,
        header: () => <div className="w-full text-left">Connection name</div>,
        accessorKey: 'name',
        cell: ({ row }) => {
            return <div>{row.getValue('name')}</div>;
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left">Connector Source</div>,
        accessorKey: 'connectorSource',
        cell: ({ row }) => {
            return <div>{row.getValue('connectorSource')}</div>;
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left">Last sync</div>,
        accessorKey: 'lastSync',
        cell: ({ row }) => {
            return (
                <div>
                    {isNullOrEmpty(row.getValue('lastSync'))
                        ? handleNoValue(row.getValue('lastSync'))
                        : convert_YYYY_MM_DD_HH_MM(row.getValue('lastSync'))}
                </div>
            );
        },
    },
    {
        enableSorting: false,
        header: () => <div className="w-full text-left"></div>,
        accessorKey: 'action',
        cell: () => {
            return (
                <div className="flex items-center gap-x-4">
                    <Trash2 size={18} className="text-gray-500 cursor-pointer dark:text-gray-200" />
                    <Pencil size={18} className="text-gray-500 cursor-pointer dark:text-gray-200" />
                </div>
            );
        },
    },
];

export const MemoryStoreTable = ({ data, setIsOpen }: MemoryStoreTableProps) => {
    const { register } = useForm<TableDataType>({ mode: 'onChange' });

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={data}
                searchColumnName="workflow"
                showFooter
                defaultPageSize={3}
                showTableSearch={false}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input {...register('search')} placeholder="Search memory stores" className="max-w-sm" />
                        <div className="flex ml-2">
                            <Button size={'sm'} onClick={() => setIsOpen(true)}>
                                New Memory Store
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
