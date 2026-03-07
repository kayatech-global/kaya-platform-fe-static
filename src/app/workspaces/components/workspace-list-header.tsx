'use client';

import { Button, Input, MultiSelect } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import React, { useState } from 'react';
import WorkspaceForm from './workspace-form';
import { useAuth } from '@/context';
import { IOption, ISearch } from '@/models';
import { useForm } from 'react-hook-form';

interface WorkspaceListHeaderProps {
    metadataOption: IOption | null;
    openNewWorkspaceForm: boolean;
    workspaceId: number | string | undefined;
    metadataCollection: string[];
    setOpenNewWorkspaceForm: React.Dispatch<React.SetStateAction<boolean>>;
    setWorkspaceId: React.Dispatch<React.SetStateAction<number | string | undefined>>;
    setMetadataOption: React.Dispatch<React.SetStateAction<IOption | null>>;
    onFilter: (data: ISearch) => void;
    onPageUpdate: (page: number) => void;
    refetchEnvironment: () => void;
    refetchMetadata: () => void;
}

const WorkspaceListHeader = ({
    metadataOption,
    openNewWorkspaceForm,
    setOpenNewWorkspaceForm,
    workspaceId,
    metadataCollection,
    setWorkspaceId,
    setMetadataOption,
    onFilter,
    onPageUpdate,
    refetchEnvironment,
    refetchMetadata,
}: WorkspaceListHeaderProps) => {
    const { isSuperAdmin } = useAuth();
    const { register, handleSubmit } = useForm<ISearch>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const handleCreate = () => {
        setOpenNewWorkspaceForm(true);
        setWorkspaceId(undefined);
    };

    const handleClose = () => {
        setOpenNewWorkspaceForm(false);
        setWorkspaceId(undefined);
        refetchMetadata();
    };

    const onHandleSubmit = (data: ISearch) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onFilter(data);
        }, 1000);
        setDebounceTimer(timer);
    };

    return (
        <div className="realm-header bg-[rgba(255,255,255,0.6)] px-6 h-[52px] flex items-center justify-between backdrop-blur-[7px] rounded-t-lg border-b border-b-gray-300 dark:bg-[rgba(31,41,55,0.8)] dark:backdrop-blur-[7px] dark:border-b-gray-700">
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                <p className="text-md font-medium text-gray-800 dark:text-white">Workspaces</p>
                <MultiSelect
                    options={metadataCollection?.map(x => ({ label: x, value: x } as IOption))}
                    value={metadataOption || null}
                    menuPortalTarget={document.body}
                    isSearchable
                    isClearable
                    placeholder="Group by Metadata"
                    onChange={selectedOptions => {
                        setMetadataOption(selectedOptions as never);
                        if (selectedOptions) onPageUpdate(-1);
                        else onPageUpdate(1);
                    }}
                    isDisabled={metadataCollection?.length === 0}
                    className="!w-[200px]"
                    menuClass="!z-50"
                    menuListClass="break-all"
                    menuPortalClass="!z-50 pointer-events-auto"
                />
            </div>
            <div className="data-table-header flex justify-between gap-x-3">
                <Input
                    {...register('search')}
                    placeholder="Filter workspaces..."
                    className="max-w-sm"
                    onKeyUp={handleSubmit(onHandleSubmit)}
                />
                {isSuperAdmin && (
                    <div className="data-table-header-button flex gap-x-3">
                        <Button onClick={() => handleCreate()} size={'sm'}>
                            New Workspace
                        </Button>
                    </div>
                )}
            </div>
            <Dialog open={openNewWorkspaceForm} onOpenChange={setOpenNewWorkspaceForm}>
                <DialogContent className="max-w-[unset] w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{workspaceId ? 'Edit Workspace' : 'New Workspace'}</DialogTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {workspaceId
                                ? 'Update the workspace, ensure its name, description, users and admins are added'
                                : 'Create a new workspace by providing its name, description and adding users and admins'}
                        </p>
                    </DialogHeader>
                    <div className="h-fit">
                        <WorkspaceForm
                            onClose={() => handleClose()}
                            workspaceId={workspaceId}
                            metadataCollection={metadataCollection}
                            refetchEnvironment={refetchEnvironment}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkspaceListHeader;
