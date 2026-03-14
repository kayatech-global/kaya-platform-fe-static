import { CustomNodeTypes } from '@/enums';
import { AssistantContext, ValidationIssue } from '@/models/ai-assistant.model';
import { Node } from '@xyflow/react';

/**
 * Service to perform proactive validation of workflow configurations
 * and identify potential issues before execution.
 */
class ValidationService {
    /**
     * Validate the current context and return any issues found
     */
    async validateContext(context: AssistantContext): Promise<ValidationIssue[]> {
        const issues: ValidationIssue[] = [];

        if (context.level === 'workflow' && context.workflow?.visualGraphData) {
            issues.push(...this.validateWorkflowConfiguration(context.workflow.visualGraphData));
        }

        return issues;
    }

    /**
     * Validate workflow visual graph data
     */
    private validateWorkflowConfiguration(visualGraphData: AssistantContext['workflow']['visualGraphData']): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        if (!visualGraphData?.nodes) {
            return issues;
        }

        const nodes = visualGraphData.nodes;

        for (const node of nodes) {
            const nodeIssues = this.validateNode(node, nodes);
            issues.push(...nodeIssues);
        }

        // Validate workflow-level issues
        issues.push(...this.validateWorkflowStructure(nodes, visualGraphData.edges || []));

        return issues;
    }

    /**
     * Validate a single node configuration
     */
    private validateNode(node: Node, allNodes: Node[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeType = node.type as CustomNodeTypes;
        const nodeData = node.data as Record<string, unknown>;

        switch (nodeType) {
            case CustomNodeTypes.voiceNode:
                issues.push(...this.validateVoiceAgent(node, nodeData));
                break;
            case CustomNodeTypes.agentNode:
                issues.push(...this.validateAgentNode(node, nodeData));
                break;
            case CustomNodeTypes.plannerNode:
                issues.push(...this.validatePlannerNode(node, nodeData, allNodes));
                break;
            case CustomNodeTypes.rePlannerNode:
                issues.push(...this.validateReplannerNode(node, nodeData));
                break;
            case CustomNodeTypes.iteratorNode:
                issues.push(...this.validateIteratorNode(node, nodeData));
                break;
            case CustomNodeTypes.decisionNode:
                issues.push(...this.validateDecisionNode(node, nodeData));
                break;
        }

        return issues;
    }

    /**
     * Validate voice agent configuration
     */
    private validateVoiceAgent(node: Node, nodeData: Record<string, unknown>): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const voiceConfig = nodeData.voiceConfig as Record<string, unknown> | undefined;
        const nodeName = (nodeData.name as string) || node.id;

        // Check call transfer configuration
        const callTransfer = voiceConfig?.callTransfer as Record<string, unknown> | undefined;
        if (callTransfer?.enabled && !callTransfer?.phoneNumber) {
            issues.push({
                id: `voice-transfer-${node.id}`,
                severity: 'error',
                type: 'configuration',
                message: 'Call transfer enabled without destination phone number',
                suggestion: 'Configure a destination phone number in the voice agent settings to enable call transfer functionality.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.voiceNode,
                    fieldPath: 'voiceConfig.callTransfer.phoneNumber',
                },
            });
        }

        // Check STT configuration
        const sttConfig = voiceConfig?.sttConfig as Record<string, unknown> | undefined;
        if (!sttConfig?.provider) {
            issues.push({
                id: `voice-stt-${node.id}`,
                severity: 'warning',
                type: 'configuration',
                message: 'Speech-to-text provider not configured',
                suggestion: 'Configure an STT provider (e.g., Deepgram, AssemblyAI) for voice input processing.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.voiceNode,
                    fieldPath: 'voiceConfig.sttConfig.provider',
                },
            });
        }

        // Check TTS configuration
        const ttsConfig = voiceConfig?.ttsConfig as Record<string, unknown> | undefined;
        if (!ttsConfig?.provider) {
            issues.push({
                id: `voice-tts-${node.id}`,
                severity: 'warning',
                type: 'configuration',
                message: 'Text-to-speech provider not configured',
                suggestion: 'Configure a TTS provider (e.g., ElevenLabs, OpenAI) for voice output.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.voiceNode,
                    fieldPath: 'voiceConfig.ttsConfig.provider',
                },
            });
        }

        return issues;
    }

    /**
     * Validate agent node configuration
     */
    private validateAgentNode(node: Node, nodeData: Record<string, unknown>): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeName = (nodeData.name as string) || node.id;

        // Check LLM configuration
        if (!nodeData.llmId && !nodeData.slmId) {
            issues.push({
                id: `agent-llm-${node.id}`,
                severity: 'error',
                type: 'configuration',
                message: 'No intelligence source configured',
                suggestion: 'Select an LLM or SLM configuration for this agent to process requests.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.agentNode,
                    fieldPath: 'llmId',
                },
            });
        }

        // Check prompt template
        if (!nodeData.promptTemplateId && !nodeData.prompt) {
            issues.push({
                id: `agent-prompt-${node.id}`,
                severity: 'warning',
                type: 'configuration',
                message: 'No prompt template configured',
                suggestion: 'Add a prompt template to guide the agent behavior and output format.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.agentNode,
                    fieldPath: 'promptTemplateId',
                },
            });
        }

        // Check RAG configuration for embedding/vector dimension compatibility
        const rags = nodeData.rags as Array<Record<string, unknown>> | undefined;
        if (rags && rags.length > 0) {
            for (let i = 0; i < rags.length; i++) {
                const rag = rags[i];
                if (rag.embeddingModelId && rag.databaseId) {
                    // This would need to fetch actual dimensions to validate
                    // For now, we add an informational note
                    issues.push({
                        id: `agent-rag-${node.id}-${i}`,
                        severity: 'info',
                        type: 'compatibility',
                        message: 'Ensure embedding dimensions match vector database',
                        suggestion: 'Verify that the embedding model dimensions align with the vector database configuration.',
                        autoFixable: false,
                        location: {
                            nodeId: node.id,
                            nodeName,
                            nodeType: CustomNodeTypes.agentNode,
                            fieldPath: `rags[${i}]`,
                        },
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Validate planner node configuration
     */
    private validatePlannerNode(node: Node, nodeData: Record<string, unknown>, allNodes: Node[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeName = (nodeData.name as string) || node.id;

        // Check if there's a corresponding replanner
        const hasReplanner = allNodes.some(n => n.type === CustomNodeTypes.rePlannerNode);
        if (!hasReplanner) {
            issues.push({
                id: `planner-replanner-${node.id}`,
                severity: 'warning',
                type: 'configuration',
                message: 'Planner node without replanner',
                suggestion: 'Consider adding a Replanner node to handle plan adjustments and ensure task completion.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.plannerNode,
                },
            });
        }

        return issues;
    }

    /**
     * Validate replanner node configuration
     */
    private validateReplannerNode(node: Node, nodeData: Record<string, unknown>): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeName = (nodeData.name as string) || node.id;
        const advancedConfig = nodeData.advancedConfig as Record<string, unknown> | undefined;
        const planConfig = advancedConfig?.planConfig as Record<string, unknown> | undefined;

        // Check max replan attempts
        const maxAttempts = planConfig?.maxReplanAttempts as number | undefined;
        if (maxAttempts === undefined || maxAttempts === null) {
            issues.push({
                id: `replanner-max-${node.id}`,
                severity: 'warning',
                type: 'performance',
                message: 'No maximum replan attempts configured',
                suggestion: 'Set a maxReplanAttempts limit (recommended: 3-5) to prevent infinite loops.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.rePlannerNode,
                    fieldPath: 'advancedConfig.planConfig.maxReplanAttempts',
                },
            });
        } else if (maxAttempts > 10) {
            issues.push({
                id: `replanner-high-max-${node.id}`,
                severity: 'warning',
                type: 'performance',
                message: `High max replan attempts (${maxAttempts})`,
                suggestion: 'Consider reducing maxReplanAttempts to 5 or less to avoid excessive token usage and latency.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.rePlannerNode,
                    fieldPath: 'advancedConfig.planConfig.maxReplanAttempts',
                },
            });
        }

        return issues;
    }

    /**
     * Validate iterator node configuration
     */
    private validateIteratorNode(node: Node, nodeData: Record<string, unknown>): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeName = (nodeData.name as string) || node.id;
        const config = nodeData.config as Record<string, unknown> | undefined;

        // Check iteration limit
        const maxIterations = config?.maxIterations as number | undefined;
        if (!maxIterations) {
            issues.push({
                id: `iterator-limit-${node.id}`,
                severity: 'warning',
                type: 'performance',
                message: 'No iteration limit configured',
                suggestion: 'Set a maxIterations limit to prevent infinite loops on large datasets.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.iteratorNode,
                    fieldPath: 'config.maxIterations',
                },
            });
        }

        return issues;
    }

    /**
     * Validate decision node configuration
     */
    private validateDecisionNode(node: Node, nodeData: Record<string, unknown>): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const nodeName = (nodeData.name as string) || node.id;
        const conditions = nodeData.conditions as Array<unknown> | undefined;

        // Check if conditions are configured
        if (!conditions || conditions.length === 0) {
            issues.push({
                id: `decision-conditions-${node.id}`,
                severity: 'error',
                type: 'configuration',
                message: 'No conditions configured for decision node',
                suggestion: 'Add at least one condition to determine the execution path.',
                autoFixable: false,
                location: {
                    nodeId: node.id,
                    nodeName,
                    nodeType: CustomNodeTypes.decisionNode,
                    fieldPath: 'conditions',
                },
            });
        }

        return issues;
    }

    /**
     * Validate workflow-level structure
     */
    private validateWorkflowStructure(nodes: Node[], edges: unknown[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Check for start node
        const hasStartNode = nodes.some(n => n.type === CustomNodeTypes.startNode);
        if (!hasStartNode) {
            issues.push({
                id: 'workflow-no-start',
                severity: 'error',
                type: 'configuration',
                message: 'Workflow missing start node',
                suggestion: 'Add a Start node to define the entry point of the workflow.',
                autoFixable: false,
            });
        }

        // Check for end node
        const hasEndNode = nodes.some(n => n.type === CustomNodeTypes.endNode);
        if (!hasEndNode) {
            issues.push({
                id: 'workflow-no-end',
                severity: 'error',
                type: 'configuration',
                message: 'Workflow missing end node',
                suggestion: 'Add an End node to define the exit point of the workflow.',
                autoFixable: false,
            });
        }

        // Check for orphan nodes (no connections)
        const connectedNodeIds = new Set<string>();
        if (Array.isArray(edges)) {
            for (const edge of edges as Array<{ source?: string; target?: string }>) {
                if (edge.source) connectedNodeIds.add(edge.source);
                if (edge.target) connectedNodeIds.add(edge.target);
            }
        }

        const agentNodes = nodes.filter(n => 
            n.type !== CustomNodeTypes.startNode && 
            n.type !== CustomNodeTypes.endNode
        );

        for (const node of agentNodes) {
            if (!connectedNodeIds.has(node.id)) {
                const nodeData = node.data as Record<string, unknown>;
                const nodeName = (nodeData?.name as string) || node.id;
                issues.push({
                    id: `orphan-${node.id}`,
                    severity: 'warning',
                    type: 'configuration',
                    message: `Node "${nodeName}" is not connected to the workflow`,
                    suggestion: 'Connect this node to the workflow flow or remove it if not needed.',
                    autoFixable: false,
                    location: {
                        nodeId: node.id,
                        nodeName,
                        nodeType: node.type as CustomNodeTypes,
                    },
                });
            }
        }

        return issues;
    }

    /**
     * Get validation summary
     */
    getValidationSummary(issues: ValidationIssue[]): {
        errorCount: number;
        warningCount: number;
        infoCount: number;
        hasBlockingIssues: boolean;
    } {
        const errorCount = issues.filter(i => i.severity === 'error').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;
        const infoCount = issues.filter(i => i.severity === 'info').length;

        return {
            errorCount,
            warningCount,
            infoCount,
            hasBlockingIssues: errorCount > 0,
        };
    }
}

export const validationService = new ValidationService();
export default ValidationService;
