import { AgentType } from '@/components/organisms';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { IAuthorization } from '@/models';

export type MCP = {
    id: string;
    name: string;
    description: string;
};

export type MCPSelectorProps = {
    agent?: AgentType;
    mcpServers: IMCPBody[];
    setMcpServers: (mcpServers: IMCPBody[]) => void;
    onRefetch: () => void;
    isReadonly?: boolean;
    loading?: boolean;
    isMultiple?: boolean;
    allMcpTools: {
        id: string;
        toolId: string;
        name: string;
        description: string;
        isReadOnly?: boolean;
        configurations: {
            url: string;
            transport: string;
            timeout?: number;
            retryCount?: number;
            authorization: IAuthorization;
            selected_tools?: string[];
        };
    }[];
    onMcpChange?: (mcp: IMCPBody[]) => void;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
};
