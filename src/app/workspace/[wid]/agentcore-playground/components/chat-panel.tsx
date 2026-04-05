'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Badge, Input } from '@/components/atoms';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { cn } from '@/lib/utils';
import {
    Send,
    Bot,
    User,
    Cloud,
    Loader2,
    AlertCircle,
    Terminal,
} from 'lucide-react';
import { ChatMessage, DeploymentInfo } from '../types';

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isValidating: boolean;
    deploymentInfo: DeploymentInfo;
}

export const ChatPanel = ({
    messages,
    onSendMessage,
    isValidating,
    deploymentInfo,
}: ChatPanelProps) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isValidating) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-x-3">
                    <Terminal size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        AgentCore Validation
                    </span>
                    <Badge variant="success" className="flex items-center gap-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live AgentCore cluster
                    </Badge>
                </div>
                <div className="flex items-center gap-x-2 text-xs text-gray-500">
                    <span>Deployment ID:</span>
                    <span className="font-mono">{deploymentInfo.deploymentId}</span>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-5">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}

                    {isValidating && (
                        <div className="flex items-start gap-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center flex-shrink-0">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex items-center gap-x-2 text-sm text-gray-500">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Processing via AgentCore...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            >
                <div className="flex items-center gap-x-3">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Send a test message to your agent..."
                        className="flex-1"
                        disabled={isValidating}
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isValidating}
                        className="h-9"
                        leadingIcon={<Send size={14} />}
                    >
                        Send
                    </Button>
                </div>
            </form>
        </div>
    );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center">
                <div className="flex items-center gap-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-500 dark:text-gray-400">
                    <AlertCircle size={12} />
                    <span>{message.content}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex items-start gap-x-3', isUser && 'flex-row-reverse')}>
            {/* Avatar */}
            <div
                className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isUser
                        ? 'bg-gray-200 dark:bg-gray-600'
                        : 'bg-gradient-to-br from-blue-500 to-sky-400'
                )}
            >
                {isUser ? (
                    <User size={16} className="text-gray-600 dark:text-gray-300" />
                ) : (
                    <Bot size={16} className="text-white" />
                )}
            </div>

            {/* Message Content */}
            <div
                className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-3',
                    isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-700 rounded-tl-sm'
                )}
            >
                {/* AgentCore Badge */}
                {message.isAgentCore && !isUser && (
                    <div className="flex items-center gap-x-1 mb-2">
                        <Badge
                            variant="default"
                            className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-blue-500 to-sky-400"
                        >
                            <Cloud size={10} className="mr-1" />
                            AgentCore
                        </Badge>
                    </div>
                )}

                <p
                    className={cn(
                        'text-sm whitespace-pre-wrap',
                        isUser
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-200'
                    )}
                >
                    {message.content}
                </p>

                {/* Timestamp */}
                <div
                    className={cn(
                        'text-[10px] mt-1',
                        isUser ? 'text-blue-200' : 'text-gray-400'
                    )}
                >
                    {message.timestamp}
                </div>
            </div>
        </div>
    );
};
