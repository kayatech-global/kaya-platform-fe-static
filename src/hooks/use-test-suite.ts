/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { logger } from '@/utils';
import { ITestSuite, ITestSuiteListItem, ITestSuiteDetailResponse } from '@/models/test-studio.model';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { mapDetailResponseToTestSuite } from '@/app/workspace/[wid]/test-studio/utils/test-suite-mapper';
import {
    MOCK_TEST_SUITES,
    MOCK_TEST_SUITE_DETAILS,
    MOCK_TEST_SUITES_STORAGE_KEY,
} from '@/app/workspace/[wid]/test-studio/mock/mock_test_suite_data';

// ─── localStorage helpers ────────────────────────────────────────────────────

const loadSuites = (): ITestSuiteListItem[] => {
    try {
        const stored = localStorage.getItem(MOCK_TEST_SUITES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [...MOCK_TEST_SUITES];
    } catch {
        return [...MOCK_TEST_SUITES];
    }
};

const saveSuites = (suites: ITestSuiteListItem[]) => {
    localStorage.setItem(MOCK_TEST_SUITES_STORAGE_KEY, JSON.stringify(suites));
};

const getDetailFromStorage = (id: string): ITestSuiteDetailResponse | null => {
    const suites = loadSuites();
    const suite = suites.find(s => s.id === id);
    if (!suite) return null;
    // Check for overridden detail first, fall back to mock detail
    const stored = localStorage.getItem(`mock_test_suite_detail_${id}`);
    if (stored) return JSON.parse(stored);
    return MOCK_TEST_SUITE_DETAILS[id] ?? null;
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useTestSuite = () => {
    const [isTestSuiteDrawerOpen, setIsTestSuiteDrawerOpen] = useState(false);
    const [isTestSuiteEdit, setIsTestSuiteEdit] = useState(false);
    const [allTestSuites, setAllTestSuites] = useState<ITestSuiteListItem[]>(loadSuites);
    const [unfilteredTestSuites, setUnfilteredTestSuites] = useState<ITestSuiteListItem[]>(loadSuites);
    const [isFetchingTestSuite, setIsFetchingTestSuite] = useState(false);
    const [isLoadingTestSuits] = useState(false);
    const [errorTestSuits] = useState<Error | null>(null);

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

    const refetchAllTestSuits = () => {
        const suites = loadSuites();
        setAllTestSuites(suites);
        setUnfilteredTestSuites(suites);
    };

    // ─── Mock CRUD ──────────────────────────────────────────────────────────

    const isDeletingTestSuit = false;
    const isCreatingTestSuite = false;
    const isUpdatingTestSuite = false;

    const mutateDeleteTestSuit = ({ id }: { id: string }) => {
        try {
            const suites = loadSuites().filter(s => s.id !== id);
            saveSuites(suites);
            localStorage.removeItem(`mock_test_suite_detail_${id}`);
            toast.success('Test-suite Deleted Successfully!');
            refetchAllTestSuits();
        } catch (err) {
            logger.error('Delete test suite error:', err);
            toast.error('Unable to delete Test-suite');
        }
    };

    const mutateCreateTestSuite = (data: ITestSuite) => {
        try {
            const suites = loadSuites();
            const id = `mock-ts-${Date.now()}`;
            const newItem: ITestSuiteListItem = {
                id,
                name: data.name,
                description: data.description || '',
                workflowId: data.workflowId || '',
                workflowVersion: data.workflowVersion || 1,
                workflowName: data.workflowName || '',
                configurations: {},
                creationSource: data.creationSource || 'manual',
                version: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workspaceId: 1,
                testDataSetsCount: data.testDataSets?.length ?? 0,
            };
            suites.push(newItem);
            saveSuites(suites);
            toast.success('Test Suite Created Successfully!');
            setIsTestSuiteDrawerOpen(false);
            reset();
            refetchAllTestSuits();
        } catch (err) {
            logger.error('Create test suite error:', err);
            toast.error('Unable to create Test Suite');
        }
    };

    const mutateUpdateTestSuite = ({ id, data }: { id: string; data: ITestSuite }) => {
        try {
            const suites = loadSuites().map(s =>
                s.id === id
                    ? {
                          ...s,
                          name: data.name,
                          description: data.description || '',
                          workflowId: data.workflowId || s.workflowId,
                          workflowName: data.workflowName || s.workflowName,
                          workflowVersion: data.workflowVersion || s.workflowVersion,
                          updatedAt: new Date().toISOString(),
                          testDataSetsCount: data.testDataSets?.length ?? s.testDataSetsCount,
                      }
                    : s
            );
            saveSuites(suites);
            toast.success('Test Suite Updated Successfully!');
            setIsTestSuiteDrawerOpen(false);
            reset();
            refetchAllTestSuits();
        } catch (err) {
            logger.error('Update test suite error:', err);
            toast.error('Unable to update Test Suite');
        }
    };

    // ─── Handlers ───────────────────────────────────────────────────────────

    const onEdit = async (id: string) => {
        if (!id) return;
        setIsFetchingTestSuite(true);
        try {
            const detail = getDetailFromStorage(id);
            if (!detail) {
                toast.error('Test suite not found');
                return;
            }
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
        } catch (err) {
            logger.error('Failed to fetch test suite:', err);
            toast.error('Failed to load test suite details');
        } finally {
            setIsFetchingTestSuite(false);
        }
    };

    const fetchTestSuiteForView = useCallback(async (id: string): Promise<Partial<ITestSuite> | null> => {
        try {
            const detail = getDetailFromStorage(id);
            if (!detail) return null;
            return { id: detail.id, ...mapDetailResponseToTestSuite(detail) };
        } catch (err) {
            logger.error('Failed to fetch test suite for view:', err);
            return null;
        }
    }, []);

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
