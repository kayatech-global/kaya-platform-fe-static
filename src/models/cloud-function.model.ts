import { IHeaderValues } from '@/models/configuration.model';

export interface ICloudFunctionForm {
    id?: string;
    name: string;
    description: string;
    provider: string;
    startupOption: string;
    credentials: ICloudFunctionCredential;
    language: string;
    code: string;
    payload: IHeaderValues[];
    isReadOnly?: boolean;
    region: string;
}

export interface ICloudFunctionCredential {
    authType: string;
    meta?: ICloudFunctionCredentialMeta;
}

export interface ICloudFunctionCredentialMeta {
    secretKey?: string;
    accessKey?: string;
    lambdaExecutionRoleArn?: string;
}
