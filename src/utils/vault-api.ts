import { IVault } from '@/models';
import $fetch from './api';

export const fetchVault = async (workspaceId: string) => {
    const response = await $fetch<IVault[]>(`/workspaces/${workspaceId}/key-vault`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};
