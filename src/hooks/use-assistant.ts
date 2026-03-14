'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAssistantPlatformContext } from './use-assistant-platform-context';
import {
  USE_MOCK,
  MOCK_RESPONSES,
  MOCK_INSIGHTS,
} from '@/constants/assistant-constants';
import type {
  AssistantMessage,
  PlatformContext,
  ProactiveInsight,
} from '@/models/assistant.model';

const STREAMING_DELAY_MS = 15;
const INSIGHTS_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Determines which mock response to use based on the message and context.
 */
function getMockResponseKey(message: string, context: PlatformContext): string {
  const lowerMessage = message.toLowerCase();

  if (context.level === 'enterprise') {
    if (lowerMessage.includes('workspace') && lowerMessage.includes('how many')) {
      return 'enterprise:workspaces';
    }
    if (lowerMessage.includes('error') || lowerMessage.includes('highest')) {
      return 'enterprise:error';
    }
    if (lowerMessage.includes('license') || lowerMessage.includes('limit')) {
      return 'enterprise:license';
    }
  }

  if (context.level === 'workspace') {
    if (lowerMessage.includes('fail') || lowerMessage.includes('error')) {
      return 'workspace:failed';
    }
    if (lowerMessage.includes('token') || lowerMessage.includes('usage')) {
      return 'workspace:token';
    }
    if (lowerMessage.includes('top') || lowerMessage.includes('execution')) {
      return 'workspace:top';
    }
  }

  if (context.level === 'workflow' || context.level === 'agent') {
    if (lowerMessage.includes('analyz') || lowerMessage.includes('last')) {
      return 'workflow:analyze';
    }
    if (lowerMessage.includes('check') || lowerMessage.includes('config') || lowerMessage.includes('issue')) {
      return 'workflow:check';
    }
    if (lowerMessage.includes('explain') || lowerMessage.includes('structure')) {
      return 'workflow:explain';
    }
  }

  return 'default';
}

interface UseAssistantReturn {
  messages: AssistantMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  currentContext: PlatformContext;
  proactiveInsights: ProactiveInsight[];
  dismissInsight: (id: string) => void;
  hasUnreadInsights: boolean;
}

export function useAssistant(): UseAssistantReturn {
  const { token } = useAuth();
  const currentContext = useAssistantPlatformContext();
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousContextRef = useRef<string>('');
  // Holds a stable reference to the latest fetchInsights so interval callbacks
  // are never stale regardless of when they close over the function.
  const fetchInsightsRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Clear streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchInsights = useCallback(async () => {
    if (USE_MOCK) {
      // Use mock insights based on context level
      const mockInsights = MOCK_INSIGHTS[currentContext.level] || [];
      // Replace {wid} placeholder with actual workspace ID
      const processedInsights = mockInsights.map(insight => ({
        ...insight,
        actionHref: insight.actionHref?.replace('{wid}', currentContext.workspaceId || ''),
      }));
      setProactiveInsights(processedInsights);
      return;
    }

    // Real API call
    if (!currentContext.workspaceId) return;

    try {
      const response = await fetch(
        `/api/workspaces/${currentContext.workspaceId}/assistant/insights?context=${currentContext.level}${
          currentContext.workflowId ? `&workflowId=${currentContext.workflowId}` : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProactiveInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch proactive insights:', error);
    }
  }, [currentContext, token]);

  // Keep the ref pointing at the latest fetchInsights so the interval below
  // always calls the up-to-date version with the current context.
  fetchInsightsRef.current = fetchInsights;

  // Trigger a fresh insight fetch whenever the navigation context changes.
  useEffect(() => {
    const contextKey = `${currentContext.level}:${currentContext.workspaceId}:${currentContext.workflowId}`;

    if (contextKey !== previousContextRef.current) {
      previousContextRef.current = contextKey;
      fetchInsights();
    }
  }, [currentContext.level, currentContext.workspaceId, currentContext.workflowId, fetchInsights]);

  // Periodic insights refresh — uses the ref to avoid a stale closure.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchInsightsRef.current();
    }, INSIGHTS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const simulateStreamingResponse = useCallback((fullContent: string, messageId: string) => {
    let currentIndex = 0;
    
    streamingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullContent.length) {
        const nextChunk = fullContent.slice(0, currentIndex + 1);
        
        setMessages(prev => prev.map(msg =>
          msg.id === messageId ? { ...msg, content: nextChunk } : msg
        ));
        
        currentIndex++;
      } else {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        setIsLoading(false);
      }
    }, STREAMING_DELAY_MS);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage: AssistantMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: getTimestamp(),
    };

    // Create placeholder for assistant response
    const assistantMessageId = generateId();
    const assistantMessage: AssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: getTimestamp(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    if (USE_MOCK) {
      // Mock streaming response
      const responseKey = getMockResponseKey(text, currentContext);
      const fullContent = MOCK_RESPONSES[responseKey] || MOCK_RESPONSES['default'];
      
      // Small delay before starting to stream
      setTimeout(() => {
        simulateStreamingResponse(fullContent, assistantMessageId);
      }, 300);
      return;
    }

    // Real API call with streaming
    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/workspaces/${currentContext.workspaceId}/assistant/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationHistory: messages.slice(-10).map(m => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              level: currentContext.level,
              workspaceId: currentContext.workspaceId,
              workflowId: currentContext.workflowId,
              selectedNodeId: currentContext.selectedNodeId,
              selectedNodeType: currentContext.selectedNodeType,
              currentPage: currentContext.currentPage,
            },
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      setIsLoading(false);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }

      console.error('Failed to send message:', error);
      
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: 'I apologize, but I encountered an error processing your request. Please try again.',
              metadata: { type: 'error' },
            }
          : msg
      ));
      setIsLoading(false);
    }
  }, [isLoading, currentContext, messages, token, simulateStreamingResponse]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const dismissInsight = useCallback((id: string) => {
    setProactiveInsights(prev => prev.filter(insight => insight.id !== id));
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentContext,
    proactiveInsights,
    dismissInsight,
    hasUnreadInsights: proactiveInsights.length > 0,
  };
}
