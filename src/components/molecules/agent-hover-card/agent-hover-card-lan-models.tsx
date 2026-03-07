import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardLanModelProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardLanModel = ({ data }: IAgentHoverCardLanModelProps) => {
    return (
        <div className="border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-3">Language Model</p>
                {data?.languageModal ? (
                    <div className="w-full flex items-start gap-x-2 popover-svg-container">
                        <div dangerouslySetInnerHTML={{ __html: data?.languageModal?.providerLogo }} />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                {data?.languageModal?.modelName}
                            </p>
                            <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                {data?.languageModal?.modelDescription}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300 ">No language model found.</p>
                )}
            </div>
    );
};
