import { $fetch } from '@/utils';

class BaseService {
    constructor(private readonly path: string) {}

    async get<T>(workspaceId: string) {
        const response = await $fetch<T>(`/workspaces/${workspaceId}/${this.path}`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async getById<T>(workspaceId: string, id: string) {
        const response = await $fetch<T>(`/workspaces/${workspaceId}/${this.path}/${id}`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async create<T>(body: T, workspaceId: string) {
        const response = await $fetch<T>(`/workspaces/${workspaceId}/${this.path}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async update<T>(body: T, workspaceId: string, id: string) {
        const response = await $fetch<T>(
            `/workspaces/${workspaceId}/${this.path}/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: { 'x-workspace-id': workspaceId },
            },
            {
                denyRedirectOnForbidden: true,
            }
        );

        return response.data;
    }

    async delete(id: string, workspaceId: string) {
        const response = await $fetch(
            `/workspaces/${workspaceId}/${this.path}/${id}`,
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

export default BaseService;
