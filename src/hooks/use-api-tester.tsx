/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { ISwaggerParameter, ISwaggerAuthorizationType } from '@/hooks/use-swagger-parser';
import { AuthorizationType } from '@/enums';

export type UseApiTesterProps = {
    url: string;
    method: string;
    pathParams?: ISwaggerParameter[];
    queryParams?: ISwaggerParameter[];
    bodyParams?: ISwaggerParameter[];
    headers?: ISwaggerParameter[];
    cookieParams?: ISwaggerParameter[];
    auth?: ISwaggerAuthorizationType[];
    payloadFormat?: 'json' | 'form';
};

export type ApiTestResult = {
    loading: boolean;
    response?: any;
    error?: any;
    statusCode?: number;
};

export const useApiTester = () => {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const executeApi = useCallback(async (props: UseApiTesterProps) => {
        const {
            url,
            method,
            pathParams = [],
            queryParams = [],
            bodyParams = [],
            headers = [],
            cookieParams = [],
            auth = [],
            payloadFormat = 'json',
        } = props;

        setLoading(true);
        setResponse(null);
        setError(null);
        setStatusCode(undefined);

        try {
            // Replace path params
            let finalUrl = url;
            pathParams.forEach(p => {
                finalUrl = finalUrl.replace(`{${p.name}}`, encodeURIComponent(p.value));
            });

            // Append query params
            if (queryParams.length) {
                const queryString = queryParams
                    .filter(q => q.name && q.value)
                    .map(q => `${encodeURIComponent(q.name)}=${encodeURIComponent(q.value)}`)
                    .join('&');
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
            }

            // Prepare headers
            const finalHeaders: Record<string, string> = {};
            headers.forEach(h => {
                if (h.name && h.value) finalHeaders[h.name] = h.value;
            });

            // Handle authentication
            auth.forEach(a => {
                switch (a.authType) {
                    case AuthorizationType.BearerToken:
                        if (a.meta?.token) finalHeaders['Authorization'] = `Bearer ${a.meta.token}`;
                        break;
                    case AuthorizationType.BasicAuth:
                        if (a.meta?.username && a.meta?.password) {
                            const encoded = btoa(`${a.meta.username}:${a.meta.password}`);
                            finalHeaders['Authorization'] = `Basic ${encoded}`;
                        }
                        break;
                    case AuthorizationType.APIKey:
                        if (a.meta?.headerName && a.meta?.headerValue) {
                            finalHeaders[a.meta.headerName] = a.meta.headerValue;
                        }
                        break;
                    // Add other auth types as needed
                }
            });

            // Prepare body
            let body: any = null;
            if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                if (payloadFormat === 'json') {
                    body = bodyParams.reduce((acc, p) => {
                        if (p.name) acc[p.name] = parseValue(p.value, p.dataType);
                        return acc;
                    }, {} as Record<string, any>);
                    finalHeaders['Content-Type'] = 'application/json';
                    body = JSON.stringify(body);
                } else if (payloadFormat === 'form') {
                    const form = new FormData();
                    bodyParams.forEach(p => {
                        if (p.name) form.append(p.name, p.value);
                    });
                    body = form;
                    // Let browser set content-type automatically for FormData
                }
            }

            // Execute request
            const res = await fetch(finalUrl, {
                method,
                headers: finalHeaders,
                body,
                credentials: cookieParams.length > 0 ? 'include' : undefined, // include cookies if needed
            });

            setStatusCode(res.status);

            const contentType = res.headers.get('Content-Type') ?? '';
            let data: any;
            if (contentType.includes('application/json')) data = await res.json();
            else data = await res.text();

            if (!res.ok) {
                const err = new Error('API request failed') as Error & { status?: number; data?: unknown };
                err.status = res.status;
                err.data = data;
                throw err;
            }

            setResponse(data);
        } catch (err: any) {
            setError(err);
            setStatusCode(err?.status);
        } finally {
            setLoading(false);
        }
    }, []);

    return { executeApi, loading, response, error, statusCode };
};

// Utility to parse values based on declared type
function parseValue(value: string, dataType: string) {
    switch (dataType) {
        case 'int':
        case 'integer':
            return parseInt(value, 10);
        case 'float':
            return parseFloat(value);
        case 'bool':
        case 'boolean':
            return value === 'true' || value === '1';
        default:
            return value;
    }
}
