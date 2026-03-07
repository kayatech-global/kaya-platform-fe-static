/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useReactFlow } from '@xyflow/react';
import { useApp } from '@/context/app-context';
import { IWorkflowReplannerConfig } from '@/models';
import { PromptSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import { IntelligenceSourceModel, Prompt } from '@/components/organisms/workflow-editor-form/agent-form';
import { useDnD } from '@/context';
import { CustomNodeTypes } from '@/enums';
import { PlannerReplannerFormProps } from '@/components/organisms/workflow-editor-form/planner-replanner-form';
import { useGuardrailQuery } from './use-common';

export const usePlannerReplanner = ({
    selectedNode,
    allPrompts,
    allModels,
    allSLMModels,
    fetchingPrompts,
    fetchingModels,
    fetchingSLMModels,
    promptsLoading,
    llmModelsLoading,
    slmModelsLoading,
    onIntellisenseRefetch,
    refetchPrompts,
    refetchLLM,
    refetchSLM,
}: PlannerReplannerFormProps) => {
    const { guardrailBinding } = useApp();
    const { trigger, setSelectedNodeId, setTrigger, setGuardrailStore } = useDnD();
    const { updateNodeData } = useReactFlow();
    const promptRef = useRef<PromptSelectorRef>(null);
    const [agentName, setAgentName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const [isSlm, setSlm] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<Prompt>();
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [guardrails, setGuardrails] = useState<string[] | undefined>();
    const [enableDeterministicExecution, setEnableDeterministicExecution] = useState<boolean>(false);
    const [maxReplanAttempts, setMaxReplanAttempts] = useState<number | undefined>(undefined);

    useEffect(() => {
        const results = getFilteredGuardrails(guardrails);
        setGuardrails(results);
    }, [guardrailBinding]);

    // update agent form based on the selected agent node data
    useEffect(() => {
        setAgentName(selectedNode?.data?.name ? (selectedNode.data?.name as string) : undefined);
        setDescription(selectedNode?.data?.description ? (selectedNode.data?.description as string) : undefined);
        const prompt = selectedNode?.data?.prompt as Prompt;
        setPrompt(
            prompt
                ? {
                      id: prompt.id,
                      name: prompt.name,
                      description: prompt.description,
                      configurations: prompt.configurations,
                  }
                : undefined
        );
        const languageModel = selectedNode?.data?.languageModal as IntelligenceSourceModel;
        setLanguageModel(
            languageModel
                ? {
                      id: languageModel.id,
                      provider: languageModel.provider,
                      modelName: languageModel.modelName,
                      modelId: languageModel.modelId,
                      modelDescription: languageModel.modelDescription,
                      providerLogo: languageModel.providerLogo,
                      modelUniqueId: languageModel.modelUniqueId,
                  }
                : undefined
        );

        // Set guardrails from node data
        const guardrailsData = selectedNode?.data?.guardrails as string[];
        if (guardrailsData === undefined) {
            setGuardrails(undefined);
        } else {
            const results = getFilteredGuardrails(guardrailsData);
            setGuardrails(results);
        }

        const enableDeterministic =
            selectedNode?.type === CustomNodeTypes.plannerNode
                ? (selectedNode?.data?.enableDeterministicExecution as boolean)
                : false;
        setEnableDeterministicExecution(enableDeterministic ?? undefined);

        // Load advanced configurations for replanner
        const nodeConfig = selectedNode?.data?.planConfig as IWorkflowReplannerConfig;

        setMaxReplanAttempts(nodeConfig?.maxReplanAttempts);

        setSlm(!!(selectedNode?.data?.languageModal as any)?.isSlm);
    }, [selectedNode]);

    const nodeType = useMemo(() => {
        if (selectedNode?.type === CustomNodeTypes.plannerNode) {
            return CustomNodeTypes.plannerNode;
        }
        return CustomNodeTypes.rePlannerNode;
    }, [selectedNode?.type]);

    const {
        isFetching: fetchingGuardrails,
        data: guardrailData,
        isLoading: guardrailLoading,
        refetch: refetchGuardrails,
    } = useGuardrailQuery({
        onSuccess: data => {
            setGuardrailStore(data);
        },
        onError: () => {
            setGuardrailStore([]);
        },
    });

    const handleSaveNodeData = async () => {
        // ⚠️ Important:
        // If you modify or add new (object or array) properties here, update `updateNodeData` in use-workflow-editor.ts file accordingly.

        const planConfig: IWorkflowReplannerConfig | undefined =
            nodeType === CustomNodeTypes.rePlannerNode && maxReplanAttempts != null ? { maxReplanAttempts } : undefined;

        updateNodeData(selectedNode.id, {
            name: agentName,
            description: description,
            prompt:
                prompt === undefined
                    ? undefined
                    : {
                          id: prompt?.id,
                          name: prompt?.name,
                          description: prompt?.description,
                          configurations: prompt?.configurations,
                      },
            languageModal:
                languageModel === undefined
                    ? undefined
                    : {
                          id: languageModel?.id,
                          provider: languageModel?.provider,
                          modelName: languageModel?.modelName,
                          modelDescription: languageModel?.modelDescription,
                          modelId: languageModel?.modelId,
                          providerLogo: languageModel.providerLogo,
                          isSlm: isSlm,
                      },
            guardrails: guardrails && guardrails?.length > 0 ? guardrails : [],
            enableDeterministicExecution:
                nodeType === CustomNodeTypes.plannerNode ? enableDeterministicExecution : undefined,
            planConfig,
        });
        toast.success('Agent updated');
        await Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    const onRefetchPrompt = async () => {
        await refetchPrompts();
        onIntellisenseRefetch();
    };

    const getFilteredGuardrails = (data: string[] | undefined) => {
        if (guardrailBinding && guardrailBinding?.length > 0 && data && data?.length > 0) {
            const results = guardrailBinding?.map(x => x.guardrailId);
            const filteredIds = data.filter(id => !results.includes(id));
            return filteredIds?.length > 0 ? filteredIds : undefined;
        } else {
            return data;
        }
    };

    return {
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
    };
};
