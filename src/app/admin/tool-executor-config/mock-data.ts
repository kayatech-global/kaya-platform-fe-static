// ──────────────────────────────────────────────
// REQ-017  Tool Executor Node – Mock Data
// ──────────────────────────────────────────────

export type ToolType = 'REST_API' | 'MCP' | 'DATABASE';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ParamValueType = 'string' | 'number' | 'boolean' | 'object' | 'array';
export type MappingMode = 'variable' | 'static';
export type LineageStatus = 'SUCCESS' | 'FAILED';

export interface KeyValuePair {
    key: string;
    value: string;
}

export interface ToolInputParam {
    name: string;
    type: ParamValueType;
    required: boolean;
    description: string;
}

export interface VariableMapping {
    param: ToolInputParam;
    mode: MappingMode;
    variableRef: string; // e.g. "{{Variable:customer_id}}"
    staticValue: string;
}

export interface RestApiConfig {
    url: string;
    method: HttpMethod;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    requestBody: string;
}

export interface ToolExecutorNodeConfig {
    nodeId: string;
    nodeName: string;
    toolType: ToolType;
    toolName: string;
    restApiConfig: RestApiConfig;
    inputMappings: VariableMapping[];
    propagateError: boolean;
}

export interface StructuredErrorShape {
    errorType: string;
    errorMessage: string;
    httpStatusCode: number | null;
    toolName: string;
    timestamp: string;
    success: false;
}

export interface LineageRecord {
    id: string;
    nodeType: 'Tool Executor';
    toolName: string;
    status: LineageStatus;
    executedAt: string;
    durationMs: number;
    inputParams: Record<string, string>;
    output: Record<string, unknown> | null;
    errorDetails: StructuredErrorShape | null;
}

// ──────────────────────────────────────────────
// Workflow variables available for mapping
// ──────────────────────────────────────────────
export const WORKFLOW_VARIABLES: string[] = [
    '{{Variable:customer_id}}',
    '{{Variable:auth_token}}',
    '{{Variable:user_email}}',
    '{{Variable:session_id}}',
    '{{Variable:request_timestamp}}',
    '{{Variable:workspace_id}}',
    '{{Variable:channel}}',
];

// ──────────────────────────────────────────────
// Mock: Fetch Customer Profile tool config
// ──────────────────────────────────────────────
export const MOCK_TOOL_CONFIG: ToolExecutorNodeConfig = {
    nodeId: 'tool-exec-node-01',
    nodeName: 'fetch_customer_profile',
    toolType: 'REST_API',
    toolName: 'Fetch Customer Profile',
    restApiConfig: {
        url: 'https://api.example.com/v1/customers/{{Variable:customer_id}}/profile',
        method: 'GET',
        headers: [
            { key: 'Authorization', value: 'Bearer {{Variable:auth_token}}' },
            { key: 'Content-Type', value: 'application/json' },
            { key: 'X-Workspace-Id', value: '{{Variable:workspace_id}}' },
        ],
        queryParams: [
            { key: 'include_history', value: 'true' },
            { key: 'format', value: 'json' },
        ],
        requestBody: '',
    },
    inputMappings: [
        {
            param: { name: 'customer_id', type: 'string', required: true, description: 'Unique customer identifier' },
            mode: 'variable',
            variableRef: '{{Variable:customer_id}}',
            staticValue: '',
        },
        {
            param: { name: 'auth_token', type: 'string', required: true, description: 'Bearer authentication token' },
            mode: 'variable',
            variableRef: '{{Variable:auth_token}}',
            staticValue: '',
        },
        {
            param: { name: 'include_history', type: 'boolean', required: false, description: 'Include activity history in response' },
            mode: 'static',
            variableRef: '',
            staticValue: 'true',
        },
        {
            param: { name: 'workspace_id', type: 'string', required: false, description: 'Scoping workspace identifier' },
            mode: 'variable',
            variableRef: '{{Variable:workspace_id}}',
            staticValue: '',
        },
    ],
    propagateError: true,
};

// ──────────────────────────────────────────────
// Mock: Success lineage record
// ──────────────────────────────────────────────
export const MOCK_LINEAGE_SUCCESS: LineageRecord = {
    id: 'lin-exec-0421',
    nodeType: 'Tool Executor',
    toolName: 'Fetch Customer Profile',
    status: 'SUCCESS',
    executedAt: '2025-06-12T09:14:33.221Z',
    durationMs: 312,
    inputParams: {
        customer_id: 'cust-7821',
        auth_token: '••••••••••••••••',
        include_history: 'true',
        workspace_id: 'ws-prod-001',
    },
    output: {
        customerId: 'cust-7821',
        fullName: 'Aria Chen',
        email: 'aria.chen@example.com',
        plan: 'Enterprise',
        status: 'active',
        createdAt: '2023-08-01T00:00:00Z',
        lastActive: '2025-06-11T18:40:00Z',
        history: [
            { event: 'login', timestamp: '2025-06-11T18:40:00Z' },
            { event: 'export_report', timestamp: '2025-06-10T14:22:00Z' },
        ],
    },
    errorDetails: null,
};

// ──────────────────────────────────────────────
// Mock: Failed lineage record
// ──────────────────────────────────────────────
export const MOCK_LINEAGE_FAILED: LineageRecord = {
    id: 'lin-exec-0422',
    nodeType: 'Tool Executor',
    toolName: 'Fetch Customer Profile',
    status: 'FAILED',
    executedAt: '2025-06-12T09:17:05.888Z',
    durationMs: 5021,
    inputParams: {
        customer_id: 'cust-9999',
        auth_token: '••••••••••••••••',
        include_history: 'true',
        workspace_id: 'ws-prod-001',
    },
    output: null,
    errorDetails: {
        errorType: 'HTTP_CLIENT_ERROR',
        errorMessage: 'Customer not found: no record exists for id cust-9999',
        httpStatusCode: 404,
        toolName: 'Fetch Customer Profile',
        timestamp: '2025-06-12T09:17:10.909Z',
        success: false,
    },
};

// ──────────────────────────────────────────────
// Error output schema (for preview display)
// ──────────────────────────────────────────────
export const ERROR_SCHEMA_PREVIEW = {
    errorType: 'string  // e.g. HTTP_CLIENT_ERROR | TIMEOUT | PARSE_ERROR',
    errorMessage: 'string  // human-readable description',
    httpStatusCode: 'number | null  // HTTP status if applicable',
    toolName: 'string  // name of the tool that failed',
    timestamp: 'string  // ISO 8601',
    success: false,
};
