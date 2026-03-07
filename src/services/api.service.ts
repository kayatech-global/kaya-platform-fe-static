import { $fetch } from '@/utils';
import BaseService from './base.service';
import { BulkApiImportResponse, TransformedApiOutput } from '@/models';
import { ApiTestConfig } from '@/components';

class ApiService extends BaseService {
    constructor() {
        super('tools/api');
    }

    async batch(body: TransformedApiOutput, workspaceId: string) {
        const response = await $fetch<BulkApiImportResponse>(`/workspaces/${workspaceId}/tools/api/batch`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async test(body: ApiTestConfig, workspaceId: string) {
        const response = await $fetch<ApiTestConfig>(`/workspaces/${workspaceId}/tools/api/test`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }
}

export default ApiService;
