'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssistantContext, ValidationIssue, ExecutionInsight } from '@/models/ai-assistant.model';
import { validationService, executionAnalyzerService } from '@/services/ai-assistant';
import { lineageService } from '@/services';

interface UseAssistantInsightsOptions {
    context: AssistantContext | null;
    enabled?: boolean;
    validateOnContextChange?: boolean;
}

interface UseAssistantInsightsReturn {
    validationIssues: ValidationIssue[];
    executionInsights: ExecutionInsight[];
    isValidating: boolean;
    isAnalyzing: boolean;
    validationSummary: {
        errorCount: number;
        warningCount: number;
        infoCount: number;
        hasBlockingIssues: boolean;
    };
    insightsSummary: {
        performance: number;
        cost: number;
        reliability: number;
        optimization: number;
        highImpact: number;
    };
    refreshValidation: () => Promise<void>;
    refreshInsights: () => Promise<void>;
}

/**
 * Hook to manage validation issues and execution insights for the AI assistant
 */
export function useAssistantInsights(options: UseAssistantInsightsOptions): UseAssistantInsightsReturn {
    const { context, enabled = true, validateOnContextChange = true } = options;

    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [executionInsights, setExecutionInsights] = useState<ExecutionInsight[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    /**
     * Run validation on the current context
     */
    const refreshValidation = useCallback(async () => {
        if (!context || !enabled) {
            return;
        }

        setIsValidating(true);
        try {
            const issues = await validationService.validateContext(context);
            setValidationIssues(issues);
        } catch (error) {
            console.error('[AI Assistant] Validation error:', error);
            setValidationIssues([]);
        } finally {
            setIsValidating(false);
        }
    }, [context, enabled]);

    /**
     * Fetch and analyze execution data
     */
    const refreshInsights = useCallback(async () => {
        if (!context || !enabled || !context.workspace?.id) {
            return;
        }

        // Only analyze for execution or workflow contexts
        if (context.level !== 'execution' && context.level !== 'workflow') {
            setExecutionInsights([]);
            return;
        }

        setIsAnalyzing(true);
        try {
            // Fetch recent sessions for the workspace
            const workspaceId = context.workspace.id;
            const workflowsResponse = await lineageService.workflows(workspaceId);
            
            if (!workflowsResponse || workflowsResponse.length === 0) {
                setExecutionInsights([]);
                return;
            }

            // Get the first workflow's sessions (or the current workflow if in editor)
            let targetWorkflowId = workflowsResponse[0]?.id;
            if (context.workflow?.id) {
                const matchingWorkflow = workflowsResponse.find(w => w.id === context.workflow?.id);
                if (matchingWorkflow) {
                    targetWorkflowId = matchingWorkflow.id;
                }
            }

            if (!targetWorkflowId) {
                setExecutionInsights([]);
                return;
            }

            // Fetch recent sessions
            const sessionsResponse = await lineageService.sessions(
                workspaceId,
                targetWorkflowId,
                1, // page
                20 // take - get recent 20 sessions for analysis
            );

            const sessions = sessionsResponse?.data || [];
            
            // Analyze the execution data
            const insights = executionAnalyzerService.analyzeExecutions(sessions);
            setExecutionInsights(insights);
        } catch (error) {
            console.error('[AI Assistant] Insights analysis error:', error);
            setExecutionInsights([]);
        } finally {
            setIsAnalyzing(false);
        }
    }, [context, enabled]);

    // Run validation when context changes
    useEffect(() => {
        if (validateOnContextChange && context) {
            refreshValidation();
        }
    }, [context?.level, context?.workflow?.id, validateOnContextChange, refreshValidation]);

    // Run insights analysis for execution/workflow contexts
    useEffect(() => {
        if (context?.level === 'execution' || context?.level === 'workflow') {
            refreshInsights();
        }
    }, [context?.level, context?.workspace?.id, refreshInsights]);

    // Calculate summaries
    const validationSummary = validationService.getValidationSummary(validationIssues);
    const insightsSummary = executionAnalyzerService.getInsightsSummary(executionInsights);

    return {
        validationIssues,
        executionInsights,
        isValidating,
        isAnalyzing,
        validationSummary,
        insightsSummary,
        refreshValidation,
        refreshInsights,
    };
}

export default useAssistantInsights;
