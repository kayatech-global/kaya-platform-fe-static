'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '../mock-data';

const statusConfig: Record<AgentStatus, { label: string; variant: 'success' | 'secondary' | 'destructive' | 'warning'; dotColor: string }> = {
    running: { label: 'Running', variant: 'success', dotColor: 'bg-green-500' },
    stopped: { label: 'Stopped', variant: 'secondary', dotColor: 'bg-gray-400' },
    error: { label: 'Error', variant: 'destructive', dotColor: 'bg-red-500' },
    deploying: { label: 'Deploying', variant: 'warning', dotColor: 'bg-amber-500' },
};

export const AgentStatusBadge = ({ status }: { status: AgentStatus }) => {
    const config = statusConfig[status];
    return (
        <Badge variant={config.variant} className="gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
            {config.label}
        </Badge>
    );
};
