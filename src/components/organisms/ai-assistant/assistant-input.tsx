'use client';

import { FC, useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/utils';

interface AssistantInputProps {
    onSendMessage: (message: string) => Promise<void>;
    disabled?: boolean;
    isStreaming?: boolean;
    suggestedQuestions?: string[];
}

/**
 * Input component for the AI assistant
 */
export const AssistantInput: FC<AssistantInputProps> = ({
    onSendMessage,
    disabled = false,
    isStreaming = false,
    suggestedQuestions = [],
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = useCallback(async () => {
        if (!message.trim() || disabled || isStreaming) {
            return;
        }

        const currentMessage = message;
        setMessage('');
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        await onSendMessage(currentMessage);
    }, [message, disabled, isStreaming, onSendMessage]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const handleInput = useCallback(() => {
        if (textareaRef.current) {
            // Reset height to auto to get the correct scrollHeight
            textareaRef.current.style.height = 'auto';
            // Set height to scrollHeight, but max at 120px (about 4 lines)
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, []);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        setMessage(suggestion);
        textareaRef.current?.focus();
    }, []);

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Suggested questions */}
            {suggestedQuestions.length > 0 && message.length === 0 && (
                <div className="px-4 pt-3 pb-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Suggested questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.slice(0, 3).map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(question)}
                                disabled={disabled || isStreaming}
                                className={cn(
                                    'text-xs px-3 py-1.5 rounded-full',
                                    'bg-gray-100 dark:bg-gray-800',
                                    'text-gray-700 dark:text-gray-300',
                                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                                    'transition-colors duration-200',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input area */}
            <div className="p-4">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            placeholder="Type your message..."
                            disabled={disabled || isStreaming}
                            rows={1}
                            className={cn(
                                'w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600',
                                'bg-gray-50 dark:bg-gray-800',
                                'px-4 py-3 pr-12',
                                'text-sm text-gray-900 dark:text-gray-100',
                                'placeholder:text-gray-500 dark:placeholder:text-gray-400',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'transition-all duration-200'
                            )}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    
                    <Button
                        onClick={handleSubmit}
                        disabled={!message.trim() || disabled || isStreaming}
                        variant="primary"
                        size="icon"
                        className={cn(
                            'h-11 w-11 rounded-xl shrink-0',
                            'bg-gradient-to-r from-blue-600 to-purple-600',
                            'hover:from-blue-700 hover:to-purple-700',
                            'disabled:from-gray-400 disabled:to-gray-400',
                            'disabled:opacity-50'
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                
                {/* Helper text */}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    );
};

export default AssistantInput;
