/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { Dispatch, forwardRef, SetStateAction, useImperativeHandle } from 'react';
import {
    Label,
    Button,
    RadioChips,
    OptionModel,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { useMessagePublisher } from '@/hooks/use-message-publisher';
import { IMessageBroker, IMessagePublisher } from '@/models';
import { MessageBrokerTriggerType } from '@/enums';
import {
    Control,
    Controller,
    UseFormClearErrors,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { MessageTopic } from '../message-broker/message-topic';
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';

export interface MessagePublisherRef {
    getMessagePublisherData: () => IMessagePublisher | undefined;
}

export interface MessagePublisherProps {
    isReadOnly?: boolean;
    messagePublisher: IMessagePublisher | undefined;
    messageBrokers: IMessageBroker[];
    agent?: AgentType;
    workflowId?: string;
    title: string;
    detailButtonLabel: string;
    viewLabel: string;
    setMessagePublisher: Dispatch<SetStateAction<IMessagePublisher | undefined>>;
    onMessagePublisherChange?: (publisher: IMessagePublisher | undefined) => void;
    description?: string;
}

interface MessageTopicFormBodyProps {
    isOpen: boolean;
    isReadOnly?: boolean;
    messageBrokers: IMessageBroker[];
    messagePublisher: IMessagePublisher | undefined;
    agent?: AgentType;
    inboundOptions: OptionModel[];
    outboundOptions: OptionModel[];
    control: Control<IMessagePublisher, any>;
    loadingIntellisense: boolean;
    intellisenseOptions: any;
    allIntellisenseValues: string[];
    setValue: UseFormSetValue<IMessagePublisher>;
    watch: UseFormWatch<IMessagePublisher>;
    trigger: UseFormTrigger<IMessagePublisher>;
    clearErrors: UseFormClearErrors<IMessagePublisher>;
    refetchVariables: () => Promise<void>;
}

const FormBody = (props: MessageTopicFormBodyProps) => {
    const {
        isOpen,
        inboundOptions,
        outboundOptions,
        control,
        isReadOnly,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        messageBrokers,
        messagePublisher,
        agent,
        setValue,
        clearErrors,
        watch,
        trigger,
        refetchVariables,
    } = props;

    // Outbound topic dropdown is enabled only when a broker is selected
    const selectedBrokerId = watch('topicProducer.messageBrokerId');
    const topicDropdownDisabled = !selectedBrokerId;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name="option"
                    control={control}
                    rules={{
                        required: {
                            value: true,
                            message: 'Please select an option',
                        },
                    }}
                    render={({ field }) => (
                        <RadioChips
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isReadOnly || agent?.isReusableAgentSelected}
                            options={[
                                {
                                    value: MessageBrokerTriggerType.API,
                                    label: MessageBrokerTriggerType.API,
                                    disabled: true,
                                },
                                {
                                    value: MessageBrokerTriggerType.MessageBroker,
                                    label: MessageBrokerTriggerType.MessageBroker,
                                },
                            ]}
                        />
                    )}
                />
            </div>
            <div className="col-span-1 sm:col-span-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                <MessageTopic
                    isOpen={isOpen}
                    inboundOptions={inboundOptions}
                    outboundOptions={outboundOptions}
                    isFeedbackPublisher={true}
                    propertyName="topicProducer"
                    messageBrokers={messageBrokers}
                    isReadOnly={isReadOnly}
                    control={control}
                    agent={agent}
                    loadingIntellisense={loadingIntellisense}
                    intellisenseOptions={intellisenseOptions}
                    allIntellisenseValues={allIntellisenseValues}
                    messagePublisher={messagePublisher}
                    setValue={setValue}
                    watch={watch}
                    trigger={trigger}
                    clearErrors={clearErrors}
                    refetchVariables={refetchVariables}
                    topicDropdownDisabled={topicDropdownDisabled}
                />
            </div>
        </div>
    );
};

export const MessagePublisher = forwardRef<MessagePublisherRef, MessagePublisherProps>((props, ref) => {
    const {
        messagePublisher,
        isReadOnly,
        title,
        detailButtonLabel,
        viewLabel,
        agent,
        setMessagePublisher,
        workflowId,
        onMessagePublisherChange,
        description,
        messageBrokers,
    } = props;

    // Use the existing hook instead of local state
    const {
        isOpen,
        isValid,
        inboundOptions,
        outboundOptions,
        control,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        setValue,
        setOpen,
        watch,
        trigger,
        clearErrors,
        getPublisherFromReusableAgent,
        handleRemove,
        handleSubmit,
        onHandleSubmit,
        refetchVariables,
    } = useMessagePublisher({
        messagePublisher,
        isReadOnly,
        title,
        detailButtonLabel,
        viewLabel,
        agent,
        setMessagePublisher,
        workflowId,
        onMessagePublisherChange,
        description,
        messageBrokers,
    });

    useImperativeHandle(ref, () => ({
        getMessagePublisherData: () => {
            return messagePublisher;
        },
    }));

    return (
        <>
            <DetailItemInput
                label={title}
                values={getPublisherFromReusableAgent()}
                imagePath="/png/knowledge_empty.png"
                imageType="png"
                description={
                    props.description ??
                    "No output broadcasting has been configured. Please use 'Add Output Broadcasting' to add one."
                }
                footer={
                    messagePublisher ? (
                        <div className="w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={() => setOpen(true)}>
                                {agent?.isReusableAgentSelected ? viewLabel : 'Change'}
                            </Button>
                            {!agent?.isReusableAgentSelected && (
                                <Button
                                    variant="link"
                                    className="text-red-500 hover:text-red-400"
                                    onClick={handleRemove}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {!messagePublisher && !agent?.isReusableAgentSelected && (
                                <Label
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                    onClick={() => setOpen(true)}
                                >
                                    {detailButtonLabel}
                                </Label>
                            )}
                        </>
                    )
                }
            />

            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpen}
                className="custom-drawer-content !w-[633px]"
                dismissible={false}
                header={title}
                footer={
                    <div className="flex gap-2 justify-end w-full">
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="primary"
                                        disabled={!isValid || agent?.isReusableAgentSelected || isReadOnly}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {messagePublisher ? 'Change' : 'Add'}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details needs to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <FormBody
                            {...props}
                            isOpen={isOpen}
                            inboundOptions={inboundOptions}
                            outboundOptions={outboundOptions}
                            control={control}
                            loadingIntellisense={loadingIntellisense}
                            intellisenseOptions={intellisenseOptions}
                            allIntellisenseValues={allIntellisenseValues}
                            setValue={setValue}
                            watch={watch}
                            trigger={trigger}
                            clearErrors={clearErrors}
                            refetchVariables={async () => {
                                await refetchVariables();
                            }}
                        />
                    </div>
                }
            />
        </>
    );
});

MessagePublisher.displayName = 'MessagePublisher';

export default MessagePublisher;
