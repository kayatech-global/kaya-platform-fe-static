'use client';
import { FormBody as WorkflowAuthoringForm } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/workflow-authoring-form';
import { WorkflowAuthoringData } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/workflow-authoring-table-container';
import { Button, Input, SelectableRadioItem } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { SelectableType } from '@/enums';
import { mockTagNames, useWorkflowAuthoring } from '@/hooks/use-workflow-authoring';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WorkflowSelectorProps {
    label?: string;
    labelClassName?: string;
    hideDescription?: boolean;
    isReadonly?: boolean;
    workflowLoading?: boolean;
    ignoreCurrentWorkflow?: boolean;
    allWorkflows: WorkflowAuthoringData[];
    workflow?: WorkflowAuthoringData;
    workflowId?: string;
    setWorkflow: React.Dispatch<React.SetStateAction<WorkflowAuthoringData | undefined>>;
}

export const WorkflowSelector = ({
    label,
    labelClassName,
    hideDescription = false,
    ignoreCurrentWorkflow,
    isReadonly,
    workflowLoading,
    allWorkflows,
    workflow,
    workflowId,
    setWorkflow,
}: WorkflowSelectorProps) => {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [openNewModal, setOpenNewModal] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedItemId, setCheckedItemId] = useState<string>();
    const [allSearchableWorkflows, setAllSearchableWorkflows] = useState<WorkflowAuthoringData[]>(allWorkflows);

    useEffect(() => {
        if (workflow) {
            setCheckedItemId(workflow.id);
        }
    }, [allWorkflows]);

    useEffect(() => {
        if (ignoreCurrentWorkflow && workflowId) {
            setAllSearchableWorkflows(allWorkflows.filter(w => w.id !== workflowId));
        } else {
            setAllSearchableWorkflows(allWorkflows);
        }
    }, [allWorkflows, allWorkflows?.length, ignoreCurrentWorkflow, workflowId, setAllSearchableWorkflows]);

    const { isValid, isSaving, tagNames, errors, control, register, watch, handleSubmit, onHandleSubmit, setValue } =
        useWorkflowAuthoring();

    const handleChange = () => {
        setOpenNewModal(true);
        // if (!agent?.isReusableAgentSelected && prompt) {
        //     setCheckedItemId(prompt.id);
        // }
    };

    const handleRemove = () => {
        setWorkflow(undefined);
        setCheckedItemId(undefined);
        // if (onPromptChange) {
        //     onPromptChange(undefined);
        // }
        // if (onModalChange) {
        //     onModalChange(openNewModal);
        // }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);
    };

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setOpen(false);
        } else if (cancel) {
            setOpenNewModal(false);
            if (ignoreCurrentWorkflow && workflowId) {
                setAllSearchableWorkflows(allWorkflows.filter(w => w.id !== workflowId));
            } else {
                setAllSearchableWorkflows(allWorkflows);
            }
        } else {
            setOpenNewModal(open);
        }
    };

    const handleClick = () => {
        const selectedWorkflow = allSearchableWorkflows.find(w => w.id === checkedItemId);
        setWorkflow(selectedWorkflow);
        setOpenNewModal(false);
        if (ignoreCurrentWorkflow && workflowId) {
            setAllSearchableWorkflows(allWorkflows.filter(w => w.id !== workflowId));
        } else {
            setAllSearchableWorkflows(allWorkflows);
        }
        // if (onPromptChange) {
        //     onPromptChange(selectedPrompt);
        // }
    };

    const onEdit = (id: string) => {
        const obj = allWorkflows.find(x => x.id === id);
        if (obj) {
            setValue('id', obj.id);
            setValue('description', obj.description);
            setValue('name', obj.workflowName);
            setValue('isReadOnly', obj?.isReadOnly);
            if (obj.workflowTags) {
                const flatData = mockTagNames.flatMap(x => x.options);
                setValue(
                    'options',
                    flatData.filter(tag => obj.workflowTags.split(', ').includes(tag.label))
                );
            }
        }
        setEdit(true);
        setOpen(true);
    };

    const getWorkflowValue = () => {
        const value: valuesProps[] = []; // Initialize as an empty array

        if (workflow) {
            value.push({
                title: workflow.workflowName,
                description: `${workflow.description?.slice(0, 65)}...`,
                imagePath: '/png/workflow-empty-state.png',
            });
        }

        return value.length > 0 ? value : undefined;
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'Select Workflow'}
                labelClassName={labelClassName}
                values={getWorkflowValue()}
                imagePath="/png/empty_selection.png"
                imageType="png"
                description={'Select a workflow to configure its settings and view details.'}
                hideDescription={hideDescription}
                footer={
                    workflow ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!workflow && (
                                <Button variant="link" onClick={() => setOpenNewModal(true)}>
                                    Add Workflow
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <Dialog open={openNewModal} onOpenChange={() => {}}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                {isOpen && <Unplug />}
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    {isOpen ? `${isEdit ? 'Edit' : 'New'} Workflow` : 'Workflows'}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            {!isOpen && (
                                <div className="flex justify-end">
                                    <Button variant="link" disabled={isReadonly} onClick={() => setOpen(true)}>
                                        New Workflow
                                    </Button>
                                </div>
                            )}
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <WorkflowAuthoringForm
                                        isOpen={false}
                                        setOpen={() => {}}
                                        isEdit={isEdit}
                                        isValid={isValid}
                                        isSaving={isSaving}
                                        tagNames={tagNames}
                                        errors={errors}
                                        control={control}
                                        register={register}
                                        watch={watch}
                                        handleSubmit={handleSubmit}
                                        onHandleSubmit={onHandleSubmit}
                                    />
                                </div>
                            ) : (
                                <>
                                    {workflowLoading ? (
                                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                            <LoaderCircle
                                                className="animate-spin"
                                                size={25}
                                                width={25}
                                                height={25}
                                                absoluteStrokeWidth={undefined}
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                Please wait! loading the workflows for you...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                className="w-full"
                                                placeholder="Search workflows"
                                                onChange={handleSearch}
                                            />
                                            {allSearchableWorkflows?.length > 0 ? (
                                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                    {allSearchableWorkflows.map((w, i) => {
                                                        return (
                                                            <SelectableRadioItem
                                                                key={i}
                                                                id={w.id as string}
                                                                title="Workflow"
                                                                type={SelectableType.WORKFLOW}
                                                                label={w.workflowName}
                                                                description={w.description}
                                                                isChecked={checkedItemId === w.id}
                                                                imagePath="/png/workflow-empty-state.png"
                                                                handleClick={() => setCheckedItemId(w.id)}
                                                                onEdit={onEdit}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                                    <FileX className="text-gray-500 dark:text-gray-300" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                        {searchTerm !== '' ? (
                                                            <>No results found</>
                                                        ) : (
                                                            <>
                                                                No workflows have been
                                                                <br /> configured
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        {isOpen ? (
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isEdit ? 'Update' : 'Create'}
                            </Button>
                        ) : (
                            <Button disabled={checkedItemId === undefined} variant="primary" onClick={handleClick}>
                                Add Workflows
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
