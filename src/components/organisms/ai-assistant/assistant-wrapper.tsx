'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/auth-context';
import type { AssistantSettings } from '@/models/ai-assistant.model';

// Dynamically import the AI Assistant to prevent SSR issues
const AiAssistant = dynamic(
  () => import('./ai-assistant').then((mod) => mod.AiAssistant),
  {
    ssr: false,
    loading: () => null, // No loading state - invisible until loaded
  }
);

interface AssistantWrapperProps {
  settings?: Partial<AssistantSettings>;
}

/**
 * AssistantWrapper is a client-side component that conditionally renders
 * the AI Assistant based on authentication status and enterprise settings.
 * 
 * This wrapper should be placed in layouts where the assistant should be available.
 */
export const AssistantWrapper: React.FC<AssistantWrapperProps> = ({ settings }) => {
  const { isAuthenticated, userContext } = useAuth();

  // Only render for authenticated users
  if (!isAuthenticated || !userContext) {
    return null;
  }

  // Check enterprise-level feature flag (if available)
  // This could be extended to read from platform configuration
  const isEnabled = settings?.isEnabled ?? true;

  if (!isEnabled) {
    return null;
  }

  return <AiAssistant settings={settings} />;
};

export default AssistantWrapper;
