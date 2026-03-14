'use client';

import { FC, useEffect, useRef } from 'react';
import { User, Bot, Info } from 'lucide-react';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { MarkdownText } from '@/components/molecules/mardown-text/markdown-text';
import { AssistantChatMessage } from '@/models/ai-assistant.model';
import { cn } from '@/lib/utils';

interface AssistantMessagesProps {
    messages: AssistantChatMessage[];
    isLoading: boolean;
}

/**
 * Message list component for the AI assistant
 */
export const AssistantMessages: FC<AssistantMessagesProps> = ({
    messages,
    isLoading,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (messages.length === 0) {
        return (
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
                        <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No messages yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Ask me anything about the platform
                    </p>
                </div>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} formatTime={formatTime} />
                ))}

                {/* Loading indicator */}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0">
                            <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={endRef} />
            </div>
        </ScrollArea>
    );
};

interface MessageBubbleProps {
    message: AssistantChatMessage;
    formatTime: (date: Date) => string;
}

const MessageBubble: FC<MessageBubbleProps> = ({ message, formatTime }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    // System messages (context updates)
    if (isSystem) {
        return (
            <div className="flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400">
                    <Info className="h-3 w-3" />
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            'flex items-start gap-3',
            isUser && 'flex-row-reverse'
        )}>
            {/* Avatar */}
            <div className={cn(
                'p-2 rounded-full shrink-0',
                isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gray-100 dark:bg-gray-800'
            )}>
                {isUser ? (
                    <User className="h-4 w-4 text-white" />
                ) : (
                    <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
            </div>

            {/* Message content */}
            <div className={cn(
                'flex flex-col max-w-[85%]',
                isUser && 'items-end'
            )}>
                <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm',
                    isUser 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                )}>
                    {isUser ? (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5">
                            <MarkdownText>{message.content}</MarkdownText>
                            
                            {/* Streaming indicator */}
                            {message.isStreaming && (
                                <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5" />
                            )}
                        </div>
                    )}
                </div>
                
                {/* Timestamp */}
                <span className={cn(
                    'text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1',
                    isUser && 'text-right'
                )}>
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default AssistantMessages;
