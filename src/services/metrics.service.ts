import { DynamicQueryType } from '@/enums';
import { MetricExecutionRequest, MetricExecutionResponse, OverallMetricsType, RecentActivityModel } from '@/models';
import { $fetch } from '@/utils';
import moment from 'moment';

class MetricsService {
    async execution(workspaceId: string, filters: MetricExecutionRequest<unknown>) {
        const response = await $fetch<MetricExecutionResponse>(`/workspaces/${workspaceId}/metrics`, {
            method: 'POST',
            body: JSON.stringify(filters),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response?.data;
    }

    async recentActivity(workspaceId: string, size: number, page: number) {
        const response = await $fetch<RecentActivityModel>(`/workspaces/${workspaceId}/metrics`, {
            method: 'POST',
            body: JSON.stringify({
                type: DynamicQueryType.RECENT_ACTIVITY,
                size,
                page,
            }),
            headers: {
                'x-workspace-id': workspaceId,
            },
        });

        return response?.data;
    }

    async overallMetrics(workspaceId: string) {
        const from = moment().startOf('month').format('YYYY-MM-DD');
        const to = moment().format('YYYY-MM-DD');
        const body: MetricExecutionRequest<unknown> = {
            filters: null,
            from,
            to,
            type: DynamicQueryType.LLM_EXECUTION_SUMMARY,
            page: 1,
            size: 1000,
        };

        const response = await $fetch<OverallMetricsType>(`/workspaces/${workspaceId}/metrics`, {
            method: 'POST',
            body: JSON.stringify({
                type: DynamicQueryType.MAXIMUM_USAGE,
            }),
            headers: { 'x-workspace-id': workspaceId },
        });

        const llmExecutionResponse = await this.execution(workspaceId, {
            ...body,
            type: DynamicQueryType.LLM_EXECUTION_SUMMARY,
        });

        const slmExecutionResponse = await this.execution(workspaceId, {
            ...body,
            type: DynamicQueryType.SLM_EXECUTION_SUMMARY,
        });

        const apiExecutionResponse = await this.execution(workspaceId, {
            ...body,
            type: DynamicQueryType.API_EXECUTION_SUMMARY,
        });

        const workflowExecutionResponse = await this.execution(workspaceId, {
            ...body,
            type: DynamicQueryType.WORKFLOW_EXECUTION_SUMMARY,
        });

        return {
            overallMetrics: response?.data,
            llmExecutions: llmExecutionResponse?.llm_executions,
            slmExecutions: slmExecutionResponse?.slm_executions,
            apiExecutions: apiExecutionResponse?.api_executions,
            workflowExecution: workflowExecutionResponse?.workflow_executions,
        };
    }
}

export default MetricsService;
