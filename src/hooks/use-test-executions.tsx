import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { $fetch } from '@/utils';
import { ITestSuiteExecutionGroup, IBatchExecutionSummary, IExecutionReportData } from '@/models/test-studio.model';
import { ExecutionGroupBy } from '@/enums/test-studio-type';

/**
 * Fetch all test executions grouped by test suite
 * @param workspaceId - Workspace ID
 * @param filters - Optional filters for test executions
 */
const fetchTestExecutions = async (
    workspaceId: string,
    filters?: {
        testSuiteId?: string;
        workflowId?: string;
        status?: string;
        groupBy?: ExecutionGroupBy;
    }
): Promise<ITestSuiteExecutionGroup[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.testSuiteId) queryParams.append('testSuiteId', filters.testSuiteId);
    if (filters?.workflowId) queryParams.append('workflowId', filters.workflowId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.groupBy) queryParams.append('groupBy', filters.groupBy);

    const queryString = queryParams.toString();
    const queryPart = queryString ? `?${queryString}` : '';
    const url = `/workspaces/${workspaceId}/teststudio/test-executions${queryPart}`;

    const response = await $fetch<ITestSuiteExecutionGroup[]>(url, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

export interface UseTestExecutionsOptions {
    testSuiteId?: string;
    workflowId?: string;
    status?: string;
    groupBy?: ExecutionGroupBy;
    enabled?: boolean;
}

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
            fetchTestExecutions(workspaceId, {
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

/**
 * Fetch a single batch execution details by batch ID
 * @param workspaceId - Workspace ID
 * @param batchId - Batch ID
 */
const fetchBatchExecutionDetails = async (workspaceId: string, batchId: string): Promise<IBatchExecutionSummary> => {
    const url = `/workspaces/${workspaceId}/teststudio/test-executions/${batchId}`;

    const response = await $fetch<IBatchExecutionSummary>(url, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
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
        () => fetchBatchExecutionDetails(workspaceId, batchId!),
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

/**
 * Fetch a single execution report by execution ID
 * @param workspaceId - Workspace ID
 * @param executionId - Execution ID
 */
const fetchExecutionReport = async (workspaceId: string, executionId: string): Promise<IExecutionReportData> => {
    const url = `/workspaces/${workspaceId}/teststudio/test-executions/execution/${executionId}`;

    const response = await $fetch<IExecutionReportData>(url, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
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
        () => fetchExecutionReport(workspaceId, executionId!),
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
