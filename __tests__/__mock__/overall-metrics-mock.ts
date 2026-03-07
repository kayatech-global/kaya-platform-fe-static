export const mockLLMExecutions = [
    {
        id: '1',
        llm: 'GPT-4',
        timeAverage: '2.5s',
        timeLongest: '5s',
        llmAverage: 1000,
        llmMost: 2000,
        executionCount: 50,
    },
    {
        id: '2',
        llm: 'GPT-3.5',
        timeAverage: '1.5s',
        timeLongest: '3s',
        llmAverage: 500,
        llmMost: 1000,
        executionCount: 30,
    },
];

export const mockApiExecutions = [
    {
        id: '1',
        api: 'api 1',
        executionCount: 100,
        failureCount: 5,
        average: '1.5s',
        longest: '3.0s',
    },
    {
        id: '2',
        api: 'api 2',
        executionCount: 50,
        failureCount: 2,
        average: '2.0s',
        longest: '4.5s',
    },
];

export const mockWorkflowExecutions = [
    {
        id: '1',
        workflow: 'Test Workflow 1',
        average: '2.5s',
        longest: '5s',
        apiCalls: 10,
        llmCalls: 1000,
        slmCalls: 0,
        executionCount: 5,
        children: [
            {
                sessionId: 'session-1',
                apiCalls: 3,
                llmCalls: '500',
                slmCalls: '0',
                timeTaken: '2s',
                executionCount: 2,
            },
        ],
    },
];

export const mockOverallMetricUsageResponse = {
    overallMetrics: {
        credits: {
            lastMonth: 'Workflow 2',
            currentMonth: null,
        },
        executions: {
            lastMonth: 'Workflow 5',
            currentMonth: null,
        },
        tokens: {
            lastMonth: 'Workflow 2',
            currentMonth: null,
        },
    },
    llmExecutions: [
        {
            modelName: 'Claude 3',
            averageTime: '42.5s',
            longestTime: '76.7s',
            averageLlmTokens: 13163,
            mostLlmTokens: 22356,
            executionCount: 4,
        },
        {
            modelName: 'Gemini 1.5',
            averageTime: '44.7s',
            longestTime: '64.6s',
            averageLlmTokens: 19176,
            mostLlmTokens: 23719,
            executionCount: 5,
        },
        {
            modelName: 'GPT-4',
            averageTime: '39.7s',
            longestTime: '75.4s',
            averageLlmTokens: 13395,
            mostLlmTokens: 15293,
            executionCount: 4,
        },
    ],
    apiExecutions: [
        {
            apiName: 'Step 1',
            executionCount: 3,
            failureCount: 0,
            averageTime: '56.5s',
            longestTime: '97.6s',
        },
        {
            apiName: 'Step 2',
            executionCount: 4,
            failureCount: 0,
            averageTime: '60.8s',
            longestTime: '90.5s',
        },
        {
            apiName: 'Step 3',
            executionCount: 5,
            failureCount: 0,
            averageTime: '47.4s',
            longestTime: '91.2s',
        },
    ],
    workflowExecution: [
        {
            workflowId: 'w-001',
            workflowName: 'Workflow 1',
            averageTime: '45.7s',
            longestTime: '45.7s',
            apiCalls: 1,
            llmTokens: null,
            executionCount: 1,
            sessions: [
                {
                    sessionId: 's-001',
                    averageTime: '30000ms',
                    longestTime: '30000ms',
                    apiCalls: 0,
                    llmTokens: 11998,
                    executionCount: 1,
                },
                {
                    sessionId: 's-002',
                    averageTime: '13000ms',
                    longestTime: '13000ms',
                    apiCalls: 1,
                    llmTokens: null,
                    executionCount: 1,
                },
                {
                    sessionId: 's-003',
                    averageTime: '85000ms',
                    longestTime: '85000ms',
                    apiCalls: 1,
                    llmTokens: null,
                    executionCount: 1,
                },
            ],
        },
        {
            workflowId: 'w-002',
            workflowName: 'Workflow 1',
            averageTime: '85.0s',
            longestTime: '85.0s',
            apiCalls: 1,
            llmTokens: null,
            executionCount: 1,
            sessions: [
                {
                    sessionId: 's-004',
                    averageTime: '85000ms',
                    longestTime: '85000ms',
                    apiCalls: 1,
                    llmTokens: null,
                    executionCount: 1,
                },
            ],
        },
        {
            workflowId: 'w-003',
            workflowName: 'Workflow 1',
            averageTime: '55.2s',
            longestTime: '55.2s',
            apiCalls: 0,
            llmTokens: 19765,
            executionCount: 1,
            sessions: [
                {
                    sessionId: 's-005',
                    averageTime: '55000ms',
                    longestTime: '55000ms',
                    apiCalls: 0,
                    llmTokens: 19765,
                    executionCount: 1,
                },
                {
                    sessionId: 's-006',
                    averageTime: '23000ms',
                    longestTime: '23000ms',
                    apiCalls: 1,
                    llmTokens: null,
                    executionCount: 1,
                },
            ],
        },
    ],
};
