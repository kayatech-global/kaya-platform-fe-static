import { AgentType } from '@/components/organisms';
import { PlannerReplannerAgent } from '@/components/organisms/workflow-editor-form/planner-replanner-form';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';

interface IAgentHoverCardRagsProps {
    data: AgentType | VoiceAgent | PlannerReplannerAgent | null;
}

export const AgentHoverCardDeterministicExecution = ({ data }: IAgentHoverCardRagsProps) => {
    const agent = data as PlannerReplannerAgent;

    return (
        <div className="flex flex-col py-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Deterministic Execution</p>
            <div className="flex flex-col gap-y-2">
                <p className="text-xs font-regular text-gray-400 dark:text-gray-300">
                    {agent?.enableDeterministicExecution ? 'Enabled' : 'Disabled'}
                </p>
            </div>
        </div>
    );
};
