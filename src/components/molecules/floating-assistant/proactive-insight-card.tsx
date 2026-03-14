'use client';

import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { SEVERITY_COLORS } from '@/constants/assistant-constants';
import type { ProactiveInsight } from '@/models/assistant.model';
import Link from 'next/link';

interface ProactiveInsightCardProps {
  insight: ProactiveInsight;
  onDismiss: (id: string) => void;
}

const SeverityIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertOctagon,
} as const;

export function ProactiveInsightCard({ insight, onDismiss }: ProactiveInsightCardProps) {
  const Icon = SeverityIcons[insight.severity];
  const colors = SEVERITY_COLORS[insight.severity];

  return (
    <div
      className={cn(
        'relative rounded-lg border-l-4 p-3',
        colors.border,
        colors.bg,
        'border border-gray-200 dark:border-gray-700'
      )}
    >
      {/* Dismiss button */}
      {insight.dismissable && (
        <button
          onClick={() => onDismiss(insight.id)}
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss insight"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {insight.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {insight.description}
          </p>

          {/* Action link */}
          {insight.actionLabel && insight.actionHref && (
            <Link
              href={insight.actionHref}
              className={cn(
                'inline-flex items-center mt-2 text-xs font-medium',
                'text-blue-600 dark:text-blue-400 hover:underline'
              )}
            >
              {insight.actionLabel}
              <span className="ml-1">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
