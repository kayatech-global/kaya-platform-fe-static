import { SlmConfigurationData } from '@/app/workspace/[wid]/intelligence-source-configs/slm-configurations/components/slm-configuration-table-container';
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { ProviderType, QueryKeyType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { IProvider, IProviderConfig, ISLMForm, IHookProps } from '@/models';
import { FetchError, logger } from '@/utils';
import { Database, Link, TrendingDownIcon, TrendingUpIcon, Unplug } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { usePlatformQuery, useSLMQuery, useVaultQuery } from './use-common';
import { slmService } from '@/services';

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
                API Execution <span style={{ color: ActivityColorCode.Purple }}>AWS</span>
            </div>
        ),
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'SLM Execution',
        description: 'SLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export const useSlmConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const [slmConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const queryClient = useQueryClient();
    const [slmConfigurationTableData, setSlmConfigurationTableData] = useState<SlmConfigurationData[]>([]);
    const [providers, setProviders] = useState<IProvider[]>([]);
    const [slmConfigurations, setSlmConfigurations] = useState<ISLMForm[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                modelName: '',
                provider: '',
                configurations: {
                    description: '',
                    providerConfig: undefined,
                    apiAuthorization: '',
                    temperature: undefined,
                    baseUrl: '',
                    accessKey: undefined,
                    secretKey: undefined,
                    region: undefined,
                    customRuntime: false,
                    tokenLimit: undefined,
                },
                isReadOnly: undefined,
                modelNameOption: undefined,
            });
        }
    }, [isOpen]);

    const { isFetching } = useSLMQuery({
        props,
        onSuccess: data => {
            mapAllSlms(data);
        },
        onError: () => {
            setSlmConfigurationTableData([]);
            setSlmConfigurations([]);
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

    usePlatformQuery({
        queryKey: 'slmProviders',
        onSuccess: data => {
            setProviders(JSON.parse(data.slmProviders));
        },
        onError: () => {
            setProviders([]);
        },
    });

    const mapAllSlms = (arr: ISLMForm[]) => {
        setSlmConfigurationTableData(arr);
        setSlmConfigurations(arr);
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
        control,
    } = useForm<ISLMForm>({ mode: 'all' });

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: ISLMForm) => slmService.create<ISLMForm>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.SLM);
                setOpen(false);
                toast.success('SLM saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating SLM:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: ISLMForm; id: string }) => slmService.update<ISLMForm>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.SLM);
                setOpen(false);
                toast.success('SLM updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating SLM:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteSlm } = useMutation(
        async ({ id }: { id: string }) => await slmService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.SLM);
                toast.success('SLM deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting SLM:', error?.message);
            },
        }
    );

    const onEdit = (id: string) => {
        if (!id) return;
        const obj = slmConfigurationTableData.find(x => x.id === id);
        if (!obj) return;

        const { configurations, name, provider, modelName, isReadOnly } = obj;

        setValue('id', obj.id);
        setValue('name', name);
        setValue('provider', provider);
        setValue('modelName', modelName);
        setValue('isReadOnly', isReadOnly);

        // Simplify configuration settings
        setValue(
            'configurations.temperature',
            Number.isNaN(configurations?.temperature as number) ? null : (configurations?.temperature ?? null)
        );
        setValue('configurations.baseUrl', configurations?.baseUrl ?? '');
        setValue('configurations.apiAuthorization', configurations?.apiAuthorization ?? '');
        setValue('configurations.providerConfig', configurations?.providerConfig as IProviderConfig);
        setValue('configurations.customRuntime', !!configurations?.customRuntime);
        setValue('configurations.description', configurations?.description ?? '');
        setValue('configurations.accessKey', configurations?.accessKey);
        setValue('configurations.secretKey', configurations?.secretKey);
        setValue('configurations.region', configurations?.region);
        setValue(
            'configurations.tokenLimit',
            Number.isNaN(configurations?.tokenLimit as number) ? null : (configurations?.tokenLimit ?? null)
        );

        // Map model name option
        const originalProvider = providers?.find(x => x.value === provider);
        if (originalProvider) {
            const originalModel = originalProvider.models?.find(x => x.value === modelName);
            const modelLabel = originalModel ? originalModel.value : modelName;
            setValue('modelNameOption', { label: modelLabel, value: modelLabel });
        }
    };

    const onHandleSubmit = (data: ISLMForm) => {
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

            const body: ISLMForm = {
                name: data.name,
                modelName: data?.modelNameOption?.value as string,
                provider: data.provider,
                configurations: {
                    description: data?.configurations?.description,
                    customRuntime: data.configurations?.customRuntime,
                    apiAuthorization: data.configurations?.apiAuthorization,
                    temperature: data.configurations?.temperature,
                    baseUrl: data.configurations?.baseUrl,
                    providerConfig,
                    accessKey: isBedrock ? data.configurations?.accessKey : undefined,
                    secretKey: isBedrock ? data.configurations?.secretKey : undefined,
                    region: isBedrock ? data.configurations?.region : undefined,
                    tokenLimit: data.configurations?.tokenLimit,
                },
            };

            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your SLM");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onSlmConfigurationFilter = (filter: SlmConfigurationData | null) => {
        let result = slmConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.provider)) {
            result = result.filter(x => x.provider.toLowerCase() === filter?.provider.toLowerCase());
        }

        setSlmConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteSlm({ id });
        }
    };

    return {
        slmConfigurationDataCardInfo,
        slmConfigurationTableData,
        activityData,
        providers,
        isFetching,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: creating || updating,
        loadingSecrets,
        control,
        bottomRef: ref,
        onSlmConfigurationFilter,
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
