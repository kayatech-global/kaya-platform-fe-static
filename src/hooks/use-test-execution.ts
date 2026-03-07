import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { $fetch } from '@/utils';
import { IExecutionConfiguration, IExecutionResponse, IExecutionProgress } from '@/models/test-studio.model';
import { ExecutionSessionStatus } from '@/enums/test-studio-type';

// API: Execute full test suite (all test cases)
const executeFullTestSuite = async (
    workspaceId: string,
    testSuiteId: string,
    data: Partial<IExecutionConfiguration>
) => {
    const response = await $fetch<IExecutionResponse>(
        `/workspaces/${workspaceId}/teststudio/test-suites/${testSuiteId}/execute-testsuite`,
        {
            method: 'POST',
            headers: {
                'x-workspace-id': workspaceId,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                configurations: data.configurations || {},
                generateReport: data.generateReport !== false, // Default to true
            }),
        }
    );
    return response.data;
};

// API: Execute partial test suite (selected test cases)
const executePartialTestSuite = async (workspaceId: string, testSuiteId: string, data: IExecutionConfiguration) => {
    const response = await $fetch<IExecutionResponse>(
        `/workspaces/${workspaceId}/teststudio/test-suites/${testSuiteId}/execute-testcase`,
        {
            method: 'POST',
            headers: {
                'x-workspace-id': workspaceId,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                testCaseIndices: data.testCaseIndices,
                configurations: data.configurations || {},
                generateReport: data.generateReport !== false, // Default to true
            }),
        }
    );
    return response.data;
};

// API: Fetch execution progress
const fetchExecutionProgress = async (workspaceId: string, sessionId: string) => {
    const response = await $fetch<IExecutionProgress>(
        `/workspaces/${workspaceId}/teststudio/execution-progress/${sessionId}`,
        {
            method: 'GET',
            headers: { 'x-workspace-id': workspaceId },
        }
    );
    return response.data;
};

// API: Cancel execution session
const cancelExecutionSession = async (workspaceId: string, sessionId: string) => {
    const response = await $fetch(
        `/workspaces/${workspaceId}/teststudio/execution-sessions/${sessionId}/cancel`,
        {
            method: 'POST',
            headers: { 'x-workspace-id': workspaceId },
        }
    );
    return response.data;
};

