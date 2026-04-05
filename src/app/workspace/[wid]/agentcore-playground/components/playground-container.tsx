'use client';

import React, { useState } from 'react';
import { DeploymentPanel } from './deployment-panel';
import { CodeSnippetPanel } from './code-snippet-panel';
import { ChatPanel } from './chat-panel';
import { mockDeployment, mockChatMessages, codeSnippets } from '../mock-data';
import { ChatMessage, CodeLanguage } from '../types';

export const PlaygroundContainer = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
    const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>('python');
    const [streamingEnabled, setStreamingEnabled] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    const handleSendMessage = async (content: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            id: String(Date.now()),
            role: 'user',
            content,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate agent response
        setIsValidating(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const assistantMessage: ChatMessage = {
            id: String(Date.now() + 1),
            role: 'assistant',
            content: 'Thank you for your message. I\'m processing your request through the AgentCore runtime. This is a simulated response from the deployed agent.',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            isAgentCore: true,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsValidating(false);
    };

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6 p-6">
            {/* Left Panel - Deployment Info */}
            <div className="w-[320px] flex-shrink-0">
                <DeploymentPanel
                    deployment={mockDeployment}
                    streamingEnabled={streamingEnabled}
                    onStreamingToggle={setStreamingEnabled}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Code Snippet Panel */}
                <div className="flex-shrink-0">
                    <CodeSnippetPanel
                        snippets={codeSnippets}
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={setSelectedLanguage}
                    />
                </div>

                {/* Chat Panel */}
                <div className="flex-1 min-h-0">
                    <ChatPanel
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isValidating={isValidating}
                        deploymentInfo={mockDeployment}
                    />
                </div>
            </div>
        </div>
    );
};
