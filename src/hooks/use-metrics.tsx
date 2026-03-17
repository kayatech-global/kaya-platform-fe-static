import { LLMTimeData } from '@/app/workspace/[wid]/metrics-and-analytics/components/llm-time-table';
import { SLMTimeData } from '@/app/workspace/[wid]/metrics-and-analytics/components/slm-time-table';
import {
    WorkflowUsageData,
    WorkflowUsageSubTableDataData,
} from '@/app/workspace/[wid]/metrics-and-analytics/components/workflow-usage-table';
import { ActivityProps, DashboardDataCardProps } from '@/components';
import { useAuth } from '@/context';
import { QueryKeyType } from '@/enums';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { isNullOrEmpty, parseTimeInSeconds } from '@/lib/utils';
import {
    ApiTimeData,
    IApiExecution,
    IApiExecutionFilters,
    ILLMExecution,
    ILLMExecutionFilters,
    ISession,
    ISLMExecution,
    ISLMExecutionFilters,
    IWorkflowExecutionFilters,
    IWorkflowSummeryExecution,
} from '@/models';
import { mock_api_executions, mock_llm_executions, mock_overall_metrics, mock_recent_activity, mock_slm_executions, mock_workflow_executions_summary } from '@/app/workspace/[wid]/metrics-and-analytics/mock_metrics_data';
import { Coins, Database, Disc } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQuery } from 'react-query';

const DATA_CARD_TRUNCATE_LENGTH = 15;

const initWorkspaceDataCardInfo: DashboardDataCardProps[] = [
    {
        title: 'Most Credit Consumption',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Most Credits Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Database,
        TrendIcon: Database,
        showTrendIcon: false,
    },
    {
        title: 'Highest Token Usage',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Used Highest Tokens Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Coins,
        TrendIcon: Database,
        showTrendIcon: false,
    },
    {
        title: 'Most Executed',
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">N/A</p>,
        description: 'Executed Most in Last Month',
        trendValue: '',
        trendColor: 'text-red-500',
        Icon: Disc,
        TrendIcon: Database,
        showTrendIcon: false,
    },
];

