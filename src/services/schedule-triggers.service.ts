import { IScheduleTrigger } from '@/models';
import { $fetch } from '@/utils';

class ScheduleTriggerService {
    async get(workspaceId: string, workflowId: string) {
        const response = await $fetch<IScheduleTrigger[]>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/schedule-triggers`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async getById(workspaceId: string, workflowId: string, id: string) {
        const response = await $fetch<IScheduleTrigger>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/schedule-triggers/${id}`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async create(data: FormData, workspaceId: string, workflowId: string) {
        const response = await $fetch<IScheduleTrigger>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/schedule-triggers`,
            {
                method: 'POST',
                body: data,
                headers: { 'x-workspace-id': workspaceId },
            },
            { autoContentType: true }
        );

        return response.data;
    }

    async update(data: FormData, workspaceId: string, workflowId: string, id: string) {
        const response = await $fetch<IScheduleTrigger>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/schedule-triggers/${id}`,
            {
                method: 'PUT',
                body: data,
                headers: { 'x-workspace-id': workspaceId },
            },
            { autoContentType: true }
        );

        return response.data;
    }

    async delete(workspaceId: string, workflowId: string, id: string) {
        const response = await $fetch(
            `/workspaces/${workspaceId}/workflows/${workflowId}/schedule-triggers/${id}`,
            {
                method: 'DELETE',
                headers: { 'x-workspace-id': workspaceId },
            },
            {
                denyRedirectOnForbidden: true,
            }
        );

        return response.data;
    }
}

export default ScheduleTriggerService;
