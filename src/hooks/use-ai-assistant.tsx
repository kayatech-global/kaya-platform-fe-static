'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    AssistantChatMessage,
    AssistantState,
    ValidationIssue,
    ExecutionInsight,
} from '@/models/ai-assistant.model';
import { queryProcessorService } from '@/services/ai-assistant';
import { getWelcomeMessage, getSuggestedQuestions } from '@/constants/ai-assistant-prompts';
import { useAssistantContext } from './use-assistant-context';
import { useAssistantInsights } from './use-assistant-insights';

interface UseAiAssistantOptions {
    workflowData?: {
        id: string;
        name: string;
        version: number;
        isDraft: boolean;
        visualGraphData?: unknown;
    };
    workspaceData?: {
        id: string;
        name: string;
        description: string;
    };
    enabled?: boolean;
}

interface UseAiAssistantReturn extends AssistantState {
    // Actions
    sendMessage: (message: string) => Promise<void>;
    clearMessages: () => void;
    toggleOpen: () => void;
    setOpen: (open: boolean) => void;
    
    // Context
    contextLabel: string;
    contextDescription: string;
    hasContextChanged: boolean;
    
    // Insights
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
    
    // Suggestions
    suggestedQuestions: string[];
    
    // Refresh functions
    refreshValidation: () => Promise<void>;
    refreshInsights: () => Promise<void>;
}

/**
 * Main hook for the AI assistant functionality
 */
export function useAiAssistant(options: UseAiAssistantOptions = {}): UseAiAssistantReturn {
    const { enabled = true } = options;

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
    const [sessionId] = useState(() => uuidv4());
    
    // Refs
    const streamingMessageIdRef = useRef<string | null>(null);
    const hasShownWelcomeRef = useRef(false);

    // Use context detection
    const {
        context,
        contextLabel,
        contextDescription,
        hasContextChanged,
    } = useAssistantContext({
        workflowData: options.workflowData,
        workspaceData: options.workspaceData,
    });

    // Use insights and validation
    const {
        validationIssues,
        executionInsights,
        validationSummary,
        insightsSummary,
        refreshValidation,
        refreshInsights,
    } = useAssistantInsights({
        context,
        enabled,
    });

    // Get suggested questions based on context
    const suggestedQuestions = context ? getSuggestedQuestions(context) : [];

    // Show welcome message when opened for the first time
    useEffect(() => {
        if (isOpen && !hasShownWelcomeRef.current && context && messages.length === 0) {
            const welcomeMessage: AssistantChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: getWelcomeMessage(context),
                timestamp: new Date(),
                context,
            };
            setMessages([welcomeMessage]);
            hasShownWelcomeRef.current = true;
        }
    }, [isOpen, context, messages.length]);

    // Show welcome again when context changes significantly
    useEffect(() => {
        if (hasContextChanged && context && messages.length > 0) {
            const contextUpdateMessage: AssistantChatMessage = {
                id: uuidv4(),
                role: 'system',
                content: `Context updated: ${contextDescription}`,
                timestamp: new Date(),
                context,
            };
            setMessages(prev => [...prev, contextUpdateMessage]);
        }
    }, [hasContextChanged, context, contextDescription, messages.length]);

    /**
     * Send a message to the assistant
     */
    const sendMessage = useCallback(async (message: string) => {
        if (!message.trim() || !context || isStreaming) {
            return;
        }

        // Add user message
        const userMessage: AssistantChatMessage = {
            id: uuidv4(),
            role: 'user',
            content: message.trim(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Create assistant message placeholder
        const assistantMessageId = uuidv4();
        const assistantMessage: AssistantChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        streamingMessageIdRef.current = assistantMessageId;
        setIsLoading(true);
        setIsStreaming(true);

        try {
            // Process the query with streaming
            const workspaceId = context.workspace?.id || null;
            
            await queryProcessorService.processQuery(
                message,
                context,
                sessionId,
                workspaceId,
                (chunk) => {
                    // Update the streaming message
                    setMessages(prev => prev.map(msg => 
                        msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunk }
                            : msg
                    ));
                }
            );

            // Mark streaming as complete
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false, context }
                    : msg
            ));
        } catch (error) {
            console.error('[AI Assistant] Error processing message:', error);
            
            // Update with error message
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: 'I apologize, but I encountered an error processing your request. Please try again.',
                        isStreaming: false,
                    }
                    : msg
            ));
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            streamingMessageIdRef.current = null;
        }
    }, [context, sessionId, isStreaming]);

    /**
     * Clear all messages and reset conversation
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        hasShownWelcomeRef.current = false;
        
        // Show welcome message again
        if (context) {
            const welcomeMessage: AssistantChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: getWelcomeMessage(context),
                timestamp: new Date(),
                context,
            };
            setMessages([welcomeMessage]);
            hasShownWelcomeRef.current = true;
        }
    }, [context]);

    /**
     * Toggle the assistant panel
     */
    const toggleOpen = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    /**
     * Set the assistant panel open state
     */
    const setOpen = useCallback((open: boolean) => {
        setIsOpen(open);
    }, []);

    return {
        // State
        isOpen,
        isLoading,
        isStreaming,
        messages,
        context,
        validationIssues,
        insights: executionInsights,
        sessionId,
        
        // Actions
        sendMessage,
        clearMessages,
        toggleOpen,
        setOpen,
        
        // Context
        contextLabel,
        contextDescription,
        hasContextChanged,
        
        // Summaries
        validationSummary,
        insightsSummary,
        
        // Suggestions
        suggestedQuestions,
        
        // Refresh
        refreshValidation,
        refreshInsights,
    };
}

export default useAiAssistant;
