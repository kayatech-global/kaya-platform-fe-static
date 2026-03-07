'use client';

import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { useConnector } from '@/hooks/use-connector';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ConnectorsTableContainer } from './connectors-table-container';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { Button } from '@/components';
import { ConnectorConfigForm } from './connector-config-form';

export const ConnectorsContainer = () => {
    const {
        connectorsTableData,
        isOpen,
        setIsOpen,
        secrets,
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        errors,
        isValid,
        refetch,
        loadingSecrets,
        onFilter,
        onHandleSubmit,
        onEdit,
        onDelete,
        isSaving,
        isFetching,
        bottomRef,
        loadingIntellisense,
        allIntellisenseValues,
        refetchVariables,
        editorContent,
        intelligentSource,
        handleEditorChange,
        intellisenseOptions,
        trigger,
        databases,
        loadingDatabases,
        refetchDatabase,
    } = useConnector();

    const { isLg, isMobile } = useBreakpoint();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setIsEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setIsEdit(true);
        setIsOpen(true);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <ConnectorsTableContainer
                            connectors={connectorsTableData}
                            onFilter={onFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onRecentActivity={handleClick}
                        />
                    </div>
                </div>
            </div>
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
                            data={[]}
                            bottomRef={bottomRef}
                            activityBodyHeight={workflowAuthoringPageHeighInDrawer}
                        />
                    </div>
                }
            />
            <ConnectorConfigForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isValid={isValid}
                secrets={secrets}
                isSaving={isSaving}
                setOpen={setIsOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                control={control}
                loadingSecrets={loadingSecrets}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
                allIntellisenseValues={allIntellisenseValues}
                loadingIntellisense={loadingIntellisense}
                onRefetchVariables={async () => {
                    await refetchVariables();
                }}
                editorContent={editorContent}
                intelligentSource={intelligentSource}
                handleEditorChange={handleEditorChange}
                intellisenseOptions={intellisenseOptions}
                trigger={trigger}
                databases={databases}
                databaseLoading={loadingDatabases}
                refetchDatabase={refetchDatabase}
            />
        </>
    );
};
