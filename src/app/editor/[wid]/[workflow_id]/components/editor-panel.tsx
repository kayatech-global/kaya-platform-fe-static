/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useDnD } from '@/context';
import { IConnectorForm, IGraphRag, ISLMForm, ISTSForm, IVectorRag, IWorkflowGraphResponse } from '@/models';
import { Edge, Node, useEdges, useNodes } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
import { NodeSnippetSection } from './node-snippet-section';
import { AgentForm, IteratorForm, ToolExecutorForm, ExternalAgentForm } from '@/components/organisms';
import { VoiceAgentForm } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { cn } from '@/lib/utils';
import { SubWorkFlowForm } from '@/components/organisms/workflow-editor-form/sub-workflow-form';
import { StartNodeForm } from '@/components/organisms/workflow-editor-form/start-node-form';
import { EndNodeForm } from '@/components/organisms/workflow-editor-form/end-node-form';
import { CustomNodeTypes } from '@/enums';
import { PlannerReplannerForm } from '@/components/organisms/workflow-editor-form/planner-replanner-form';
import { FileProcessingAgentForm } from '@/components/organisms/workflow-editor-form/file-processing-agent-form';
import {
    ApiToolResponseType,
    ExecutableFunctionResponseType,
    PromptResponse,
} from '@/app/workspace/[wid]/agents/components/agent-form';
import { IMCPBody } from '@/hooks/use-mcp-configuration';

