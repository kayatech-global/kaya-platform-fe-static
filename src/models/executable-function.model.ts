import { IHeaderValues } from '@/models/configuration.model';

// export interface IParameterValues {
//     name: string;
//     dataType: string;
//     value: string;
//     description?: string;
// }

export interface IExecutableFunctionForm {
    id: string;
    name: string;
    description: string;
    provider: string;
    startupOption: string;
    credentials: IExecutableFunctionCredential;
    language: string;
    code: string;
    payload: IHeaderValues[];
    dependencies?: IHeaderValues[];
    environmentVariables?: IHeaderValues[];
    isReadOnly?: boolean;
    region: string;
    deployedUrl?: string;
}

export interface IExecutableFunctionCredential {
    authType: string;
    meta?: IExecutableFunctionCredentialMeta;
}

export interface IExecutableFunctionCredentialMeta {
    secretKey?: string;
    accessKey?: string;
    lambdaExecutionRoleArn?: string;
}

export interface IExecutableFunction {
    id?: string;
    name: string;
    description: string;
    provider: string;
    qualifier: string;
    startupOption: string;
    language: string;
    code: string;
    payload: IHeaderValues[];
    region: string;
    credentials: {
        authType: string;
        meta?: IExecutableFunctionCredentialMeta;
    };
    isReadOnly?: boolean;
}
export interface IExecutableFunctionTool {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: {
        provider: string;
        startupOption: string;
        credentials: IExecutableFunctionCredential;
        language: string;
        code: string;
        payload: IHeaderValues[];
        isReadOnly?: boolean;
        region: string;
    };
}
