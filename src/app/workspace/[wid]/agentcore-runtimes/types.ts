export type RuntimeStatus = 'Deployed' | 'Queued' | 'Error';

export interface Runtime {
    id: string;
    name: string;
    region: string;
    status: RuntimeStatus;
    createdAt: string;
}

export interface RuntimeFormData {
    name: string;
    description: string;
    accessKey: string;
    secretAccessKey: string;
    region: string;
    roleArn: string;
    idleTimeout: number;
    maxLifetime: number;
}

export interface ValidationStatus {
    iamRole: 'pending' | 'success' | 'error';
    vaultSecret: 'pending' | 'success' | 'error';
    healthCheck: 'pending' | 'success' | 'error';
}
