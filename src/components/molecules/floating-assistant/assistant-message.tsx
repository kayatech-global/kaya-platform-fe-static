'use client';

import { MarkdownText } from '@/components/molecules/mardown-text/markdown-text';
import { cn } from '@/lib/utils';
import { SEVERITY_COLORS } from '@/constants/assistant-constants';
import type { AssistantMessage as AssistantMessageType } from '@/models/assistant.model';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AssistantMessageProps {
  message: AssistantMessageType;
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === 'user';
  const messageType = message.metadata?.type || 'text';
  const isSpecialType = messageType !== 'text';

  // Get severity colors for special message types
  const severityConfig = isSpecialType
    ? SEVERITY_COLORS[messageType as keyof typeof SEVERITY_COLORS]
    : null;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'relative px-4 py-3 rounded-2xl text-sm shadow-sm flex flex-col gap-1',
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white self-end ml-auto max-w-[85%] break-words'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 self-start mr-auto max-w-[95%] break-words',
          // Special styling for warning/error/insight messages
          !isUser && severityConfig && [
            'border-l-4 rounded-l-sm',
            severityConfig.border,
            severityConfig.bg,
          ]
        )}
      >
        {/* Message content */}
        <div className="[&>p]:my-1 [&>li]:my-1 leading-snug">
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            <MarkdownText>{message.content}</MarkdownText>
          )}
        </div>

        {/* Collapsible section */}
        {message.metadata?.collapsible && (
          <details className="mt-2 group">
            <summary className="flex items-center cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90 mr-1" />
              {message.metadata.collapsible.title}
            </summary>
            <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600 text-xs">
              <MarkdownText>{message.metadata.collapsible.content}</MarkdownText>
            </div>
          </details>
        )}

        {/* Source links */}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {message.metadata.sources.map((source, index) => (
              <Link
                key={index}
                href={source.href}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs',
                  'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
                  'hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors'
                )}
              >
                {source.label}
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <small
        className={cn(
          'text-xs px-2 text-gray-400 dark:text-gray-500',
          isUser ? 'self-end' : 'self-start'
        )}
      >
        {formatTimestamp(message.timestamp)}
      </small>
    </div>
  );
}

// Loading indicator component
export function AssistantLoadingIndicator() {
  return (
    <div className="relative px-4 py-3 rounded-2xl text-sm max-w-[10%] self-start">
      <div className="flex items-center justify-center space-x-2 py-1">
        <div className="w-1 h-1 p-[3px] bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce" />
        <div className="w-1 h-1 p-[3px] bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-1 h-1 p-[3px] bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
