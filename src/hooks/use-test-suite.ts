import { useMutation, useQuery } from 'react-query';
import { $fetch, logger} from '@/utils';
import { ITestSuite, ITestSuiteListItem, ITestSuiteDetailResponse } from '@/models/test-studio.model';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { mapTestSuiteToPayload, mapDetailResponseToTestSuite } from '@/app/workspace/[wid]/test-studio/utils/test-suite-mapper';

export const useTestSuite = () => {
    const params = useParams();

    const [isTestSuiteDrawerOpen, setIsTestSuiteDrawerOpen] = useState(false);
    const [isTestSuiteEdit, setIsTestSuiteEdit] = useState(false);
    const [allTestSuites, setAllTestSuites] = useState<ITestSuiteListItem[]>([]);
    const [unfilteredTestSuites, setUnfilteredTestSuites] = useState<ITestSuiteListItem[]>([]);
    const [isFetchingTestSuite, setIsFetchingTestSuite] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        getValues,
        trigger,
        setError,
        clearErrors,
        setFocus,
        resetField,
        formState,
        getFieldState,
        unregister,
        formState: { errors, isValid },
    } = useForm<ITestSuite>({
        mode: 'all',
        defaultValues: {
            autoInputCount: 1,
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'testDataSets',
    });
    const fetchTestSuitsForWorkSpace = async (workspaceId: string) => {
        const response = await $fetch<ITestSuiteListItem[]>(`/workspaces/${workspaceId}/teststudio/test-suites`, {
            method: 'GET',
            headers: {
                'x-workspace-id': workspaceId,
            },
        });
        return response.data;
    };

    const fetchTestSuiteById = async (workspaceId: string, testSuiteId: string) => {
        const response = await $fetch<ITestSuiteDetailResponse>(
            `/workspaces/${workspaceId}/teststudio/test-suites/${testSuiteId}`,
            {
                method: 'GET',
                headers: { 'x-workspace-id': workspaceId },
            }
        );
        return response.data;
    };

    const deleteTestSuite = async (workspaceId: string, testSuitId: string) => {
        const response = await $fetch<ITestSuite[]>(`/workspaces/${workspaceId}/teststudio/test-suites/${testSuitId}`, {
            method: 'DELETE',
            headers: {
                'x-workspace-id': workspaceId,
            },
        });
        return response.data;
    };

    const createTestSuite = async (workspaceId: string, data: ITestSuite) => {
        const payload = mapTestSuiteToPayload(data);
        const response = await $fetch<ITestSuite>(`/workspaces/${workspaceId}/teststudio/test-suites`, {
            method: 'POST',
            headers: {
                'x-workspace-id': workspaceId,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return response.data;
    };

    const updateTestSuite = async (workspaceId: string, testSuiteId: string, data: ITestSuite) => {
        const payload = mapTestSuiteToPayload(data);
        const response = await $fetch<ITestSuite>(`/workspaces/${workspaceId}/teststudio/test-suites/${testSuiteId}`, {
            method: 'PUT',
            headers: {
                'x-workspace-id': workspaceId,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return response.data;
    };

    const {
        isLoading: isLoadingTestSuits,
        error: errorTestSuits,
        refetch: refetchAllTestSuits,
    } = useQuery('getTestSuites', () => fetchTestSuitsForWorkSpace(params.wid as string), {
        onSuccess: (data: ITestSuiteListItem[]) => {
            setUnfilteredTestSuites(data);
            setAllTestSuites(data);
        },
        onError: error => {
            logger.error(error);
        },
    });

    const { mutate: mutateDeleteTestSuit, isLoading: isDeletingTestSuit } = useMutation(
        'deleteTestSuite',
        async ({ id }: { id: string }) => await deleteTestSuite(params.wid as string, id),
        {
            onSuccess: () => {
                toast.success('Test-suite Deleted Successfully!');
                refetchAllTestSuits();
            },
            onError: () => {
                toast.error('Unable to delete Test-suite');
            },
        }
    );

    const { mutate: mutateCreateTestSuite, isLoading: isCreatingTestSuite } = useMutation(
        'createTestSuite',
        async (data: ITestSuite) => await createTestSuite(params.wid as string, data),
        {
            onSuccess: () => {
                toast.success('Test Suite Created Successfully!');
                setIsTestSuiteDrawerOpen(false);
                reset();
                refetchAllTestSuits();
            },
            onError: (error) => {
                logger.error('Create test suite error:', error);
                toast.error('Unable to create Test Suite');
            },
        }
    );

    const { mutate: mutateUpdateTestSuite, isLoading: isUpdatingTestSuite } = useMutation(
        'updateTestSuite',
        async ({ id, data }: { id: string; data: ITestSuite }) =>
            await updateTestSuite(params.wid as string, id, data),
        {
            onSuccess: () => {
                toast.success('Test Suite Updated Successfully!');
                setIsTestSuiteDrawerOpen(false);
                reset();
                refetchAllTestSuits();
            },
            onError: (error) => {
                logger.error('Update test suite error:', error);
                toast.error('Unable to update Test Suite');
            },
        }
    );

    const onEdit = async (id: string) => {
        if (!id) return;
        setIsFetchingTestSuite(true);
        try {
            const detail = await fetchTestSuiteById(params.wid as string, id);
            const formData = mapDetailResponseToTestSuite(detail);
            setValue('id', detail.id);
            setValue('name', formData.name ?? '');
            setValue('description', formData.description ?? '');
            setValue('workflowId', formData.workflowId);
            setValue('workflowName', formData.workflowName ?? '');
            setValue('testCaseMethod', formData.testCaseMethod);
            replace(formData.testDataSets || []);
            setValue('toolMockConfigs', formData.toolMockConfigs || []);
            setValue('workflowVersion', formData.workflowVersion);
            setValue('creationSource', formData.creationSource);
        } catch (error) {
            logger.error('Failed to fetch test suite:', error);
            toast.error('Failed to load test suite details');
        } finally {
            setIsFetchingTestSuite(false);
        }
    };

    const fetchTestSuiteForView = useCallback(async (id: string): Promise<Partial<ITestSuite> | null> => {
        try {
            const detail = await fetchTestSuiteById(params.wid as string, id);
            return { id: detail.id, ...mapDetailResponseToTestSuite(detail) };
        } catch (error) {
            logger.error('Failed to fetch test suite for view:', error);
            return null;
        }
    }, [params.wid]);

    const onCreate = (formData: ITestSuite) => {
        mutateCreateTestSuite(formData);
    };

    const onUpdate = (formData: ITestSuite) => {
        if (!formData.id) {
            toast.error('Test Suite ID is missing');
            return;
        }
        mutateUpdateTestSuite({ id: formData.id, data: formData });
    };

    const handleSearchByTestSuiteName = (data: ITestSuite) => {
        const searchTerm = data?.search?.toLowerCase()?.trim();
        if (!searchTerm) {
            setAllTestSuites(unfilteredTestSuites);
            return;
        }
        const filtered = unfilteredTestSuites.filter(
            x => x.name && x.name.toLowerCase().includes(searchTerm)
        );
        setAllTestSuites(filtered);
    };

    const handleOnCreateTestSuite = () => {
        setIsTestSuiteEdit(false);
        setIsTestSuiteDrawerOpen(true);
    };

    const handleOnEditTestSuite = async (id: string) => {
        await onEdit(id);
        setIsTestSuiteEdit(true);
        setIsTestSuiteDrawerOpen(true);
    };

    const handleOnDeleteTestSuite = (id: string) => {
        if (id) {
            mutateDeleteTestSuit({ id });
        }
    };


    return {
        allTestSuits: allTestSuites,
        isLoadingTestSuits,
        errorTestSuits,
        isTestSuitDrawerOpen: isTestSuiteDrawerOpen,
        isTestSuitEdit: isTestSuiteEdit,
        isFetchingTestSuite,
        fetchTestSuiteForView,
        onCreate,
        onEdit,
        onUpdate,
        fields,
        append,
        remove,
        replace,
        setIsTestSuitDrawerOpen: setIsTestSuiteDrawerOpen,
        setIsTestSuitEdit: setIsTestSuiteEdit,
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        trigger,
        setError,
        clearErrors,
        setFocus,
        resetField,
        formState,
        getFieldState,
        unregister,
        control,
        errors,
        isValid,
        isDeletingTestSuit,
        isCreatingTestSuite,
        isUpdatingTestSuite,
        refetchAllTestSuits,
        handleOnCreateTestSuite,
        handleOnEditTestSuite,
        handleOnDeleteTestSuite,
        handleSearchByWorkflow: handleSearchByTestSuiteName,
    };
};
