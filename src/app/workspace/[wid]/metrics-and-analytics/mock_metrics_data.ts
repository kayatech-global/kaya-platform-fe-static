import { ILLMExecution, ISLMExecution, IApiExecution, IWorkflowSummeryExecution, OverallMetricsType, RecentActivityModel } from '@/models';

export const mock_overall_metrics: OverallMetricsType = {
    credits: {
        lastMonth: 'Workflow A',
        currentMonth: 'Customer Support Bot',
    },
    tokens: {
        lastMonth: 'Workflow B',
        currentMonth: 'Email Summarizer',
    },
    executions: {
        lastMonth: 'Workflow C',
        currentMonth: 'Email Summarizer',
    },
};

export const mock_llm_executions: ILLMExecution[] = [
    {
        modelName: 'Gemini 1.5 Pro',
        averageTime: '1.2s',
        longestTime: '3.5s',
        averageLlmTokens: 1200,
        mostLlmTokens: 5000,
        executionCount: 150,
    },
    {
        modelName: 'GPT-4o',
        averageTime: '2.1s',
        longestTime: '5.2s',
        averageLlmTokens: 2500,
        mostLlmTokens: 8000,
        executionCount: 230,
    },
    {
        modelName: 'Claude 3.5 Sonnet',
        averageTime: '1.8s',
        longestTime: '4.1s',
        averageLlmTokens: 1800,
        mostLlmTokens: 6000,
        executionCount: 180,
    },
];

export const mock_slm_executions: ISLMExecution[] = [
    {
        modelName: 'Llama 3 8B',
        averageTime: '0.5s',
        longestTime: '1.2s',
        averageSlmTokens: 800,
        mostSlmTokens: 2000,
        executionCount: 450,
    },
    {
        modelName: 'Mistral 7B',
        averageTime: '0.6s',
        longestTime: '1.5s',
        averageSlmTokens: 900,
        mostSlmTokens: 2500,
        executionCount: 380,
    },
];

export const mock_api_executions: IApiExecution[] = [
    {
        apiName: 'Salesforce API',
        executionCount: 1200,
        failureCount: 15,
        averageTime: '0.8s',
        longestTime: '2.5s',
    },
    {
        apiName: 'SendGrid API',
        executionCount: 2500,
        failureCount: 5,
        averageTime: '0.4s',
        longestTime: '1.2s',
    },
    {
        apiName: 'Slack Webhook',
        executionCount: 800,
        failureCount: 2,
        averageTime: '0.3s',
        longestTime: '0.9s',
    },
];

export const mock_workflow_executions_summary: IWorkflowSummeryExecution[] = [
    {
        workflowId: 'wf-1',
        workflowName: 'Customer Support Bot',
        averageTime: '4.5s',
        longestTime: '12.2s',
        apiCalls: 5,
        llmCalls: 3,
        slmCalls: 0,
        executionCount: 1250,
        sessions: [
            {
                sessionId: 'sess-1',
                timeTaken: '4.2s',
                apiCalls: 4,
                llmCalls: 2,
                slmCalls: 0,
                executionCount: 1,
            },
            {
                sessionId: 'sess-2',
                timeTaken: '5.1s',
                apiCalls: 6,
                llmCalls: 4,
                slmCalls: 0,
                executionCount: 1,
            },
        ],
    },
    {
        workflowId: 'wf-4',
        workflowName: 'Email Summarizer',
        averageTime: '2.1s',
        longestTime: '6.5s',
        apiCalls: 2,
        llmCalls: 1,
        slmCalls: 1,
        executionCount: 2100,
        sessions: [
            {
                sessionId: 'sess-3',
                timeTaken: '1.9s',
                apiCalls: 2,
                llmCalls: 1,
                slmCalls: 1,
                executionCount: 1,
            },
        ],
    },
];

export const mock_recent_activity: RecentActivityModel = {
    recent_activity: [
        {
            workflowName: 'Customer Support Bot',
            date: '2024-03-17 10:30:00',
            tokenCount: 1500,
        },
        {
            workflowName: 'Email Summarizer',
            date: '2024-03-17 10:25:00',
            tokenCount: 800,
        },
        {
            workflowName: 'Customer Support Bot',
            date: '2024-03-17 10:20:00',
            tokenCount: 1200,
        },
        {
            workflowName: 'Data Extractor',
            date: '2024-03-17 10:15:00',
            tokenCount: 450,
        },
        {
            workflowName: 'Content Generator',
            date: '2024-03-17 10:10:00',
            tokenCount: 2100,
        },
    ],
};
