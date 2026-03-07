import { ComponentType, DynamicQueryType } from '@/enums';
import { IConsumption, WorkflowExecutionResponse } from '@/models';
import { $fetch } from '@/utils';
import moment from 'moment';

class UsageService {
    async workflowExecution(workspaceId: string, from: string, to: string) {
        const response = await $fetch<WorkflowExecutionResponse>(`/workspaces/${workspaceId}/usage`, {
            method: 'POST',
            body: JSON.stringify({
                from,
                to,
                type: DynamicQueryType.WORKSPACE_WORKFLOW_EXECUTIONS_BY_DATE_RANGE,
            }),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response?.data?.workflows;
    }

    async monthlyUsage(workspaceId: string, from: string, to: string, type: DynamicQueryType) {
        const response = await $fetch<IConsumption>(
            `/workspaces/${workspaceId}/usage`,
            {
                method: 'POST',
                body: JSON.stringify({
                    from,
                    to,
                    type,
                    groupBy: ['month', 'year', 'model'],
                }),
                headers: { 'x-workspace-id': workspaceId },
            },
            { component: ComponentType.MonthlyUsage }
        );

        return response;
    }

    async consumption(workspaceId: string, type: DynamicQueryType) {
        const response = await $fetch<IConsumption>(
            `/workspaces/${workspaceId}/usage`,
            {
                method: 'POST',
                body: JSON.stringify({
                    from: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DDTHH:mm:ss.sss'),
                    to: moment().add(1, 'months').startOf('month').format('YYYY-MM-DDTHH:mm:ss.sss'),
                    type: type,
                }),
                headers: { 'x-workspace-id': workspaceId },
            },
            { component: ComponentType.Consumption }
        );

        return response;
    }
}

export default UsageService;
