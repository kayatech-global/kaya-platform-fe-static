import { ReRankingData } from '@/app/workspace/[wid]/intelligence-enhancers/re-ranking-models/components/re-ranking-model-config-table-container';
import { OptionModel } from '@/components';
import { isNullOrEmpty } from '@/lib/utils';
import { IProvider, IHookProps } from '@/models';
import { IReRanking } from '@/models/re-ranking.models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { usePlatformQuery, useReRankingModelQuery, useVaultQuery } from './use-common';
import { QueryKeyType } from '@/enums';
import { reRankingModelService } from '@/services';

export const useReRankingModelConfiguration = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [reRankingTableData, setReRankingTableData] = useState<ReRankingData[]>([]);
    const [reRankings, setReRankings] = useState<ReRankingData[]>([]);
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const [secrets, setSecrets] = useState<OptionModel[]>([]);
    const [providers, setProviders] = useState<IProvider[]>([]);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
        control,
    } = useForm<IReRanking>({ mode: 'all' });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
                provider: '',
                modelName: '',
                configurations: {
                    apiKey: '',
                    baseURL: '',
                },
                isReadOnly: undefined,
                modelNameOption: undefined,
            });
        }
    }, [isOpen]);

    const { isFetching } = useReRankingModelQuery({
        props,
        onSuccess: data => {
            setReRankingTableData([...data]);
            setReRankings([...data]);
        },
        onError: () => {
            setReRankingTableData([]);
            setReRankings([]);
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

    usePlatformQuery({
        queryKey: 'providers',
        onSuccess: data => {
            setProviders(JSON.parse(data.rerankingModelProviders));
        },
        onError: () => {
            setProviders([]);
        },
    });

    const { mutate: mutateCreate, isLoading: creating } = useMutation(
        (data: IReRanking) => reRankingModelService.create<IReRanking>(data, params.wid as string),
        {
            onSuccess: data => {
                if (props?.hookForm?.formName && props?.hookForm?.setValue) {
                    props.hookForm.setValue(props.hookForm.formName, data.id);
                }
                if (props?.onRefetch) {
                    props.onRefetch(data.id);
                }
                queryClient.invalidateQueries(QueryKeyType.RE_RANKING_MODEL);
                setOpen(false);
                toast.success('Re-ranking model saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating re-ranking model:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdate, isLoading: updating } = useMutation(
        ({ data, id }: { data: IReRanking; id: string }) =>
            reRankingModelService.update<IReRanking>(data, params.wid as string, id),
        {
            onSuccess: () => {
                if (props?.onRefetch) {
                    props.onRefetch();
                }
                queryClient.invalidateQueries(QueryKeyType.RE_RANKING_MODEL);
                setOpen(false);
                toast.success('Re-ranking model updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating re-ranking model:', error?.message);
            },
        }
    );

    const { mutate: mutateDelete } = useMutation(
        async ({ id }: { id: string }) => await reRankingModelService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.RE_RANKING_MODEL);
                toast.success('Re-ranking model deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Re-ranking model:', error?.message);
            },
        }
    );

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const onEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setOpen(true);
            const obj = reRankings?.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('description', obj.description);
                setValue('provider', obj.provider);
                setValue('modelName', obj.modelName);
                setValue('configurations', obj.configurations);
                const originalProvider = providers?.find(x => x.value === obj.provider);
                if (originalProvider) {
                    const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
                    if (originalModel) {
                        setValue('modelNameOption', { label: originalModel.value, value: originalModel.value });
                    } else {
                        setValue('modelNameOption', { label: obj.modelName, value: obj.modelName });
                    }
                }
            }
        }
    };

    const onHandleSubmit = (data: IReRanking) => {
        try {
            const body: IReRanking = {
                name: data.name,
                description: data.description,
                provider: data.provider,
                modelName: data?.modelNameOption?.value as string,
                configurations: {
                    apiKey: data.configurations.apiKey,
                    baseURL: data.configurations.baseURL,
                },
            };
            if (data.id) {
                mutateUpdate({ data: body, id: data.id });
            } else {
                mutateCreate(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your re-ranking model");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    const onReRankingFilter = (filter: ReRankingData | null) => {
        let result = reRankings;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x => x.name.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string));
        }
        if (!isNullOrEmpty(filter?.provider)) {
            result = result.filter(x => x.provider.toLowerCase() === filter?.provider.toLowerCase());
        }

        setReRankingTableData(result);
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDelete({ id });
        }
    };

    return {
        reRankingTableData,
        isFetching,
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving: creating || updating,
        loadingSecrets,
        isEdit,
        control,
        onReRankingFilter,
        register,
        watch,
        setValue,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        handleCreate,
        onEdit,
        setOpen,
        onDelete,
        refetch,
    };
};
