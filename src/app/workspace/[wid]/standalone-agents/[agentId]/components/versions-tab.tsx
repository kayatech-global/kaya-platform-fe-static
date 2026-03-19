'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_VERSIONS } from '../../mock-data';

export const VersionsTab = () => {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
                Deployment version history. Roll back to any previous version if needed.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-muted/40 border-b border-border">
                            <th className="text-left p-3 font-medium text-muted-foreground">Version</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Deployed At</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Deployed By</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_VERSIONS.map((v, i) => (
                            <tr
                                key={v.version}
                                className={cn(
                                    'border-b border-border/50 hover:bg-muted/20 transition-colors',
                                    i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                                )}
                            >
                                <td className="p-3 font-mono font-semibold text-foreground">v{v.version}</td>
                                <td className="p-3 text-muted-foreground whitespace-nowrap">
                                    {new Date(v.deployedAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-muted-foreground">{v.deployedBy}</td>
                                <td className="p-3">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-[10px] border',
                                            v.status === 'active'
                                                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                                : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                                        )}
                                    >
                                        {v.status}
                                    </Badge>
                                </td>
                                <td className="p-3 text-muted-foreground max-w-[240px] truncate">{v.notes}</td>
                                <td className="p-3">
                                    {v.status !== 'active' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 text-xs h-7 text-blue-400 hover:text-blue-300"
                                        >
                                            <RotateCcw size={11} /> Rollback
                                        </Button>
                                    )}
                                    {v.status === 'active' && (
                                        <span className="text-xs text-muted-foreground">Current</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
