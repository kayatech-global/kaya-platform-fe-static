'use client';

import { Minus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import type { PlatformContext } from '@/models/assistant.model';

interface AssistantHeaderProps {
  currentContext: PlatformContext;
  onMinimize: () => void;
  onClose: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-500',
  workspace: 'bg-blue-500',
  workflow: 'bg-green-500',
  agent: 'bg-amber-500',
};

function getContextLabel(context: PlatformContext): { label: string; level: string } {
  const parts: string[] = [];

  if (context.level === 'enterprise') {
    parts.push('Enterprise');
  } else if (context.workspaceName) {
    parts.push(context.workspaceName);
  } else if (context.workspaceId) {
    parts.push('Workspace');
  }

  if (context.level === 'workflow') {
    if (context.workflowName) {
      parts.push(context.workflowName);
    } else {
      parts.push('Workflow');
    }
  }

  if (context.level === 'agent' && context.selectedNodeId) {
    parts.push(context.selectedNodeType || 'Agent');
  }

  return {
    label: parts.join(' > ') || 'Platform',
    level: context.level,
  };
}

export function AssistantHeader({ currentContext, onMinimize, onClose }: AssistantHeaderProps) {
  const { label, level } = getContextLabel(currentContext);
  const levelColor = LEVEL_COLORS[level] || 'bg-gray-500';

  return (
    <div className="flex flex-col border-b border-gray-200 dark:border-gray-700">
      {/* Top row with title and actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            KAYA Assistant
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0"
            aria-label="Minimize assistant"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context badge */}
      <div className="px-4 pb-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs',
            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          )}
        >
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', levelColor)} />
          <span className="truncate max-w-[260px]">{label}</span>
        </div>
      </div>
    </div>
  );
}
