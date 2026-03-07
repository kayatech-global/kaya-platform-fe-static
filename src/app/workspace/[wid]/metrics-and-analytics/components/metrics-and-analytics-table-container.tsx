'use client';
import React from 'react';

import { WorkflowUsageData, WorkflowUsageTable } from './workflow-usage-table';
import { LLMTimeData, LLMTimeTable } from './llm-time-table';
import { ApiTimeTable } from './api-time-table';
import {
    ApiTimeData,
    IApiExecutionFilters,
    ILLMExecutionFilters,
    ISLMExecutionFilters,
    IWorkflowExecutionFilters,
} from '@/models';
import { SLMTimeData, SLMTimeTable } from './slm-time-table';

interface MetricsAndAnalyticsTableContainerProps {
    llmExecutions: LLMTimeData[];
    slmExecutions: SLMTimeData[];
    workflowExecutions: WorkflowUsageData[];
    onLLMExecutionFilter: (filter: ILLMExecutionFilters | null) => void;
    onSLMExecutionFilter: (filter: ISLMExecutionFilters | null) => void;
    onWorkflowExecutionFilter: (filter: IWorkflowExecutionFilters | null) => void;
    apiExecutions: ApiTimeData[];
    onApiExecutionFilter: (filter: IApiExecutionFilters | null) => void;
}

export const MetricsAndAnalyticsTableContainer = ({
    llmExecutions,
    slmExecutions,
    workflowExecutions,
    onLLMExecutionFilter,
    onSLMExecutionFilter,
    onWorkflowExecutionFilter,
    apiExecutions,
    onApiExecutionFilter,
}: MetricsAndAnalyticsTableContainerProps) => {
    return (
        <div className="grid gap-8">
            <WorkflowUsageTable
                workflowExecutions={workflowExecutions}
                onWorkflowExecutionFilter={onWorkflowExecutionFilter}
            />
            <LLMTimeTable llmExecutions={llmExecutions} onLLMExecutionFilter={onLLMExecutionFilter} />
            <SLMTimeTable slmExecutions={slmExecutions} onSLMExecutionFilter={onSLMExecutionFilter} />
            <ApiTimeTable apiExecutions={apiExecutions} onApiExecutionFilter={onApiExecutionFilter} />
        </div>
    );
};
