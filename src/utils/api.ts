import config from '@/config/environment-variables';
import { ComponentType } from '@/enums';

interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface FetchError extends Error {
    status?: number;
    message: string;
    url?: string;
    component?: ComponentType;
    errors?: string[];
}

export interface OtherOptions {
    accessToken?: string;
    component?: ComponentType;
    contentType?: string;
    autoContentType?: boolean;
    denyRedirectOnForbidden?: boolean;
}

async function parseErrorResponse(
    response: globalThis.Response
): Promise<{ message?: string; error?: string; errors?: string[] }> {
    try {
        return await response.json();
    } catch {
        return { message: 'API request failed' };
    }
}

function buildFetchError(
    errorData: { message?: string; error?: string; errors?: string[] },
    response: globalThis.Response,
    other?: OtherOptions
): FetchError {
    return {
        message: errorData?.message ?? errorData?.error ?? 'API request failed',
        status: response.status,
        url: response.url,
        name: 'FetchError',
        cause: response.statusText,
        stack: response.type,
        component: other?.component,
        errors: errorData?.errors ?? [],
    };
}

export const $fetch = async <T>(url: string, options: RequestInit = {}, other?: OtherOptions) => {
    const token = other?.accessToken;
    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(typeof options.headers === 'object' && !Array.isArray(options.headers)
            ? (options.headers as Record<string, string>)
            : {}),
    };

    if (!other?.autoContentType) {
        headers['Content-Type'] = other?.contentType ?? 'application/json';
    }

    const response = await fetch(`${config.BASE_API_URL}${url}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body || null,
    });

    if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        const error = buildFetchError(errorData, response, other);
        throw error;
    }

    try {
        return (await response.json()) as ApiResponse<T>;
    } catch {
        return {} as ApiResponse<T>;
    }
};

export default $fetch;