export const useExecutionConfiguration = (externalSessionId?: string | null) => {
    const params = useParams();

    // Local state for execution configuration
    const [selectedTestSuiteId, setSelectedTestSuiteId] = useState<string>('');
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [totalTestCaseCount, setTotalTestCaseCount] = useState<number>(0);
    const [internalSessionId, setInternalSessionId] = useState<string | null>(null);
    
    // Use external sessionId if provided (including explicit null), otherwise use internal state
    // If externalSessionId is explicitly passed (even as null), use it; otherwise use internal
    const executionSessionId = externalSessionId === undefined ? internalSessionId : externalSessionId;

    // Progress tracking state
    const [isComplete, setIsComplete] = useState(false);
    const [pollingInterval, setPollingInterval] = useState<number | false>(false); // Start with polling disabled

    // React Hook Form setup for execution configuration
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

    // Mutation: Execute full test suite
    const { mutate: mutateExecuteFullSuite, isLoading: isExecutingFullSuite } = useMutation(
        'executeFullTestSuite',
        async (data: Partial<IExecutionConfiguration>) => {
            if (!data.testSuiteId) {
                throw new Error('Test Suite ID is required');
            }
            return await executeFullTestSuite(params.wid as string, data.testSuiteId, data);
        },
        {
            onSuccess: response => {
                setInternalSessionId(response.sessionId);
                // Start polling when execution starts
                setPollingInterval(2000); // Poll every 2 seconds
                setIsComplete(false);
               
            },
            onError: () => {
                toast.error('Unable to execute Test Suite');
            },
        }
    );

    // Mutation: Execute partial test suite (selected test cases)
    const { mutate: mutateExecutePartialSuite, isLoading: isExecutingPartialSuite } = useMutation(
        'executePartialTestSuite',
        async (data: IExecutionConfiguration) => {
            if (!data.testSuiteId) {
                throw new Error('Test Suite ID is required');
            }
            if (!data.testCaseIndices || data.testCaseIndices.length === 0) {
                throw new Error('At least one test case must be selected');
            }
            return await executePartialTestSuite(params.wid as string, data.testSuiteId, data);
        },
        {
            onSuccess: response => {
                setInternalSessionId(response.sessionId);
                // Start polling when execution starts
                setPollingInterval(2000); // Poll every 2 seconds
                setIsComplete(false);
                console.log('Execution Response:', response);
                console.log('Session ID:', response.sessionId);
                console.log('Status:', response.status);
                console.log('Total test cases:', response.total);
            },
            onError: error => {
                console.error('Execute partial test suite error:', error);
                toast.error('Unable to execute selected test cases');
            },
        }
    );

    // Query: Poll execution progress
    const {
        data: progress,
        isLoading: isLoadingProgress,
        error: progressError,
        refetch: refetchProgress,
    } = useQuery(
        ['executionProgress', executionSessionId],
        () => fetchExecutionProgress(params.wid as string, executionSessionId as string),
        {
            enabled: !!executionSessionId && !isComplete && pollingInterval !== false,
            refetchInterval: pollingInterval,
            refetchIntervalInBackground: true,
            onSuccess: data => {
                // Stop polling if execution is complete
                if (data.status === ExecutionSessionStatus.Completed || data.status === ExecutionSessionStatus.Failed) {
                    setIsComplete(true);
                    setPollingInterval(false);
                }
            },
            onError: error => {
                console.error('Failed to fetch execution progress:', error);
                setPollingInterval(false); // Stop polling on error
            },
        }
    );

    // Calculate progress percentage
    const progressPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;

    // Get pending count
    const pending = progress ? progress.total - progress.completed : 0;

    // Reset state when sessionId changes or becomes null
    useEffect(() => {
        if (executionSessionId) {
            setIsComplete(false);
            setPollingInterval(2000);
        } else {
            // Stop polling when there's no session
            setIsComplete(true);
            setPollingInterval(false);
        }
    }, [executionSessionId]);

    // Execute handler - decides between full or partial execution
    const handleExecute = (formData: IExecutionConfiguration) => {
        const testCaseIndices = Array.from(selectedIndices);

        // Update form data with selected indices
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

        // If all test cases are selected, execute full suite; otherwise execute partial
        if (totalTestCaseCount > 0 && testCaseIndices.length === totalTestCaseCount) {
            mutateExecuteFullSuite(executionData);
        } else {
            mutateExecutePartialSuite(executionData);
        }
    };

    // Handle test suite selection
    const handleTestSuiteSelect = useCallback(
        (testSuiteId: string) => {
            setSelectedTestSuiteId(testSuiteId);
            setValue('testSuiteId', testSuiteId);
            // Clear previous selections when changing test suite
            setSelectedIndices(new Set());
            setValue('testCaseIndices', []);
        },
        [setValue]
    );

    // Handle test case selection toggle
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

    // Handle select all / deselect all
    const handleToggleAll = useCallback((totalCount: number) => {
        setSelectedIndices(prev => {
            if (prev.size === totalCount) {
                return new Set();
            } else {
                return new Set(Array.from({ length: totalCount }, (_, i) => i));
            }
        });
    }, []);

    // Reset execution configuration
    const resetExecutionConfig = () => {
        setSelectedTestSuiteId('');
        setSelectedIndices(new Set());
        setInternalSessionId(null);
        setIsComplete(false);
        setPollingInterval(false);
        reset({
            testSuiteId: '',
            testCaseIndices: [],
            configurations: {},
            generateReport: true,
        });
    };

    // Manual refresh progress function
    const refreshProgress = useCallback(() => {
        if (executionSessionId && !isComplete) {
            refetchProgress();
        }
    }, [executionSessionId, isComplete, refetchProgress]);

    // Stop polling function
    const stopPolling = useCallback(() => {
        setPollingInterval(false);
    }, []);

    // Resume polling function
    const resumePolling = useCallback(() => {
        if (!isComplete) {
            setPollingInterval(2000);
        }
    }, [isComplete]);

    // Cancel execution function - calls backend API to stop execution
    const cancelExecution = useCallback(async () => {
        if (executionSessionId) {
            try {
                // Call backend API to cancel the execution session
                await cancelExecutionSession(params.wid as string, executionSessionId);
                toast.info('Execution cancelled successfully');
            } catch (error) {
                console.error('Failed to cancel execution:', error);
                toast.error('Failed to cancel execution');
            }
        }
        // Stop polling and reset state regardless of API call result
        setPollingInterval(false); 
        setInternalSessionId(null); 
        setIsComplete(true);
    }, [executionSessionId, params.wid]);

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
 