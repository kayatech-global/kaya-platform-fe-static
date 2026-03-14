import config from '@/config/environment-variables';
import { 
    AssistantContext, 
    AssistantQueryResponse, 
    QueryIntent, 
    QueryCategory,
    AssistantAction 
} from '@/models/ai-assistant.model';
import { buildSystemPrompt } from '@/constants/ai-assistant-prompts';

/**
 * Service to process user queries and generate responses using the AI assistant
 */
class QueryProcessorService {
    /**
     * Process a user query with context and return a streaming response
     * @param query - User's question or request
     * @param context - Current platform context
     * @param sessionId - Chat session identifier
     * @param workspaceId - Current workspace ID for API calls
     * @param onChunk - Callback for streaming text chunks
     */
    async processQuery(
        query: string,
        context: AssistantContext,
        sessionId: string,
        workspaceId: string | null,
        onChunk: (text: string) => void
    ): Promise<AssistantQueryResponse> {
        // Build the system prompt with context
        const systemPrompt = buildSystemPrompt(context);
        
        // Classify the query intent
        const intent = this.classifyQueryIntent(query, context);
        
        // Prepare the message with context injection
        const enrichedQuery = this.enrichQueryWithContext(query, context, intent);
        
        try {
            // Stream the response from the backend
            const response = await this.streamResponse(
                enrichedQuery,
                systemPrompt,
                sessionId,
                workspaceId,
                onChunk
            );

            // Extract actions from the response
            const actions = this.extractActions(response, context);
            const suggestions = this.extractSuggestions(response, context);

            return {
                response,
                suggestions,
                actions,
            };
        } catch (error) {
            console.error('[AI Assistant] Query processing error:', error);
            throw error;
        }
    }

    /**
     * Stream response from the backend LLM service
     */
    private async streamResponse(
        query: string,
        systemPrompt: string,
        sessionId: string,
        workspaceId: string | null,
        onChunk: (text: string) => void
    ): Promise<string> {
        // For the AI assistant, we'll use a simplified API call
        // In production, this would connect to the workspace's intelligent source
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (workspaceId) {
            headers['x-workspace-id'] = workspaceId;
        }

        const body = {
            message: query,
            system_prompt: systemPrompt,
            session_id: sessionId,
            is_stream: true,
            assistant_mode: true, // Flag to use assistant-specific handling
        };

        try {
            const response = await fetch(`${config.CHAT_BOT_URL}/assistant/query`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                // Fallback to a helpful error message
                const errorText = await this.handleNonStreamingFallback(query, systemPrompt);
                onChunk(errorText);
                return errorText;
            }

            // Handle streaming response
            if (response.body) {
                return await this.handleStreamingResponse(response.body, onChunk);
            } else {
                // Fallback for non-streaming
                const data = await response.json();
                const text = data.response || data.message || 'I encountered an issue processing your request.';
                onChunk(text);
                return text;
            }
        } catch {
            // Provide a helpful fallback response
            const fallbackResponse = this.generateFallbackResponse(query);
            onChunk(fallbackResponse);
            return fallbackResponse;
        }
    }

