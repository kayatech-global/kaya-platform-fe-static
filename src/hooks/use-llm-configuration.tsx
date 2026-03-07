import { LlmConfigurationData } from '@/app/workspace/[wid]/intelligence-source-configs/llm-configurations/components/llm-configuration-table-container';
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { useApp } from '@/context/app-context';
import { ProviderType, QueryKeyType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { ILLMConfigForm, ILLMForm, IProvider, IProviderConfig, IHookProps } from '@/models';
import { FetchError, logger } from '@/utils';
import { Database, Link, TrendingDownIcon, TrendingUpIcon, Unplug } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { useLLMQuery, usePlatformQuery, useVaultQuery } from './use-common';
import { llmService } from '@/services';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Triggered',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Credits Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Unplug,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
    {
        title: 'Most credit consumed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Highest Tokens Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: TrendingDownIcon,
        showTrendIcon: true,
    },
    {
        title: 'Highest processing time',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Executed Most in Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Link,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Workflow Execution',
        description: 'Workflow Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Amber,
    },
    {
        title: 'API Execution',
        description: (
            <div>
                API Execution
                {' '}
                <span style={{ color: ActivityColorCode.Purple }}>AWS</span>
            </div>
        ),
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'LLM Execution',
        description: 'LLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export const useLlmConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const { intelligentSource, setIntelligentSource } = useApp();
    const [llmConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(
        initWorkspaceDataCardInfo
    );
    const [providers, setProviders] = useState<IProvider[]>([]);
    const queryClient = useQueryClient();
    const [llmConfigurationTableData, setLlmConfigurationTableData] = useState<ILLMConfigForm[]>([]);
    const [llmConfigurations, setLlmConfigurations] = useState<ILLMConfigForm[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                connectionName: '',
                customerHeaders: [],
                baseUrl: '',
                apiAuthorization: '',
                provider: '',
                maxTokens: undefined,
                modelName: '',
                temperature: undefined,
                isReadOnly: undefined,
                modelNameOption: undefined,
                description: '',
                accessKey: undefined,
                secretKey: undefined,
                region: '',
                useIamRole: false,
                timeout: null,
            });
        }
    }, [isOpen]);

    const { isFetching } = useLLMQuery({
        props,
        onSuccess: data => {
            mapAllLlms(data);
        },
        onError: () => {
            setLlmConfigurationTableData([]);
            setLlmConfigurations([]);
        },
    });

    usePlatformQuery({
        queryKey: 'providers',
        onSuccess: data => {
            setProviders(JSON.parse(data.llmProviders));
        },
        onError: () => {
            setProviders([]);
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

    const mapAllLlms = (arr: ILLMForm[]) => {
        const data = arr.map((x: ILLMForm) => ({
            id: x.id,
            connectionName: x.name,
            provider: x.provider,
            modelName: x.modelName,
            apiKeyReference: x.apiKeyReference,
            apiAuthorization: x.configurations?.apiAuthorization,
            maxTokens: x.configurations?.maxTokens,
            temperature: x.configurations?.temperature,
            baseUrl: x.configurations?.baseUrl,
            customerHeaders: x.configurations?.customerHeaders,
            isReadOnly: x?.isReadOnly,
            description: x.configurations?.description,
            accessKey: x.configurations?.accessKey,
            secretKey: x.configurations?.secretKey,
            region: x.configurations?.region,
            useIamRole: x.configurations?.useIamRole,
            timeout: x.configurations?.timeout ?? null,
        }));
        setLlmConfigurationTableData(data);
        setLlmConfigurations(data);
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
        control,
    } = useForm<ILLMConfigForm>({ mode: 'all' });

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: ILLMForm) => llmService.create<ILLMForm>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.LLM);
                setOpen(false);
                toast.success('LLM saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating LLM:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: ILLMForm; id: string }) => llmService.update<ILLMForm>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.LLM);
                setOpen(false);
                toast.success('LLM updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating LLM:', error?.message);
            },
        }
    );

    const { mutateAsync: mutateDeleteLlm } = useMutation(
        async ({ id }: { id: string }) => await llmService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.LLM);
                toast.success('LLM deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting LLM:', error?.message);
            },
        }
    );

    const onEdit = (id: string) => {
        if (id) {
            const obj = llmConfigurationTableData.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('connectionName', obj.connectionName);
                setValue('provider', obj.provider);
                setValue('modelName', obj.modelName);
                setValue('temperature', !isNullOrEmpty(obj.temperature) ? obj.temperature : null);
                setValue('maxTokens', !isNullOrEmpty(obj.maxTokens) ? obj.maxTokens : null);
                setValue('apiAuthorization', obj.apiAuthorization);
                setValue('baseUrl', obj.baseUrl);
                setValue('customerHeaders', obj.customerHeaders);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('description', obj?.description);
                setValue('accessKey', obj?.accessKey);
                setValue('secretKey', obj?.secretKey);
                setValue('region', obj?.region);
                setValue('timeout', obj?.timeout);
                const useIamRole = isNullOrEmpty(obj?.accessKey) && isNullOrEmpty(obj?.secretKey);
                setValue('useIamRole', useIamRole);
                const originalProvider = providers?.find(x => x.value === obj.provider);
                if (originalProvider) {
                    const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
                    if (originalModel) {
                        setValue('modelNameOption', { label: originalModel.value, value: originalModel.value });
                    } else {
                        setValue('modelNameOption', { label: obj.modelName, value: obj.modelName });
                    }
                }
            }
        }
    };

    const onHandleSubmit = (data: ILLMConfigForm) => {
        try {
            const mapProviderConfig = () => {
                const _provider = providers?.find(x => x.value === data?.provider);
                const _model = _provider?.models.find(x => x.value === data?.modelNameOption?.value);

                return {
                    id: _provider?.id ?? '',
                    value: _provider?.value ?? '',
                    logo: _provider?.logo ?? {},
                    description: _model?.description ?? '',
                } as IProviderConfig;
            };

            const providerConfig = mapProviderConfig();
            const isBedrock = data.provider === ProviderType.Bedrock;

            // Helper function to build configurations object, excluding empty/null/undefined values
            const buildConfigurations = (): Partial<ILLMForm['configurations']> => {
                const configs: Partial<ILLMForm['configurations']> = {
                    providerConfig,
                };

                if (!isNullOrEmpty(data.description)) {
                    configs.description = data.description;
                }
                if (!isNullOrEmpty(data.apiAuthorization)) {
                    configs.apiAuthorization = data.apiAuthorization;
                }
                if (!isNullOrEmpty(data.maxTokens)) {
                    configs.maxTokens = data.maxTokens;
                }

                if (!isNullOrEmpty(data.temperature)) {
                    configs.temperature = data.temperature;
                }

                if (!isNullOrEmpty(data.baseUrl)) {
                    configs.baseUrl = data.baseUrl;
                }
                if (data.customerHeaders && data.customerHeaders.length > 0) {
                    configs.customerHeaders = data.customerHeaders;
                }
                if (isBedrock) {
                    if (!isNullOrEmpty(data.region)) {
                        configs.region = data.region;
                    }
                    // Include useIamRole flag
                    configs.useIamRole = data.useIamRole || false;
                    // Only include accessKey and secretKey if NOT using IAM role
                    if (!data.useIamRole) {
                        if (!isNullOrEmpty(data.accessKey)) {
                            configs.accessKey = data.accessKey;
                        }
                        if (!isNullOrEmpty(data.secretKey)) {
                            configs.secretKey = data.secretKey;
                        }
                    }
                    // If using IAM role, accessKey and secretKey are intentionally excluded

                    configs.apiAuthorization = undefined;
                }
                if (data.timeout) {
                    configs.timeout = data.timeout;
                }

                return configs;
            };

            const body: ILLMForm = {
                name: data.connectionName,
                provider: data.provider,
                modelName: data?.modelNameOption?.value as string,
                apiKeyReference: '',
                configurations: buildConfigurations() as ILLMForm['configurations'],
            };

            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your LLM");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onLlmConfigurationFilter = (filter: LlmConfigurationData | null) => {
        let result = llmConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x.connectionName.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.connectionName)) {
            result = result.filter(x => x.connectionName.toLowerCase() === filter?.connectionName.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.provider)) {
            result = result.filter(x => x.provider.toLowerCase() === filter?.provider.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.modelName)) {
            result = result.filter(x => x.modelName.toLowerCase() === filter?.modelName.toLowerCase());
        }

        setLlmConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteLlm({ id }).then(() => {
                if (intelligentSource?.id === id && !intelligentSource?.isSLM) {
                    setIntelligentSource(prev => (prev ? { ...prev, isDeleted: true } : prev));
                }
            });
        }
    };

    return {
        llmConfigurationDataCardInfo,
        llmConfigurationTableData,
        activityData,
        isFetching,
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: creating || updating,
        loadingSecrets,
        control,
        bottomRef: ref,
        onLlmConfigurationFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        refetch,
    };
};
