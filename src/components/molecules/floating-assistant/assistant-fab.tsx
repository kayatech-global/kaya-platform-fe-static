'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { cn } from '@/lib/utils';
import { KEYBOARD_SHORTCUT } from '@/constants/assistant-constants';

interface AssistantFabProps {
  onClick: () => void;
  hasUnreadInsights: boolean;
  isMobile: boolean;
}

export function AssistantFab({ onClick, hasUnreadInsights, isMobile }: AssistantFabProps) {
  const size = isMobile ? 48 : 56;
  const shortcutLabel = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') 
    ? `Cmd+${KEYBOARD_SHORTCUT.toUpperCase()}` 
    : `Ctrl+${KEYBOARD_SHORTCUT.toUpperCase()}`;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 1] }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
              'relative flex items-center justify-center rounded-full',
              'bg-gradient-to-r from-blue-500 to-blue-700',
              'text-white shadow-lg hover:shadow-xl',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
              'transition-shadow duration-200'
            )}
            style={{ width: size, height: size }}
            aria-label="Open KAYA Assistant"
          >
            <Sparkles className={cn(isMobile ? 'w-5 h-5' : 'w-6 h-6')} />
            
            {/* Notification badge */}
            {hasUnreadInsights && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left" className="flex items-center gap-2">
          <span>KAYA Assistant</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            {shortcutLabel}
          </kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
