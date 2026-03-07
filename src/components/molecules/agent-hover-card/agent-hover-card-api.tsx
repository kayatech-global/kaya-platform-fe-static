import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { useState } from 'react';

interface IAgentHoverCardAPIProps {
    data: AgentType | VoiceAgent | null;
    hideApi?: boolean;
}

export const AgentHoverCardAPI = ({ data, hideApi }: IAgentHoverCardAPIProps) => {
    const [showAllApis, setShowAllApis] = useState(false);

    const displayedApis = showAllApis ? data?.apis : data?.apis?.slice(0, 5);
    const hasMoreApis = (data?.apis?.length as number) > 5;

    return (
        <>
            {!hideApi && (
                <div className="flex flex-col border-b-[1px] py-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">API</p>
                    <div className="flex flex-col gap-y-2">
                        {data?.apis?.length ? (
                            <>
                                {displayedApis?.map(api => (
                                    <div className="w-full flex items-start gap-x-2" key={api?.id}>
                                        <img src="/png/api.png" width={25} alt={api?.name} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                                {api?.name}
                                            </p>
                                            <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                                {api?.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {hasMoreApis && (
                                    <button
                                        onClick={() => setShowAllApis(!showAllApis)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium mt-2 text-left"
                                    >
                                        {showAllApis ? 'Show less' : `Show more (${data?.apis?.length - 5} more)`}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No APIs found.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
