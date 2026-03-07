import { $fetch } from '@/utils';
import BaseService from './base.service';
import { IConnectorGenerateQuery, IConnectorTestQuery, IGenerateQueryResponse } from '@/models';

class ConnectorService extends BaseService {
    constructor() {
        super('connectors');
    }

    async testQuery(data: IConnectorTestQuery, workspaceId: string) {
        const response = await $fetch<never>(`/workspaces/${workspaceId}/connectors/test-query`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'x-workspace-id': workspaceId,
            },
        });

        return response.data;
    }

    async aiQuery(data: IConnectorGenerateQuery, workspaceId: string) {
        const response = await $fetch<IGenerateQueryResponse>(`/workspaces/${workspaceId}/connectors/ai-query`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'x-workspace-id': workspaceId,
            },
        });

        return response.data;
    }
}

export default ConnectorService;
