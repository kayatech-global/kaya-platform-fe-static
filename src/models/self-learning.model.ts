/* eslint-disable @typescript-eslint/no-explicit-any */
import { LearningModeType, LearningSourceType } from '@/enums';
import { IMessageBrokerFeedbackTopic } from './message-broker.model';
import { IBasicIntelligentSource } from './common.model';

type ConfigurationMapping = {
    titleMapping: string;
    descriptionMapping: string;
};

export enum RequestToolType {
    API = 'api_tool',
    Connector = 'connector',
    MessageBroker = 'message_broker',
}

export enum ConnectorType {
    Empty = '',
    Pega = 'pega',
    DataBase = 'database',
    MySQL = 'mysql',
    PostgreSQL = 'postgresql',
    SQLite = 'sqlite',
    RedShift = 'redshift',
}

export type FeedbackRequestType = {
    type: RequestToolType;
    connectorType?: ConnectorType;
    id: string;
    configuration?: {
        caseTypeId: string;
        caseCreateUrl: string;
        mapping: ConfigurationMapping;
    };
    messageBroker?: IMessageBrokerFeedbackTopic;
};

export type IOutputInstruction = {
    name: string;
    dataType: string;
    value: string;
};

export interface ISelfLearning {
    enableLearning: boolean;
    learningSource: LearningSourceType | undefined;
    learningType: LearningModeType | undefined;
    retry: boolean;
    intelligentSource: IBasicIntelligentSource | undefined;
    maxSummaryLength: number | undefined;
    overridePrompt: boolean;
    overrideMaxSummaryLength: boolean;
    promptId: string | undefined;
    feedbackRequestIntegration?: FeedbackRequestType;
    feedbackTriggeringCriteria?: string;
    additionalCriteria?: string[];
    outputInstructions: IOutputInstruction[];
    //New fields for self-learning v2
    enable_metadata_filter: boolean;
    feedbackAuthoring: boolean;
    allowedAuthors?: string[];
    metadataFilter?: string;
    similarityScoreThreshold?: number;
    embedding?: string;
}

export interface ILearning {
    id: string;
    name: string;
    description: string;
    workflowId: string;
    workflowName: string;
    referredAgents: string[];
    createdAt: string;
    tags: string[];
    isReadOnly?: boolean;
}

export interface ILearningForm {
    id?: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
}

export interface ILearningAllModule {
    memoryStores: ILearningModule[];
    ragModules: ILearningModule[];
}

export interface ILearningModule {
    id: string;
    name: string;
    description: string;
}

export interface ILearningOption {
    source: LearningSourceType;
    title: string;
    description: string;
}

export interface IFeedbackLearningMetadata {
    tags?: string[];
    category?: string;
    timestamp?: string;
    reviewed_by?: string;
    importance_level?: string;
    __additional?: string;
    [key: string]: any;
}

export interface IFeedbackLearning {
    id: string;
    feedback: string;
    workflowId: string;
    sessionId: string;
    agentId: string;
    agentName: string;
    metadata: IFeedbackLearningMetadata;
    rationale: string;
    type: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    isReadOnly: boolean;
    context?: string | null;
    similarity_score?: number | null;
    feedbackStatus?: string;
    updatedBy?: string;
    approvedBy?: string;
    createdBy?: string;
    approvedAt?: string;
    mustLearn?: boolean;
    learningSummary?: string | null;
    feedbackRequestReason?: string | null;
    approvalComment?: string | null;
    supportingFile: string[] | [];
    groupItems:IFeedbackLearning[];
    canAuthor: boolean;
}

export interface ILearningAgent {
    agent_id: string;
    agent_name: string;
    feedbacks: IFeedbackLearning[];
}

export interface ILearningWorkflow {
    workflow_id: string;
    workflow_name: string;
    agents: ILearningAgent[];
}
