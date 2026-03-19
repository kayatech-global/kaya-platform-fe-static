'use client';

import React from 'react';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { RotateCw } from 'lucide-react';
import { mockVersions } from '../../mock-data';

const versionStatusVariant: Record<string, 'success' | 'secondary' | 'warning'> = {
    active: 'success',
    previous: 'secondary',
    'rolled-back': 'warning',
};

export const VersionsTab = () => {
    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Version History
            </p>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Version</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Deployed</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Status</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Changes</th>
                            <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">By</th>
                            <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockVersions.map(version => (
                            <tr
                                key={version.version}
                                className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 bg-white dark:bg-gray-800"
                            >
                                <td className="px-4 py-3">
                                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                                        v{version.version}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(version.deployedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={versionStatusVariant[version.status] ?? 'secondary'} size="sm">
                                        {version.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[300px] truncate">
                                        {version.configDiffSummary}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                    {version.deployedBy}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {version.status !== 'active' && (
                                        <Button variant="ghost" size="sm" leadingIcon={<RotateCw className="h-3 w-3" />}>
                                            Rollback
                                        </Button>
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
