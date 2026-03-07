'use client';
import { IntellisenseTools } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { OptionModel } from '@/components';
import { useAuth } from '@/context';
import { useApp } from '@/context/app-context';
import { DatabaseItemType, IConnectorAuthorizationType, QueryKeyType } from '@/enums';
import { getEnumKeyByValue, isNullOrEmpty } from '@/lib/utils';
import { ConnectorType, IConnectorForm, IHookProps, ISharedItem } from '@/models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { useConnectorQuery, useDatabaseQuery, useVaultQuery } from './use-common';
import { connectorService, promptService } from '@/services';

export const connectorLogo = {
    [ConnectorType.Pega]: '/png/connectors/pega.png',
    // [ConnectorType.GoogleDrive]: '/png/connectors/gdrive.png',
    // [ConnectorType.Salesforce]: '/png/connectors/Salesforce.png',
    // [ConnectorType.SharePoint]: '/png/connectors/SharePoint.png',
    // [ConnectorType.JIRA]: '/png/connectors/Jira.png',
};

export const defaultConnectorValues: IConnectorForm = {
    id: undefined,
    name: '',
    description: '',
    type: undefined,
    configurations: {
        authorization: {
            authType: IConnectorAuthorizationType.NoAuthorization,
        },
    },
    isReadOnly: false,
    search: '',
};

