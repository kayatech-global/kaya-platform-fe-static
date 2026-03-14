'use client';

import React from 'react';
import { TrendingUp, Zap, Shield, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import type { ExecutionInsight } from '@/models/ai-assistant.model';

interface InsightCardProps {
  insight: ExecutionInsight;
  onAction?: () => void;
}

const typeConfig = {
  performance: {
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-900',
  },
  cost: {
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-900',
  },
  reliability: {
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-900',
  },
  optimization: {
    icon: Lightbulb,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-900',
  },
};

const impactBadgeVariant = {
  high: 'destructive' as const,
  medium: 'secondary' as const,
  low: 'outline' as const,
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onAction }) => {
  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all hover:shadow-sm',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm')}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{insight.title}</span>
            <Badge variant={impactBadgeVariant[insight.impact]} className="h-5 px-1.5 text-xs">
              {insight.impact} impact
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>

          {insight.metrics && (
            <div className="flex items-center gap-4 mb-3 p-2 rounded bg-white/50 dark:bg-gray-900/50">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {insight.metrics.current}
                  <span className="text-xs text-muted-foreground ml-1">{insight.metrics.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {insight.metrics.potential}
                  <span className="text-xs text-muted-foreground ml-1">{insight.metrics.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground">Potential</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground italic">{insight.recommendation}</p>
            {onAction && (
              <Button variant="ghost" size="sm" onClick={onAction} className="h-7 px-2 text-xs">
                Learn More
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
