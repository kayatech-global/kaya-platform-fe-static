'use client';

import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send } from 'lucide-react';
import { Button, Textarea } from '@/components';
import { cn } from '@/lib/utils';
import { SuggestedActionChips } from './suggested-action-chips';
import type { ContextLevel } from '@/models/assistant.model';

interface AssistantInputProps {
  contextLevel: ContextLevel;
  onSend: (message: string) => void;
  isLoading: boolean;
}

const PLACEHOLDER_BY_LEVEL: Record<ContextLevel, string> = {
  enterprise: 'Ask about your workspaces...',
  workspace: 'Ask about this workspace...',
  workflow: 'Ask about this workflow...',
  agent: 'Ask about this agent...',
};

export function AssistantInput({ contextLevel, onSend, isLoading }: AssistantInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setValue('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const handleSuggestedAction = useCallback(
    (action: string) => {
      if (!isLoading) {
        onSend(action);
      }
    },
    [isLoading, onSend]
  );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-3">
      {/* Input area */}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_BY_LEVEL[contextLevel]}
          disabled={isLoading}
          rows={1}
          className={cn(
            'flex-1 min-h-[40px] max-h-[120px] resize-none',
            'text-sm bg-gray-100 dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'focus:ring-blue-500 focus:border-blue-500'
          )}
        />
        <Button
          onClick={handleSend}
          variant="primary"
          size="sm"
          disabled={isLoading || !value.trim()}
          className="h-10 w-10 p-0 flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Suggested actions */}
      <SuggestedActionChips
        contextLevel={contextLevel}
        onSelect={handleSuggestedAction}
        disabled={isLoading}
      />
    </div>
  );
}
