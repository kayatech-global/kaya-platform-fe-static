'use client';

import React from 'react';
import { RiRobot2Line, RiUserLine, RiTimeLine, RiLightbulbLine } from '@remixicon/react';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/utils';
import { PlatformContext } from './use-assistant-context';

export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    context?: PlatformContext;
    isLoading?: boolean;
    suggestions?: string[];
}

interface AssistantMessageProps {
    message: ChatMessage;
    onSuggestionClick: (suggestion: string) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, onSuggestionClick }) => {
    const isUser = message.type === 'user';

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div
                className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                    isUser ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
                )}
            >
                {isUser ? (
                    <RiUserLine className="h-4 w-4 text-white" />
                ) : (
                    <RiRobot2Line className="h-4 w-4 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={cn('flex-1 space-y-2', isUser ? 'items-end' : 'items-start')}>
                {/* Main Message */}
                <div
                    className={cn(
                        'max-w-[280px] px-4 py-3 rounded-lg',
                        isUser
                            ? 'bg-blue-600 text-white ml-auto dark:bg-blue-700'
                            : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                    )}
                >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </div>

                {/* Timestamp */}
                <div
                    className={cn(
                        'flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400',
                        isUser ? 'justify-end' : 'justify-start'
                    )}
                >
                    <RiTimeLine className="h-3 w-3" />
                    <span>{formatTime(message.timestamp)}</span>
                </div>

                {/* Suggestions (only for assistant messages) */}
                {!isUser && message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <RiLightbulbLine className="h-3 w-3" />
                            <span>Suggested follow-ups:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                                <Button
                                    key={index}
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className={cn(
                                        'text-xs h-7 px-3 rounded-full',
                                        'border-gray-300 hover:border-blue-500',
                                        'dark:border-gray-600 dark:hover:border-blue-400',
                                        'transition-colors duration-200'
                                    )}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
