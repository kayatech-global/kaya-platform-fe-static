'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context';

export interface PlatformContext {
    level: 'enterprise' | 'workspace' | 'workflow' | 'agent';
    enterpriseId?: string;
    workspaceId?: string;
    workspaceName?: string;
    workflowId?: string;
    workflowName?: string;
    agentId?: string;
    agentName?: string;
    path: string;
    metadata?: Record<string, unknown>;
}

interface WorkspaceContext {
    id: string;
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
}

export function useAssistantContext(pathname: string, workspaceContext?: WorkspaceContext) {
    const [currentContext, setCurrentContext] = useState<PlatformContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const parsePathContext = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean);

        if (segments.length === 0 || segments[0] === '') {
            return {
                level: 'enterprise' as const,
                path: pathname,
                metadata: {
                    totalWorkspaces: user?.user?.workspaces?.length || 0,
                    userRoles: user?.user?.workspaces?.flatMap((w) => w.roles) || [],
                },
            };
        }

        if (segments[0] === 'workspaces') {
            return {
                level: 'enterprise' as const,
                path: pathname,
                metadata: {
                    totalWorkspaces: user?.user?.workspaces?.length || 0,
                    userRoles: user?.user?.workspaces?.flatMap((w) => w.roles) || [],
                },
            };
        }

        if (segments[0] === 'workspace' && segments[1]) {
            const workspaceId = segments[1];
            const workspace = user?.user?.workspaces?.find((w) => w.id.toString() === workspaceId || w.uuid === workspaceId);

            // Check if we're in a workflow context
            if (segments.includes('workflows') && segments[segments.indexOf('workflows') + 2]) {
                const workflowId = segments[segments.indexOf('workflows') + 2];
                return {
                    level: 'workflow' as const,
                    workspaceId,
                    workspaceName: workspace?.name || workspaceContext?.name || 'Unknown Workspace',
                    workflowId,
                    path: pathname,
                    metadata: {
                        workspaceRoles: workspace?.roles || [],
                        section: segments[2] || 'overview',
                    },
                };
            }

            // Check if we're in an agent context
            if (segments.includes('agents') && segments[segments.indexOf('agents') + 1]) {
                const agentId = segments[segments.indexOf('agents') + 1];
                return {
                    level: 'agent' as const,
                    workspaceId,
                    workspaceName: workspace?.name || workspaceContext?.name || 'Unknown Workspace',
                    agentId,
                    path: pathname,
                    metadata: {
                        workspaceRoles: workspace?.roles || [],
                        section: 'agent-configuration',
                    },
                };
            }

            return {
                level: 'workspace' as const,
                workspaceId,
                workspaceName: workspace?.name || workspaceContext?.name || 'Unknown Workspace',
                path: pathname,
                metadata: {
                    workspaceRoles: workspace?.roles || [],
                    section: segments[2] || 'overview',
                    workspaceDescription: workspace?.description || workspaceContext?.description,
                },
            };
        }

        if (segments[0] === 'editor' && segments[1] && segments[2]) {
            const workspaceId = segments[1];
            const workflowId = segments[2];
            const workspace = user?.user?.workspaces?.find((w) => w.id.toString() === workspaceId || w.uuid === workspaceId);

            return {
                level: 'workflow' as const,
                workspaceId,
                workspaceName: workspace?.name || 'Unknown Workspace',
                workflowId,
                path: pathname,
                metadata: {
                    workspaceRoles: workspace?.roles || [],
                    section: 'workflow-editor',
                    isEditor: true,
                },
            };
        }

        return {
            level: 'enterprise' as const,
            path: pathname,
            metadata: {
                totalWorkspaces: user?.user?.workspaces?.length || 0,
                userRoles: user?.user?.workspaces?.flatMap((w) => w.roles) || [],
                section: segments[0],
            },
        };
    }, [pathname, user, workspaceContext]);

    useEffect(() => {
        setIsLoading(true);

        const context: PlatformContext = {
            ...parsePathContext,
            enterpriseId: user?.id?.toString(),
        };

        setCurrentContext(context);
        setIsLoading(false);
    }, [parsePathContext, user?.id]);

    return {
        currentContext,
        isContextLoading: isLoading,
    };
}
