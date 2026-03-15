import { startCase } from 'lodash';

/** Path segment index 3 labels (e.g. /workspace/[id]/[wid]/learnings -> learnings) */
export const BREADCRUMB_LABELS_LEVEL_3: Record<string, string> = {
    'intelligence-source-configs': 'Intelligence Source Configs',
    'api-configurations': 'API Configurations',
    'mcp-configurations': 'MCP Configurations',
    learnings: 'Learning Records',
    'guardrails-api-configurations': 'Guardrails API Configurations',
    'configure-connections': 'Configure Connections',
};

/** Path segment index 4 labels (nested sections) */
export const BREADCRUMB_LABELS_LEVEL_4: Record<string, string> = {
    'llm-configurations': 'LLM Configurations',
    'slm-configurations': 'SLM Configurations',
    'sts-configurations': 'STS Configurations',
    'vector-rag-configurations': 'Vector RAG Configurations',
    'graph-rag-configurations': 'Graph RAG Configurations',
    'setup-message-broker': 'Setup Message Broker',
    connectors: 'Connectors',
    databases: 'Databases',
    'guardrails-api-configurations': 'Guardrails API Configurations',
};

/** Page title by path (for getPageTitle) */
export const PAGE_TITLE_BY_PATH: Record<string, string> = {
    workspaces: 'Workspaces Management',
    usage: 'Usage',
    learnings: 'Learning Records',
    'api-configurations': 'API Configurations',
    'mcp-configurations': 'MCP Configurations',
    'workflow-authoring': 'Workflow Authoring',
    'workflow-tags': 'Workflow Tags',
    'llm-configurations': 'LLM Configurations',
    'slm-configurations': 'SLM Configurations',
    'sts-configurations': 'STS Configurations',
    'graph-rag-configurations': 'Graph RAG Configurations',
    'vector-rag-configurations': 'Vector RAG Configurations',
    'memory-store-configurations': 'Memory Store Configurations',
    'test-suite-report-generation': 'Test Suite Executions',
    'test-suite-creation': 'Test Suites',
    'embedding-models': 'Embedding Models',
    're-ranking-models': 'Re Ranking Models',
    'setup-message-broker': 'Message Broker',
    connectors: 'Connectors',
    databases: 'Databases',
    'setup-guardrails': 'Setup Guardrails',
    'guardrails-api-configurations': 'Guardrails API Configurations',
    'guardrails-model-configurations': 'Guardrails Model Configurations',
};

export function getBreadcrumbLabelLevel3(segment: string | undefined): string {
    if (!segment) return '';
    return BREADCRUMB_LABELS_LEVEL_3[segment] ?? startCase(segment.replaceAll(/-/g, ' '));
}

export function getBreadcrumbLabelLevel4(segment: string | undefined): string {
    if (!segment) return '';
    return BREADCRUMB_LABELS_LEVEL_4[segment] ?? startCase(segment.replaceAll(/-/g, ' '));
}

export function getPageTitleFromPath(pathSegments: string[]): string {
    const p1 = pathSegments[1];
    const p3 = pathSegments[3];
    const p4 = pathSegments[4];
    if (p1 === 'workspaces') return PAGE_TITLE_BY_PATH.workspaces;
    if (p3 && PAGE_TITLE_BY_PATH[p3]) return PAGE_TITLE_BY_PATH[p3];
    if (p4 && PAGE_TITLE_BY_PATH[p4]) return PAGE_TITLE_BY_PATH[p4];
    return startCase(p3?.replaceAll(/-/g, ' ') ?? '');
}
