export type RuntimeStatus = 'Deployed' | 'Queued' | 'Error' | 'Inactive';

export interface DeployedWorkflow {
    id: string;
    name: string;
    version: string;
    deployedAt: string;
}

export interface Runtime {
    id: string;
    name: string;
    description?: string;
    region: string;
    status: RuntimeStatus;
    createdAt: string;
    updatedAt?: string;
    isReadOnly?: boolean;
    roleArn?: string;
    idleTimeout?: number;
    maxLifetime?: number;
    deployedWorkflows?: DeployedWorkflow[];
}

export interface RuntimeFormData {
    name: string;
    description: string;
    region: string;
    awsAccessKeyId: string;
    awsSecretAccessKeyId: string; // Vault secret reference
    roleArn: string;
    idleTimeout: number;
    maxLifetime: number;
    runtimeEnvOverride: string; // JSON string
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