export const useConnector = (props?: IHookProps) => {
    const params = useParams();
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { intelligentSource } = useApp();

    const [loading, setLoading] = useState<boolean>(false);
    const [connectorsTableData, setconnectorsTableData] = useState<IConnectorForm[]>([]);
    const [connectors, setconnectors] = useState<IConnectorForm[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const [allIntellisenseValues, setAllIntellisenseValues] = useState<string[]>([]);
    const [editorContent, setEditorContent] = useState<string>('');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
        trigger,
    } = useForm<IConnectorForm>({
        mode: 'all',
        defaultValues: defaultConnectorValues,
    });

    const connectorType = watch('type');

    const {
        isLoading: loadingDatabases,
        data: databases,
        refetch: refetchDatabase,
    } = useDatabaseQuery({
        queryKey: [QueryKeyType.DATABASE, connectorType],
        select: data => {
            // Filter databases based on connector type
            if (
                connectorType === ConnectorType.MySQL ||
                connectorType === ConnectorType.PostgreSQL ||
                connectorType === ConnectorType.SQLite
            ) {
                return data.filter(x => x?.type === getEnumKeyByValue(DatabaseItemType.RELATIONAL, DatabaseItemType));
            }
            // For other connector types or when no type is selected, return all databases
            return data;
        },
    });

    const { refetch: onRefetchConnector, isFetching } = useConnectorQuery({
        props,
        onSuccess: data => {
            setconnectors(data);
            setconnectorsTableData(data);
        },
        onError: () => {
            setconnectorsTableData([]);
            setconnectors([]);
        },
    });

    const {
        isLoading: loadingIntellisense,
        data: allIntellisense,
        refetch: refetchVariables,
    } = useQuery('intellisense', () => promptService.intellisense(params.wid as string), {
        enabled: !!token,
        refetchOnWindowFocus: false,
        select: data => ({
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
                            })) ?? []
                    ) ?? [],
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
                    type: variable.type,
                })),
            agents: data?.agents?.shared
                ?.filter((agent: ISharedItem) => agent?.name)
                ?.map((agent: ISharedItem) => ({
                    label: agent.name,
                    value: `${IntellisenseTools.Agent}:${agent.name}`,
                })),
        }),
    });

    const { isLoading: updateIsLoading, mutate: mutateUpdate } = useMutation(
        ({ data, id }: { data: IConnectorForm; id: string }) =>
            connectorService.update<IConnectorForm>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.CONNECTORS);
                setLoading(false);
                setIsOpen(false);
                toast.success('Connectors updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Connectors:', error?.message);
            },
        }
    );

    const { isLoading: createIsLoading, mutate: mutateCreate } = useMutation(
        (data: IConnectorForm) => connectorService.create<IConnectorForm>(data, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.CONNECTORS);
                setLoading(false);
                setIsOpen(false);
                toast.success('Connectors saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Connectors:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteConnector } = useMutation(
        async ({ id }: { id: string }) => await connectorService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.CONNECTORS);
                toast.success('Connectors deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Connectors:', error?.message);
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

    const intellisenseOptions = useMemo(() => {
        if (!allIntellisense?.agents || !allIntellisense?.api || !allIntellisense?.variables) return [];

        const allValues = Object.values(allIntellisense)
            .flat()
            .map(item => item.value);

        setAllIntellisenseValues(allValues);

        return [
            {
                name: 'Variables',
                options: allIntellisense?.variables,
            },
        ];
    }, [allIntellisense]);

    const onFilter = (filter: IConnectorForm | null) => {
        let result = connectors;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.name)) {
            result = result.filter(x => x.name.toLowerCase() === filter?.name.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.type)) {
            result = result.filter(x => x.type?.toLowerCase() === filter?.type?.toLowerCase());
        }

        const url = filter?.configurations?.authorization?.meta?.tokenEndpointURL;
        if (!isNullOrEmpty(url ?? '')) {
            result = result.filter(
                x => x.configurations?.authorization?.meta?.tokenEndpointURL?.toLowerCase() === url?.toLowerCase()
            );
        }

        setconnectorsTableData(result);
    };

    const onHandleSubmit = (data: IConnectorForm) => {
        if (data?.configurations?.authorization?.authType == IConnectorAuthorizationType.clientCredentials) {
            if (data.configurations.authorization.meta) {
                data.configurations.authorization.meta.passwordReference = undefined;
                data.configurations.authorization.meta.username = undefined;
            }
        }
        try {
            if (data.id) {
                mutateUpdate({ data, id: data.id });
            } else {
                mutateCreate(data);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your Connector");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onEdit = (id: string) => {
        if (!id) return null;

        const obj = connectorsTableData.find(x => x.id === id);

        if (!obj) return null;

        setValue('id', obj?.id);
        setValue('name', obj?.name);
        setValue('description', obj?.description);
        setValue('type', obj?.type);
        setValue('isReadOnly', obj?.isReadOnly);
        setValue('configurations', obj?.configurations);
        setValue('configurations.databaseId', obj?.configurations.databaseId);

        // Set editor content only for parameterized query (Monaco editor)
        // const parameterizedQuery = obj?.configurations?.parameterizedQuery;
        // if (parameterizedQuery) {
        //     const formattedContent = parameterizedQuery.replace(/{{|}}/g, '');
        //     setEditorContent(formattedContent);
        // } else {
        //     setEditorContent('');
        // }
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteConnector({ id });
        }
    };

    // const wrapMatchingWords = (value: string): string => {
    //     if (!value) return value;

    //     const sortedWords = [...allIntellisenseValues].sort((a, b) => b.length - a.length);

    //     for (const word of sortedWords) {
    //         const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    //         const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
    //         value = value.replace(regex, `{{${word}}}`);
    //     }

    //     return value;
    // };

    // const handleEditorContentChange = async (value: string) => {
    //     const updatedValue = wrapMatchingWords(value);
    //     setValue('configurations.parameterizedQuery', updatedValue, { shouldTouch: true });
    //     await trigger('configurations.parameterizedQuery');
    // };

    const buttonText = () => {
        if (isFetching) return 'Please Wait';
        if (createIsLoading || updateIsLoading) return 'Saving';
        if (loading) return 'Verifying';

        return 'Save';
    };

    const handleEditorChange = (value: string) => {
        setEditorContent(value);
    };

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    useEffect(() => {
        if (!isOpen) {
            reset(defaultConnectorValues);
            setEdit(false);
            setEditorContent('');
        }
    }, [isOpen, reset]);

    // useEffect(() => {
    //     const initialContent = watch('configurations.parameterizedQuery') || '';
    //     const formattedInitialContent = initialContent.replace(/{{|}}/g, '');
    //     setEditorContent(formattedInitialContent);

    //     setValue('configurations.parameterizedQuery', initialContent, {
    //         shouldValidate: true,
    //         shouldTouch: true,
    //         shouldDirty: true,
    //     });
    // }, [watch('configurations.parameterizedQuery')]);

    // useEffect(() => {
    //     (async () => {
    //         await handleEditorContentChange(editorContent);
    //     })();
    // }, [editorContent]);

    // const isEdit = useMemo(() => !!watch('id'), [watch('id')]);

    return {
        connectorsTableData,
        connectors,
        setconnectors,
        isOpen,
        setIsOpen,
        isEdit,
        setEdit,
        secrets,
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        errors,
        isValid,
        refetch,
        loadingSecrets,
        onFilter,
        onHandleSubmit,
        onEdit,
        onDelete,
        buttonText,
        isSaving: createIsLoading || updateIsLoading,
        isFetching,
        bottomRef: ref,
        loadingIntellisense,
        refetchVariables,
        intellisenseOptions: intellisenseOptions as never[],
        allIntellisenseValues,
        handleEditorChange,
        editorContent,
        setEditorContent,
        intelligentSource,
        trigger,
        refetchDatabase,
        databases,
        onRefetchConnector,
        loadingDatabases,
    };
};
