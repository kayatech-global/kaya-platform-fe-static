'use client';

import { useState } from 'react';
import { useMutation } from 'react-query';
import { useAuth } from '@/context';
import { PlatformContext } from './use-assistant-context';

interface AssistantResponse {
    content: string;
    suggestions?: string[];
    context?: Record<string, unknown>;
}

interface ContextualData {
    workspaceMetrics?: unknown;
    workflowExecutions?: unknown;
    agentConfigurations?: unknown;
    usageData?: unknown;
    errorLogs?: unknown;
    performanceMetrics?: unknown;
}

export function useAssistantQueries() {
    const { token } = useAuth();
    const [contextualData, setContextualData] = useState<ContextualData>({});

    const fetchContextualData = async (context: PlatformContext): Promise<ContextualData> => {
        const data: ContextualData = {};

        if (!token || !context) return data;

        try {
            switch (context.level) {
                case 'enterprise':
                    // Enterprise-level data would be fetched here
                    break;

                case 'workspace':
                    if (context.workspaceId) {
                        // Workspace metrics would be fetched here
                    }
                    break;

                case 'workflow':
                    if (context.workspaceId && context.workflowId) {
                        // Workflow execution data would be fetched here
                    }
                    break;

                case 'agent':
                    if (context.workspaceId && context.agentId) {
                        // Agent configuration data would be fetched here
                    }
                    break;
            }
        } catch (error) {
            console.error('Error fetching contextual data:', error);
        }

        return data;
    };

    const sendMessageMutation = useMutation({
        mutationFn: async ({ message, context }: { message: string; context: PlatformContext | null }) => {
            if (!context) {
                throw new Error('No context available');
            }

            const freshData = await fetchContextualData(context);
            setContextualData(freshData);

            // Mock AI response for prototype
            return generateMockResponse(message, context, freshData);
        },
    });

    const generateMockResponse = async (
        message: string,
        context: PlatformContext,
        _data: ContextualData
    ): Promise<AssistantResponse> => {
        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('failed') || lowerMessage.includes('error')) {
            return {
                content: generateErrorAnalysisResponse(context),
                suggestions: ['Show me error details', 'Check execution logs', 'Suggest fixes for common issues'],
            };
        }

        if (lowerMessage.includes('performance') || lowerMessage.includes('slow') || lowerMessage.includes('optimization')) {
            return {
                content: generatePerformanceResponse(context),
                suggestions: ['Analyze token usage', 'Review execution breakdown', 'Suggest optimization improvements'],
            };
        }

        if (lowerMessage.includes('usage') || lowerMessage.includes('cost') || lowerMessage.includes('consumption')) {
            return {
                content: generateUsageResponse(context),
                suggestions: ['Show detailed usage breakdown', 'Compare with last month', 'Optimize resource consumption'],
            };
        }

        if (lowerMessage.includes('configuration') || lowerMessage.includes('config') || lowerMessage.includes('setup')) {
            return {
                content: generateConfigurationResponse(context),
                suggestions: ['Review current settings', 'Check for configuration issues', 'Suggest best practices'],
            };
        }

        return {
            content: generateDefaultResponse(context),
            suggestions: getContextualSuggestions(context),
        };
    };

    const generateErrorAnalysisResponse = (context: PlatformContext): string => {
        switch (context.level) {
            case 'workspace':
                return `I've analyzed your ${context.workspaceName} workspace for recent errors. Based on the execution data, I found 3 workflows with failures in the last 24 hours:

1. **Customer Support Bot** - Failed 2 times due to API timeout on the sentiment analysis step
2. **Lead Qualification** - 1 failure from missing required variable "company_size"
3. **Document Processor** - Failed once due to file size limit exceeded

**Immediate Actions:**
- Increase timeout for sentiment analysis API call to 30 seconds
- Add default value for "company_size" variable or make it optional
- Add file size validation before processing (current limit: 10MB)

Would you like me to guide you through fixing any of these issues?`;

            case 'workflow':
                return `I've examined the execution history for your workflow. The last failure occurred 2 hours ago during step 3 (Data Validation Agent).

**Error Details:**
- **Step:** Data Validation Agent
- **Duration:** 45 seconds (unusually long)
- **Error:** "Invalid JSON format in API response"
- **Root Cause:** Third-party API returned HTML error page instead of JSON

**Solution:**
1. Add response format validation before JSON parsing
2. Implement retry logic with exponential backoff
3. Add fallback handling for non-JSON responses

The agent spent most time waiting for the API call (40s out of 45s). Consider adding a timeout configuration.`;

            default:
                return `I can help you analyze errors across your platform. What specific errors or failures would you like me to investigate?`;
        }
    };

    const generatePerformanceResponse = (context: PlatformContext): string => {
        switch (context.level) {
            case 'workflow':
                return `I've analyzed the performance of your workflow over the last 50 executions:

**Performance Breakdown:**
- **Average Execution Time:** 23.4 seconds (15% increase from last week)
- **Slowest Component:** Planning Agent (12.3s average)
- **Token Usage:** 2,847 tokens per execution (22% increase)

**Key Insights:**
1. **Planning Agent Bottleneck:** The planner is taking 52% of total execution time
2. **Verbose Prompts:** Your system prompt is 1,200 tokens - consider condensing
3. **Redundant API Calls:** Agent makes 3 calls to the same endpoint

**Optimization Recommendations:**
1. **Reduce Planning Complexity:** Simplify the planner prompt (save ~30% time)
2. **Cache API Responses:** Implement 5-minute cache for repeated calls
3. **Parallel Execution:** Run data validation alongside sentiment analysis

**Expected Impact:** 40% faster execution, 25% fewer tokens used.`;

            case 'workspace':
                return `Performance analysis for ${context.workspaceName} workspace:

**Top 3 Performance Issues:**
1. **Lead Qualification Workflow:** 45s average (should be less than 20s)
2. **Customer Support Bot:** High token usage (4,200 tokens/execution)
3. **Document Processor:** Memory intensive operations causing delays

**Workspace-Level Optimizations:**
- Enable response caching (potential 30% speed improvement)
- Optimize shared prompt templates (reduce token usage by 20%)
- Review LLM model selection for cost-heavy workflows`;

            default:
                return `I can analyze performance metrics for your platform. Which specific workflows or agents would you like me to examine?`;
        }
    };

    const generateUsageResponse = (context: PlatformContext): string => {
        switch (context.level) {
            case 'enterprise':
                return `Enterprise usage summary for the current month:

**Overall Metrics:**
- **Total Executions:** 15,847 (12% increase vs last month)
- **Token Consumption:** 2.3M tokens (18% increase vs last month)
- **Storage Usage:** 47.2 GB of 100 GB limit (47% utilized)
- **Credits Used:** 8,924 of 15,000 monthly allowance

**Top Resource Consumers:**
1. **Marketing Workspace** - 42% of total tokens
2. **Customer Service** - 28% of total tokens
3. **Sales Operations** - 19% of total tokens

**Cost Optimization Opportunities:**
- Switch Marketing's content generation to a smaller model (save ~30%)
- Implement caching for Customer Service's FAQ responses
- Review Sales Operations' redundant workflow executions`;

            case 'workspace':
                return `Usage analysis for ${context.workspaceName} workspace this month:

**Resource Consumption:**
- **Executions:** 4,231 (34% above target)
- **Tokens:** 987,432 (25% increase vs last month)
- **Storage:** 8.4 GB (mostly execution logs)
- **Cost:** $432.18 (15% increase vs last month)

**Usage Patterns:**
- **Peak Hours:** 9-11 AM EST (40% of daily usage)
- **Heaviest Workflow:** Customer Support Bot (45% of tokens)
- **Most Frequent:** Lead Scoring (67 executions/day)

**Recommendations:**
- Schedule heavy workflows during off-peak hours
- Implement token budgets per workflow
- Archive execution logs older than 90 days`;

            default:
                return `I can provide detailed usage analytics for your platform. What specific metrics would you like me to analyze?`;
        }
    };

    const generateConfigurationResponse = (context: PlatformContext): string => {
        switch (context.level) {
            case 'agent':
                return `Configuration analysis for ${context.agentName || 'this'} agent:

**Current Configuration:**
- **Model:** GPT-4 (overkill for this task)
- **Temperature:** 0.7 (optimal for creative tasks)
- **Max Tokens:** 2,048 (sufficient)
- **Timeout:** 30 seconds (good)

**Detected Issues:**
1. **Overqualified Model:** You're using GPT-4 for simple classification - GPT-3.5 would be 75% cheaper
2. **Missing Fallback:** No fallback behavior configured for API failures
3. **Verbose System Prompt:** 847 tokens - could be condensed to ~400

**Optimization Suggestions:**
1. Switch to GPT-3.5-turbo for 75% cost reduction
2. Add fallback prompt for when primary model is unavailable
3. Streamline system prompt (example provided)
4. Enable response caching for repeated inputs

**Validation Status:** All required fields configured, API connectivity verified, Performance optimization needed`;

            case 'workflow':
                return `Configuration review for your workflow:

**Health Check Results:**
- All Agents Configured - No missing dependencies
- API Connections - All endpoints responding
- Call Transfer Setup - Phone number configured but not verified
- Error Handling - Missing fallback for Step 3
- Resource Limits - No timeout configured for long-running operations

**Critical Issues to Address:**
1. **Missing Error Handling:** Add fallback logic for Step 3 (Data Validation)
2. **Unverified Phone Number:** Test call transfer functionality
3. **No Timeout Protection:** Add 60-second timeout for web scraping step

**Performance Configuration:**
- **Parallel Execution:** Enabled
- **Caching:** Disabled (recommend enabling for API responses)
- **Retry Logic:** Basic (consider exponential backoff)`;

            default:
                return `I can review configurations at any level of your platform. What specific settings would you like me to analyze?`;
        }
    };

    const generateDefaultResponse = (context: PlatformContext): string => {
        switch (context.level) {
            case 'enterprise':
                return `Hello! I can see you're at the enterprise level with access to ${context.metadata?.totalWorkspaces || 0} workspaces. I can help you with:

- **Platform Overview:** Usage metrics, license limits, cross-workspace analytics
- **Performance Monitoring:** Identify slow or failing workflows across workspaces
- **Cost Optimization:** Resource usage patterns and optimization opportunities
- **Compliance:** Security configurations and access management

What would you like to explore?`;

            case 'workspace':
                return `You're currently in the "${context.workspaceName}" workspace. I can help you with:

- **Workflow Management:** Status monitoring, performance analysis, troubleshooting
- **Resource Usage:** Token consumption, execution costs, optimization tips
- **Configuration:** Workspace settings, integrations, security policies
- **Analytics:** Execution trends, error patterns, performance metrics

What aspect of this workspace would you like to investigate?`;

            case 'workflow':
                return `I'm ready to assist with this workflow. I can help you:

- **Execution Analysis:** Performance breakdowns, bottleneck identification
- **Configuration Review:** Agent settings, API integrations, error handling
- **Optimization:** Reduce costs, improve speed, enhance reliability
- **Troubleshooting:** Debug failures, fix configuration issues

How can I help you improve this workflow?`;

            case 'agent':
                return `You're working with ${context.agentName ? `the "${context.agentName}" agent` : 'this agent'}. I can assist with:

- **Configuration Optimization:** Model selection, prompt engineering, parameter tuning
- **Performance Analysis:** Token usage, response time, success rates
- **Integration Review:** Tool connections, API configurations, data flow
- **Best Practices:** Prompt improvements, error handling, cost reduction

What would you like to optimize for this agent?`;

            default:
                return `I'm your AI assistant for the platform. I understand your current context and can help with configurations, troubleshooting, and optimization suggestions. What can I help you with today?`;
        }
    };

    const getContextualSuggestions = (context: PlatformContext): string[] => {
        switch (context.level) {
            case 'enterprise':
                return [
                    'Show me usage summary across all workspaces',
                    'Which workspaces have the most execution errors?',
                    'What are my license limits and current usage?',
                    'Show me resource consumption trends',
                ];
            case 'workspace':
                return [
                    'Which workflows failed in the last 24 hours?',
                    'Show me token usage for this workspace',
                    'What are the most expensive workflows to run?',
                    'Help me optimize workspace configuration',
                ];
            case 'workflow':
                return [
                    'Why did my last execution take so long?',
                    'Check for configuration issues',
                    'Show me execution performance breakdown',
                    'Suggest optimization improvements',
                ];
            case 'agent':
                return [
                    'Review my agent configuration',
                    'Analyze tool usage patterns',
                    'Suggest prompt optimizations',
                    'Check for common configuration issues',
                ];
            default:
                return ['Help me understand my current context', 'Show me platform overview', 'What can you help me with?'];
        }
    };

    return {
        sendMessage: (message: string, context: PlatformContext | null) => sendMessageMutation.mutateAsync({ message, context }),
        isQueryLoading: sendMessageMutation.isLoading,
        contextualData,
    };
}
