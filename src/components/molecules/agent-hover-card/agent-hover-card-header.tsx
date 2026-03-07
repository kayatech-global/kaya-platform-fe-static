import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardHeaderProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardHeader = ({ data }: IAgentHoverCardHeaderProps) => {
    return (
        <>
            {(data?.name || data?.description) && (
                <div className="flex flex-col border-b-[1px] pb-3">
                    {data?.name && <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{data?.name}</p>}
                    {data?.description && (
                        <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                            {data?.description}
                        </p>
                    )}
                </div>
            )}
        </>
    );
};
