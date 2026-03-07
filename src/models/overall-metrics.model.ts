export interface OverallMetricsType {
    credits: {
        lastMonth: string;
        currentMonth: string;
    };
    tokens: {
        lastMonth: string;
        currentMonth: string;
    };
    executions: {
        lastMonth: string;
        currentMonth: string;
    };
}

export interface ILLMExecution {
    modelName: string;
    averageTime: string;
    longestTime: string;
    averageLlmTokens: number;
    mostLlmTokens: number;
    executionCount: number;
}

export interface ISLMExecution {
    modelName: string;
    averageTime: string;
    longestTime: string;
    averageSlmTokens: number;
    mostSlmTokens: number;
    executionCount: number;
}

export interface IApiExecution {
    apiName: string;
    executionCount: number;
    failureCount: number;
    averageTime: string;
    longestTime: string;
}

export interface MetricExecutionResponse {
    llm_executions?: ILLMExecution[];
    slm_executions?: ISLMExecution[];
    api_executions?: IApiExecution[];
    workflow_executions?: IWorkflowSummeryExecution[];
}

export interface IWorkflowSummeryExecution {
    workflowId: string;
    workflowName: string;
    averageTime: string;
    longestTime: string;
    apiCalls: number;
    llmCalls?: number;
    slmCalls?: number;
    executionCount: number;
    sessions: ISession[];
}

export interface ISession {
    sessionId: string;
    timeTaken: string;
    apiCalls: number;
    llmCalls?: number;
    slmCalls?: number;
    executionCount: number;
}

export interface IMinMaxFilter {
    min: number | null;
    max: number | null;
}

export interface IApiExecutionFilters {
    apiName: string;
    executionCount: IMinMaxFilter;
    failureCount: IMinMaxFilter;
    averageTime: IMinMaxFilter;
    longestTime: IMinMaxFilter;
}

export interface ILLMExecutionFilters {
    llmName: string;
    averageTime: IMinMaxFilter;
    longestTime: IMinMaxFilter;
    averageLlmTokens: IMinMaxFilter;
    mostLlmTokens: IMinMaxFilter;
    executionCount: IMinMaxFilter;
}
export interface ISLMExecutionFilters {
    slmName: string;
    averageTime: IMinMaxFilter;
    longestTime: IMinMaxFilter;
    averageSlmTokens: IMinMaxFilter;
    mostSlmTokens: IMinMaxFilter;
    executionCount: IMinMaxFilter;
}

export interface IWorkflowExecutionFilters {
    workflowName: string;
    averageTime: IMinMaxFilter;
    longestTime: IMinMaxFilter;
    apiCalls: IMinMaxFilter;
    llmTokens: IMinMaxFilter;
    slmTokens: IMinMaxFilter;
    executionCount: IMinMaxFilter;
}

export interface MetricExecutionRequest<T> {
    type: string;
    from: string;
    to: string;
    filters: T;
    size?: number;
    page?: number;
}

export interface ApiTimeData {
    id: string;
    api: string;
    average: string;
    longest: string;
    executionCount: number;
    failureCount: number;
}
