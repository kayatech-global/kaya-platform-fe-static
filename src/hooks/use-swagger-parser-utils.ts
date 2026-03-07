/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml';
import { AuthorizationType } from '@/enums';
import type { ISwaggerAuthorizationType, ISwaggerParameter } from './use-swagger-parser-types';

export function resolveRef(ref: string, doc: any): any {
    if (!ref?.startsWith('#/')) return ref;
    const parts = ref.replace(/^#\//, '').split('/');
    return parts.reduce((obj, part) => obj?.[part], doc);
}

export function normalizeType(t?: string): string {
    if (!t) return 'object';
    const lower = t.toLowerCase();
    if (lower === 'integer') return 'int';
    if (lower === 'number') return 'float';
    if (lower === 'boolean' || lower === 'bool') return 'bool';
    return lower;
}

function getTypeFromComposition(schema: any): string | undefined {
    const compositors = [
        () => schema.anyOf?.find((s: any) => s.type && s.type !== 'null')?.type,
        () => schema.oneOf?.find((s: any) => s.type && s.type !== 'null')?.type,
        () => schema.allOf?.find((s: any) => s.type)?.type,
    ];
    for (const get of compositors) {
        const t = get();
        if (t) return t;
    }
    return undefined;
}

function getTypeFromStructure(schema: any): string {
    if (schema.properties || schema.additionalProperties) return 'object';
    if (schema.items) return 'array';
    return 'object';
}

/**
 * Infers the most likely data type from a Swagger/OpenAPI schema.
 *
 * - Handles missing `type` fields by checking `anyOf`, `oneOf`, or `allOf`.
 * - Falls back to `object`, `array`, or `$ref` if no explicit type is found.
 * - Normalizes primitives:
 *   - integer → int
 *   - number → float
 *   - boolean/bool → bool
 *
 * @param {any} schema - The Swagger schema to infer the type from.
 * @returns {string} The inferred and normalized data type.
 */
export function inferSchemaType(schema: any): string {
    if (!schema) return 'object';

    const type = schema.type ?? getTypeFromComposition(schema) ?? getTypeFromStructure(schema);
    return normalizeType(type);
}

function handleObjectPropertyValue(fullKey: string, resolvedVal: any, doc: any, depth: number): ISwaggerParameter[] {
    const nested = flattenObjectProperties(resolvedVal, doc, fullKey, depth + 1);
    return nested.length > 0
        ? nested
        : [
              {
                  name: fullKey,
                  dataType: 'object',
                  value: resolvedVal.example ?? {},
                  description: resolvedVal.description,
              },
          ];
}

function handleArrayPropertyValue(fullKey: string, resolvedVal: any, doc: any, depth: number): ISwaggerParameter[] {
    const itemsSchema = resolvedVal.items;
    if (!itemsSchema) {
        return [
            {
                name: fullKey,
                dataType: 'array',
                value: resolvedVal.example ?? [],
                description: resolvedVal.description,
            },
        ];
    }

    const resolvedItems = itemsSchema.$ref ? resolveRef(itemsSchema.$ref, doc) : itemsSchema;
    const itemType = inferSchemaType(resolvedItems);

    if (itemType === 'object') {
        const arrayKey = `${fullKey}[0]`;
        const nested = flattenObjectProperties(resolvedItems, doc, arrayKey, depth + 1);
        return nested.length > 0
            ? nested
            : [
                  {
                      name: fullKey,
                      dataType: 'array',
                      value: resolvedVal.example ?? [{}],
                      description: resolvedVal.description,
                  },
              ];
    }

    return [
        {
            name: fullKey,
            dataType: 'array',
            value: resolvedVal.example ?? resolvedItems.example ?? [],
            description: resolvedVal.description,
        },
    ];
}

function flattenPropertyValue(fullKey: string, resolvedVal: any, doc: any, depth: number): ISwaggerParameter[] {
    const childType = inferSchemaType(resolvedVal);

    if (childType === 'object') return handleObjectPropertyValue(fullKey, resolvedVal, doc, depth);
    if (childType === 'array') return handleArrayPropertyValue(fullKey, resolvedVal, doc, depth);

    return [
        {
            name: fullKey,
            dataType: childType,
            value: resolvedVal.example ?? resolvedVal.default ?? '',
            description: resolvedVal.description,
        },
    ];
}

function flattenAdditionalProperties(
    resolved: any,
    parentKey: string,
    doc: any,
    depth: number,
    fields: ISwaggerParameter[]
): void {
    const addPropsSchema = resolved.additionalProperties.$ref
        ? resolveRef(resolved.additionalProperties.$ref, doc)
        : resolved.additionalProperties;
    const addPropsKey = parentKey ? `${parentKey}.<key>` : '<key>';
    const addPropsType = inferSchemaType(addPropsSchema);

    if (addPropsType === 'object') {
        fields.push(...flattenObjectProperties(addPropsSchema, doc, addPropsKey, depth + 1));
    } else {
        fields.push({
            name: addPropsKey,
            dataType: addPropsType,
            value: addPropsSchema.example ?? '',
            description: addPropsSchema.description,
        });
    }
}

/**
 * Recursively flattens nested Swagger/OpenAPI object schemas into a flat list of parameters.
 *
 * - Resolves `$ref` references.
 * - Handles `allOf`, `oneOf`, and `anyOf` schema compositions.
 * - Supports nested objects, arrays, and additionalProperties (maps).
 * - Prevents infinite recursion using a depth limit (20).
 *
 * @param {any} schema - The current schema or sub-schema to flatten.
 * @param {any} doc - The full Swagger/OpenAPI document for resolving `$ref` references.
 * @param {string} [parentKey=''] - The parent key path (used for nested property names).
 * @param {number} [depth=0] - Current recursion depth.
 * @returns {ISwaggerParameter[]} A flat list of parameters with name, type, value, and description.
 */
export function flattenObjectProperties(schema: any, doc: any, parentKey = '', depth = 0): ISwaggerParameter[] {
    if (!schema || depth > 20) return []; // Prevent infinite recursion

    const resolved = schema.$ref ? resolveRef(schema.$ref, doc) : schema;
    const fields: ISwaggerParameter[] = [];

    if (resolved.allOf) {
        resolved.allOf.forEach((subSchema: any) => {
            fields.push(...flattenObjectProperties(subSchema, doc, parentKey, depth + 1));
        });
    }
    if (resolved.oneOf?.length) {
        fields.push(...flattenObjectProperties(resolved.oneOf[0], doc, parentKey, depth + 1));
    }
    if (resolved.anyOf?.length) {
        fields.push(...flattenObjectProperties(resolved.anyOf[0], doc, parentKey, depth + 1));
    }

    if (resolved.properties) {
        Object.entries(resolved.properties).forEach(([key, val]: [string, any]) => {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const resolvedVal = val.$ref ? resolveRef(val.$ref, doc) : val;
            fields.push(...flattenPropertyValue(fullKey, resolvedVal, doc, depth));
        });
    }

    if (resolved.additionalProperties && typeof resolved.additionalProperties === 'object') {
        flattenAdditionalProperties(resolved, parentKey, doc, depth, fields);
    }

    return fields;
}

export interface ParsedParameters {
    headers: ISwaggerParameter[];
    query: ISwaggerParameter[];
    path: ISwaggerParameter[];
    cookie: ISwaggerParameter[];
    body: ISwaggerParameter[];
}

function addParamByLocation(
    location: string,
    paramData: ISwaggerParameter,
    result: ParsedParameters,
    p: any,
    schema: any,
    doc: any
): void {
    const locationHandlers: Record<string, () => void> = {
        header: () => result.headers.push(paramData),
        query: () => result.query.push(paramData),
        path: () => result.path.push(paramData),
        cookie: () => result.cookie.push(paramData),
        formData: () => {
            result.body.push(
                paramData.dataType === 'file'
                    ? { name: p.name, dataType: 'file' as const, value: '', description: p.description }
                    : paramData
            );
        },
        body: () => {
            if (schema) {
                const flattened = flattenObjectProperties(schema, doc);
                result.body.push(
                    ...(flattened.length
                        ? flattened
                        : [
                              {
                                  name: 'body',
                                  dataType: inferSchemaType(schema),
                                  value: schema.example ?? {},
                                  description: schema.description,
                              } as ISwaggerParameter,
                          ])
                );
            }
        },
    };
    locationHandlers[location]?.();
}

function processParameter(param: any, doc: any, result: ParsedParameters): void {
    if (!param) return;
    const p = param.$ref ? resolveRef(param.$ref, doc) : param;
    if (!p.in) return;

    let schema = p.schema ?? null;
    if (schema?.$ref) schema = resolveRef(schema.$ref, doc);

    const rawType = p.type || schema?.type || (schema ? inferSchemaType(schema) : 'string');
    const dataType = normalizeType(rawType);

    const paramValue = p.example ?? p.default ?? schema?.example ?? (dataType === 'object' ? {} : '');

    const paramData: ISwaggerParameter = {
        name: p.name,
        dataType,
        value: paramValue,
        description: p.description ?? schema?.description ?? '',
    };

    addParamByLocation(p.in, paramData, result, p, schema, doc);
}

/**
 * Parses and categorizes Swagger/OpenAPI parameters into their respective groups.
 *
 * - Supports parameter locations: `header`, `query`, `path`, `cookie`, `formData`, and `body`.
 * - Resolves `$ref` references and nested schemas.
 * - Handles both Swagger 2 and OpenAPI 3 parameter structures.
 * - Uses `inferSchemaType` and `flattenObjectProperties` for deeper schema parsing.
 *
 * @param {any[]} parameters - The list of parameter definitions from a Swagger/OpenAPI operation.
 * @param {any} doc - The full Swagger/OpenAPI document for resolving `$ref` references.
 * @returns {Record<string, ISwaggerParameter[]>} An object grouping parameters by type.
 */
export function parseParameters(parameters: any[], doc: any): ParsedParameters {
    const result: ParsedParameters = {
        headers: [],
        query: [],
        path: [],
        cookie: [],
        body: [],
    };

    if (parameters) {
        parameters.forEach(param => processParameter(param, doc, result));
    }

    return result;
}

/**
 * Extracts and maps a Swagger/OpenAPI security scheme to a normalized authorization type.
 *
 * - Supports common authentication types: `basic`, `http`, `apiKey`, `oauth2`, `openIdConnect`, and `mutualTLS`.
 * - Handles special HTTP subtypes like `bearer`, `digest`, and custom HTTP schemes.
 * - Returns structured metadata (e.g., token URLs, scopes, header names) for applicable schemes.
 *
 * @param {any} scheme - The Swagger/OpenAPI security scheme object.
 * @returns {ISwaggerAuthorizationType} A normalized authorization object.
 */
export function getAuthorizationFromScheme(scheme: any): ISwaggerAuthorizationType {
    if (!scheme) return { authType: AuthorizationType.NoAuthorization };

    switch (scheme.type) {
        case 'basic':
            return { authType: AuthorizationType.BasicAuth };

        case 'http': {
            const httpScheme = scheme.scheme?.toLowerCase();
            if (httpScheme === 'basic') {
                return { authType: AuthorizationType.BasicAuth };
            }
            if (httpScheme === 'bearer') {
                return { authType: AuthorizationType.BearerToken };
            }
            if (httpScheme === 'digest') {
                return {
                    authType: AuthorizationType.DigestAuth,
                    meta: { scheme: 'digest' },
                };
            }
            // Custom HTTP scheme
            return {
                authType: AuthorizationType.CustomHTTP,
                meta: { scheme: httpScheme },
            };
        }

        case 'apiKey':
            return {
                authType: AuthorizationType.APIKey,
                meta: { headerName: scheme.name, apiKeyIn: scheme.in },
            };

        case 'oauth2': {
            const flows = scheme.flows || {};
            const flowType = Object.keys(flows)[0];
            const flow = flows[flowType] || {};
            return {
                authType: AuthorizationType.OAUTH2,
                meta: {
                    authorizationUrl: flow.authorizationUrl,
                    tokenUrl: flow.tokenUrl,
                    scopes: flow.scopes,
                },
            };
        }

        case 'openIdConnect':
            return {
                authType: AuthorizationType.OpenIDConnect,
                meta: {
                    openIdConnectUrl: scheme.openIdConnectUrl,
                },
            };

        case 'mutualTLS':
            return { authType: AuthorizationType.MutualTLS };

        default:
            return { authType: AuthorizationType.NoAuthorization };
    }
}

/**
 * Parses a Swagger/OpenAPI document from a string, supporting both JSON and YAML.
 */
export function parseSwaggerDoc(text: string): any {
    try {
        return JSON.parse(text);
    } catch {
        return yaml.load(text);
    }
}

/**
 * Derives the base URL from a Swagger/OpenAPI document.
 */
export function deriveBaseUrl(doc: any): string {
    return (
        doc.servers?.[0]?.url ||
        (doc.schemes && doc.host ? `${doc.schemes[0]}://${doc.host}${doc.basePath ?? ''}` : '') ||
        doc.host ||
        ''
    );
}

/**
 * Extracts global security definitions and schemes from a Swagger/OpenAPI document.
 */
export function extractSecuritySchemes(doc: any) {
    return {
        globalSecurity: doc.security ?? [],
        globalSchemes: doc.securityDefinitions ?? doc.components?.securitySchemes ?? {},
    };
}

/**
 * Updates a list of unique authorization types with newly collected ones.
 */
export function extractUniqueAuths(
    collectedAuths: ISwaggerAuthorizationType[],
    newAuths: ISwaggerAuthorizationType[]
): void {
    newAuths.forEach(auth => {
        if (!collectedAuths.some(a => JSON.stringify(a) === JSON.stringify(auth))) {
            collectedAuths.push(auth);
        }
    });
}
