'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { AgentTableContainer, DeploymentProgressDialog } from './agent-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import AgentForm from './agent-form';
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
    
    // Deployment progress dialog state - lifted here to survive table re-renders
    const [deploymentProgressOpen, setDeploymentProgressOpen] = useState(false);
    const [deployingAgentName, setDeployingAgentName] = useState('');
    const [isRedeployment, setIsRedeployment] = useState(false);
    
    const handleDeployWithProgress = (agentId: string, agentName: string, isRedeploy: boolean) => {
        setDeployingAgentName(agentName);
        setIsRedeployment(isRedeploy);
        setDeploymentProgressOpen(true);
        onPublish(agentId);
    };

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
                            onDeployWithProgress={handleDeployWithProgress}
                            isDeploying={isPublishing}
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
            <AgentForm
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
            />
            
            {/* Deployment Progress Dialog - Lifted to AgentContainer to survive data refetches */}
            <DeploymentProgressDialog
                open={deploymentProgressOpen}
                onOpenChange={setDeploymentProgressOpen}
                agentName={deployingAgentName}
                isRedeployment={isRedeployment}
            />
        </React.Fragment>
    );
};
