/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseItemType } from '@/enums';

export interface IDatabaseType {
    name: string;
    type: DatabaseItemType;
    providers: string[];
}

export interface IDatabase {
    id?: string;
    name: string;
    description: string;
    type: DatabaseItemType | string;
    configurations: IDatabaseConfigurations;
    updatedAt?: string;
    isReadOnly?: boolean;
}

export interface IDatabaseConfigurations {
    provider: string;
    endpoint?: string;
    databaseName?: string;
    host?: string;
    port?: number;
    userName?: string;
    password?: string;
    tenantId?: string;
    apiKey?: string;
    region?: string;
    useHttps?: boolean;
    useIamAuth?: boolean;
    authMethod?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKeyId?: string;
    isServerless?: boolean;
    workgroupName?: string;
    clusterIdentifier?: string;
    ssl?: boolean;
    timeoutSec?: number | null;
    accessKey?: string;
    secretKey?: string;
    idp_host?: string;
    principal_arn?: string;
    preferred_role?: string;
    credential_provider?: string;
}
