'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { GuardrailsApiConfigurationTableContainer } from './guardrails-api-configuration-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useGuardrailsApiConfiguration } from '@/hooks/use-guardrails-api-configuration';
import GuardrailsApiConfigurationForm from './guardrails-api-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const GuardrailsApiConfigurationContainer = () => {
    const {
        isFetching,
        guardrailsApiConfigurationTableData,
        activityData,
        apiHeaders,
        payloads,
        control,
        isOpen,
        errors,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        bottomRef,
        onGuardrailsApiConfigurationFilter,
        register,
        watch,
        setValue,
        append,
        remove,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        updatePayloadDataType,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
    } = useGuardrailsApiConfiguration();

    const { isLg, isMobile } = useBreakpoint();
    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const handleDrawerOpen = useCallback(() => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    }, []);

    const handleCreate = useCallback(() => {
        setIsEdit(false);
        setOpen(true);
    }, [setOpen]);

    const handleEdit = useCallback(
        (id: string) => {
            onEdit(id);
            setIsEdit(true);
            setOpen(true);
        },
        [onEdit, setOpen]
    );

    const handleDrawerClose = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (isDrawerOpen) {
                setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isDrawerOpen]);

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    ref={workflowAuthoringPageRef}
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': isLg,
                    })}
                >
                    <GuardrailsApiConfigurationTableContainer
                        guardrailsApiConfigurations={guardrailsApiConfigurationTableData}
                        onGuardrailsApiConfigurationFilter={onGuardrailsApiConfigurationFilter}
                        onNewButtonClick={handleCreate}
                        onEditButtonClick={handleEdit}
                        onDelete={onDelete}
                        onRecentActivity={handleDrawerOpen}
                    />
                </div>
            </div>

            {/* Recent activities drawer */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={handleDrawerClose}>
                            Close
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

            {/* Guardrails API Configuration Form */}
            <GuardrailsApiConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isValid={isValid}
                secrets={secrets}
                isSaving={isSaving}
                setOpen={setOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                apiHeaders={apiHeaders}
                payloads={payloads}
                control={control}
                loadingSecrets={loadingSecrets}
                append={append}
                remove={remove}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                updatePayloadDataType={updatePayloadDataType}
                refetch={refetch}
                promotedVariables={promotedVariables}
                updatePromotedVariablesDataType={updatePromotedVariablesDataType}
            />
        </div>
    );
};