export interface EditorPanelAgentProps {
    allPrompts: PromptResponse[] | undefined;
    allModels: any;
    allSLMModels: ISLMForm[] | undefined;
    allSTSModels: ISTSForm[] | undefined;
    allApiTools: ApiToolResponseType[] | undefined;
    allMcpTools: IMCPBody[] | undefined;
    allGraphRag: IGraphRag[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    allConnectors: IConnectorForm[] | undefined;
    allExecutableFunctions: ExecutableFunctionResponseType[] | undefined;
    fetchingPrompts: boolean;
    fetchingModels: boolean;
    fetchingSLMModels: boolean;
    fetchingSTSModels: boolean;
    fetchingApiTools: boolean;
    fetchingMcp: boolean;
    fetchingGraphRag: boolean;
    fetchingConnectors: boolean;
    promptsLoading: boolean;
    llmModelsLoading: boolean;
    slmModelsLoading: boolean;
    stsModelsLoading: boolean;
    apiLoading: boolean;
    mcpLoading: boolean;
    vectorRagLoading: boolean;
    executableFunctionsLoading: boolean;
    refetchPrompts: () => Promise<unknown>;
    refetchLLM: () => Promise<unknown>;
    refetchSLM: () => Promise<unknown>;
    refetchSTS: () => Promise<unknown>;
    refetchApiTools: () => Promise<unknown>;
    refetchMcp: () => Promise<unknown>;
    refetchGraphRag: () => Promise<unknown>;
    refetchVectorRag: () => Promise<unknown>;
    refetchConnectors: () => Promise<unknown>;
    refetchExecutableFunctions: () => Promise<unknown>;
}

interface EditorPanelProps extends EditorPanelAgentProps {
    isReadOnly?: boolean;
    workflow?: IWorkflowGraphResponse;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
    onIntellisenseRefetch: () => Promise<void>;
}

export const EditorPanel = (props: EditorPanelProps) => {
    const { isReadOnly, workflow, setHasChanges, onIntellisenseRefetch } = props;
    const [surroundingNodeImages, setSurroundingNodeImages] = useState<(string | null)[]>([]);
    const [isSupervisorAgent, setIsSupervisorAgent] = useState<boolean>(false);
    const { selectedNodeId } = useDnD();
    const nodes = useNodes();
    const edges = useEdges();
    const selectedNodeInfo = nodes.find(n => n.id === selectedNodeId);

    const getNodeImage = (nodeType: CustomNodeTypes) => {
        switch (nodeType) {
            case CustomNodeTypes.startNode:
                return '/png/nodes/start.png';
            case CustomNodeTypes.endNode:
                return '/png/nodes/end.png';
            case CustomNodeTypes.agentNode:
                return '/png/nodes/agent.png';
            case CustomNodeTypes.decisionNode:
                return '/png/nodes/decision_agent_node_preview.png';
            case CustomNodeTypes.plannerNode:
                return '/png/nodes/planner_agent_node_preview.png';
            case CustomNodeTypes.rePlannerNode:
                return '/png/nodes/replanner_agent_node_preview.png';
            case CustomNodeTypes.voiceNode:
                return '/png/nodes/voice_agent_preview.png';
            case CustomNodeTypes.fileProcessingAgentNode:
                return '/png/nodes/file_processing_agent_preview.png';
            case CustomNodeTypes.iteratorNode:
                return '/png/nodes/iterator-node-preview.png';
            case CustomNodeTypes.subflowNode:
                return '/png/nodes/workflow-node-preview.png';
            case CustomNodeTypes.toolExecutorNode:
                return '/png/nodes/tool_executor_preview.png';
            case CustomNodeTypes.externalAgentNode:
                return '/png/nodes/external_agent_preview.png';
        }
    };

    const getSurroundingNodes = (nodes: Node[], edges: Edge[], selectedNode: Node) => {
        if (!selectedNode) return [null, null, null];

        // Find edges where the selected node is a target (incoming connections)
        const incomingEdge = edges.find(edge => edge.target === selectedNode.id);
        const previousNode = incomingEdge ? nodes.find(node => node.id === incomingEdge.source) : null;

        // Find edges where the selected node is a source (outgoing connections)
        const outgoingEdge = edges.find(edge => edge.source === selectedNode.id);
        const nextNode = outgoingEdge ? nodes.find(node => node.id === outgoingEdge.target) : null;

        return [
            getNodeImage(previousNode?.type as CustomNodeTypes),
            getNodeImage(selectedNode.type as CustomNodeTypes),
            getNodeImage(nextNode?.type as CustomNodeTypes),
        ];
    };

    useEffect(() => {
        if (selectedNodeInfo) {
            const images = getSurroundingNodes(nodes, edges, selectedNodeInfo);
            setSurroundingNodeImages((images ?? []).map(img => img ?? null));
            setIsSupervisorAgent(selectedNodeInfo?.data?.overrideType === CustomNodeTypes.supervisorAgentTemplate);
        } else {
            setIsSupervisorAgent(false);
        }
    }, [selectedNodeInfo]);

    if (!selectedNodeInfo) {
        return <div />;
    }

    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-900 rounded flex flex-col gap-y-6 pl-[10px] pr-[2px] pt-3 min-w-[335px] !w-[335px]'
            )}
        >
            <div className="editor-header flex flex-col gap-y-3 pb-5 bottom-gradient-border">
                <p className="text-md text-gray-700 dark:text-gray-100 font-medium">
                    {isSupervisorAgent ? 'Supervisor Agent' : ((selectedNodeInfo?.data?.label as string) ?? ' ')}
                </p>
                <NodeSnippetSection surroundingNodeImages={surroundingNodeImages} />
            </div>
            <div className="editor-fields">
                {(selectedNodeInfo.type === CustomNodeTypes.agentNode ||
                    selectedNodeInfo.type === CustomNodeTypes.decisionNode ||
                    selectedNodeInfo.type === CustomNodeTypes.loaderNode ||
                    selectedNodeInfo.type === CustomNodeTypes.cleanerNode ||
                    selectedNodeInfo.type === CustomNodeTypes.wranglerNode ||
                    selectedNodeInfo.type === CustomNodeTypes.deepAgentNode ||
                    selectedNodeInfo.type === CustomNodeTypes.reportNode) && (
                    <AgentForm
                        {...props}
                        selectedNode={selectedNodeInfo}
                        workflow={workflow}
                        isReadOnly={isReadOnly}
                        onIntellisenseRefetch={onIntellisenseRefetch}
                    />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.voiceNode && (
                    <VoiceAgentForm
                        {...props}
                        selectedNode={selectedNodeInfo}
                        isReadOnly={isReadOnly}
                        onIntellisenseRefetch={onIntellisenseRefetch}
                    />
                )}
                {(selectedNodeInfo.type === CustomNodeTypes.plannerNode ||
                    selectedNodeInfo.type === CustomNodeTypes.rePlannerNode) && (
                    <PlannerReplannerForm
                        {...props}
                        selectedNode={selectedNodeInfo}
                        isReadOnly={isReadOnly}
                        onIntellisenseRefetch={onIntellisenseRefetch}
                    />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.subflowNode && (
                    <SubWorkFlowForm selectedNode={selectedNodeInfo} isReadOnly={isReadOnly} />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.iteratorNode && (
                    <IteratorForm selectedNode={selectedNodeInfo} isReadOnly={isReadOnly} />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.startNode && (
                    <StartNodeForm
                        selectedNode={selectedNodeInfo}
                        isReadOnly={isReadOnly}
                        setHasChanges={setHasChanges}
                    />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.endNode && (
                    <EndNodeForm selectedNode={selectedNodeInfo} isReadOnly={isReadOnly} />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.fileProcessingAgentNode && (
                    <FileProcessingAgentForm selectedNode={selectedNodeInfo} isReadOnly={isReadOnly} />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.toolExecutorNode && (
                    <ToolExecutorForm
                        {...props}
                        selectedNode={selectedNodeInfo}
                        isReadOnly={isReadOnly}
                    />
                )}
                {selectedNodeInfo.type === CustomNodeTypes.externalAgentNode && (
                    <ExternalAgentForm
                        selectedNode={selectedNodeInfo}
                        isReadOnly={isReadOnly}
                    />
                )}
            </div>
        </div>
    );
};
