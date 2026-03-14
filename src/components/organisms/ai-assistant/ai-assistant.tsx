'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent } from '@/components/atoms/sheet';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { useAuth } from '@/context/auth-context';
import { useAiAssistant } from '@/hooks/use-ai-assistant';
import { useAssistantContext } from '@/hooks/use-assistant-context';
import { useAssistantInsights } from '@/hooks/use-assistant-insights';
import { AssistantTrigger } from './assistant-trigger';
import { AssistantHeader } from './assistant-header';
import { AssistantMessages } from './assistant-messages';
import { AssistantInput } from './assistant-input';
import { ValidationPanel } from './validation-panel';
import type { AssistantSettings, ChatMessage, ValidationIssue } from '@/models/ai-assistant.model';

export interface AiAssistantProps {
  settings?: Partial<AssistantSettings>;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { user, token } = useAuth();
  
  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;
  
  // Determine if assistant is enabled (enterprise opt-in)
  const isEnabled = settings?.isEnabled ?? true;

  // Context detection
  const { context, isLoading: contextLoading, hasContextChanged } = useAssistantContext({
    pathname,
    userContext: user,
    enabled: isEnabled && isAuthenticated,
  });

  // Main assistant hook for chat functionality
  const {
    messages,
    isLoading: chatLoading,
    isStreaming,
    sendMessage,
    clearMessages,
    retryLastMessage,
    stopGeneration,
  } = useAiAssistant({
    context,
    userContext: user,
    enabled: isEnabled && isAuthenticated,
    settings: {
      isEnabled,
      proactiveValidation: settings?.proactiveValidation ?? true,
      executionInsights: settings?.executionInsights ?? true,
      optimizationSuggestions: settings?.optimizationSuggestions ?? true,
    },
  });

  // Insights and validation
  const {
    validationIssues,
    executionInsights,
    isLoading: insightsLoading,
    refreshInsights,
  } = useAssistantInsights({
    context,
    enabled: isEnabled && isAuthenticated && settings?.proactiveValidation !== false,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Show validation panel automatically when issues are found
  useEffect(() => {
    if (validationIssues.length > 0 && context?.level === 'workflow') {
      setShowValidation(true);
    }
  }, [validationIssues, context?.level]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSendMessage(suggestion);
    },
    [handleSendMessage]
  );

  const handleActionClick = useCallback(
    (action: ChatMessage['actions'][number]) => {
      // Handle different action types
      switch (action.type) {
        case 'navigate':
          if (typeof window !== 'undefined' && action.payload?.path) {
            window.location.href = action.payload.path;
          }
          break;
        case 'validate':
          refreshInsights();
          break;
        case 'configure':
          // Emit event for configuration panel to handle
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('ai-assistant:configure', {
                detail: action.payload,
              })
            );
          }
          break;
        default:
          break;
      }
    },
    [refreshInsights]
  );

  const handleIssueClick = useCallback((issue: ValidationIssue) => {
    // Navigate to the issue location in the workflow editor
    if (issue.location?.nodeId && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ai-assistant:focus-node', {
          detail: { nodeId: issue.location.nodeId },
        })
      );
    }
  }, []);

  console.log('[v0] AiAssistant: isEnabled=', isEnabled, 'isAuthenticated=', isAuthenticated);

  // Don't render if not enabled or not authenticated
  if (!isEnabled || !isAuthenticated) {
    console.log('[v0] AiAssistant: Not rendering');
    return null;
  }
  
  console.log('[v0] AiAssistant: Rendering trigger and sheet');

  return (
    <>
      {/* Floating trigger button */}
      <AssistantTrigger
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
        contextLabel={getContextLabel(context?.level, context)}
        hasContextChanged={hasContextChanged}
        validationErrorCount={validationIssues.length}
      />

      {/* Assistant panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[450px] p-0 flex flex-col h-full border-l border-border"
        >
          {/* Header */}
          <AssistantHeader
            context={context}
            onClose={() => setIsOpen(false)}
            onClearChat={clearMessages}
            onRefreshInsights={refreshInsights}
            isLoading={contextLoading || insightsLoading}
            validationCount={validationIssues.length}
            onToggleValidation={() => setShowValidation(!showValidation)}
            showValidation={showValidation}
          />

          {/* Messages area */}
          <ScrollArea ref={scrollRef} className="flex-1">
            <AssistantMessages
              messages={messages}
              isLoading={chatLoading}
              isStreaming={isStreaming}
              context={context}
              executionInsights={
                settings?.executionInsights !== false ? executionInsights : []
              }
              onSuggestionClick={handleSuggestionClick}
              onActionClick={handleActionClick}
              onRetry={retryLastMessage}
            />
          </ScrollArea>

          {/* Validation panel (collapsible) */}
          <ValidationPanel
            issues={validationIssues}
            isOpen={showValidation}
            onClose={() => setShowValidation(false)}
            onIssueClick={handleIssueClick}
          />

          {/* Input area */}
          <AssistantInput
            onSendMessage={handleSendMessage}
            onStopGeneration={stopGeneration}
            disabled={chatLoading && !isStreaming}
            isStreaming={isStreaming}
            context={context}
            placeholder={getInputPlaceholder(context?.level)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

function getInputPlaceholder(level?: string): string {
  switch (level) {
    case 'enterprise':
      return 'Ask about workspaces, usage, or platform settings...';
    case 'workspace':
      return 'Ask about workflows, agents, or workspace configuration...';
    case 'workflow':
      return 'Ask about this workflow, nodes, or execution...';
    case 'execution':
      return 'Ask about execution traces, performance, or debugging...';
    default:
      return 'Ask me anything about the platform...';
  }
}

function getContextLabel(level?: string, context?: { workspace?: { name?: string }; workflow?: { name?: string } } | null): string {
  switch (level) {
    case 'enterprise':
      return 'Enterprise Overview';
    case 'workspace':
      return context?.workspace?.name ? `Workspace: ${context.workspace.name}` : 'Workspace';
    case 'workflow':
      return context?.workflow?.name ? `Workflow: ${context.workflow.name}` : 'Workflow Editor';
    case 'execution':
      return 'Execution Analysis';
    default:
      return 'Platform Assistant';
  }
}

export default AiAssistant;
