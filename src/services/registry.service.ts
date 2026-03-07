import {
    IArtifactStatus,
    IArtifactVersionResponse,
    IGenerateReleaseNoteResponse,
    IWorkflowParentResponse,
    IWorkflowPush,
    IWorkflowEnvConfigSubResponse,
    IPullTypeIdentifierResponse,
    IWorkflowComparisonResponse,
    WorkflowEnvConfigItemForm,
    IEnvSpecificValuePayload,
    IWorkflowDeploymentExecution,
} from '@/models';
import { $fetch } from '@/utils';

class RegistryService {
    async artifacts(workspaceId: string) {
        const response = await $fetch<IWorkflowParentResponse[]>(`/registry/artifacts`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async versions(workspaceId: string, artifactPath: string) {
        const response = await $fetch<IArtifactVersionResponse>(`/registry/artifacts/${artifactPath}/versions`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response.data;
    }

    async releaseNote(workspaceId: string, artifactPath: string, version: string) {
        const response = await $fetch<string>(`/registry/artifacts/${artifactPath}/versions/${version}/release-note`, {
            headers: { 'x-workspace-id': workspaceId },
        });

        return response;
    }

    async environmentVariables(workspaceId: string, artifactPath: string, artifactVersion: string) {
        const response = await $fetch<IWorkflowEnvConfigSubResponse>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/environment-variables`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async validate(workspaceId: string, artifactPath: string, artifactVersion: string) {
        const response = await $fetch<IPullTypeIdentifierResponse>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/deployment/validate`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async diff(workspaceId: string, artifactPath: string, artifactVersion: string, sessionId: string) {
        const response = await $fetch<IWorkflowComparisonResponse>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/deployment/diff?sessionId=${sessionId}`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async configurations(
        workspaceId: string,
        artifactPath: string,
        artifactVersion: string,
        sessionId: string,
        migrationStrategy?: string
    ) {
        const queryParams = new URLSearchParams({ sessionId });
        if (migrationStrategy) {
            queryParams.append('migrationStrategy', migrationStrategy);
        }
        const response = await $fetch<WorkflowEnvConfigItemForm[]>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/deployment/configurations?${queryParams.toString()}`,
            {
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async status(workspaceId: string, workflowId: string) {
        const response = await $fetch<IArtifactStatus>(
            `/workspaces/${workspaceId}/workflows/${workflowId}/artifact/status`,
            {
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async commit(workspaceId: string, id: string, body: IWorkflowPush) {
        const response = await $fetch<IWorkflowPush>(
            `/workspaces/${workspaceId}/workflows/${id}/actions/commit`,
            {
                method: 'POST',
                headers: { 'x-workspace-id': workspaceId },
                body: JSON.stringify(body),
            },
            {
                denyRedirectOnForbidden: true,
            }
        );

        return response.data;
    }

    async generateReleaseNote(workspaceId: string, id: string) {
        const response = await $fetch<IGenerateReleaseNoteResponse>(
            `/workspaces/${workspaceId}/workflows/${id}/actions/generate-release-note`,
            {
                method: 'POST',
                headers: { 'x-workspace-id': workspaceId },
            }
        );

        return response.data;
    }

    async createConfigurations(
        data: IEnvSpecificValuePayload,
        workspaceId: string,
        artifactPath: string,
        artifactVersion: string
    ) {
        const response = await $fetch<string>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/deployment/configurations`,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'x-workspace-id': workspaceId,
                },
            }
        );

        return response.data;
    }

    async execute(
        data: IWorkflowDeploymentExecution,
        workspaceId: string,
        artifactPath: string,
        artifactVersion: string
    ) {
        const response = await $fetch<string>(
            `/registry/artifacts/${artifactPath}/versions/${artifactVersion}/deployment/execute`,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'x-workspace-id': workspaceId,
                },
            },
            {
                denyRedirectOnForbidden: true,
            }
        );

        return response.data;
    }
}

export default RegistryService;
