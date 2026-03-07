const FIELD_LABEL_MAP: Record<string, string> = {
    // URLs
    baseUrl: 'Base URL',
    baseURL: 'Base URL',
    tokenEndpointUrl: 'Token Endpoint URL',
    tokenEndpointURL: 'Token Endpoint URL',
    clusterUrl: 'Cluster URL',
    url: 'URL',
    endpoint: 'Endpoint',
    api: 'API',
    // Secrets
    accessKeyId: 'Access Key ID',
    secretKey: 'Secret Key',
    apiKey: 'API Key',
    clientSecret: 'Client Secret',
    clientKey: 'Client Key',
    serverUrlConfig: 'Server URL Config',
    apiAuthorization: 'API Key',
    clientSecretReference: 'Client Secret Reference',
    lambdaExecutionRoleArn: 'Role',
    // Text
    userName: 'User Name',
    databaseName: 'Database Name',
    clientId: 'Client ID',
    clientID: 'Client ID',
    tenantId: 'Tenant ID',
    // Manual
    apis: 'API',
    languageModal: 'Language Model',
};

/**
 * Converts a field name to a human-readable label.
 *
 * @param {string} fieldName - The field name to convert (e.g., 'baseUrl', 'accessKey').
 * @param {string} [type] - Optional type that determines how the label should be formatted or adjusted (e.g., 'api', 'database', 'ui').
 * @returns {string} The human-readable label (e.g., 'Base URL', 'Access Key').
 */
export const getFieldLabel = (fieldName: string, type?: string): string => {
    if (!fieldName) return '';

    // specific overrides based on type
    if (fieldName === 'url' && type === 'voiceConfig') return 'Webhook URL';
    if (fieldName === 'headerValue' && type === 'apis') return 'API Key';

    if (FIELD_LABEL_MAP[fieldName]) {
        return FIELD_LABEL_MAP[fieldName];
    }

    const result = fieldName.replaceAll(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};
