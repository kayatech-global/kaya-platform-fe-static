import { Runtime } from './types';

export const mockRuntimes: Runtime[] = [
    {
        id: '1',
        name: 'DemoRT3',
        region: 'us-east-1',
        status: 'Deployed',
        createdAt: '2026-03-28',
    },
    {
        id: '2',
        name: 'DemoRT2',
        region: 'us-east-1',
        status: 'Deployed',
        createdAt: '2026-03-21',
    },
    {
        id: '3',
        name: 'DemoRT1',
        region: 'us-east-1',
        status: 'Deployed',
        createdAt: '2026-03-18',
    },
    {
        id: '4',
        name: 'DemoAgent5',
        region: 'us-east-1',
        status: 'Queued',
        createdAt: '2026-03-15',
    },
    {
        id: '5',
        name: 'DemoAgent3',
        region: 'us-east-1',
        status: 'Error',
        createdAt: '2026-03-10',
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
];
