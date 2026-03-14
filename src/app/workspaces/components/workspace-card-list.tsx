import React, { useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { Button, TruncateCell } from '@/components';
import WorkspaceCard, { WorkspaceCardProps } from '@/components/molecules/workspace-card/workspace-card';
import { cn, isNullOrEmpty } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useAuth } from '@/context';
import { RoleType } from '@/enums';
import { IGroupWorkspace, IOption } from '@/models';

export interface WorkspaceCardListProps {
    metadataOption: IOption | null;
    data: IGroupWorkspace[] | WorkspaceCardProps[];
    isFetching: boolean;
    isSuccess: boolean;
    page: number;
    totalPages: number;
    hasFilters: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onHandleEdit: (workspaceId: number | string) => void;
    onHandleDelete: (workspaceId: number | string) => void;
}

const EmptyWorkspace = () => (
    <div
        className="flex w-full items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
        role="alert"
    >
        <InfoIcon className="shrink-0 inline w-4 h-4 me-3" />
        <div className="text-center">
            {
                "We couldn't find any workspaces matching your search. Try a different name or clear your filters to see all results"
            }
        </div>
    </div>
);

const WorkspaceCardGrid = ({
    data,
    isSuccess,
    hasFilters,
    cardWidth,
    onHandleEdit,
    onHandleDelete,
}: {
    data: WorkspaceCardProps[];
    isSuccess: boolean;
    hasFilters?: boolean;
    cardWidth?: string;
    onHandleEdit: (workspaceId: number | string) => void;
    onHandleDelete: (workspaceId: number | string) => void;
}) => {
    const { user, isSuperAdmin } = useAuth();
    const workspaces = user?.user?.workspaces;

    if (data?.length > 0 || !isSuccess) {
        return (
            <>
                {data.map((workspace) => {
                    const isWorkspaceAdmin = workspaces?.some(
                        ws => ws.id === workspace.id && ws.roles.includes(RoleType.WORKSPACE_ADMIN)
                    );

                    return (
                        <WorkspaceCard
                            key={workspace.id}
                            {...workspace}
                            showOptions={isSuperAdmin || isWorkspaceAdmin}
                            cardWidth={cardWidth}
                            onDeleteClick={workspaceId => {
                                onHandleDelete(workspaceId);
                            }}
                            onEditClick={workspaceId => {
                                onHandleEdit(workspaceId);
                            }}
                        />
                    );
                })}
            </>
        );
    }

    if (hasFilters) return <EmptyWorkspace />;

    return (
        <div
            className="flex w-full items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            role="alert"
        >
            <InfoIcon className="shrink-0 inline w-4 h-4 me-3" />
            <div className="text-center">
                Sorry, you have not been assigned any workspace on KAYA AI Platform. Please contact your admin for
                access
            </div>
        </div>
    );
};

const WorkspaceCardList = ({
    metadataOption,
    data,
    isFetching,
    page,
    totalPages,
    isSuccess,
    hasFilters,
    onNext,
    onPrevious,
    onHandleEdit,
    onHandleDelete,
}: WorkspaceCardListProps) => {
    const [workspaceId, setWorkspaceId] = useState<number | string | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);

    const onDeleteClick = (id: number | string) => {
        setWorkspaceId(id);
        setOpen(true);
    };

    const handleDelete = () => {
        setOpen(false);
        onHandleDelete(workspaceId as number | string);
        setWorkspaceId(undefined);
    };

    return (
        <div className="bg-white rounded-b-lg dark:bg-[#1F2937] flex flex-col border border-gray-200 shadow-sm dark:border-gray-800 overflow-hidden overflow-y-auto">
            <div
                className={cn('gap-x-4 gap-y-5 px-4 py-4', {
                    'flex flex-wrap': data?.length === 0 || isNullOrEmpty(metadataOption?.value) || isFetching,
                    'grid grid-cols-3': data?.length > 0 && isNullOrEmpty(metadataOption?.value),
                    'flex flex-col': data?.length > 0 && !isNullOrEmpty(metadataOption?.value) && !isFetching,
                })}
            >
                {isFetching ? (
                    <>
                        {[...Array(3).keys()]?.map(item => (
                            <div
                                key={item}
                                className={cn(
                                    'realm-card !w-[300px] min-h-[180px] h-fit bg-[rgba(255,255,255,0.6)] h-[124px] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                                    'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                    'animate-pulse'
                                )}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {isNullOrEmpty(metadataOption?.value) ? (
                            <WorkspaceCardGrid
                                data={data as WorkspaceCardProps[]}
                                isSuccess={isSuccess}
                                hasFilters={hasFilters}
                                onHandleDelete={onDeleteClick}
                                onHandleEdit={onHandleEdit}
                            />
                        ) : (
                            <>
                                {(data as IGroupWorkspace[])?.length > 0 ? (
                                    (data as IGroupWorkspace[])?.map((item, index) => (
                                        <div key={item.metadataValue ?? `group-${index}`}>
                                            <TruncateCell
                                                length={90}
                                                value={item.metadataValue}
                                                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4"
                                            />
                                            <div className="grid grid-cols-3 gap-x-4 gap-y-5 p-4 rounded-lg bg-gray-100 dark:bg-gray-900">
                                                <WorkspaceCardGrid
                                                    data={item.workspaces}
                                                    isSuccess={isSuccess}
                                                    cardWidth="!w-[290px]"
                                                    onHandleDelete={onDeleteClick}
                                                    onHandleEdit={onHandleEdit}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyWorkspace />
                                )}
                            </>
                        )}

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
                )}
            </div>
            {isNullOrEmpty(metadataOption?.value) && (
                <div className="flex items-center justify-between bg-gray-100 border-t border-t-gray-300 px-6 pt-3 pb-4 rounded-b-lg dark:bg-gray-800 dark:border-t-gray-800 mt-auto">
                    <div className="flex items-center gap-x-3">
                        <Button variant="secondary" size="sm" disabled={1 >= page} onClick={onPrevious}>
                            Previous
                        </Button>
                        <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={onNext}>
                            Next
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600 font-medium dark:text-gray-300">{`Page ${page} of ${totalPages}`}</p>
                </div>
            )}
        </div>
    );
};

export default WorkspaceCardList;
