import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';
import Image from 'next/image';

interface IAgentHoverCardHumanInputProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardHumanInput = ({ data }: IAgentHoverCardHumanInputProps) => {
    const agentData = data as AgentType;

    return (
        <div className="border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-3">Human Review</p>
                {agentData?.humanInput?.enableHumanInput ? (
                    <div className="w-full flex items-start gap-x-2">
                        <Image
                            src="/png/knowledge.png"
                            width={25}
                            height={25}
                            alt="Human Review"
                        />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Human Review
                            </p>
                                {agentData.humanInput.instruction ? (
                                    <span
                                        className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2"
                                        title={agentData.humanInput.instruction}
                                    >
                                        {agentData.humanInput.instruction.length > 65
                                            ? agentData.humanInput.instruction.slice(0, 62) + '...'
                                            : agentData.humanInput.instruction}
                                    </span>
                                ) : (
                                    <span className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                        Human review configured for this agent
                                    </span>
                                )}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No human review found.</p>
                )}
            </div>
    );
};
