// Types related to API bulk import and preview

import { AuthenticationGrantType, AuthorizationType } from '@/enums';
import { ISwaggerImportApiConfigType } from '@/hooks/use-swagger-parser';
import { ToolAPI } from './workspace.model';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type PreviewApiItem = ISwaggerImportApiConfigType & {
    selected: boolean;
    tested: boolean;
    testCount?: number; // Track how many times this API has been tested
};

export type TBulkConfigForm = {
    baseUrl: string;
    authorization: {
        authType: AuthorizationType | string;
        meta: {
            username?: string;
            password?: string;
            token?: string;
            headerName?: string;
            headerValue?: string;
            apiKeyIn?: 'header' | 'query' | 'cookie';
            authorizationUrl?: string;
            tokenUrl?: string;
            scopes?: Record<string, string>;
            openIdConnectUrl?: string;
            scheme?: string; // For custom HTTP schemes
            grantType?: AuthenticationGrantType;
            headerPrefix?: string;
            clientId?: string;
            clientSecret?: string;
            audience?: string;
            scope?: string;
        };
    }[];
    previewApis: PreviewApiItem[];
};

export interface TransformedApiOutput {
    apis: ToolAPI[];
}

export interface BulkApiImportStats {
    created: number;
    duplicate: number;
}

export interface BulkApiImportResponse {
    data: unknown[];
    message: string;
    stats: BulkApiImportStats;
}
