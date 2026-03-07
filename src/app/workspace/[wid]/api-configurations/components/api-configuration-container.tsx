'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { ApiConfigurationTableContainer } from './api-configuration-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useApiConfiguration } from '@/hooks/use-api-configuration';
import ApiConfigurationForm from './api-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { BulkApiImportDrawer as BulkApiImport } from './api-configuration-bulkApi-Import';

export const ApiConfigurationContainer = () => {
    const {
        isFetching,
        apiConfigurationTableData,
        activityData,
        apiHeaders,
        payloads,
        defaultApiParameters,
        control,
        isOpen,
        errors,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        bottomRef,
        onApiConfigurationFilter,
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
        updateDefaultApiParametersData,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
        refetchApiConfigs,
    } = useApiConfiguration();
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    // Bulk Import drawer
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

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

    const handleOpenBulkImport = () => {
        setIsBulkImportOpen(true);
    };

    if (isFetching && !isBulkImportOpen) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

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
                        <ApiConfigurationTableContainer
                            apiConfigurations={apiConfigurationTableData}
                            onApiConfigurationFilter={onApiConfigurationFilter}
                            onNewButtonClick={() => handleCreate()}
                            onImportBulkClick={handleOpenBulkImport}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onRecentActivity={handleClick}
                        />
                    </div>
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

            {/* New API Config Drawer */}
            <ApiConfigurationForm
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
                defaultApiParameters={defaultApiParameters}
                control={control}
                loadingSecrets={loadingSecrets}
                append={append}
                remove={remove}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                updatePayloadDataType={updatePayloadDataType}
                updateDefaultApiParametersData={updateDefaultApiParametersData}
                refetch={refetch}
                promotedVariables={promotedVariables}
                updatePromotedVariablesDataType={updatePromotedVariablesDataType}
            />

            {/* Bulk API Import Drawer */}
            <BulkApiImport
                open={isBulkImportOpen}
                setOpen={setIsBulkImportOpen}
                secrets={secrets}
                loadingSecrets={loadingSecrets}
                refetch={refetch}
                refetchApiConfigs={refetchApiConfigs}
            />
        </React.Fragment>
    );
};
