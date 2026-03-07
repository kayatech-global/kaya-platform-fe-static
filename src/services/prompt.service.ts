/* eslint-disable @typescript-eslint/no-explicit-any */
import { $fetch } from '@/utils';
import BaseService from './base.service';
import { IEnhanceForm, IIntellisense } from '@/models';

class PromptService extends BaseService {
    constructor() {
        super('prompt-template');
    }

    async enhance(enhance: IEnhanceForm, workspaceId: string) {
        const response = await $fetch<string>(`/workspaces/${workspaceId}/prompt-template/enhance`, {
            method: 'POST',
            body: JSON.stringify(enhance),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async intellisense(workspaceId: string, data?: any) {
        // const response = await $fetch<IIntellisense>(`/workspaces/${workspaceId}/prompt-template/intellisense`, {
        //     method: 'POST',
        //     body: JSON.stringify(data ?? { workflowId: null }),
        //     headers: { 'x-workspace-id': workspaceId },
        // });
        // return response.data;
        return { variables: { shared: [] }, metadata: { shared: [] } } as any;
    }
}

export default PromptService;
