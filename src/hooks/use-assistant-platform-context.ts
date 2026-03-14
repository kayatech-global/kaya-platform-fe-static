'use client';

import { useMemo } from 'react';
import { usePathname, useParams } from 'next/navigation';
import type { PlatformContext, ContextLevel } from '@/models/assistant.model';

interface WorkspaceInfo {
  id: string;
  name: string;
}

/**
 * Detects the current platform context based on the URL path and params.
 * Returns information about where the user is in the navigation hierarchy.
 */
export function useAssistantPlatformContext(): PlatformContext {
  const pathname = usePathname();
  const params = useParams();

  const context = useMemo<PlatformContext>(() => {
    // Extract IDs from params
    const workspaceId = params?.wid as string | undefined;
    const workflowId = params?.workflow_id as string | undefined;

    // Determine context level based on route
    let level: ContextLevel = 'enterprise';
    let currentPage = 'overview';

    // Parse pathname to determine level and page
    const pathSegments = pathname?.split('/').filter(Boolean) || [];

    if (pathname?.startsWith('/editor/') && workspaceId && workflowId) {
      // Editor route: /editor/[wid]/[workflow_id]
      level = 'workflow';
      currentPage = 'editor';
    } else if (pathname?.startsWith('/workspace/') && workspaceId) {
      // Workspace routes: /workspace/[wid]/...
      level = 'workspace';

      // Determine current page from path segments
      const pageSegment = pathSegments[2]; // After 'workspace' and wid
      if (pageSegment) {
        currentPage = pageSegment;
      } else {
        currentPage = 'overview';
      }

      // Check for workflow-specific pages
      if (pathSegments.includes('workflow-authoring') || pathSegments.includes('workflows')) {
        // Still workspace level unless in editor
        currentPage = pathSegments[pathSegments.length - 1] || 'workflows';
      }
    } else if (pathname === '/workspaces' || pathname?.startsWith('/workspaces')) {
      // Enterprise level: workspace list
      level = 'enterprise';
      currentPage = 'workspaces';
    }

    // Try to get workspace name from localStorage (set by AuthProvider)
    let workspaceName: string | undefined;
    if (typeof window !== 'undefined' && workspaceId) {
      try {
        const storedInfo = localStorage.getItem('workspaceInfo');
        if (storedInfo) {
          const parsed = JSON.parse(storedInfo) as WorkspaceInfo;
          if (parsed.id === workspaceId) {
            workspaceName = parsed.name;
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    return {
      level,
      workspaceId,
      workspaceName,
      workflowId,
      workflowName: undefined, // Would need API call to get workflow name
      selectedNodeId: undefined, // Not available in layout - DnDContext is in page
      selectedNodeType: undefined,
      currentPage,
    };
  }, [pathname, params]);

  return context;
}
