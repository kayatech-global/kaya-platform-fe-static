'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, Wrench, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { ScrollArea } from '@/components/atoms/scroll-area';
import type { ValidationIssue } from '@/models/ai-assistant.model';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  isOpen: boolean;
  onClose: () => void;
  onIssueClick?: (issue: ValidationIssue) => void;
  onAutoFix?: (issue: ValidationIssue) => void;
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-900',
    iconColor: 'text-red-500',
    badgeVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-900',
    iconColor: 'text-amber-500',
    badgeVariant: 'secondary' as const,
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900',
    iconColor: 'text-blue-500',
    badgeVariant: 'outline' as const,
  },
};

const typeLabels: Record<ValidationIssue['type'], string> = {
  configuration: 'Config',
  performance: 'Performance',
  compatibility: 'Compatibility',
  security: 'Security',
  bestPractice: 'Best Practice',
};

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  isOpen,
  onClose,
  onIssueClick,
  onAutoFix,
}) => {
  if (!isOpen || issues.length === 0) return null;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Validation Issues</span>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                {infoCount} info
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-2">
          {issues.map((issue, index) => {
            const config = severityConfig[issue.severity];
            const Icon = config.icon;

            return (
              <div
                key={`${issue.type}-${index}`}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  config.bgColor,
                  config.borderColor,
                  onIssueClick && 'cursor-pointer hover:opacity-80'
                )}
                onClick={() => onIssueClick?.(issue)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={config.badgeVariant} className="h-5 px-1.5 text-xs">
                        {typeLabels[issue.type]}
                      </Badge>
                      {issue.location?.nodeId && (
                        <span className="text-xs text-muted-foreground truncate">
                          Node: {issue.location.nodeId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-1">{issue.message}</p>
                    <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {issue.autoFixable && onAutoFix && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAutoFix(issue);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        Fix
                      </Button>
                    )}
                    {onIssueClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ValidationPanel;
