export type ExecutionRuntime = 'kaya-default' | 'aws-agentcore';
export type SourceType = 's3' | 'ecr';
export type DeploymentStep = 'compile' | 'package' | 'push' | 'register' | 'healthcheck';
export type StepStatus = 'pending' | 'running' | 'success' | 'error';

export interface RuntimeConnection {
    id: string;
    name: string;
    region: string;
    status: 'ready' | 'busy' | 'error';
}

export interface S3SourceConfig {
    bucketName: string;
    objectPrefix: string;
    enableVersioning: boolean;
}

export interface ECRSourceConfig {
    registryUri: string;
    imageTag: string;
    iamRoleArn: string;
}

export interface DeploymentStepInfo {
    id: DeploymentStep;
    name: string;
    status: StepStatus;
    timestamp?: string;
    message?: string;
}

export interface PublishWizardState {
    step: number;
    workflowName: string;
    workflowVersion: string;
    executionRuntime: ExecutionRuntime;
    selectedRuntime: string;
    sourceType: SourceType;
    s3Config: S3SourceConfig;
    ecrConfig: ECRSourceConfig;
    deploymentSteps: DeploymentStepInfo[];
    isDeploying: boolean;
    deploymentComplete: boolean;
    deploymentId: string;
}
