'use client';
import { Button } from '@/components';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { useMCPConfiguration } from '@/hooks/use-mcp-configuration';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import { McpConfigurationTableContainer } from './mcp-configuration-table-container';
import { McpConfigurationForm } from './mcp-configuration-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const McpConfigurationContainer = () => {
    const {
        isFetching,
        bottomRef,
        activityData,
        onMcpConfigurationFilter,
        setIsOpen,
        onEdit,
        onDelete,
        mcpConfigurationTableData,
        isOpen,
        errors,
        isValid,
        register,
        watch,
        setValue,
        control,
        handleSubmit,
        onHandleSubmit,
        refetch,
        secrets,
        loadingSecrets,
        isSaving,
        tools,
        getAllTool,
        toolLoading,
    } = useMCPConfiguration();
    const { isLg, isMobile } = useBreakpoint();

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setEdit(false);
        setIsOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setIsOpen(true);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <McpConfigurationTableContainer
                            mcpConfigurations={mcpConfigurationTableData}
                            onMcpConfigurationFilter={onMcpConfigurationFilter}
                            onNewButtonClick={handleCreate}
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
            <McpConfigurationForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isValid={isValid}
                isSaving={isSaving}
                setOpen={setIsOpen}
                register={register}
                watch={watch}
                setValue={setValue}
                control={control}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
                loadingSecrets={loadingSecrets}
                secrets={secrets}
                tools={tools}
                getAllTool={getAllTool}
                toolLoading={toolLoading}
                showTestConnectionScenarioToggle={true}
            />
        </>
    );
};
