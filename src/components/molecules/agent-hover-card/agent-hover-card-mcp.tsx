import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardMCPProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardMCP = ({ data }: IAgentHoverCardMCPProps) => {
    return (
        <div className="flex flex-col border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">MCP Servers</p>
                <div className="flex flex-col gap-y-2">
                    {data?.mcpServers?.length ? (
                        data?.mcpServers?.map(mcp => (
                            <div className="w-full flex items-start gap-x-2" key={mcp?.id}>
                                <img src="/png/mcp-icon.png" width={25} alt={mcp?.name} />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{mcp?.name}</p>
                                    <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                        {mcp?.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No MCPs found.</p>
                    )}
                </div>
            </div>
    );
};
