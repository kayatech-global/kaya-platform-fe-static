'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { Button, LoadingPlaceholder, RadioChips } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { AgentType, ScheduleTriggerForm } from '@/components/organisms';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { MessageBrokerFormBody } from '@/app/workspace/[wid]/configure-connections/setup-message-broker/components/message-broker-form-body';
import { useMessageBroker } from '@/hooks/use-message-broker';
import { MessageBrokerSelectorType, MessageBrokerTopicType, MessageBrokerTriggerType } from '@/enums';
import { IConnectorForm, IMessageBroker, IScheduleTrigger, ISharedItem, IWorkflowTrigger } from '@/models';
import { Unplug } from 'lucide-react';
import { ApiToolResponseType } from '@/app/workspace/[wid]/agents/components/agent-form';
import { ScheduleTriggerSelector } from '@/components/organisms/schedule-trigger/components/schedule-trigger-selector';
import { useScheduleTrigger } from '@/hooks/use-schedule-trigger';
import { MessageBrokerTab, TopicSelectorFooter } from './message-broker/topic-selector';
import { useMessageBrokerTopicSelector } from '@/hooks/use-message-broker-topic-selector';

export interface MessageBrokerTopicSelectorProps {
    agent?: AgentType;
    label?: string;
    workflowTrigger: IWorkflowTrigger | undefined;
    messageBrokers: IMessageBroker[];
    description: string;
    detailLabel: string;
    detailButtonLabel: string;
    topicType?: MessageBrokerTopicType;
    messageBrokerLoading?: boolean;
    isReadonly?: boolean;
    saveButtonLabel?: string;
    imagePath?: string;
    type?: MessageBrokerSelectorType;
    workflowVariables: ISharedItem[];
    sharedVariables: ISharedItem[];
    apiLoading: boolean;
    loadingConnectors: boolean;
    loadingIntellisense: boolean;
    scheduleTriggerLoading: boolean;
    scheduleTriggers: IScheduleTrigger[];
    allApiTools: ApiToolResponseType[];
    connectors: IConnectorForm[];
    setWorkflowTrigger: Dispatch<SetStateAction<IWorkflowTrigger | undefined>>;
    refetchApiTools: () => void;
    refetchConnector: () => void;
    refetchIntellisense: () => Promise<void>;
    onRefetch: () => void;
    onRefetchScheduler?: () => Promise<void>;
    onTopicChange?: (trigger: IWorkflowTrigger | undefined) => void;
    onManage?: () => void;
}

