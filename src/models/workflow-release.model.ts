import { WorkflowSaveType } from '@/enums';

export interface IArtifactWorkflow {
    workflowId: string;
    name: string;
    artifactUrl: string;
    artifactName: string;
    artifactPath: string;
    versions?: IArtifactWorkflowVersions[];
    workflowMetadata?: IWorkflowMetadataResponse[];
    search?: string;
    isReadOnly?: boolean;
}

export interface IArtifactWorkflowVersions {
    id: string;
    workflowName: string;
    workflowId: string;
    uri: string;
    version: string;
    date: string;
    artifactPath: string;
}

export interface IPaginatedWorkflowRelease {
    packages: IArtifactWorkflow[];
    pagination: unknown;
    metadata: unknown;
}

export interface IWorkflowParentResponse {
    workflowId: string;
    workflowName: string;
    artifactUrl: string;
    artifactName: string;
    artifactPath: string;
    workflowMetadata?: IWorkflowMetadataResponse[];
}

export interface IArtifactVersionResponse {
    packageName: string;
    versions: IVersionResponse[];
}

export interface IVersionResponse {
    version: string;
    uri: string;
    createdAt: string;
}

export interface IWorkflowEnvironmentVariableResponse {
    key: string;
    value: unknown;
    name: string;
    type: string;
    reference: string;
    is_secret: boolean;
}

export interface IWorkflowMetadataResponse {
    status: WorkflowSaveType;
    lastPulledArtifactVersion: string;
    createdBy: number;
}
