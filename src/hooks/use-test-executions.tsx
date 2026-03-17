/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { ITestSuiteExecutionGroup, IBatchExecutionSummary, IExecutionReportData } from '@/models/test-studio.model';
import { ExecutionGroupBy } from '@/enums/test-studio-type';
import {
    MOCK_TEST_EXECUTION_GROUPS,
    MOCK_TEST_SUITE_DETAILS,
} from '@/app/workspace/[wid]/test-studio/mock/mock_test_suite_data';
import { mockTestExecutionHistories } from '@/app/workspace/[wid]/test-studio/mock/test-exeution-mock';

// ─── Mock Fetch Functions ────────────────────────────────────────────────────

const fetchTestExecutionsMock = async (
    _workspaceId: string,
    filters?: {
        testSuiteId?: string;
        workflowId?: string;
        status?: string;
        groupBy?: ExecutionGroupBy;
    }
): Promise<ITestSuiteExecutionGroup[]> => {
    let groups = [...MOCK_TEST_EXECUTION_GROUPS];
    if (filters?.testSuiteId) {
        groups = groups.filter(g => g.testSuiteId === filters.testSuiteId);
    }
    if (filters?.workflowId) {
        groups = groups.filter(g => g.workflowId === filters.workflowId);
    }
    return groups;
};

const fetchBatchExecutionDetailsMock = async (
    _workspaceId: string,
    batchId: string
): Promise<IBatchExecutionSummary> => {
    for (const group of MOCK_TEST_EXECUTION_GROUPS) {
        const batch = group.executions.find(e => e.batchId === batchId);
        if (batch) return batch;
    }
    // Return a default batch if not found
    return {
        batchId,
        executionCount: 0,
        status: 'Completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        passedCount: 0,
        failedCount: 0,
        errorCount: 0,
        testSuiteId: '',
        testSuiteName: 'Unknown',
    };
};

const fetchExecutionReportMock = async (
    _workspaceId: string,
    executionId: string
): Promise<IExecutionReportData> => {
    // Find execution data from mock history or generate a stub
    const history = mockTestExecutionHistories[0];
    // Find which test suite this execution belongs to
    let testSuiteId = 'a3e2d018-83bd-4d73-9b72-1b0acb5e6b8f';
    let testSuiteName = 'Actuarial Experts - Selective Agent Routing';

    for (const group of MOCK_TEST_EXECUTION_GROUPS) {
        for (const batch of group.executions) {
            const tc = batch.testCases?.find(c => c.executionId === executionId);
            if (tc) {
                testSuiteId = group.testSuiteId;
                testSuiteName = group.testSuiteName;
                break;
            }
        }
    }

    const suiteDetail = MOCK_TEST_SUITE_DETAILS[testSuiteId];

    return {
        id: executionId,
        testSuiteId,
        testDataSetIndex: 0,
        testDataSetName: history?.datasets?.[0]?.title ?? 'Test Case 1',
        workflowId: suiteDetail?.workflowId ?? '',
        workflowVersion: suiteDetail?.workflowVersion ?? 1,
        workflowSessionId: `sess-${executionId}`,
        status: 'Passed',
        executionType: 'full',
        batchId: 'batch-001',
        inputDataSnapshot: {
            message: history?.datasets?.[0]?.input?.message ?? 'Mock input',
            variables: {},
        },
        expectedOutputSnapshot: {
            expectedOutput: history?.datasets?.[0]?.expectedOutput ?? '',
            agentEvaluations: [],
            expectedOrchestrationPath: [],
            expectedWorkflowBehaviour: history?.datasets?.[0]?.expectedBehaviour ?? '',
        },
        actualOutput: {
            agent_outputs: [],
            workflow_output: history?.report?.inputReport?.[0]?.actualOutput ?? 'Mock actual output',
            workflow_reasoning: 'The workflow executed correctly based on the input.',
        },
        actualOrchestrationPath: [],
        executionLineage: [],
        inputTokenCount: history?.report?.inputReport?.[0]?.tokens ?? 10000,
        outputTokenCount: 500,
        totalLatencyMs: Math.round((history?.report?.inputReport?.[0]?.totalLatency ?? 5) * 1000),
        totalCost: '0.002',
        startedAt: new Date(Date.now() - 15000).toISOString(),
        completedAt: new Date().toISOString(),
        errorMessage: null,
        errorStackTrace: null,
        isDeleted: false,
        createdBy: 1,
        createdAt: new Date().toISOString(),
        updatedBy: null,
        updatedAt: new Date().toISOString(),
        workspaceId: 1,
        workflowName: suiteDetail?.workflowName,
        TestSuite: {
            id: testSuiteId,
            name: testSuiteName,
            description: suiteDetail?.description ?? '',
            workflowId: suiteDetail?.workflowId ?? '',
            workflowVersion: suiteDetail?.workflowVersion ?? 1,
            tags: null,
            configurations: {},
            creationSource: 'manual',
            testDataSets: [],
            toolMockDefinitions: [],
            version: 1,
            isActive: true,
            isDeleted: false,
            createdBy: 1,
            createdAt: suiteDetail?.createdAt ?? new Date().toISOString(),
            updatedBy: null,
            updatedAt: suiteDetail?.updatedAt ?? new Date().toISOString(),
            workspaceId: 1,
        },
        TestReports: [],
    };
};

// ─── Public Interfaces ───────────────────────────────────────────────────────

export interface UseTestExecutionsOptions {
    testSuiteId?: string;
    workflowId?: string;
    status?: string;
    groupBy?: ExecutionGroupBy;
    enabled?: boolean;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export const useTestExecutions = (options?: UseTestExecutionsOptions) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    const {
        data: testExecutions,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery<ITestSuiteExecutionGroup[], Error>(
        ['testExecutions', workspaceId, options],
        () =>
            fetchTestExecutionsMock(workspaceId, {
                testSuiteId: options?.testSuiteId,
                workflowId: options?.workflowId,
                status: options?.status,
                groupBy: options?.groupBy || ExecutionGroupBy.TestSuite,
            }),
        {
            enabled: options?.enabled !== false && !!workspaceId,
            staleTime: Infinity,
            cacheTime: 300000,
            refetchInterval: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
        }
    );

    return {
        testExecutions: testExecutions || [],
        isLoading,
        isFetching,
        error,
        refetch,
    };
};

export const useBatchExecutionDetails = (batchId: string | null | undefined) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    const {
        data: batchDetails,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery<IBatchExecutionSummary, Error>(
        ['batchExecutionDetails', workspaceId, batchId],
        () => fetchBatchExecutionDetailsMock(workspaceId, batchId!),
        {
            enabled: !!workspaceId && !!batchId,
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchInterval: false,
        }
    );

    return {
        batchDetails,
        isLoading,
        isFetching,
        error,
        refetch,
    };
};

export const useExecutionReport = (executionId: string | null | undefined) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    const {
        data: executionReport,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery<IExecutionReportData, Error>(
        ['executionReport', workspaceId, executionId],
        () => fetchExecutionReportMock(workspaceId, executionId!),
        {
            enabled: !!workspaceId && !!executionId,
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchInterval: false,
        }
    );

    return {
        executionReport,
        isLoading,
        isFetching,
        error,
        refetch,
    };
};
