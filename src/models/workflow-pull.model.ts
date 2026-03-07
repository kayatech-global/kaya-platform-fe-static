import { ArtifactApproachType, WorkflowPullReferenceType } from '@/enums';
import { IOption } from './common.model';

export interface IPullTypeIdentifierResponse {
    sessionId: string;
    migrationStrategies: ArtifactApproachType[];
    errors?: IWorkflowPullError[];
}

export interface IWorkflowComparisonResponse {
    currentPublishGraph: string;
    incomingPublishGraph: string;
    comparisonOutput: string;
}

// env specific updates
export interface FieldMeta {
    currentValue: string;
    incomingValue: string;
    finalValue: string;
    initFinalValue: string;
    paths: string[];
    originalValue?: string;
    finalValueOption?: IOption;
}

export interface WorkflowEnvConfigFieldForm {
    name: string;
    meta: FieldMeta;
    readOnly: boolean; // UI-only (not required to be inside meta)
}

export interface WorkflowEnvConfigItemForm {
    id: string;
    name: string;
    type: string;
    fields: WorkflowEnvConfigFieldForm[];
    reference?: WorkflowPullReferenceType | string;
}

export interface WorkflowEnvConfigFormBase {
    workflowName: string;
    migrationStrategy: ArtifactApproachType | undefined;
    configs: WorkflowEnvConfigItemForm[];
}

export interface IEnvSpecificValuePayload {
    items: WorkflowEnvConfigItemForm[];
    sessionId: string;
}

export interface IWorkflowDeploymentExecution {
    sessionId: string;
    workflowName?: string;
    migrationStrategy: ArtifactApproachType;
}

export interface IWorkflowEnvConfigSubResponse {
    workflowName: string;
    workflowId: string;
    description: string;
    artifactVersion: string;
    artifactName: string;
    artifactDisplayName: string;
    environmentVariables: WorkflowEnvConfigItemForm[];
}

export interface IWorkflowPullType {
    type: ArtifactApproachType;
    label: string;
    description: string;
    error?: IWorkflowPullError;
}

export interface IWorkflowPullError {
    migrationStrategy: ArtifactApproachType;
    message: string;
}
