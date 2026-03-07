import { WorkspaceCardProps } from '@/components/molecules/workspace-card/workspace-card';
import { IOption } from './common.model';
import { IAuthorization, IHeaderValues, ICredentials } from './configuration.model';

export interface IWorkspace {
    id?: string;
    licenseKey?: string;
    name: string;
    description: string;
    metadata?: IWorkspaceMetadata[];
    adminEmails: string[];
    userEmails: string[];
}

export interface IWorkspaceForm extends IWorkspace {
    email?: string;
}

export interface IWorkspaceResponse {
    id: number;
    uuid: string;
    name: string;
    description: string;
}

export interface Workflow {
    id?: string;
    name: string;
    description: string;
    workspaceId?: string;
    tags: {
        list: IOption[];
    };
    isReadOnly?: boolean;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    configurations: {
        prompt_template: string;
    };
    isReadOnly?: boolean;
}

export interface ToolAPI {
    id?: string;
    name: string;
    description?: string;
    configurations: {
        defaultApiParameters: string;
        url: string;
        method: string;
        headers: IHeaderValues[];
        payload: string;
        authorization: IAuthorization;
        promotedVariables: string;
        concurrencyLimit?: number | null;
    };
    type?: string;
    isReadOnly?: boolean;
}

export interface ExecutableFunctionAPI {
    id?: string;
    name: string;
    description: string;
    configurations: {
        provider: string;
        startupOption: string;
        language: string;
        code: string;
        payload: string;
        region: string;
        functionUrl?: string;
        credentials: ICredentials;
        dependencies?: Record<string, string>;
        environment?: Record<string, string>;
    };
    type?: string;
    isReadOnly?: boolean;
}

export interface ToolGuardrailAPI {
    id?: string;
    name: string;
    description?: string;
    configurations: {
        url: string;
        method: string;
        guardrailType: string;
        guardrailApiProvider: string;
        headers: IHeaderValues[];
        payload: string;
        authorization: IAuthorization;
        promotedVariables: string;
    };
    type?: string;
    isReadOnly?: boolean;
}

export interface WorkFlowMessageExecute {
    message: string;
    workflow_id: string;
    session_id: string;
    apikey: string;
    auth_type?: 'API_KEY' | 'SSO';
    [x: string]: unknown;
}

export interface Configuration {
    humanInput: {
        instructions: string;
        isHumanInput: boolean;
    };
}

interface Tool {
    id: string;
    type: string;
}
export interface AgentsType {
    id: string;
    name: string;
    type: string;
    description: string;
    configurations: Configuration;
    llmId: string;
    slmId: string;
    promptTemplateId: string;
    tools: Tool[];
    isActive: boolean;
    createdBy: number;
    isReadOnly: boolean;
    isDeleted: boolean;
}

export interface KnowledgeGraphResponse {
    id?: string;
    name: string;
    description?: string;
    configurations: {
        associatedDatabase: string;
        embeddingModel: string;
        status: 'active' | 'inactive';
        entityTypes: string[];
        relationshipTypes: string[];
        traversalSettings: {
            maxDepth: number;
            relationshipFilters: string[];
            nodeFilters: string[];
        };
        inferenceRules?: string;
    };
    isReadOnly?: boolean;
}

export interface IWorkspaceMetadata {
    name: string;
    value: string;
    modelNameOption?: IOption;
}

export interface IGroupWorkspace {
    metadataValue: string;
    workspaces: WorkspaceCardProps[];
}

export interface IWorkspaceUserResponse {
    email: string;
    roleId: number;
}