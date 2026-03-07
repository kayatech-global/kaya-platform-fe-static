import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { LEARNING_LIST } from '@/constants';
import { ILearningOption, ISelfLearning } from '@/models';
import React from 'react';

interface IAgentHoverCardSelfLearningProps {
    data: AgentType | VoiceAgent | null;
}

export const AgentHoverCardSelfLearning = ({ data }: IAgentHoverCardSelfLearningProps) => {
    const learningSource = (item: ISelfLearning) => {
        return LEARNING_LIST.find(x => x.source === item?.learningSource) as ILearningOption;
    };

    return (
        <div className="border-b-[1px] py-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-3">Self Learning</p>
                {data?.selfLearning ? (
                    <div className="w-full flex items-start gap-x-2">
                        <img
                            src="/png/knowledge.png"
                            width={25}
                            alt={learningSource(data?.selfLearning)?.description}
                        />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                {learningSource(data?.selfLearning)?.title}
                            </p>
                            <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                {learningSource(data?.selfLearning)?.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No self learning found.</p>
                )}
            </div>
    );
};
