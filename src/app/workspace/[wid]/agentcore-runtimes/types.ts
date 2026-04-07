export type RuntimeStatus = 'Deployed' | 'Queued' | 'Error';
export type ProviderType = '' | 'aws-agentcore' | 'vertex-ai' | 'azure-ai';
export type CredentialType = 'key-access' | 'managed-access';
export type SourceType = 'ecr-container';

export interface DeployedWorkflow {
    id: string;
    name: string;
    version: string;
    deployedAt: string;
}

export interface EnvironmentVariable {
    key: string;
    value: string;
}

export interface Runtime {
    id: string;
    name: string;
    description?: string;
    provider: ProviderType;
    region: string;
    status: RuntimeStatus;
    createdAt: string;
    updatedAt?: string;
    isReadOnly?: boolean;
    credentialType?: CredentialType;
    accessKey?: string;
    secretKey?: string;
    roleArn?: string;
    idleTimeout?: number;
    maxLifetime?: number;
    sourceType?: SourceType;
    ecrRepositoryUri?: string;
    imageTag?: string;
    deployedWorkflows?: DeployedWorkflow[];
    environmentVariables?: EnvironmentVariable[];
}

export interface RuntimeFormData {
    name: string;
    description: string;
    provider: ProviderType;
    region: string;
    credentialType: CredentialType;
    accessKey: string;
    secretKey: string; // Vault secret reference
    roleArn: string;
    idleTimeout: number;
    maxLifetime: number;
    sourceType: SourceType;
    ecrRepositoryUri: string;
    imageTag: string;
    environmentVariables: EnvironmentVariable[];
}

export interface ValidationStatus {
    iamRole: 'pending' | 'success' | 'error';
    vaultSecret: 'pending' | 'success' | 'error';
    healthCheck: 'pending' | 'success' | 'error';
}

export const AWS_REGIONS = [
    { name: 'US East (N. Virginia)', value: 'us-east-1' },
    { name: 'US East (Ohio)', value: 'us-east-2' },
    { name: 'US West (N. California)', value: 'us-west-1' },
    { name: 'US West (Oregon)', value: 'us-west-2' },
    { name: 'EU (Ireland)', value: 'eu-west-1' },
    { name: 'EU (Frankfurt)', value: 'eu-central-1' },
    { name: 'EU (London)', value: 'eu-west-2' },
    { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
    { name: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' },
    { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
];
