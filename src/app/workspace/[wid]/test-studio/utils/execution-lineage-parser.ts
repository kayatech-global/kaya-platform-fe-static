/* eslint-disable @typescript-eslint/no-explicit-any */
import { LineageSubStepExplanationType } from '@/enums/data-lineage-type';
import { IDataLineageVisualGraph } from '@/models';

export interface IExecutionLineageStep {
    error?: string;
    status: string;
    stepId: string;
    entityId: string;
    stepName: string;
    stepType: string;
    isSubStep: boolean;
    modelName?: string;
    stepIndex: number;
    subStepId?: string;
    toolInput?: string;
    entityName: string;
    entityType: string;
    executedAt: string;
    toolOutput?: string;
    creditsUsed?: number;
    stepEndedAt?: string;
    subStepName?: string;
    userMessage?: string;
    subStepIndex?: number | null;
    systemPrompt?: string;
    outputMessage?: string;
    stepStartedAt?: string;
    computeSeconds?: number;
    inputTokenCount?: number;
    outputTokenCount?: number;
    conversationHistory?: any[];
}

/**
 * Parse execution lineage from API response and convert to graph format
 */
export function parseExecutionLineage(executionLineage: IExecutionLineageStep[]): IDataLineageVisualGraph {
    
    if (!executionLineage || executionLineage.length === 0) {
        return { nodes: [], edges: [], variables: undefined };
    }

    const nodes: any[] = [];
    const edges: any[] = [];

    // Sort by stepIndex and subStepIndex to maintain order
    const sortedSteps = [...executionLineage].sort((a, b) => {
        if (a.stepIndex !== b.stepIndex) {
            return a.stepIndex - b.stepIndex;
        }
        const aSubIndex = a.subStepIndex ?? 0;
        const bSubIndex = b.subStepIndex ?? 0;
        return aSubIndex - bSubIndex;
    });

    let previousNodeId: string | null = null;

    sortedSteps.forEach((step) => {
        // Skip if required properties are missing
        if (!step.stepType || !step.stepId) {
            return;
        }

        // Generate unique node ID
        const nodeId = `${step.stepType.toLowerCase()}-${step.stepId}`;

        // Determine node type based on stepType
        let nodeType = 'decision_node'; // Default for agents
        let label = 'Agent';

        if (step.isSubStep) {
            if (step.stepType === 'LLM') {
                nodeType = LineageSubStepExplanationType.LLM;
                label = 'LLM';
            } else if (step.stepType === 'TOOL' || step.stepType === 'API') {
                nodeType = LineageSubStepExplanationType.API;
                label = 'Tool';
            } else {
                // Handle other sub-step types if needed
                nodeType = step.stepType;
                label = step.stepType;
            }
        }

        // Create node
        const node: any = {
            id: nodeId,
            type: nodeType,
            data: {
                name: step.entityName || step.stepName || 'Unknown',
                label: label,
                description: step.stepName || '',
                status: step.status,
            },
            position: { x: 0, y: 0 }, 
        };

        nodes.push(node);


        // Create edge from previous node to current node
        if (previousNodeId) {
            const edgeId = `e-${previousNodeId}-${nodeId}`;
            const edge: any = {
                id: edgeId,
                type: step.isSubStep ? 'straight' : 'smoothstep',
                source: previousNodeId,
                target: nodeId,
                animated: true,
            };
            edges.push(edge);
        }

        previousNodeId = nodeId;
    });

    

    return { nodes, edges, variables: undefined };
}
