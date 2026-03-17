import {
    IntellisenseTools,
} from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { PromptTemplateData } from '@/app/workspace/[wid]/prompt-templates/components/prompt-templates-table-container';
import { ActivityProps, DashboardDataCardProps } from '@/components';
import { useApp } from '@/context/app-context';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { IHookProps, IPromptTemplate, IPromptTemplateForm, ISharedItem, PromptTemplate } from '@/models';
import { logger } from '@/utils';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useIntelligenceSource } from './use-intelligence-source';
import { usePromptQuery } from './use-common';
import { QueryKeyType } from '@/enums';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useQuery, useQueryClient } from 'react-query';

export enum HeaderType {
    ApiHeader,
    PayloadHeader,
    ExpectedResponseHeader,
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

export const usePromptTemplate = (props?: IHookProps) => {
    const queryClient = useQueryClient();
    const [promptTemplateConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [promptTemplateConfigurationTableData, setPromptTemplateConfigurationTableData] = useState<
        PromptTemplateData[]
    >([]);
    const [promptTemplates, setPromptTemplates] = useState<PromptTemplateData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const [isPromptViewModelOpen, setIsPromptViewModelOpen] = useState<boolean>(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [editorContent, setEditorContent] = useState<string>('');
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>([]);

    useIntelligenceSource({ isOpen });
    const { intelligentSource } = useApp();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        trigger,
        resetField,
        formState: { errors, isValid },
        control,
    } = useForm<IPromptTemplateForm>({ mode: 'all' });

    const wrapMatchingWords = useCallback((value: string): string => {
        if (!value) return value;

        const sortedWords = [...allIntellisenseValues].sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const escapedWord = word.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
            const regex = new RegExp(String.raw`\b${escapedWord}\b`, 'g');
            value = value.replaceAll(regex, `{{${word}}}`);
        }

        return value;
    }, [allIntellisenseValues]);

    const handleEditorContentChange = useCallback(async (value: string) => {
        const updatedValue = wrapMatchingWords(value);
        setValue('prompt', updatedValue, { shouldTouch: true });
        await trigger('prompt');
    }, [wrapMatchingWords, setValue, trigger]);

    useEffect(() => {
        if (!isOpen) {
            reset({ id: undefined, prompt: '', promptDescription: '', promptKey: '', isReadOnly: undefined });
            resetField('prompt');
        }
    }, [isOpen, reset, resetField]);

    useEffect(() => {
        (async () => {
            await handleEditorContentChange(editorContent);
        })();
    }, [editorContent, allIntellisenseValues, handleEditorContentChange]);

    const watchedPrompt = watch('prompt');
    useEffect(() => {
        const initialContent = watchedPrompt ?? '';
        const formattedInitialContent = initialContent.replaceAll(/{{|}}/g, '');
        setEditorContent(formattedInitialContent);

        setValue('prompt', initialContent, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
        });
    }, [watchedPrompt, setValue]);

    const { isLoading: createIsLoading, mutate: mutatePromptTemplate } = {
        isLoading: false,
        mutate: (data: IPromptTemplate) => {
            const stored = localStorage.getItem('mock_prompt_data');
            const currentData = stored ? JSON.parse(stored) : [];
            const newPrompt = {
                ...data,
                id: Math.random().toString(36).substring(2, 11),
            };
            const updated = [...currentData, newPrompt];
            localStorage.setItem('mock_prompt_data', JSON.stringify(updated));

            if (props?.onRefetch) {
                props.onRefetch();
            }
            queryClient.invalidateQueries(QueryKeyType.PROMPT);
            setLoading(false);
            setOpen(false);
            toast.success('Prompt Template saved successfully (Mock)');
        },
    };

    const { isLoading: updateIsLoading, mutate: mutateUpdatePromptTemplate } = {
        isLoading: false,
        mutate: ({ data, id }: { data: IPromptTemplate; id: string }) => {
            const stored = localStorage.getItem('mock_prompt_data');
            const currentData = stored ? JSON.parse(stored) : [];
            const updated = currentData.map((item: PromptTemplate) => (item.id === id ? { ...item, ...data } : item));
            localStorage.setItem('mock_prompt_data', JSON.stringify(updated));

            if (props?.onRefetch) {
                props.onRefetch();
            }
            queryClient.invalidateQueries(QueryKeyType.PROMPT);
            setLoading(false);
            setOpen(false);
            toast.success('Prompt Template updated successfully (Mock)');
        },
    };

