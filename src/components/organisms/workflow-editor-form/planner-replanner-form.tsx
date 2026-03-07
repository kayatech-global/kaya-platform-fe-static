'use client';

import React from 'react';
import { Node } from '@xyflow/react';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import {
    Button,
    Checkbox,
    Input,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/atoms/collapsible';
import { cn } from '@/lib/utils';
import { IWorkflowReplannerConfig, PromptTemplate } from '@/models';
import { CustomNodeTypes, GuardrailBindingLevelType } from '@/enums';
import { AgentType } from './agent-form';
import { usePlannerReplanner } from '@/hooks/use-planner-replanner';
import { ChevronDown } from 'lucide-react';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';

export interface PlannerReplannerFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
    onIntellisenseRefetch: () => Promise<void>;
}

export type PlannerReplannerAgent = {
    prompt?: PromptTemplate;
    enableDeterministicExecution?: boolean;
    planConfig?: IWorkflowReplannerConfig;
} & AgentType;

export const PlannerReplannerForm = (props: PlannerReplannerFormProps) => {
    const { isReadOnly } = props;
    const {
        fetchingPrompts,
        fetchingModels,
        fetchingSLMModels,
        fetchingGuardrails,
        isSlm,
        promptsLoading,
        llmModelsLoading,
        slmModelsLoading,
        guardrailLoading,
        promptRef,
        allPrompts,
        allModels,
        allSLMModels,
        guardrailData,
        guardrails,
        prompt,
        nodeType,
        languageModel,
        agentName,
        description,
        enableDeterministicExecution,
        maxReplanAttempts,
        setAgentName,
        setDescription,
        setPrompt,
        setLanguageModel,
        setSlm,
        setGuardrails,
        setEnableDeterministicExecution,
        setMaxReplanAttempts,
        setSelectedNodeId,
        handleSaveNodeData,
        onRefetchPrompt,
        refetchLLM,
        refetchSLM,
        refetchGuardrails,
    } = usePlannerReplanner(props);

    return (
        <React.Fragment>
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden: !fetchingPrompts && !fetchingModels && !fetchingSLMModels && !fetchingGuardrails,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the agent data for you...
                    </p>
                </div>
            </div>
            <div className="group">
                <div
                    className={cn(
                        'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        {
                            hidden: fetchingPrompts || fetchingModels || fetchingSLMModels || fetchingGuardrails,
                        }
                    )}
                >
                    <div className="flex flex-col gap-y-5 pb-4 bottom-gradient-border">
                        <Input
                            label="Name"
                            placeholder="Name of the agent"
                            value={agentName ?? ''}
                            onChange={e => setAgentName(e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Outline the specific tasks and responsibilities you expect this agent to handle"
                            rows={7}
                            value={description ?? ''}
                            onChange={e => setDescription(e.target.value)}
                            readOnly={isReadOnly}
                        />
                        <PromptSelector
                            ref={promptRef}
                            agent={undefined}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            allPrompts={allPrompts as PromptTemplate[]}
                            isReadonly={isReadOnly}
                            promptsLoading={promptsLoading}
                            onRefetch={onRefetchPrompt}
                        />
                        <div className="flex flex-col gap-y-2 mt-6">
                            <LanguageSelector
                                isSlm={isSlm}
                                agent={undefined}
                                languageModel={languageModel}
                                setLanguageModel={setLanguageModel}
                                allModels={allModels}
                                allSLMModels={allSLMModels as never}
                                allSTSModels={[]}
                                isReadonly={isReadOnly}
                                llmModelsLoading={llmModelsLoading}
                                slmModelsLoading={slmModelsLoading}
                                onRefetch={() => {
                                    refetchLLM();
                                    refetchSLM();
                                }}
                                onIntelligenceSourceChange={value => setSlm(value)}
                            />
                        </div>
                    </div>

                    <div
                        className={cn('pb-4', {
                            'bottom-gradient-border': nodeType === CustomNodeTypes.plannerNode,
                        })}
                    >
                        <GuardrailSelector
                            agent={undefined}
                            allGuardrails={guardrailData ?? []}
                            guardrails={guardrails}
                            isReadonly={isReadOnly}
                            guardrailsLoading={guardrailLoading}
                            title="Agent Level Guardrails"
                            level={GuardrailBindingLevelType.AGENT}
                            setGuardrails={setGuardrails}
                            onRefetch={refetchGuardrails}
                        />
                    </div>

                    {nodeType === CustomNodeTypes.plannerNode && (
                        <div className="flex items-center gap-x-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Checkbox
                                            disabled={isReadOnly}
                                            checked={enableDeterministicExecution}
                                            onCheckedChange={e => setEnableDeterministicExecution(!!e)}
                                        />
                                    </TooltipTrigger>
                                    {isReadOnly && (
                                        <TooltipContent side="left" align="center">
                                            You don&apos;t have permission to modify
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                            <p className="text-md font-medium text-gray-400">Enable Deterministic Execution</p>
                        </div>
                    )}

                    {nodeType === CustomNodeTypes.rePlannerNode && (
                        <Collapsible className="border border-gray-300 rounded-md dark:border-gray-700">
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Advanced Configurations
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 pt-2 space-y-4">
                                <div>
                                    <Input
                                        label="Max Replan Attempts"
                                        type="number"
                                        min="1"
                                        max="10"
                                        placeholder="3"
                                        value={maxReplanAttempts?.toString() ?? ''}
                                        onChange={e => {
                                            const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                            setMaxReplanAttempts(value);
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum number of replanning attempts allowed (default: 3)
                                    </p>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}

                    <div className="agent-form-footer flex gap-x-3 justify-end pb-4">
                        <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveNodeData}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
