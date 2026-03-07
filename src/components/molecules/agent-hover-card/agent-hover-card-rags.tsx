import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React, { useState } from 'react';

interface IAgentHoverCardRagsProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardRags = ({ data }: IAgentHoverCardRagsProps) => {
    const [showAllRags, setShowAllRags] = useState(false);

    const displayedRags = showAllRags ? data?.rags : data?.rags?.slice(0, 5);
    const hasMoreRags = (data?.rags?.length as number) > 5;

    return (
        <div className="flex flex-col border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Vector RAGs</p>
                <div className="flex flex-col gap-y-2">
                    {data?.rags?.length ? (
                        <>
                            {displayedRags?.map(rag => (
                                <div className="w-full flex items-start gap-x-2" key={rag?.id}>
                                    <img src="/png/rag-state-icon.png" width={25} alt={rag?.name} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                            {rag?.name}
                                        </p>
                                        <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                            {rag?.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {hasMoreRags && (
                                <button
                                    onClick={() => setShowAllRags(!showAllRags)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium mt-2 text-left"
                                >
                                    {showAllRags ? 'Show less' : `Show more (${data?.rags?.length - 5} more)`}
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No Vector RAGs found.</p>
                    )}
                </div>
            </div>
    );
};
