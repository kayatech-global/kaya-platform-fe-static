import { Runtime } from './types';

export const mockRuntimes: Runtime[] = [
    {
        id: '1',
        name: 'Production Runtime',
        description: 'Main production runtime for customer-facing workflows',
        region: 'us-east-1',
        status: 'Deployed',
        createdAt: '2026-03-28',
        roleArn: 'arn:aws:iam::123456789:role/agentcore-prod',
        idleTimeout: 300,
        maxLifetime: 3600,
    },
    {
        id: '2',
        name: 'Staging Runtime',
        description: 'Pre-production testing environment',
        region: 'us-east-1',
        status: 'Deployed',
        createdAt: '2026-03-21',
        roleArn: 'arn:aws:iam::123456789:role/agentcore-staging',
        idleTimeout: 180,
        maxLifetime: 1800,
    },
    {
        id: '3',
        name: 'Development Runtime',
        description: 'Development and testing runtime',
        region: 'us-west-2',
        status: 'Deployed',
        createdAt: '2026-03-18',
        roleArn: 'arn:aws:iam::123456789:role/agentcore-dev',
        idleTimeout: 120,
        maxLifetime: 900,
    },
    {
        id: '4',
        name: 'EU Production Runtime',
        description: 'European production environment',
        region: 'eu-west-1',
        status: 'Queued',
        createdAt: '2026-03-15',
        roleArn: 'arn:aws:iam::123456789:role/agentcore-eu-prod',
        idleTimeout: 300,
        maxLifetime: 3600,
    },
    {
        id: '5',
        name: 'Test Runtime',
        description: 'QA testing environment',
        region: 'us-east-1',
        status: 'Error',
        createdAt: '2026-03-10',
        roleArn: 'arn:aws:iam::123456789:role/agentcore-test',
        idleTimeout: 60,
        maxLifetime: 600,
    },
];

export const awsRegions = [
    { name: 'US East (N. Virginia)', value: 'us-east-1' },
    { name: 'US East (Ohio)', value: 'us-east-2' },
    { name: 'US West (Oregon)', value: 'us-west-2' },
    { name: 'EU (Ireland)', value: 'eu-west-1' },
    { name: 'EU (Frankfurt)', value: 'eu-central-1' },
    { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
    { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' },
];

export const secretOptions = [
    { name: 'aws-secret-key-prod', value: 'aws-secret-key-prod' },
    { name: 'aws-secret-key-staging', value: 'aws-secret-key-staging' },
    { name: 'aws-secret-key-dev', value: 'aws-secret-key-dev' },
    { name: 'aws-secret-key-eu', value: 'aws-secret-key-eu' },
];
