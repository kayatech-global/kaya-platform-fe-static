/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { McpConfigurationData } from '@/app/workspace/[wid]/mcp-configurations/components/mcp-configuration-table-container';
import { ActivityProps, DashboardDataCardProps, OptionModel } from '@/components';
import { AuthorizationType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { TransportType } from '@/enums/transport-type';
import { isNullOrEmpty } from '@/lib/utils';
import { IAuthorization, IMcpConfigForm } from '@/models';
import { logger } from '@/utils';
import { Database, Link, TrendingDownIcon, TrendingUpIcon, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Frequently Triggered',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Top MCP Server by Request Count Last Month',
        trendValue: '',
        trendColor: 'text-green-600',
        Icon: Unplug,
        TrendIcon: TrendingUpIcon,
        showTrendIcon: true,
    },
    {
        title: 'Most credit consumed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Top MCP Server by Avg Exec Time Last Month',
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

const activityDataInfo: ActivityProps[] = [
    {
        title: 'MCP Workflow Triggered',
        description: 'Scheduled workflow initiated via MCP server',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Amber,
    },
    {
        title: 'MCP API Call',
        description: (
            <div>
                External API invoked through MCP <span style={{ color: ActivityColorCode.Purple }}>AWS</span>
            </div>
        ),
        date: '2024/12/12',
        colorCode: ActivityColorCode.Purple,
    },
    {
        title: 'MCP LLM Job Executed',
        description: 'LLM task processed by MCP inference engine',
        date: '2024/12/12',
        colorCode: ActivityColorCode.Red,
    },
];

export type AvailableTool = {
    name: string;
    description: string;
};

export enum ServerType {
    SERVER = 'SERVER',
    LOCAL = 'LOCAL',
}

export type IConfiguration = {
    url?: string;
    transport?: string;
    timeout?: number;
    retryCount?: number;
    authorization: IAuthorization;
    type?: ServerType;
    selected_tools?: string[];
};

export type IMCPBody = {
    id?: string;
    name?: string;
    toolId?: string;
    isReadOnly?: boolean;
    description?: string;
    configurations: IConfiguration;
};

const MOCK_MCP_CONFIGS: IMCPBody[] = [
    {
        id: 'mcp-1',
        name: 'Google Search MCP',
        description: 'MCP server for performing Google searches',
        isReadOnly: false,
        configurations: {
            url: 'http://localhost:3001',
            transport: TransportType.SSE,
            timeout: 30,
            retryCount: 3,
            authorization: { authType: AuthorizationType.Empty, meta: {} },
            type: ServerType.SERVER,
            selected_tools: ['google_search', 'get_search_results'],
        },
    },
    {
        id: 'mcp-2',
        name: 'File System MCP',
        description: 'Local MCP server for file operations',
        isReadOnly: false,
        configurations: {
            url: 'http://localhost:3002',
            transport: TransportType.SSE,
            timeout: 60,
            retryCount: 1,
            authorization: { authType: AuthorizationType.Empty, meta: {} },
            type: ServerType.SERVER,
            selected_tools: ['read_file', 'write_file', 'list_dir'],
        },
    },
];

const MOCK_SECRETS: OptionModel[] = [
    { name: 'GOOGLE_API_KEY', value: 'GOOGLE_API_KEY' },
    { name: 'LOCAL_MCP_TOKEN', value: 'LOCAL_MCP_TOKEN' },
];

const MOCK_TOOLS: AvailableTool[] = [
    { name: 'google_search', description: 'Search Google for information' },
    { name: 'get_search_results', description: 'Retrieve detailed search results' },
    { name: 'read_file', description: 'Read content from a file' },
    { name: 'write_file', description: 'Write content to a file' },
    { name: 'list_dir', description: 'List contents of a directory' },
];

export function mapMcpBodyToConfigurationData(arr: IMCPBody[] | undefined): McpConfigurationData[] {
    if (!arr?.length) return [];
    return arr.map((x: IMCPBody) => ({
        id: (x.id as string) ?? '',
        name: x?.name ?? '',
        url: x?.configurations?.url ?? '',
        description: x?.description,
        authorization: x?.configurations?.authorization,
        isReadOnly: x?.isReadOnly,
        timeout: x?.configurations?.timeout,
        retryCount: x?.configurations?.retryCount,
        transport: x?.configurations?.transport as TransportType,
        availableTools: x?.configurations?.selected_tools?.map(tool => ({
            label: tool,
            value: tool,
        })),
    }));
}

export const useMCPConfiguration = () => {
    const [mcpConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [activityData] = useState<ActivityProps[]>(activityDataInfo);
    const [mcpConfigurations, setMcpConfigurations] = useState<McpConfigurationData[]>([]);
    const [mcpConfigurationTableData, setMcpConfigurationTableData] = useState<McpConfigurationData[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets] = useState<OptionModel[]>(MOCK_SECRETS);
    const [tools, setTools] = useState<AvailableTool[]>([]);
    const [toolLoading, setToolLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors, isValid },
    } = useForm<IMcpConfigForm>({
        mode: 'all',
        defaultValues: {
            type: ServerType?.SERVER,
        },
    });

    const mapAllMcps = (arr: IMCPBody[]) => {
        const data = mapMcpBodyToConfigurationData(arr);
        setMcpConfigurationTableData(data);
        setMcpConfigurations(data);
    };

    useEffect(() => {
        const stored = localStorage.getItem('mock_mcp_configs');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                mapAllMcps(parsed);
            } catch {
                mapAllMcps(MOCK_MCP_CONFIGS);
            }
        } else {
            mapAllMcps(MOCK_MCP_CONFIGS);
        }
    }, []);

    const saveToLocalStorage = (data: IMCPBody[]) => {
        localStorage.setItem('mock_mcp_configs', JSON.stringify(data));
        mapAllMcps(data);
    };

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                url: '',
                timeout: 0,
                retryCount: 0,
                description: '',
                authorization: {
                    authType: AuthorizationType.Empty,
                    meta: { headerName: '', headerValue: '', password: '', token: '', username: '' },
                },
                type: ServerType?.SERVER,
                isReadOnly: undefined,
            });
            setTools([]);
            setEdit(false);
        }
    }, [isOpen, reset]);

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onMcpConfigurationFilter = (filter: McpConfigurationData | null) => {
        let result = mcpConfigurations;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.name)) {
            result = result.filter(x => x.name.toLowerCase() === filter?.name.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.url)) {
            result = result.filter(x => x.url.toLowerCase() === filter?.url.toLowerCase());
        }

        setMcpConfigurationTableData(result);
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = mcpConfigurations.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name ?? '');
                setValue('url', obj.url ?? '');
                setValue('description', obj?.description ?? '');
                setValue('timeout', obj?.timeout ?? 0);
                setValue('retryCount', obj?.retryCount ?? 0);
                setValue('transport', obj?.transport);
                setValue('availableTools', obj?.availableTools ?? []);
                setValue(
                    'authorization.authType',
                    (obj.authorization?.authType as AuthorizationType) ?? AuthorizationType?.Empty
                );
                if (obj?.authorization?.meta) {
                    setValue('authorization.meta.username', obj?.authorization?.meta?.username);
                    setValue('authorization.meta.password', obj?.authorization?.meta?.password);
                    setValue('authorization.meta.token', obj?.authorization?.meta?.token);
                    setValue('authorization.meta.headerName', obj?.authorization?.meta?.headerName);
                    setValue('authorization.meta.headerValue', obj?.authorization?.meta?.headerValue);
                }
            }
            getAllTool();
        }
    };

    const mutateDeleteApi = ({ id }: { id: string }) => {
        const stored = localStorage.getItem('mock_mcp_configs');
        let current: IMCPBody[] = stored ? JSON.parse(stored) : MOCK_MCP_CONFIGS;
        const updated = current.filter(x => x.id !== id);
        saveToLocalStorage(updated);
        toast.success('MCP deleted successfully (Mock)');
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteApi({ id });
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
        }
        return {
            authType: auth.authType,
            meta: { token: auth?.meta?.token },
        } as IAuthorization;
    };

    const onHandleSubmit = (mcpData: IMcpConfigForm) => {
        const selectedTools: string[] = getValues('availableTools')?.map(tool => tool?.value) ?? [];
        const body: IMCPBody = {
            id: mcpData.id || Math.random().toString(36).substr(2, 9),
            name: mcpData?.name,
            description: mcpData?.description,
            isReadOnly: mcpData.isReadOnly,
            configurations: {
                url: mcpData?.url,
                transport: mcpData?.transport,
                timeout: mcpData?.timeout,
                retryCount: mcpData?.retryCount,
                authorization: mapAuthorization(mcpData.authorization),
                type: mcpData.type as ServerType,
                selected_tools: selectedTools,
            },
        };

        const stored = localStorage.getItem('mock_mcp_configs');
        let current: IMCPBody[] = stored ? JSON.parse(stored) : MOCK_MCP_CONFIGS;

        if (mcpData.id) {
            const updated = current.map(x => (x.id === mcpData.id ? body : x));
            saveToLocalStorage(updated);
            toast.success('MCP updated successfully (Mock)');
        } else {
            const updated = [...current, body];
            saveToLocalStorage(updated);
            toast.success('MCP saved successfully (Mock)');
        }
        setIsOpen(false);
    };

    const isFetching = false;
    const loadingSecrets = false;
    const createIsLoading = false;
    const updateIsLoading = false;

    const refetch = async () => {
        logger.log('Mock refetch called');
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        return 'Save';
    };

    const fetchAvailableTools = async () => {
        setToolLoading(true);
        return new Promise<AvailableTool[]>(resolve => {
            setTimeout(() => {
                setToolLoading(false);
                resolve(MOCK_TOOLS);
            }, 500);
        });
    };

    const getAllTool = async () => {
        const response = await fetchAvailableTools();
        setTools(response);
    };

    return {
        mcpConfigurationDataCardInfo,
        bottomRef: ref,
        activityData,
        mcpConfigurations,
        onMcpConfigurationFilter,
        isOpen,
        setIsOpen,
        isEdit,
        setEdit,
        onEdit,
        onDelete,
        mcpConfigurationTableData,
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        errors,
        isValid,
        onHandleSubmit,
        loadingSecrets,
        secrets,
        refetch,
        isSaving: createIsLoading || updateIsLoading,
        isFetching,
        buttonText,
        tools,
        getAllTool,
        toolLoading,
        setTools,
    };
};
