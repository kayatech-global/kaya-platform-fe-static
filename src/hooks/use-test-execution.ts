import { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { IExecutionConfiguration, IExecutionProgress, IExecutionResponse } from '@/models/test-studio.model';
import { ExecutionSessionStatus, ExecutionItemStatus } from '@/enums/test-studio-type';

// ─── Mock Helpers ────────────────────────────────────────────────────────────

let _mockSessionCounter = 1000;

const buildMockProgressCompleted = (
    sessionId: string,
    testSuiteId: string,
    total: number
): IExecutionProgress => ({
    sessionId,
    testSuiteId,
    testSuiteName: 'Mock Test Suite',
    workflowId: 'mock-workflow-id',
    status: ExecutionSessionStatus.Completed,
    total,
    completed: total,
    passed: total,
    failed: 0,
    currentIndex: -1,
    currentDataSetName: '',
    startedAt: new Date(Date.now() - 5000).toISOString(),
    completedAt: new Date().toISOString(),
    items: Array.from({ length: total }, (_, i) => ({
        index: i,
        name: `Test Case ${i + 1}`,
        status: ExecutionItemStatus.Passed,
        executionId: `exec-mock-${sessionId}-${i}`,
        startedAt: new Date(Date.now() - (total - i) * 500).toISOString(),
        completedAt: new Date(Date.now() - (total - i - 1) * 500).toISOString(),
    })),
});

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useExecutionConfiguration = (externalSessionId?: string | null) => {
    // useParams not needed for mocked execution

    const [selectedTestSuiteId, setSelectedTestSuiteId] = useState<string>('');
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [totalTestCaseCount, setTotalTestCaseCount] = useState<number>(0);
    const [internalSessionId, setInternalSessionId] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [pollingInterval, setPollingInterval] = useState<number | false>(false);
    const [mockProgress, setMockProgress] = useState<IExecutionProgress | null>(null);

    const executionSessionId = externalSessionId === undefined ? internalSessionId : externalSessionId;

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        getValues,
        formState: { errors, isValid },
    } = useForm<IExecutionConfiguration>({
        mode: 'all',
        defaultValues: {
            testSuiteId: '',
            testCaseIndices: [],
            configurations: {},
            generateReport: true,
        },
    });

    // ─── Mutations (mocked) ─────────────────────────────────────────────────

    const { mutate: mutateExecuteFullSuite, isLoading: isExecutingFullSuite } = useMutation(
        'executeFullTestSuite',
        async (data: Partial<IExecutionConfiguration>): Promise<IExecutionResponse> => {
            if (!data.testSuiteId) throw new Error('Test Suite ID is required');
            const sessionId = `mock-session-${++_mockSessionCounter}`;
            return {
                sessionId,
                status: 'Running',
                message: 'Mock execution started',
                total: totalTestCaseCount || 2,
            };
        },
        {
            onSuccess: (response: IExecutionResponse) => {
                setInternalSessionId(response.sessionId);
                setPollingInterval(2000);
                setIsComplete(false);

                // Immediately resolve with completed progress after short delay
                setTimeout(() => {
                    const completed = buildMockProgressCompleted(
                        response.sessionId,
                        selectedTestSuiteId,
                        response.total
                    );
                    setMockProgress(completed);
                    setIsComplete(true);
                    setPollingInterval(false);
                }, 2000);
            },
            onError: () => {
                toast.error('Unable to execute Test Suite');
            },
        }
    );

    const { mutate: mutateExecutePartialSuite, isLoading: isExecutingPartialSuite } = useMutation(
        'executePartialTestSuite',
        async (data: IExecutionConfiguration): Promise<IExecutionResponse> => {
            if (!data.testSuiteId) throw new Error('Test Suite ID is required');
            if (!data.testCaseIndices || data.testCaseIndices.length === 0) {
                throw new Error('At least one test case must be selected');
            }
            const sessionId = `mock-session-${++_mockSessionCounter}`;
            return {
                sessionId,
                status: 'Running',
                message: 'Mock partial execution started',
                total: data.testCaseIndices.length,
            };
        },
        {
            onSuccess: (response: IExecutionResponse) => {
                setInternalSessionId(response.sessionId);
                setPollingInterval(2000);
                setIsComplete(false);

                setTimeout(() => {
                    const completed = buildMockProgressCompleted(
                        response.sessionId,
                        selectedTestSuiteId,
                        response.total
                    );
                    setMockProgress(completed);
                    setIsComplete(true);
                    setPollingInterval(false);
                }, 2000);
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Unable to execute selected test cases');
            },
        }
    );

    // ─── Progress (mocked) ──────────────────────────────────────────────────

    const progress = mockProgress;
    const isLoadingProgress = false;
    const progressError = null;
    const progressPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
    const pending = progress ? progress.total - progress.completed : 0;



    // ─── Handlers ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (!executionSessionId) {
            setIsComplete(true);
            setPollingInterval(false);
        }
    }, [executionSessionId]);

    const handleExecute = (formData: IExecutionConfiguration) => {
        const testCaseIndices = Array.from(selectedIndices);
        setValue('testCaseIndices', testCaseIndices);

        const executionData: IExecutionConfiguration = {
            ...formData,
            testSuiteId: selectedTestSuiteId,
            testCaseIndices,
        };

        if (testCaseIndices.length === 0) {
            toast.warning('Please select at least one test case to execute');
            return;
        }

        if (totalTestCaseCount > 0 && testCaseIndices.length === totalTestCaseCount) {
            mutateExecuteFullSuite(executionData);
        } else {
            mutateExecutePartialSuite(executionData);
        }
    };

    const handleTestSuiteSelect = useCallback(
        (testSuiteId: string) => {
            setSelectedTestSuiteId(testSuiteId);
            setValue('testSuiteId', testSuiteId);
            setSelectedIndices(new Set());
            setValue('testCaseIndices', []);
        },
        [setValue]
    );

    const handleToggleTestCase = useCallback((index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const handleToggleAll = useCallback((totalCount: number) => {
        setSelectedIndices(prev => {
            if (prev.size === totalCount) {
                return new Set();
            } else {
                return new Set(Array.from({ length: totalCount }, (_, i) => i));
            }
        });
    }, []);

    const resetExecutionConfig = () => {
        setSelectedTestSuiteId('');
        setSelectedIndices(new Set());
        setInternalSessionId(null);
        setIsComplete(false);
        setPollingInterval(false);
        setMockProgress(null);
        reset({
            testSuiteId: '',
            testCaseIndices: [],
            configurations: {},
            generateReport: true,
        });
    };

    const refreshProgress = useCallback(() => {
        // no-op for mock
    }, []);

    const stopPolling = useCallback(() => {
        setPollingInterval(false);
    }, []);

    const resumePolling = useCallback(() => {
        if (!isComplete) {
            setPollingInterval(2000);
        }
    }, [isComplete]);

    const cancelExecution = useCallback(async () => {
        toast.info('Execution cancelled successfully');
        setPollingInterval(false);
        setInternalSessionId(null);
        setIsComplete(true);
        setMockProgress(null);
    }, []);

    return {
        // Form methods
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        getValues,
        errors,
        isValid,

        // Local state
        selectedTestSuiteId,
        selectedIndices,
        totalTestCaseCount,
        executionSessionId,

        // State handlers
        setSelectedTestSuiteId: handleTestSuiteSelect,
        setTotalTestCaseCount,
        handleToggleTestCase,
        handleToggleAll,
        resetExecutionConfig,

        // Mutations
        mutateExecuteFullSuite,
        mutateExecutePartialSuite,
        handleExecute,

        // Loading states
        isExecutingFullSuite,
        isExecutingPartialSuite,
        isExecuting: isExecutingFullSuite || isExecutingPartialSuite,

        // Progress tracking
        progress,
        progressPercentage,
        isComplete,
        pending,
        isLoadingProgress,
        isPolling: pollingInterval !== false && !isComplete,
        progressError,

        // Progress control functions
        refreshProgress,
        stopPolling,
        resumePolling,
        cancelExecution,
    };
};