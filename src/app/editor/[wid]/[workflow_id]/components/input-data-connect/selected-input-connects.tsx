'use client';

import React, { useMemo } from 'react';
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/atoms/accordion';
import { AgentHoverCardHeader } from '@/components/molecules/agent-hover-card/agent-hover-card-header';
import { AgentHoverCardAPI } from '@/components/molecules/agent-hover-card/agent-hover-card-api';
import { AgentHoverCardMCP } from '@/components/molecules/agent-hover-card/agent-hover-card-mcp';
import { AgentHoverCardRags } from '@/components/molecules/agent-hover-card/agent-hover-card-rags';
import { AgentHoverCardKnowledgeGraph } from '@/components/molecules/agent-hover-card/agent-hover-card-knowledge-graph';
import { AgentHoverCardConnectors } from '@/components/molecules/agent-hover-card/agent-hover-card-connectors';
import { AgentHoverCardExecutableFunctions } from '@/components/molecules/agent-hover-card/agent-hover-card-executable-functions';

interface SelectedInputConnectsProps {
    data: AgentType | VoiceAgent | null;
    hideApi?: boolean;
    label?: string;
    labelClassName?: string;
}

export const SelectedInputConnects: React.FC<SelectedInputConnectsProps> = ({
    data,
    hideApi,
    label,
    labelClassName,
}) => {
    const selectedCounts = useMemo(
        () => ({
            api: data?.apis?.length ?? 0,
            mcp_server: data?.mcpServers?.length ?? 0,
            vector_rag: data?.rags?.length ?? 0,
            graph_rag: data?.knowledgeGraphs?.length ?? 0,
            connector: data?.connectors?.length ?? 0,
            executable_function: data?.executableFunctions?.length ?? 0,
        }),
        [data]
    );
    const totalCount = Object.values(selectedCounts).reduce((sum, val) => sum + val, 0);
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem
                value="input-data-connect"
                className="border  border-gray-300 rounded-md bg-muted/40 overflow-hidden"
            >
                <AccordionTrigger className="px-3 py-2 no-underline hover:no-underline">
                    <div className="flex items-center w-full">
                        <p className={`text-sm font-medium text-gray-700 dark:text-gray-400 ${labelClassName ?? ''}`}>
                            {totalCount > 0
                                ? (label ?? 'Input data connects attached')
                                : `0 ${label ?? 'Input data connects attached'}`}
                        </p>
                        {totalCount > 0 && (
                            <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
                                {totalCount}
                            </span>
                        )}
                    </div>
                </AccordionTrigger>

                <AccordionContent className="bg-gray-50 dark:bg-gray-900 py-3 px-3" forceMount>
                    <div
                        className="agent-hover-card-inner-content overflow-y-auto max-h-[400px]
                            [&::-webkit-scrollbar]:w-[6px]
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:transparent
                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                            dark:[&::-webkit-scrollbar-thumb]:bg-gray-700"
                    >
                        <AgentHoverCardHeader data={data} />
                        <AgentHoverCardAPI data={data} hideApi={hideApi} />
                        <AgentHoverCardMCP data={data} />
                        <AgentHoverCardRags data={data} />
                        <AgentHoverCardKnowledgeGraph data={data} />
                        <AgentHoverCardConnectors data={data} />
                        <AgentHoverCardExecutableFunctions data={data} />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};
