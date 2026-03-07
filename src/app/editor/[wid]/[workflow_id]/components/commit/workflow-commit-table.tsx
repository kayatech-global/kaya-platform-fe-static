import { Dispatch, SetStateAction } from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { handleNoValue } from '@/lib/utils';
import { IPackageWorkflow } from '@/models';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

interface WorkflowCommitTableProps {
    workflows: IPackageWorkflow[];
    version?: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const generateColumns = (version: string | undefined, setOpen: Dispatch<SetStateAction<boolean>>) => {
    const columns: ColumnDef<IPackageWorkflow>[] = [
        {
            accessorKey: 'workflow',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Workflow</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('workflow'))}</div>;
            },
        },
        {
            accessorKey: 'source',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Current Version</div>;
            },
            cell({ row }) {
                return <div>{row.original.hasCurrentVersion ? handleNoValue(row.getValue('source')) : '-'}</div>;
            },
        },
        {
            accessorKey: 'destination',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Previous Version</div>;
            },
            cell({ row }) {
                return <div>{handleNoValue(row.getValue('destination'))}</div>;
            },
        },
        {
            accessorKey: 'action',
            enableSorting: false,
            header() {
                return <div className="w-full text-left">Changes</div>;
            },
            cell() {
                return (
                    <div className="flex items-center gap-x-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        className="w-full sm:w-max disabled:cursor-not-allowed"
                                        variant="link"
                                        size="icon"
                                        disabled={!version}
                                        onClick={() => setOpen(true)}
                                    >
                                        <span className="flex items-center gap-x-2">
                                            <Eye size={16} />
                                            <span className="text-sm font-normal">View</span>
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                {!version && (
                                    <TooltipContent side="left" align="center">
                                        No previous version available
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const WorkflowCommitTable = ({ workflows, version, setOpen }: WorkflowCommitTableProps) => {
    const columns = generateColumns(version, setOpen);

    return <DataTable columns={columns} data={workflows} showHeader={false} />;
};
