'use client'
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFieldArray, useForm } from 'react-hook-form';
import { IGuardrailConfigForm, IAuthorization, IHookProps, ToolGuardrailAPI } from '@/models';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';
import { GuardrailsApiConfigurationData } from '@/app/workspace/[wid]/guardrails/guardrails-api-configurations/components/guardrails-api-configuration-table-container';
import { $fetch, FetchError, logger } from '@/utils';
import { isNullOrEmpty, resolveTriggerQuery } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthorizationType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { useVaultQuery } from './use-common';

export enum HeaderType {
    ApiHeader,
    Payloads,
    PromotedVariables,
}

export interface PayloadOutput {
    [key: string]: {
        description: string;
        type: string;
    };
}

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
        title: 'Guardrails API Execution',
        description: (
            <div>
                Guardrails API Execution
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

const retrieveAllGuardrailsApiConfigurationsForWorkspace = async (workspaceId: number | string) => {
    const response = await $fetch<ToolGuardrailAPI[]>(`/workspaces/${workspaceId}/tools/guardrails-api`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId.toString(),
        },
    });

    return response.data;
};

const createGuardrailsRecord = async (data: ToolGuardrailAPI, workspaceId: number | string) => {
    const response = await $fetch<ToolGuardrailAPI>(`/workspaces/${workspaceId}/tools/guardrails-api`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'x-workspace-id': workspaceId.toString(),
        },
    });
    return response.data;
};

