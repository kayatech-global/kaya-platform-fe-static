/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScheduleTriggerSelectorRef } from '@/components/organisms/schedule-trigger/components/schedule-trigger-selector';
import {
    MessageBrokerProviderType,
    MessageBrokerSelectorType,
    MessageBrokerTriggerType,
    ScheduleTriggerStepType,
} from '@/enums';
import { MessageBrokerTopicSelectorProps } from '@/app/editor/[wid]/[workflow_id]/components/message-broker-topic-selector';
import { IMessageBroker, IOption, IWorkflowTrigger } from '@/models';
import { valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { UseFormSetValue } from 'react-hook-form';

interface MessageBrokerTopicSelectorHookProps extends MessageBrokerTopicSelectorProps {
    isOpen: boolean;
    isEdit: boolean;
    isEditScheduler: boolean;
    scheduler: string | undefined;
    openScheduleTrigger: boolean;
    setScheduler: React.Dispatch<React.SetStateAction<string | undefined>>;
    setSelectedTopicId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setOpenScheduleTrigger: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveStep: React.Dispatch<React.SetStateAction<ScheduleTriggerStepType>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setValue: UseFormSetValue<IMessageBroker>;
    refetchVariables: (options?: any) => Promise<any>;
    triggerOnDelete: (id: string) => Promise<void>;
}

export const useMessageBrokerTopicSelector = (props: MessageBrokerTopicSelectorHookProps) => {
    const scheduleTriggerRef = useRef<ScheduleTriggerSelectorRef>(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedMessageBroker, setSelectedMessageBroker] = useState<string>();
    const [currentTriggerType, setCurrentTriggerType] = useState<MessageBrokerTriggerType>(
        MessageBrokerTriggerType.MessageBroker
    );
    const [activeTab, setActiveTab] = useState<string>(MessageBrokerProviderType.AWS_MSK_Provisioned);
    const [broker, setBroker] = useState<string>();

    const triggerTypeOptions: IOption[] = [
        { label: MessageBrokerTriggerType.MessageBroker, value: MessageBrokerTriggerType.MessageBroker },
        { label: 'Recurring', value: MessageBrokerTriggerType.Recurring },
    ];

    const {
        agent,
        label,
        workflowTrigger,
        messageBrokers,
        topicType,
        type,
        scheduleTriggers,
        isOpen,
        isEdit,
        isEditScheduler,
        openScheduleTrigger,
        scheduler,
        setLoading,
        setOpen,
        setEdit,
        setActiveStep,
        setOpenScheduleTrigger,
        setSelectedTopicId,
        setScheduler,
        setWorkflowTrigger,
        setValue,
        refetchIntellisense,
        onRefetchScheduler,
        onTopicChange,
        triggerOnDelete,
        refetchVariables,
    } = props;

    const options = useMemo(() => {
        if (currentTriggerType === MessageBrokerTriggerType.MessageBroker) {
            if (activeTab) {
                return messageBrokers.filter(mq => mq.provider === activeTab);
            }
            return messageBrokers;
        }
        return [];
    }, [messageBrokers, currentTriggerType, activeTab]);

    const transformData = useMemo(() => {
        if (broker) {
            if (topicType) {
                return options
                    .filter(o => o.id === broker)
                    .flatMap(x => x.configurations?.topics?.filter(t => t.topicType === topicType) || []);
            }
            return options.filter(o => o.id === broker).flatMap(x => x.configurations?.topics ?? []);
        }
        return [];
    }, [options, broker, topicType]);

    const isValidEntry = useMemo(() => {
        if (currentTriggerType === MessageBrokerTriggerType.Recurring) {
            return !!scheduler;
        }
        return !!selectedMessageBroker;
    }, [currentTriggerType, selectedMessageBroker, scheduler]);

    const modalTitle = useMemo(() => {
        if (isOpen) {
            return `${isEdit ? 'Edit' : 'New'} Message Broker`;
        } else if (openScheduleTrigger) {
            return `${isEditScheduler ? 'Edit' : 'New'} Schedule Trigger`;
        }
        return label ?? 'Message Broker';
    }, [isOpen, isEdit, openScheduleTrigger, isEditScheduler, label]);

    // Fetch message brokers when modal opens
    useEffect(() => {
        if (openModal && workflowTrigger) {
            setCurrentTriggerType(workflowTrigger.type);
            setSelectedMessageBroker(workflowTrigger?.messageBroker?.topicId);
            setBroker(workflowTrigger?.messageBroker?.id);
            setScheduler(workflowTrigger?.recurring);
        } else if (openModal && !workflowTrigger) {
            setScheduler(undefined);
        } else {
            setActiveTab(MessageBrokerProviderType.AWS_MSK_Provisioned);
            setCurrentTriggerType(MessageBrokerTriggerType.MessageBroker);
            setSelectedMessageBroker(undefined);
            setBroker(undefined);
            setSelectedTopicId(undefined);
            setOpenScheduleTrigger(false);
            setActiveStep(ScheduleTriggerStepType.BASIC);
            setScheduler(undefined);
        }
    }, [openModal, workflowTrigger, setSelectedTopicId]);

    useEffect(() => {
        if (!messageBrokers || messageBrokers.length === 0) {
            setActiveTab(MessageBrokerProviderType.AWS_MSK_Provisioned);
        }

        if (workflowTrigger) {
            const selectedModel = messageBrokers.find(
                m =>
                    m.id === workflowTrigger?.messageBroker?.id &&
                    m.configurations.topics.some(topic => topic.id === workflowTrigger?.messageBroker?.topicId)
            );
            if (selectedModel) {
                setActiveTab(selectedModel.provider);
            }
        } else {
            setActiveTab(MessageBrokerProviderType.AWS_MSK_Provisioned);
        }
    }, [workflowTrigger, messageBrokers, openModal]);

    useEffect(() => {
        if (workflowTrigger && options?.length > 0) {
            const result = options?.find(x => x.id === workflowTrigger?.messageBroker?.id);
            if (!result) {
                const data = options?.find(x => x.id === broker);
                setBroker(data?.id ?? '');
            } else {
                const data = options?.find(x => x.id === broker);
                setBroker(data ? broker : result.id);
            }
        } else if (!workflowTrigger) {
            const data = options?.find(x => x.id === broker);
            setBroker(data ? broker : '');
        }
    }, [workflowTrigger, broker, options, activeTab]);

    useEffect(() => {
        if (!openScheduleTrigger) {
            setActiveStep(ScheduleTriggerStepType.BASIC);
        }
    }, [openScheduleTrigger]);

    useEffect(() => {
        if (workflowTrigger?.type === MessageBrokerTriggerType.Recurring && scheduleTriggers?.length > 0) {
            const hasRecord = scheduleTriggers?.find(x => x.id === workflowTrigger?.recurring);
            if (!hasRecord) {
                setWorkflowTrigger(undefined);
            }
        }
    }, [workflowTrigger, scheduleTriggers, setWorkflowTrigger]);

    const handleClick = useCallback(() => {
        let result: IWorkflowTrigger | undefined;

        if (currentTriggerType === MessageBrokerTriggerType.Recurring) {
            result = {
                recurring: scheduler,
                type: currentTriggerType,
            } as IWorkflowTrigger | undefined;
        } else {
            const validate = messageBrokers.some(
                mq =>
                    mq.id === broker &&
                    mq.provider === activeTab &&
                    mq.configurations.topics.some(topic => topic.id === selectedMessageBroker)
            );

            result = {
                messageBroker: {
                    id: broker as string,
                    topicId: selectedMessageBroker as string,
                },
                type: currentTriggerType,
            } as IWorkflowTrigger | undefined;

            if (!validate) {
                result = workflowTrigger;
            }
        }
        setWorkflowTrigger(result);
        setOpenModal(false);
        onTopicChange?.(result);
    }, [
        broker,
        activeTab,
        currentTriggerType,
        messageBrokers,
        scheduler,
        selectedMessageBroker,
        workflowTrigger,
        onTopicChange,
        setWorkflowTrigger,
    ]);

    const onEdit = useCallback(
        (id: string, topicId: string) => {
            if (id) {
                const obj = messageBrokers.find(x => x.id === id);
                if (obj) {
                    setSelectedTopicId(topicId);
                    setValue('id', obj?.id);
                    setValue('name', obj?.name);
                    setValue('description', obj?.description);
                    setValue('provider', obj?.provider);
                    setValue('isReadOnly', obj?.isReadOnly);
                    setValue('configurations', obj?.configurations);
                    setValue('configurations.topics', obj?.configurations?.topics);
                    setEdit(true);
                    setOpen(true);
                }
            }
        },
        [messageBrokers, setEdit, setOpen, setSelectedTopicId, setValue]
    );

    const handleChange = useCallback(() => {
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && workflowTrigger) {
            setSelectedMessageBroker(workflowTrigger?.messageBroker?.topicId);
        }
    }, [agent, workflowTrigger]);

    const handleRemove = useCallback(() => {
        setWorkflowTrigger(undefined);
        setActiveTab(MessageBrokerProviderType.AWS_MSK_Provisioned);
        setSelectedMessageBroker(undefined);
        setBroker(undefined);
        setCurrentTriggerType(MessageBrokerTriggerType.MessageBroker);
        if (onTopicChange) {
            onTopicChange(undefined);
        }
    }, [onTopicChange, setWorkflowTrigger]);

    const getMessageBrokerTrigger = () => {
        if (!agent && !workflowTrigger && !messageBrokers) {
            return undefined; // Return undefined if both agent and prompt are missing
        }

        const value: valuesProps[] = []; // Initialize as an empty array

        if (
            agent &&
            'isReusableAgentSelected' in agent &&
            agent?.isReusableAgentSelected &&
            type === MessageBrokerSelectorType.OutputBroadcasting
        ) {
            const outputBroadcasting = agent?.publisherIntegration?.topicProducer;
            if (outputBroadcasting && messageBrokers?.length > 0) {
                const data = messageBrokers?.find(o => o.id === outputBroadcasting.messageBrokerId);
                const topic = data?.configurations?.topics?.find(t => t.id === outputBroadcasting.topicId);
                if (data && topic) {
                    const fullTitle = `${data.name}: ${topic.title}`;
                    value.push({
                        title: fullTitle.length > 40 ? fullTitle.slice(0, 37) + '...' : fullTitle,
                        description:
                            data.description && data.description.length > 65
                                ? data.description.slice(0, 62) + '...'
                                : data.description,
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
            } else if (messageBrokers?.length === 0) {
                value.push({
                    title: 'N/A',
                    description: 'N/A',
                    imagePath: '/png/Message-queue.png',
                });
            }
        } else if (workflowTrigger) {
            const data = messageBrokers?.find(o => o.id === workflowTrigger?.messageBroker?.id);
            const topic = data?.configurations?.topics?.find(t => t.id === workflowTrigger?.messageBroker?.topicId);
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
            } else if (workflowTrigger?.type === MessageBrokerTriggerType.Recurring) {
                const results = scheduleTriggers?.find(x => x.id === workflowTrigger?.recurring);
                if (results) {
                    value.push({
                        title:
                            results.name && results.name.length > 30 ? results.name.slice(0, 27) + '...' : results.name,
                        titleTooltip: results.name,
                        description:
                            results.description && results.description.length > 30
                                ? results.description.slice(0, 27) + '...'
                                : results.description,
                        descriptionTooltip: results.description,
                        info: <p className="flex items-center text-sm font-regular text-green-500">Recurring</p>,
                        imagePath: '/png/calendar_image.png',
                    });
                }
            }
        }

        return value.length > 0 ? value : undefined;
    };

    const onRefetchVariables = useCallback(async () => {
        await refetchVariables();
        await refetchIntellisense();
    }, [refetchVariables, refetchIntellisense]);

    const onDeleteScheduler = useCallback(
        async (id: string) => {
            if (id) {
                setLoading(true);
                await triggerOnDelete(id);
                await onRefetchScheduler?.();
                if (scheduler === id) {
                    setScheduler(undefined);
                }
                if (workflowTrigger?.type === MessageBrokerTriggerType.Recurring && workflowTrigger?.recurring === id) {
                    setWorkflowTrigger(undefined);
                }
                setLoading(false);
            }
        },
        [scheduler, workflowTrigger, setLoading, triggerOnDelete, onRefetchScheduler, setScheduler, setWorkflowTrigger]
    );

    return {
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
    };
};
