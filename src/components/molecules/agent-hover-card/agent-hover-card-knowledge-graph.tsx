import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import React, { useState } from 'react';

interface IAgentHoverCardRagsProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardKnowledgeGraph = ({ data }: IAgentHoverCardRagsProps) => {
    const [showAllKnowledgeGraphs, setShowAllKnowledgeGraphs] = useState(false);

    const displayedKnowledgeGraphs = showAllKnowledgeGraphs
        ? data?.knowledgeGraphs
        : data?.knowledgeGraphs?.slice(0, 5);

    const hasMoreKnowledgeGraphs = (data?.knowledgeGraphs?.length as number) > 5;

    return (
        <div className="flex flex-col border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Graph RAGs</p>
                <div className="flex flex-col gap-y-2">
                    {data?.knowledgeGraphs?.length ? (
                        <>
                            {displayedKnowledgeGraphs?.map(kg => (
                                <div className="w-full flex items-start gap-x-2" key={kg?.id}>
                                    <img src="/png/kg.png" width={25} alt={kg?.name} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                            {kg?.name}
                                        </p>
                                        <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                            {kg?.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {hasMoreKnowledgeGraphs && (
                                <button
                                    onClick={() => setShowAllKnowledgeGraphs(!showAllKnowledgeGraphs)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium mt-2 text-left"
                                >
                                    {showAllKnowledgeGraphs
                                        ? 'Show less'
                                        : `Show more (${data?.knowledgeGraphs?.length - 5} more)`}
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No Graph RAGs found.</p>
                    )}
                </div>
            </div>
    );
};
