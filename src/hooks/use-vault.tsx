import { VaultData } from '@/app/workspace/[wid]/vault/components/vault-table-container';
import { ActivityProps, DashboardDataCardProps } from '@/components';
import { QueryKeyType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { FormRule, IHookProps, IVault, IVaultForm } from '@/models';
import { validateField } from '@/utils/validation';
import { Unplug, Database, Link, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { useVaultQuery } from './use-common';
import { FetchError, logger } from '@/utils';

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
                API Execution
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

const secretKeyValidation = {
    required: validateField('Secret Key', { required: { value: true } }).required,
};

const secretDescriptionValidation = {
    required: validateField('Description', { required: { value: true } }).required,
};

export const useVault = (props?: IHookProps) => {
    const queryClient = useQueryClient();
    const [isOpen, setOpen] = useState<boolean>(false);
    const [apiConfigurationDataCardInfo] = useState<DashboardDataCardProps[]>(
        initWorkspaceDataCardInfo
    );
    const [vaultData, setVaultData] = useState<VaultData[]>([]);
    const [secrets, setSecrets] = useState<VaultData[]>([]);
    const [secretValueValidation, setSecretValueValidation] = useState<FormRule>({
        required: { value: true, message: 'Please enter a secret value' },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        watch,
    } = useForm<IVaultForm>({
        mode: 'all',
    });

    const { isFetching } = useVaultQuery({
        props,
        onSuccess: data => {
            const mapData = data?.map(x => ({
                id: x.id as string,
                vaultKey: x.keyName,
                vaultDescription: x.description,
                isReadOnly: x?.isReadOnly,
            }));
            setVaultData([...mapData]);
            setSecrets([...mapData]);
        },
        onError: () => {
            setVaultData([]);
            setSecrets([]);
        },
    });

    useEffect(() => {
        if (!isOpen) {
            reset({ id: undefined, vaultDescription: '', vaultKey: '', vaultValue: '', isReadOnly: undefined });
        }
    }, [isOpen, reset]);

    const {
        mutate: mutateVault,
        isError: createIsError,
        isLoading: creating,
        isSuccess,
    } = useMutation(
        async (data: IVault) => {
            const stored = localStorage.getItem('mock_vault_data');
            const vault = stored ? JSON.parse(stored) : [];
            const newSecret = { ...data, id: `mock-vault-${Date.now()}` };
            vault.push(newSecret);
            localStorage.setItem('mock_vault_data', JSON.stringify(vault));
            return newSecret;
        },
        {
            onSuccess: data => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                if (props?.onChange) {
                    const fakeEvent = {
                        target: {
                            value: data?.keyName,
                            name: props?.data ?? '',
                        },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    props?.onChange(fakeEvent);
                }
                queryClient.invalidateQueries(QueryKeyType.VAULT);
                setOpen(false);
                toast.success('Vault saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Vault:', error?.message);
            },
        }
    );

    const {
        mutate: mutateUpdateVault,
        isError: updateIsError,
        isLoading: updating,
    } = useMutation(
        async ({ data, id }: { data: IVault; id: string }) => {
            const stored = localStorage.getItem('mock_vault_data');
            const vault = stored ? JSON.parse(stored) : [];
            const index = vault.findIndex((x: IVault) => x.id === id);
            if (index > -1) {
                vault[index] = { ...vault[index], ...data, id };
                localStorage.setItem('mock_vault_data', JSON.stringify(vault));
            }
            return { data: vault[index], id };
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.VAULT);
                setOpen(false);
                toast.success('Vault updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Vault:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteVault } = useMutation(
        async ({ id }: { id: string }) => {
            const stored = localStorage.getItem('mock_vault_data');
            const vault = stored ? JSON.parse(stored) : [];
            const filtered = vault.filter((x: IVault) => x.id !== id);
            localStorage.setItem('mock_vault_data', JSON.stringify(filtered));
            return { id };
        },
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.VAULT);
                toast.success('Vault deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Vault:', error?.message);
            },
        }
    );

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const onHandleSubmit = (data: IVaultForm) => {
        try {
            if (data?.id) {
                const body: IVault = {
                    keyValue: data.vaultValue,
                    description: data.vaultDescription,
                };
                mutateUpdateVault({ data: body, id: data.id as string });
            } else {
                const body: IVault = {
                    keyName: data.vaultKey,
                    description: data.vaultDescription,
                    keyValue: data.vaultValue,
                    isActive: true,
                };
                mutateVault(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your secret");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onVaultFilter = (filter: VaultData | null) => {
        let result = secrets;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x?.vaultKey?.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }
        if (!isNullOrEmpty(filter?.vaultKey)) {
            result = result.filter(x => x?.vaultKey?.toLowerCase() === filter?.vaultKey?.toLowerCase());
        }
        if (!isNullOrEmpty(filter?.vaultDescription)) {
            result = result.filter(x => x.vaultDescription.toLowerCase() === filter?.vaultDescription.toLowerCase());
        }

        setVaultData(result);
    };

    const validateVault = (value: string, text: string) => {
        if (value) {
            if (value.startsWith(' ')) {
                return `No leading spaces in ${text}`;
            }
            if (value.endsWith(' ')) {
                return `No trailing spaces in ${text}`;
            }
        }
        return true;
    };

    const onEdit = (id: string) => {
        if (id) {
            const obj = secrets.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('vaultDescription', obj.vaultDescription);
                setValue('vaultKey', obj?.vaultKey ?? '');
                setValue('isReadOnly', obj?.isReadOnly);
            }
        }
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteVault({ id });
        }
    };

    return {
        isOpen,
        apiConfigurationDataCardInfo,
        activityData,
        isFetching,
        secretKeyValidation,
        secretDescriptionValidation,
        secretValueValidation,
        vaultData,
        errors,
        hasFormError: createIsError || updateIsError,
        isValid,
        isSaving: creating || updating,
        isSuccess,
        bottomRef: ref,
        onVaultFilter,
        register,
        watch,
        handleSubmit,
        onHandleSubmit,
        validateVault,
        setOpen,
        onEdit,
        onDelete,
        setSecretValueValidation,
    };
};