    /**
     * Handle streaming response body
     */
    private async handleStreamingResponse(
        body: ReadableStream<Uint8Array>,
        onChunk: (text: string) => void
    ): Promise<string> {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                
                // Handle EOS token
                if (chunk.includes('<<EOS_TOKEN>>')) {
                    const cleanChunk = chunk.replace('<<EOS_TOKEN>>', '');
                    if (cleanChunk) {
                        fullText += cleanChunk;
                        onChunk(cleanChunk);
                    }
                    break;
                }

                fullText += chunk;
                onChunk(chunk);
            }
        } finally {
            reader.releaseLock();
        }

        return fullText || 'No response received.';
    }

    /**
     * Fallback handler when streaming is not available
     */
    private async handleNonStreamingFallback(query: string, _systemPrompt: string): Promise<string> {
        // Return a context-aware fallback response
        return this.generateFallbackResponse(query);
    }

    /**
     * Generate a helpful fallback response when the API is unavailable
     */
    private generateFallbackResponse(query: string): string {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('help') || lowerQuery.includes('what can')) {
            return `I can help you with:

- **Workflow Configuration**: Setting up agents, tools, and integrations
- **Troubleshooting**: Identifying and fixing configuration issues
- **Best Practices**: Recommendations for optimal workflow design
- **Execution Analysis**: Understanding performance and errors

Please ask me a specific question about your workflow or configuration!`;
        }

        if (lowerQuery.includes('create') || lowerQuery.includes('add')) {
            return `To create or add components in Kaya Platform:

1. **Workflows**: Go to Workflow Authoring and click "Create Workflow"
2. **Agents**: Open a workflow in the editor and drag an agent node from the toolbar
3. **Tools**: Configure APIs, Connectors, or Functions in the workspace settings
4. **RAG**: Set up Vector RAG or Graph RAG configurations for knowledge retrieval

Would you like more details on any of these?`;
        }

        if (lowerQuery.includes('error') || lowerQuery.includes('issue') || lowerQuery.includes('problem')) {
            return `For troubleshooting issues:

1. **Check the Data Lineage**: View execution traces to identify failing steps
2. **Validate Configuration**: Ensure all required fields are properly configured
3. **Review Logs**: Check agent outputs for error messages
4. **Test Incrementally**: Use the test studio to isolate issues

What specific error or issue are you experiencing?`;
        }

        return `I'm here to help you with the Kaya Platform. I can assist with:

- Configuring workflows and agents
- Setting up integrations and tools
- Troubleshooting execution issues
- Optimizing performance

What would you like to know more about?`;
    }

    /**
     * Classify the user's query intent
     */
    private classifyQueryIntent(query: string, context: AssistantContext): QueryIntent {
        const lowerQuery = query.toLowerCase();

        const intent: QueryIntent = {
            category: 'general' as QueryCategory,
            needsUsageData: false,
            needsWorkspaceList: false,
            needsWorkflowData: false,
            needsExecutionData: false,
            needsExecutionTrace: false,
            needsConfigValidation: false,
        };

        // Configuration-related queries
        if (this.matchesKeywords(lowerQuery, ['configure', 'setup', 'set up', 'create', 'add', 'connect'])) {
            intent.category = 'configuration';
            intent.needsWorkflowData = context.level === 'workflow';
        }

        // Execution-related queries
        if (this.matchesKeywords(lowerQuery, ['execute', 'run', 'execution', 'running', 'failed', 'error', 'success'])) {
            intent.category = 'execution';
            intent.needsExecutionData = true;
            intent.needsExecutionTrace = this.matchesKeywords(lowerQuery, ['trace', 'lineage', 'step', 'detail']);
        }

        // Navigation queries
        if (this.matchesKeywords(lowerQuery, ['where', 'find', 'navigate', 'go to', 'how do i get'])) {
            intent.category = 'navigation';
            intent.needsWorkspaceList = true;
        }

        // Optimization queries
        if (this.matchesKeywords(lowerQuery, ['optimize', 'improve', 'faster', 'better', 'performance', 'slow'])) {
            intent.category = 'optimization';
            intent.needsExecutionData = true;
            intent.needsUsageData = true;
        }

        // Troubleshooting queries
        if (this.matchesKeywords(lowerQuery, ['why', 'issue', 'problem', 'not working', 'broken', 'fix', 'debug'])) {
            intent.category = 'troubleshooting';
            intent.needsConfigValidation = true;
            intent.needsExecutionData = context.level === 'execution' || context.level === 'workflow';
        }

        return intent;
    }

    /**
     * Check if query matches any of the keywords
     */
    private matchesKeywords(query: string, keywords: string[]): boolean {
        return keywords.some(keyword => query.includes(keyword));
    }

    /**
     * Enrich the query with relevant context information
     */
    private enrichQueryWithContext(query: string, context: AssistantContext, intent: QueryIntent): string {
        const contextParts: string[] = [query];

        if (intent.category === 'troubleshooting' && context.workflow) {
            contextParts.push(`\n\n[Context: Working with workflow "${context.workflow.name}"]`);
        }

        if (intent.category === 'configuration' && context.level === 'workflow') {
            contextParts.push(`\n\n[Context: Currently in workflow editor]`);
        }

        return contextParts.join('');
    }

    /**
     * Extract actionable items from the response
     */
    private extractActions(_response: string, context: AssistantContext): AssistantAction[] {
        const actions: AssistantAction[] = [];

        // In a full implementation, we would parse the response for actionable items
        // For now, provide context-based default actions

        if (context.level === 'workflow' && context.workflow?.isDraft) {
            actions.push({
                type: 'execute',
                label: 'Test Workflow',
                payload: { workflowId: context.workflow.id },
                description: 'Run a test execution of the current workflow',
            });
        }

        return actions;
    }

    /**
     * Extract suggested follow-up questions
     */
    private extractSuggestions(_response: string, context: AssistantContext): string[] {
        // Provide context-aware follow-up suggestions
        switch (context.level) {
            case 'workflow':
                return [
                    'How do I add a new agent?',
                    'What tools are available?',
                    'How do I test this workflow?',
                ];
            case 'execution':
                return [
                    'Show me the error details',
                    'What caused the failure?',
                    'How can I optimize this?',
                ];
            default:
                return [
                    'Tell me more',
                    'What are best practices?',
                ];
        }
    }
}

export const queryProcessorService = new QueryProcessorService();
export default QueryProcessorService;
