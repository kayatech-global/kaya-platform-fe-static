'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';
import { mockLogEntries } from '../../mock-data';
import type { LogLevel } from '../../mock-data';

const levelConfig: Record<LogLevel, { variant: 'info' | 'warning' | 'destructive' | 'secondary'; color: string }> = {
    info: { variant: 'info', color: 'text-blue-400' },
    warn: { variant: 'warning', color: 'text-amber-400' },
    error: { variant: 'destructive', color: 'text-red-400' },
    debug: { variant: 'secondary', color: 'text-gray-400' },
};

const levels: LogLevel[] = ['info', 'warn', 'error', 'debug'];

export const LogsTab = () => {
    const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(new Set(levels));

    const toggleLevel = (level: LogLevel) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(level)) {
                next.delete(level);
            } else {
                next.add(level);
            }
            return next;
        });
    };

    const filteredLogs = useMemo(
        () => mockLogEntries.filter(log => activeFilters.has(log.level)),
        [activeFilters]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => toggleLevel(level)}
                            className={cn(
                                'rounded-md px-3 py-1 text-xs font-medium transition-all border',
                                activeFilters.has(level)
                                    ? 'bg-gray-800 text-gray-100 border-gray-600'
                                    : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 opacity-50'
                            )}
                        >
                            {level.toUpperCase()}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {filteredLogs.length} entries
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-900 overflow-hidden">
                <div className="overflow-auto max-h-[600px]">
                    <div className="p-4 space-y-1 font-mono text-xs">
                        {filteredLogs.map(log => {
                            const config = levelConfig[log.level];
                            const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                fractionalSecondDigits: 3,
                            });
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 px-2 py-1 rounded hover:bg-gray-800/50 transition-colors"
                                >
                                    <span className="text-gray-600 shrink-0 w-[100px]">{time}</span>
                                    <span className={cn('shrink-0 w-[50px] font-bold uppercase', config.color)}>
                                        {log.level}
                                    </span>
                                    <span className="text-gray-500 shrink-0 w-[120px] truncate">
                                        [{log.source}]
                                    </span>
                                    <span className="text-gray-300">{log.message}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