export const useMetrics = () => {
    const { token } = useAuth();
    const [workspaceDataCardInfo, setWorkspaceDataCardInfo] =
        useState<DashboardDataCardProps[]>(initWorkspaceDataCardInfo);
    const [llmExecutionApiResult, setLLMExecutionApiResult] = useState<LLMTimeData[]>([]);
    const [slmExecutionApiResult, setSLMExecutionApiResult] = useState<SLMTimeData[]>([]);
    const [llmExecutions, setLLMExecutions] = useState<LLMTimeData[]>([]);
    const [slmExecutions, setSLMExecutions] = useState<SLMTimeData[]>([]);
    const [workflowSummeryExecutions, setWorkflowSummeryExecutions] = useState<WorkflowUsageData[]>([]);
    const [workflowExecutions, setWorkflowExecutions] = useState<WorkflowUsageData[]>([]);
    const [apiExecutionApiResult, setApiExecutionApiResult] = useState<ApiTimeData[]>([]);
    const [apiExecutions, setapiExecutions] = useState<ApiTimeData[]>([]);

    const { isFetching } = useQuery(
        QueryKeyType.OVERALL_METRIC_USAGE,
        () => ({
            overallMetrics: mock_overall_metrics,
            llmExecutions: mock_llm_executions,
            slmExecutions: mock_slm_executions,
            apiExecutions: mock_api_executions,
            workflowExecution: mock_workflow_executions_summary,
        }),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                if (data?.overallMetrics) {
                    setWorkspaceDataCardInfo(prevState => {
                        return prevState.map(card => {
                            switch (card.title) {
                                case 'Most Credit Consumption':
                                    return {
                                        ...card,
                                        value:
                                            data?.overallMetrics?.credits.currentMonth?.length >
                                            DATA_CARD_TRUNCATE_LENGTH ? (
                                                <div
                                                    className="w-52 truncate"
                                                    title={data?.overallMetrics?.credits.currentMonth}
                                                >
                                                    <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300 truncate">
                                                        {data?.overallMetrics?.credits.currentMonth?.slice(
                                                            0,
                                                            DATA_CARD_TRUNCATE_LENGTH
                                                        ) || 'N/A'}{' '}
                                                        ...
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">
                                                    {data?.overallMetrics?.credits.currentMonth || 'N/A'}
                                                </p>
                                            ),
                                        tooltipContent: data?.overallMetrics?.credits.currentMonth,
                                        trendValue: data?.overallMetrics?.credits.lastMonth || 'N/A',
                                        showTrendIcon: true,
                                    };
                                case 'Highest Token Usage':
                                    return {
                                        ...card,
                                        value:
                                            data?.overallMetrics?.tokens.currentMonth?.length >
                                            DATA_CARD_TRUNCATE_LENGTH ? (
                                                <div
                                                    className="w-52 truncate"
                                                    title={data?.overallMetrics?.tokens.currentMonth}
                                                >
                                                    <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300 truncate">
                                                        {data?.overallMetrics?.tokens.currentMonth?.slice(
                                                            0,
                                                            DATA_CARD_TRUNCATE_LENGTH
                                                        ) || 'N/A'}{' '}
                                                        ...
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">
                                                    {data?.overallMetrics?.tokens.currentMonth || 'N/A'}
                                                </p>
                                            ),
                                        tooltipContent: data?.overallMetrics?.tokens.currentMonth,
                                        trendValue: data?.overallMetrics?.tokens.lastMonth || 'N/A',
                                        showTrendIcon: true,
                                    };
                                case 'Most Executed':
                                    return {
                                        ...card,
                                        value:
                                            data?.overallMetrics?.executions.currentMonth?.length >
                                            DATA_CARD_TRUNCATE_LENGTH ? (
                                                <div
                                                    className="w-52 truncate"
                                                    title={data?.overallMetrics?.executions.currentMonth}
                                                >
                                                    <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300 truncate">
                                                        {data?.overallMetrics?.executions.currentMonth?.slice(
                                                            0,
                                                            DATA_CARD_TRUNCATE_LENGTH
                                                        ) || 'N/A'}{' '}
                                                        ...
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">
                                                    {data?.overallMetrics?.executions.currentMonth || 'N/A'}
                                                </p>
                                            ),
                                        tooltipContent: data?.overallMetrics?.executions.currentMonth,
                                        trendValue: data?.overallMetrics?.executions.lastMonth || 'N/A',
                                        showTrendIcon: true,
                                    };
                                default:
                                    return card;
                            }
                        });
                    });
                }
                if (data?.llmExecutions) {
                    mapLLMExecutions(data?.llmExecutions);
                }
                if (data?.slmExecutions) {
                    mapSLMExecutions(data?.slmExecutions);
                }
                if (data?.apiExecutions) {
                    mapApiExecutions(data?.apiExecutions);
                }
                if (data?.workflowExecution) {
                    mapWorkflowExecution(data.workflowExecution);
                }
            },
        }
    );

    // Set up the intersection observer with some options (tweak as needed)
    const { ref, inView } = useInView({
        threshold: 0.5,
        rootMargin: '100px',
    });

    // Use a ref to track the current page so we don't refetch the same page.
    const currentPageRef = useRef(1);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
        'recent-activity',
        () => {
            return mock_recent_activity;
        },
        {
            enabled: !!token,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            getNextPageParam: (lastPage, allPages) =>
                lastPage?.recent_activity?.length === 50 ? allPages.length + 1 : undefined,
        }
    );

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            // Calculate what the next page should be
            const nextPage = currentPageRef.current + 1;
            fetchNextPage().then(() => {
                // Only update the current page when the fetch succeeds
                currentPageRef.current = nextPage;
            });
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten the pages into a single list and map to your ActivityProps shape
    const activityData: ActivityProps[] =
        data?.pages[0]?.recent_activity != undefined
            ? data.pages.flatMap(page =>
                  page?.recent_activity?.map(activity => ({
                      title: activity.workflowName,
                      date: activity.date,
                      colorCode: ActivityColorCode.Purple,
                      description: (
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {activity.tokenCount} Tokens were used to execute{' '}
                              <span style={{ color: ActivityColorCode.Purple }}>{activity.workflowName}</span>
                          </p>
                      ),
                  }))
              )
            : [];

    const mapLLMExecutions = (arr: ILLMExecution[]) => {
        const data = arr.map(
            (x: ILLMExecution, index: number) =>
                ({
                    id: (index + 1).toString(),
                    llm: x.modelName,
                    timeAverage: x.averageTime,
                    timeLongest: x.longestTime,
                    llmAverage: x.averageLlmTokens,
                    llmMost: x.mostLlmTokens,
                    executionCount: x.executionCount,
                }) as LLMTimeData
        );
        setLLMExecutionApiResult(data);
        setLLMExecutions(data);
    };

    const mapSLMExecutions = (arr: ISLMExecution[]) => {
        const data = arr.map(
            (x: ISLMExecution, index: number) =>
                ({
                    id: (index + 1).toString(),
                    slm: x.modelName,
                    timeAverage: x.averageTime,
                    timeLongest: x.longestTime,
                    slmAverage: x.averageSlmTokens,
                    slmMost: x.mostSlmTokens,
                    executionCount: x.executionCount,
                }) as SLMTimeData
        );
        setSLMExecutionApiResult(data);
        setSLMExecutions(data);
    };

    const onLLMExecutionFilter = (filter: ILLMExecutionFilters | null) => {
        if (!filter) {
            setLLMExecutions(llmExecutionApiResult);
            return;
        }
        let result = llmExecutionApiResult;

        if (!isNullOrEmpty(filter?.averageTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.timeAverage) >= (filter.averageTime.min as number));
        }
        if (!isNullOrEmpty(filter?.averageTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.timeAverage) <= (filter.averageTime.max as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.timeLongest) >= (filter.longestTime.min as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.timeLongest) <= (filter.longestTime.max as number));
        }
        if (!isNullOrEmpty(filter?.averageLlmTokens?.min)) {
            result = result.filter(x => x.llmAverage >= (filter.averageLlmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.averageLlmTokens?.max)) {
            result = result.filter(x => x.llmAverage <= (filter.averageLlmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.mostLlmTokens?.min)) {
            result = result.filter(x => x.llmMost >= (filter.mostLlmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.mostLlmTokens?.max)) {
            result = result.filter(x => x.llmMost <= (filter.mostLlmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.min)) {
            result = result.filter(x => x.executionCount >= (filter.executionCount.min as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.max)) {
            result = result.filter(x => x.executionCount <= (filter.executionCount.max as number));
        }

        setLLMExecutions(result);
    };

    const onSLMExecutionFilter = (filter: ISLMExecutionFilters | null) => {
        if (!filter) {
            setSLMExecutions(slmExecutionApiResult);
            return;
        }
        let result = slmExecutionApiResult;

        if (!isNullOrEmpty(filter?.averageTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.timeAverage) >= (filter.averageTime.min as number));
        }
        if (!isNullOrEmpty(filter?.averageTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.timeAverage) <= (filter.averageTime.max as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.timeLongest) >= (filter.longestTime.min as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.timeLongest) <= (filter.longestTime.max as number));
        }
        if (!isNullOrEmpty(filter?.averageSlmTokens?.min)) {
            result = result.filter(x => x.slmAverage >= (filter.averageSlmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.averageSlmTokens?.max)) {
            result = result.filter(x => x.slmAverage <= (filter.averageSlmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.mostSlmTokens?.min)) {
            result = result.filter(x => x.slmMost >= (filter.mostSlmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.mostSlmTokens?.max)) {
            result = result.filter(x => x.slmMost <= (filter.mostSlmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.min)) {
            result = result.filter(x => x.executionCount >= (filter.executionCount.min as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.max)) {
            result = result.filter(x => x.executionCount <= (filter.executionCount.max as number));
        }

        setSLMExecutions(result);
    };

    const mapApiExecutions = (arr: IApiExecution[]) => {
        const data = arr.map(
            (x: IApiExecution, index: number) =>
                ({
                    id: (index + 1).toString(),
                    api: x.apiName,
                    average: x.averageTime,
                    longest: x.longestTime,
                    failureCount: x.failureCount,
                    executionCount: x.executionCount,
                }) as ApiTimeData
        );
        setApiExecutionApiResult(data);
        setapiExecutions(data);
    };

    const onApiExecutionFilter = (filter: IApiExecutionFilters | null) => {
        if (!filter) {
            setapiExecutions(apiExecutionApiResult);
            return;
        }

        let result = apiExecutionApiResult;

        if (!isNullOrEmpty(filter?.averageTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.average) >= (filter.averageTime.min as number));
        }
        if (!isNullOrEmpty(filter?.averageTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.average) <= (filter.averageTime.max as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.longest) >= (filter.longestTime.min as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.longest) <= (filter.longestTime.max as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.min)) {
            result = result.filter(x => x.executionCount >= (filter.executionCount.min as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.max)) {
            result = result.filter(x => x.executionCount <= (filter.executionCount.max as number));
        }
        if (!isNullOrEmpty(filter?.failureCount?.min)) {
            result = result.filter(x => x.failureCount >= (filter.failureCount.min as number));
        }
        if (!isNullOrEmpty(filter?.failureCount?.max)) {
            result = result.filter(x => x.failureCount <= (filter.failureCount.max as number));
        }

        setapiExecutions(result);
    };

    const mapWorkflowExecution = (arr: IWorkflowSummeryExecution[]) => {
        const data = arr.map(
            (x: IWorkflowSummeryExecution) =>
                ({
                    id: x.workflowId,
                    workflow: x.workflowName,
                    average: x.averageTime,
                    longest: x.longestTime,
                    apiCalls: x.apiCalls,
                    llmCalls: x.llmCalls,
                    slmCalls: x.slmCalls,
                    executionCount: x.executionCount,
                    children:
                        x?.sessions?.map(
                            (c: ISession) =>
                                ({
                                    sessionId: c.sessionId,
                                    apiCalls: c.apiCalls,
                                    llmCalls: c.llmCalls,
                                    slmCalls: c.slmCalls,
                                    timeTaken: c.timeTaken,
                                    executionCount: c.executionCount,
                                }) as WorkflowUsageSubTableDataData
                        ) ?? [],
                }) as WorkflowUsageData
        );

        setWorkflowSummeryExecutions(data);
        setWorkflowExecutions(data);
    };

    const onWorkflowExecutionFilter = (filter: IWorkflowExecutionFilters | null) => {
        if (!filter) {
            setWorkflowExecutions(workflowSummeryExecutions);
            return;
        }

        let result = workflowSummeryExecutions;

        if (!isNullOrEmpty(filter?.averageTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.average) >= (filter.averageTime.min as number));
        }
        if (!isNullOrEmpty(filter?.averageTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.average) <= (filter.averageTime.max as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.min)) {
            result = result.filter(x => parseTimeInSeconds(x.longest) >= (filter.longestTime.min as number));
        }
        if (!isNullOrEmpty(filter?.longestTime?.max)) {
            result = result.filter(x => parseTimeInSeconds(x.longest) <= (filter.longestTime.max as number));
        }
        if (!isNullOrEmpty(filter?.llmTokens?.min)) {
            result = result.filter(x => x.llmCalls >= (filter.llmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.llmTokens?.max)) {
            result = result.filter(x => x.llmCalls <= (filter.llmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.slmTokens?.min)) {
            result = result.filter(x => x.slmCalls >= (filter.slmTokens.min as number));
        }
        if (!isNullOrEmpty(filter?.slmTokens?.max)) {
            result = result.filter(x => x.slmCalls <= (filter.slmTokens.max as number));
        }
        if (!isNullOrEmpty(filter?.apiCalls?.min)) {
            result = result.filter(x => x.apiCalls >= (filter.apiCalls.min as number));
        }
        if (!isNullOrEmpty(filter?.apiCalls?.max)) {
            result = result.filter(x => x.apiCalls <= (filter.apiCalls.max as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.min)) {
            result = result.filter(x => x.executionCount >= (filter.executionCount.min as number));
        }
        if (!isNullOrEmpty(filter?.executionCount?.max)) {
            result = result.filter(x => x.executionCount <= (filter.executionCount.max as number));
        }

        setWorkflowExecutions(result);
    };

    return {
        workspaceDataCardInfo,
        activityData,
        isFetching,
        bottomRef: ref,
        llmExecutions,
        onLLMExecutionFilter,
        slmExecutions,
        onSLMExecutionFilter,
        workflowExecutions,
        onWorkflowExecutionFilter,
        apiExecutions,
        onApiExecutionFilter,
    };
};
