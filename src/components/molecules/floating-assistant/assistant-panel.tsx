'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AssistantHeader } from './assistant-header';
import { AssistantMessage as AssistantMessageComponent, AssistantLoadingIndicator } from './assistant-message';
import { AssistantInput } from './assistant-input';
import { ProactiveInsightCard } from './proactive-insight-card';
import type {
  AssistantMessage as AssistantMessageType,
  PlatformContext,
  ProactiveInsight,
} from '@/models/assistant.model';

interface AssistantPanelProps {
  messages: AssistantMessageType[];
  isLoading: boolean;
  currentContext: PlatformContext;
  proactiveInsights: ProactiveInsight[];
  onSend: (message: string) => void;
  onDismissInsight: (id: string) => void;
  onMinimize: () => void;
  onClose: () => void;
  isMobile: boolean;
}

export function AssistantPanel({
  messages,
  isLoading,
  currentContext,
  proactiveInsights,
  onSend,
  onDismissInsight,
  onMinimize,
  onClose,
  isMobile,
}: AssistantPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Determine whether to show the bouncing-dots loading indicator.
  // Show it when we are loading AND the last assistant message has empty content
  // (i.e. streaming hasn't produced any text yet).
  const lastMessage = messages[messages.length - 1];
  const showLoadingDots =
    isLoading && (!lastMessage || (lastMessage.role === 'assistant' && lastMessage.content === ''));

  const hasMessages = messages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label="KAYA Assistant"
      tabIndex={-1}
      className={cn(
        'flex flex-col overflow-hidden',
        // Glass morphism styling
        'bg-white/95 dark:bg-gray-900/95',
        'backdrop-blur-xl',
        'border border-gray-200 dark:border-gray-700',
        'shadow-2xl',
        // On mobile the widget parent is also fixed; we use a large enough size
        // here and let the widget handle full-screen placement via its own styles.
        isMobile ? 'rounded-2xl w-[calc(100vw-2rem)] max-h-[85vh]' : 'rounded-2xl w-[400px] max-h-[min(600px,70vh)]'
      )}
    >
      {/* Header */}
      <AssistantHeader
        currentContext={currentContext}
        onMinimize={onMinimize}
        onClose={onClose}
      />

      {/* Messages area */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-4',
          'scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600'
        )}
      >
        {/* Proactive insights — always visible until dismissed, regardless of messages */}
        {proactiveInsights.length > 0 && (
          <div className="space-y-2">
            {proactiveInsights.map((insight) => (
              <ProactiveInsightCard
                key={insight.id}
                insight={insight}
                onDismiss={onDismissInsight}
              />
            ))}
          </div>
        )}

        {/* Welcome message when there are no messages and no insights */}
        {!hasMessages && proactiveInsights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center mb-4">
              <span className="text-white text-xl">✨</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              How can I help you?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px]">
              I can help you understand your workflows, analyze execution data, and identify configuration issues.
            </p>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((message) => (
          <AssistantMessageComponent key={message.id} message={message} />
        ))}

        {/* Bouncing dots — shown while waiting for the first streaming chunk */}
        {showLoadingDots && <AssistantLoadingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <AssistantInput
        contextLevel={currentContext.level}
        onSend={onSend}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
