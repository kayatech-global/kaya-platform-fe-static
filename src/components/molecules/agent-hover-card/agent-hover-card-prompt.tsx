import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardPromptProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardPrompt = ({ data }: IAgentHoverCardPromptProps) => {
    return (
        <div className="border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-3">Prompt Instruction</p>
                {data?.prompt ? (
                    <div className="w-full flex items-start gap-x-2">
                        <img src="/png/prompt_image.png" width={25} alt={data?.prompt?.name} />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{data?.prompt?.name}</p>
                            <p className="text-xs font-regular text-gray-500 dark:text-gray-300  line-clamp-2">
                                {data?.prompt?.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300 ">No prompt found.</p>
                )}
            </div>
    );
};
