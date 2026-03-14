'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Separator } from '@/components/atoms/separator';
import { Globe, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IUserProfile } from '@/models/profile.model';

interface RolesMembershipsSectionProps {
    profile: IUserProfile;
}

export const RolesMembershipsSection = ({ profile }: RolesMembershipsSectionProps) => {
    const globalRoles = profile.roles.filter((r) => r.scope === 'global');
    const workspaceRoles = profile.roles.filter((r) => r.scope === 'workspace');

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">
                    Roles & Workspace Memberships
                </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-5">
                {/* Global roles */}
                {globalRoles.length > 0 && (
                    <div className="flex flex-col gap-y-3">
                        <div className="flex items-center gap-x-2">
                            <Globe size={14} className="text-gray-500 dark:text-gray-400" />
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Global Roles
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {globalRoles.map((r) => (
                                <Badge key={`global-${r.role.id}`} variant="info" size="md">
                                    {r.role.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {globalRoles.length > 0 && workspaceRoles.length > 0 && <Separator />}

                {/* Workspace-scoped roles */}
                {workspaceRoles.length > 0 && (
                    <div className="flex flex-col gap-y-3">
                        <div className="flex items-center gap-x-2">
                            <Layers size={14} className="text-gray-500 dark:text-gray-400" />
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Workspace Memberships
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-2">
                            {workspaceRoles.map((r) => (
                                <div
                                    key={`ws-${r.role.id}-${r.workspace?.id}`}
                                    className={cn(
                                        'flex items-center justify-between px-3 py-2.5 rounded-lg border',
                                        'bg-white border-gray-200',
                                        'dark:bg-gray-700 dark:border-gray-600'
                                    )}
                                >
                                    <div className="flex flex-col gap-y-0.5">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {r.workspace?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {r.workspace?.description}
                                        </p>
                                    </div>
                                    <Badge variant="default" size="sm">
                                        {r.role.name}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profile.roles.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No roles or workspace memberships assigned.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
