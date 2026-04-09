/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFieldArray, useForm } from 'react-hook-form';
import { IApiConfigForm, IAuthorization, ToolAPI } from '@/models';
import { ApiConfigurationData } from '@/app/workspace/[wid]/api-configurations/components/api-configuration-table-container';
import { logger } from '@/utils';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthenticationGrantType, AuthorizationType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';

export enum HeaderType {
    ApiHeader,
    Payloads,
    PromotedVariables,
    DefaultApiParameters,
}

export interface PayloadOutput {
    [key: string]: {
        description: string;
        type: string;
    };
}

export interface DefaultApiParameter {
    [key: string]: {
        value: any;
        type: string;
        defaultValue?: string;
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
        title: 'LLM Execution',
        description: 'LLM Execution',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

const MOCK_API_CONFIGS: ToolAPI[] = [
    {
        id: 'mock-1',
        name: 'Get User Profile',
        description: 'Retrieves user profile information',
        configurations: {
            url: 'https://api.example.com/user/profile',
            method: 'GET',
            headers: [{ name: 'Authorization', value: 'Bearer {{token}}', isSecret: true, dataType: 'string' }],
            payload: JSON.stringify({ userId: { type: 'string', description: 'ID of the user' } }),
            authorization: { authType: AuthorizationType.Empty, meta: {} },
            promotedVariables: '{}',
            defaultApiParameters: '{}',
            concurrencyLimit: 10,
        },
    },
    {
        id: 'mock-2',
        name: 'Send Notification',
        description: 'Sends a push notification to the user',
        configurations: {
            url: 'https://api.example.com/notifications/send',
            method: 'POST',
            headers: [{ name: 'Content-Type', value: 'application/json', isSecret: false, dataType: 'string' }],
            payload: JSON.stringify({
                title: { type: 'string', description: 'Title of the notification' },
                body: { type: 'string', description: 'Body content' },
            }),
            authorization: { authType: AuthorizationType.Empty, meta: {} },
            promotedVariables: '{}',
            defaultApiParameters: '{}',
            concurrencyLimit: 5,
        },
    },
];

const MOCK_SECRETS: OptionModel[] = [
    { name: 'STRIPE_API_KEY', value: 'STRIPE_API_KEY' },
    { name: 'OPENAI_API_KEY', value: 'OPENAI_API_KEY' },
    { name: 'AWS_ACCESS_KEY', value: 'AWS_ACCESS_KEY' },
];

export const useApiConfiguration = () => {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<IApiConfigForm>({
        mode: 'all',
        defaultValues: {
            payloads: [{ name: '', dataType: 'string', value: '' }],
            promotedVariables: [{ name: '', dataType: 'string', value: '' }],
            defaultApiParameters: [{ name: '', dataType: 'string', value: '', defaultValue: '' }],
        },
    });

    const [apiConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [apiConfigurationTableData, setApiConfigurationTableData] = useState<ApiConfigurationData[]>([]);
    const [apiConfigurations, setApiConfigurations] = useState<ApiConfigurationData[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [secrets] = useState<OptionModel[]>(MOCK_SECRETS);

    const mapAllApis = (arr: ToolAPI[]) => {
        const data = arr.map((x: ToolAPI) => ({
            id: x.id as string,
            apiHeaders: x.configurations.headers,
            apiMethod: x.configurations.method,
            apiName: x.name,
            apiUrl: x.configurations.url,
            payloadFormat: x?.configurations?.payload,
            description: x.description,
            payloadOutput: x?.configurations?.payload,
            authorization: x?.configurations?.authorization,
            isReadOnly: x?.isReadOnly,
            promotedVariables: x?.configurations?.promotedVariables ?? '{}',
            defaultApiParameters: x?.configurations?.defaultApiParameters ?? '{}',
            concurrencyLimit: x?.configurations?.concurrencyLimit ?? null,
        }));
        setApiConfigurationTableData(data);
        setApiConfigurations(data);
    };

    useEffect(() => {
        const stored = localStorage.getItem('mock_api_configs');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                mapAllApis(parsed);
            } catch {
                mapAllApis(MOCK_API_CONFIGS);
            }
        } else {
            mapAllApis(MOCK_API_CONFIGS);
        }
    }, []);

    const saveToLocalStorage = (data: ToolAPI[]) => {
        localStorage.setItem('mock_api_configs', JSON.stringify(data));
        mapAllApis(data);
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                apiHeaders: [],
                apiMethod: '',
                apiName: '',
                apiUrl: '',
                payloadFormat: '',
                description: '',
                payloads: [{ name: '', dataType: 'string', value: '' }],
                authorization: {
                    authType: AuthorizationType.Empty,
                    meta: {
                        headerName: '',
                        headerValue: '',
                        password: '',
                        token: '',
                        username: '',
                        grantType: AuthenticationGrantType.Empty,
                    },
                },
                isReadOnly: undefined,
                promotedVariables: [{ name: '', dataType: 'string', value: '' }],
                defaultApiParameters: [{ name: '', dataType: 'string', value: '', defaultValue: '' }],
            });
            setEdit(false);
        }
    }, [isOpen, reset]);

    // Completely mock the API and Vault queries to prevent any backend calls
    const isFetching = false;
    const refetchApiConfigs = async () => {
        logger.log('Mock refetchApiConfigs called');
    };

    const refetch = async () => {
        logger.log('Mock vault refetch called');
    };
    const loadingSecrets = false;

    const {
        fields: apiHeaders,
        append: appendApiHeader,
        remove: removeApiHeader,
    } = useFieldArray({
        name: 'apiHeaders',
        control,
    });

    const {
        fields: defaultApiParameters,
        append: appendDefaultApiParameter,
        remove: removeDefaultApiParameter,
        update: updateDefaultApiParameter,
    } = useFieldArray({
        name: 'defaultApiParameters',
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

    const updateDefaultApiParametersData = () => {
        defaultApiParameters.forEach((_, index) => {
            updateDefaultApiParameter(index, { ...defaultApiParameters[index], dataType: 'string' });
        });
    };

    const updatePromotedVariablesDataType = () => {
        promotedVariables.forEach((_, index) => {
            updatePromotedVariables(index, { ...promotedVariables[index], dataType: 'string' });
        });
    };

    const createIsLoading = false;
    const mutateCreate = (data: ToolAPI) => {
        const newApi = { ...data, id: Math.random().toString(36).substr(2, 9) };
        const updated = [
            ...apiConfigurations.map(
                x =>
                    ({
                        id: x.id,
                        name: x.apiName,
                        description: x.description,
                        isReadOnly: x.isReadOnly,
                        configurations: {
                            url: x.apiUrl,
                            method: x.apiMethod,
                            headers: x.apiHeaders,
                            payload: x.payloadOutput,
                            authorization: x.authorization,
                            promotedVariables: x.promotedVariables,
                            defaultApiParameters: x.defaultApiParameters,
                            concurrencyLimit: x.concurrencyLimit,
                        },
                    }) as unknown as ToolAPI
            ),
            newApi,
        ];
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('API saved successfully (Mock)');
    };

    const updateIsLoading = false;
    const mutateUpdate = ({ data, id }: { data: ToolAPI; id: string }) => {
        const updated = apiConfigurations.map(x => {
            if (x.id === id) {
                return {
                    ...data,
                    id,
                };
            }
            return {
                id: x.id,
                name: x.apiName,
                description: x.description,
                isReadOnly: x.isReadOnly,
                configurations: {
                    url: x.apiUrl,
                    method: x.apiMethod,
                    headers: x.apiHeaders,
                    payload: x.payloadOutput,
                    authorization: x.authorization,
                    promotedVariables: x.promotedVariables,
                    defaultApiParameters: x.defaultApiParameters,
                    concurrencyLimit: x.concurrencyLimit,
                },
            } as unknown as ToolAPI;
        });
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('API updated successfully (Mock)');
    };

    const mutateDeleteApi = ({ id }: { id: string }) => {
        const updated = apiConfigurations
            .filter(x => x.id !== id)
            .map(
                x =>
                    ({
                        id: x.id,
                        name: x.apiName,
                        description: x.description,
                        isReadOnly: x.isReadOnly,
                        configurations: {
                            url: x.apiUrl,
                            method: x.apiMethod,
                            headers: x.apiHeaders,
                            payload: x.payloadOutput,
                            authorization: x.authorization,
                            promotedVariables: x.promotedVariables,
                            defaultApiParameters: x.defaultApiParameters,
                            concurrencyLimit: x.concurrencyLimit,
                        },
                    }) as unknown as ToolAPI
            );
        saveToLocalStorage(updated);
        toast.success('API deleted successfully (Mock)');
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = apiConfigurationTableData.find(x => x.id === id);
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
                const defaultApiParameters = obj?.defaultApiParameters ? JSON.parse(obj?.defaultApiParameters) : {};
                const defaultApiParametersArray = Object.entries(defaultApiParameters as DefaultApiParameter).map(
                    ([key, value]) => ({
                        name: key,
                        value: value.value,
                        dataType: value.type,
                        defaultValue: value.defaultValue ?? '',
                    })
                );

                setValue('id', obj.id);
                setValue('apiHeaders', obj.apiHeaders);
                setValue('apiMethod', obj.apiMethod);
                setValue('apiName', obj.apiName);
                setValue('apiUrl', obj.apiUrl);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('description', obj.description ?? '');
                setValue('payloadFormat', obj.payloadFormat);
                setValue('authorization.authType', obj.authorization?.authType as AuthorizationType);
                setValue('concurrencyLimit', obj?.concurrencyLimit ?? null);
                if (outputArray.length > 0) {
                    setValue('payloads', outputArray);
                }
                if (promotedVariablesAray.length > 0) {
                    setValue('promotedVariables', promotedVariablesAray);
                }
                if (defaultApiParametersArray.length > 0) {
                    setValue('defaultApiParameters', defaultApiParametersArray);
                }
                if (obj?.authorization?.meta) {
                    setValue('authorization.meta.username', obj?.authorization?.meta?.username);
                    setValue('authorization.meta.password', obj?.authorization?.meta?.password);
                    setValue('authorization.meta.token', obj?.authorization?.meta?.token);
                    setValue('authorization.meta.headerName', obj?.authorization?.meta?.headerName);
                    setValue('authorization.meta.headerValue', obj?.authorization?.meta?.headerValue);
                    setValue(
                        'authorization.meta.grantType',
                        obj?.authorization?.meta?.grantType ?? AuthenticationGrantType.Empty
                    );
                    setValue('authorization.meta.headerPrefix', obj?.authorization?.meta?.headerPrefix);
                    setValue('authorization.meta.clientId', obj?.authorization?.meta?.clientId);
                    setValue('authorization.meta.clientSecret', obj?.authorization?.meta?.clientSecret);
                    setValue('authorization.meta.audience', obj?.authorization?.meta?.audience);
                    setValue('authorization.meta.scope', obj?.authorization?.meta?.scope);
                    setValue('authorization.meta.tokenUrl', obj?.authorization?.meta?.tokenUrl);
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
        } else if (type === HeaderType.DefaultApiParameters) {
            appendDefaultApiParameter({ name: '', dataType: 'string', value: '', defaultValue: '' });
        }
    };

    const remove = (index: number, type: HeaderType) => {
        if (type === HeaderType.ApiHeader) {
            removeApiHeader(index);
        } else if (type === HeaderType.Payloads) {
            removePayloads(index);
        } else if (type === HeaderType.PromotedVariables) {
            removePromotedVariables(index);
        } else if (type === HeaderType.DefaultApiParameters) {
            removeDefaultApiParameter(index);
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
        } else if (auth.authType === AuthorizationType.SSO) {
            return {
                authType: auth.authType,
                meta: undefined,
            } as IAuthorization;
        } else if (auth.authType === AuthorizationType.OAUTH2) {
            return {
                authType: auth.authType,
                meta: {
                    grantType: auth?.meta?.grantType,
                    headerPrefix: auth?.meta?.headerPrefix,
                    clientId: auth?.meta?.clientId,
                    clientSecret: auth?.meta?.clientSecret,
                    audience: auth?.meta?.audience,
                    scope: auth?.meta?.scope,
                    tokenUrl: auth?.meta?.tokenUrl,
                },
            } as IAuthorization;
        }

        return {
            authType: auth.authType,
            meta: { token: auth?.meta?.token },
        } as IAuthorization;
    };

    const onHandleSubmit = (data: IApiConfigForm) => {
        try {
            const outputObj: PayloadOutput = {};
            const promotedVariables: PayloadOutput = {};
            const defaultApiParameter: DefaultApiParameter = {};

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

            data?.defaultApiParameters?.forEach(item => {
                if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                    defaultApiParameter[item.name] = {
                        value: item.value,
                        type: item.dataType,
                        defaultValue: item.defaultValue ?? '',
                    };
                }
            });

            if (data.id) {
                const body: ToolAPI = {
                    name: data.apiName,
                    description: data.description,
                    configurations: {
                        url: data.apiUrl,
                        method: data.apiMethod,
                        headers: data.apiHeaders?.map(x => ({
                            ...x,
                            isSecret: x?.isSecret === true,
                        })),
                        payload: JSON.stringify(outputObj),
                        authorization: mapAuthorization(data.authorization),
                        promotedVariables: JSON.stringify(promotedVariables),
                        defaultApiParameters: JSON.stringify(defaultApiParameter),
                        concurrencyLimit: data.concurrencyLimit ?? null,
                    },
                };
                mutateUpdate({ data: body, id: data.id });
            } else {
                const body: ToolAPI = {
                    name: data.apiName,
                    description: data.description,
                    configurations: {
                        url: data.apiUrl,
                        method: data.apiMethod,
                        headers: data.apiHeaders?.map(x => ({
                            ...x,
                            isSecret: x?.isSecret === true,
                        })),
                        payload: JSON.stringify(outputObj),
                        authorization: mapAuthorization(data.authorization),
                        promotedVariables: JSON.stringify(promotedVariables),
                        defaultApiParameters: JSON.stringify(defaultApiParameter),
                        concurrencyLimit: data.concurrencyLimit ?? null,
                    },
                };
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your API");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        return 'Save';
    };

    const onApiConfigurationFilter = (filter: ApiConfigurationData | null) => {
        let result = apiConfigurations;

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

        setApiConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteApi({ id });
        }
    };

    return {
        apiConfigurationDataCardInfo,
        apiConfigurationTableData,
        activityData,
        isFetching,
        apiHeaders,
        payloads,
        defaultApiParameters,
        control,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: createIsLoading || updateIsLoading,
        loadingSecrets,
        isEdit,
        setEdit,
        onEdit,
        buttonText,
        bottomRef: ref,
        onApiConfigurationFilter,
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
        updateDefaultApiParametersData,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
        refetchApiConfigs,
    };
};
