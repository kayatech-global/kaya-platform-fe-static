import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React from 'react';

interface IAgentHoverCardExecutableFunctionsProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardExecutableFunctions = ({ data }: IAgentHoverCardExecutableFunctionsProps) => {
    return (
        <div className="flex flex-col border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Executable Functions</p>
                <div className="flex flex-col gap-y-2">
                    {data?.executableFunctions?.length ? (
                        data?.executableFunctions?.map(func => (
                            <div className="w-full flex items-start gap-x-2" key={func?.id}>
                                <img src="/png/api.png" width={25} alt={func?.name} />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">{func?.name}</p>
                                    <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                        {func?.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs font-regular text-gray-400 dark:text-gray-300">
                            No Executable Functions found.
                        </p>
                    )}
                </div>
            </div>
    );
};
