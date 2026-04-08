import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { ISelfLearning } from './self-learning.model';
import { IGraphRag } from './graph-rag.model';
import { IVectorRag } from './vector-rag.model';
import { IMessagePublisher, INodeHumanInput } from './node.model';
import { IConnectorForm } from './configuration.model';
import { AgentCategory, IHorizonConfig, IPublishStatus } from './horizon-agent.model';

export interface Tool {
    id: string;
    type: string;
}

export interface IAgentForm {
    id?: string;
    agentName: string;
    agentDescription: string;
    agentType: string;
    humanInput?: INodeHumanInput;
    tools: Tool[];
    llmId?: string;
    slmId?: string;
    promptTemplateId: string;
    isReadOnly?: boolean;
    selfLearning?: ISelfLearning;
    mcpServers?: IMCPBody[];
    knowledgeGraphs?: IGraphRag[];
    rags?: IVectorRag[];
    publisherIntegration?: IMessagePublisher;
    guardrails?: string[];
    connectors?: IConnectorForm[];
    // This property is using for intelligence source validation purpose
    sourceValue?: string;
    // Horizon Agent specific fields
    agentCategory?: AgentCategory;
    horizonConfig?: IHorizonConfig;
    publishStatus?: IPublishStatus;
}
export interface IAgent {
    id?: string;
    name: string;
    description: string;
    type: string;
    configurations: {
        humanInput?: INodeHumanInput;
        selfLearning?: ISelfLearning;
        mcpServers?: IMCPBody[];
        knowledgeGraphs?: IGraphRag[];
        rags?: IVectorRag[];
        publisherIntegration?: IMessagePublisher;
        guardrails?: string[];
        connectors?: IConnectorForm[];
    };
    llmId?: string;
    slmId?: string;
    promptTemplateId: string;
    tools: Tool[];
    isReadOnly?: boolean;
    // Horizon Agent specific fields
    agentCategory?: AgentCategory;
    horizonConfig?: IHorizonConfig;
    publishStatus?: IPublishStatus;
}

export interface Agent extends Omit<IAgent, 'id'> {
    id: string;
}
