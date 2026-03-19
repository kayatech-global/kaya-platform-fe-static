'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { RotateCw } from 'lucide-react';
import { mockSessions } from '../../mock-data';

const statusVariant: Record<string, 'success' | 'warning' | 'secondary'> = {
    active: 'success',
    idle: 'warning',
    expired: 'secondary',
};

export const SessionsTab = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Active Sessions ({mockSessions.filter(s => s.status !== 'expired').length})
                </p>
                <Button variant="secondary" size="sm" leadingIcon={<RotateCw className="h-3.5 w-3.5" />}>
                    Reset All Sessions
                </Button>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Session ID</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Type</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Created</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Last Activity</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Status</th>
                            <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockSessions.map(session => (
                            <tr
                                key={session.id}
                                className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 bg-white dark:bg-gray-800"
                            >
                                <td className="px-4 py-3">
                                    <code className="text-xs font-mono text-gray-900 dark:text-gray-100">{session.sessionId}</code>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant="info" size="sm">{session.type.replace(/-/g, ' ')}</Badge>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(session.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(session.lastActivity).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={statusVariant[session.status] ?? 'secondary'} size="sm">
                                        {session.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button variant="ghost" size="sm">
                                        Reset
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
