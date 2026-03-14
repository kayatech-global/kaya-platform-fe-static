'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAssistantContext } from '@/context/assistant-context';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { KEYBOARD_SHORTCUT } from '@/constants/assistant-constants';
import { cn } from '@/lib/utils';
import { AssistantFab } from './assistant-fab';
import { AssistantPanel } from './assistant-panel';

export function FloatingAssistantWidget() {
  const {
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
  } = useAssistantContext();

  const { isMobile } = useBreakpoint();

  // Keyboard shortcut handler (Ctrl/Cmd + J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform?.includes('Mac');
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === KEYBOARD_SHORTCUT) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Focus trap when panel is open (simple implementation)
  useEffect(() => {
    if (isOpen && !isMobile) {
      // Focus the panel when it opens
      const panel = document.querySelector('[role="dialog"]') as HTMLElement;
      if (panel) {
        panel.focus();
      }
    }
  }, [isOpen, isMobile]);

  const handleFabClick = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleMinimize = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    clearMessages();
  }, [setIsOpen, clearMessages]);

  return (
    <>
      {/* FAB — always anchored to bottom-right */}
      {!isOpen && (
        <div
          className={cn(
            'fixed z-[9999]',
            isMobile ? 'right-4 bottom-4' : 'right-6 bottom-6'
          )}
        >
          <AnimatePresence mode="wait">
            <AssistantFab
              key="fab"
              onClick={handleFabClick}
              hasUnreadInsights={hasUnreadInsights}
              isMobile={isMobile}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Chat panel — on desktop anchored bottom-right; on mobile centred above the bottom bar */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-[9999]',
            isMobile
              ? // Centre horizontally, sit just above the bottom edge
                'left-1/2 -translate-x-1/2 bottom-4'
              : 'right-6 bottom-6'
          )}
        >
          <AnimatePresence mode="wait">
            <AssistantPanel
              key="panel"
              messages={messages}
              isLoading={isLoading}
              currentContext={currentContext}
              proactiveInsights={proactiveInsights}
              onSend={sendMessage}
              onDismissInsight={dismissInsight}
              onMinimize={handleMinimize}
              onClose={handleClose}
              isMobile={isMobile}
            />
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
