'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AssistantHeader } from './assistant-header';
import { AssistantMessage, AssistantLoadingIndicator } from './assistant-message';
import { AssistantInput } from './assistant-input';
import { ProactiveInsightCard } from './proactive-insight-card';
import type { 
  AssistantMessage as AssistantMessageType, 
  PlatformContext,
  ProactiveInsight 
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="dialog"
      aria-modal="true"
      aria-label="KAYA Assistant"
      ref={containerRef}
      className={cn(
        'flex flex-col overflow-hidden',
        // Glass morphism styling
        'bg-white/95 dark:bg-gray-900/95',
        'backdrop-blur-xl',
        'border border-gray-200 dark:border-gray-700',
        'shadow-2xl',
        'rounded-2xl',
        // Size
        isMobile
          ? 'fixed inset-0 rounded-none'
          : 'w-[400px] max-h-[min(600px,70vh)]'
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
        {/* Proactive insights */}
        {proactiveInsights.length > 0 && messages.length === 0 && (
          <div className="space-y-2 mb-4">
            {proactiveInsights.map((insight) => (
              <ProactiveInsightCard
                key={insight.id}
                insight={insight}
                onDismiss={onDismissInsight}
              />
            ))}
          </div>
        )}

        {/* Welcome message when no messages */}
        {messages.length === 0 && proactiveInsights.length === 0 && (
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

        {/* Messages */}
        {messages.map((message) => (
          <AssistantMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && null}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content !== '' && (
          <AssistantLoadingIndicator />
        )}

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
