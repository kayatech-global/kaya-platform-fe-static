'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { MOCK_SESSIONS } from '../../mock-data';

const sessionStatusConfig: Record<string, string> = {
    active: 'border-green-500/30 text-green-400 bg-green-500/10',
    completed: 'border-gray-500/30 text-gray-400 bg-gray-500/10',
    error: 'border-red-500/30 text-red-400 bg-red-500/10',
};

export const SessionsTab = () => {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
                Active and recent sessions for this agent. Sessions are automatically closed after 30 minutes of inactivity.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-muted/40 border-b border-border">
                            <th className="text-left p-3 font-medium text-muted-foreground">Session ID</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Workflow</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Started</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Last Activity</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Messages</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_SESSIONS.map((session, i) => (
                            <tr
                                key={session.id}
                                className={cn(
                                    'border-b border-border/50 transition-colors hover:bg-muted/20',
                                    i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                                )}
                            >
                                <td className="p-3 font-mono text-blue-400">{session.id}</td>
                                <td className="p-3 text-muted-foreground">{session.type}</td>
                                <td className="p-3 font-mono text-muted-foreground">{session.workflowId}</td>
                                <td className="p-3 text-muted-foreground whitespace-nowrap">
                                    {new Date(session.started).toLocaleString()}
                                </td>
                                <td className="p-3 text-muted-foreground whitespace-nowrap">
                                    {new Date(session.lastActivity).toLocaleString()}
                                </td>
                                <td className="p-3 text-foreground">{session.messageCount}</td>
                                <td className="p-3">
                                    <Badge variant="outline" className={cn('text-[10px] border', sessionStatusConfig[session.status])}>
                                        {session.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
