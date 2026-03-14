'use client';

import { FC } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { cn } from '@/lib/utils';

interface AssistantTriggerProps {
    isOpen: boolean;
    onClick: () => void;
    contextLabel: string;
    hasContextChanged: boolean;
    validationErrorCount?: number;
}

/**
 * Floating trigger button for the AI assistant
 */
export const AssistantTrigger: FC<AssistantTriggerProps> = ({
    isOpen,
    onClick,
    contextLabel,
    hasContextChanged,
    validationErrorCount = 0,
}) => {
    // Don't render if the panel is open
    if (isOpen) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        variant="primary"
                        size="icon"
                        className={cn(
                            'h-14 w-14 rounded-full shadow-lg',
                            'bg-gradient-to-r from-blue-600 to-purple-600',
                            'hover:from-blue-700 hover:to-purple-700',
                            'transition-all duration-300 hover:scale-105',
                            'focus:ring-4 focus:ring-blue-300/50'
                        )}
                    >
                        <div className="relative">
                            <Bot className="h-6 w-6 text-white" />
                            
                            {/* Context change indicator */}
                            {hasContextChanged && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                            )}
                            
                            {/* Validation error indicator */}
                            {validationErrorCount > 0 && (
                                <span 
                                    className={cn(
                                        'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                                        'bg-red-500 rounded-full text-white text-xs',
                                        'flex items-center justify-center font-medium',
                                        'px-1'
                                    )}
                                >
                                    {validationErrorCount > 9 ? '9+' : validationErrorCount}
                                </span>
                            )}
                        </div>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center" className="max-w-[200px]">
                    <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                            KAYA Assistant
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                            {contextLabel}
                        </div>
                        {validationErrorCount > 0 && (
                            <div className="text-red-500 text-xs mt-1">
                                {validationErrorCount} issue{validationErrorCount !== 1 ? 's' : ''} found
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
    );
};

export default AssistantTrigger;
