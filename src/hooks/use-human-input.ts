/* eslint-disable @typescript-eslint/no-explicit-any */
import { HumanInputProps } from '@/app/editor/[wid]/[workflow_id]/components/human-input';
import { OptionModel } from '@/components/atoms/select';
import { MessageBrokerTopicType, MessageBrokerTriggerType } from '@/enums';
import { isNullOrEmpty } from '@/lib/utils';
import { INodeHumanInput } from '@/models';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useIntellisense } from './use-common';

export const useHumanInput = (props: HumanInputProps) => {
    const { humanInput, messageBrokers, workflowId, setHumanInput, onHumanInputChange } = props;
    const [isOpen, setOpen] = useState<boolean>(false);
    const [enableConsumer, setEnableConsumer] = useState<boolean>(false);

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
    } = useForm<INodeHumanInput>({
        mode: 'all',
        defaultValues: {
            option: MessageBrokerTriggerType.MessageBroker,
            topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
            topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
        },
    });

    useEffect(() => {
        if (humanInput && isOpen) {
            reset({
                enableHumanInput: humanInput?.enableHumanInput,
                instruction: humanInput?.instruction,
                enableBroker: humanInput?.enableBroker,
                option: humanInput?.option || MessageBrokerTriggerType.MessageBroker,
                topicProducer: humanInput?.topicProducer || { messageBrokerId: '', topicId: '', requestStructure: '' },
                topicConsumer: humanInput?.topicConsumer || { messageBrokerId: '', topicId: '', requestStructure: '' },
            });
            if (humanInput?.topicConsumer && !isNullOrEmpty(humanInput?.topicConsumer?.topicId)) {
                setEnableConsumer(true);
            } else {
                setEnableConsumer(false);
            }
        } else {
            reset({
                enableHumanInput: false,
                instruction: '',
                enableBroker: false,
                option: MessageBrokerTriggerType.MessageBroker,
                topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
                topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
            });
            if (humanInput?.topicConsumer && !isNullOrEmpty(humanInput?.topicConsumer?.topicId)) {
                setEnableConsumer(true);
            } else {
                setEnableConsumer(false);
            }
        }
    }, [isOpen, humanInput]);

    useEffect(() => {
        if (isOpen && !enableConsumer) {
            trigger('topicConsumer.messageBrokerId');
        }
    }, [enableConsumer, isOpen]);

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

    const handleRemove = () => {
        reset({
            enableHumanInput: false,
            instruction: '',
            enableBroker: false,
            option: MessageBrokerTriggerType.MessageBroker,
            topicProducer: { messageBrokerId: '', topicId: '', requestStructure: '' },
            topicConsumer: { messageBrokerId: '', topicId: '', requestStructure: '' },
        });
        setHumanInput(undefined);
        if (onHumanInputChange) {
            onHumanInputChange(undefined);
        }
    };

    const onHandleSubmit = (data: INodeHumanInput) => {
        const result = {
            ...data,
            option: data?.enableBroker ? data?.option : undefined,
            topicProducer: data?.enableBroker ? data?.topicProducer : undefined,
            topicConsumer: data?.enableBroker && enableConsumer ? data?.topicConsumer : undefined,
        } as INodeHumanInput;
        setHumanInput(result);
        if (onHumanInputChange) {
            onHumanInputChange(result);
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
        enableConsumer,
        setEnableConsumer,
        setOpen,
        register,
        reset,
        setValue,
        watch,
        trigger,
        clearErrors,
        handleRemove,
        handleSubmit,
        onHandleSubmit,
        refetchVariables,
    };
};
