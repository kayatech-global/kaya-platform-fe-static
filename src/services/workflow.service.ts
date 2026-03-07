import { $fetch } from '@/utils';
import BaseService from './base.service';
import { IWorkflowAvailabilityResponse } from '@/models';

class WorkflowService extends BaseService {
    constructor() {
        super('workflows');
    }

    async check(workspaceId: string, name: string) {
        const response = await $fetch<IWorkflowAvailabilityResponse>(
            `/workspaces/${workspaceId}/workflows/check-availability?name=${encodeURIComponent(name)}`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }
}

export default WorkflowService;
