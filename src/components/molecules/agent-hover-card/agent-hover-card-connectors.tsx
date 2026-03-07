import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardConnectorProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardConnectors = ({ data }: IAgentHoverCardConnectorProps) => {
    return (
        <div className="flex flex-col border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Connectors</p>
                <div className="flex flex-col gap-y-2">
                    {data?.connectors?.length ? (
                        data?.connectors?.map(connector => (
                            <div className="w-full flex items-start gap-x-2" key={connector?.id}>
                                <img src="/png/prompt_image.png" width={25} alt={connector?.name} />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                        {connector?.name}
                                    </p>
                                    <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                        {connector?.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No Connectors found.</p>
                    )}
                </div>
            </div>
    );
};