const updateGuardrailsRecord = async (data: ToolGuardrailAPI, workspaceId: number | string, id: string) => {
    const response = await $fetch<ToolGuardrailAPI>(
        `/workspaces/${workspaceId}/tools/guardrails-api/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'x-workspace-id': workspaceId.toString(),
            },
        },
        {
            denyRedirectOnForbidden: true,
        }
    );
    return response.data;
};

const deleteGuardrailsRecord = async (workspaceId: number | string, id: string) => {
    const response = await $fetch(
        `/workspaces/${workspaceId}/tools/guardrails-api/${id}`,
        {
            method: 'DELETE',
            headers: {
                'x-workspace-id': workspaceId.toString(),
            },
        },
        {
            denyRedirectOnForbidden: true,
        }
    );
    return response.data;
};

export const useGuardrailsApiConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(false);
    const [guardrailsApiConfigurationDataCardInfo] = useState<
        DashboardDataCardProps[]
    >(initWorkspaceDataCardInfo);
    const [guardrailsApiConfigurationTableData, setGuardrailsApiConfigurationTableData] = useState<
        GuardrailsApiConfigurationData[]
    >([]);
    const [guardrailsApiConfigurations, setGuardrailsApiConfigurations] = useState<GuardrailsApiConfigurationData[]>(
        []
    );
    const [isOpen, setOpen] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                apiHeaders: [],
                apiMethod: '',
                guardrailType: '',
                apiName: '',
                payloadFormat: '',
                description: '',
                payloads: [{ name: '', dataType: 'string', value: '' }],
                authorization: {
                    authType: AuthorizationType.Empty,
                    meta: { headerName: '', headerValue: '', password: '', token: '', username: '' },
                },
                isReadOnly: undefined,
                promotedVariables: [{ name: '', dataType: 'string', value: '' }],
            });
        }
    }, [isOpen]);

    const { isFetching } = useQuery(
        'guardrails-apis',
        () => retrieveAllGuardrailsApiConfigurationsForWorkspace(params.wid as string),
        {
            enabled: !!token && resolveTriggerQuery(props?.triggerQuery),
            refetchOnWindowFocus: false,
            onSuccess: data => {
                mapAllGuardrailsApis(data);
            },
            onError: () => {
                setGuardrailsApiConfigurationTableData([]);
                setGuardrailsApiConfigurations([]);
            },
        }
    );

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

    const mapAllGuardrailsApis = (arr: ToolGuardrailAPI[]) => {
        const data = arr.map((x: ToolGuardrailAPI) => ({
            id: x.id as string,
            apiHeaders: x.configurations.headers,
            apiMethod: x.configurations.method,
            guardrailType: x.configurations.guardrailType,
            guardrailApiProvider: x.configurations.guardrailApiProvider,
            apiName: x.name,
            apiUrl: x.configurations.url,
            payloadFormat: x?.configurations?.payload,
            description: x.description,
            payloadOutput: x?.configurations?.payload,
            authorization: x?.configurations?.authorization,
            isReadOnly: x?.isReadOnly,
            promotedVariables: x?.configurations?.promotedVariables ?? '{}',
        }));
        setGuardrailsApiConfigurationTableData(data);
        setGuardrailsApiConfigurations(data);
    };

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<IGuardrailConfigForm>({
        mode: 'all',
        defaultValues: {
            payloads: [{ name: '', dataType: 'string', value: '' }],
            promotedVariables: [{ name: '', dataType: 'string', value: '' }],
        },
    });

    const {
        fields: apiHeaders,
        append: appendApiHeader,
        remove: removeApiHeader,
    } = useFieldArray({
        name: 'apiHeaders',
        control,
    });

    const {
        fields: payloads,
        append: appendPayloads,
        remove: removePayloads,
        update: updatePayload,
    } = useFieldArray({
        name: 'payloads',
        control,
    });

    const {
        fields: promotedVariables,
        append: appendPromotedVariables,
        remove: removePromotedVariables,
        update: updatePromotedVariables,
    } = useFieldArray({
        name: 'promotedVariables',
        control,
    });

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const updatePayloadDataType = () => {
        payloads.forEach((_, index) => {
            updatePayload(index, { ...payloads[index], dataType: 'string' });
        });
    };

    const updatePromotedVariablesDataType = () => {
        promotedVariables.forEach((_, index) => {
            updatePromotedVariables(index, { ...promotedVariables[index], dataType: 'string' });
        });
    };

    const { isLoading: createIsLoading, mutate: mutateCreate } = useMutation(
        (data: ToolGuardrailAPI) => createGuardrailsRecord(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries('guardrails-apis');
                setLoading(false);
                setOpen(false);
                toast.success('Guardrails API saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Guardrails API:', error?.message);
            },
        }
    );

    const { isLoading: updateIsLoading, mutate: mutateUpdate } = useMutation(
        ({ data, id }: { data: ToolGuardrailAPI; id: string }) =>
            updateGuardrailsRecord(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries('guardrails-apis');
                setLoading(false);
                setOpen(false);
                toast.success('Guardrails API updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Guardrails API:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteGuardrailsApi } = useMutation(
        async ({ id }: { id: string }) => await deleteGuardrailsRecord(params.wid as string, id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('guardrails-apis');
                toast.success('Guardrails API deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Guardrails API:', error?.message);
            },
        }
    );

    const onEdit = (id: string) => {
        if (id) {
            const obj = guardrailsApiConfigurationTableData.find(x => x.id === id);
            if (obj) {
                const output = obj?.payloadOutput ? JSON.parse(obj?.payloadOutput) : {};
                const outputArray = Object.entries(output as PayloadOutput).map(([key, value]) => ({
                    name: key,
                    value: value.description,
                    dataType: value.type,
                }));

                const promotedVariables = obj?.promotedVariables ? JSON.parse(obj?.promotedVariables) : {};
                const promotedVariablesAray = Object.entries(promotedVariables as PayloadOutput).map(
                    ([key, value]) => ({
                        name: key,
                        value: value.description,
                        dataType: value.type,
                    })
                );

                setValue('id', obj.id);
                setValue('apiHeaders', obj.apiHeaders);
                setValue('apiMethod', obj.apiMethod);
                setValue('guardrailType', obj.guardrailType);
                setValue('apiName', obj.apiName);
                setValue('apiUrl', obj.apiUrl);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('description', obj.description ?? '');
                setValue('payloadFormat', obj.payloadFormat);
                setValue('authorization.authType', obj.authorization?.authType as AuthorizationType);
                if (outputArray.length > 0) {
                    setValue('payloads', outputArray);
                }
                if (promotedVariablesAray.length > 0) {
                    setValue('promotedVariables', promotedVariablesAray);
                }
                if (obj?.authorization?.meta) {
                    setValue('authorization.meta.username', obj?.authorization?.meta?.username);
                    setValue('authorization.meta.password', obj?.authorization?.meta?.password);
                    setValue('authorization.meta.token', obj?.authorization?.meta?.token);
                    setValue('authorization.meta.headerName', obj?.authorization?.meta?.headerName);
                    setValue('authorization.meta.headerValue', obj?.authorization?.meta?.headerValue);
                }
            }
        }
    };

    const append = (type: HeaderType) => {
        if (type === HeaderType.ApiHeader) {
            appendApiHeader({ name: '', dataType: '', value: '' });
        } else if (type === HeaderType.Payloads) {
            appendPayloads({ name: '', dataType: 'string', value: '' });
        } else if (type === HeaderType?.PromotedVariables) {
            appendPromotedVariables({ name: '', dataType: 'string', value: '' });
        }
    };

    const remove = (index: number, type: HeaderType) => {
        if (type === HeaderType.ApiHeader) {
            removeApiHeader(index);
        } else if (type === HeaderType.Payloads) {
            removePayloads(index);
        } else if (type === HeaderType.PromotedVariables) {
            removePromotedVariables(index);
        }
    };

    const mapAuthorization = (auth: IAuthorization) => {
        if (auth.authType === AuthorizationType.NoAuthorization) {
            return { authType: auth.authType } as IAuthorization;
        } else if (auth.authType === AuthorizationType.BasicAuth) {
            return {
                authType: auth.authType,
                meta: { username: auth?.meta?.username, password: auth?.meta?.password },
            } as IAuthorization;
        } else if (auth.authType === AuthorizationType.APIKey) {
            return {
                authType: auth.authType,
                meta: { headerName: auth?.meta?.headerName, headerValue: auth?.meta?.headerValue },
            } as IAuthorization;
        }
        return {
            authType: auth.authType,
            meta: { token: auth?.meta?.token },
        } as IAuthorization;
    };

    const onHandleSubmit = (data: IGuardrailConfigForm) => {
        try {
            const outputObj: PayloadOutput = {};
            const promotedVariables: PayloadOutput = {};

            data?.payloads?.forEach(item => {
                if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                    outputObj[item.name] = {
                        description: item.value,
                        type: item.dataType,
                    };
                }
            });

            data?.promotedVariables?.forEach(item => {
                if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                    promotedVariables[item.name] = {
                        description: item.value,
                        type: item.dataType,
                    };
                }
            });

            if (data.id) {
                const body: ToolGuardrailAPI = {
                    name: data.apiName,
                    description: data.description,
                    configurations: {
                        url: data.apiUrl,
                        method: data.apiMethod,
                        guardrailType: data.guardrailType,
                        guardrailApiProvider: data.guardrailApiProvider,
                        headers: data.apiHeaders,
                        payload: JSON.stringify(outputObj),
                        authorization: mapAuthorization(data.authorization),
                        promotedVariables: JSON.stringify(promotedVariables),
                    },
                };
                mutateUpdate({ data: body, id: data.id });
            } else {
                const body: ToolGuardrailAPI = {
                    name: data.apiName,
                    description: data.description,
                    configurations: {
                        url: data.apiUrl,
                        method: data.apiMethod,
                        guardrailType: data.guardrailType,
                        guardrailApiProvider: data.guardrailApiProvider,
                        headers: data.apiHeaders,
                        payload: JSON.stringify(outputObj),
                        authorization: mapAuthorization(data.authorization),
                        promotedVariables: JSON.stringify(promotedVariables),
                    },
                };
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your Guardrails API");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        if (loading) return 'Verifying';
        return 'Save';
    };

    const onGuardrailsApiConfigurationFilter = (filter: GuardrailsApiConfigurationData | null) => {
        let result = guardrailsApiConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x.apiName.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.apiName)) {
            result = result.filter(x => x.apiName.toLowerCase() === filter?.apiName.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.apiUrl)) {
            result = result.filter(x => x.apiUrl.toLowerCase() === filter?.apiUrl.toLowerCase());
        }

        setGuardrailsApiConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteGuardrailsApi({ id });
        }
    };

    return {
        guardrailsApiConfigurationDataCardInfo,
        guardrailsApiConfigurationTableData,
        activityData,
        isFetching,
        apiHeaders,
        payloads,
        control,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: createIsLoading || updateIsLoading,
        loadingSecrets,
        onEdit,
        buttonText,
        bottomRef: ref,
        onGuardrailsApiConfigurationFilter,
        register,
        watch,
        setValue,
        append,
        remove,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onDelete,
        updatePayloadDataType,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
    };
};
