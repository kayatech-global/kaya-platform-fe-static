'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components';
import { Badge } from '@/components/atoms/badge';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_LOGS } from '../../mock-data';

type Severity = 'all' | 'info' | 'warn' | 'error';

const severityConfig: Record<string, { class: string; badge: string }> = {
    info: { class: 'text-blue-400', badge: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
    warn: { class: 'text-amber-400', badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    error: { class: 'text-red-400', badge: 'border-red-500/30 text-red-400 bg-red-500/10' },
};

export const LogsTab = () => {
    const [search, setSearch] = useState('');
    const [severity, setSeverity] = useState<Severity>('all');

    const filtered = useMemo(() => {
        return MOCK_LOGS.filter(log => {
            const matchesSeverity = severity === 'all' || log.severity === severity;
            const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase());
            return matchesSeverity && matchesSearch;
        });
    }, [severity, search]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 text-xs h-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {(['all', 'info', 'warn', 'error'] as Severity[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setSeverity(s)}
                            className={cn(
                                'text-xs px-2.5 py-1 rounded border transition-colors',
                                severity === s
                                    ? s === 'all'
                                        ? 'border-border bg-muted text-foreground'
                                        : `border ${severityConfig[s]?.badge}`
                                    : 'border-border text-muted-foreground hover:border-border/80'
                            )}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground ml-auto">{filtered.length} entries</span>
            </div>

            <div className="rounded-lg border border-border bg-gray-900/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground">Log Output</p>
                    <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">Live</Badge>
                </div>
                <div className="h-[480px] overflow-y-auto font-mono text-xs p-4 flex flex-col gap-0.5">
                    {filtered.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No log entries match your filters.</p>
                    ) : (
                        filtered.map(log => {
                            const cfg = severityConfig[log.severity];
                            return (
                                <div
                                    key={log.id}
                                    className={cn(
                                        'flex items-start gap-3 py-1 px-2 rounded hover:bg-muted/30 transition-colors',
                                        log.severity === 'error' && 'bg-red-500/5',
                                        log.severity === 'warn' && 'bg-amber-500/5'
                                    )}
                                >
                                    <span className="text-muted-foreground whitespace-nowrap text-[11px] mt-0.5">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className={cn('uppercase font-bold text-[10px] w-8 flex-shrink-0 mt-0.5', cfg?.class)}>
                                        {log.severity}
                                    </span>
                                    <span className={cn('text-[12px] leading-relaxed break-all', cfg?.class || 'text-foreground')}>
                                        {log.message}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
