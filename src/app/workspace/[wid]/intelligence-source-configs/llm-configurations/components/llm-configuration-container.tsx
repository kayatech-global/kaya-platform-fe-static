'use client';

import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { LlmConfigurationTableContainer } from './llm-configuration-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useLlmConfiguration } from '@/hooks/use-llm-configuration';
import LlmConfigurationForm from './llm-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const LlmConfigurationContainer = () => {
    const {
        isFetching,
        llmConfigurationTableData,
        activityData,
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        control,
        bottomRef,
        onLlmConfigurationFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        refetch,
    } = useLlmConfiguration();
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setIsEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setIsEdit(true);
        setOpen(true);
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
                        <LlmConfigurationTableContainer
                            llmConfigurations={llmConfigurationTableData}
                            providers={providers}
                            onLlmConfigurationFilter={onLlmConfigurationFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onRecentActivity={handleClick}
                        />
                    </div>
                </div>
            </div>
            {/* Recent activities will be shown in the below drawer on small screens */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={workflowAuthoringPageHeighInDrawer}
                        />
                    </div>
                }
            />
            <LlmConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                providers={providers}
                isValid={isValid}
                secrets={secrets}
                isSaving={isSaving}
                control={control}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
                errors={errors}
                loadingSecrets={loadingSecrets}
            />
        </React.Fragment>
    );
};
