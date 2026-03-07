/* eslint-disable @typescript-eslint/no-explicit-any */
import { OptionModel } from '@/components';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ICredentials } from '@/models/configuration.model';
import { useFieldArray, useForm } from 'react-hook-form';
import { ExecutableFunctionAPI } from '@/models';
import { logger } from '@/utils';
import { isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { ExecutableFunctionData } from '@/app/workspace/[wid]/executable-functions/components/executable-function-table';
import { IExecutableFunctionForm, IExecutableFunctionCredential } from '@/models/executable-function.model';

const MOCK_EXECUTABLE_FUNCTIONS: ExecutableFunctionAPI[] = [
    {
        id: 'func-1',
        name: 'Process-Data-Lambda',
        description: 'Processes incoming JSON data and transforms it.',
        configurations: {
            provider: 'aws',
            startupOption: 'on-demand',
            language: 'python',
            code: 'def handler(event, context):\n    return {"status": "success", "data": event}',
            region: 'us-east-1',
            payload: JSON.stringify({
                input_data: { description: 'The JSON data to process', type: 'object' },
            }),
            credentials: { authType: 'managed-access', meta: { accessKey: 'AKIA...', secretKey: 'SECRET...' } },
            dependencies: { requests: '2.28.1' },
            environment: { ENV: 'production' },
        } as any,
    },
    {
        id: 'func-2',
        name: 'Analyze-Sentiment-Function',
        description: 'Analyzes the sentiment of a given text.',
        configurations: {
            provider: 'aws',
            startupOption: 'on-demand',
            language: 'node',
            code: 'exports.handler = async (event) => {\n    return { sentiment: "positive" };\n};',
            region: 'eu-central-1',
            payload: JSON.stringify({
                text: { description: 'The text to analyze', type: 'string' },
            }),
            credentials: { authType: 'managed-access', meta: { accessKey: 'AKIA...', secretKey: 'SECRET...' } },
            dependencies: { '@tensorflow/tfjs': '4.1.0' },
            environment: { MODEL_VERSION: 'v1' },
        } as any,
    },
];

const MOCK_SECRETS: OptionModel[] = [
    { name: 'AWS_ACCESS_KEY', value: 'AWS_ACCESS_KEY' },
    { name: 'AWS_SECRET_KEY', value: 'AWS_SECRET_KEY' },
    { name: 'LAMBDA_ROLE_ARN', value: 'LAMBDA_ROLE_ARN' },
];

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

export const useExecutableFunction = () => {
    const [executableFunctionTableData, setExecutableFunctionTableData] = useState<ExecutableFunctionData[]>([]);
    const [executableFunctionConfigurations, setExecutableFunctionConfigurations] = useState<ExecutableFunctionData[]>(
        []
    );
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets] = useState<OptionModel[]>(MOCK_SECRETS);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<IExecutableFunctionForm>({
        mode: 'all',
        defaultValues: {
            isReadOnly: false,
        },
    });

    const mapExecutableFunctions = (arr: ExecutableFunctionAPI[]) => {
        const data = arr.map((x: ExecutableFunctionAPI) => {
            const dependenciesArray = x.configurations.dependencies
                ? Object.entries(x.configurations.dependencies).map(([name, value]) => ({
                      name,
                      value: value as string,
                      dataType: '',
                  }))
                : [];

            const environmentVariablesArray = x.configurations.environment
                ? Object.entries(x.configurations.environment).map(([name, value]) => ({
                      name,
                      value: value as string,
                      dataType: '',
                  }))
                : [];

            let payloadObj: PayloadOutput = {};
            if (x.configurations.payload) {
                try {
                    payloadObj =
                        typeof x.configurations.payload === 'string'
                            ? JSON.parse(x.configurations.payload)
                            : x.configurations.payload;
                } catch {
                    payloadObj = {};
                }
            }

            return {
                id: x.id as string,
                name: x.name,
                provider: x.configurations.provider,
                startupOption: x.configurations.startupOption,
                description: x.description,
                language: x.configurations.language,
                code: x.configurations.code,
                payload: x.configurations.payload,
                region: x.configurations.region,
                deployedUrl: (x.configurations as any)?.functionUrl,
                credentials: x.configurations.credentials,
                dependencies: dependenciesArray,
                environmentVariables: environmentVariablesArray,
                payloadArray: Object.entries(payloadObj).map(([key, value]) => ({
                    name: key,
                    value: value.description,
                    dataType: value.type,
                })),
            };
        });

        setExecutableFunctionTableData(data as any);
        setExecutableFunctionConfigurations(data as any);
    };

    useEffect(() => {
        const stored = localStorage.getItem('mock_executable_functions');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                mapExecutableFunctions(parsed);
            } catch {
                mapExecutableFunctions(MOCK_EXECUTABLE_FUNCTIONS);
            }
        } else {
            mapExecutableFunctions(MOCK_EXECUTABLE_FUNCTIONS);
        }
    }, []);

    const saveToLocalStorage = (data: ExecutableFunctionAPI[]) => {
        localStorage.setItem('mock_executable_functions', JSON.stringify(data));
        mapExecutableFunctions(data);
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                provider: '',
                startupOption: 'on-demand',
                language: 'python',
                code: 'def handler(event, context):\n    name = event.get("name")\n    return {\n        "statusCode": 200,\n        "body": f"Hello {name} from Python Lambda!"\n    }',
                region: 'eu-west-1',
                deployedUrl: '',
                credentials: {
                    authType: 'managed-access',
                    meta: {
                        secretKey: '',
                        accessKey: '',
                        lambdaExecutionRoleArn: '',
                    },
                },
                isReadOnly: false,
                payload: [],
                dependencies: [],
                environmentVariables: [],
            });
            setEdit(false);
        }
    }, [isOpen, reset]);

    const {
        fields: payload,
        append,
        remove: removePayload,
    } = useFieldArray({
        control,
        name: 'payload',
    });

    const appendPayload = () => {
        append({ name: '', dataType: 'string', value: '' });
    };

    const {
        fields: dependencies,
        append: appendDependencyField,
        remove: removeDependency,
    } = useFieldArray({
        control,
        name: 'dependencies',
    });

    const appendDependency = () => {
        appendDependencyField({ name: '', dataType: '', value: '' });
    };

    const {
        fields: environmentVariables,
        append: appendEnvironmentVariableField,
        remove: removeEnvironmentVariable,
    } = useFieldArray({
        control,
        name: 'environmentVariables',
    });

    const appendEnvironmentVariable = () => {
        appendEnvironmentVariableField({ name: '', dataType: '', value: '' });
    };

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const mapCredentials = (credentials: IExecutableFunctionCredential): ICredentials => {
        const rawMeta = credentials?.meta;
        const cleanedMeta: ICredentials['meta'] = {};

        if (rawMeta?.secretKey) cleanedMeta.secretKey = rawMeta.secretKey;
        if (rawMeta?.accessKey) cleanedMeta.accessKey = rawMeta.accessKey;
        if (rawMeta?.lambdaExecutionRoleArn) cleanedMeta.lambdaExecutionRoleArn = rawMeta.lambdaExecutionRoleArn;

        return {
            authType: credentials.authType,
            meta: cleanedMeta,
        } as ICredentials;
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj: any = executableFunctionTableData.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('provider', obj.provider);
                setValue('language', obj.language);
                setValue('code', obj.code);
                setValue('startupOption', obj.startupOption);
                setValue('credentials', obj.credentials);
                setValue('isReadOnly', obj?.isReadOnly);
                setValue('region', obj?.region);
                setValue('deployedUrl', obj?.deployedUrl ?? '');
                setValue('payload', obj?.payloadArray ?? []);
                setValue('dependencies', obj?.dependencies ?? []);
                setValue('environmentVariables', obj?.environmentVariables ?? []);
            }
        }
    };

    const onHandleSubmit = (data: IExecutableFunctionForm) => {
        const parameters: PayloadOutput = {};
        data?.payload?.forEach(item => {
            if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                parameters[item.name] = { description: item.value, type: item.dataType };
            }
        });

        const deps: Record<string, string> = {};
        data?.dependencies?.forEach(item => {
            if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                deps[item.name] = item.value;
            }
        });

        const env: Record<string, string> = {};
        data?.environmentVariables?.forEach(item => {
            if (!isNullOrEmpty(item.name) && !isNullOrEmpty(item.value)) {
                env[item.name] = item.value;
            }
        });

        const body: ExecutableFunctionAPI = {
            id: data.id || Math.random().toString(36).substr(2, 9),
            name: data.name,
            description: data.description,
            configurations: {
                language: data.language,
                code: data.code,
                provider: data.provider,
                startupOption: data.startupOption,
                payload: JSON.stringify(parameters),
                region: data.region,
                credentials: mapCredentials(data.credentials),
                dependencies: deps,
                environment: env,
            } as any,
        };

        const stored = localStorage.getItem('mock_executable_functions');
        let current: ExecutableFunctionAPI[] = stored ? JSON.parse(stored) : MOCK_EXECUTABLE_FUNCTIONS;

        if (data.id) {
            const updated = current.map(x => (x.id === data.id ? body : x));
            saveToLocalStorage(updated);
            toast.success('Executable Function updated successfully (Mock)');
        } else {
            const updated = [...current, body];
            saveToLocalStorage(updated);
            toast.success('Executable Function deployed successfully (Mock)');
        }
        setOpen(false);
    };

    const isFetching = false;
    const loadingSecrets = false;
    const createIsLoading = false;
    const updateIsLoading = false;

    const refetch = async () => {
        logger.log('Mock refetch called');
    };

    const refetchApiConfigs = async () => {
        logger.log('Mock refetchApiConfigs called');
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        return 'Save';
    };

    const onExecutableFunctionFilter = (filter: ExecutableFunctionData | null) => {
        let result = executableFunctionConfigurations;
        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.name)) {
            result = result.filter(x => x.name.toLowerCase() === filter?.name.toLowerCase());
        }
        setExecutableFunctionTableData(result);
    };

    const onDelete = (id: string) => {
        const stored = localStorage.getItem('mock_executable_functions');
        let current: ExecutableFunctionAPI[] = stored ? JSON.parse(stored) : MOCK_EXECUTABLE_FUNCTIONS;
        const updated = current.filter(x => x.id !== id);
        saveToLocalStorage(updated);
        toast.success('Executable Function deleted successfully (Mock)');
    };

    return {
        executableFunctionTableData,
        isFetching,
        control,
        errors,
        isOpen,
        isValid,
        secrets,
        isDeploying: createIsLoading || updateIsLoading,
        loadingSecrets,
        isEdit,
        setEdit,
        onEdit,
        buttonText,
        bottomRef: ref,
        onExecutableFunctionFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        onDelete,
        refetch,
        refetchApiConfigs,
        payload,
        appendPayload,
        removePayload,
        dependencies,
        appendDependency,
        removeDependency,
        environmentVariables,
        appendEnvironmentVariable,
        removeEnvironmentVariable,
    };
};
