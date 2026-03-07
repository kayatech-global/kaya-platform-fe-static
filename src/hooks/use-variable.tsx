import { VariableData } from '@/app/workspace/[wid]/variables/components/variable-table-container';
import { ActivityProps } from '@/components';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty } from '@/lib/utils';
import { IHookProps, IVariable } from '@/models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { useVariableQuery } from './use-common';
import { QueryKeyType } from '@/enums';
import { variableService } from '@/services';

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

export const useVariable = (props?: IHookProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isEdit, setEdit] = useState<boolean>(false);
    const variablePageRef = useRef<HTMLDivElement | null>(null);
    const [variablePageHeighInDrawer, setVariablePageHeighInDrawer] = useState<number | undefined>(undefined);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [variableTableData, setVariableTableData] = useState<VariableData[]>([]);
    const [variables, setVariables] = useState<VariableData[]>([]);
    const [newRecord, setNewRecord] = useState<IVariable | undefined>(undefined);

    const {
        register,
        watch,
        formState: { isValid, errors },
        reset,
        setValue,
        handleSubmit,
        control,
    } = useForm<IVariable>({
        mode: 'all',
        defaultValues: {
            id: undefined,
            name: '',
            dataType: '',
            description: '',
            isReadOnly: false,
        },
    });

    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                dataType: '',
                description: '',
                isReadOnly: false,
            });
        }
    }, [isOpen, reset]);

    const { isFetching } = useVariableQuery({
        props,
        onSuccess: data => {
            const mapData = data?.map(x => ({
                id: x.id as string,
                name: x.name,
                dataType: x.dataType,
                description: x.description,
                isReadOnly: x?.isReadOnly,
            }));
            setVariableTableData([...mapData]);
            setVariables([...mapData]);
        },
        onError: () => {
            setVariableTableData([]);
            setVariables([]);
        },
    });

    const { mutate: mutateVariable, isLoading: creating } = useMutation(
        (data: IVariable) => variableService.create<IVariable>(data, params.wid as string),
        {
            onSuccess: data => {
                setNewRecord(data);
                if (props?.onRefetchVariables) {
                    props.onRefetchVariables();
                }
                queryClient.invalidateQueries(QueryKeyType.VARIABLE);
                setOpen(false);
                toast.success('Variable saved successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error creating Variable:', error?.message);
            },
        }
    );

    const { mutate: mutateUpdateVariable, isLoading: updating } = useMutation(
        ({ data, id }: { data: IVariable; id: string }) =>
            variableService.update<IVariable>(data, params.wid as string, id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.VARIABLE);
                setOpen(false);
                toast.success('Variable updated successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error updating Variable:', error?.message);
            },
        }
    );

    const { mutate: mutateDeleteVariable } = useMutation(
        async ({ id }: { id: string }) => await variableService.delete(id, params.wid as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(QueryKeyType.VARIABLE);
                toast.success('Variable deleted successfully');
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error deleting Variable:', error?.message);
            },
        }
    );

    const { ref } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    const handleClick = () => {
        setVariablePageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        if (id) {
            setEdit(true);
            setOpen(true);
            const obj = variables.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('name', obj.name);
                setValue('dataType', obj.dataType);
                setValue('description', obj.description);
                setValue('isReadOnly', obj?.isReadOnly);
            }
        }
    };

    const onDelete = (id: string) => {
        if (id) {
            mutateDeleteVariable({ id });
        }
    };

    const onVariableFilter = (filter: VariableData | null) => {
        let result = variables;

        if (!isNullOrEmpty(filter?.search)) {
            result = result.filter(x =>
                x?.name?.toLowerCase().includes(filter?.search?.toLowerCase()?.trim() as string)
            );
        }

        setVariableTableData(result);
    };

    const onHandleSubmit = (data: IVariable) => {
        try {
            setNewRecord(undefined);
            const body: IVariable = {
                name: data.name,
                dataType: data.dataType,
                description: data.description,
            };
            if (data?.id) {
                mutateUpdateVariable({ data: body, id: data.id });
            } else {
                mutateVariable(body);
            }
        } catch (error) {
            toast.error("Something went wrong! We couldn't save your variable");
            logger.error(`An unexpected error occurred: ${error}`);
        }
    };

    return {
        isOpen,
        isEdit,
        isValid,
        isFetching,
        isSaving: creating || updating,
        activityData,
        variablePageRef,
        variablePageHeighInDrawer,
        isDrawerOpen,
        variableTableData,
        errors,
        newRecord,
        bottomRef: ref,
        register,
        watch,
        setValue,
        setOpen,
        setEdit,
        setIsDrawerOpen,
        handleClick,
        handleCreate,
        handleEdit,
        onDelete,
        onVariableFilter,
        handleSubmit,
        onHandleSubmit,
        control,
    };
};
