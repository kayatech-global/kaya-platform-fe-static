/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { IHookProps, IMessageBroker, IMessageBrokerConfiguration, IMessageBrokerConfigurationMeta } from '@/models';
import { FetchError, logger } from '@/utils';
import { toast } from 'sonner';
import { isNullOrEmpty, validateJsonStructure } from '@/lib/utils';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { OptionModel } from '@/components';
import { AuthenticationType, MessageBrokerProviderType, MessageBrokerTopicType, QueryKeyType } from '@/enums';
import { v4 as uuidv4 } from 'uuid';
import { useIntellisense, useMessageBrokerQuery, usePlatformQuery, useVaultQuery } from './use-common';


export const useMessageBroker = (props?: IHookProps) => {
    const queryClient = useQueryClient();
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [messageBrokerProviders, setMessageBrokerProviders] = useState<OptionModel[]>([]);
    const [messageBrokerTableData, setMessageBrokerTableData] = useState<IMessageBroker[]>([]);
    const [messageBrokers, setMessageBrokers] = useState<IMessageBroker[]>([]);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<string>();

    const { loadingIntellisense, allIntellisenseValues, intellisenseOptions, refetchVariables } = useIntellisense();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        trigger,
        getValues,
        clearErrors,
        formState: { errors, isValid },
        control,
    } = useForm<IMessageBroker>({
        mode: 'all',
        defaultValues: {
            configurations: {
                meta: {
                    username: '',
                    password: '',
                    token: '',
                    certificate: '',
                    clientKey: '',
                },
                topics: [{ id: uuidv4(), title: '', topicType: MessageBrokerTopicType.Inbound, requestStructure: '' }],
            },
        },
    });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                provider: '',
                configurations: {
                    authenticationType: AuthenticationType.Empty,
                    clusterUrl: '',
                    meta: {
                        username: '',
                        password: '',
                        token: '',
                        certificate: '',
                        clientKey: '',
                    },
                    topics: [
                        { id: uuidv4(), title: '', topicType: MessageBrokerTopicType.Inbound, requestStructure: '' },
                    ],
                },
                isReadOnly: undefined,
                search: undefined,
            });
        }
    }, [isOpen, reset]);

    useEffect(() => {
        const provider = watch('provider');
        const id = watch('id');
        clearErrors('configurations.clusterUrl');
        if (isEdit) {
            const obj = messageBrokers.find(x => x.id === id);
            if (obj && provider === obj.provider) {
                setValue('configurations.authenticationType', obj?.configurations?.authenticationType);
            } else {
                setValue('configurations.authenticationType', AuthenticationType.Empty);
            }
        } else {
            setValue('configurations.authenticationType', AuthenticationType.Empty);
        }
    }, [isEdit, clearErrors, messageBrokers, setValue, watch]);

    const { isFetching } = useMessageBrokerQuery({
        props,
        onSuccess: data => {
            setMessageBrokerTableData(data);
            setMessageBrokers(data);
        },
        onError: () => {
            setMessageBrokerTableData([]);
            setMessageBrokers([]);
        },
    });

    const { isFetching: fetchingProviders } = usePlatformQuery({
        queryKey: 'providers',
        onSuccess: data => {
            const arr = JSON.parse(data.messageQueueProviders);
            if (arr && arr?.length > 0) {
                setMessageBrokerProviders(
                    arr.map((x: any) => ({
                        name: x.value === 'Kafka Apache' ? 'Apache Kafka' : x.value,
                        value: x.id,
                    }))
                );
            } else {
                setMessageBrokerProviders([]);
            }
        },
        onError: () => {
            setMessageBrokerProviders([]);
        },
    });

    const { refetch, isLoading: loadingSecrets } = useVaultQuery({
        onSuccess: data => {
            const mapData = data?.map(x => ({
                name: x.keyName as string,
                value: x.keyName as string,
            }));
            setSecrets([...mapData]);
        },
        onError: () => {
            setSecrets([]);
        },
    });

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        async (data: IMessageBroker) => {
            const stored = localStorage.getItem('mock_message_broker_data');
            const configs = stored ? JSON.parse(stored) : [];
            const newConfig = { ...data, id: `mb-${Date.now()}` };
            configs.push(newConfig);
            localStorage.setItem('mock_message_broker_data', JSON.stringify(configs));
            return newConfig;
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.MESSAGE_BROKER);
                setOpen(false);
                toast.success('Message broker saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating message broker:', error?.message);
            },
        }
    );

    const { isLoading: updating, mutate: mutateUpdate } = useMutation(
        async ({ data, id }: { data: IMessageBroker; id: string }) => {
            const stored = localStorage.getItem('mock_message_broker_data');
            const configs = stored ? JSON.parse(stored) : [];
            const index = configs.findIndex((x: any) => x.id === id);
            if (index > -1) {
                configs[index] = { ...configs[index], ...data, id };
                localStorage.setItem('mock_message_broker_data', JSON.stringify(configs));
            }
            return { data: configs[index], id };
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                props?.onManage?.();
                queryClient.invalidateQueries(QueryKeyType.MESSAGE_BROKER);
                setOpen(false);
                setSelectedTopicId(undefined);
                toast.success('Message broker updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating message broker:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_message_broker_data');
            const configs = stored ? JSON.parse(stored) : [];
            const filtered = configs.filter((x: any) => x.id !== id);
            localStorage.setItem('mock_message_broker_data', JSON.stringify(filtered));
            return { id };
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.MESSAGE_BROKER);
                toast.success('Message broker deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting message broker:', error?.message);
            },
        }
    );

    const validateUniqueTitle = (value: string, currentIndex: number) => {
        const topics = getValues('configurations.topics') ?? [];

        if (value.startsWith(' ')) {
            return 'No leading spaces in topic name';
        }
        if (value.endsWith(' ')) {
            return 'No trailing spaces in topic name';
        }

        const kafkaTopicRegex = /^[a-zA-Z0-9._-]{1,249}$/;

        if (!kafkaTopicRegex.test(value)) {
            return 'Invalid topic name format';
        }

        const duplicate = topics.some((topic, index) => {
            return index !== currentIndex && topic.title.trim() === value.trim();
        });

        return duplicate ? 'Title must be unique' : true;
    };

    const {
        fields: topicFields,
        append,
        remove: removeTopic,
    } = useFieldArray({
        name: 'configurations.topics',
        keyName: 'internalId',
        control,
    });

    const topics = useWatch({
        control,
        name: 'configurations.topics',
    });

    const isTopicsTitleValid = useMemo(() => {
        if (!Array.isArray(topics) || topics.length === 0) return false;

        const hasInvalid = topics.some(x => {
            const titleEmpty = isNullOrEmpty(x.title);
            const structureEmpty = isNullOrEmpty(x.requestStructure);
            const structureInvalid = validateJsonStructure(x.requestStructure) !== true;

            return titleEmpty || structureEmpty || structureInvalid;
        });

        if (hasInvalid) return false;

        const seen = new Set<string>();

        for (const topic of topics) {
            const title = topic?.title?.trim();
            if (!title) return false;
            if (seen.has(title)) return false;
            seen.add(title);
        }

        return true;
    }, [topics]);

    const appendTopic = () => {
        append({
            id: uuidv4(),
            title: '',
            topicType: MessageBrokerTopicType.Inbound,
            requestStructure: '',
        });
    };

    const processedMeta = (configs: IMessageBrokerConfiguration, data: IMessageBroker) => {
        const type = configs.authenticationType;
        const meta = configs.meta;

        if (type === AuthenticationType.BasicAuth) {
            return {
                username: meta?.username,
                password: meta?.password,
            } as IMessageBrokerConfigurationMeta;
        } else if (type === AuthenticationType.SASLORSCRAM) {
            return {
                username: meta?.username,
                secret: meta?.secret,
            } as IMessageBrokerConfigurationMeta;
        } else if (type === AuthenticationType.BearerToken) {
            return {
                token: meta?.token,
            } as IMessageBrokerConfigurationMeta;
        } else if (type === AuthenticationType.Kerberose) {
            return {
                secret: meta?.secret,
            } as IMessageBrokerConfigurationMeta;
        } else if (
            data?.provider === MessageBrokerProviderType.AWS_MSK_Provisioned &&
            type === AuthenticationType.TLS
        ) {
            return {
                certificate: meta?.certificate,
                clientKey: meta?.clientKey,
            } as IMessageBrokerConfigurationMeta;
        } else {
            return undefined;
        }
    };

    const onHandleSubmit = (data: IMessageBroker) => {
        const body: IMessageBroker = {
            ...data,
            id: undefined,
            configurations: {
                ...data.configurations,
                meta: processedMeta(data.configurations, data),
            },
        };
        if (data.id) {
            mutateUpdate({ data: body, id: data.id });
        } else {
            mutateCreate(body);
        }
    };

    const onMessageBrokerFilter = (filter: IMessageBroker | null) => {
        let result = messageBrokers;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x?.name?.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }

        setMessageBrokerTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = messageBrokers.find(x => x.id === id);
            if (obj) {
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
    };

    return {
        isFetching: isFetching || fetchingProviders,
        messageBrokerTableData,
        messageBrokerProviders,
        loadingSecrets,
        loadingIntellisense,
        secrets,
        intellisenseOptions,
        allIntellisenseValues,
        isTopicsTitleValid,
        isSaving: creating || updating,
        isOpen,
        isEdit,
        control,
        errors,
        isValid,
        topicFields,
        selectedTopicId,
        setSelectedTopicId,
        register,
        reset,
        setValue,
        watch,
        trigger,
        setOpen,
        setEdit,
        appendTopic,
        removeTopic,
        validateUniqueTitle,
        handleCreate,
        handleSubmit,
        onHandleSubmit,
        onMessageBrokerFilter,
        onDelete,
        onEdit,
        refetch,
        refetchVariables,
    };
};
