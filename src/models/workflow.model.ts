import { MessageBrokerTriggerType } from '@/enums';
import { IOption } from './common.model';
import { ISharedItem } from './intellisense.model';
import { Edge, Node } from '@xyflow/react';
import { IMessageBrokerSelector } from './message-broker.model';

export interface IWorkflowAuthoringForm {
    id?: string;
    name: string;
    description: string;
    options: IOption[];
    isReadOnly?: boolean;
}

export interface WorkflowAgents {
    id: string;
    name: string;
    type: string;
    description: string;
    configurations: Record<string, unknown>; // Assuming an object with dynamic keys
    LLMId: string;
    PromptTemplateId: string;
    tools: string[];
    isActive: boolean;
    isDeleted: boolean;
}

export interface IWorkflowLimit {
    workflowLimit: number;
}

export interface IWorkflowVariable {
    apis: unknown[];
    workflows: ISharedItem[];
}

export interface IWorkflowTypes {
    name: string;
    version: number;
}

export interface IWorkflowGraphResponse {
    id: string;
    name: string;
    description: string;
    version?: string;
    isActive: boolean;
    isDeleted: boolean;
    visualGraphData: { nodes: Node[]; edges: Edge[]; variables: IWorkflowVariable };
    isReadOnly?: boolean;
    isDraft: boolean;
    availableVersions: IWorkflowTypes[];
}

export interface IWorkflowTrigger {
    messageBroker?: IMessageBrokerSelector;
    recurring?: string;
    type: MessageBrokerTriggerType;
}

export interface IWorkFlowAvatarConfiguration {
    avatar_configs: {
        provider: string;
        api_key: string;
        replica_id: string;
    };
    stt_configs: {
        provider: string;
        api_key: string;
        model?: string;
        // AWS Transcribe specific fields
        region?: string;
        secret_access_key?: string;
    };
    tts_configs: {
        provider: string;
        api_key: string;
        voice_id: string;
        model?: string;
        // AWS Polly specific fields
        region?: string;
        secret_access_key?: string;
    };
    idle_timeout_secs?: number;
    vad_stop_secs?: number;
    enable_fillers?: boolean;
    // Video Integrated settings
    video_integrated?: {
        enabled: boolean;
        persona_context: string;
        conversation_context?: string;
        info_content?: string;
    };
}
export interface IWorkFlowAvatarConfigurationResponse {
    id: string;
    config: IWorkFlowAvatarConfiguration;
}

export interface IWorkflowVisualGraph {
    nodes: Node[];
    edges: Edge[];
}

export interface IWorkflowReplannerAdvancedConfig {
    planConfig?: IWorkflowReplannerConfig;
}

export interface IWorkflowReplannerConfig {
    maxReplanAttempts?: number;
}

export interface IWorkflowAvailabilityResponse {
    isAvailable: boolean;
}
