'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { AgentTableContainer } from './agent-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { AgentWizardForm } from './agent-wizard';
import { useAgent } from '@/hooks/use-agent';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const AgentContainer = () => {
    const {
        activityData,
        agentConfigurationTableData,
        isSaving,
        isValid,
        errors,
        isOpen,
        isFetching,
        allPrompts,
        allModels,
        allApiTools,
        allExecutableFunctionTools,
        allSLMModels,
        allMcpTools,
        allGraphRag,
        allConnectors,
        allVectorRags,
        isLoadingResources,
        promptsLoading,
        llmModelsLoading,
        apiLoading,
        slmModelsLoading,
        mcpLoading,
        control,
        connectorsLoading,
        messageBrokers,
        guardrailData,
        guardrailLoading,
        trigger,
        bottomRef,
        setValue,
        getValues,
        onAgentFilter,
        register,
        handleSubmit,
        onHandleSubmit,
        onDelete,
        setOpen,
        onEdit,
        watch,
        reset,
        refetchPrompts,
        refetchLlms,
        refetchApiTools,
        refetchExecutableFunctions,
        refetchSLM,
        refetchMcp,
        refetchConnectors,
        onRefetchGraphRag,
        onRefetchVectorRag,
        onRefetchMessageBroker,
        refetchGuardrails,
        isPublishing,
        onPublish,
    } = useAgent();
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
                        <AgentTableContainer
                            agents={agentConfigurationTableData}
                            onAgentFilter={onAgentFilter}
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
            <AgentWizardForm
                allPrompts={allPrompts}
                allModels={allModels}
                allApiTools={allApiTools}
                allExecutableFunctions={allExecutableFunctionTools}
                allSLMModels={allSLMModels}
                allMcpTools={allMcpTools}
                allConnectors={allConnectors ?? []}
                messageBrokers={messageBrokers}
                isLoadingResources={isLoadingResources}
                isOpen={isOpen}
                control={control}
                allGraphRag={allGraphRag}
                setOpen={setOpen}
                register={register}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                isEdit={isEdit}
                watch={watch}
                trigger={trigger}
                errors={errors}
                isSaving={isSaving}
                isValid={isValid}
                promptsLoading={promptsLoading}
                llmModelsLoading={llmModelsLoading}
                connectorsLoading={connectorsLoading}
                apiLoading={apiLoading}
                slmModelsLoading={slmModelsLoading}
                mcpLoading={mcpLoading}
                allVectorRags={allVectorRags}
                guardrailData={guardrailData}
                guardrailLoading={guardrailLoading}
                setValue={setValue}
                getValues={getValues}
                reset={reset}
                onRefetchPrompts={refetchPrompts}
                onRefetchLlms={refetchLlms}
                onRefetchApiTools={refetchApiTools}
                onRefetchSLMModel={refetchSLM}
                onRefetchMcp={refetchMcp}
                onRefetchConnector={refetchConnectors}
                refetchGraphRag={onRefetchGraphRag}
                refetchVectorRag={onRefetchVectorRag}
                refetchMessageBroker={onRefetchMessageBroker}
                refetchGuardrails={refetchGuardrails}
                onRefetchExecutableFunctions={refetchExecutableFunctions}
                isPublishing={isPublishing}
                onPublish={onPublish}
            />
        </React.Fragment>
    );
};