export const MessageBrokerTopicSelector = (props: MessageBrokerTopicSelectorProps) => {
    const {
        agent,
        workflowTrigger,
        topicType,
        description,
        detailLabel,
        detailButtonLabel,
        messageBrokerLoading,
        isReadonly,
        saveButtonLabel,
        imagePath = '/png/knowledge_empty.png',
        workflowVariables,
        sharedVariables,
        apiLoading,
        allApiTools,
        loadingConnectors,
        loadingIntellisense: intellisenseLoading,
        scheduleTriggerLoading,
        scheduleTriggers,
        connectors,
        refetchApiTools,
        refetchConnector,
        onRefetch,
        onRefetchScheduler,
        onManage,
    } = props;

    const {
        isOpen,
        isEdit,
        errors,
        isSaving,
        isValid,
        control,
        secrets,
        loadingSecrets,
        isTopicsTitleValid,
        loadingIntellisense,
        allIntellisenseValues,
        intellisenseOptions,
        messageBrokerProviders,
        topicFields,
        selectedTopicId,
        setSelectedTopicId,
        register,
        setValue,
        watch,
        trigger,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        setEdit,
        appendTopic,
        removeTopic,
        validateUniqueTitle,
        handleCreate,
        refetch,
        refetchVariables,
    } = useMessageBroker({ triggerQuery: false, onRefetch, onManage });

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setOpen(false);
            setOpenScheduleTrigger(false);
        } else if (cancel && openScheduleTrigger) {
            setOpenScheduleTrigger(false);
        } else if (openScheduleTrigger) {
            setOpenScheduleTrigger(false);
        } else if (cancel) {
            setOpenModal(false);
            setSelectedTopicId(undefined);
            setOpenScheduleTrigger(false);
        } else {
            setOpenModal(open);
        }
    };

    const scheduleTriggerHook = useScheduleTrigger({
        sharedVariables,
        scheduleTriggers,
        onModalClose,
        onRefetch: onRefetchScheduler,
        onManage,
    });

    const {
        openScheduleTrigger,
        isValid: isValidScheduler,
        isSaving: isSavingScheduler,
        isEdit: isEditScheduler,
        isReadOnly: isReadOnlyScheduler,
        activeStep,
        scheduler,
        loading,
        setLoading,
        setScheduler,
        setActiveStep,
        setOpenScheduleTrigger,
        handleSubmit: triggerHandleSubmit,
        onEdit: triggerOnEdit,
        onDelete: triggerOnDelete,
        onHandleSubmit: triggerOnHandleSubmit,
    } = scheduleTriggerHook;

    const {
        scheduleTriggerRef,
        options,
        transformData,
        isValidEntry,
        triggerTypeOptions,
        modalTitle,
        openModal,
        currentTriggerType,
        broker,
        activeTab,
        selectedMessageBroker,
        setBroker,
        setSelectedMessageBroker,
        setActiveTab,
        setCurrentTriggerType,
        setOpenModal,
        getMessageBrokerTrigger,
        handleClick,
        handleChange,
        handleRemove,
        onEdit,
        onRefetchVariables,
        onDeleteScheduler,
    } = useMessageBrokerTopicSelector({
        ...props,
        isOpen,
        isEdit,
        isEditScheduler,
        scheduler,
        openScheduleTrigger,
        setScheduler,
        setSelectedTopicId,
        setOpenScheduleTrigger,
        setActiveStep,
        setOpen,
        setEdit,
        setLoading,
        setValue,
        refetchVariables,
        triggerOnDelete,
    });

    return (
        <>
            <DetailItemInput
                label={detailLabel}
                imagePath={imagePath}
                imageType="png"
                imageWidth="100"
                description={description}
                footer={
                    workflowTrigger && !agent?.isReusableAgentSelected && !isReadonly ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button
                                variant="link"
                                className="text-red-500 hover:text-red-400"
                                disabled={isReadonly}
                                onClick={handleRemove}
                            >
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!workflowTrigger && !agent && !isReadonly && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {detailButtonLabel || 'Add a Message Broker'}
                                </Button>
                            )}
                        </>
                    )
                }
                values={getMessageBrokerTrigger()}
            />

            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                {(isOpen || openScheduleTrigger) && <Unplug />}
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{modalTitle}</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[400px] overflow-hidden">
                            {/* RadioChips for trigger types - like LLM, SLM in intelligence source */}
                            {!isOpen && !openScheduleTrigger && (
                                <div className="flex justify-between items-center flex-shrink-0">
                                    <RadioChips
                                        value={currentTriggerType}
                                        onValueChange={e => setCurrentTriggerType(e as never)}
                                        options={triggerTypeOptions}
                                    />
                                    {currentTriggerType === MessageBrokerTriggerType.MessageBroker && (
                                        <Button variant="link" disabled={isReadonly} onClick={handleCreate}>
                                            New Message Broker
                                        </Button>
                                    )}
                                    {currentTriggerType === MessageBrokerTriggerType.Recurring && (
                                        <Button
                                            variant="link"
                                            disabled={isReadonly}
                                            onClick={() => setOpenScheduleTrigger(true)}
                                        >
                                            New Schedule Trigger
                                        </Button>
                                    )}
                                </div>
                            )}

                            {isOpen || openScheduleTrigger ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 px-2">
                                    {isOpen ? (
                                        <MessageBrokerFormBody
                                            isOpen={isOpen}
                                            isEdit={isEdit}
                                            errors={errors}
                                            isSaving={isSaving}
                                            isValid={isValid}
                                            control={control}
                                            secrets={secrets}
                                            loadingSecrets={loadingSecrets}
                                            isTopicsTitleValid={isTopicsTitleValid}
                                            loadingIntellisense={loadingIntellisense}
                                            allIntellisenseValues={allIntellisenseValues}
                                            intellisenseOptions={intellisenseOptions}
                                            messageBrokerProviders={messageBrokerProviders}
                                            topicFields={topicFields}
                                            selectedTopicId={selectedTopicId}
                                            isModalRequest={true}
                                            setOpen={setOpen}
                                            register={register}
                                            setValue={setValue}
                                            watch={watch}
                                            trigger={trigger}
                                            appendTopic={appendTopic}
                                            removeTopic={removeTopic}
                                            validateUniqueTitle={validateUniqueTitle}
                                            handleSubmit={handleSubmit}
                                            onHandleSubmit={onHandleSubmit}
                                            refetch={refetch}
                                            refetchVariables={onRefetchVariables}
                                        />
                                    ) : (
                                        <ScheduleTriggerForm
                                            {...scheduleTriggerHook}
                                            isOpen={openScheduleTrigger}
                                            activeStep={activeStep}
                                            workflowVariables={workflowVariables}
                                            sharedVariables={sharedVariables}
                                            allApiTools={allApiTools}
                                            apiLoading={apiLoading}
                                            loadingIntellisense={intellisenseLoading}
                                            loadingConnectors={loadingConnectors}
                                            connectors={connectors}
                                            refetchApiTools={refetchApiTools}
                                            refetchConnector={refetchConnector}
                                            refetchIntellisense={onRefetchVariables}
                                        />
                                    )}
                                </div>
                            ) : (
                                <>
                                    {messageBrokerLoading || scheduleTriggerLoading ? (
                                        <LoadingPlaceholder text="Please wait! loading the trigger data for you..." />
                                    ) : (
                                        <>
                                            {/* Message Broker Content */}
                                            {currentTriggerType === MessageBrokerTriggerType.MessageBroker && (
                                                <MessageBrokerTab
                                                    messageBrokerProviders={messageBrokerProviders}
                                                    options={options}
                                                    broker={broker}
                                                    workflowTrigger={workflowTrigger}
                                                    transformData={transformData}
                                                    topicType={topicType}
                                                    selectedMessageBroker={selectedMessageBroker}
                                                    activeTab={activeTab}
                                                    setActiveTab={setActiveTab}
                                                    setBroker={setBroker}
                                                    setSelectedMessageBroker={setSelectedMessageBroker}
                                                    onEdit={onEdit}
                                                />
                                            )}

                                            {/* Recurring Content */}
                                            {currentTriggerType === MessageBrokerTriggerType.Recurring && (
                                                <ScheduleTriggerSelector
                                                    ref={scheduleTriggerRef}
                                                    isOpen={true}
                                                    scheduleTriggerLoading={scheduleTriggerLoading || loading}
                                                    scheduleTriggers={scheduleTriggers}
                                                    scheduler={scheduler}
                                                    setScheduler={setScheduler}
                                                    onEdit={triggerOnEdit}
                                                    onDelete={onDeleteScheduler}
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <TopicSelectorFooter
                            isOpen={isOpen}
                            isEdit={isEdit}
                            isValid={isValid}
                            isSaving={isSaving}
                            isValidEntry={isValidEntry}
                            openScheduleTrigger={openScheduleTrigger}
                            activeStep={activeStep}
                            isSavingScheduler={isSavingScheduler}
                            isValidScheduler={isValidScheduler}
                            isEditScheduler={isEditScheduler}
                            isReadOnlyScheduler={isReadOnlyScheduler}
                            saveButtonLabel={saveButtonLabel}
                            setActiveStep={setActiveStep}
                            handleClick={handleClick}
                            handleSubmit={handleSubmit}
                            triggerHandleSubmit={triggerHandleSubmit}
                            onHandleSubmit={onHandleSubmit}
                            triggerOnHandleSubmit={triggerOnHandleSubmit}
                            onModalClose={onModalClose}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
