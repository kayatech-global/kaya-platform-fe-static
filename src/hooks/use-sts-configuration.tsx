import { StsConfigurationData } from '@/app/workspace/[wid]/intelligence-source-configs/sts-configurations/components/sts-configuration-table-container';
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { ProviderType, QueryKeyType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { ISTSConfigForm, ISTSForm, IProvider, IProviderConfig, IHookProps, STSModelConfigurations } from '@/models';
import { FetchError, logger } from '@/utils';
import { Database, Link, TrendingDownIcon, TrendingUpIcon, Unplug } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { usePlatformQuery, useSTSQuery, useVaultQuery } from './use-common';
import { stsService } from '@/services';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Used',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Frequently Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Unplug,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
    {
        title: 'Highest latency',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Highest Response Time Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: TrendingDownIcon,
        showTrendIcon: true,
    },
    {
        title: 'Most active region',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Most Requests Handled Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Link,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
];

const activityData: ActivityProps[] = [
    {
        title: 'Token Generation',
        description: 'STS Token Generated',
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
        title: 'Credential Rotation',
        description: 'Credentials Rotated',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export const useStsConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const [stsConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(
        initWorkspaceDataCardInfo
    );
    const [providers, setProviders] = useState<IProvider[]>([]);
    const queryClient = useQueryClient();
    const [stsConfigurationTableData, setStsConfigurationTableData] = useState<ISTSConfigForm[]>([]);
    const [stsConfigurations, setStsConfigurations] = useState<ISTSConfigForm[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                provider: '',
                modelName: '',
                description: '',
                secretKey: undefined,
                tone: undefined,
                voice: undefined,
                temperature: 0.7,
                language: undefined,
                region: undefined,
                authType: undefined,
                awsAccessKey: undefined,
                awsSecretKey: undefined,
            });
        }
    }, [isOpen]);

    const { isFetching } = useSTSQuery({
        props,
        onSuccess: data => {
            mapAllSts(data);
        },
        onError: () => {
            setStsConfigurationTableData([]);
            setStsConfigurations([]);
        },
    });

    usePlatformQuery({
        queryKey: 'providers',
        onSuccess: data => {
            setProviders(JSON.parse(data.speechToSpeechModelProviders));
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

    const mapAllSts = (arr: ISTSForm[]) => {
        const data = arr.map((x: ISTSForm) => ({
            id: x.id,
            name: x.name,
            provider: x.provider,
            modelName: x.modelName,
            description: x.description,
            secretKey: x.configurations?.secretKey,
            tone: x.configurations?.tone,
            voice: x.configurations?.voice,
            temperature: x.configurations?.temperature,
            language: x.configurations?.language,
            isReadOnly: x?.isReadOnly,
            region: x.configurations?.region,
            authType: x.configurations?.authType,
            awsAccessKey: x.configurations?.accessKey,
            awsSecretKey: x.configurations?.secretKey,
        }));
        setStsConfigurationTableData(data);
        setStsConfigurations(data);
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
        control,
    } = useForm<ISTSConfigForm>({ mode: 'all' });

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: ISTSForm) => stsService.create<ISTSForm>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.STS);
                setOpen(false);
                toast.success('STS configuration saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating STS configuration:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: ISTSForm; id: string }) => stsService.update<ISTSForm>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.STS);
                setOpen(false);
                toast.success('STS configuration updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating STS configuration:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteSts } = useMutation(
        async ({ id }: { id: string }) => await stsService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.STS);
                toast.success('STS configuration deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting STS configuration:', error?.message);
            },
        }
    );

    const onEdit = (id: string) => {
        if (id) {
            const obj = stsConfigurationTableData.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('provider', obj.provider);
                setValue('modelName', obj.modelName);
                setValue('description', obj?.description);
                setValue('secretKey', obj?.secretKey);
                setValue('tone', obj?.tone);
                setValue('voice', obj?.voice);
                setValue('temperature', obj?.temperature);
                setValue('language', obj?.language);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('region', obj?.region);
                setValue('authType', obj?.authType);
                setValue('awsAccessKey', obj?.awsAccessKey);
                setValue('awsSecretKey', obj?.awsSecretKey);
                setValue(
                    'modelNameOption',
                    obj.modelName
                        ? {
                              label: obj.modelName,
                              value: obj.modelName,
                          }
                        : undefined
                );

                setValue(
                    'voiceOption',
                    obj.voice
                        ? {
                              label: obj.voice,
                              value: obj.voice,
                          }
                        : undefined
                );

                setValue(
                    'languageOption',
                    obj.language
                        ? {
                              label: obj.language,
                              value: obj.language,
                          }
                        : undefined
                );
            }
        }
    };

    const onHandleSubmit = (data: ISTSConfigForm) => {
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
            const isOpenAI = data.provider === ProviderType.OpenAI;
            const isAmazon = data.provider === ProviderType.AWS;

            const configurations: STSModelConfigurations = {
                tone: data.tone as string,
                voice: data?.voiceOption?.value as string,
                language: data?.languageOption?.value as string,
                providerConfig,
            };

            if (isOpenAI) {
                configurations.secretKey = data.secretKey;
                configurations.temperature = data.temperature as number;
            }

            if (isAmazon) {
                configurations.region = data.region;
                configurations.authType = data.authType;

                if (data.authType === 'key-access') {
                    configurations.accessKey = data.awsAccessKey;
                    configurations.secretKey = data.awsSecretKey;
                }
            }

            if (data.id) {
                const body: ISTSForm = {
                    name: data.name,
                    provider: data.provider,
                    modelName: data?.modelNameOption?.value as string,
                    description: data.description,
                    configurations,
                };
                mutateUpdate({ data: body, id: data.id });
            } else {
                const body: ISTSForm = {
                    name: data.name,
                    provider: data.provider,
                    modelName: data?.modelNameOption?.value as string,
                    description: data.description,
                    configurations,
                };
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your STS configuration");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onStsConfigurationFilter = (filter: StsConfigurationData | null) => {
        let result = stsConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.name)) {
            result = result.filter(x => x.name.toLowerCase() === filter?.name.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.provider)) {
            result = result.filter(x => x.provider.toLowerCase() === filter?.provider.toLowerCase());
        }

        setStsConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteSts({ id });
        }
    };

    return {
        stsConfigurationDataCardInfo,
        stsConfigurationTableData,
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
        onStsConfigurationFilter,
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
