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
import { PanelSection } from '@/app/editor/[wid]/[workflow_id]/components/panel-section';
import { cn } from '@/lib/utils';
import { IWorkflowReplannerConfig, PromptTemplate } from '@/models';
import { CustomNodeTypes, GuardrailBindingLevelType } from '@/enums';
import { AgentType } from './agent-form';
import { usePlannerReplanner } from '@/hooks/use-planner-replanner';
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
    const { isReadOnly, selectedNode } = props;
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
            <div
                className={cn('group flex flex-col h-[calc(100vh-210px)]', {
                    hidden: fetchingPrompts || fetchingModels || fetchingSLMModels || fetchingGuardrails,
                })}
            >
                {/* Scrollable sections */}
                <div className="agent-form pr-1 flex flex-col gap-y-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">

                    {/* Prompt Instruction */}
                    <PanelSection
                        key={`prompt-${selectedNode.id}`}
                        title="Prompt Instruction"
                        isConfigured={!!prompt}
                    >
                        <div className="flex flex-col gap-y-4">
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
                                rows={5}
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
                        </div>
                    </PanelSection>

                    {/* Intelligence Source */}
                    <PanelSection
                        key={`intelligence-${selectedNode.id}`}
                        title="Intelligence Source"
                        isConfigured={!!languageModel}
                    >
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
                    </PanelSection>

                    {/* Guardrails */}
                    <PanelSection
                        key={`guardrails-${selectedNode.id}`}
                        title="Guardrails"
                        isConfigured={(guardrails?.length ?? 0) > 0}
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
                    </PanelSection>

                    {nodeType === CustomNodeTypes.plannerNode && (
                        <div className="flex items-center gap-x-2 px-1 py-1">
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
                            <p className="text-xs font-medium text-gray-400">Enable Deterministic Execution</p>
                        </div>
                    )}

                    {nodeType === CustomNodeTypes.rePlannerNode && (
                        <PanelSection
                            key={`advanced-${selectedNode.id}`}
                            title="Advanced Configurations"
                            isConfigured={!!maxReplanAttempts}
                        >
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
                        </PanelSection>
                    )}
                </div>

                {/* Sticky footer */}
                <div className="agent-form-footer shrink-0 flex gap-x-3 justify-end pt-3 pb-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData}>
                        Save
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
};
