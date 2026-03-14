'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAssistant as useAssistantHook } from '@/hooks/use-assistant';
import type { AssistantContextType } from '@/models/assistant.model';

const AssistantContext = createContext<AssistantContextType | null>(null);

interface AssistantProviderProps {
  children: ReactNode;
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const [isOpen, setIsOpenState] = useState(false);
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    currentContext,
    proactiveInsights,
    dismissInsight,
    hasUnreadInsights,
  } = useAssistantHook();

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
  }, []);

  const value: AssistantContextType = {
    isOpen,
    setIsOpen,
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    currentContext,
    proactiveInsights,
    dismissInsight,
    hasUnreadInsights,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext(): AssistantContextType {
  const context = useContext(AssistantContext);
  
  if (!context) {
    throw new Error('useAssistantContext must be used within an AssistantProvider');
  }
  
  return context;
}
