/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as metricsHook from '@/hooks/use-metrics';
import { MetricsAndAnalyticsContainer } from '@/app/workspace/[wid]/metrics-and-analytics/components/metrics-and-analytics-container';

jest.mock('@/components/molecules/activity-feed/activity-feed', () => ({
    __esModule: true,
    default: ({ data }: { data: any[] }) => (
        <div data-testid="activity-feed">
            {data?.map(item => (
                <div key={item.id} data-testid="activity-item">
                    {item.title}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('@/components/molecules/dashboard-card-list/dashboard-data-card-list', () => ({
    __esModule: true,
    default: ({ data }: { data: any[] }) => (
        <div data-testid="dashboard-cards">
            {data?.map((item, index) => (
                <div key={index} data-testid="dashboard-card">
                    <div>{item.title}</div>
                    <div>{item.value}</div>
                </div>
            ))}
        </div>
    ),
}));

jest.mock('@/app/workspace/[wid]/metrics-and-analytics/components/metrics-and-analytics-table-container', () => ({
    MetricsAndAnalyticsTableContainer: ({
        llmExecutions,
        workflowExecutions,
        apiExecutions,
        onLLMExecutionFilter,
        onWorkflowExecutionFilter,
        onApiExecutionFilter,
    }: any) => (
        <div data-testid="metrics-tables">
            <button onClick={onLLMExecutionFilter} data-testid="llm-filter">
                Filter LLM
            </button>
            <button onClick={onWorkflowExecutionFilter} data-testid="workflow-filter">
                Filter Workflow
            </button>
            <button onClick={onApiExecutionFilter} data-testid="api-filter">
                Filter API
            </button>
            <div data-testid="llm-table">{llmExecutions[0]?.name}</div>
            <div data-testid="workflow-table">{workflowExecutions[0]?.name}</div>
            <div data-testid="api-table">{apiExecutions[0]?.name}</div>
        </div>
    ),
}));

jest.mock('@/app/workspace/[wid]/usage/components/usage-page-skelton', () => ({
    UsagePageSkelton: () => <div data-testid="usage-page-skeleton">Loading...</div>,
}));

jest.mock('@/hooks/use-metrics');

jest.mock('@/hooks/use-breakpoints', () => ({
    useBreakpoint: () => ({
        isMobile: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        isXxLg: false,
    }),
}));

describe('MetricsAndAnalyticsContainer Integration', () => {
    const mockUseMetrics = metricsHook.useMetrics as jest.Mock;

    const mockData = {
        isFetching: false,
        workspaceDataCardInfo: [
            { title: 'Total LLM Executions', value: '100' },
            { title: 'Total Workflow Executions', value: '50' },
            { title: 'Total API Executions', value: '75' },
        ],
        activityData: [
            { id: '1', title: 'Activity 1', timestamp: new Date().toISOString() },
            { id: '2', title: 'Activity 2', timestamp: new Date().toISOString() },
        ],
        bottomRef: { current: null },
        llmExecutions: [{ id: '1', name: 'LLM Test' }],
        workflowExecutions: [{ id: '1', name: 'Workflow Test' }],
        apiExecutions: [{ id: '1', name: 'API Test' }],
        onLLMExecutionFilter: jest.fn(),
        onWorkflowExecutionFilter: jest.fn(),
        onApiExecutionFilter: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show loading skeleton when fetching data', () => {
        mockUseMetrics.mockReturnValue({
            ...mockData,
            isFetching: true,
        });

        render(<MetricsAndAnalyticsContainer />);
        expect(screen.getByTestId('usage-page-skeleton')).toBeInTheDocument();
    });

    it('should render all components with correct data when loaded', () => {
        mockUseMetrics.mockReturnValue(mockData);

        render(<MetricsAndAnalyticsContainer />);

        expect(screen.getByTestId('dashboard-cards')).toBeInTheDocument();
        expect(screen.getByText('Total LLM Executions')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Total Workflow Executions')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('Total API Executions')).toBeInTheDocument();
        expect(screen.getByText('75')).toBeInTheDocument();

        expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
        expect(screen.getByText('Activity 1')).toBeInTheDocument();
        expect(screen.getByText('Activity 2')).toBeInTheDocument();

        expect(screen.getByTestId('metrics-tables')).toBeInTheDocument();
        expect(screen.getByText('LLM Test')).toBeInTheDocument();
        expect(screen.getByText('Workflow Test')).toBeInTheDocument();
        expect(screen.getByText('API Test')).toBeInTheDocument();
    });

    it('should call filter functions when filters are clicked', () => {
        mockUseMetrics.mockReturnValue(mockData);

        render(<MetricsAndAnalyticsContainer />);

        fireEvent.click(screen.getByTestId('llm-filter'));
        expect(mockData.onLLMExecutionFilter).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('workflow-filter'));
        expect(mockData.onWorkflowExecutionFilter).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId('api-filter'));
        expect(mockData.onApiExecutionFilter).toHaveBeenCalled();
    });
});
