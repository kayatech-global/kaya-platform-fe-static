import { IGuardrailBinding, IGuardrailBindingRequest } from '@/models';
import { $fetch } from '@/utils';

class GuardrailBindingService {
    async get(workspaceId: string, workflowId?: string) {
        const urlPath = `/workspaces/${workspaceId}/guardrail-bindings${
            workflowId ? `?include=workflow:${workflowId}` : ''
        }`.trimEnd();

        const response = await $fetch<IGuardrailBinding[]>(urlPath, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async manage(data: IGuardrailBindingRequest, workspaceId: string) {
        const response = await $fetch<IGuardrailBinding>(`/workspaces/${workspaceId}/guardrail-bindings`, {
            method: 'PUT',
            headers: { 'x-workspace-id': workspaceId },
            body: JSON.stringify(data),
        });

        return response.data;
    }

    async workflow(data: IGuardrailBindingRequest, workspaceId: string, workflowId: string) {
        const response = await $fetch<IGuardrailBinding>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/guardrail-bindings`,
            {
                method: 'PUT',
                headers: { 'x-workspace-id': workspaceId },
                body: JSON.stringify(data),
            }
        );

        return response.data;
    }
}

export default GuardrailBindingService;
