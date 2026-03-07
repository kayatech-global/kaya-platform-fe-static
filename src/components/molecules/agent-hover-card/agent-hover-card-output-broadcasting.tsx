import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import {  IMessagePublisher } from '@/models';
import React from 'react';
import Image from 'next/image';

interface IAgentHoverCardOutputBroadcastingProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardOutputBroadcasting = ({ data }: IAgentHoverCardOutputBroadcastingProps) => {
    // Type assertion to access publisherIntegration property
    const agentData = data as AgentType & { publisherIntegration?: IMessagePublisher };
    
    return (
        <div className="pt-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-3">Output Broadcasting</p>
                {agentData?.publisherIntegration ? (
                    <div className="w-full flex items-start gap-x-2">
                        <Image
                            src="/png/output-broadcasting.png"
                            width={25}
                            height={25}
                            alt="Output Broadcasting"
                        />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                Output Broadcasting Configured
                            </p>
                            <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                Message broker topic configured for output broadcasting
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No output broadcasting found.</p>
                )}
            </div>
    );
};
