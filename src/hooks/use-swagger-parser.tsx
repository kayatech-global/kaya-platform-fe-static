/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AuthorizationType } from '@/enums';
import {
    deriveBaseUrl,
    extractSecuritySchemes,
    extractUniqueAuths,
    flattenObjectProperties,
    getAuthorizationFromScheme,
    inferSchemaType,
    parseParameters,
    parseSwaggerDoc,
    resolveRef,
} from './use-swagger-parser-utils';
import type {
    ISwaggerAuthorizationType,
    ISwaggerImportApiConfigType,
    ISwaggerParameter,
} from './use-swagger-parser-types';

export type {
    ISwaggerParameter,
    ISwaggerAuthorizationType,
    ISwaggerImportApiConfigType,
} from './use-swagger-parser-types';

const SKIP_METHODS = new Set(['parameters', '$ref']);

function parseRequestBody(operation: any, doc: any, bodyParams: ISwaggerParameter[]): boolean {
    const content = operation.requestBody?.content;
    const mediaType = Object.keys(content ?? {})[0];
    const schema = content?.[mediaType]?.schema;
    if (!schema) return true;

    const resolvedSchema = schema.$ref ? resolveRef(schema.$ref, doc) : schema;
    if (!resolvedSchema) {
        bodyParams.push({
            name: 'body',
            dataType: 'object',
            value: '',
            description: `Referenced schema ${schema.$ref} not found.`,
        });
        return false;
    }

    const flattened = flattenObjectProperties(resolvedSchema, doc);
    if (flattened.length) {
        bodyParams.push(...flattened);
    } else {
        bodyParams.push({
            name: 'body',
            dataType: inferSchemaType(resolvedSchema),
            value: resolvedSchema.example ?? {},
            description: resolvedSchema.description,
        });
    }
    return true;
}

function collectOperationAuths(
    operation: any,
    globalSecurity: any[],
    globalSchemes: Record<string, any>
): ISwaggerAuthorizationType[] {
    const opSecurity = operation.security ?? globalSecurity;
    const operationAuths: ISwaggerAuthorizationType[] = [];

    if (Object.keys(globalSchemes).length && opSecurity?.length) {
        for (const sec of opSecurity) {
            for (const schemeKey of Object.keys(sec)) {
                const scheme = globalSchemes[schemeKey];
                if (scheme) {
                    operationAuths.push(getAuthorizationFromScheme(scheme));
                }
            }
        }
    }

    return operationAuths.length > 0 ? operationAuths : [{ authType: AuthorizationType.NoAuthorization }];
}

interface ProcessOperationContext {
    baseUrl: string;
    doc: any;
    isOpenAPI3: boolean;
    globalSecurity: any[];
    globalSchemes: Record<string, any>;
}

function processOperation(
    path: string,
    method: string,
    operation: any,
    ctx: ProcessOperationContext
): ISwaggerImportApiConfigType | null {
    if (!operation || SKIP_METHODS.has(method)) return null;

    const { baseUrl, doc, isOpenAPI3, globalSecurity, globalSchemes } = ctx;
    const apiName = operation.operationId ?? operation.summary ?? `${method.toUpperCase()} ${path}`;
    const description = operation.description ?? operation.summary ?? '';
    const apiUrl = `${baseUrl}${path}`;
    const apiPath = path;
    const apiMethod = method.toUpperCase();

    let bodyParams: ISwaggerParameter[] = [];
    let payloadFormat = 'application/json';

    const parsed = operation.parameters ? parseParameters(operation.parameters, doc) : null;
    const apiHeaders = parsed?.headers ?? [];
    const queryParams = parsed?.query ?? [];
    const pathParams = parsed?.path ?? [];
    const cookieParams = parsed?.cookie ?? [];

    if (parsed) {
        bodyParams = parsed.body;
    }

    if (isOpenAPI3 && operation.requestBody) {
        payloadFormat = Object.keys(operation.requestBody.content ?? {})[0] ?? 'application/json';
        if (!parseRequestBody(operation, doc, bodyParams)) return null;
    }

    const operationAuths = collectOperationAuths(operation, globalSecurity, globalSchemes);

    return {
        id: `${method.toLowerCase()}_${path.replaceAll(/[/{}]/g, '_')}`,
        apiName,
        apiUrl,
        apiPath,
        apiMethod,
        apiHeaders,
        payloadFormat,
        description,
        authorization: operationAuths,
        queryParams,
        pathParams,
        cookieParams,
        bodyParams,
        promotedVariables: [],
    };
}

function processPaths(
    paths: Record<string, any>,
    ctx: ProcessOperationContext
): { configs: ISwaggerImportApiConfigType[]; auths: ISwaggerAuthorizationType[] } {
    const tempConfigs: ISwaggerImportApiConfigType[] = [];
    const collectedAuths: ISwaggerAuthorizationType[] = [];

    for (const [path, methods] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(methods as Record<string, any>)) {
            const config = processOperation(path, method, operation, ctx);
            if (config) {
                tempConfigs.push(config);
                extractUniqueAuths(collectedAuths, config.authorization);
            }
        }
    }

    return { configs: tempConfigs, auths: collectedAuths };
}

export const useSwaggerParser = () => {
    const [importedBaseUrl, setImportedBaseUrl] = useState<string>('');
    const [importedApiConfigs, setImportedApiConfigs] = useState<ISwaggerImportApiConfigType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isValidSwagger, setIsValidSwagger] = useState<boolean>(true);
    const [importedAuthTypes, setImportedAuthTypes] = useState<ISwaggerAuthorizationType[]>([]);

    // === MAIN PARSER ===
    const parseSwaggerFile = useCallback(async (files: File[]) => {
        if (!files?.length) {
            setImportedBaseUrl('');
            setImportedApiConfigs([]);
            setImportedAuthTypes([]);
            setIsValidSwagger(true);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const file = files[0];
            const text = await file.text();
            const doc = parseSwaggerDoc(text);

            if (!doc?.paths || (!doc?.swagger && !doc?.openapi)) {
                toast.warning('The file does not contain a valid Swagger/OpenAPI specification.');
                setIsValidSwagger(false);
                throw new Error('Invalid Swagger/OpenAPI specification.');
            }

            setIsValidSwagger(true);

            const isOpenAPI3 = !!doc.openapi?.startsWith('3');
            const baseUrl = deriveBaseUrl(doc);
            setImportedBaseUrl(baseUrl);

            const { globalSecurity, globalSchemes } = extractSecuritySchemes(doc);
            const { configs, auths } = processPaths(doc.paths, {
                baseUrl,
                doc,
                isOpenAPI3,
                globalSecurity,
                globalSchemes,
            });

            setImportedAuthTypes(auths);
            setImportedApiConfigs(configs);
        } catch (err: any) {
            console.error('Swagger parsing error:', err);
            setError(err.message ?? 'Failed to parse Swagger file');
        } finally {
            setLoading(false);
        }
    }, []);

    return { importedBaseUrl, importedApiConfigs, loading, error, parseSwaggerFile, isValidSwagger, importedAuthTypes };
};
