import React, { useEffect, useState, useMemo } from 'react';
import { AgentType } from '@/components/organisms';
import { useDnD } from '@/context';
import { useApp } from '@/context/app-context';
import { GuardrailBindingLevelType } from '@/enums';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { Badge } from '@/components/atoms/badge';

interface IAgentHoverCardGuardrailProps {
    data: AgentType | VoiceAgent | null;
}

interface IGuardrailRecord {
    id: string | undefined;
    title: string;
    description: string;
    info: React.ReactNode;
}

export const AgentHoverCardGuardrail = ({ data }: IAgentHoverCardGuardrailProps) => {
    const { guardrailStore } = useDnD();
    const { guardrailBinding } = useApp();
    const [displayedGuardrails, setDisplayedGuardrails] = useState<IGuardrailRecord[]>([]);
    const [showAllGuardrails, setShowAllGuardrails] = useState<boolean>(false);
    const [hasMoreGuardrails, setHasMoreGuardrails] = useState<boolean>(false);

    const records = useMemo(() => {
        const _guardrailBinding =
            guardrailBinding?.map(
                x =>
                    ({
                        id: x.guardrailId,
                        title: x.guardrail.name,
                        description: `${x.guardrail.description?.slice(0, 65)}...`,
                        info: (
                            <Badge
                                variant={(() => {
                                    if (x.level === GuardrailBindingLevelType.WORKSPACE) return 'success';
                                    if (x.level === GuardrailBindingLevelType.WORKFLOW) return 'info';
                                    return 'warning';
                                })()}
                                className="text-xs px-2 py-0.5"
                            >
                                {x.level === GuardrailBindingLevelType.WORKSPACE ? 'Workspace Level' : 'Workflow Level'}
                            </Badge>
                        ),
                    } as IGuardrailRecord)
            ) ?? [];

        const _store =
            guardrailStore
                ?.filter(x => data?.guardrails?.includes(x.id as string))
                ?.map(
                    x =>
                        ({
                            id: x.id,
                            title: x.name,
                            description: `${x.description?.slice(0, 65)}...`,
                            info: (
                                <Badge variant="warning" className="text-xs px-2 py-0.5">
                                    Agent Level
                                </Badge>
                            ),
                        } as IGuardrailRecord)
                ) ?? [];

        return [..._guardrailBinding, ..._store];
    }, [guardrailBinding, guardrailStore, data?.guardrails]);

    useEffect(() => {
        if (records?.length > 0) {
            setDisplayedGuardrails(showAllGuardrails ? records : records?.slice(0, 5));
            setHasMoreGuardrails(records?.length > 5);
        } else {
            setDisplayedGuardrails([]);
            setShowAllGuardrails(false);
            setHasMoreGuardrails(false);
        }
    }, [records, showAllGuardrails]);

    return (
        <div className="flex flex-col border-b-[1px] py-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-100 mb-2">Guardrails</p>
            <div className="flex flex-col gap-y-2">
                {records?.length ? (
                    <>
                        {displayedGuardrails?.map((item) => (
                            <React.Fragment key={item.id ?? item.title}>
                                <div className="w-full flex items-start gap-x-2">
                                    <img src="/png/guardrail-prompt.png" width={25} alt={item?.title} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                            {item?.title}
                                        </p>
                                        <p className="text-xs font-regular text-gray-500 dark:text-gray-300 line-clamp-2">
                                            {`${item?.description?.slice(0, 65)}...`}
                                        </p>
                                    </div>
                                </div>
                                <div>{item?.info}</div>
                            </React.Fragment>
                        ))}
                        {hasMoreGuardrails && (
                            <button
                                onClick={() => setShowAllGuardrails(!showAllGuardrails)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium mt-2 text-left"
                            >
                                {showAllGuardrails ? 'Show less' : `Show more (${records?.length - 5} more)`}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-xs font-regular text-gray-400 dark:text-gray-300">No Guardrails found.</p>
                )}
            </div>
        </div>
    );
};