    const { mutate: mutateDeletePromptTemplate } = {
        mutate: ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_prompt_data');
            const currentData = stored ? JSON.parse(stored) : [];
            const updated = currentData.filter((item: PromptTemplate) => item.id !== id);
            localStorage.setItem('mock_prompt_data', JSON.stringify(updated));

            queryClient.invalidateQueries(QueryKeyType.PROMPT);
            toast.success('Prompt Template deleted successfully (Mock)');
        },
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = promptTemplateConfigurationTableData.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('prompt', obj.prompt);
                setValue('promptDescription', obj.promptDescription);
                setValue('promptKey', obj.promptKey);
                setValue('isReadOnly', obj?.isReadOnly);
            }
        }
    };

    const getPromptViewData = (id: string) => {
        if (id) {
            const obj = promptTemplateConfigurationTableData.find(x => x.id === id);
            if (obj) {
                setSelectedPrompt(obj.prompt);
                setIsPromptViewModelOpen(true);
            }
        }
    };

    const onHandleSubmit = (data: IPromptTemplateForm) => {
        try {
            if (data.id) {
                const body: IPromptTemplate = {
                    name: data.promptKey,
                    description: data.promptDescription,
                    configurations: {
                        prompt_template: data.prompt,
                    },
                };
                mutateUpdatePromptTemplate({ data: body, id: data.id });
            } else {
                const body: IPromptTemplate = {
                    name: data.promptKey,
                    description: data.promptDescription,
                    configurations: {
                        prompt_template: data.prompt,
                    },
                };
                mutatePromptTemplate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your prompt template");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const { isFetching } = usePromptQuery({
        props,
        onSuccess: data => {
            mapPromptTemplates(data);
        },
        onError: () => {
            setPromptTemplateConfigurationTableData([]);
            setPromptTemplates([]);
        },
    });

    const {
        isLoading: loadingIntellisense,
        data: allIntellisense,
        refetch: refetchVariables,
    } = useQuery(
        'intellisense',
        () => {
            // Mock intellisense data
            return {
                tools: {
                    api: {
                        shared: [
                            { id: '1', name: 'GetCustomerDetails', description: 'Returns customer information' },
                            { id: '2', name: 'ProcessPayment', description: 'Initiates a payment transaction' },
                            { id: '3', name: 'SendNotification', description: 'Sends a push notification' },
                        ],
                    },
                    mcp: {
                        shared: [
                            {
                                id: '4',
                                name: 'GoogleSearch',
                                description: 'Search the web using Google',
                                selected_tools: ['search', 'list'],
                            },
                        ],
                    },
                    rag: {
                        shared: [{ id: '5', name: 'LegalDocuments', description: 'Search legal knowledge base' }],
                    },
                    graphRag: {
                        shared: [{ id: '6', name: 'UserNetwork', description: 'Analyze user social graph' }],
                    },
                    executableFunction: {
                        shared: [{ id: '7', name: 'CalculateMonthlyRevenue', description: 'Revenue aggregation' }],
                    },
                },
                variables: {
                    shared: [
                        { id: '8', name: 'firstName', description: "User's first name" },
                        { id: '9', name: 'orderAmount', description: 'Total price of the order' },
                        { id: '10', name: 'supportEmail', description: 'Company support email' },
                    ],
                },
                agents: {
                    shared: [
                        { id: '11', name: 'SupportBot', description: 'General support agent' },
                        { id: '12', name: 'SalesBot', description: 'Lead generation agent' },
                    ],
                },
                connectors: {
                    shared: [{ id: '13', name: 'Salesforce', description: 'CRM connection' }],
                },
            };
        },
        {
            enabled: true,
            refetchOnWindowFocus: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            select: (data: any) => ({
                api: data?.tools?.api?.shared
                    ?.filter((tool: ISharedItem) => tool?.name)
                    ?.map((tool: ISharedItem) => ({
                        label: tool.name,
                        value: `${IntellisenseTools.API}:${tool.name}`,
                    })),
                mcp:
                    data?.tools?.mcp?.shared
                        ?.filter((tool: ISharedItem) => tool?.selected_tools?.length != 0)
                        ?.flatMap(
                            (tool: ISharedItem) =>
                                tool.selected_tools?.map((selectedTool: string) => ({
                                    label: `${selectedTool}`,
                                    value: `${IntellisenseTools.MCP}:${selectedTool}`,
                                })) || []
                        ) || [],
                rag: data?.tools?.rag?.shared
                    ?.filter((tool: ISharedItem) => tool?.name)
                    ?.map((tool: ISharedItem) => ({
                        label: tool.name,
                        value: `${IntellisenseTools.VectorRAG}:${tool.name}`,
                    })),
                graphRag: data?.tools?.graphRag?.shared
                    ?.filter((tool: ISharedItem) => tool?.name)
                    ?.map((tool: ISharedItem) => ({
                        label: tool.name,
                        value: `${IntellisenseTools.GraphRAG}:${tool.name}`,
                    })),
                variables: data?.variables?.shared
                    ?.filter((variable: ISharedItem) => variable?.name)
                    ?.map((variable: ISharedItem) => ({
                        label: variable.name,
                        value: `${IntellisenseTools.Variable}:${variable.name}`,
                    })),
                agents: data?.agents?.shared
                    ?.filter((agent: ISharedItem) => agent?.name)
                    ?.map((agent: ISharedItem) => ({
                        label: agent.name,
                        value: `${IntellisenseTools.Agent}:${agent.name}`,
                    })),
                connectors: data?.connectors?.shared
                    ?.filter((connector: ISharedItem) => connector?.name)
                    ?.map((connector: ISharedItem) => ({
                        label: connector.name,
                        value: `${IntellisenseTools.DatabaseConnector}:${connector.name}`,
                    })),
                executableFunctions: data?.tools?.executableFunction?.shared
                    ?.filter((func: ISharedItem) => func?.name)
                    ?.map((func: ISharedItem) => ({
                        label: func.name,
                        value: `${IntellisenseTools.ExecutableFunction}:${func.name}`,
                    })),
            }),
        }
    );

    useEffect(() => {
        if (!allIntellisense) return;
        const allValues = Object.values(allIntellisense)
            .flat()
            .map(item => (item as { value: string }).value);

        setAllIntellisenseValues(allValues.filter((v): v is string => !!v));
    }, [allIntellisense, setAllIntellisenseValues]);

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense?.agents || !allIntellisense?.api || !allIntellisense?.variables) return [];

        return [
            {
                name: 'Agents',
                options: allIntellisense?.agents,
            },
            {
                name: 'APIs',
                options: allIntellisense?.api,
            },
            {
                name: 'MCPs',
                options: allIntellisense?.mcp,
            },
            {
                name: 'Vector RAGs',
                options: allIntellisense?.rag,
            },
            {
                name: 'Graph RAGs',
                options: allIntellisense?.graphRag,
            },
            {
                name: 'Database Connectors',
                options: allIntellisense?.connectors,
            },
            {
                name: 'Executable Functions',
                options: allIntellisense?.executableFunctions,
            },
            {
                name: 'Variables',
                options: allIntellisense?.variables,
            },
        ];
    }, [allIntellisense]);

    const mapPromptTemplates = (arr: PromptTemplate[]) => {
        const generateReadablePrompt = (prompt = '') => {
            const formattedInitialContent = prompt.replaceAll(/{{|}}/g, '');
            return formattedInitialContent;
        };
        const data = arr.map((x: PromptTemplate) => ({
            id: x.id,
            promptKey: x.name,
            promptDescription: x.description,
            prompt: generateReadablePrompt(x.configurations?.prompt_template),
            isReadOnly: x?.isReadOnly,
        }));
        setPromptTemplateConfigurationTableData(data);
        setPromptTemplates(data);
    };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        if (loading) return 'Verifying';
        return 'Save';
    };

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onPromptTemplateFilter = (filter: PromptTemplateData | null) => {
        let result = promptTemplates;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x.promptKey.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.promptKey)) {
            result = result.filter(x => x.promptKey.toLowerCase() === filter?.promptKey.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.promptDescription)) {
            result = result.filter(x => x.promptDescription.toLowerCase() === filter?.promptDescription.toLowerCase());
        }

        setPromptTemplateConfigurationTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeletePromptTemplate({ id });
        }
    };

    const handleEditorChange = (value: string) => {
        setEditorContent(value);
    };

    return {
        promptTemplateConfigurationDataCardInfo,
        promptTemplateConfigurationTableData,
        activityData,
        isFetching,
        errors,
        isOpen,
        isValid,
        isSaving: createIsLoading || updateIsLoading,
        isPromptViewModelOpen,
        selectedPrompt,
        isOpenModal,
        editorContent,
        intellisenseOptions: intellisenseOptions,
        loadingIntellisense,
        control,
        intelligentSource,
        setIsPromptViewModelOpen,
        bottomRef: ref,
        onPromptTemplateFilter,
        register,
        trigger,
        setValue,
        watch,
        handleSubmit,
        buttonText,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        getPromptViewData,
        setOpenModal,
        setEditorContent,
        handleEditorChange,
        refetchVariables,
        allIntellisenseValues,
    };
};
