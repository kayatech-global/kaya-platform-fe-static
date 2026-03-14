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

function getContextLabel(context: PlatformContext): string {
  const parts: string[] = [];

  if (context.level === 'enterprise') {
    parts.push('Enterprise');
  } else if (context.workspaceName) {
    parts.push(`Workspace: ${context.workspaceName}`);
  } else if (context.workspaceId) {
    parts.push(`Workspace: ${context.workspaceId.slice(0, 8)}...`);
  }

  if (context.level === 'workflow' && context.workflowId) {
    parts.push(`Workflow: ${context.workflowId.slice(0, 8)}...`);
  }

  if (context.level === 'agent' && context.selectedNodeId) {
    parts.push(`Agent: ${context.selectedNodeType || 'Selected'}`);
  }

  return parts.join(' > ') || 'Platform';
}

export function AssistantHeader({ currentContext, onMinimize, onClose }: AssistantHeaderProps) {
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
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs',
            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          )}
        >
          <span className="truncate max-w-[280px]">{getContextLabel(currentContext)}</span>
        </div>
      </div>
    </div>
  );
}
