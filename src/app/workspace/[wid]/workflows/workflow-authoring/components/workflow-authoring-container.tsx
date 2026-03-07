'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React, { useRef, useState } from 'react';
import { PermissionDeniedDialog } from '@/components/atoms/permission-denied-dialog';
import { WorkflowAuthoringTableContainer } from './workflow-authoring-table-container';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { useWorkflowAuthoring } from '@/hooks/use-workflow-authoring';
import WorkflowAuthoringForm from './workflow-authoring-form';

export const WorkflowAuthoringContainer = () => {
    const {
        isFetching,
        workflowAuthoringTableData,
        tagNames,
        control,
        errors,
        isOpen,
        isValid,
        isSaving,
        workflowQuota,
        hasQuota,
        loadingVariables,
        variables,
        onWorkflowAuthoringFilter,
        register,
        watch,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onEdit,
        onDelete,
        onWorkFlowConfigModel,
    } = useWorkflowAuthoring();
    const { isLg } = useBreakpoint();
    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [isEdit, setEdit] = useState(false);
    const [permissionDeniedOpen, setPermissionDeniedOpen] = useState(false);

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };

    // Wrap the onHandleSubmit to check for readOnly before saving
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = (data: any) => {
        if (data.isReadOnly) {
            setPermissionDeniedOpen(true);
            return;
        }
        onHandleSubmit(data);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <WorkflowAuthoringTableContainer
                            workflowAuthoring={workflowAuthoringTableData}
                            tagNames={tagNames}
                            workflowQuota={workflowQuota}
                            hasQuota={hasQuota}
                            loadingVariables={loadingVariables}
                            variables={variables}
                            onWorkflowAuthoringFilter={onWorkflowAuthoringFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onWorkFlowConfigModel={onWorkFlowConfigModel}
                        />
                    </div>
                </div>
            </div>
            <WorkflowAuthoringForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isValid={isValid}
                isSaving={isSaving}
                tagNames={tagNames}
                control={control}
                setOpen={setOpen}
                register={register}
                watch={watch}
                handleSubmit={handleSubmit}
                onHandleSubmit={handleSave}
            />
            <PermissionDeniedDialog
                open={permissionDeniedOpen}
                onClose={() => setPermissionDeniedOpen(false)}
                message="You don't have permission to save or update this workflow."
            />
        </React.Fragment>
    );
};
