import { MessagePublisherProps } from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import { OptionModel } from '@/components/atoms/select';
import { valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { MessageBrokerProviderType, MessageBrokerTopicType, MessageBrokerTriggerType } from '@/enums';
import { IMessagePublisher } from '@/models';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntellisense } from './use-common';

export const useMessagePublisher = (props: MessagePublisherProps) => {
    const { messagePublisher, messageBrokers, workflowId, setMessagePublisher, onMessagePublisherChange } = props;
    const [isOpen, setOpen] = useState<boolean>(false);

    const { loadingIntellisense, allIntellisenseValues, intellisenseOptions, refetchVariables } =
        useIntellisense(workflowId);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        trigger,
        clearErrors,
        formState: { errors, isValid },
        control,
    } = useForm<IMessagePublisher>({
        mode: 'all',
        defaultValues: {
            option: MessageBrokerTriggerType.MessageBroker,
            topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
        },
    });

    useEffect(() => {
        if (messagePublisher && isOpen) {
            reset({
                option: messagePublisher?.option || MessageBrokerTriggerType.MessageBroker,
                topicProducer: messagePublisher?.topicProducer || {
                    messageBrokerId: '',
                    topicId: '',
                    requestStructure: '',
                },
            });
        } else {
            reset({
                option: MessageBrokerTriggerType.MessageBroker,
                topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
            });
        }
    }, [isOpen, messagePublisher]);

    const inboundOptions = useMemo(() => {
        if (watch('option') === MessageBrokerTriggerType.MessageBroker && messageBrokers?.length > 0) {
            return messageBrokers
                ?.filter(
                    broker =>
                        Array.isArray(broker?.configurations?.topics) &&
                        broker?.configurations?.topics?.some(
                            topic => topic.topicType === MessageBrokerTopicType.Inbound
                        )
                )
                ?.map(m => ({ name: m.name, value: m.id } as OptionModel));
        }
        return [];
    }, [messageBrokers, watch('option')]);

    const outboundOptions = useMemo(() => {
        if (watch('option') === MessageBrokerTriggerType.MessageBroker && messageBrokers?.length > 0) {
            return messageBrokers
                ?.filter(
                    broker =>
                        Array.isArray(broker?.configurations?.topics) &&
                        broker?.configurations?.topics?.some(
                            topic => topic.topicType === MessageBrokerTopicType.Outbound
                        )
                )
                ?.map(m => ({ name: m.name, value: m.id } as OptionModel));
        }
        return [];
    }, [messageBrokers, watch('option')]);

    const getPublisherFromReusableAgent = () => {
        if (!messagePublisher) {
            return undefined; // Return undefined if both agent and prompt are missing
        }

        const value: valuesProps[] = []; // Initialize as an empty array

        if (messagePublisher?.topicProducer) {
            const data = messageBrokers?.find(o => o.id === messagePublisher.topicProducer?.messageBrokerId);
            const topic = data?.configurations?.topics?.find(t => t.id === messagePublisher.topicProducer?.topicId);
            if (data && topic) {
                const fullTitle = `${data.name}: ${topic.title}`;
                value.push({
                    title: fullTitle && fullTitle.length > 30 ? fullTitle.slice(0, 27) + '...' : fullTitle,
                    titleTooltip: fullTitle,
                    description:
                        data.description && data.description.length > 30
                            ? data.description.slice(0, 27) + '...'
                            : data.description,
                    descriptionTooltip: data.description,
                    info: (
                        <p className="flex items-center text-sm font-regular text-green-500">
                            {data?.provider === MessageBrokerProviderType.ApacheKafka
                                ? 'Kafka Apache'
                                : 'AWS MSK Provisioned'}
                        </p>
                    ),
                    imagePath: '/png/Message-queue.png',
                });
            }
        }

        return value.length > 0 ? value : undefined;
    };

    const handleRemove = () => {
        reset({
            option: MessageBrokerTriggerType.MessageBroker,
            topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
        });
        setMessagePublisher(undefined);
        if (onMessagePublisherChange) {
            onMessagePublisherChange(undefined);
        }
    };

    const onHandleSubmit = (data: IMessagePublisher) => {
        setMessagePublisher(data);
        if (onMessagePublisherChange) {
            onMessagePublisherChange(data);
        }
        setOpen(false);
    };

    return {
        isOpen,
        isValid,
        control,
        errors,
        inboundOptions,
        outboundOptions,
        loadingIntellisense,
        allIntellisenseValues,
        intellisenseOptions,
        setOpen,
        register,
        reset,
        setValue,
        watch,
        trigger,
        clearErrors,
        getPublisherFromReusableAgent,
        handleRemove,
        handleSubmit,
        onHandleSubmit,
        refetchVariables,
    };
};
