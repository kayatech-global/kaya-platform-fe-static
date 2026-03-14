'use client';

import { cn } from '@/lib/utils';
import { SUGGESTED_ACTIONS } from '@/constants/assistant-constants';
import type { ContextLevel } from '@/models/assistant.model';

interface SuggestedActionChipsProps {
  contextLevel: ContextLevel;
  onSelect: (action: string) => void;
  disabled?: boolean;
}

export function SuggestedActionChips({ contextLevel, onSelect, disabled }: SuggestedActionChipsProps) {
  const actions = SUGGESTED_ACTIONS[contextLevel] || SUGGESTED_ACTIONS.workspace;

  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {actions.slice(0, 3).map((action, index) => (
        <button
          key={index}
          onClick={() => onSelect(action)}
          disabled={disabled}
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'hover:border-blue-400 dark:hover:border-blue-500',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {action}
        </button>
      ))}
    </div>
  );
}
