import { CustomNodeTypes } from '@/enums';
import { IWorkspaceMetadata } from './workspace.model';
import { IWorkflowVisualGraph } from './workflow.model';
import { Node } from '@xyflow/react';

// Context levels for the AI assistant
export type AssistantContextLevel = 'enterprise' | 'workspace' | 'workflow' | 'execution';

// Main context interface that the assistant uses to understand the current location
export interface AssistantContext {
    level: AssistantContextLevel;
    enterprise?: {
        id: string;
        name: string;
        workspaceCount: number;
        totalUsers: number;
    };
    workspace?: {
        id: string;
        name: string;
        description: string;
        metadata: IWorkspaceMetadata[];
        permissions: string[];
    };
    workflow?: {
        id: string;
        name: string;
        version: number;
        isDraft: boolean;
        selectedNode?: Node;
        visualGraphData?: IWorkflowVisualGraph;
    };
    currentPage: string;
    userPermissions: string[];
    timestamp: string;
}

// Chat message interface for conversation history
export interface AssistantChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    context?: AssistantContext;
    actions?: AssistantAction[];
    insights?: ExecutionInsight[];
    isStreaming?: boolean;
}

// Actions that can be suggested by the assistant
export interface AssistantAction {
    type: 'navigate' | 'configure' | 'execute' | 'validate' | 'fix';
    label: string;
    payload: Record<string, unknown>;
    description?: string;
}

// Query intent classification
export type QueryCategory = 
    | 'configuration' 
    | 'execution' 
    | 'navigation' 
    | 'optimization' 
    | 'troubleshooting' 
    | 'general';

export interface QueryIntent {
    category: QueryCategory;
    needsUsageData: boolean;
    needsWorkspaceList: boolean;
    needsWorkflowData: boolean;
    needsExecutionData: boolean;
    needsExecutionTrace: boolean;
    needsConfigValidation: boolean;
    timeRange?: { start: Date; end: Date };
}

// Validation issue for proactive configuration checking
export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationType = 'configuration' | 'performance' | 'compatibility' | 'security';

export interface ValidationIssue {
    id: string;
    severity: ValidationSeverity;
    type: ValidationType;
    message: string;
    suggestion: string;
    autoFixable: boolean;
    location?: {
        nodeId?: string;
        nodeName?: string;
        nodeType?: CustomNodeTypes;
        fieldPath?: string;
    };
}

// Execution insight for performance analysis
export type InsightType = 'performance' | 'cost' | 'reliability' | 'optimization';
export type InsightImpact = 'high' | 'medium' | 'low';

export interface ExecutionInsight {
    id: string;
    type: InsightType;
    title: string;
    description: string;
    impact: InsightImpact;
    recommendation: string;
    metrics?: {
        current: number;
        potential: number;
        unit: string;
    };
}

// Query response from the assistant
export interface AssistantQueryResponse {
    response: string;
    suggestions?: string[];
    actions?: AssistantAction[];
    insights?: ExecutionInsight[];
    validationIssues?: ValidationIssue[];
}

// Settings for the AI assistant
export interface AssistantSettings {
    isEnabled: boolean;
    intelligentSourceId?: string;
    proactiveValidation: boolean;
    executionInsights: boolean;
    optimizationSuggestions: boolean;
}

// State for the AI assistant hook
export interface AssistantState {
    isOpen: boolean;
    isLoading: boolean;
    isStreaming: boolean;
    messages: AssistantChatMessage[];
    context: AssistantContext | null;
    validationIssues: ValidationIssue[];
    insights: ExecutionInsight[];
    sessionId: string;
}

// Streaming response chunk
export interface AssistantStreamChunk {
    type: 'text' | 'action' | 'insight' | 'validation' | 'done';
    content?: string;
    data?: AssistantAction | ExecutionInsight | ValidationIssue;
}
