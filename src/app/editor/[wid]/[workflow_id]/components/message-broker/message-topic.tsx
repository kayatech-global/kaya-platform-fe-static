/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode, useEffect, useMemo } from 'react';
import {
    Control,
    Controller,
    UseFormClearErrors,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { DynamicObjectItem, OptionModel, Select, Spinner } from '@/components';
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import { IMessageBroker, IMessagePublisher, INodeHumanInput, ISelfLearning } from '@/models';
import { MessageBrokerTopicType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { RequestStructure } from './request-structure';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';

interface MessageTopicProps {
    isOpen: boolean;
    isFeedbackPublisher: boolean;
    inboundOptions: OptionModel[];
    outboundOptions: OptionModel[];
    messageBrokers: IMessageBroker[];
    isReadOnly?: boolean;
    agent?: AgentType;
    loadingIntellisense: boolean;
    control: Control<any, any>;
    intellisenseOptions: any;
    allIntellisenseValues: string[];
    humanInput?: INodeHumanInput;
    selfLearning?: ISelfLearning;
    messagePublisher?: IMessagePublisher;
    structurePlaceholder?: string;
    helperInfo?: string;
    tooltip?: ReactNode;
    propertyName: string;
    topicDropdownDisabled?: boolean;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
    clearErrors: UseFormClearErrors<any>;
    refetchVariables: () => Promise<void>;
    onValuesChange?: (id: string) => void;
}

function getRequestStructureFromProducer(
    messageBrokerId: string,
    topicId: string,
    humanInput: INodeHumanInput | undefined,
    selfLearning: ISelfLearning | undefined,
    messagePublisher: IMessagePublisher | undefined
): string | null {
    const producer = humanInput?.topicProducer;
    if (humanInput && producer?.messageBrokerId === messageBrokerId && producer?.topicId === topicId) {
        return producer?.requestStructure ?? '';
    }
    const slProducer = selfLearning?.feedbackRequestIntegration?.messageBroker?.topicProducer;
    if (selfLearning && slProducer?.messageBrokerId === messageBrokerId && slProducer?.topicId === topicId) {
        return slProducer?.requestStructure ?? '';
    }
    const pubProducer = messagePublisher?.topicProducer;
    if (messagePublisher && pubProducer?.messageBrokerId === messageBrokerId && pubProducer?.topicId === topicId) {
        return pubProducer?.requestStructure ?? '';
    }
    return null;
}

function getRequestStructureFromConsumer(
    messageBrokerId: string,
    topicId: string,
    humanInput: INodeHumanInput | undefined,
    selfLearning: ISelfLearning | undefined
): string | null {
    const consumer = humanInput?.topicConsumer;
    if (humanInput && consumer?.messageBrokerId === messageBrokerId && consumer?.topicId === topicId) {
        return consumer?.requestStructure ?? '';
    }
    const slConsumer = selfLearning?.feedbackRequestIntegration?.messageBroker?.topicConsumer;
    if (selfLearning && slConsumer?.messageBrokerId === messageBrokerId && slConsumer?.topicId === topicId) {
        return slConsumer?.requestStructure ?? '';
    }
    return null;
}

function getRequestStructureFromSource(
    messageBrokerId: string,
    topicId: string,
    humanInput: INodeHumanInput | undefined,
    selfLearning: ISelfLearning | undefined,
    messagePublisher: IMessagePublisher | undefined,
    messageBrokers: IMessageBroker[],
    isFeedbackPublisher: boolean
): string {
    const fromSource = isFeedbackPublisher
        ? getRequestStructureFromProducer(messageBrokerId, topicId, humanInput, selfLearning, messagePublisher)
        : getRequestStructureFromConsumer(messageBrokerId, topicId, humanInput, selfLearning);
    if (fromSource !== null) return fromSource;

    const selectedBroker = messageBrokers?.find(x => x.id === messageBrokerId);
    const topic = selectedBroker?.configurations?.topics?.find(x => x.id === topicId);
    return topic?.requestStructure ?? '';
}

export const MessageTopic = ({
    isOpen,
    isFeedbackPublisher,
    inboundOptions,
    outboundOptions,
    messageBrokers,
    isReadOnly,
    agent,
    control,
    loadingIntellisense,
    intellisenseOptions,
    allIntellisenseValues,
    humanInput,
    selfLearning,
    messagePublisher,
    structurePlaceholder,
    helperInfo,
    tooltip,
    propertyName,
    topicDropdownDisabled,
    setValue,
    watch,
    trigger,
    clearErrors,
    refetchVariables,
    onValuesChange,
}: MessageTopicProps) => {
    useEffect(() => {
        const messageBrokerId = watch(`${propertyName}.messageBrokerId`);
        const topicId = watch(`${propertyName}.topicId`);
        if (!topicId || !messageBrokerId) {
            setValue(`${propertyName}.requestStructure`, '');
            return;
        }
        const structure = getRequestStructureFromSource(
            messageBrokerId,
            topicId,
            humanInput,
            selfLearning,
            messagePublisher,
            messageBrokers ?? [],
            isFeedbackPublisher
        );
        setValue(`${propertyName}.requestStructure`, structure);
        onValuesChange?.(topicId);
    }, [
        isFeedbackPublisher,
        propertyName,
        watch(`${propertyName}.messageBrokerId`),
        watch(`${propertyName}.topicId`),
        messageBrokers,
        humanInput,
        selfLearning,
        messagePublisher,
    ]);

    const topics = useMemo(() => {
        if (isFeedbackPublisher) {
            const broker = messageBrokers?.find(x => x.id === watch(`${propertyName}.messageBrokerId`));
            if (broker) {
                return (
                    broker?.configurations?.topics
                        ?.filter(x => x.topicType === MessageBrokerTopicType.Outbound)
                        ?.flatMap(topic => ({ name: topic.title, value: topic.id } as OptionModel)) || []
                );
            }
            return [];
        } else {
            const broker = messageBrokers?.find(x => x.id === watch(`${propertyName}.messageBrokerId`));
            if (broker) {
                return (
                    broker?.configurations?.topics
                        ?.filter(x => x.topicType === MessageBrokerTopicType.Inbound)
                        ?.flatMap(topic => ({ name: topic.title, value: topic.id } as OptionModel)) || []
                );
            }
            return [];
        }
    }, [
        isFeedbackPublisher,
        messageBrokers,
        propertyName,
        watch(`${propertyName}.messageBrokerId`),
        watch(`${propertyName}.messageBrokerId`),
    ]);

    const isValidEntry = useMemo(() => {
        return (
            !isNullOrEmpty(watch(`${propertyName}.messageBrokerId`)) && !isNullOrEmpty(watch(`${propertyName}.topicId`))
        );
    }, [
        isFeedbackPublisher,
        propertyName,
        watch(`${propertyName}.messageBrokerId`),
        watch(`${propertyName}.topicId`),
        watch(`${propertyName}.messageBrokerId`),
        watch(`${propertyName}.topicId`),
    ]);

    const onMessageBrokerChange = () => {
        setValue(`${propertyName}.topicId`, '');
        setTimeout(() => {
            clearErrors(`${propertyName}.requestStructure`);
        }, 0);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DynamicObjectItem label="Message Broker">
                        <Controller
                            name={`${propertyName}.messageBrokerId`}
                            control={control}
                            rules={{ required: 'Please select a message broker' }}
                            render={({ field, fieldState }) => (
                                <Select
                                    {...field}
                                    onChange={selectedOption => {
                                        field.onChange(selectedOption);
                                        onMessageBrokerChange();
                                    }}
                                    placeholder={(() => {
                                        const options = isFeedbackPublisher ? outboundOptions : inboundOptions;
                                        return options?.length > 0
                                            ? 'Select a message broker'
                                            : 'No Message Brokers have been configured';
                                    })()}
                                    className="!h-7 !py-1"
                                    currentValue={field.value}
                                    // Only disable if readonly or reusable agent
                                    disabled={isReadOnly || agent?.isReusableAgentSelected}
                                    options={isFeedbackPublisher ? outboundOptions : inboundOptions}
                                    isDestructive={!!fieldState.error?.message}
                                    supportiveText={fieldState.error?.message}
                                />
                            )}
                        />
                    </DynamicObjectItem>
                    <DynamicObjectItem label={isFeedbackPublisher ? 'Outbound Topic' : 'Inbound Topic'}>
                        <Controller
                            name={`${propertyName}.topicId`}
                            control={control}
                            rules={{
                                required: 'Please select a topic',
                            }}
                            render={({ field, fieldState }) => (
                                <Select
                                    {...field}
                                    onChange={selectedOption => {
                                        field.onChange(selectedOption);
                                    }}
                                    placeholder="Select a topic"
                                    className="!h-7 !py-1"
                                    currentValue={field.value}
                                    // Disable only if topicDropdownDisabled is true, or readonly/reusable agent
                                    disabled={isReadOnly || agent?.isReusableAgentSelected || topicDropdownDisabled}
                                    options={topics}
                                    isDestructive={!!fieldState.error?.message}
                                    supportiveText={fieldState.error?.message}
                                />
                            )}
                        />
                    </DynamicObjectItem>
                </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
                <DynamicObjectItem
                    label="Request Structure"
                    helperInfo={tooltip ?? MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.tooltip}
                    helperInfoWidthClass="max-w-[350px]"
                >
                    {loadingIntellisense ? (
                        <div className="w-full h-full flex items-center justify-center min-h-[250px]">
                            <div className="flex flex-col items-center gap-y-2">
                                <Spinner />
                                <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                    {'Hold on, Request structure editor is getting ready...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <RequestStructure
                            isOpen={isOpen}
                            control={control}
                            intellisenseOptions={intellisenseOptions}
                            allIntellisenseValues={allIntellisenseValues}
                            structurePlaceholder={structurePlaceholder}
                            helperInfo={helperInfo}
                            disabled={
                                isReadOnly || agent?.isReusableAgentSelected || !isValidEntry || topicDropdownDisabled
                            }
                            keyName={propertyName}
                            propertyName="requestStructure"
                            setValue={setValue}
                            watch={watch}
                            trigger={trigger}
                            refetchVariables={refetchVariables}
                        />
                    )}
                </DynamicObjectItem>
            </div>
        </div>
    );
};
