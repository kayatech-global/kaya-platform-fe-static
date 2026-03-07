import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { TableDataType } from '@/app/workspace/[wid]/configure-connections/databases/components/database-table';
import { IDatabase, IDatabaseConfigurations, IHookProps } from '@/models';
import { FetchError, logger } from '@/utils';
import { getEnumKeyByValue, getEnumValueByKey, isNullOrEmpty } from '@/lib/utils';
import { toast } from 'sonner';
import { DATABASE_LIST } from '@/constants';
import { DatabaseItemType, DatabaseProviderType, QueryKeyType } from '@/enums';
import { OptionModel } from '@/components';
import { useDatabaseQuery, useVaultQuery } from './use-common';
import { databaseService } from '@/services';
import { REDSHIFT_AUTH } from '@/app/workspace/[wid]/configure-connections/databases/components/database-types/redshift-extras';

export const useDatabase = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [databaseData, setDatabaseData] = useState<TableDataType[]>([]);
    const [databases, setDatabases] = useState<TableDataType[]>([]);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const {
        register,
        watch,
        setValue,
        reset,
        handleSubmit,
        formState: { errors, isValid },
        clearErrors,
        control,
    } = useForm<IDatabase>({
        mode: 'all',
        defaultValues: {
            configurations: {
                port: 5432,
            },
        },
    });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                type: '',
                updatedAt: undefined,
                isReadOnly: undefined,
                configurations: {
                    provider: undefined,
                    endpoint: undefined,
                    databaseName: undefined,
                    host: undefined,
                    port: undefined,
                    userName: undefined,
                    password: undefined,
                    apiKey: undefined,
                    tenantId: undefined,
                    region: undefined,
                    useHttps: undefined,
                    useIamAuth: undefined,
                    awsAccessKeyId: undefined,
                    awsSecretAccessKeyId: undefined,
                    secretKey: undefined,
                    accessKey: undefined,
                    timeoutSec: undefined,
                },
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isEdit && watch('type')) {
            const obj = data?.find(x => x.id === watch('id'));
            if (obj) {
                const providerByKey = getEnumValueByKey(
                    obj.configurations.provider,
                    DatabaseProviderType
                ) as DatabaseProviderType;
                const providers = DATABASE_LIST.find(x => x.type === watch('type'))?.providers;
                const currentProvider = providers?.includes(providerByKey);
                setValue('configurations.provider', currentProvider ? providerByKey : '');
                setValue('configurations.endpoint', currentProvider ? obj.configurations.endpoint : '');
                setValue('configurations.databaseName', currentProvider ? obj.configurations.databaseName : '');
                setValue('configurations.host', currentProvider ? obj.configurations.host : '');
                setValue('configurations.port', currentProvider ? obj.configurations.port : undefined);
                setValue('configurations.userName', currentProvider ? obj.configurations.userName : '');
                setValue('configurations.password', currentProvider ? obj.configurations.password : '');
                setValue('configurations.apiKey', currentProvider ? obj.configurations.apiKey : '');
                setValue('configurations.tenantId', currentProvider ? obj.configurations.tenantId : '');
                setValue('configurations.region', currentProvider ? obj.configurations.region : '');
                setValue('configurations.useHttps', currentProvider ? obj.configurations.useHttps : undefined);
                setValue('configurations.useIamAuth', currentProvider ? obj.configurations.useIamAuth : undefined);
                setValue('configurations.accessKey', currentProvider ? obj.configurations.accessKey : undefined);
                setValue('configurations.secretKey', currentProvider ? obj.configurations.secretKey : undefined);
                setValue('configurations.timeoutSec', currentProvider ? obj.configurations.timeoutSec : null);
                setValue('configurations.ssl', currentProvider ? obj.configurations.ssl : false);

                const provider = getEnumValueByKey(
                    obj?.configurations?.provider,
                    DatabaseProviderType
                ) as DatabaseProviderType;
                if (provider === DatabaseProviderType.REDSHIFT) {
                    setValue('configurations.awsAccessKeyId', currentProvider ? obj.configurations.accessKey : '');
                    setValue(
                        'configurations.awsSecretAccessKeyId',
                        currentProvider ? obj.configurations.secretKey : ''
                    );
                } else {
                    setValue('configurations.awsAccessKeyId', currentProvider ? obj.configurations.awsAccessKeyId : '');
                    setValue(
                        'configurations.awsSecretAccessKeyId',
                        currentProvider ? obj.configurations.awsSecretAccessKeyId : ''
                    );
                }
                clearErrors([
                    'configurations.provider',
                    'configurations.endpoint',
                    'configurations.databaseName',
                    'configurations.host',
                    'configurations.port',
                    'configurations.userName',
                    'configurations.password',
                    'configurations.apiKey',
                    'configurations.tenantId',
                    'configurations.region',
                    'configurations.useHttps',
                    'configurations.useIamAuth',
                    'configurations.awsAccessKeyId',
                    'configurations.awsSecretAccessKeyId',
                    'configurations.accessKey',
                    'configurations.secretKey',
                    'configurations.timeoutSec',
                    'configurations.ssl',
                ]);
            }
        } else {
            setValue('configurations.provider', '');
            setValue('configurations.endpoint', '');
            setValue('configurations.databaseName', '');
            setValue('configurations.host', '');
            setValue('configurations.port', 5432);
            setValue('configurations.userName', '');
            setValue('configurations.password', '');
            setValue('configurations.apiKey', '');
            setValue('configurations.tenantId', '');
            setValue('configurations.region', '');
            setValue('configurations.useHttps', undefined);
            setValue('configurations.useIamAuth', undefined);
            setValue('configurations.awsAccessKeyId', '');
            setValue('configurations.awsSecretAccessKeyId', '');
            setValue('configurations.accessKey', '');
            setValue('configurations.secretKey', '');
            setValue('configurations.timeoutSec', null);
            setValue('configurations.ssl', undefined);
            clearErrors([
                'configurations.provider',
                'configurations.endpoint',
                'configurations.databaseName',
                'configurations.host',
                'configurations.port',
                'configurations.userName',
                'configurations.password',
                'configurations.apiKey',
                'configurations.tenantId',
                'configurations.region',
                'configurations.useHttps',
                'configurations.useIamAuth',
                'configurations.awsAccessKeyId',
                'configurations.awsSecretAccessKeyId',
                'configurations.accessKey',
                'configurations.secretKey',
                'configurations.timeoutSec',
                'configurations.ssl',
            ]);
        }
    }, [watch('type'), isEdit]);

    useEffect(() => {
        if (!isEdit && isOpen && watch('configurations.provider') && watch('configurations.provider') !== '') {
            if (watch('configurations.provider') === DatabaseProviderType.PGVECTOR) {
                setValue('configurations.port', 5432);
            } else if (watch('configurations.provider') === DatabaseProviderType.POSTGRESQL) {
                setValue('configurations.port', 5432);
            } else if (watch('configurations.provider') === DatabaseProviderType.MYSQL) {
                setValue('configurations.port', 3306);
            } else if (watch('configurations.provider') === DatabaseProviderType.REDSHIFT) {
                setValue('configurations.port', 5439);
            }
        }
    }, [watch('configurations.provider'), isEdit, isOpen]);

    const { isFetching, data } = useDatabaseQuery({
        props,
        onSuccess: data => {
            const mapData = data?.map(x => ({
                id: x.id as string,
                name: x.name,
                connectorSource: x.type as DatabaseItemType,
                lastSync: x.updatedAt as string,
                isReadOnly: x?.isReadOnly,
            }));
            setDatabaseData([...mapData]);
            setDatabases([...mapData]);
        },
        onError: () => {
            setDatabaseData([]);
            setDatabases([]);
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

    const selectedDatabase = useMemo(() => {
        if (watch('type')) {
            return DATABASE_LIST.find(x => x.type === watch('type'));
        }
        return undefined;
    }, [watch('type')]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        (data: IDatabase) => databaseService.create<IDatabase>(data, params.wid as string),
        {
            onSuccess: data => {
                if (props?.hookForm?.formName && props?.hookForm?.setValue) {
                    props.hookForm.setValue(props.hookForm.formName, data.id);
                }
                if (props?.onRefetch) {
                    props.onRefetch(data?.id);
                }
                queryClient.invalidateQueries(QueryKeyType.DATABASE);
                setIsOpen(false);
                toast.success('Database saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Database:', error?.message);
            },
        }
    );

    const { isLoading: updating, mutate: mutateUpdate } = useMutation(
        ({ data, id }: { data: IDatabase; id: string }) =>
            databaseService.update<IDatabase>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.DATABASE);
                setIsOpen(false);
                toast.success('Database updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Database:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => await databaseService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.DATABASE);
                toast.success('Database deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Database:', error?.message);
            },
        }
    );

    const handleCreate = () => {
        setEdit(false);
        setIsOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setIsOpen(true);
            const obj = data?.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('type', getEnumValueByKey(obj.type, DatabaseItemType) as DatabaseItemType);
                setValue('configurations', obj.configurations);
                setValue(
                    'configurations.provider',
                    getEnumValueByKey(obj.configurations.provider, DatabaseProviderType) as DatabaseProviderType
                );

                const provider = getEnumValueByKey(
                    obj.configurations.provider,
                    DatabaseProviderType
                ) as DatabaseProviderType;
                if (provider === DatabaseProviderType.REDSHIFT) {
                    setValue('configurations.awsAccessKeyId', obj.configurations.accessKey);
                    setValue('configurations.awsSecretAccessKeyId', obj.configurations.secretKey);
                }
            }
        }
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    const onDatabaseFilter = (filter: TableDataType | null) => {
        let result = databaseData;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x?.name?.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }

        setDatabases(result);
    };

    const mapConfigurations = (data: IDatabase) => {
        const providerKey = getEnumKeyByValue(data.configurations.provider, DatabaseProviderType);
        if (data.type === DatabaseItemType.VECTOR) {
            const provider = data.configurations.provider;
            if (provider === DatabaseProviderType.PGVECTOR) {
                return {
                    provider: providerKey,
                    host: data.configurations.host,
                    port: data.configurations.port,
                    databaseName: data.configurations.databaseName,
                    userName: data.configurations.userName,
                    password: data.configurations.password,
                } as IDatabaseConfigurations;
            }
            return {
                provider: providerKey,
                tenantId: data.configurations.tenantId,
                databaseName: data.configurations.databaseName,
                apiKey: data.configurations.apiKey,
            } as IDatabaseConfigurations;
        } else if (data.type === DatabaseItemType.GRAPH) {
            const provider = data.configurations.provider;
            if (provider === DatabaseProviderType.AMAZONNEPTUNE) {
                return {
                    provider: providerKey,
                    databaseName: data.configurations.databaseName,
                    host: data.configurations.host,
                    port: data.configurations.port,
                    useHttps: data.configurations.useHttps,
                    useIamAuth: data.configurations.useIamAuth,
                    region: data.configurations.region,
                    awsAccessKeyId: data.configurations.awsAccessKeyId,
                    awsSecretAccessKeyId: data.configurations.awsSecretAccessKeyId,
                } as IDatabaseConfigurations;
            }
            return {
                provider: providerKey,
                databaseName: data.configurations.databaseName,
                endpoint: data.configurations.endpoint,
                userName: data.configurations.userName,
                password: data.configurations.password,
            } as IDatabaseConfigurations;
        } else if (data.type === DatabaseItemType.RELATIONAL) {
            const provider = data.configurations.provider;
            if (provider === DatabaseProviderType.REDSHIFT) {
                return {
                    provider: providerKey,
                    host: data.configurations.host,
                    port: data.configurations.port,
                    databaseName: data.configurations.databaseName,
                    userName: data.configurations.userName,
                    password: data.configurations.password,
                    region: data.configurations.region,
                    isServerless: data.configurations.isServerless,
                    workgroupName: data.configurations.workgroupName,
                    clusterIdentifier: data.configurations.clusterIdentifier,
                    authMethod: data.configurations.authMethod,
                    accessKey:
                        data.configurations.authMethod === REDSHIFT_AUTH.ACCESS_KEYS
                            ? data.configurations.awsAccessKeyId
                            : undefined,
                    secretKey:
                        data.configurations.authMethod === REDSHIFT_AUTH.ACCESS_KEYS
                            ? data.configurations.awsSecretAccessKeyId
                            : undefined,
                    timeoutSec: isNullOrEmpty(data.configurations.timeoutSec)
                        ? undefined
                        : data.configurations.timeoutSec,
                    ssl: data.configurations.ssl,
                    idp_host:
                        data.configurations.authMethod === REDSHIFT_AUTH.SSO ? data.configurations.idp_host : undefined,
                    principal_arn:
                        data.configurations.authMethod === REDSHIFT_AUTH.SSO
                            ? data.configurations.principal_arn
                            : undefined,
                    preferred_role:
                        data.configurations.authMethod === REDSHIFT_AUTH.SSO
                            ? data.configurations.preferred_role
                            : undefined,
                    credential_provider:
                        data.configurations.authMethod === REDSHIFT_AUTH.SSO
                            ? data.configurations.credential_provider
                            : undefined,
                } as IDatabaseConfigurations;
            }
            return {
                provider: providerKey,
                databaseName: data.configurations.databaseName,
                host: data.configurations.host,
                port: data.configurations.port,
                userName: data.configurations.userName,
                password: data.configurations.password,
            } as IDatabaseConfigurations;
        }
        return {
            provider: providerKey,
            endpoint: data.configurations.endpoint,
            databaseName: data.configurations.databaseName,
        } as IDatabaseConfigurations;
    };

    const onHandleSubmit = (data: IDatabase) => {
        try {
            const type = getEnumKeyByValue(data.type, DatabaseItemType);
            const body: IDatabase = {
                name: data.name,
                description: data.description,
                type: type as string,
                configurations: mapConfigurations(data),
            };
            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your database");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    return {
        isFetching,
        databases,
        isOpen,
        selectedDatabase,
        errors,
        isReadOnly,
        isEdit,
        secrets,
        loadingSecrets,
        isSaving: creating || updating,
        isValid,
        control,
        setIsOpen,
        register,
        watch,
        setValue,
        setEdit,
        refetch,
        handleCreate,
        onEdit,
        onDelete,
        handleSubmit,
        onDatabaseFilter,
        onHandleSubmit,
    };
};
