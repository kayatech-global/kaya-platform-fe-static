'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AssistantContext } from '@/models/ai-assistant.model';
import { contextDetectionService } from '@/services/ai-assistant';

interface WorkflowContextData {
    id: string;
    name: string;
    version: number;
    isDraft: boolean;
    visualGraphData?: unknown;
}

interface UseAssistantContextOptions {
    workflowData?: WorkflowContextData;
    workspaceData?: {
        id: string;
        name: string;
        description: string;
    };
}

interface UseAssistantContextReturn {
    context: AssistantContext | null;
    contextLabel: string;
    contextDescription: string;
    isLoading: boolean;
    refreshContext: () => void;
    hasContextChanged: boolean;
}

/**
 * Hook to detect and manage the current platform context for the AI assistant
 */
export function useAssistantContext(options?: UseAssistantContextOptions): UseAssistantContextReturn {
    const pathname = usePathname();
    const params = useParams();
    const { user } = useAuth();
    
    const [context, setContext] = useState<AssistantContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasContextChanged, setHasContextChanged] = useState(false);
    
    const previousContextRef = useRef<AssistantContext | null>(null);

    const detectContext = useCallback(() => {
        setIsLoading(true);
        
        try {
            const detectedContext = contextDetectionService.detectContext(
                pathname,
                user,
                {
                    workflowData: options?.workflowData,
                    workspaceData: options?.workspaceData,
                }
            );

            // Check if context has changed
            const changed = contextDetectionService.hasContextChanged(
                detectedContext,
                previousContextRef.current
            );
            
            setHasContextChanged(changed);
            previousContextRef.current = detectedContext;
            setContext(detectedContext);
        } catch (error) {
            console.error('[AI Assistant] Context detection error:', error);
            // Set a minimal context on error
            setContext({
                level: 'enterprise',
                currentPage: pathname,
                userPermissions: [],
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsLoading(false);
        }
    }, [pathname, user, options?.workflowData, options?.workspaceData]);

    // Detect context on mount and when dependencies change
    useEffect(() => {
        detectContext();
    }, [detectContext]);

    // Also detect when params change (workspace or workflow ID)
    useEffect(() => {
        if (params?.wid || params?.workflow_id) {
            detectContext();
        }
    }, [params?.wid, params?.workflow_id, detectContext]);

    // Reset context change flag after a short delay
    useEffect(() => {
        if (hasContextChanged) {
            const timer = setTimeout(() => {
                setHasContextChanged(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasContextChanged]);

    const contextLabel = context 
        ? contextDetectionService.getContextLabel(context)
        : 'Loading...';

    const contextDescription = context
        ? contextDetectionService.getContextDescription(context)
        : 'Detecting context...';

    return {
        context,
        contextLabel,
        contextDescription,
        isLoading,
        refreshContext: detectContext,
        hasContextChanged,
    };
}

export default useAssistantContext;
