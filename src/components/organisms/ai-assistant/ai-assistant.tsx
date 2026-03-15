'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import { Badge } from '@/components/atoms/badge';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { useAuth } from '@/context/auth-context';
import { useAssistantContext } from './use-assistant-context';
import { useAssistantQueries } from './use-assistant-queries';
import { AssistantMessage } from './assistant-message';
import { QuickActions } from './quick-actions';
import { ContextIndicator } from './context-indicator';
import { cn } from '@/lib/utils';

interface AssistantProps {
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: PlatformContext;
  isLoading?: boolean;
  suggestions?: string[];
}

interface PlatformContext {
  level: 'enterprise' | 'workspace' | 'workflow' | 'agent';
  enterpriseId?: string;
  workspaceId?: string;
  workspaceName?: string;
  workflowId?: string;
  workflowName?: string;
  agentId?: string;
  agentName?: string;
  path: string;
  metadata?: Record<string, any>;
}

export const AIAssistant: React.FC<AssistantProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const pathname = usePathname();
  const { user } = useAuth();
  
  const { currentContext, isContextLoading } = useAssistantContext(pathname, user);
  const { sendMessage, isQueryLoading } = useAssistantQueries();
  
  // Always show assistant when user is authenticated
  const isAssistantEnabled = !!user;
  
  console.log('[v0] AIAssistant - user:', user ? 'present' : 'null', 'isAssistantEnabled:', isAssistantEnabled);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Initialize conversation when context changes
  useEffect(() => {
    if (isOpen && currentContext && !isContextLoading) {
      const contextualGreeting = generateContextualGreeting(currentContext);
      if (messages.length === 0 || messages[0].context?.path !== currentContext.path) {
        setMessages(prev => {
          if (prev.length > 0 && prev[0].type === 'assistant' && prev[0].context?.path === currentContext.path) {
            return prev;
          }
          return [{
            id: Date.now().toString(),
            type: 'assistant',
            content: contextualGreeting,
            timestamp: new Date(),
            context: currentContext,
            suggestions: getContextualSuggestions(currentContext),
          }, ...prev];
        });
      }
    }
  }, [isOpen, currentContext, isContextLoading, messages.length]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open assistant
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      context: currentContext || undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await sendMessage(inputValue.trim(), currentContext);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        context: currentContext || undefined,
        suggestions: response.suggestions,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        context: currentContext || undefined,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, currentContext, sendMessage]);
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };
  
  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSendMessage();
  };
  
  const generateContextualGreeting = (context: PlatformContext): string => {
    switch (context.level) {
      case 'enterprise':
        return `Hello! I'm your AI assistant. I can help you manage your enterprise platform, analyze usage across workspaces, and optimize your overall setup. What would you like to know?`;
      case 'workspace':
        return `Hi! I'm here to help you with the "${context.workspaceName || 'current'}" workspace. I can check workflow statuses, analyze execution patterns, troubleshoot issues, and suggest optimizations. How can I assist you?`;
      case 'workflow':
        return `Hello! I see you're working on the "${context.workflowName || 'current'}" workflow. I can help analyze execution performance, debug configurations, suggest optimizations, and answer questions about your agents and tools. What would you like to explore?`;
      case 'agent':
        return `Hi! I'm ready to help with the "${context.agentName || 'current'}" agent. I can review configurations, analyze tool usage, suggest prompt improvements, and help troubleshoot any issues. What can I help you with?`;
      default:
        return `Hello! I'm your AI assistant for the platform. I understand your current context and can help with configurations, troubleshooting, and optimization suggestions. How can I assist you today?`;
    }
  };
  
  const getContextualSuggestions = (context: PlatformContext): string[] => {
    switch (context.level) {
      case 'enterprise':
        return [
          'Show me usage summary across all workspaces',
          'Which workspaces have the most execution errors?',
          'What are my license limits and current usage?',
          'Show me resource consumption trends'
        ];
      case 'workspace':
        return [
          'Which workflows failed in the last 24 hours?',
          'Show me token usage for this workspace',
          'What are the most expensive workflows to run?',
          'Help me optimize workspace configuration'
        ];
      case 'workflow':
        return [
          'Why did my last execution take so long?',
          'Check for configuration issues',
          'Show me execution performance breakdown',
          'Suggest optimization improvements'
        ];
      case 'agent':
        return [
          'Review my agent configuration',
          'Analyze tool usage patterns',
          'Suggest prompt optimizations',
          'Check for common configuration issues'
        ];
      default:
        return [
          'Help me understand my current context',
          'Show me platform overview',
          'What can you help me with?'
        ];
    }
  };
  
  if (!isAssistantEnabled) {
    return null;
  }
  
  return (
    <>
      {/* Floating Widget Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'cursor-pointer',
              className
            )}
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className={cn(
                'h-14 w-14 rounded-full shadow-lg',
                'bg-blue-600 hover:bg-blue-700',
                'dark:bg-blue-700 dark:hover:bg-blue-800',
                'transition-all duration-200',
                'hover:scale-105 hover:shadow-xl',
                'relative overflow-hidden'
              )}
            >
              <MessageSquare className="h-6 w-6 text-white" />
              
              {/* Pulse animation ring */}
              <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-96 bg-white rounded-lg shadow-2xl border',
              'dark:bg-gray-900 dark:border-gray-700',
              'overflow-hidden',
              isMinimized ? 'h-16' : 'h-[600px]',
              'transition-all duration-300'
            )}
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between p-4 border-b',
              'bg-gradient-to-r from-blue-50 to-indigo-50',
              'dark:from-gray-800 dark:to-gray-700',
              'dark:border-gray-600'
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center',
                  'dark:bg-blue-700'
                )}>
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    AI Assistant
                  </h3>
                  <ContextIndicator context={currentContext} isLoading={isContextLoading} />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 h-[440px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <AssistantMessage
                        key={message.id}
                        message={message}
                        onSuggestionClick={handleSuggestionClick}
                      />
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Quick Actions */}
                {messages.length === 0 && currentContext && (
                  <QuickActions
                    context={currentContext}
                    onActionClick={handleQuickAction}
                  />
                )}
                
                {/* Input Area */}
                <div className={cn(
                  'p-4 border-t bg-gray-50',
                  'dark:bg-gray-800 dark:border-gray-600'
                )}>
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything about your platform..."
                      className={cn(
                        'flex-1 min-h-[40px] max-h-[120px] resize-none',
                        'border-gray-300 dark:border-gray-600',
                        'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      )}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={cn(
                        'h-10 w-10 p-0',
                        'bg-blue-600 hover:bg-blue-700',
                        'dark:bg-blue-700 dark:hover:bg-blue-800'
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
