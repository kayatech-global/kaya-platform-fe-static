'use client'
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFieldArray, useForm } from 'react-hook-form';
import { IGuardrailConfigForm, IAuthorization, IHookProps, ToolGuardrailAPI } from '@/models';
import { GuardrailsApiConfigurationData } from '@/app/workspace/[wid]/guardrails/guardrails-api-configurations/components/guardrails-api-configuration-table-container';
import { logger } from '@/utils';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { AuthorizationType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';

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

const MOCK_GUARDRAIL_API_CONFIGS: ToolGuardrailAPI[] = [
    {
        id: 'mock-gr-api-1',
        name: 'OpenAI Content Filter',
        description: 'Mock OpenAI content filtering API',
        configurations: {
            url: 'https://api.openai.com/v1/moderations',
            method: 'POST',
            guardrailType: 'CONTENT_MODERATION',
            guardrailApiProvider: 'OpenAI',
            headers: [{ name: 'Authorization', value: 'Bearer {{OPENAI_API_KEY}}', isSecret: true, dataType: 'string' }],
            payload: JSON.stringify({ input: { type: 'string', description: 'Input text to moderate' } }),
            authorization: { authType: AuthorizationType.Empty, meta: {} },
            promotedVariables: '{}',
        },
    },
];

const MOCK_SECRETS: OptionModel[] = [
    { name: 'OPENAI_API_KEY', value: 'OPENAI_API_KEY' },
    { name: 'AZURE_CONTENT_SAFETY_KEY', value: 'AZURE_CONTENT_SAFETY_KEY' },
];

export const useGuardrailsApiConfiguration = (props?: IHookProps) => {
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
    const [secrets] = useState<OptionModel[]>(MOCK_SECRETS);

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

    useEffect(() => {
        const stored = localStorage.getItem('mock_guardrail_apis');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                mapAllGuardrailsApis(parsed);
            } catch {
                mapAllGuardrailsApis(MOCK_GUARDRAIL_API_CONFIGS);
            }
        } else {
            mapAllGuardrailsApis(MOCK_GUARDRAIL_API_CONFIGS);
        }
    }, []);

    const saveToLocalStorage = (data: ToolGuardrailAPI[]) => {
        localStorage.setItem('mock_guardrail_apis', JSON.stringify(data));
        mapAllGuardrailsApis(data);
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
    }, [isOpen, reset]);

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

    const isFetching = false;
    const loadingSecrets = false;
    const createIsLoading = false;
    const updateIsLoading = false;

    const refetch = async () => {
        logger.log('Mock vault refetch called');
    };

    const mutateCreate = (data: ToolGuardrailAPI) => {
        const newApi = { ...data, id: Math.random().toString(36).substr(2, 9) };
        const updated = [
            ...guardrailsApiConfigurations.map(x => ({
                id: x.id,
                name: x.apiName,
                description: x.description,
                isReadOnly: x.isReadOnly,
                configurations: {
                    url: x.apiUrl,
                    method: x.apiMethod,
                    guardrailType: x.guardrailType,
                    guardrailApiProvider: x.guardrailApiProvider,
                    headers: x.apiHeaders,
                    payload: x.payloadOutput,
                    authorization: x.authorization,
                    promotedVariables: x.promotedVariables,
                }
            }) as unknown as ToolGuardrailAPI),
            newApi
        ];
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Guardrails API saved successfully (Mock)');
    };

    const mutateUpdate = ({ data, id }: { data: ToolGuardrailAPI; id: string }) => {
        const updated = guardrailsApiConfigurations.map(x => {
            if (x.id === id) return { ...data, id };
            return {
                id: x.id,
                name: x.apiName,
                description: x.description,
                isReadOnly: x.isReadOnly,
                configurations: {
                    url: x.apiUrl,
                    method: x.apiMethod,
                    guardrailType: x.guardrailType,
                    guardrailApiProvider: x.guardrailApiProvider,
                    headers: x.apiHeaders,
                    payload: x.payloadOutput,
                    authorization: x.authorization,
                    promotedVariables: x.promotedVariables,
                }
            } as unknown as ToolGuardrailAPI;
        });
        saveToLocalStorage(updated);
        setOpen(false);
        toast.success('Guardrails API updated successfully (Mock)');
    };

    const mutateDeleteGuardrailsApi = ({ id }: { id: string }) => {
        const updated = guardrailsApiConfigurations
            .filter(x => x.id !== id)
            .map(x => ({
                id: x.id,
                name: x.apiName,
                description: x.description,
                isReadOnly: x.isReadOnly,
                configurations: {
                    url: x.apiUrl,
                    method: x.apiMethod,
                    guardrailType: x.guardrailType,
                    guardrailApiProvider: x.guardrailApiProvider,
                    headers: x.apiHeaders,
                    payload: x.payloadOutput,
                    authorization: x.authorization,
                    promotedVariables: x.promotedVariables,
                }
            }) as unknown as ToolGuardrailAPI);
        saveToLocalStorage(updated);
        toast.success('Guardrails API deleted successfully (Mock)');
    };

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
