/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Button, Input, SmallSpinner, TruncateCell } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { handleNoValue } from '@/lib/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { WorkflowReleaseSubTable } from './workflow-release-sub-table';
import { IArtifactWorkflow, IArtifactWorkflowVersions } from '@/models';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { WorkflowSaveType } from '@/enums';

export interface WorkflowReleaseTableProps {
    workflowArtifactData: IArtifactWorkflow[];
    onWorkflowArtifactFilter: (filter: IArtifactWorkflow | null) => void;
    onDeploy: (workflowId: string, artifactVersion: string, token: string) => Promise<void>;
    getWorkflowArtifactVersion: (workflowId: string, workflowName: string, artifactPath: string) => void;
    loadingArtifactVersion: boolean;
    loadingRow: string | null;
    workflowVersions: Record<string, IArtifactWorkflowVersions[]>;
    refetch: () => void;
}

const generateColumns = (
    getWorkflowArtifactVersion: (workflowId: string, workflowName: string, artifactPath: string) => void
) => {
    const onExpanded = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, row: Row<IArtifactWorkflow>) => {
        e.stopPropagation(); // prevent row click firing
        row.toggleExpanded();
        if (!row.getIsExpanded()) {
            getWorkflowArtifactVersion(row.original.workflowId, row.original.name, row.original.artifactPath);
        }
    };

    const columns: ColumnDef<IArtifactWorkflow>[] = [
        {
            id: 'expand',
            meta: {
                width: '1%',
            },
            header: () => null,
            cell: ({ row }) => {
                return (
                    <div
                        className="flex items-center gap-4 px-6 h-[60px] cursor-pointer"
                        onClick={e => onExpanded(e, row)}
                    >
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'artifactName',
            enableSorting: true,
            meta: {
                width: '70%',
            },
            header() {
                return <div className="w-full text-left">Artifact Name</div>;
            },
            cell({ row }) {
                return (
                    <div
                        onClick={e => onExpanded(e, row)}
                        className="flex items-center flex-wrap gap-x-2 w-full cursor-pointer py-4 px-6 h-[60px]"
                    >
                        <TruncateCell value={handleNoValue(row.getValue('artifactName')) as string} length={76} />
                    </div>
                );
            },
        },
        {
            accessorKey: 'workflowMetadata',
            enableSorting: true,
            header() {
                return <div className="w-full text-left">Deployed Versions</div>;
            },
            cell({ row }) {
                return (
                    <div
                        onClick={e => onExpanded(e, row)}
                        className="flex items-center flex-wrap gap-x-2 w-full cursor-pointer py-4 px-6 h-[60px]"
                    >
                        {row.original.workflowMetadata && row.original.workflowMetadata?.length > 0
                            ? row.original.workflowMetadata?.map((meta, index) => (
                                  <Badge
                                      key={`${meta.lastPulledArtifactVersion}-${meta.status}-${index}`}
                                      variant={meta.status === WorkflowSaveType.DRAFT ? 'default' : 'success'}
                                      size="sm"
                                      className="rounded-full text-xs px-2 py-0.5"
                                  >
                                      {`${meta.status === WorkflowSaveType.DRAFT ? 'Draft' : 'Published'} ${meta.lastPulledArtifactVersion}`}
                                  </Badge>
                              ))
                            : '-'}
                    </div>
                );
            },
        },
    ];

    return columns;
};

export const WorkflowReleaseTable = ({
    workflowArtifactData,
    onWorkflowArtifactFilter,
    onDeploy,
    getWorkflowArtifactVersion,
    loadingRow,
    workflowVersions,
    refetch,
}: WorkflowReleaseTableProps) => {
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const { register, handleSubmit } = useForm<IArtifactWorkflow>({ mode: 'onChange' });
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (data: IArtifactWorkflow) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onWorkflowArtifactFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(getWorkflowArtifactVersion);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={workflowArtifactData}
                searchColumnName="workflow-release"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                hideExpandedColumn={true}
                expandedColumnWidth="1%"
                tableBodyCellClassNames="py-0 px-0 h-full"
                tableHeader={
                    <div className="flex justify-between items-center">
                        <Input
                            {...register('name')}
                            placeholder="Search by Artifact Name"
                            className="w-[350px]"
                            autoComplete="one-time-code"
                            inputMode="search"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                    </div>
                }
                renderExpandedRow={row => {
                    const id = row.original.workflowId;
                    const versions = workflowVersions[id];
                    const isRowLoading = loadingRow === id;

                    if (isRowLoading)
                        return (
                            <div className="p-4 flex justify-center flex-col items-center gap-y-3">
                                <SmallSpinner classNames="static" />
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Loading available versions...
                                </p>
                            </div>
                        );

                    return (
                        <div className="ml-20">
                            <WorkflowReleaseSubTable
                                workflowReleases={versions ?? []}
                                onDeploy={onDeploy}
                                refetch={refetch}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};
