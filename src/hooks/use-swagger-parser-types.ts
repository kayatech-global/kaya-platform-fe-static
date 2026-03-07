import { AuthenticationGrantType, AuthorizationType } from '@/enums';
import { IHeaderValues } from '@/models';

export interface ISwaggerParameter extends IHeaderValues {
    description?: string;
}

export interface ISwaggerAuthorizationType {
    authType: AuthorizationType;
    meta?: {
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
}

export interface ISwaggerImportApiConfigType {
    id: string;
    apiName: string;
    apiUrl: string;
    apiPath: string;
    apiMethod: string;
    apiHeaders: ISwaggerParameter[];
    payloadFormat: string;
    description: string;
    authorization: ISwaggerAuthorizationType[];
    queryParams: ISwaggerParameter[];
    pathParams: ISwaggerParameter[];
    cookieParams: ISwaggerParameter[];
    bodyParams: ISwaggerParameter[];
    promotedVariables: ISwaggerParameter[];
}
