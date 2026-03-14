import { AssistantContext, AssistantContextLevel } from '@/models/ai-assistant.model';
import { IKeycloakUser } from '@/models';

/**
 * Service to detect the current context based on URL pathname and user information.
 * This helps the AI assistant understand where the user is in the platform hierarchy.
 */
class ContextDetectionService {
    /**
     * Detects the current platform context from the URL pathname
     * @param pathname - Current URL pathname
     * @param user - Current authenticated user
     * @param additionalContext - Optional additional context like selected workflow data
     */
    detectContext(
        pathname: string,
        user: IKeycloakUser | null,
        additionalContext?: {
            workflowData?: {
                id: string;
                name: string;
                version: number;
                isDraft: boolean;
                visualGraphData?: unknown;
            };
            workspaceData?: {
                id: string;
                name: string;
                description: string;
            };
        }
    ): AssistantContext {
        const pathSegments = pathname.split('/').filter(Boolean);
        const level = this.determineLevel(pathSegments);
        const workspaceId = this.extractWorkspaceId(pathSegments);
        const workflowId = this.extractWorkflowId(pathSegments);

        const context: AssistantContext = {
            level,
            currentPage: pathname,
            userPermissions: this.extractPermissions(user),
            timestamp: new Date().toISOString(),
        };

        // Add enterprise context
        if (user?.user?.workspaces) {
            context.enterprise = {
                id: user.id || 'default',
                name: 'Kaya Platform',
                workspaceCount: user.user.workspaces.length,
                totalUsers: 1, // Current user
            };
        }

        // Add workspace context if we have a workspace ID
        if (workspaceId) {
            const workspace = user?.user?.workspaces?.find(
                (w) => w.id.toString() === workspaceId || w.uuid === workspaceId
            );
            
            if (workspace) {
                context.workspace = {
                    id: workspaceId,
                    name: workspace.name,
                    description: workspace.description || '',
                    metadata: [],
                    permissions: workspace.roles || [],
                };
            } else if (additionalContext?.workspaceData) {
                context.workspace = {
                    id: additionalContext.workspaceData.id,
                    name: additionalContext.workspaceData.name,
                    description: additionalContext.workspaceData.description,
                    metadata: [],
                    permissions: [],
                };
            }
        }

        // Add workflow context if we're in the editor
        if (workflowId && additionalContext?.workflowData) {
            context.workflow = {
                id: additionalContext.workflowData.id,
                name: additionalContext.workflowData.name,
                version: additionalContext.workflowData.version,
                isDraft: additionalContext.workflowData.isDraft,
                visualGraphData: additionalContext.workflowData.visualGraphData as AssistantContext['workflow']['visualGraphData'],
            };
        } else if (workflowId) {
            context.workflow = {
                id: workflowId,
                name: 'Unknown Workflow',
                version: 1,
                isDraft: false,
            };
        }

        return context;
    }

    /**
     * Determines the context level from URL path segments
     */
    private determineLevel(pathSegments: string[]): AssistantContextLevel {
        // Check for editor (workflow level)
        if (pathSegments.includes('editor')) {
            return 'workflow';
        }

        // Check for data lineage (execution level)
        if (pathSegments.includes('data-lineage')) {
            return 'execution';
        }

        // Check for test studio execution reports
        if (pathSegments.includes('test-studio') && pathSegments.includes('test-suite-report-generation')) {
            return 'execution';
        }

        // Check for workspace level
        if (pathSegments[0] === 'workspace' && pathSegments.length > 1) {
            return 'workspace';
        }

        // Default to enterprise level
        return 'enterprise';
    }

    /**
     * Extracts workspace ID from URL path segments
     * Handles both /workspace/[wid]/* and /editor/[wid]/[workflow_id] patterns
     */
    private extractWorkspaceId(pathSegments: string[]): string | null {
        // Pattern: /workspace/[wid]/*
        if (pathSegments[0] === 'workspace' && pathSegments.length > 1) {
            return pathSegments[1];
        }

        // Pattern: /editor/[wid]/[workflow_id]
        if (pathSegments[0] === 'editor' && pathSegments.length > 1) {
            return pathSegments[1];
        }

        return null;
    }

    /**
     * Extracts workflow ID from URL path segments
     * Pattern: /editor/[wid]/[workflow_id]
     */
    private extractWorkflowId(pathSegments: string[]): string | null {
        if (pathSegments[0] === 'editor' && pathSegments.length > 2) {
            return pathSegments[2];
        }

        return null;
    }

    /**
     * Extracts user permissions from the Keycloak user object
     */
    private extractPermissions(user: IKeycloakUser | null): string[] {
        if (!user?.user?.groups) {
            return [];
        }

        const permissions: string[] = [];

        for (const group of user.user.groups) {
            if (group.group?.role?.name) {
                permissions.push(group.group.role.name);
            }
        }

        return permissions;
    }

    /**
     * Returns a human-readable description of the current context
     */
    getContextDescription(context: AssistantContext): string {
        switch (context.level) {
            case 'enterprise':
                return 'You are viewing the enterprise overview';
            case 'workspace':
                return context.workspace
                    ? `You are in workspace "${context.workspace.name}"`
                    : 'You are in a workspace';
            case 'workflow':
                if (context.workflow) {
                    const draftStatus = context.workflow.isDraft ? ' (Draft)' : '';
                    return `You are editing workflow "${context.workflow.name}"${draftStatus}`;
                }
                return 'You are in the workflow editor';
            case 'execution':
                return 'You are viewing execution data and lineage';
            default:
                return 'Welcome to Kaya Platform';
        }
    }

    /**
     * Returns a short label for the context level
     */
    getContextLabel(context: AssistantContext): string {
        switch (context.level) {
            case 'enterprise':
                return 'Enterprise';
            case 'workspace':
                return context.workspace?.name || 'Workspace';
            case 'workflow':
                return context.workflow?.name || 'Workflow';
            case 'execution':
                return 'Execution Analysis';
            default:
                return 'Platform';
        }
    }

    /**
     * Checks if the current context has changed from the previous context
     */
    hasContextChanged(current: AssistantContext | null, previous: AssistantContext | null): boolean {
        if (!current || !previous) {
            return current !== previous;
        }

        // Check level change
        if (current.level !== previous.level) {
            return true;
        }

        // Check workspace change
        if (current.workspace?.id !== previous.workspace?.id) {
            return true;
        }

        // Check workflow change
        if (current.workflow?.id !== previous.workflow?.id) {
            return true;
        }

        // Check page change
        if (current.currentPage !== previous.currentPage) {
            return true;
        }

        return false;
    }
}

export const contextDetectionService = new ContextDetectionService();
export default ContextDetectionService;
